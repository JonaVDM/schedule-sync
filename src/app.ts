import Scoober from './api/scoober';
import Google from './api/google';

import dotenv from 'dotenv';
import Shift from './types/shift';
import { exit } from 'process';


const google = new Google();
const scoober = new Scoober();

(async () => {
    dotenv.config();

    const { email, password } = process.env;
    await google.login();

    try {
        await scoober.login(email, password);
    } catch (e) {
        console.log(e);
        exit(1);
    }

    const dates = getDates();

    const events = await google.getEvents('Thuisbezorgd', dates);
    const shifts = await scoober.shifts(...dates);

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

