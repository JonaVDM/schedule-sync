import login from './login';
import { google } from 'googleapis';

export default class Google {
    private client: any;
    private calendar = '';

    public async login() {
        const client = await login();
        this.client = client;
    }

    public async sendEmail(user: string, content: string) {
        const gmail = google.gmail({ version: "v1", auth: this.client });

        const message = Buffer.from(
            `To: ${user}\r\n` +
            `From: ${user}\n` +
            `Subject: Workschedule Link Update\r\n\r\n` +
            content
        ).toString('base64');

        await gmail.users.messages.send({
            userId: 'me', requestBody: {
                raw: message
            }
        });
    }

    public async useCalandar(id: string) {
        this.calendar = id;
    }

    public async getCalendarId(name: string): Promise<string> {
        const calendar = google.calendar({ version: 'v3', auth: this.client });
        const calendars = await calendar.calendarList.list();

        for (const c of calendars.data.items) {
            if (c.summary == name) {
                this.useCalandar(c.id);
                return c.id;
            }
        }

        throw 'Calendar not found';
    }

    public async addEvent(start: string, end: string, title: string, description: string) {
        const cal = google.calendar({ version: 'v3', auth: this.client });
        if (!this.calendar) throw 'Calendar not defined';

        await cal.events.insert({
            calendarId: this.calendar,
            requestBody: {
                start: {
                    dateTime: start,
                },
                end: {
                    dateTime: end
                },
                description,
                summary: title,
            }
        });
        return;
    }

    public async getEvents(dates: [Date, Date]) {
        const calendar = google.calendar({ version: 'v3', auth: this.client });
        if (!this.calendar) throw 'Calendar not defined';

        const events = await calendar.events.list({
            calendarId: this.calendar,
            timeMin: dates[0].toISOString(),
            timeMax: dates[1].toISOString(),
        });

        return events.data.items;
    }

    public async editEvent(id: string, start: string, end: string, title: string, description: string) {
        const calendar = google.calendar({ version: 'v3', auth: this.client });
        if (!this.calendar) throw 'Calendar not defined';

        await calendar.events.update({
            calendarId: this.calendar,
            eventId: id,
            requestBody: {
                start: {
                    dateTime: start,
                },
                end: {
                    dateTime: end,
                },
                description,
                summary: title,
            }
        });
    }

    public async deleteEvent(id: string) {
        const calendar = google.calendar({ version: 'v3', auth: this.client });
        if (!this.calendar) throw 'Calendar not defined';

        await calendar.events.delete({ calendarId: this.calendar, eventId: id });
    }
}
