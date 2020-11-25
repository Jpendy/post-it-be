/* eslint-disable keyword-spacing */
/* eslint-disable indent */
const client = require('../client.js');

module.exports = class FlexRequest {

    static async create(row) {
        const { table } = row;
        delete row.table;
        const columnsArray = Object.keys(row);

        const { rows } = await client.query(`
            INSERT INTO ${table} (${columnsArray})
            VALUES (${columnsArray.map((_, i) => `$${i + 1}`)})
            RETURNING *
        `, [...Object.values(row)]);

        return rows[0];
    }

    static async find({ table }) {
        const { rows } = await client.query(`
        SELECT * FROM ${table}
        `);

        return rows;
    }

    static async findById(id, { table }) {
        const { rows } = await client.query(`
        SELECT * FROM ${table} 
        WHERE id = $1
        `, [id]);

        if (!rows[0]) return null;
        return rows[0];
    }

    static async updateById(id, row) {
        const { table } = row;
        delete row.table;
        const columnsArray = Object.keys(row);

        const { rows } = await client.query(`
        UPDATE ${table}
        SET ${columnsArray.map((item, i) => `${item}=$${i + 1}`)}
        WHERE id=$${columnsArray.length + 1}
        RETURNING *
        `, [...Object.values(row), id]);

        if (!rows[0]) return null;
        return rows[0];
    }

    static async delete(id, { table }) {
        const { rows } = await client.query(`
        DELETE FROM ${table}
        WHERE id=$1
        RETURNING *
        `, [id]);

        if (!rows[0]) return null;
        return rows[0];
    }
};




