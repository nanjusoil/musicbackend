var request = require('request-promise');
var opencc = require('node-opencc');
var he = require('he');
var redis = require("redis");
var client = redis.createClient();

var qq = require('./util/qq');
var db = require('./util/db');

function daily_chart() {
    client.del("popular", function(err, res) {
        if (res == 1)
            console.log("deleted popular");
        request('https://kma.kkbox.com/charts/api/v1/daily?category=297&date=2018-04-12&lang=tc&limit=50&terr=tw&type=newrelease', function(error, response, body) {
            body = JSON.parse(body);
            songs = body.data.charts.newrelease;
            for (var i = 0; i < songs.length; i++) {
                setTimeout(function(i) {
                    songname = songs[i].song_name.split("(")[0];
                    artistname = songs[i].artist_name.split("(")[0];
                    client.get("kkbox_id:" + songs[i].song_id, function(err, res) {
                        if (res == null) {
                            qq.search(songname + ' ' + artistname, 1).then((data) => {
                                console.log(songs[i].song_id);
                                console.log(data[0]);
                                if (typeof data[0] != 'undefined') {
                                    client.set("kkbox_id:" + songs[i].song_id, data[0].id, redis.print);
                                    client.lpush("popular", data[0].id, redis.print);
                                }
                            });
                        } else {
                            client.lpush("popular", res, redis.print);
                        }
                    })
                }, 1000 * 6 * i, i)
            }
        });
    })
}

function featured_playlist(id) {
  request('https://www.kkbox.com/tw/tc/ajax/wp_songinfo.php?act=5&content_id='+ id + '&ver=2', function(error, response, body) {
      body = JSON.parse(body);
      songs = body.data;
        for (var i = 0; i < songs.length; i++) {
            setTimeout(function(i) {
                songname = songs[i].song_name.split("(")[0];
                artistname = songs[i].artist_name.split("(")[0];
                console.log(songname + artistname);
                client.get("kkbox_id:" + songs[i].song_content_id, function(err, res) {
                    if (res == null) {
                        qq.search(songname + ' ' + artistname, 1).then((data) => {
                            console.log(songs[i].song_content_id);
                            console.log(data[0]);
                            if (typeof data[0] != 'undefined') {
                                client.set("kkbox_id:" + songs[i].song_content_id, data[0].id, redis.print);
                                client.lpush("featured_playlist:" + id, data[0].id, redis.print);
                            }
                        });
                    } else {
                        client.lpush("featured_playlist:" + id, res, redis.print);
                    }
                })
            }, 1000 * 6 * i, i)
        }
  });

}


featured_playlist("HXCFeL6rLBMWLCXDfI");


