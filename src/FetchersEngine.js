var ArrayExtensions = require ('./Util/ArrayExtensions.js');
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
            const range = 'result_first!A2:A';
    
            SpreadSheet.fetchSpreadsheetContent(oAuth2Client, spreadsheetId, range, async (rows) => {

                await ArrayExtensions.asyncForEach(rows, async (next, row, index, array) => {

                    //console.log("row: " + row);
                    //console.log("index: " + next);
                    //console.log("array: " + index);
                    //console.log("array: " + array);

                    console.log("Row: " + next + "/" + (index.length-1) + " handling id: " + row);

                    if (row !== null)
                        await DataSave.saveProfileIds([row]); 
                    else
                        console.log("Profile is null: " + row[0]);
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
        var profiles = await DataAccess.getAllProfiles(100, "order by lastTweetFetchDate");
        //console.log(profiles);

        if (profiles !== null) {
            // profiles.forEach(async element => {
            await ArrayExtensions.asyncForEach(profiles, async (next, element, index, array) => {

                //console.log("element");
                //console.log(element.idProfile);
                
                var tweets = await FetchTwitter.getLatestTweet(element.idProfile, 10);
                //console.log(tweets);
                if (tweets !== null) {
                    await DataSave.saveTweets(element, tweets,showFullLog = false);
                }
            });
        }
    },

    refreshProfiles: async function () {

        console.log("refreshProfiles");

        var profiles = await DataAccess.getAllProfiles(2, "order by lastUpdate", false);

        /* profiles.forEach(async element => {

            let fullProfile = await FetchTwitter.getUser(element.idProfile, false);
            
            if (fullProfile !== null) {
                console.log("Got data for Profile: " + fullProfile.screen_name);
                DataSave.saveProfiles([fullProfile], false); 
            }
            else {
                console.log("Fail to get Profile for: " + element.idProfile);
            }
        }); */

        if (profiles) {

            await ArrayExtensions.asyncForEach(profiles, async (next, element, index, array) => {

                //console.log(element);
                let fullProfile = await FetchTwitter.getUser(element.idProfile, showFullLog = false);
                if (fullProfile !== null) {
                    console.log("Got data for Profile: " + fullProfile.screen_name);
                    DataSave.saveProfiles([fullProfile], showFullLog = false); 
                }
                else {
                    console.log("Fail to get Profile for: " + element.idProfile);
                }
            });
        }
    }
}