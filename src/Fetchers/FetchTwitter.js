
var FakeResponse = require('../Storage/FakeResponse');
var Twitter = require('twitter');
var config = require('./TwitterConfig.js');
var DataSave = require('../Storage/DataSave');

var T = new Twitter(config);

global.dateRateLimited = null;
global.isRateLimited = false;

async function _makeTwitterCall(url, params, showFullLog)
{
    console.log("Caling: " + url + " / params: " + JSON.stringify(params));
    //console.log(global.isRateLimited);

    //if (global.isRateLimited && (Date.now()-global.dateRateLimited > new Date(0,0,0,0,0,5))) {
    if (global.isRateLimited) {

        console.log (Date.now().toLocaleString() + " - Exit because Rate Limited");
        return null;
    }
    
    let response = null;
    try {
        response = await T.get(url, params);
        if (showFullLog) console.log(response);
    } catch (error) {
        console.log(error);
        //if (showFullLog && response !== null) console.log(response);


        if (error[0]) {
            if (error[0].code ==  88) // Rate Limit
            {
                global.isRateLimited = true;
                global.dateRateLimited = new Date(Date.now());
                console.log("RATE LIMITED - " + global.dateRateLimited.toLocaleString());
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

        console.log("searchTweets");

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
                    console.log(error);
                    DataSave.updateLastUpdate(id);
                }
            }
        }
        
        return response;
    },

    getFollowerIds: function (id, count, showFullLog=false) {

        var params = {
            user_id: id,
            count: count,
        }

        return _makeTwitterCall('followers/ids', params, showFullLog);
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

        console.log("Fetching tweets of id " + id);

        var params = {
            user_id: id,
            count: count,
        }

        let response = null;

        try { 
            response = await _makeTwitterCall('statuses/user_timeline', params, showFullLog);
        } catch (error) {

            console.log("Error fetching: " + id);
            if (error[0] !== undefined) {
                if (error[0].code ==  50 || // User not found
                    error[0].code ==  63) // User has been suspended
                {
                    await DataSave.deleteProfile([id], showFullLog);
                }
                else
                {
                    console.log(error);
                    await DataSave.updateLastUpdate(id, showFullLog, "lastTweetFetchDate");
                }
            }
            else
                await DataSave.updateLastUpdate(id, showFullLog, "lastTweetFetchDate");

        }

        return response;
    },




}