const client = require('../lib/client');
// import our seed data:
const dogs = require('./dogs.js');
const breeds = require('./breeds.js')
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
          [user.email, user.hash]);
      })
    );

    const user = users[0].rows[0];

    await Promise.all(
      breeds.map(breed => {
        return client.query(`
                      INSERT INTO breeds (name)
                      VALUES ($1)
                      RETURNING *;
                  `,
          [breed.name]);
      })
    );

    await Promise.all(
      dogs.map(dog => {
        return client.query(`
                    INSERT INTO dogs (name, age, weight, good_boy, breed_id, img_src, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
          [dog.name, dog.age, dog.weight, dog.good_boy, dog.breed_id, dog.img_src, user.id]);
      })
    );


    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}
