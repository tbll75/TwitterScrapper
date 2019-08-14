
var FakeResponse = require('../Storage/FakeResponse');
var Twitter = require('twitter');
var config = require('./TwitterConfig.js');

var T = new Twitter(config);


async function _makeTwitterCall(url, params, showFullLog)
{
    console.log("Caling: " + url + " / params: " + JSON.stringify(params));
    //console.log(params);
    
    let response = null;
    try {
        response = await T.get(url, params);
        if (showFullLog) console.log(response);
    } catch (error) {
        if (showFullLog) console.log(error);
        //if (showFullLog && response !== null) console.log(response);
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
        
        return _makeTwitterCall('users/show', params, showFullLog);
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

        return _makeTwitterCall('statuses/user_timeline', params, showFullLog);
    },




}