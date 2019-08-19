const DataConnection = require ('./DataConnection');

async function updateLastTweetFetchDate(id) {
    let sql = "UPDATE store.twProfiles "
                + "set lastTweetFetchDate = NOW() "
                + "WHERE idProfile = ?"

    let params = [
        id 
    ];

    try {
        await DataConnection.executeQuery (sql, params, showFullLog);
        console.log("1 row added or modified");
    }
    catch (error) {
        console.log("error: " + error);
    }
}

module.exports = {

    updateLastUpdate: async function (id, showFullLog = false, field = "lastUpdate") {

        console.log("updateLastUpdate");

        let sql = "UPDATE store.twProfiles "
                    + "set " + field + " = NOW() "
                    + "WHERE idProfile = ?"
    
        let params = [
            id 
        ];
    
        try {
            await DataConnection.executeQuery (sql, params, showFullLog);
            console.log("1 row added or modified");
        }
        catch (error) {
            console.log("error: " + error);
        }
    },

    saveProfileIds: async function (ids, showFullLog = false) {

        ids.forEach(async element => {
            let sql = "INSERT INTO store.twProfiles (idProfile) VALUES (?)";

            let params = [
                element, 
            ];

            try {
                await DataConnection.executeQuery (sql, params, showFullLog);
                console.log("1 row added or modified");
            }
            catch (error) {
                console.log("error: " + error);
            }

        });
        
        return true;
    },

    saveProfiles: async function (profiles, showFullLog = false) {

        //console.log (profiles);

        profiles.forEach(async element => {
            let sql = "INSERT INTO store.twProfiles (idProfile, name, screenName, nbFollowers, nbFriends, lastUpdate) VALUES (?, ?, ?, ?, ?, NOW()) "
                        + "ON DUPLICATE KEY UPDATE "
                        + "name = ?, "
                        + "screenName = ?, "
                        + "nbFollowers = ?, "
                        + "nbFriends = ?, "
                        + "lastUpdate = NOW() ";

            let params = [
                element.id_str, 
                element.name,
                element.screen_name,
                element.followers_count,
                element.friends_count,
            ];

            params = params.concat(params[1],params[2],params[3],params[4]);

            try {
                await DataConnection.executeQuery (sql, params, showFullLog);
                console.log("1 row added or modified");
            }
            catch (error) {
                console.log("error: " + error);
            }

        });
        
        return true;
    },

    saveTweets: async function (profile, tweets, showFullLog = false) {

        tweets.forEach(async element => {

            try {
                let sql = "INSERT INTO store.twTweets (idTweet, idProfile, text, nbLike, nbRetweet, lastUpdate) VALUES (?, ?, ?, ?, ?, NOW()) "
                        + "ON DUPLICATE KEY UPDATE "
                        + "text = ?, "
                        + "nbLike = ?, "
                        + "nbRetweet = ?, "
                        + "lastUpdate = NOW() ";

                let fav = element.retweeted_status === undefined ? element.favorite_count : element.retweeted_status.favorite_count;
                //console.log("fav: " + fav);

                let params = [
                    element.id_str, 
                    profile.idProfile,
                    element.text,
                    fav,
                    element.retweet_count
                ];

                params = params.concat([params[2],params[3],params[4]]);
                
                await DataConnection.executeQuery (sql, params, showFullLog);
                console.log("1 row added or modified");

                await updateLastTweetFetchDate(profile.idProfile);
            }
            catch (error) {
                if (error.message.includes("Duplicate") == false)
                {
                    console.log("error: " + error);
                    console.log(element);
                }
            }

        });
        
        return true;
    },

    deleteProfile: async function (idprofiles, showFullLog)
    {
        //console.log("deleteProfile");

        idprofiles.forEach(async element => {

            // Remove profile
            try {
                // Tweets
                let sqlTweets = "DELETE FROM store.twTweets WHERE idProfile = ?";

                let paramsTweets = [
                    element
                ];

                await DataConnection.executeQuery (sqlTweets, paramsTweets, showFullLog);

                // Profile
                let sqlProfile = "DELETE FROM store.twProfiles WHERE idProfile = ?";

                let paramsProfile = [
                    element
                ];

                await DataConnection.executeQuery (sqlProfile, paramsProfile, showFullLog);
                console.log("Profile deleted: " + element);
            }
            catch (error) {
                console.log("error: " + error);
            }

        });
        
        return true;
    }

}