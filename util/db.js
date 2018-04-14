const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'music';


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

const findPopular = function(cb) {
    MongoClient.connect(url, function(err, client) {
        const db = client.db(dbName);
        const collection = db.collection('popular');
        collection.find({}).toArray(function(err, docs) {
            if (err)
                console.log(err);
            client.close();
            cb(docs);
        })
    });
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
    findPopular
}