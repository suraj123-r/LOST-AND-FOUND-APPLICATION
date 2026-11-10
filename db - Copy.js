const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'lostfound.json');

// Create the data file if it doesn't exist yet
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ items: [], nextId: 1 }, null, 2));
}

function readData() {
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function getAll({ type, category, status, search } = {}) {
  let items = readData().items;

  if (type) items = items.filter(i => i.type === type);
  if (category) items = items.filter(i => i.category === category);
  if (status) items = items.filter(i => i.status === status);
  if (search) {
    const term = search.toLowerCase();
    items = items.filter(i =>
      (i.title || '').toLowerCase().includes(term) ||
      (i.description || '').toLowerCase().includes(term) ||
      (i.location || '').toLowerCase().includes(term)
    );
  }

  return items.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getById(id) {
  const data = readData();
  return data.items.find(i => i.id === Number(id));
}

function create(item) {
  const data = readData();
  const newItem = {
    id: data.nextId,
    type: item.type,
    title: item.title,
    description: item.description || '',
    category: item.category || '',
    location: item.location || '',
    item_date: item.item_date || '',
    contact_name: item.contact_name,
    contact_email: item.contact_email || '',
    contact_phone: item.contact_phone || '',
    status: 'open',
    created_at: new Date().toISOString()
  };
  data.items.push(newItem);
  data.nextId += 1;
  writeData(data);
  return newItem;
}

function update(id, fields) {
  const data = readData();
  const idx = data.items.findIndex(i => i.id === Number(id));
  if (idx === -1) return null;

  data.items[idx] = { ...data.items[idx], ...fields };
  writeData(data);
  return data.items[idx];
}

function remove(id) {
  const data = readData();
  const before = data.items.length;
  data.items = data.items.filter(i => i.id !== Number(id));
  writeData(data);
  return data.items.length < before;
}

module.exports = { getAll, getById, create, update, remove };