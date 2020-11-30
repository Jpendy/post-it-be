/* eslint-disable space-before-function-paren */
/* eslint-disable new-cap */
const { Router } = require('express');
const pool = require('../pool');

const ensureAuth = require('../auth/ensure-auth.js');

const pageSize = 20;

module.exports = Router()
    .get('/', async (req, res) => {
        const { page = 1, orderBy = 'posts.id' } = req.query;
        const offset = +page * pageSize - pageSize;

        try {
            const data = await pool.query(`
            SELECT posts.*, users.email as post_creator, boards.board_name as board, COUNT(comments.id) as comment_count from posts
            JOIN users
            ON users.id = posts.owner_id
			JOIN boards
			ON boards.id = posts.board_id
			LEFT JOIN comments
			ON comments.post_id = posts.id
			group by posts.id, post_creator, board
            order by ${orderBy} asc
            LIMIT $1 OFFSET $2;
            `, [pageSize, offset]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    })

    .get('/user-posts/:userId', async (req, res) => {
        try {
            const data = await pool.query(`
            SELECT posts.*, users.email as post_creator, boards.board_name as board, COUNT(comments.id) as comment_count from posts
            JOIN users
            ON users.id = posts.owner_id
			JOIN boards
			ON boards.id = posts.board_id
			LEFT JOIN comments
			ON comments.post_id = posts.id
			WHERE posts.owner_id = $1
			group by posts.id, post_creator, board
			order by posts.id desc
            `, [req.params.userId]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    })

    .get('/:id', async (req, res) => {
        try {
            const data = await pool.query(`
            SELECT posts.*, users.email as post_creator, boards.board_name as board from posts
            JOIN users
            ON users.id = posts.owner_id
			JOIN boards
			ON boards.id = posts.board_id
            WHERE posts.id = $1
            `, [req.params.id]);

            res.json(data.rows);
        } catch (e) {

            res.status(500).json({ error: e.message });
        }
    })

    .post('/', ensureAuth, async (req, res) => {
        const { title, image, body, video, board_id } = req.body;
        try {
            const data = await pool.query(`
            INSERT INTO posts (title, image, body, video, board_id, vote_score, owner_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
            `, [title, image, body, video, board_id, 0, req.userId]);

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

