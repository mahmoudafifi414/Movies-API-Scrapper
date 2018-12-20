import express from 'express'
import {MovieRouter} from './routes/MovieRouter'
import redis from 'redis'

const app = express();
var Request = require("request");
//use ejs as view template
app.set('view engine', 'ejs');
//use redis to persist
const client = redis.createClient();
//use movie router
const movieRouter = new MovieRouter(app, client)
//connect the server on port 3000
app.listen('3000', function () {
    console.log('connected');
})
//connect redis server
client.on('connect', function () {
    console.log('Redis client connected');
});