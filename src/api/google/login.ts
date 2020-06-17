import * as fsbasic from 'fs';
import { google } from 'googleapis';

const fs = fsbasic.promises;
const TOKEN_PATH = 'config/token.json';

export default async function login() {
    const creds = await getCredentials();
    let client = authorize(creds);
    client = await getToken(client);
    client.apiKey
    return client;
}

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

async function getToken(client: any) {
    try {
        const token = await fs.readFile(TOKEN_PATH);
        client.setCredentials(JSON.parse(token.toString()));
        return client;
    } catch {
        console.log('Something went wrong while loading in the token');
    }
}
