//
// This is a file that is used to give this app access to your google mail and
// calendar events.
//
// Make sure that the credentials.json are in the config folder.
// You can download the credentials from https://console.developers.google.com/
//

import * as fsbasic from 'fs';
import { google } from 'googleapis';
import readline from 'readline';

const fs = fsbasic.promises;


const SCOPES = [
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/calendar'
];
const TOKEN_PATH = 'config/token.json';


(async () => {
    const creds = await getCredentials();
    const client = authorize(creds);
    newToken(client);
})();


async function getCredentials() {
    try {
        const content = await fs.readFile('config/credentials.json');
        const data = JSON.parse(content.toString());

        return data;
    } catch {
        console.log('Error loading credentials file');
        process.exit(1);
    }
}


function authorize(credentials: any) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );

    return oAuth2Client;
}


async function newToken(client: any) {
    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('Authorize this app by visiting this url:', authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        client.getToken(code, async (err: any, token: string) => {
            if (err) return console.error('Error retrieving access token', err);
            await fs.writeFile(TOKEN_PATH, JSON.stringify(token));
        });
    });
}

