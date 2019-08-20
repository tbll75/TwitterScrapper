SELECT text, nbLike, nbRetweet, name, nbFollowers, nbFriends, 
((nbRetweet+nbLike)/nbFollowers*100) as ratio,
CONCAT("https://twitter.com/i/web/status/",idTweet) as url 
FROM store.twTweets 
inner join store.twProfiles on store.twTweets.idProfile = store.twProfiles.idProfile
WHERE 
text not like "RT%" AND
text not like "%t.co%" AND
text not like "%@%" AND
nbFollowers > 500 
order by ratio desc 