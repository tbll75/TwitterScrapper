
var Logger = require ('./Logger.js');
var FakeResponse = require ('./Storage/FakeResponse');
var FetchTwitter = require ('./Fetchers/FetchTwitter');
var DataSave = require ('./Storage/DataSave');
var DataAccess = require ('./Storage/DataAccess');

module.exports = {

    getNewprofileFromSpreadsheet: async function () {

        console.log("getNewprofileFromSpreadsheet");

        var SpreadSheet = require ('./Storage/SpreadSheet/SpreadSheet');

        await SpreadSheet.init((oAuth2Client) => {
            const spreadsheetId ='1SLnUaCFiTzvXagZeaZoTux5mmLFwoqQCCtCPYm31ztw';
            const range = 'result_first!A2:A10';
    
            SpreadSheet.fetchSpreadsheetContent(oAuth2Client, spreadsheetId, range, (rows) => {
                rows.map(async (row) => {
                    console.log("Handling row: " + row);
                    let fullProfile = await FetchTwitter.getUser(row[0], true);
                    if (fullProfile !== null)
                        DataSave.saveProfiles([fullProfile]); 
                    else
                        console.log("Profile is null");
                });
            });
        });

    },

    getNewProfilesFromFollowers: async function (currentProfileId, count) {

        console.log ("getNewProfiles");
        let profiles = [];
        let profileIds = await FetchTwitter.getFollowerIds(currentProfileId, count);
        //console.log(profileIds);

        if (profileIds !== undefined) {
            profileIds.ids.forEach (async element =>  {
                
                if (element !== undefined) {
                    console.log("e: " +element);
                    let fullProfile = await FetchTwitter.getUser(element);
                    //console.log(fullProfile);
                    if (fullProfile !== null)
                        DataSave.saveProfiles([fullProfile]); 
                }
            });
        }
    },

    refreshTweetFromProfiles: async function () {

        console.log ("refreshTweetFromProfiles");
        var profiles = await DataAccess.getAllProfiles(1);
        //console.log(profiles);

        if (profiles != null) {
            profiles.forEach(async element => {

                //console.log("element");
                //console.log(element.idProfile);
                
                var tweets = await FetchTwitter.getLatestTweet(element.idProfile, 10);
                //console.log(tweets);
                DataSave.saveTweets(element, tweets);
            });
        }
    },

    refreshProfiles: async function () {

        console.log("refreshProfiles");

        var profiles = await DataAccess.getAllProfiles();

        profiles.forEach(async element => {

            let fullProfile = await FetchTwitter.getUser(element.idProfile, false);
            
            if (fullProfile !== null) {
                console.log("Got data for Profile: " + fullProfile.screen_name);
                DataSave.saveProfiles([fullProfile], false); 
            }
            else {
                console.log("Fail to get Profile for: " + element.idProfile);
            }
        });

    }

}