import axios from 'axios'
import path from "path";
export class MoviesContoller {
    async getDataFromLinks(cb){
        this.cb=cb;
        let _this=this;
        let moviesList=[]
        let iterator=1;
        const response = await axios.get("http://www.omdbapi.com/?apikey=3f216e5f&s=marvel&y=2018&page=1");
        response.data.Search.forEach(async function (item) {
                const detailsResponse=await axios.get("http://www.omdbapi.com/?apikey=3f216e5f&i=" + item.imdbID);
                item.details = detailsResponse.data;
                moviesList.push({'movie': item})
                if (iterator == response.data.Search.length){
                    _this.cb(moviesList);
                }
                iterator++;
        });

    }
    chunckMovieData(moviesList){
        const chunks = []; const chunkSize=3
        //split the whole data to 3 objects for each chunk
        for (const cols = Object.entries(moviesList); cols.length;) {
            chunks.push(cols.splice(0, chunkSize).reduce((o, [k, v]) => (o[k] = v, o), {}));
        }
        return chunks;
    }
    //function for searching for item
    searchForSpecifcItem(id,movieData,cb){
        const _this=this
        _this.cb=cb;
        //loop and return matche data
        JSON.parse(movieData).forEach((chunk) => {
            if (chunk.movie.imdbID == id) {
                  _this.cb(chunk)
            }
        })
    }
}