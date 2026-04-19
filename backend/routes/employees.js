const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// GET single employee by ID  ← YEH नया add करना है
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    const totalEmployees = employees.length;
    const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
    const averageSalary = totalEmployees > 0 ? (totalSalary / totalEmployees).toFixed(2) : 0;

    res.json({
      employees,
      analytics: {
        totalEmployees,
        averageSalary: parseFloat(averageSalary),
        totalSalary
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add employee
router.post('/', async (req, res) => {
  try {
    const { name, salary, experience, city } = req.body;

    if (!name || !salary || !experience || !city) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (salary < 0 || experience < 0) {
      return res.status(400).json({ message: 'Salary and experience must be positive' });
    }

    const employee = new Employee({ name, salary, experience, city });
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update employee
router.put('/:id', async (req, res) => {
  try {
    const { name, salary, experience, city } = req.body;

    if (!name || !salary || !experience || !city) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (salary < 0 || experience < 0) {
      return res.status(400).json({ message: 'Salary and experience must be positive' });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { name, salary, experience, city },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;