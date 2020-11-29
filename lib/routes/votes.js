/* eslint-disable space-before-function-paren */
/* eslint-disable new-cap */
const { Router } = require('express');
const pool = require('../pool');

const ensureAuth = require('../auth/ensure-auth.js');

module.exports = Router()
    .get('/', ensureAuth, async (req, res) => {
        try {
            const data = await pool.query(`
                SELECT * FROM posts_vote_history
                WHERE owner_id = $1
            `, [req.userId]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    })

    .post('/', ensureAuth, async (req, res) => {
        const { post_id, vote } = req.body;
        try {
            const data = await pool.query(`
                INSERT INTO posts_vote_history (owner_id, post_id, vote)
                VALUES ($1, $2, $3)
                RETURNING *;
            `, [req.userId, post_id, vote]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    })

    .put('/:id', ensureAuth, async (req, res) => {

        const { vote, post_id } = req.body;
        try {
            const data = await pool.query(`
                UPDATE posts_vote_history
                SET vote = $1
                WHERE post_id = $2
                AND owner_id = $3
                AND id = $4
            `, [vote, post_id, req.userId, req.params.id]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    });
