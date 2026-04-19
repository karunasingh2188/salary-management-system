// Global instance
let employeeManager;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    employeeManager = new EmployeeManager();
});

class EmployeeManager {
    constructor() {
        this.API_BASE = 'http://localhost:5000/api/employees';
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadEmployees();
    }

    bindEvents() {
        const form = document.getElementById('employeeForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        document.getElementById('clearBtn').addEventListener('click', () => this.clearForm());
    }

    async loadEmployees() {
        try {
            const response = await fetch(this.API_BASE);
            const data = await response.json();
            
            this.renderTable(data.employees);
            this.updateAnalytics(data.analytics);
            this.hideError();
        } catch (error) {
            this.showError('Failed to load employees. Make sure backend is running on port 5000!');
            console.error('Load employees error:', error);
        }
    }

    renderTable(employees) {
        const tbody = document.getElementById('employeesTableBody');
        tbody.innerHTML = '';

        employees.forEach(employee => {
            const row = this.createTableRow(employee);
            tbody.appendChild(row);
        });
    }

    createTableRow(employee) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.name}</td>
            <td>$${parseFloat(employee.salary).toLocaleString()}</td>
            <td>${employee.experience} yrs</td>
            <td>${employee.city}</td>
            <td>
                <button class="action-btn edit-btn" onclick="employeeManager.editEmployee('${employee._id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="employeeManager.deleteEmployee('${employee._id}')">Delete</button>
            </td>
        `;
        return row;
    }

    updateAnalytics(analytics) {
        document.getElementById('totalEmployees').textContent = analytics.totalEmployees;
        document.getElementById('avgSalary').textContent = `$${parseFloat(analytics.averageSalary).toLocaleString()}`;
        document.getElementById('totalSalary').textContent = `$${analytics.totalSalary.toLocaleString()}`;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value.trim(),
            salary: parseFloat(document.getElementById('salary').value),
            experience: parseInt(document.getElementById('experience').value),
            city: document.getElementById('city').value.trim()
        };

        try {
            let response;
            if (this.currentEditId) {
                // UPDATE
                response = await fetch(`${this.API_BASE}/${this.currentEditId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                // CREATE
                response = await fetch(this.API_BASE, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Something went wrong!');
            }

            this.clearForm();
            this.loadEmployees();
            this.showSuccess(this.currentEditId ? '✅ Employee updated!' : '✅ Employee added!');
            this.currentEditId = null;
            
        } catch (error) {
            this.showError(error.message);
        }
    }

    editEmployee(id) {
        this.currentEditId = id;
        document.getElementById('submitBtn').textContent = 'Update Employee';
        
        // Fetch employee data
        fetch(`${this.API_BASE}/${id}`)
            .then(res => res.json())
            .then(employee => {
                document.getElementById('employeeId').value = id;
                document.getElementById('name').value = employee.name;
                document.getElementById('salary').value = employee.salary;
                document.getElementById('experience').value = employee.experience;
                document.getElementById('city').value = employee.city;
            })
            .catch(err => {
                this.showError('Failed to load employee data');
            });
    }

    async deleteEmployee(id) {
        if (!confirm('Are you sure you want to delete this employee?')) {
            return;
        }

        try {
            const response = await fetch(`${this.API_BASE}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete employee');
            }

            this.loadEmployees();
            this.showSuccess('✅ Employee deleted!');
        } catch (error) {
            this.showError('Failed to delete employee');
        }
    }

    clearForm() {
        document.getElementById('employeeForm').reset();
        document.getElementById('employeeId').value = '';
        document.getElementById('submitBtn').textContent = 'Add Employee';
        this.currentEditId = null;
        this.hideError();
    }

    showError(message) {
        const errorEl = document.getElementById('errorMessage');
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }

    hideError() {
        document.getElementById('errorMessage').style.display = 'none';
    }

    showSuccess(message) {
        this.showError(message); // Reuse error element for success (green color in CSS)
        setTimeout(() => this.hideError(), 3000);
    }
}