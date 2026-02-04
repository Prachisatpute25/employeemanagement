CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50),
    department VARCHAR(50),
    salary FLOAT,
    date_joined DATE
);

INSERT INTO employees (name, email, role, department, salary, date_joined) VALUES 
('Alice Johnson', 'alice@example.com', 'Manager', 'HR', 75000, '2023-01-15'),
('Bob Smith', 'bob@example.com', 'Developer', 'IT', 85000, '2023-02-20');
