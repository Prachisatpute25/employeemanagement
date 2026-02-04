# Employee Management System

A full-stack Employee Management System built with FastAPI (backend), MySQL (database), and modern HTML/CSS/JavaScript (frontend). The application is fully containerized using Docker.

## Features

- ✅ **CRUD Operations**: Create, Read, Update, and Delete employee records
- ✅ **Modern UI**: Beautiful dark-themed interface with glassmorphism effects
- ✅ **RESTful API**: FastAPI backend with automatic API documentation
- ✅ **Database**: MySQL for reliable data persistence
- ✅ **Containerized**: Docker Compose for easy deployment
- ✅ **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **MySQL Connector**: Database integration
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with custom properties, gradients, and animations
- **Vanilla JavaScript**: No framework dependencies

### Database
- **MySQL 8.0**: Relational database

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

## Project Structure

```
EmployeeManagementSystem/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application entry point
│   │   ├── models.py        # Pydantic models and Employee class
│   │   ├── database.py      # MySQL connection logic
│   │   └── routers.py       # API route handlers
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── docker-compose.yml
├── init.sql                 # Database initialization script
└── README.md
```

## Installation & Setup

### Prerequisites
- Docker Desktop installed and running
- Git (optional, for cloning)

### Quick Start

1. **Clone or navigate to the project directory**
   ```bash
   cd d:\PythonAssignment\EmployeeManagementSystem
   ```

2. **Start the application**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application**
   - Frontend: Open `frontend/index.html` in your browser
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

4. **Stop the application**
   ```bash
   docker-compose down
   ```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employees` | Get all employees |
| POST | `/employees` | Create a new employee |
| GET | `/employees/{id}` | Get employee by ID |
| PUT | `/employees/{id}` | Update employee by ID |
| DELETE | `/employees/{id}` | Delete employee by ID |

### Example API Request

**Create Employee:**
```bash
curl -X POST http://localhost:8000/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Developer",
    "department": "IT",
    "salary": 75000,
    "date_joined": "2024-01-15"
  }'
```

## Database Schema

**Table: employees**

| Column | Type | Constraints |
|--------|------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(100) | UNIQUE, NOT NULL |
| role | VARCHAR(50) | |
| department | VARCHAR(50) | |
| salary | FLOAT | |
| date_joined | DATE | |

## Development

### Running Locally Without Docker

1. **Set up MySQL database**
   - Install MySQL 8.0
   - Create database: `employee_db`
   - Run `init.sql` to create tables

2. **Install Python dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Set environment variables**
   ```bash
   set DB_HOST=localhost
   set DB_USER=user
   set DB_PASSWORD=password
   set DB_NAME=employee_db
   ```

4. **Run the backend**
   ```bash
   uvicorn app.main:app --reload
   ```

5. **Open frontend**
   - Open `frontend/index.html` in your browser

## Docker Configuration

### Environment Variables

The following environment variables are configured in `docker-compose.yml`:

**Database (MySQL):**
- `MYSQL_ROOT_PASSWORD`: rootpassword
- `MYSQL_DATABASE`: employee_db
- `MYSQL_USER`: user
- `MYSQL_PASSWORD`: password

**Backend (FastAPI):**
- `DB_HOST`: db
- `DB_USER`: user
- `DB_PASSWORD`: password
- `DB_NAME`: employee_db

### Volumes

- `db_data`: Persistent storage for MySQL data
- `./backend:/app`: Backend code mounted for development

## Debugging

### View Container Logs

```bash
# All logs
docker-compose logs

# Backend logs
docker-compose logs backend

# Database logs
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f backend
```

### Check Container Status

```bash
docker-compose ps
```

### Access MySQL Database

```bash
docker exec -it employee_db mysql -u user -p
# Password: password
```

## Testing

1. **Test Backend API**
   - Visit http://localhost:8000/docs
   - Use the interactive Swagger UI to test endpoints

2. **Test Frontend**
   - Open `frontend/index.html`
   - Try adding, editing, and deleting employees
   - Check browser console for any errors

## Deployment

### VM Deployment (Future)

1. Set up a VM with Docker installed
2. Copy project files to VM
3. Update `docker-compose.yml` with production settings
4. Run `docker-compose up -d --build`

### Cloud Database (Future)

1. Set up a cloud MySQL instance (AWS RDS, Azure Database, etc.)
2. Update environment variables in `docker-compose.yml`
3. Ensure network security groups allow connections
4. Deploy backend container

## Assignment Requirements Checklist

- ✅ Python program managing employee records
- ✅ Basic Python concepts (variables, data types, flow control)
- ✅ CRUD operations implemented
- ✅ Functions organized into modules and packages
- ✅ Employee class with attributes and methods
- ✅ RDBMS integration (MySQL with mysql-connector)
- ✅ FastAPI for API creation
- ✅ Frontend integration with backend
- ✅ Local system deployment
- ✅ Docker containerization (multi-container with docker-compose)
- ⏳ VM deployment (pending)
- ⏳ Cloud DB integration (pending)

## Troubleshooting

### Issue: Containers won't start
- Ensure Docker Desktop is running
- Check if ports 3306 and 8000 are available
- Run `docker-compose down` and try again

### Issue: Frontend can't connect to backend
- Verify backend is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- Ensure API_BASE_URL in `frontend/js/app.js` is correct

### Issue: Database connection failed
- Wait 10-15 seconds after starting containers (MySQL needs time to initialize)
- Check database logs: `docker-compose logs db`

## License

This project is created for educational purposes as part of a Python assignment.

## Author

Created for Python Assignment - February 2026
