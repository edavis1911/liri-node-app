var fs = require('fs');
var os = require('os');
var request = require('request');
var twitter = require('twitter');
var spotify = require('spotify');
var prettyjson = require('prettyjson');
var keys = require('./keys.js');

var first_argv = process.argv[2];
var second_argv = process.argv[3];


function liriCommandRunner(cmd, param) {
	switch (cmd) {
		case "my-tweets":
		myTweets();
		break;

		case "spotify-this-song":
		spotifyThis(param)
		break;

		case "movie-this":
		movieThis(param)
		break;

		case "do-what-it-says":
		doWhatItSays();
		break;

		default:
		console.log(first_argv + " : command not found");
	}
}


function myTweets() {

	var twitter_client = new twitter({
		consumer_key: keys.twitterKeys.consumer_key,
		consumer_secret: keys.twitterKeys.consumer_secret,
		access_token_key: keys.twitterKeys.access_token_key,
		access_token_secret: keys.twitterKeys.access_token_secret
	});

	var user = 'baltimore_e';
	var tweet_count = 20;

	twitter_client.get('statuses/user_timeline', {screen_name: user, count: tweet_count}, function(error, tweets) {

		if (error)
			throw error;
		else {
			var tweet_data = [];

			for ( i in tweets ) {
				var data = {
					"Created"   : tweets[i].created_at,
					"Tweet"     : tweets[i].text,
					"Retweeted" : tweets[i].retweet_count,
					"Favorited" : tweets[i].favorite_count
				};
				tweet_data.push(data);
			}

			console.log("---------------------------- START --------------------------------");
			console.log("Successfully retrieved " + tweets.length + " tweets (maximum 20) from Twitter.");
			console.log("===================================================================");
			console.log(prettyjson.render(tweet_data, { keysColor  : 'green', stringColor: 'white' }));
			console.log("===================================================================");
			console.log("---------------------------- END ----------------------------------");
		}
	});

	appendLogFile("Executed my-tweets");
}


function spotifyThis(song){
  spotify.search({ type: 'track', query: song}, function(error, data){
    if(!error){
      for(var i = 0; i < data.tracks.items.length; i++){
        var songData = data.tracks.items[i];
        //artist
        console.log("Artist: " + songData.artists[0].name);
        //song name
        console.log("Song: " + songData.name);
        //spotify preview link
        console.log("Preview URL: " + songData.preview_url);
        //album name
        console.log("Album: " + songData.album.name);
        console.log("-----------------------");
        
        //adds text to log.txt
        fs.appendFile('log.txt', songData.artists[0].name);
        fs.appendFile('log.txt', songData.name);
        fs.appendFile('log.txt', songData.preview_url);
        fs.appendFile('log.txt', songData.album.name);
        fs.appendFile('log.txt', "-----------------------");
      }
    } else{
      console.log('Error occurred.');
    }
  });
}

function movieThis(movie) {

	var query_url = 'http://www.omdbapi.com/?t=' + movie +'&y=&plot=long&tomatoes=true&r=json';

	request(query_url, function(error, res, body) {

		if (!error && res.statusCode == 200) {

			var movie_data = {
				"Title"                 : JSON.parse(body).Title,
				"Released"              : JSON.parse(body).Released,
				"Country"               : JSON.parse(body).Country,
				"Language(s)"           : JSON.parse(body).Language,
				"Actors"                : JSON.parse(body).Actors,
				"IMDB Rating"           : JSON.parse(body).imdbRating,
				"Rotten Tomatoes Rating": JSON.parse(body).tomatoRating,
				"Rotten Tomatoes URL"   : JSON.parse(body).tomatoURL,
				"Plot"                  : JSON.parse(body).Plot
			}

			console.log("---------------------------- START --------------------------------");
			console.log("Successfully retrieved OMDB results for " + movie_data.Title + ".");
			console.log("===================================================================");
			console.log(prettyjson.render(movie_data, { keysColor  : 'green', stringColor: 'white' }));
			console.log("===================================================================");
			console.log("---------------------------- END ----------------------------------");
		}
		else
			console.error(error);
	});

	appendLogFile("Executed movie-this with argument " + "'" + movie  + "'");
}


function doWhatItSays() {

	fs.readFile("random.txt", "utf8", function(err, random_txt) {

		var ran_txt = random_txt.split(',');
		var func = ran_txt[0];
		var param = ran_txt[1];

		console.log("PARAM: ", param);

		switch (func) {
			case "my-tweets":
			myTweets();
			break;
			case "spotify-this-song":
			spotifyThis(param);
			break;
			case "movie-this":
			movieThis(param);
			break;
		}
	});

	appendLogFile("Executed do-what-it-says");
}


function appendLogFile(log_entry) {

	var dtg = new Date() + ': ';

	fs.appendFile('log.txt', dtg + log_entry + os.EOL, 'utf8', function(error) {
		if (error)
			throw error;
	});
}


liriCommandRunner(first_argv, second_argv);