var express = require('express');
var router = express.Router();
const musicAPI = require('music-api');
var fs = require('fs');
var request = require('request');
var he = require('he');
var qq = require('../util/qq.js');
const NodeID3 = require('node-id3');
const download = require('../util/download.js')
const db = require('../util/db.js')
var redis = require("redis"),
    client = redis.createClient();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express'
    });
});

router.get('/search', function(req, res, next) {
    qq.search(req.query.song, 1).then((data) => res.send(data));
});

router.get('/download', function(req, res, next) {
    id = req.query.id.split("/")[2].split(".")[0];
    songid = id.split("_")[0];
    songmid = id.split("_")[1];
    musicAPI.getSong('qq', {
            id: songmid,
            raw: false,
        })
        .then(qqRes => {
            var savePath = "/var/www/html/data/" + req.query.id.split("/")[2];
            download(qqRes.url, savePath, function() {
                res.redirect('http://139.162.98.238' + req.query.id);
                qq.lyrics(songid).then((lyric) => {

                    db.saveLyricById(songid, lyric, function(data) {});

                    db.findSongById(songid, function(song) {

                        let tags = {
                            title: song.songname,
                            artist: song.singer[0].name,
                            album: song.albumname,
                            unsynchronisedLyrics: {
                                text: lyric
                            }
                        }
                        let ID3FrameBuffer = NodeID3.create(tags) //  Returns ID3-Frame buffer
                        let success = NodeID3.write(tags, savePath)
                    })
                })
            })

        })
});
router.get('/lyrics', function(req, res, next) {
    db.findSongById(req.query.id, function(song) {
        if (song)
            res.send(song.lyric);
    })
});
router.get('/albumpic', function(req, res, next) {
    id = req.query.id.split("/")[2].split(".")[0];
    var image_id = id,
        width = 300,
        pic = `http://imgcache.qq.com/music/photo/album_${width}/${image_id%100}/${width}_albumpic_${image_id}_0.jpg`;
    var savePath = "/var/www/html/pic/" + id + '.jpg';
    download(pic, savePath, function(err) {
        if (err)
            console.log(err);
        res.redirect('http://139.162.98.238' + req.query.id);
    })
});

router.get('/popularsongs', function(req, res, next) {
    db.findPopular(function(result) {
        res.send(result)
    })
})

router.get('/popularplaylists', function(req, res, next) {
    db.findPopularPlaylists(function(result) {
        console.log("done");
        res.send(result)
    })
})

router.get('/playlist', function(req, res, next) {
    db.findPlaylistByIndex(req.query.id,function(result) {
        res.send(result)
    })
})

router.get('/populargenre', function(req, res, next) {
    res.send([{'id':'297', 'name':"華語"},
{'id':'390', 'name':"西洋"},
{'id':'308', 'name':"日語"},
{'id':'314', 'name':"韓語"},
{'id':'304', 'name':"台語"},
{'id':'320', 'name':"粵語"},
{'id':'343', 'name':"原聲帶"},
{'id':'325', 'name':"電子"},
{'id':'324', 'name':"嘻哈"},
{'id':'335', 'name':"R&B"},
{'id':'13', 'name':"搖滾"},
{'id':'331', 'name':"另類/獨立"},
{'id':'69', 'name':"爵士"},
{'id':'336', 'name':"靈魂樂"},
{'id':'352', 'name':"鄉村"},
{'id':'348', 'name':"雷鬼"}]
)
})

router.get('/genre', function(req, res, next) {
    db.findGenreByIndex(req.query.id,function(result) {
        res.send(result)
    })
})

router.get('/genre', function(req, res, next) {
    db.findGenreByIndex(req.query.id,function(result) {
        res.send(result)
    })
})

router.get('/userplaylist', function(req, res, next) {
	if(typeof req.query.id == 'undefined'){
	    db.findPlaylistsByAccessToken(req.query.accesstoken,function(result) {
	        res.send(result)
	    });
	 }else{
	    db.findPlaylistByIdAndAccesstoken(req.query.accesstoken,req.query.id ,function(result) {
	        res.send(result)
	    });
	 }
})

module.exports = router;