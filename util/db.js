const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'music';
var redis = require("redis");
var client = redis.createClient();
var OpenCC = require('opencc');
var opencc = new OpenCC('s2twp.json');
const he = require('he');


const findSongById = function(id, cb) {
    MongoClient.connect(url, function(err, client) {
        const db = client.db(dbName);
        const collection = db.collection('song');
        collection.findOne({
            songid: parseInt(id)
        }, function(err, docs) {
            if (err)
                console.log(err);
            client.close();
            cb(docs);
        })
    });
};

const findSongsById = function(ids, cb) {
    ids = ids.map(Number);
    MongoClient.connect(url, function(err, client) {
        const db = client.db(dbName);
        const collection = db.collection('song');
        collection.find({
            songid: {
                $in: ids
            }
        }).toArray(function(err, items) {
            cb(items)
        })
    });
};

const findPopular = function(cb) {
    ret = [];
    client.lrange("popular", 1, 50, function(err, res) {
        findSongsById(res, function(datas) {
            datas.forEach(function(song) {
                ret.push({
                    "id": song.songid,
                    "title": opencc.convertSync(he.decode(song.songname)),
                    "data": `http://139.162.98.238/data/${song.songid}_${song.songmid}.mp3`,
                    "albumName": opencc.convertSync(he.decode(song.albumname)),
                    "albumId": song.albumid,
                    "artistName": opencc.convertSync(he.decode(song.singer[0].name))
                })
            })
            cb(ret);
        })
    })
};

const findPlaylistByIndex = function(index, cb) {
    index = parseInt(index);
    ret = [];
    client.keys("kkbox_playlist:*", function(err , playlist_name){
        client.lrange(playlist_name[index], 1, 50, function(err, res) {
            findSongsById(res, function(datas) {
                datas.forEach(function(song) {
                    ret.push({
                        "id": song.songid,
                        "title": opencc.convertSync(he.decode(song.songname)),
                        "data": `http://139.162.98.238/data/${song.songid}_${song.songmid}.mp3`,
                        "albumName": opencc.convertSync(he.decode(song.albumname)),
                        "albumId": song.albumid,
                        "artistName": opencc.convertSync(he.decode(song.singer[0].name))
                    })
                })
                cb(ret);
            })
        })
    })

};

const findPopularPlaylists = function(cb) {
    ret = [];
    client.keys("kkbox_playlist:*", function(err , playlist_name){
        client.hgetall("kkbox_playlist_name", function(err, names){
            for(var i = 0 ; i < playlist_name.length ; i++){
                ret.push({
                    id: i,
                    name: names[playlist_name[i].split(':')[1]]
                })
            }
            cb(ret);
        })

    })
};

const saveLyricById = function(id, lyric, cb) {
    MongoClient.connect(url, function(err, client) {
        const db = client.db(dbName);
        const collection = db.collection('song');
        collection.updateOne({
            songid: parseInt(id)
        }, {
            $set: {
                lyric: lyric
            }
        }, function(err, result) {
            if (err)
                console.log(err)
            cb(result);
        });
    });
};

module.exports = {
    findSongById,
    saveLyricById,
    findPopular,
    findSongsById,
    findPlaylistByIndex,
    findPopularPlaylists
}