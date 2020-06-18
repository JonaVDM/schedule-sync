import Scoober from './api/scoober';
import Google from './api/google';

import dotenv from 'dotenv';

import { exit, env } from 'process';

import Shift from './types/shift';


const google = new Google();
const scoober = new Scoober();

(async () => {
    dotenv.config();

    const { email, password } = process.env;

    try {
        await google.login();
    } catch (e) {
        console.log(e);
        exit(1);
    }

    try {
        await scoober.login(email, password);
    } catch (e) {
        console.log(e);
        exit(1);
    }

    const dates = getDates();

    try {
        await google.getCalendarId('Thuisbezorgd');
        const events = await google.getEvents(dates);
        const shifts = await scoober.shifts(...dates);

        const shiftIdC: Map<string, string> = new Map();
        const shiftIdS: string[] = [];

        // get the ids from scoober
        for (const shift of shifts) {
            shiftIdS.push(shift._id);
        }

        // get the ids from google
        for (const event of events) {
            if (!event.description) continue;
            const description: Shift = JSON.parse(event.description);
            shiftIdC.set(description._id, event.id);
        }

        // remove event if shift does not exist
        shiftIdC.forEach((value, key) => {
            if (!shiftIdS.includes(key)) {
                google.deleteEvent(value);
                shiftIdC.delete(key);
            }
        });

        // add shift
        for (const shift of shifts) {
            if (shiftIdC.get(shift._id)) continue;
            google.addEvent(shift.fromWithTimeZone, shift.toWithTimeZone, 'Work Thuisbezorgd', JSON.stringify(shift));
        }

        // Update shift

    } catch (e) {
        console.log(e);
        exit(1);
    }
})();

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

