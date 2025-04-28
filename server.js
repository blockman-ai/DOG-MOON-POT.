const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const potPath = path.join(__dirname, 'data/pot.json');
const entriesPath = path.join(__dirname, 'data/entries.json');
const winnersPath = path.join(__dirname, 'data/winners.json');

// Get current pot
app.get('/pot', (req, res) => {
  const pot = JSON.parse(fs.readFileSync(potPath));
  res.json(pot);
});

// Get current entries
app.get('/entries', (req, res) => {
  const entries = JSON.parse(fs.readFileSync(entriesPath));
  res.json(entries);
});

// Enter the pot
app.post('/enter', (req, res) => {
  const { wallet, amount } = req.body;
  const pot = JSON.parse(fs.readFileSync(potPath));
  const entries = JSON.parse(fs.readFileSync(entriesPath));

  entries.push({ wallet, amount });
  pot.total += amount;

  fs.writeFileSync(entriesPath, JSON.stringify(entries, null, 2));
  fs.writeFileSync(potPath, JSON.stringify(pot, null, 2));

  res.json({ success: true });
});

// Draw a winner
app.post('/draw', (req, res) => {
  const entries = JSON.parse(fs.readFileSync(entriesPath));
  const pot = JSON.parse(fs.readFileSync(potPath));

  if (entries.length === 0) {
    return res.json({ success: false, message: "No entries." });
  }

  const winner = entries[Math.floor(Math.random() * entries.length)];
  const winners = JSON.parse(fs.readFileSync(winnersPath));

  winners.push({ wallet: winner.wallet, amountWon: pot.total });
  fs.writeFileSync(winnersPath, JSON.stringify(winners, null, 2));

  // Reset pot and entries
  fs.writeFileSync(potPath, JSON.stringify({ total: 0 }, null, 2));
  fs.writeFileSync(entriesPath, JSON.stringify([], null, 2));

  res.json({ success: true, winner });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
