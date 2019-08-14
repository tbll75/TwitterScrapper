const DataConnection = require ('./DataConnection');

module.exports = {

    saveProfiles: async function (profiles, showFullLog = false) {

        //console.log (profiles);

        profiles.forEach(async element => {
            let sql = "INSERT INTO store.twProfiles (idProfile, name, screenName, nbFollowers, nbFriends, lastUpdate) VALUES (?, ?, ?, ?, ?, NOW()) "
                        + "ON DUPLICATE KEY UPDATE "
                        + "nbFollowers = @nbFollowers, "
                        + "nbFriends = @nbFriends ";

            let params = [
                element.id_str, 
                element.name,
                element.screen_name,
                element.followers_count,
                element.friends_count,
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

    saveTweets: async function (profile, tweets, showFullLog = false) {

        tweets.forEach(async element => {

            try {
                let sql = "INSERT INTO store.twTweets (idTweet, idProfile, text, nbLike, nbRetweet, lastUpdate) VALUES (?, ?, ?, ?, ?, NOW()) "
                        + "ON DUPLICATE KEY UPDATE "
                        + "text = @text, "
                        + "nbLike = @nbLike, "
                        + "nbRetweet = @nbRetweet ";

                let fav = element.retweeted_status === undefined ? element.favorite_count : element.retweeted_status.favorite_count;
                //console.log("fav: " + fav);

                let params = [
                    element.id_str, 
                    profile.idProfile,
                    JSON.stringify(element.text),
                    fav,
                    element.retweet_count
                ];

                params.concat([params[2],params[3],params[4]]);
                
                await DataConnection.executeQuery (sql, params, showFullLog);
                console.log("1 row added or modified");
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
    } 

}