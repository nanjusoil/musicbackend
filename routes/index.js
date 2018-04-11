var express = require('express');
var router = express.Router();
const musicAPI = require('music-api');
var fs = require('fs');
var request = require('request');
var opencc = require('node-opencc');
var he = require('he');
var qq = require('../util/qq.js');
const NodeID3 = require('node-id3');
const download = require('../util/download.js')
const db = require('../util/db.js')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/search', function(req, res, next) {
  qq.search( req.query.song , 1).then((data) => res.send(data));
});

router.get('/download', function(req, res, next) {
  id = req.query.id.split("/")[2].split(".")[0];
  songid = id.split("_")[0];
  songmid= id.split("_")[1];
  musicAPI.getSong('qq', {
    id: songmid,
    raw: false,
  })
  .then(qqRes => {
    var savePath = "/var/www/html/data/" + req.query.id.split("/")[2];
    download(qqRes.url, savePath, function(){
      res.redirect('http://139.162.98.238'+req.query.id);
      qq.lyrics(songid).then((lyric) => {
        db.findSongById(songid, function(song){

           let tags = {
           title: song.songname,
           artist: song.singer[0].name,
           album: song.albumname,
           unsynchronisedLyrics: {
             text: lyric
           }
          }
          let ID3FrameBuffer = NodeID3.create(tags)   //  Returns ID3-Frame buffer
          let success = NodeID3.write(tags, savePath)
        })
      }) 
    })

  })
});

module.exports = router;
