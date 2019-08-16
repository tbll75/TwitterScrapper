const express = require('express');
const app = express();

const FetchersEngine = require('./src/FetchersEngine')
var Cron = require('node-cron');

// clear node console
process.stdout.write('\033c');

app.get('/', (req, res) => { // new
    
    res.send(Logger.HelloConsole());

    console.log(FakeResponse.jsonFollowersId);
});


async function launchEngine()
{
    var dataConnection = require ('./src/Storage/DataConnection');
    await dataConnection.createConnection();

    var currentProfileId = 470129898;
    //FetchersEngine.getNewProfilesFromFollowers(currentProfileId, 100);
    //FetchersEngine.refreshTweetFromProfiles();
    //FetchersEngine.refreshProfiles();
    //FetchersEngine.getNewprofileFromSpreadsheet();


    // -- FOR TESTING
    var FetchTwitter = require ('./src/Fetchers/FetchTwitter');
    // My Id (Tibo Junior CTO) => 470129898
    //let response = await FetchTwitter.searchTweets("Tibo Junior CTO", 10, "recent", "en");
    //let response = await FetchTwitter.searchUsers("Tibo Junior CTO", 10);
    //let response = await FetchTwitter.getFollowerIds("470129898",10);
    //let response = await FetchTwitter.getUser("470129898");
    //let response = await FetchTwitter.getLatestTweet("19060199", 10);
    //console.log(response);

    // -- FOR SPREADSHEET
    //var SpreadSheet = require ('./src/Storage/SpreadSheet/SpreadSheet');


    // CRON
    Cron.schedule('* 0,15,30,45 * * * *', () => {
        FetchersEngine.refreshProfiles();
    });


    console.log("end");
}


launchEngine();

app.listen(3000, () => console.log('listening on port 3000'));