// helper to initialize DB quickly (same logic as utils/db init)
require('dotenv').config();
const { initDb } = require('../utils/db');

initDb().then(()=> console.log('DB init done')).catch(console.error);