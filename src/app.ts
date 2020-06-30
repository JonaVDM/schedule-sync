import Scoober from './api/scoober';
import Google from './api/google';

import dotenv from 'dotenv';

import Shift from './types/shift';

dotenv.config();

const google = new Google();
const scoober = new Scoober();

setInterval(main, 15 * 60 * 1000);
main();

interface Log {
    added?: string[],
    removed?: string[],
    updated?: string[],
    error?: string
}

const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

function formatShift(shift: Shift): string {
    let description = '';
    Object.entries(shift).forEach(
        ([key, value]) => description += `${key}=${value}\n`
    );
    return description;
}

function getShiftID(description: string): string {
    return description
        .split('\n')
        .find(prop => /^_id=.+/.test(prop))
        .split('_id=')[1];
}

function formatDate(start: Date, end: Date): string {
    return `${start.getDate()} ${months[start.getMonth()]} ${start.getFullYear()} ${start.getHours()}:${start.getMinutes()} - ${end.getHours()}:${end.getMinutes()}`;
}

async function main() {
    const { email, password } = process.env;
    const log: Log = {};

    try {
        await google.login();
        await scoober.login(email, password);

        const dates = getDates();

        await google.getCalendarId('Thuisbezorgd');

        // Copy the array for just incase this will go wrong (somehow)
        const events = [...await google.getEvents(dates)];
        const shifts = [...await scoober.shifts(...dates)];

        // Shift removed
        for (const event of events) {
            if (!event.description) continue;
            const id = getShiftID(event.description);

            const shift = shifts.find(shift => shift._id == id);

            if (!shift) {
                if (!log.removed) log.removed = [];
                log.removed.push(formatDate(new Date(event.start.dateTime), new Date(event.end.dateTime)));
                await google.deleteEvent(event.id);
            }
        }

        // Shift added or updated
        for (const shift of shifts) {
            const event = events.find(event => getShiftID(event.description) == shift._id);
            if (!event) {
                if (!log.added) log.added = [];
                log.added.push(formatDate(new Date(shift.fromWithTimeZone), new Date(shift.toWithTimeZone)));
                await google.addEvent(shift.fromWithTimeZone, shift.toWithTimeZone, 'Work Thuisbezorgd', formatShift(shift));
            } else {
                // get the shift and event times
                const start = new Date(event.start.dateTime);
                const from = new Date(shift.fromWithTimeZone);
                const end = new Date(event.end.dateTime);
                const to = new Date(shift.toWithTimeZone);

                // check if the shift and event match up, otherwise update
                if (start.getTime() != from.getTime() || end.getTime() != to.getTime()) {
                    if (!log.updated) log.updated = [];
                    log.updated.push(`${formatDate(start, end)} - to - ${formatDate(from, to)}`);
                    await google.editEvent(event.id, shift.fromWithTimeZone, shift.toWithTimeZone, 'Work Thuisbezorgd', formatShift(shift));
                }
            }
        }
    } catch (e) {
        log.error = e;
    } finally {
        if (log.error || log.added || log.removed || log.updated) {
            let content = "";
            const now = new Date();
            content += `Generated on ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} ${now.getHours()}:${now.getMinutes()} \n\n\n`

            if (log.error) {
                content += "Error\n";
                content += log.error;
                content += "\n\n";
            }

            if (log.added) {
                content += "Added\n";
                content += log.added.join('\n');
                content += "\n\n";
            }

            if (log.updated) {
                content += "Updated\n";
                content += log.updated.join('\n');
                content += "\n\n";
            }

            if (log.removed) {
                content += "Removed\n";
                content += log.removed.join('\n');
            }

            google.sendEmail(`Jona <${process.env.email}>`, process.env.email, 'Work Schedule Link Update', content);
        }
    }
}

function getDates(): [Date, Date] {
    const day = 1000 * 60 * 60 * 24;
    const today = new Date();

    let dayOfWeek = today.getDay();
    if (dayOfWeek == 0) dayOfWeek = 7;

    const toMonday = (dayOfWeek - 1) * day;
    const toSunday = ((7 - dayOfWeek) + 7) * day;

    const monday = new Date(today.getTime() - toMonday);
    monday.setMinutes(0);
    monday.setHours(6);
    const sunday = new Date(today.getTime() + toSunday);
    sunday.setMinutes(59);
    sunday.setHours(23);

    return [monday, sunday];
}

