const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'music';


const findSongById = function(id , cb){
MongoClient.connect(url, function(err, client) {
  const db = client.db(dbName);
  findDocuments(db, id, function(docs) {
    client.close();
    cb(docs);
  });
});
};


const findDocuments = function(db, id, callback) {
  const collection = db.collection('song');
  collection.findOne({songid: parseInt(id)}, function(err, docs) {
      callback(docs);
  })
}

const saveLyricById = function(id, lyric , cb){
MongoClient.connect(url, function(err, client) {
  const db = client.db(dbName);
  updateDocument(db, id, lyric, function(docs) {
    client.close();
    cb(docs);
  });
});
};


const updateDocument = function(db, id, lyric, callback) {
  const collection = db.collection('song');
  collection.updateOne({ songid : parseInt(id) }
    , { $set: { lyric : lyric } }, function(err, result) {
    callback(result);
  });  
}
module.exports = {
findSongById,
saveLyricById
}
