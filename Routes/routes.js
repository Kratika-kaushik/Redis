const axios = require('axios')
const mongoose = require('mongoose')
const DEFAULT_EXPIRATION = 3600
require("../utils/redis")

const Student = require("../Schema/schema")
function userRoute(fastify, options, done) {

    fastify.get('/', async (req, res) => {
        res.send("Server is running")
    })

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

    fastify.get('/users/:username', async (req, res) => {

        const username = req.params.username

        const user = await redisClient.get(`users/${username}`)
        if (user != null) {
            console.log("Cache Hit")
            res.send(JSON.parse(user))
        } else {
            console.log("cache miss")
            const { data } = await axios.get(`https://api.github.com/users/${username}`)
            var dataa = { login: data.login, repos: data.public_repos }
            redisClient.setEx(`users/${username}`, DEFAULT_EXPIRATION, JSON.stringify(dataa))
            res.send(dataa)
        }


    })

    fastify.get('/students', async (req, res) => {
        const students = await Student.find().cache();

        res.send(students);
    });

    fastify.post('/student-add', async (req, res) => {
        const { first_name, last_name, classs, age } = req.body;

        if (!first_name || !last_name || !age || !classs) {
            return res.status(400).send('Missing title, author, or content')
        }

        const student = new Student({
            first_name,
            last_name,
            classs,
            age
        });

        try {
            await student.save();
            res.send(student);
        } catch (err) {
            res.status(400).send(err.message);
        }
    });
    done()
}
module.exports = userRoute