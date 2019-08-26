var ArrayExtensions = require ('./Util/ArrayExtensions.js');
var Logger = require ('./Logger.js');
var FakeResponse = require ('./Storage/FakeResponse');
var FetchTwitter = require ('./Fetchers/FetchTwitter');
var DataSave = require ('./Storage/DataSave');
var DataAccess = require ('./Storage/DataAccess');
const logger = require ('./Util/Logger');


module.exports = {

    getNewprofileFromSpreadsheet: async function () {

        logger.info("getNewprofileFromSpreadsheet");

        var SpreadSheet = require ('./Storage/SpreadSheet/SpreadSheet');

        await SpreadSheet.init((oAuth2Client) => {
            const spreadsheetId ='1SLnUaCFiTzvXagZeaZoTux5mmLFwoqQCCtCPYm31ztw';
            const range = 'result_first!A2:A';
    
            SpreadSheet.fetchSpreadsheetContent(oAuth2Client, spreadsheetId, range, async (rows) => {

                await ArrayExtensions.asyncForEach(rows, async (next, row, index, array) => {

                    //logger.info("row: " + row);
                    //logger.info("index: " + next);
                    //logger.info("array: " + index);
                    //logger.info("array: " + array);

                    logger.info("Row: " + next + "/" + (index.length-1) + " handling id: " + row);

                    if (row !== null)
                        await DataSave.saveProfileIds([row]); 
                    else
                        logger.info("Profile is null: " + row[0]);
                });
            });
        });

    },

    getNewProfilesFromFollowers: async function (currentProfileId, count) {

        logger.info ("getNewProfiles");
        let profiles = [];
        let profileIds = await FetchTwitter.getFollowerIds(currentProfileId, count);
        //logger.info(profileIds);

        if (profileIds !== undefined) {
            profileIds.ids.forEach (async element =>  {
                
                if (element !== undefined) {
                    logger.info("e: " +element);
                    let fullProfile = await FetchTwitter.getUser(element);
                    //logger.info(fullProfile);
                    if (fullProfile !== null)
                        DataSave.saveProfiles([fullProfile]); 
                }
            });
        }
    },

    refreshTweetFromProfiles: async function (overideFetchNumber = -1) {

        let nbProfileToFetch = overideFetchNumber != -1 ? overideFetchNumber : 1500;

        logger.info ("refreshTweetFromProfiles will fetch: " + nbProfileToFetch);
        var profiles = await DataAccess.getAllProfiles(nbProfileToFetch, "order by lastTweetFetchDate");
        //logger.info(profiles);

        if (profiles !== null) {
            // profiles.forEach(async element => {
            await ArrayExtensions.asyncForEach(profiles, async (next, element, index, array) => {

                //logger.info("element");
                //logger.info(element.idProfile);
                
                var tweets = await FetchTwitter.getLatestTweet(element.idProfile, 10);
                //logger.info(tweets);
                if (tweets !== null) {
                    await DataSave.saveTweets(element, tweets,showFullLog = false);
                }
            });
        }
    },

    refreshProfiles: async function (overideFetchNumber = -1) {

        logger.info("refreshProfiles");

        let nbProfileToFetch = overideFetchNumber != -1 ? overideFetchNumber : 900;
        let profiles = await DataAccess.getAllProfiles(nbProfileToFetch, "order by lastUpdate", false);

        if (profiles) {

            await ArrayExtensions.asyncForEach(profiles, async (next, element, index, array) => {

                //logger.info(element);
                let fullProfile = await FetchTwitter.getUser(element.idProfile, showFullLog = false);
                if (fullProfile !== null) {
                    logger.info("Got data for Profile: " + fullProfile.screen_name);
                    DataSave.saveProfiles([fullProfile], showFullLog = false); 
                }
                else {
                    logger.info("Fail to get Profile for: " + element.idProfile);
                }
            });
        }
    },

    refreshFollowers: async function (overideFetchNumber = -1) {

        logger.info("refreshFollowers");

        let nbProfileToFetch = overideFetchNumber != -1 ? overideFetchNumber : 15;
        let profiles = await DataAccess.getAllProfiles(nbProfileToFetch, "order by lastFollowersFetchDate", false);

        if (profiles) {

            await ArrayExtensions.asyncForEach(profiles, async (next, element, index, array) => {

                //logger.info(element);
                let followersList = await FetchTwitter.getFollowerIds(element.idProfile, showFullLog = true);

                if (followersList !== null) {
                    //logger.info("followersList", followersList);
                    //console.log(followersList.length);
                    //console.log(followersList);
                    logger.info("idProfileMaster: " + element.idProfile);
                    DataSave.saveFollowers(element.idProfile, followersList, showFullLog = false); 
                }
                else {
                    logger.info("Fail to get Profile for: " + element.idProfile);
                }
            });
        }
    }
}