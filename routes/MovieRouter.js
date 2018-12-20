import path from 'path'
import axios from 'axios'

export class MovieRouter {
    constructor(app, redisInstance) {
        let moviesList = [];
        app.get('/', function (req, res) {
            redisInstance.get('MovieData', function (error, result) {
                    if (result == null) {
                        axios.get("http://www.omdbapi.com/?apikey=3f216e5f&s=marvel&y=2018&page=1").then((response) => {
                            return response
                        }).then((response) => {
                            response.data.Search.forEach(function (item) {
                                axios.get("http://www.omdbapi.com/?apikey=3f216e5f&i=" + item.imdbID).then((detailsResponse) => {

                                    item.details = detailsResponse.data
                                    console.log(item)
                                    res.send(item);
                                    return;
                                    moviesList.push({'movie': item})
                                    console.log()
                                });
                            })
                            return moviesList
                            /*setTimeout(()=>{
                                console.log('dd')
                            },1000)*/
                        }).then(() => {
                            console.log('df')
                            const chunks = [];
                            for (const cols = Object.entries(moviesList); cols.length;) {
                                chunks.push(cols.splice(0, chunk_size).reduce((o, [k, v]) => (o[k] = v, o), {}));
                            }
                            return chunks;
                        }).then((chunks) => {
                            redisInstance.set('MovieData', JSON.stringify(moviesList), redis.print);
                            redisInstance.set('MovieDataChunked', JSON.stringify(chunks), redis.print);
                            redisInstance.get('MovieDataChunked', function (err, resu) {
                                //res.render(path.join(__dirname, '../views/home'), {moviesData: JSON.parse(resu)});
                            })
                            moviesList = [];
                        })
                    }
                    redisInstance.get('MovieDataChunked', (err, resu) => {
                        //res.render(path.join(__dirname, '../views/home'), {moviesData: JSON.parse(resu)});
                    })
                }
            );
        });
        //route for view one item
        app.get('/item/:id', function (req, res) {
            const id = req.params.id
            redisInstance.get('MovieData', function (err, resu) {
                JSON.parse(resu).forEach((chunk) => {
                    if (chunk.movie.imdbID == id) {
                        res.render(__dirname + '/views/item_show', {oneMovieData: chunk});
                    }
                })
            })
        })
    }
}