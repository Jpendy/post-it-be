/* eslint-disable space-before-function-paren */
/* eslint-disable new-cap */
const { Router } = require('express');
const pool = require('../pool');

const ensureAuth = require('../auth/ensure-auth.js');

module.exports = Router()
    .get('/:postId', async (req, res) => {
        try {
            const data = await pool.query(`
            SELECT comments.*, users.email as comment_creator from comments
            JOIN users
            ON users.id = comments.owner_id
            WHERE comments.post_id = $1
            `, [req.params.postId]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    })

    .post('/', ensureAuth, async (req, res) => {
        const { post_id, title, body } = req.body;
        try {
            const data = await pool.query(`
            INSERT INTO comments (owner_id, post_id, title, body, vote_score)
            values ($1, $2, $3, $4, $5)
            RETURNING *;
            `, [req.userId, post_id, title, body, 0]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    })

    .put('/vote/:id', ensureAuth, async (req, res) => {
        try {
            const data = await pool.query(`
            UPDATE comments
            SET vote_score = vote_score + $2
            WHERE id = $1
            RETURNING *;
            `, [req.params.id, req.body.vote]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    });
