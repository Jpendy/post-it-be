/* eslint-disable no-console */
/* eslint-disable indent */
const client = require('../lib/client');
const { getEmoji } = require('../lib/emoji.js');

// async/await needs to run in a function
run();

async function run() {

  try {
    // initiate connecting to db
    await client.connect();

    // run a query to create tables
    await client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(256) NOT NULL,
                    hash VARCHAR(512) NOT NULL
                );           
                CREATE TABLE posts (
                    id SERIAL PRIMARY KEY NOT NULL,
                    title VARCHAR(150) NOT NULL,
                    image TEXT,
                    body TEXT NOT NULL,
                    video TEXT,
                    category TEXT NOT NULL,
                    vote_score INTEGER NOT NULL,
                    owner_id INTEGER NOT NULL REFERENCES users(id)
            );

            CREATE TABLE posts_vote_history (
              id serial PRIMARY KEY NOT NULL,
              owner_id INTEGER NOT NULL REFERENCES users(id),
              post_id INTEGER NOT NULL REFERENCES posts(id),
              vote INTEGER NOT NULL
            );

                CREATE TABLE comments (
                  id SERIAL PRIMARY KEY NOT NULL,
                  owner_id INTEGER NOT NULL REFERENCES users(id),
                  post_id INTEGER NOT NULL REFERENCES posts(id),
                  title TEXT NOT NULL,
                  body TEXT NOT NULL,
                  vote_score INTEGER NOT NULL
                );
        `);

    console.log('create tables complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    // problem? let's see the error...
    console.log(err);
  }
  finally {
    // success or failure, need to close the db connection
    client.end();
  }

}
