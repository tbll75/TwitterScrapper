
var FakeResponse = require('../Storage/FakeResponse');
var Twitter = require('twitter');
var config = require('./TwitterConfig.js');
var DataSave = require('../Storage/DataSave');
const logger = require ('../Util/Logger');

var T = new Twitter(config);

global.dateRateLimited = null;
global.isRateLimited = false;

async function _makeTwitterCall(url, params, showFullLog)
{
    logger.info("Caling: " + url + " / params: " + JSON.stringify(params));
    //logger.info(global.isRateLimited);

    //if (global.isRateLimited && (Date.now()-global.dateRateLimited > new Date(0,0,0,0,0,5))) {
    if (global.isRateLimited) {

        if (Date.now()-global.dateRateLimited > (60*15))  { // 15 minutes

            global.isRateLimited = false;
        }
        else {

            logger.info ("Exit because Rate Limited");
            return null;
        }
    }
    
    let response = null;
    try {
        response = await T.get(url, params);
        if (showFullLog) {
            logger.info("resp: ", response);
            console.log(response);
        } 

    } catch (error) {
        logger.error(error);
        logger.error(response);
        //if (showFullLog && response !== null) logger.info(response);


        if (error[0]) {
            if (error[0].code ==  88) // Rate Limit
            {
                global.isRateLimited = true;
                global.dateRateLimited = new Date(Date.now());
                logger.info("RATE LIMITED - " + global.dateRateLimited.toLocaleString());
            }
            else 
                throw error;
        }
        else 
            throw error;
        
    }
    return response;
}


module.exports = {

    searchTweets: async function (search, count, result_type, lang, showFullLog=false) {

        logger.info("searchTweets");

        var params = {
            q: search,
            count: count,
            result_type: result_type,
            lang: lang
        }

        return _makeTwitterCall('search/tweets', params, showFullLog);;
    },

    searchUsers: async function (search, count, result_type, lang, showFullLog=false) {

        var params = {
            q: search,
            count: count,
        }
        
        return _makeTwitterCall('users/search', params, showFullLog);
    },

    getUser: async function (id, showFullLog=false) {

        var params = {
            user_id: id
        }

        let response = null;

        try { 
            response = await _makeTwitterCall('users/show', params, showFullLog);
        } catch (error) {

            if (error[0] !== undefined) {
                if (error[0].code ==  50 || // User not found
                    error[0].code ==  63) // User has been suspended
                {
                    DataSave.deleteProfile([id], showFullLog);
                }
                else
                {
                    logger.info(error);
                    DataSave.updateLastUpdate(id);
                }
            }
        }
        
        return response;
    },

    getFollowerIds: async function (id, count, showFullLog=false) {

        var params = {
            user_id: id,
            count: count,
        }

        let response = null;

        try { 
            response = await _makeTwitterCall('followers/ids', params, showFullLog);
        } catch (error) {

            if (error[0] !== undefined) {
                if (error[0].code ==  50 || // User not found
                    error[0].code ==  63) // User has been suspended
                {
                    DataSave.deleteProfile([id], showFullLog);
                }
                else
                {
                    console.log("test");
                    logger.info(error);
                    DataSave.updateLastUpdate(id, showFullLog, "lastFollowersFetchDate");
                }
            }
            else {
                console.log("test2");
                DataSave.updateLastUpdate(id, showFullLog, "lastFollowersFetchDate");
            }

            return null;
        }

        if (response)
            return response.ids;
        else
            return null;
    },

    getFollowingIds: function (id) {

        return FakeResponse.jsonProfileIds.ids;
    },

    getLikedUsers: function (id) {
        
        return FakeResponse.jsonProfileIds;
    },

    getRetweetedUsers: function (id) {
        
        return FakeResponse.jsonProfileIds;
    },

    getLatestTweet: async function(id, count, showFullLog=false) {

        logger.info("Fetching tweets of id " + id);

        var params = {
            user_id: id,
            count: count,
        }

        let response = null;

        try { 
            response = await _makeTwitterCall('statuses/user_timeline', params, showFullLog);
        } catch (error) {

            logger.info("Error fetching: " + id);
            if (error[0] !== undefined) {
                if (error[0].code ==  50 || // User not found
                    error[0].code ==  63) // User has been suspended
                {
                    await DataSave.deleteProfile([id], showFullLog);
                }
                else
                {
                    logger.info(error);
                    await DataSave.updateLastUpdate(id, showFullLog, "lastTweetFetchDate");
                }
            }
            else
                await DataSave.updateLastUpdate(id, showFullLog, "lastTweetFetchDate");

        }

        return response;
    },




}