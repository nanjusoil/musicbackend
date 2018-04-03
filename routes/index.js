var express = require('express');
var router = express.Router();
const musicAPI = require('music-api');
var fs = require('fs');
var request = require('request');
var opencc = require('node-opencc');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/search', function(req, res, next) {
  musicAPI.searchSong('qq', {
    key: req.query.song,
    limit: 10,
    page: 1,
  })
  .then(neteaseRes => {
    console.log(neteaseRes);
    arr = [];
    neteaseRes.songList.map(song => {
      arr.push({
        //id: song.id,
        id: '123',
        title: opencc.simplifiedToTaiwan(song.name),
        //data: "https://stonedog.sayfeel.tw/shin.mp3",
        data: "http://139.162.98.238/data/" + song.id + ".mp3",
        albumName: opencc.simplifiedToTaiwan(song.album.name),
        artistName: opencc.simplifiedToTaiwan(song.artists[0].name),
      });
    })
    res.send(arr);
  })
  .catch(err => console.log(err))
});

router.get('/download', function(req, res, next) {
  id = req.query.id.split("/")[2].split(".")[0];
  musicAPI.getSong('qq', {
    id: id,
    raw: false,
  })
  .then(neteaseRes => {
  
    download(neteaseRes.url, "/var/www/html/data/" + req.query.id.split("/")[2], function(){
      res.redirect('http://139.162.98.238'+req.query.id)
    })

  }) 
});


var download = function(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var sendReq = request.get(url);

    // verify response code
    sendReq.on('response', function(response) {
        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode);
        }
    });

    // check for request errors
    sendReq.on('error', function (err) {
        fs.unlink(dest);
        return cb(err.message);
    });

    sendReq.pipe(file);

    file.on('finish', function() {
        file.close(cb);  // close() is async, call cb after close completes.
    });

    file.on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        return cb(err.message);
    });
};

module.exports = router;
