var request = require('request-promise');
var he = require('he');
var redis = require("redis");
var client = redis.createClient();

var qq = require('./util/qq');
var db = require('./util/db');

var kkboxCateToChinese=[];
kkboxCateToChinese['297'] = "華語";
kkboxCateToChinese['390'] = "西洋";
kkboxCateToChinese['308'] = "日語";
kkboxCateToChinese['314'] = "韓語";
kkboxCateToChinese['304'] = "台語";
kkboxCateToChinese['320'] = "粵語";
kkboxCateToChinese['343'] = "原聲帶";
kkboxCateToChinese['325'] = "電子";
kkboxCateToChinese['324'] = "嘻哈";
kkboxCateToChinese['335'] = "R&B";
kkboxCateToChinese['13'] = "搖滾";
kkboxCateToChinese['331'] = "另類/獨立";
kkboxCateToChinese['69'] = "爵士";
kkboxCateToChinese['336'] = "靈魂樂";
kkboxCateToChinese['352'] = "鄉村";
kkboxCateToChinese['348'] = "雷鬼";



function fetch_daily_chart() {
    client.del("kkbox_popular", function(err, res) {
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
                                    client.lpush("kkbox_popular", data[0].id, redis.print);
                                }
                            });
                        } else {
                            client.lpush("kkbox_popular", res, redis.print);
                        }
                    })
                }, 1000 * 6 * i, i)
            }
        });
    })
}

function fetch_featured_playlist(id) {
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

function fetch_genre(key){
    client.del("kkbox_popular_genre:" + key , function(err, res) {
        if (res == 1)
            console.log("deleted popular genre" + key );
        request('https://kma.kkbox.com/charts/api/v1/daily?category='+key+'&date=2018-04-12&lang=tc&limit=50&terr=tw&type=newrelease', function(error, response, body) {
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
                                    client.lpush("kkbox_popular_genre:" + key, data[0].id, redis.print);
                                }
                            });
                        } else {
                            client.lpush("kkbox_popular_genre:" + key, res, redis.print);
                        }
                    })
                }, 1000 * 10 * i, i)
            }
        });
    })
}

//kkboxCateToChinese.forEach(function(val, key){
//    fetch_genre(key);
//})
fetch_genre('297');
//fetch_daily_chart();

//featured_playlist("HXCFeL6rLBMWLCXDfI");


