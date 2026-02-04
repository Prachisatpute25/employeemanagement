import mysql.connector
import os
import sys

# Load environment variables (simple loader since python-dotenv might not be installed in system python)
def load_env():
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend', '.env')
    if os.path.exists(env_path):
        print(f"Loading .env from {env_path}")
        with open(env_path) as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value

def init_db():
    load_env()
    
    
    try:
        print("Connecting to MySQL server...")
        # Connect without selecting database first
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port=int(os.getenv("DB_PORT", 3306))
        )
        cursor = conn.cursor()
        
        db_name = os.getenv("DB_NAME")
        print(f"Creating database '{db_name}' if it doesn't exist...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        cursor.execute(f"USE {db_name}")
        
        print("Creating table 'employees'...")
        # Schema from init.sql
        create_table_query = """
        CREATE TABLE IF NOT EXISTS employees (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            role VARCHAR(50),
            department VARCHAR(50),
            salary FLOAT,
            date_joined DATE
        );
        """
        cursor.execute(create_table_query)
        
        print("Checking if data exists...")
        cursor.execute("SELECT COUNT(*) FROM employees")
        count = cursor.fetchone()[0]
        
        if count == 0:
            print("Seeding initial data...")
            insert_query = """
            INSERT INTO employees (name, email, role, department, salary, date_joined) VALUES 
            ('Alice Johnson', 'alice@example.com', 'Manager', 'HR', 75000, '2023-01-15'),
            ('Bob Smith', 'bob@example.com', 'Developer', 'IT', 85000, '2023-02-20');
            """
            cursor.execute(insert_query)
            conn.commit()
            print("Seed data inserted successfully.")
        else:
            print("Table already has data. Skipping seed.")
            
        cursor.close()
        conn.close()
        print("✅ Database initialization complete!")
        
    except mysql.connector.Error as err:
        print(f"❌ Database connection failed: {err}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_db()
