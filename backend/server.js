const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const employeeRoutes = require('./routes/employees');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(' MongoDB Connected'))
  .catch(err => console.error(' MongoDB Connection Error:', err));

// Routes
app.use('/api/employees', employeeRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Employee Salary Management API is running!' });
});

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});