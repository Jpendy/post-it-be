/* eslint-disable space-before-function-paren */
/* eslint-disable new-cap */
const { Router } = require('express');
const pool = require('../pool');

const ensureAuth = require('../auth/ensure-auth.js');

module.exports = Router()
    .get('/', async (req, res) => {
        try {
            const data = await pool.query(`
            SELECT boards.*, COUNT(posts.id) as post_count from boards
            LEFT JOIN posts
            ON boards.id = posts.board_id
            GROUP BY boards.id, boards.board_name
            `);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    });


