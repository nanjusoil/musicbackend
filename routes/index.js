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

        db.saveLyricById(songid, lyric, function(err){
          console.log(err);
        });

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
router.get('/lyrics', function(req, res, next) {
  res.send('[00:00.60]死了都要愛　不淋漓盡致不痛快\n [00:08.13]感情多深只有這樣>才足夠表白\n [00:15.06]死了都要愛　不哭到微笑不痛快\n [00:22.68]宇宙毀滅心還在\n [00:29.87]把每天當成是末日來相愛\n [00:37.26]一分一秒都美到淚水掉下來\n [00:44.52]不理會別人是看好或看壞\n [00:51.18]只要你勇敢跟我來\n [00:58.98]愛　不用刻意>安排\n [01:06.08]憑感覺去親吻相擁就會很愉快\n');
});
router.get('/albumpic', function(req, res, next) {
  id = req.query.id.split("/")[2].split(".")[0];
  var image_id = id,
    width = 300,
    pic = `http://imgcache.qq.com/music/photo/album_${width}/${image_id%100}/${width}_albumpic_${image_id}_0.jpg`;
  console.log(pic);
  var savePath = "/var/www/html/pic/" + id + '.jpg';
    download(pic, savePath, function(err){
      if(err)
        console.log(err);
      res.redirect('http://139.162.98.238'+req.query.id);
    })
});

module.exports = router;
