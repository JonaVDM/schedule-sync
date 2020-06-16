import axios from 'axios';
import calls from './calls';

export default class API {
    public token: string;

    public async login(email: string, password: string): Promise<string> {
        const response = await axios.post(calls.login, { userName: email, password: password });

        const { data } = response;

        this.token = data.accessToken;
        return this.token;
    }
}
