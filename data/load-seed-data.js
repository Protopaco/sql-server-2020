const client = require('../lib/client');
// import our seed data:
const dogs = require('./dogs.js');
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
      dogs.map(dog => {
        return client.query(`
                    INSERT INTO dogs (name, age, weight, good_boy, img_src, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
          [dog.name, dog.age, dog.weight, dog.good_boy, dog.img_src, user.id]);
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
