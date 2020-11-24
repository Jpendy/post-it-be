const pool = require('../lib/pool');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await pool.connect();

    await pool.query(`
            DROP TABLE IF EXISTS users CASCADE;
            DROP TABLE IF EXISTS animals;
        `);

    console.log(' drop tables complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    pool.end();
  }

}
