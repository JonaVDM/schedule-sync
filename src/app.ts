import API from './api';
import dotenv from 'dotenv';

(async () => {
    dotenv.config();

    const { email, password } = process.env;

    const access = new API();

    await access.login(email, password);
})();
