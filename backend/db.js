const { Pool } = require('pg');

const pool = new Pool({
    user: 'dealbee_dev',
    host: '157.245.203.12',
    database: 'dealbee_dev',
    password: 'Pc+Wv4]PM.(kT8w@',
    port: 5432,
  })
  
module.exports = {
  query: (text, params, callback) => pool.query(text, params, callback),
  promiseQuery: (query, params) => pool.query(query, params),
};