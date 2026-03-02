# Quick Start Guide - Old Books Exchange Platform

## 5-Minute Setup Instructions

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Create MySQL Database
```bash
# Open MySQL and run:
mysql -u root -p < schema.sql

# Or copy-paste schema.sql content in MySQL Workbench/Command Line
```

### 3. Update Database Credentials
Edit `config/config.py`:
```python
MYSQL_USER = 'your_username'
MYSQL_PASSWORD = 'your_password'
```

### 4. Run the Application
```bash
python app.py
```

### 5. Open in Browser
```
http://localhost:5000
```

---

## Test Account (Optional - Create Your Own)

1. Click "Register" on the home page
2. Fill in your details
3. Create an account
4. Login with your credentials

---

## Key URLs

| URL | Purpose |
|-----|---------|
| http://localhost:5000/ | Home Page |
| http://localhost:5000/register | Sign Up |
| http://localhost:5000/login | Login |
| http://localhost:5000/books | Browse Books |
| http://localhost:5000/dashboard | Your Dashboard (login required) |
| http://localhost:5000/add-book | Sell a Book (login required) |
| http://localhost:5000/about | About Page |

---

## Features to Try

✅ **Register & Login**
- Create a new account
- Login with your credentials
- View your dashboard

✅ **Sell Books**
- Add a new book listing
- Upload book image
- Set price condition, department, semester
- Edit or delete your listings

✅ **Browse Books**
- View all available books
- Search by title, author, subject
- Filter by department or semester
- View seller details

✅ **Manage Listings**
- See all your books in dashboard
- Edit book details
- Mark books as sold
- Delete listings

---

## Common Tasks

### Change MySQL Port
If MySQL is on a different port:
```python
# In config/config.py, add:
MYSQL_PORT = 3307
```

### Change Flask Port
If port 5000 is busy:
```python
# In app.py, change:
app.run(host='0.0.0.0', port=5001)
```

### Reset Database
```bash
# Drop and recreate database
mysql -u root -p < schema.sql
```

### Stop the Application
Press `Ctrl+C` in terminal

---

## Architecture Overview

```
User Browser
    ↓
Flask Web Server (app.py)
    ↓
Jinja2 Templates (HTML rendering)
    ↓
MySQL Database
    ↓
Static Assets (CSS, JS, Images)
```

---

## Project Code Structure

**app.py** - 500+ lines of production code:
- Database connection management
- 17 routes (public and protected)
- Form validation
- File upload handling
- Session management
- Security implementations

**Templates** (10 HTML files):
- Responsive Bootstrap 5 design
- Form validation
- Flash message display
- Dynamic content rendering

**Static Files**:
- Professional CSS styling
- JavaScript utilities and validation
- Image upload handling

**Database**:
- 2 normalized tables with relationships
- Indexes for performance
- Proper data types and constraints

---

## Security Features Implemented

✅ Parameterized Queries (SQL Injection Prevention)
✅ Password Hashing (werkzeug.security)
✅ Session-based Authentication
✅ File Type Validation
✅ File Size Limits (16MB)
✅ Input Validation (Frontend & Backend)
✅ User Access Control (Edit own books only)
✅ Secure File Naming

---

## Requirements.txt Packages

- **Flask 2.3.3** - Web framework
- **mysql-connector-python 8.0.33** - MySQL driver
- **Werkzeug 2.3.7** - WSGI utilities (password hashing)

Total size: ~50 MB after installation

---

## System Requirements

| Component | Requirement |
|-----------|-------------|
| Python | 3.10+ |
| MySQL | 5.7+ |
| RAM | 512 MB minimum |
| Disk Space | 200 MB |
| Browser | Modern (Chrome, Firefox, Safari, Edge) |

---

## File Upload Examples

**Supported Formats:**
- JPG (.jpg, .jpeg)
- PNG (.png)

**File Size Limits:**
- Maximum: 16 MB
- Recommended: 500 KB - 5 MB

**Storage Location:**
- `static/uploads/` directory
- Files are user-organized (user_id_timestamp_filename)

---

## Database Relationships

```
Users (1) ──── (Many) Books
  id PRIMARY KEY
         ↓
      seller_id FOREIGN KEY
```

- Each user can list multiple books
- Each book belongs to one seller
- Deleting a user deletes their books (CASCADE)

---

## Debugging Tips

**Enable Debug Mode:**
```python
# In app.py
app.run(debug=True)  # Auto-reload on changes
```

**View MySQL Queries:**
```python
# Add debugging to execute_query function
print(f"Executing: {query} with {params}")
```

**Check Flask Logs:**
```
* Running on http://127.0.0.1:5000
* Debug mode: on
* WARNING: This is a development server...
```

---

## Next Steps

1. ✅ Follow 5-Minute Setup above
2. ✅ Create a test account
3. ✅ Add a sample book listing
4. ✅ Test search and filtering
5. ✅ Explore all features
6. ✅ Read main README.md for deeper understanding

---

## Need Help?

1. Check MySQL is running: `mysql -u root -p`
2. Verify database exists: `SHOW DATABASES;`
3. Check Flask is running: No errors in terminal
4. Clear browser cache: Ctrl+Shift+Delete
5. Check port 5000: `netstat -ano | find "5000"` (Windows)

---

**Everything is ready! Start with `python app.py` 🚀**
