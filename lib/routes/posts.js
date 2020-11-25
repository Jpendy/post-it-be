/* eslint-disable space-before-function-paren */
/* eslint-disable new-cap */
const { Router } = require('express');
const client = require('../client');

const ensureAuth = require('../auth/ensure-auth.js');

module.exports = Router()
    .get('/', async (req, res) => {
        try {
            const data = await client.query(`
            SELECT * from posts
            `);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    })

    .post('/', ensureAuth, async (req, res) => {
        const { title, image, body, video, category, vote_score } = req.body;
        try {
            const data = await client.query(`
            INSERT INTO posts (title, image, body, video, category, vote_score, owner_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
            `, [title, image, body, video, category, 0, req.userId]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    });

