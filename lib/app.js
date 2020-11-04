const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/breeds', async (req, res) => {
  try {
    const data = await client.query(`
    SELECT *
     from breeds`);

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

// returns all data (get)
app.get('/dogs', async (req, res) => {
  try {
    const data = await client.query(`
    SELECT 
    dogs.id,
    dogs.name,
    dogs.age,
    dogs.weight,
    dogs.good_boy,
    breeds.name as breed
     dogs.img_src
    FROM dogs`,);

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

// returns item by id (get)
app.get('/dogs/:id', async (req, res) => {
  try {
    const dogId = req.params.id;
    const data = await client.query(` 
    SELECT 
    dogs.id,
    dogs.name,
    dogs.age,
    dogs.weight,
    dogs.good_boy,
    breeds.name as breed
    dogs.img_src
    FROM dogs 
    WHERE dogs.id=$1`, [dogId]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

// add item to database (post)
app.post('/dogs/', async (req, res) => {
  try {
    // recieve data from POST body
    const newDog = req.body;

    const data = await client.query(` INSERT INTO dogs (name, age, good_boy, weight, breed_id, img_src, owner_id ) Values ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,

      [newDog.name, newDog.age, newDog.good_boy, newDog.weight, newDog.breed_id, newDog.img_src, newDog.owner_id]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.put(`/dogs/:id`, async (req, res) => {

  try {

    // recieve data from PUT body
    const updatedDog = req.body;

    const data = await client.query(` 
          UPDATE dogs
          SET name = $1,
          age = $2,
          weight = $3,
          good_boy = $4,
          breed_id = $5,
          img_src = $6,
          owner_id = $7
          WHERE dogs.id = $8
          RETURNING *
  `,
      [updatedDog.name, updatedDog.age, updatedDog.weight, updatedDog.good_boy, updatedDog.breed_id, updatedDog.img_src, updatedDog.owner_id, req.params.id]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/dogs/:id', async (req, res) => {

  try {
    const dogId = req.params.id;
    const data = await client.query(`
    DELETE from dogs
    WHERE dogs.id=$1
    RETURNING *
    `,
      [dogId]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.use(require('./middleware/error'));

module.exports = app;
