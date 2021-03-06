const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const logger = require ('../../Util/Logger');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/* const client_id = '';
const project_id = '';
const client_id = "44445518282-477mh2puqh2r9tvvbruec7kinrqagku0.apps.googleusercontent.com","project_id":"quickstart-1565794859793","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"4r1qBtMF-oXuQoulvNTMyDz9","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}}
 */


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    //logger.info("authorize");
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
     fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);

        //logger.info("setCredentials");
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    logger.info('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                logger.info('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1SLnUaCFiTzvXagZeaZoTux5mmLFwoqQCCtCPYm31ztw/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get({
        spreadsheetId: '1SLnUaCFiTzvXagZeaZoTux5mmLFwoqQCCtCPYm31ztw',
        range: 'result_first!A1:A',
    }, (err, res) => {
        if (err) return logger.info('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            logger.info('userId:');
            // Print columns A and E, which correspond to indices 0 and 4.
            rows.map((row) => {
                logger.info(`${row[0]}`);
            });
        } else {
            logger.info('No data found.');
        }
    });
}

module.exports = {

    init: function (callback) {
        
        //logger.info("init");
        // Load client secrets from a local file.
        fs.readFile("googleCredentials.json", (err, content) => {
            if (err) return logger.info('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Sheets API.
            authorize(JSON.parse(content),callback);
        });
    },

    fetchSpreadsheetContent: function (auth, spreadsheetId, range, callback) {

        logger.info("fetchSpreadsheetContent");

        const sheets = google.sheets({ version: 'v4', auth });
        sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range,
        }, (err, res) => {
            if (err) return logger.info('The API returned an error: ' + err);
            const rows = res.data.values;
            if (rows.length) {
                callback(rows);
            } else {
                logger.info('No data found.');
            }
        });
    }
}