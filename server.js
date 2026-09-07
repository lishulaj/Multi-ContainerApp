require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const Todo = require('./models/Todo');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todo_db';

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Health Checks
app.get('/live', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.get('/healthz', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.status(200).json({ status: 'UP', database: 'connected' });
  }
  return res.status(503).json({ status: 'DOWN', database: 'disconnected' });
});

// Routes
app.get('/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve todos.' });
  }
});

app.post('/todos', async (req, res) => {
  try {
    const { title, completed } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required.' });
    }
    const newTodo = await Todo.create({ title: title.trim(), completed });
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo.' });
  }
});

app.get('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found.' });
    res.json(todo);
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(400).json({ error: 'Invalid ID format.' });
    res.status(500).json({ error: 'Failed to retrieve todo.' });
  }
});

app.put('/todos/:id', async (req, res) => {
  try {
    const { title, completed } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (completed !== undefined) updates.completed = completed;

    const todo = await Todo.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!todo) return res.status(404).json({ error: 'Todo not found.' });
    res.json(todo);
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(400).json({ error: 'Invalid ID format.' });
    res.status(500).json({ error: 'Failed to update todo.' });
  }
});

app.delete('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found.' });
    res.json({ message: 'Todo deleted successfully.' });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(400).json({ error: 'Invalid ID format.' });
    res.status(500).json({ error: 'Failed to delete todo.' });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});