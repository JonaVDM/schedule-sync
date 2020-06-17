import login from './login';
import { google } from 'googleapis';

export default class Google {
    private client: any;

    public async login() {
        const client = await login();
        this.client = client;
    }

    public sendEmail() {
        return;
    }

    public addEvent() {
        return;
    }

    public async getEvents(name: string, dates: [Date, Date]) {
        const calendar = google.calendar({ version: 'v3', auth: this.client });
        const calendars = await calendar.calendarList.list();

        let calendarId: string;

        for (const c of calendars.data.items) {
            if (c.summary == name) {
                calendarId = c.id;
            }
        }

        if (!calendarId) throw new Error('Could not find Calendar');

        const events = await calendar.events.list({
            calendarId,
            timeMin: dates[0].toISOString(),
            timeMax: dates[1].toISOString(),
        });

        return events.data.items;
    }

    public editEvent() {
        return;
    }
}
