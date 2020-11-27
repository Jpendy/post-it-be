/* eslint-disable space-before-function-paren */
/* eslint-disable new-cap */
const { Router } = require('express');
const pool = require('../pool');

const ensureAuth = require('../auth/ensure-auth.js');

module.exports = Router()
    .get('/', async (req, res) => {
        try {
            const data = await pool.query(`
            SELECT posts.*, users.email as post_creator from posts
            JOIN users
            ON users.id = posts.owner_id
            `);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    })

    .get('/user-posts/:userId', async (req, res) => {
        try {
            const data = await pool.query(`
            SELECT posts.*, users.email as post_creator from posts
            JOIN users
            ON users.id = posts.owner_id
            WHERE posts.owner_id = $1
            `, [req.params.userId]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    })

    .get('/:id', async (req, res) => {
        try {
            const data = await pool.query(`
            SELECT posts.*, users.email as post_creator from posts
            JOIN users
            ON users.id = posts.owner_id
            WHERE posts.id = $1
            `, [req.params.id]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    })

    .post('/', ensureAuth, async (req, res) => {
        const { title, image, body, video, category } = req.body;
        try {
            const data = await pool.query(`
            INSERT INTO posts (title, image, body, video, category, vote_score, owner_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
            `, [title, image, body, video, category, 0, req.userId]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    })

    .put('/vote/:id', ensureAuth, async (req, res) => {
        try {
            const data = await pool.query(`
            UPDATE posts
            SET vote_score = vote_score + $2
            WHERE id = $1
            RETURNING *;
            `, [req.params.id, req.body.vote]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    })

    .delete('/:id', ensureAuth, async (req, res) => {
        try {
            const data = await pool.query(`
            DELETE from posts
            WHERE id = $1
            AND owner_id = $2
            RETURNING *;
            `, [req.params.id, req.userId]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    });

