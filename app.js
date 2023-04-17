require('dotenv').config();
const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:
const app = express();
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});
// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body['access_token']))
  .catch(error => console.log('Something went wrong when retrieving an access token', error));

// Route for the homepage with the form
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

// Route for rendering the artist search form shen clicking on the button
app.get('/search', (req, res) => {
  res.render('search-artist.hbs');
});

// Route for handling artist search form submission
app.get("/search-artist", (req, res, next) => {
  const artist = req.query.artist;
  console.log(artist);
  spotifyApi
    .searchArtists(artist)
    .then(data => {
      console.log(data);
      res.render('search-artist', { artist: data.body.artists.items });
      console.log('The received data from the API:', data.body.artists.items);
    })
    .catch(err => {
      console.log('The error while searching artists occurred: ', err);
      res.render('error', { message: 'An error occurred while searching for artists' });
    });
})

//Route for rendering the albums of an artist
app.get('/albums/:artistId', (req, res, next) => {
  const { artistId } = req.params
  spotifyApi.getArtistAlbums(artistId).then(data => {
//    console.log('Artist albums', data.body.items);
    console.log(data.body.items[0].artists[0].name)
    res.render('albums', { 
      albums: data.body.items, 
      artist: data.body.items[0].artists[0].name
    })
  })
})


//Route for rendering the tracks of an album
app.get('/tracks/:artistId', (req, res, next) => {
  const { artistId } = req.params
  spotifyApi.getAlbumTracks(artistId).then(data => {
    console.log('Artist tracks', data.body.items);
    res.render('tracks', { tracks: data.body.items })
  })
})

// Start the server
app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
