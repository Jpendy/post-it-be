/* eslint-disable no-console */
/* eslint-disable indent */
const pool = require('../lib/pool');
const usersData = require('./users.js');

const { getEmoji } = require('../lib/emoji.js');
const posts = require('./posts');
const boards = require('./boards');

// async/await needs to run in a function
run();

async function run() {

    try {
        // initiate connecting to db
        await pool.connect();

        //drop tables
        await pool.query(`
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS boards CASCADE;
        DROP TABLE IF EXISTS posts CASCADE;
        DROP TABLE IF EXISTS posts_vote_history;
        DROP TABLE IF EXISTS comments CASCADE;
        DROP TABLE IF EXISTS comments_vote_history;
    `);
        console.log(' drop tables complete', getEmoji(), getEmoji(), getEmoji());

        // run a query to create tables
        await pool.query(`
                CREATE TABLE users (
                    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                    email VARCHAR(256) NOT NULL,
                    hash VARCHAR(512) NOT NULL
                );           

                    CREATE TABLE boards (
                        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                        owner_id INTEGER NOT NULL REFERENCES users(id),
                        board_name TEXT NOT NULL,
                        board_color_1 TEXT,
                        board_color_2 TEXT,
                        board_color_3 TEXT
                );

                CREATE TABLE posts (
                    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                    board_id INTEGER NOT NULL REFERENCES boards(id),
                    vote_score INTEGER NOT NULL,
                    owner_id INTEGER NOT NULL REFERENCES users(id),
                    title VARCHAR(150) NOT NULL,
                    image TEXT,
                    body TEXT,
                    video TEXT
                );

                CREATE TABLE posts_vote_history (
                    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                    owner_id INTEGER NOT NULL REFERENCES users(id),
                    post_id INTEGER NOT NULL REFERENCES posts(id),
                    vote INTEGER NOT NULL
                );

                CREATE TABLE comments (
                    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                    owner_id INTEGER NOT NULL REFERENCES users(id),
                    post_id INTEGER NOT NULL REFERENCES posts(id),
                    title TEXT NOT NULL,
                    body TEXT NOT NULL,
                    vote_score INTEGER NOT NULL
                );

                CREATE TABLE comments_vote_history (
                    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
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
            boards.map(board => {
                return pool.query(`
                      INSERT INTO boards (board_name,  owner_id)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
                    [board.board_name, user.id]);
            })
        );

        await Promise.all(
            posts.map(post => {
                return pool.query(`
                    INSERT INTO posts (title, body, image, board_id, vote_score, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
                    [post.title, post.body, post.image, post.board_id, 0, user.id]);
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
