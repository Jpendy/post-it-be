/* eslint-disable space-before-function-paren */
/* eslint-disable new-cap */
const { Router } = require('express');
const pool = require('../pool');

const ensureAuth = require('../auth/ensure-auth.js');

module.exports = Router()
    .get('/', ensureAuth, async (req, res) => {
        try {
            const data = await pool.query(`
            SELECT * FROM comments_vote_history
            WHERE owner_id = $1
        `, [req.userId]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    })

    .post('/', ensureAuth, async (req, res) => {
        const { comment_id, vote } = req.body;
        try {
            const data = await pool.query(`
                INSERT INTO comments_vote_history (owner_id, comment_id, vote)
                VALUES ($1, $2, $3)
                RETURNING *;
            `, [req.userId, comment_id, vote]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    })

    .put('/:id', ensureAuth, async (req, res) => {

        const { vote, comment_id } = req.body;
        try {
            const data = await pool.query(`
                UPDATE comments_vote_history
                SET vote = $1
                WHERE comment_id = $2
                AND owner_id = $3
                AND id = $4
            `, [vote, comment_id, req.userId, req.params.id]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    });
