const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

//let client;
const client = redis.createClient();
(async () => {
    await client.connect();
})();

console.log("Connecting to the Redis");

client.on("ready", () => {
    console.log("Connected!");
});

//Get the rsponse in promises
client.hGet = util.promisify(client.hGet);

// create reference for .exec. used on the Query objects. It allows us to execute the query operation to get the resulted data
const exec = mongoose.Query.prototype.exec;

// create new cache function on prototype
mongoose.Query.prototype.cache = function (time = 60 * 60) {
    this.cacheMe = true;
    // we will talk about cacheTime later;
    this.cacheTime = time;
    return this;
}

mongoose.Query.prototype.exec = async function () {
    const collectionName = this.mongooseCollection.name;
    console.log(collectionName)
    if (this.cacheMe) {
        // You can't insert json straight to redis needs to be a string 

        const key = JSON.stringify({
            ...this.getOptions(),
            collectionName: collectionName, op: this.op
        });
        const cachedResults = await client.HGET(collectionName, key);

        // getOptions() returns the query and this.op is the method which in our case is "find" 

        if (cachedResults) {
            // if you found cached results return it; 
            const result = JSON.parse(cachedResults);
            return result;
        }
        //else 
        // get results from Database then cache it
        const result = await exec.apply(this, arguments);

        client.HSET(collectionName, key, JSON.stringify(result), "EX", this.cacheTime);
        //result we got from database
        return result;
    }
    clearCachedData(collectionName, this.op);
    return exec.apply(this, arguments);
}


async function clearCachedData(collectionName, op) {
    const allowedCacheOps = ["find", "findById", "findOne"];
    // if operation is insert or delete or update for any collection that exists and has cached values 
    // delete its childern
    if (!allowedCacheOps.includes(op) && await redis.EXISTS(collectionName)) {
        redis.DEL(collectionName);
    }
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
}