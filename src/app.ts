import Scoober from './api/scoober';
import Google from './api/google';

import dotenv from 'dotenv';
import Shift from './types/shift';

(async () => {
    dotenv.config();

    const dates = getDates();

    // const shifts = await getShifts(dates);
})();

async function getShifts(dates: [Date, Date]): Promise<Shift[]> {
    const { email, password } = process.env;
    const access = new Scoober();
    await access.login(email, password);
    return await access.shifts(...dates);
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
