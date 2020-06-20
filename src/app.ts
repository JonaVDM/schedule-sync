import Scoober from './api/scoober';
import Google from './api/google';

import dotenv from 'dotenv';

import { exit } from 'process';

import Shift from './types/shift';


const google = new Google();
const scoober = new Scoober();

setInterval(main, 15 * 60 * 1000);
main();

async function main() {
    dotenv.config();

    const { email, password } = process.env;

    try {
        await google.login();

        await scoober.login(email, password);

        const dates = getDates();

        await google.getCalendarId('Thuisbezorgd');
        const events = [...await google.getEvents(dates)];
        const shifts = [...await scoober.shifts(...dates)];

        // Shift removed
        for (const event of events) {
            if (!event.description) continue;
            const description: Shift = JSON.parse(event.description);
            const id = description._id;

            const shift = shifts.find(shift => shift._id == id);

            if (!shift) {
                google.deleteEvent(event.id);
            }
        }

        // Shift added or updated
        for (const shift of shifts) {
            const event = events.find(event => (<Shift>JSON.parse(event.description))._id == shift._id);
            if (!event) {
                google.addEvent(shift.fromWithTimeZone, shift.toWithTimeZone, 'Work Thuisbezorgd', JSON.stringify(shift));
            } else {
                // get the shift and event times
                const start = new Date(event.start.dateTime);
                const from = new Date(shift.fromWithTimeZone);
                const end = new Date(event.end.dateTime);
                const to = new Date(shift.toWithTimeZone);

                // check if the shift and event match up, otherwise update
                if (start.getTime() != from.getTime() || end.getTime() != to.getTime()) {
                    google.editEvent(event.id, shift.fromWithTimeZone, shift.toWithTimeZone, 'Work Thuisbezorgd', JSON.stringify(shift));
                }
            }
        }
    } catch (e) {
        console.log(e);
        exit(1);
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
    const sunday = new Date(today.getTime() + toSunday);

    return [monday, sunday];
}

