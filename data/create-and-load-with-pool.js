/* eslint-disable no-console */
/* eslint-disable indent */
const pool = require('../lib/pool');
const usersData = require('./users.js');

const { getEmoji } = require('../lib/emoji.js');
const posts = require('./posts');

// async/await needs to run in a function
run();

async function run() {

    try {
        // initiate connecting to db
        await pool.connect();

        //drop tables
        await pool.query(`
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS posts CASCADE;
        DROP TABLE IF EXISTS posts_vote_history;
        DROP TABLE IF EXISTS comments CASCADE;
        DROP TABLE IF EXISTS comments_vote_history;
    `);
        console.log(' drop tables complete', getEmoji(), getEmoji(), getEmoji());

        // run a query to create tables
        await pool.query(`
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

                CREATE TABLE comments_vote_history (
                    id serial PRIMARY KEY NOT NULL,
                    owner_id INTEGER NOT NULL REFERENCES users(id),
                    comment_id INTEGER NOT NULL REFERENCES comments(id),
                    vote INTEGER NOT NULL
                )
        `);
        console.log('create tables complete', getEmoji(), getEmoji(), getEmoji());

        //Seed tables
        const users = await Promise.all(
            usersData.map(user => {
                return pool.query(`
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
                return pool.query(`
                    INSERT INTO posts (title, body, image, category, vote_score, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
                    [post.title, post.body, post.image, post.category, post.vote_score, user.id]);
            })
        );
        console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());

    }
    catch (err) {
        // problem? let's see the error...
        console.log(err);
    }
    finally {
        // success or failure, need to close the db connection
        pool.end();
    }

}