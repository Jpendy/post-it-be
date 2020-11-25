/* eslint-disable space-before-function-paren */
/* eslint-disable new-cap */
const { Router } = require('express');
const client = require('../client');

const ensureAuth = require('../auth/ensure-auth.js');

module.exports = Router()
    .get('/', async (req, res) => {
        try {
            const data = await client.query(`
            SELECT comments.*, users.email as comment_creator from comments
            JOIN users
            ON users.id = comments.owner_id
            WHERE comments.post_id = $1
            `, [req.post_id]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    })

    .post('/', ensureAuth, async (req, res) => {
        const { post_id, title, body } = req.body;
        try {
            const data = await client.query(`
            INSERT INTO comments (owner_id, post_id, title, body, vote_score)
            values ($1, $2, $3, $4, $5)
            RETURNING *;
            `, [req.userId, post_id, title, body, 0]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    });