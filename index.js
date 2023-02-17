require('dotenv').config();
const { MongoClient } = require('mongodb')
const mongoose = require('mongoose')
const url = process.env.DATABASE
const fastify = require('fastify')({ logger: true })
fastify.register(require('./Routes/routes'))
require('./Schema/schema');
require('./utils/redis');
const PORT = process.env.PORT || 3000;

//const client = new MongoClient(url)
async function run() {
        try {
            mongoose.set("strictQuery", false)
            mongoose.connect(url, { useNewUrlParser: true })
            console.log("connected to mongodb");
        } catch (error) {
            console.error(error);
        }
    
}
run();



fastify.listen({ port: PORT }, (err, address) => {
    if (err) throw err
    // Server is now listening on ${address}
})