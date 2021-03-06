const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://party_manager:GE7GrWktVqN86UN5@mup-iiwhw.mongodb.net/test?retryWrites=true&w=majority";
function checkUniquePartyName(party_name) {
    return new Promise(function (resolve, reject) {
        // create new client
        const client = new MongoClient(uri, { useNewUrlParser: true });
        // connect to mongodb server
        client.connect(err => {
            if (err)
                return reject(err);
            console.log("connected!");
            // select collection
            const collection = client.db("party_management").collection("parties");

            // query
            line = {}
            line.party_name = party_name
            collection.find(line).limit(1).count((err, result) => {
                if (err)
                    reject(err);
                if (result == 0) resolve(true);
                else resolve(false);

            });
            client.close();
        });

    })

}
module.exports.isAdmin = function (party_name, user) {
    return new Promise(function (resolve, reject) {
        // create new client
        const client = new MongoClient(uri, { useNewUrlParser: true });
        // connect to mongodb server
        client.connect(err => {
            if (err)
                return reject(err);
            console.log("connected!");
            // select collection
            const collection = client.db("party_management").collection("parties");

            // query
            line = {}
            line.party_name = party_name
            line.admin_id = user

            collection.find(line).limit(1).count((err, result) => {
                if (result == 0) resolve(false);
                else resolve(true);

            });
            client.close();
        });

    })


}
module.exports.isParticipant = function (party_name, user) {
    return new Promise(function (resolve, reject) {
        // create new client
        const client = new MongoClient(uri, { useNewUrlParser: true });
        // connect to mongodb server
        client.connect(err => {
            if (err)
                return reject(err);
            console.log("connected!");
            // select collection
            const collection = client.db("party_management").collection("parties");

            // query
            line = {}
            line.party_name = party_name

            collection.find(line).limit(1).toArray((err, result) => {
                l = result[0].user_list.length
                for (let i = 0; i < l; i++) {
                    if (result[0].user_list[i] == user)
                        resolve(true)
                }
                resolve(false);

            });
            client.close();
        });

    })


}
module.exports.addParty = function (name, admin) {
    return new Promise(function (resolve, reject) {
        checkUniquePartyName(name).then((bool) => {
            if (bool) {
                const client = new MongoClient(uri, { useNewUrlParser: true });
                client.connect(err => {
                    const collection = client.db("party_management").collection("parties");
                    // perform actions on the collection object
                    if (err)
                        reject(err)
                    line = {}

                    line.party_name = name
                    line.admin_id = admin
                    line.user_list = []
                    line.song_list = []
                    console.log("adding line" + line)
                    collection.insertOne(line, function (err, result) {
                        if (err)
                            reject(err);
                        else
                            resolve(true);
                    });
                    client.close();
                });


            }
            else resolve(false)

        })



    });
}
module.exports.deleteParty = function (name, user) {
    return new Promise(function (resolve, reject) {

        const client = new MongoClient(uri, { useNewUrlParser: true });
        client.connect(err => {
            const collection = client.db("party_management").collection("parties");
            // perform actions on the collection object
            if (err)
                reject(err)
            line = {}

            line.party_name = name

            console.log("Deleting code from db")
            collection.deleteMany(line, (err, collection) => {
                if (err) reject(false)
                else resolve(true)
                client.close();
            });
        });


    });

}
module.exports.addUser = function (partyName, userName, userWhoAsks) {
    return new Promise(function (resolve, reject) {


        const client = new MongoClient(uri, { useNewUrlParser: true });
        client.connect(err => {
            const collection = client.db("party_management").collection("parties");
            // perform actions on the collection object
            if (err)
                reject(err)
            line = {}

            line.party_name = partyName
            console.log("adding user:" + userName + " to party:" + partyName)
            collection.updateOne(line, { $addToSet: { 'user_list': userName } }, function (err, result) {
                if (err)
                    reject(false);
                else
                    resolve(true);
            });
            client.close();
        });


    });

}
module.exports.deleteUser = function (partyName, userName, userWhoAsks) {

    return new Promise(function (resolve, reject) {


        const client = new MongoClient(uri, { useNewUrlParser: true });
        client.connect(err => {
            const collection = client.db("party_management").collection("parties");
            // perform actions on the collection object
            if (err)
                reject(err)
            line = {}

            line.party_name = partyName
            console.log("deleting" + line)
            collection.updateOne(line, { $pull: { 'user_list': userName } }, function (err, result) {
                if (err)
                    reject(false);
                else
                    resolve(true);
            });
            client.close();
        });


    });
}
function addSongToParties(partyName, title) {
    return new Promise(function (resolve, reject) {


        const client = new MongoClient(uri, { useNewUrlParser: true });
        client.connect(err => {
            const collection = client.db("party_management").collection("parties");
            // perform actions on the collection object
            if (err)
                reject(err)
            line = {}

            line.party_name = partyName
            let song_obj = { "song_id": title, "vote_count": 0 }
            console.log("adding song" + song_obj)
            collection.updateOne(line, { $addToSet: { 'song_list': song_obj } }, function (err, result) {
                if (err)
                    reject(false);
                else
                    resolve(true);
            });
            client.close();
        });


    });

}
function addSongToSongs(artist, title) {
    return new Promise(function (resolve, reject) {


        const client = new MongoClient(uri, { useNewUrlParser: true });
        client.connect(err => {
            const collection = client.db("party_management").collection("songs");
            // perform actions on the collection object
            if (err)
                reject(err)
            line = {}

            line.artist = artist
            line.title = title
            console.log("adding line" + line)
            collection.insertOne(line, function (err, result) {
                if (err)
                    reject(err);
                else
                    resolve(true);
            });
            client.close();
        });


    });


}
module.exports.addSong = function (artist, title, party) {
    return new Promise(function (resolve, reject) {
        addSongToSongs(artist, title).then((bool) => {
            if (bool) {
                addSongToParties(party, title).then((bool2) => {
                    if (bool2)
                        resolve(true)
                    else
                        reject(false)
                }).catch((err) => setImmediate(() => { console.log(err); reject(false) }));

            }
            else reject(false);
        }).catch((err) => setImmediate(() => { console.log(err); reject(false) }));


    });

}
module.exports.voteSong = function (song_id, user_id, party_id) {
    return new Promise(function (resolve, reject) {


        const client = new MongoClient(uri, { useNewUrlParser: true });
        client.connect(err => {
            const collection = client.db("party_management").collection("parties");
            // perform actions on the collection object
            if (err)
                reject(err)

            console.log("adding line" + line)
            collection.updateOne({ "party_name": party_id, "song_list.song_id": song_id }, { $inc: { 'song_list.$.vote_count': 1 } }, function (err, result) {
                if (err)
                    reject(false);
                else
                    resolve(true);
            });
            client.close();
        });


    });

}
module.exports.getSongList = function (party_name) {
    return new Promise(function (resolve, reject) {


        const client = new MongoClient(uri, { useNewUrlParser: true });
        client.connect(err => {
            // perform actions on the collection object
            if (err)
                reject(err)
            console.log("connected");
            const collection = client.db("party_management").collection("parties");
           
            line={}
            line.party_name = party_name
            console.log(party_name)

            console.log("Getting list for party:"+JSON.stringify(line))
            collection.find(line).limit(1).toArray((err, result) => {
                
                
                if(err)
                    reject(err)
                if (result[0]) {
                    console.log(result[0])
                    songListObj = {}
                    songListObj.party_id = result[0].party_name
                    songListObj.user_list = []

                    l = result[0].user_list.length

                    for (let i = 0; i < l; i++) {
                        userObj = {}
                        userObj.user_id = result[0].user_list[i]
                        userObj.is_dancing = false
                        songListObj.user_list.push(userObj)
                    }

                    songListObj.song_list = []
                    l = result[0].song_list.length

                    for (let i = 0; i < l; i++) {
                        songObj = {}
                        songObj.song_id = result[0].song_list[i].song_id
                        songObj.vote_count = result[0].song_list[i].vote_count

                        songListObj.song_list.push(songObj)
                    }

                    resolve(songListObj)
                }
                else
                    resolve(false);

            });
            client.close();

        });


    })

}