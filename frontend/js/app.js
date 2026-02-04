// API Configuration
const API_BASE_URL = '/api';

// State Management
let employees = [];
let filteredEmployees = [];
let currentEmployeeId = null;
let isEditMode = false;

// DOM Elements
const employeesGrid = document.getElementById('employeesGrid');
const emptyState = document.getElementById('emptyState');
const emptyStateTitle = document.getElementById('emptyStateTitle');
const emptyStateMessage = document.getElementById('emptyStateMessage');
const loadingState = document.getElementById('loadingState');
const modal = document.getElementById('employeeModal');
const modalTitle = document.getElementById('modalTitle');
const employeeForm = document.getElementById('employeeForm');
const addEmployeeBtn = document.getElementById('addEmployeeBtn');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const departmentFilter = document.getElementById('departmentFilter');
const sortSelect = document.getElementById('sortSelect');
const toastContainer = document.getElementById('toastContainer');

// Statistics elements
const totalEmployeesEl = document.getElementById('totalEmployees');
const totalSalaryEl = document.getElementById('totalSalary');
const avgSalaryEl = document.getElementById('avgSalary');
const totalDepartmentsEl = document.getElementById('totalDepartments');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadEmployees();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    addEmployeeBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    employeeForm.addEventListener('submit', handleFormSubmit);

    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);

    // Filter and sort
    departmentFilter.addEventListener('change', applyFilters);
    sortSelect.addEventListener('change', applyFilters);

    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// API Functions
async function loadEmployees() {
    try {
        loadingState.style.display = 'block';
        employeesGrid.style.display = 'none';
        emptyState.style.display = 'none';

        const response = await fetch(`${API_BASE_URL}/employees`);
        if (!response.ok) throw new Error('Failed to fetch employees');

        employees = await response.json();
        filteredEmployees = [...employees];
        
        loadingState.style.display = 'none';
        employeesGrid.style.display = 'grid';
        
        updateDepartmentFilter();
        updateStatistics();
        applyFilters();
    } catch (error) {
        console.error('Error loading employees:', error);
        loadingState.style.display = 'none';
        showError('Failed to load employees. Make sure the backend is running.');
        renderEmployees();
    }
}

