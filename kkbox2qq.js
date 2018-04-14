var request = require('request-promise');
var opencc = require('node-opencc');
var he = require('he');
var redis = require("redis");
var client = redis.createClient();

var qq = require('./util/qq');
request('https://kma.kkbox.com/charts/api/v1/daily?category=297&date=2018-04-12&lang=tc&limit=50&terr=tw&type=newrelease', function(error, response, body) {
    body = JSON.parse(body);
    songs = body.data.charts.newrelease;
    for (var i = 0; i < songs.length; i++) {
        setTimeout(function(i) {
            songname = songs[i].song_name.split(" ")[0];
            artistname = songs[i].artist_name.split(" ")[0];
            qq.search(songname + ' ' + artistname, 1).then((data) => {
                console.log(songs[i].song_id);
                console.log(data[0]);
                if (typeof data[0] != 'undefined') {
                    client.set("kkbox_id:" + songs[i].song_id, data[0].id, redis.print);
                    client.set("kkbox_id:" + songs[i].song_id, data[0].id, redis.print);
                }
            });
        }, 1000 * 6 * i, i)
    }
});