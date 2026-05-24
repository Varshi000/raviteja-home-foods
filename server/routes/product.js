// server/routes/product.js
const express = require('express');
const router = express.Router();

// In-memory product list for demo purposes
let products = [
  { id: 1, name: 'Sweets', price: 5.99, description: 'Delicious sweets', image: '/assets/sweets.jpg' },
  { id: 2, name: 'Savory Snacks', price: 3.49, description: 'Crispy snacks', image: '/assets/snacks.jpg' },
];

router.get('/', (req, res) => {
  res.json(products);
});

module.exports = router;
