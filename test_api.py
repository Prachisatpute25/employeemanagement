"""
Simple test script to verify the Employee Management System API
Run this script to test all CRUD operations
"""

import requests
import json
from datetime import date

API_BASE_URL = "http://localhost:8000"

def print_response(response, operation):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"{operation}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")
    print(f"{'='*60}\n")

def test_create_employee():
    """Test creating a new employee"""
    employee_data = {
        "name": "Test Employee",
        "email": f"test{date.today().strftime('%Y%m%d')}@example.com",
        "role": "QA Engineer",
        "department": "Quality Assurance",
        "salary": 65000.00,
        "date_joined": str(date.today())
    }
    
    response = requests.post(f"{API_BASE_URL}/employees", json=employee_data)
    print_response(response, "CREATE EMPLOYEE")
    
    if response.status_code == 200:
        return response.json()["id"]
    return None

def test_get_all_employees():
    """Test getting all employees"""
    response = requests.get(f"{API_BASE_URL}/employees")
    print_response(response, "GET ALL EMPLOYEES")
    return response.json() if response.status_code == 200 else []

def test_get_employee(employee_id):
    """Test getting a specific employee"""
    response = requests.get(f"{API_BASE_URL}/employees/{employee_id}")
    print_response(response, f"GET EMPLOYEE (ID: {employee_id})")

def test_update_employee(employee_id):
    """Test updating an employee"""
    update_data = {
        "salary": 70000.00,
        "role": "Senior QA Engineer"
    }
    
    response = requests.put(f"{API_BASE_URL}/employees/{employee_id}", json=update_data)
    print_response(response, f"UPDATE EMPLOYEE (ID: {employee_id})")

def test_delete_employee(employee_id):
    """Test deleting an employee"""
    response = requests.delete(f"{API_BASE_URL}/employees/{employee_id}")
    print_response(response, f"DELETE EMPLOYEE (ID: {employee_id})")

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("EMPLOYEE MANAGEMENT SYSTEM - API TEST SUITE")
    print("="*60)
    
    try:
        # Test 1: Get all employees (initial state)
        print("\n[TEST 1] Getting all employees...")
        initial_employees = test_get_all_employees()
        print(f"Found {len(initial_employees)} employees in the system")
        
        # Test 2: Create a new employee
        print("\n[TEST 2] Creating a new employee...")
        new_employee_id = test_create_employee()
        
        if new_employee_id:
            # Test 3: Get the newly created employee
            print("\n[TEST 3] Getting the newly created employee...")
            test_get_employee(new_employee_id)
            
            # Test 4: Update the employee
            print("\n[TEST 4] Updating the employee...")
            test_update_employee(new_employee_id)
            
            # Test 5: Verify the update
            print("\n[TEST 5] Verifying the update...")
            test_get_employee(new_employee_id)
            
            # Test 6: Delete the employee
            print("\n[TEST 6] Deleting the employee...")
            test_delete_employee(new_employee_id)
            
            # Test 7: Verify deletion
            print("\n[TEST 7] Verifying deletion...")
            test_get_employee(new_employee_id)
        
        # Test 8: Get all employees (final state)
        print("\n[TEST 8] Getting all employees (final state)...")
        final_employees = test_get_all_employees()
        print(f"Found {len(final_employees)} employees in the system")
        
        print("\n" + "="*60)
        print("ALL TESTS COMPLETED!")
        print("="*60)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to the API!")
        print("Make sure the backend is running:")
        print("  docker-compose up -d")
        print("  OR")
        print("  uvicorn app.main:app --reload")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")

if __name__ == "__main__":
    main()
