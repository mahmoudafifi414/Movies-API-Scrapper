import path from 'path'

import {MoviesContoller} from "../Controllers/MoviesContoller";

export class MovieRouter {
    constructor(app, redisInstance) {
        const moviesController=new MoviesContoller();
        let moviesList = [];
        //route for home
        app.get('/', (req, res)=> {
            //check existence movieData in redis
            redisInstance.exists('MovieData', async (err, result) =>{
                //if not exist
                if (result !== 1) {
                    //get master data
                    const respon = moviesController.getDataFromLinks(async (result)=> {
                        //get child details data
                        const chunkedData = await moviesController.chunckMovieData(result);
                        //fill redis with full object with both all and chunked data
                        redisInstance.set('MovieData', JSON.stringify(result), redisInstance.print);
                        redisInstance.set('MovieDataChunked', JSON.stringify(chunkedData), redisInstance.print);
                        redisInstance.get('MovieDataChunked', (err, resu)=> {
                            res.render(path.join(__dirname, '../Views/home'), {moviesData: JSON.parse(resu)});
                        })

                    });
                }
                //if movie data exist then show directly
                redisInstance.get('MovieDataChunked', (err, resu) => {
                    res.render(path.join(__dirname, '../Views/home'), {moviesData: JSON.parse(resu)});
                })
            });
        });
        //route for view one item
        app.get('/item/:id', (req, res) =>{
            const id = req.params.id
            redisInstance.get('MovieData', (err, result) =>{
                 //search for this item with id and show this item
                const item=moviesController.searchForSpecifcItem(id,result,(chunckedItem)=>{
                    res.render(path.join(__dirname, '../Views/item_show'),{oneMovieData: chunckedItem});
                })
            })
        })
    }
}