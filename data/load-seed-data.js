/* eslint-disable indent */
const client = require('../lib/client');
// import our seed data:
const posts = require('./posts.js');
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
      posts.map(post => {
        return client.query(`
                    INSERT INTO posts (title, body, image, vote_score, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
          [post.title, post.body, post.image, post.vote_score, user.id]);
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
