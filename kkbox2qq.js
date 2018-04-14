const request = require('request-promise');
const opencc = require('node-opencc');
const he = require('he');

const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'music';

var qq = require('./util/qq');
  request('https://kma.kkbox.com/charts/api/v1/daily?category=297&date=2018-04-12&lang=tc&limit=50&terr=tw&type=newrelease', function (error, response, body) {
    body = JSON.parse(body);
    songs = body.data.charts.newrelease;
    for(var i = 0 ; i < songs.length; i++){
      setTimeout( function (i) {
        songname = songs[i].song_name.split(" ")[0];
        artistname = songs[i].artist_name.split(" ")[0];
        qq.search( songname + ' ' + artistname , 1).then((data) =>{ 
        if(typeof data[0] != 'undefined'){
          MongoClient.connect("mongodb://localhost:27017/musicDb", function(err, client) {
            const db = client.db(dbName);
            updateSongIfNotExist(db, data[0], function() {
              client.close();
            });
          })
        }
        });
      }, 1000 * 6 * i , i)
    }
  });

function updateSongIfNotExist(db, body, callback){
  const collection = db.collection('popular');
    collection.insert(body, function(err, records){
      if(err)
        console.log(err)
    });
}


