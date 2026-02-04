# Quick Start Guide

## For Local Development (Docker)

### 1. Start the Application
```bash
docker-compose up -d --build
```

### 2. Access the Application
- **Frontend**: Open `frontend/index.html` in your browser
- **API Documentation**: http://localhost:8000/docs
- **API Base URL**: http://localhost:8000

### 3. Test the API (Optional)
```bash
# Install requests library
pip install requests

# Run test script
python test_api.py
```

### 4. View Logs
```bash
# All logs
docker-compose logs

# Backend only
docker-compose logs backend -f
```

### 5. Stop the Application
```bash
docker-compose down
```

## For Testing Without Docker

### 1. Set up MySQL
- Install MySQL 8.0
- Create database: `employee_db`
- Run `init.sql`

### 2. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Set Environment Variables
```bash
set DB_HOST=localhost
set DB_USER=root
set DB_PASSWORD=your_password
set DB_NAME=employee_db
```

### 4. Run Backend
```bash
cd backend
uvicorn app.main:app --reload
```

### 5. Open Frontend
Open `frontend/index.html` in your browser

## Troubleshooting

### Docker Issues
- Ensure Docker Desktop is running
- Check if ports 3306 and 8000 are free
- Try: `docker-compose down && docker-compose up -d --build`

### Connection Issues
- Wait 10-15 seconds after starting (MySQL initialization)
- Check logs: `docker-compose logs db`
- Verify containers: `docker-compose ps`

### Frontend Issues
- Check browser console for errors
- Verify API URL in `frontend/js/app.js`
- Ensure backend is running on port 8000

## Next Steps

1. ✅ Local deployment complete
2. ⏳ Deploy to VM
3. ⏳ Integrate with cloud database
4. ⏳ Add authentication (optional)
5. ⏳ Add more features (optional)
