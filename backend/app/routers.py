from fastapi import APIRouter, HTTPException
from .database import get_db_connection
from .models import Employee, EmployeeCreate, EmployeeUpdate
import mysql.connector

router = APIRouter()

@router.post("/employees", response_model=Employee)
def create_employee(employee: EmployeeCreate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    cursor = conn.cursor(dictionary=True)
    try:
        query = "INSERT INTO employees (name, email, role, department, salary, date_joined) VALUES (%s, %s, %s, %s, %s, %s)"
        values = (employee.name, employee.email, employee.role, employee.department, employee.salary, employee.date_joined)
        cursor.execute(query, values)
        conn.commit()
        new_id = cursor.lastrowid
        return {**employee.dict(), "id": new_id}
    except mysql.connector.Error as err:
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

@router.get("/employees", response_model=list[Employee])
def read_employees():
    conn = get_db_connection()
    if not conn:
        print("Failed to connect to DB") # Debugging
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM employees")
    employees = cursor.fetchall()
    
    # Convert date objects to strings if needed by Pydantic (though Pydantic handles date objects well)
    # The dictionary=True in cursor sends data that matches Pydantic model keys.
    
    cursor.close()
    conn.close()
    return employees

@router.get("/employees/{employee_id}", response_model=Employee)
def read_employee(employee_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM employees WHERE id = %s", (employee_id,))
    employee = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.put("/employees/{employee_id}", response_model=Employee)
def update_employee(employee_id: int, employee: EmployeeUpdate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    cursor = conn.cursor(dictionary=True)
    
    # Check if exists
    cursor.execute("SELECT * FROM employees WHERE id = %s", (employee_id,))
    existing = cursor.fetchone()
    if not existing:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Employee not found")

    update_data = employee.dict(exclude_unset=True)
    if not update_data:
        cursor.close()
        conn.close()
        return existing

    set_clause = ", ".join([f"{key} = %s" for key in update_data.keys()])
    values = tuple(update_data.values()) + (employee_id,)
    
    query = f"UPDATE employees SET {set_clause} WHERE id = %s"
    
    try:
        cursor.execute(query, values)
        conn.commit()
        
        # Return updated object
        cursor.execute("SELECT * FROM employees WHERE id = %s", (employee_id,))
        updated_employee = cursor.fetchone()
        return updated_employee
    except mysql.connector.Error as err:
        raise HTTPException(status_code=400, detail=str(err))
    finally:
        cursor.close()
        conn.close()

@router.delete("/employees/{employee_id}")
def delete_employee(employee_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    cursor = conn.cursor()
    cursor.execute("DELETE FROM employees WHERE id = %s", (employee_id,))
    conn.commit()
    rows_affected = cursor.rowcount
    cursor.close()
    conn.close()
    
    if rows_affected == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    return {"detail": "Employee deleted"}
