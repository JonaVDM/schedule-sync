import axios from 'axios';
import calls from './calls';

import UserData from '../../types/user-data';
import Shift from '../../types/shift';

export default class Scoober {
    public token: string;

    public async login(email: string, password: string): Promise<string> {
        const response = await axios.post<UserData>(calls.login, { userName: email, password: password });

        const { data } = response;

        this.token = data.accessToken;
        return this.token;
    }

    public async shifts(start: Date, finish: Date): Promise<Shift[]> {
        if (!this.token) {
            throw new Error("User not signed in");
        }

        const fromDate = this.formatDate(start);
        const toDate = this.formatDate(finish);

        const { data } = await axios.get<Shift[]>(calls.planning, {
            headers: {
                accessToken: this.token,
            },
            params: {
                fromDate,
                toDate
            }
        });

        return data;
    }

    private formatDate(date: Date): string {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }
}
