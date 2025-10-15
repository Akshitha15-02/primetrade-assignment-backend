require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const { initDb } = require('./utils/db');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/v1/auth', authRoutes);
app.use('/v1/tasks', taskRoutes);

// simple health
app.get('/v1/health', (req, res) => res.json({status: 'ok', now: new Date()}));

const PORT = process.env.PORT || 4000;
initDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to initialize DB', err);
  process.exit(1);
});