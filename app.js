require('dotenv').config()

const express = require('express')
const hbs = require('hbs')
// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node')

const app = express();

app.set('view engine', 'hbs')
app.set('views', __dirname + '/views')
app.use(express.static(__dirname + '/public'))

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  });

  // Retrieve an access token
spotifyApi
.clientCredentialsGrant()
.then(data => spotifyApi.setAccessToken(data.body['access_token']))
.catch(error => console.log('Something went wrong when retrieving an access token', error))


// Our routes go here:

app.get('/', async (request, response, next)=>{
    response.render('home')
})

app.get('/artist-search', async (request, response, next)=>{
    console.log('/artist-search')
    const  {q} = request.query
    let dataForView
    try{ 
        let searchArtists = await spotifyApi.searchArtists(q)
        let artists = searchArtists.body.artists.items
        dataForView = {artists}
        console.log(artists[0])
        const simpleArtists = artists.map( (artist) => {
            url = (artist.images.length !==0) ? artist.images[0].url : ''
            const obj = {name: artist.name, url: url}
            return obj
        })
    }
    catch(error){console.log(error)}
    

    response.render('artist-search-results.hbs',dataForView)
})


app.get('/albums/:artistId', async (request, response, next) => {
    // .getArtistAlbums() code goes here
    const  {artistId} = request.params
    console.log(artistId)
    let albums
    try{
        const getArtistAlbumsResult = await spotifyApi.getArtistAlbums(artistId)
        console.log(getArtistAlbumsResult.body.items[0])
        albums = {albums: getArtistAlbumsResult.body.items}
    }
    catch(error){console.log(error)}
    response.render('albums', albums)
  });


  app.get('/tracks/:albumId', async (request, response, next) => {

    const  {albumId} = request.params
    console.log(albumId)
    let tracks
    try{
        const getAlbumTracksResult = await spotifyApi.getAlbumTracks(albumId)
        console.log(getAlbumTracksResult.body.items[0])
        tracks = {tracks: getAlbumTracksResult.body.items}
    }
    catch(error){console.log(error)}
    response.render('tracks', tracks)

  });
app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
