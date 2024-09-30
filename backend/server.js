const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'db',
  database: 'dietplans',
  password: 'password',
  port: 5432,
});

// Function to create the table if it doesn't exist
const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS diet_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        calories INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table created successfully or already exists');
  } catch (err) {
    console.error('Error creating table:', err);
  }
};

// Create a diet plan
app.post('/api/diet-plans', async (req, res) => {
  try {
    const { name, description, calories } = req.body;
    const result = await pool.query(
      'INSERT INTO diet_plans (name, description, calories) VALUES ($1, $2, $3) RETURNING *',
      [name, description, calories]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all diet plans
app.get('/api/diet-plans', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM diet_plans');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a diet plan
app.put('/api/diet-plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, calories } = req.body;
    const result = await pool.query(
      'UPDATE diet_plans SET name = $1, description = $2, calories = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, description, calories, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a diet plan
app.delete('/api/diet-plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM diet_plans WHERE id = $1', [id]);
    res.json({ message: 'Diet plan deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Initialize the database and start the server
createTable().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
