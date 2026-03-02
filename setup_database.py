#!/usr/bin/env python3
"""
Setup database for Old Books Exchange Platform
This script reads schema.sql and executes it in MySQL
"""

import mysql.connector
from mysql.connector import Error
import sys

def create_database():
    """Create database from schema.sql"""
    
    # Database credentials
    MYSQL_HOST = 'localhost'
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = input("Enter MySQL password for root user: ")
    
    # Read schema file
    try:
        with open('schema.sql', 'r') as f:
            schema_sql = f.read()
    except FileNotFoundError:
        print("Error: schema.sql not found in current directory")
        sys.exit(1)
    
    connection = None
    try:
        # Connect to MySQL
        print("Connecting to MySQL...")
        connection = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD
        )
        
        if connection.is_connected():
            print("✓ Connected to MySQL")
            cursor = connection.cursor()
            
            # Split and execute multiple statements
            statements = schema_sql.split(';')
            
            for statement in statements:
                statement = statement.strip()
                if statement:
                    try:
                        cursor.execute(statement)
                        print(f"✓ Executed: {statement[:60]}...")
                    except Error as e:
                        print(f"⚠ Skipped: {e}")
            
            connection.commit()
            print("\n✅ Database setup completed successfully!")
            print("Database: old_books_exchange")
            print("Tables: users, books")
            
            cursor.close()
        
    except Error as e:
        print(f"\n❌ Error: {e}")
        print("\n" + "="*60)
        print("TROUBLESHOOTING:")
        print("="*60)
        print("\n1. ERROR: Can't connect to MySQL server")
        print("   → MySQL is NOT running on your computer")
        print("   → Solution: Start MySQL service")
        print("\n   On Windows:")
        print("   → Open Services (services.msc)")
        print("   → Find 'MySQL80' or 'MySQL57'")
        print("   → Right-click and select 'Start'")
        print("\n   OR run in PowerShell (as Administrator):")
        print("   → net start MySQL80")
        print("\n2. ERROR: Access denied for user 'root'")
        print("   → Wrong MySQL password")
        print("   → Run this script again and enter correct password")
        print("\n3. ERROR: Can't find schema.sql")
        print("   → Run script from directory containing schema.sql")
        print("="*60)
        sys.exit(1)
    
    finally:
        if connection is not None and connection.is_connected():
            connection.close()
            print("\nConnection closed")

if __name__ == "__main__":
    create_database()
