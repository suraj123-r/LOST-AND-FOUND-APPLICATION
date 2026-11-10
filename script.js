const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/items', (req, res) => {
  try {
    const items = db.getAll(req.query);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/items/:id', (req, res) => {
  const item = db.getById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

app.post('/api/items', (req, res) => {
  const { type, title, contact_name } = req.body;

  if (!type || !title || !contact_name) {
    return res.status(400).json({ error: 'type, title and contact_name are required' });
  }
  if (!['lost', 'found'].includes(type)) {
    return res.status(400).json({ error: 'type must be "lost" or "found"' });
  }

  const newItem = db.create(req.body);
  res.status(201).json(newItem);
});

app.put('/api/items/:id', (req, res) => {
  const updated = db.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Item not found' });
  res.json(updated);
});

app.delete('/api/items/:id', (req, res) => {
  const ok = db.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Item not found' });
  res.json({ message: 'Item deleted' });
});

app.listen(PORT, () => {
  console.log(`Lost and Found app running at http://localhost:${PORT}`);
});