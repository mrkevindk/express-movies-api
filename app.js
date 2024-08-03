const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const app = express()

app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
  }
}
initializeDBAndServer()

//GET Movie's List API

app.get('/movies/', async (request, response) => {
  try {
    const getAllMovieNamesQuery = `
      SELECT 
        movie_name AS movieName
      FROM 
        movie
      ORDER BY 
        movie_name;`
    const dbResponse = await db.all(getAllMovieNamesQuery)
    response.send(dbResponse)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    response.status(500).send('Internal Server Error')
  }
})

//POST Movie Details API

app.post('/movies/', async (request, response) => {
  const movieInfo = request.body
  const {directorId, movieName, leadActor} = movieInfo
  const addQueryDetails = `
  INSERT INTO 
  movie (director_id, movie_name, lead_actor)
  VALUES
    (${directorId},
    '${movieName}',
    '${leadActor}');`
  await db.run(addQueryDetails)
  response.send('Movie Successfully Added')
})

//GET movie_id API

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  SELECT 
    movie_id AS movieId,
    director_id AS directorId,
    movie_name AS movieName,
    lead_actor AS leadActor
  FROM 
    movie
  WHERE 
    movie_id = ${movieId};`
  const dbRespnse = await db.get(getMovieQuery)
  response.send(dbRespnse)
})

//PUT Movie_Details API

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovieQuery = `
  UPDATE
    movie
  SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  WHERE
    movie_id = ${movieId};`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//DELETE movie API

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE 
  FROM 
    movie
  WHERE
    movie_id = ${movieId};`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//GET Directors List API

app.get('/directors/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorsQuery = `
  SELECT 
    director_id AS directorId,
    director_name AS directorName
  FROM 
    director
  ORDER BY
    director_id;`
  const dbResponse = await db.all(getDirectorsQuery)
  response.send(dbResponse)
})

//GET Director API

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorIdMovieQuery = `
  SELECT 
    movie_name AS movieName
  FROM 
    movie
  WHERE 
    director_id = ${directorId};`
  const dbResponse = await db.all(getDirectorIdMovieQuery)
  response.send(dbResponse)
})

module.exports = app
