const fastify = require('fastify')({ logger: true })
const redis = require('redis')
const axios = require('axios')

let redisClient;

(async () => {
    redisClient = redis.createClient();

    redisClient.on("error", (error) => console.error(`Error : ${error}`));

    await redisClient.connect();
})();

const DEFAULT_EXPIRATION = 3600



fastify.get('/photos', async (req, res) => {

    const albumId = req.query.albumId
    const photos = await redisClient.get(`photos?albumId=${albumId}`)
    if (photos != null) {
        console.log("Cache Hit")
        res.send(JSON.parse(photos))
    } else {
        console.log("cache miss")
        const { data } = await axios.get("https://jsonplaceholder.typicode.com/photos", { params: { albumId } })
        redisClient.setEx(`photos?albumId=${albumId}`, DEFAULT_EXPIRATION, JSON.stringify(data))
        res.send(data)
    }

})
redisClient.on('connect', function () {
    console.log('Connected!');
});
fastify.listen({ port: 3000 }, (err, address) => {
    if (err) throw err
    // Server is now listening on ${address}
})