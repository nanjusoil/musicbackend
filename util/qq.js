const request = require('request-promise');
var OpenCC = require('opencc');
var opencc = new OpenCC('s2twp.json');
const he = require('he');
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'music';

const HEADERS = {
  'accept': 'application/json',
  'authority': 'c.y.qq.com',
  'origin': 'https://m.y.qq.com',
  'referer': 'https://m.y.qq.com/',
  'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
}

async function fetch(url) {
  return await request({
    uri: url,
    json: true,
    headers: HEADERS
  })
}

const search = async (keyword, page) => {
  const url = `https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&w=${encodeURIComponent(keyword)}&zhidaqu=1&catZhida=1&t=0&flag=1&ie=utf-8&sem=1&aggr=0&perpage=20&n=20&p=${page}&remoteplace=txt.mqq.all&_=${+new Date()}`

  return fetch(url).then(function(body){
    let result = [];


    MongoClient.connect("mongodb://localhost:27017/musicDb", function(err, client) {
        const db = client.db(dbName);
        updateSongIfNotExist(db, body, function() {
          client.close();
        });
    })

    body.data.song.list.map(function(song){
      result.push({
        "id": song.songid,
        "title": opencc.convertSync(he.decode(song.songname)),
        "data": `http://139.162.98.238/data/${song.songid}_${song.songmid}.mp3`,
        "albumName": opencc.convertSync(he.decode(song.albumname)),
	"albumId": song.albumid,
        "artistName": opencc.convertSync(he.decode(song.singer[0].name))
      })
    });
    return result;
  })
  .catch(function(err){
    console.log(err)
  });

}

const lyrics = async (id, type) => {
  const url = `https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric.fcg?nobase64=1&musicid=${id}&songtype=${type || 0}`  
  try {
    let text = (await request({
      uri: url,
      headers: {
        'accept': '*/*',
        'authority': 'c.y.qq.com',
        'referer': 'https://c.y.qq.com',
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
      }
    })).replace(/MusicJsonCallback\((.*)\)/, '$1')
    return opencc.convertSync( he.decode(JSON.parse(text).lyric));
  } catch(e) {
    return e.message; 
  }
}

function updateSongIfNotExist(db, body, callback){
  const collection = db.collection('song');
      body.data.song.list.map(function(song){
        collection.update(
         {songid: song.songid},
         song,
         {upsert: true},
         function(err,data){
          if (err){
            console.log(err);
          }else{
            //console.log("score succeded");
          }
         });
  });
}

module.exports = {
  lyrics,
  search,
}