async function createEmployee(employeeData) {
    try {
        const response = await fetch(`${API_BASE_URL}/employees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData),
        });

        if (!response.ok) throw new Error('Failed to create employee');

        const newEmployee = await response.json();
        employees.push(newEmployee);
        filteredEmployees = [...employees];
        updateDepartmentFilter();
        updateStatistics();
        applyFilters();
        closeModal();
        showToast('Employee added successfully!', 'success');
    } catch (error) {
        console.error('Error creating employee:', error);
        showError('Failed to create employee. Please check the data and try again.');
    }
}

async function updateEmployee(id, employeeData) {
    try {
        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData),
        });

        if (!response.ok) throw new Error('Failed to update employee');

        const updatedEmployee = await response.json();
        const index = employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
            employees[index] = updatedEmployee;
        }
        filteredEmployees = [...employees];
        updateDepartmentFilter();
        updateStatistics();
        applyFilters();
        closeModal();
        showToast('Employee updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating employee:', error);
        showError('Failed to update employee. Please try again.');
    }
}

async function deleteEmployee(id) {
    if (!confirm('Are you sure you want to delete this employee?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete employee');

        employees = employees.filter(emp => emp.id !== id);
        filteredEmployees = [...employees];
        updateDepartmentFilter();
        updateStatistics();
        applyFilters();
        showToast('Employee deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting employee:', error);
        showError('Failed to delete employee. Please try again.');
    }
}

// Filter and Search Functions
function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    clearSearchBtn.style.display = query ? 'flex' : 'none';
    applyFilters();
}

function clearSearch() {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    applyFilters();
}

function applyFilters() {
    const searchQuery = searchInput.value.toLowerCase().trim();
    const departmentValue = departmentFilter.value;
    const sortValue = sortSelect.value;

    // Filter employees
    filteredEmployees = employees.filter(employee => {
        const matchesSearch = !searchQuery || 
            employee.name.toLowerCase().includes(searchQuery) ||
            employee.email.toLowerCase().includes(searchQuery) ||
            employee.role.toLowerCase().includes(searchQuery) ||
            employee.department.toLowerCase().includes(searchQuery);
        
        const matchesDepartment = !departmentValue || employee.department === departmentValue;
        
        return matchesSearch && matchesDepartment;
    });

    // Sort employees
    filteredEmployees.sort((a, b) => {
        switch (sortValue) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'salary-asc':
                return a.salary - b.salary;
            case 'salary-desc':
                return b.salary - a.salary;
            case 'date-desc':
                return new Date(b.date_joined) - new Date(a.date_joined);
            case 'date-asc':
                return new Date(a.date_joined) - new Date(b.date_joined);
            default:
                return 0;
        }
    });

    renderEmployees();
}

function updateDepartmentFilter() {
    const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))].sort();
    const currentValue = departmentFilter.value;
    
    departmentFilter.innerHTML = '<option value="">All Departments</option>';
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        departmentFilter.appendChild(option);
    });
    
    if (departments.includes(currentValue)) {
        departmentFilter.value = currentValue;
    }
}

function updateStatistics() {
    const total = employees.length;
    const totalSalary = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    const avgSalary = total > 0 ? totalSalary / total : 0;
    const departments = new Set(employees.map(emp => emp.department).filter(Boolean)).size;

    totalEmployeesEl.textContent = total;
    totalSalaryEl.textContent = formatCurrency(totalSalary);
    avgSalaryEl.textContent = formatCurrency(avgSalary);
    totalDepartmentsEl.textContent = departments;
}

// Render Functions
function renderEmployees() {
    if (filteredEmployees.length === 0) {
        employeesGrid.innerHTML = '';
        emptyState.style.display = 'block';
        
        if (employees.length === 0) {
            emptyStateTitle.textContent = 'No Employees Found';
            emptyStateMessage.textContent = 'Start by adding your first employee to the system';
        } else {
            emptyStateTitle.textContent = 'No Employees Match Your Search';
            emptyStateMessage.textContent = 'Try adjusting your search or filter criteria';
        }
        return;
    }

    emptyState.style.display = 'none';

    employeesGrid.innerHTML = filteredEmployees.map(employee => `
        <div class="employee-card">
            <div class="employee-header">
                <div class="employee-info">
                    <h3>${escapeHtml(employee.name)}</h3>
                    <p>${escapeHtml(employee.email)}</p>
                </div>
                <div class="employee-actions">
                    <button class="icon-btn edit" onclick="openEditModal(${employee.id})" title="Edit">
                        ✏️
                    </button>
                    <button class="icon-btn delete" onclick="deleteEmployee(${employee.id})" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="employee-details">
                <div class="detail-row">
                    <span class="detail-label">Role</span>
                    <span class="detail-value">${escapeHtml(employee.role)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Department</span>
                    <span class="detail-value">${escapeHtml(employee.department)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Salary</span>
                    <span class="detail-value salary">$${formatNumber(employee.salary)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date Joined</span>
                    <span class="detail-value">${formatDate(employee.date_joined)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Modal Functions
function openAddModal() {
    isEditMode = false;
    currentEmployeeId = null;
    modalTitle.textContent = 'Add Employee';
    employeeForm.reset();
    modal.classList.add('active');
}

function openEditModal(id) {
    isEditMode = true;
    currentEmployeeId = id;
    modalTitle.textContent = 'Edit Employee';

    const employee = employees.find(emp => emp.id === id);
    if (employee) {
        document.getElementById('name').value = employee.name;
        document.getElementById('email').value = employee.email;
        document.getElementById('role').value = employee.role;
        document.getElementById('department').value = employee.department;
        document.getElementById('salary').value = employee.salary;
        document.getElementById('date_joined').value = employee.date_joined;
    }

    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    employeeForm.reset();
    isEditMode = false;
    currentEmployeeId = null;
}

// Form Handler
function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(employeeForm);
    const employeeData = {
        name: formData.get('name'),
        email: formData.get('email'),
        role: formData.get('role'),
        department: formData.get('department'),
        salary: parseFloat(formData.get('salary')),
        date_joined: formData.get('date_joined'),
    };

    if (isEditMode && currentEmployeeId) {
        updateEmployee(currentEmployeeId, employeeData);
    } else {
        createEmployee(employeeData);
    }
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Toast Notification Functions
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.success}</span>
        <div class="toast-content">
            <p class="toast-message">${escapeHtml(message)}</p>
        </div>
        <button class="toast-close" onclick="removeToast(this)">&times;</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        removeToast(toast.querySelector('.toast-close'));
    }, 5000);
}

function removeToast(button) {
    const toast = button.closest('.toast');
    if (toast) {
        toast.classList.add('fade-out');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}

function showSuccess(message) {
    console.log('✅ Success:', message);
    showToast(message, 'success');
}

function showError(message) {
    console.error('❌ Error:', message);
    showToast(message, 'error');
}

// Make functions globally accessible for inline onclick handlers
window.openEditModal = openEditModal;
window.deleteEmployee = deleteEmployee;
window.removeToast = removeToast;