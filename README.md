# Old Books Exchange Platform

A complete, production-ready student textbook exchange platform built with Flask and MySQL.

## Features

✨ **Core Features:**
- User registration and authentication with secure password hashing
- User dashboard with personalized book listings
- Add, edit, delete, and manage book listings
- Advanced search and filtering by department, semester, subject
- Book details page with seller contact information
- Mark books as sold
- Image upload for book listings
- Session-based authentication
- Flash notifications for user feedback
- Responsive Bootstrap 5 design

🔒 **Security:**
- Parameterized queries (prevents SQL injection)
- Password hashing using werkzeug.security
- Session-based authentication
- File type and size validation
- CSRF protection ready (add in production)
- Input validation on frontend and backend

## Project Structure

```
old-books-exchange/
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies
├── schema.sql                  # Database schema
├── README.md                   # This file
├── config/
│   ├── __init__.py
│   └── config.py              # Configuration settings
├── templates/                  # HTML templates
│   ├── base.html              # Base template with navbar
│   ├── home.html              # Home page
│   ├── register.html          # Registration page
│   ├── login.html             # Login page
│   ├── dashboard.html         # User dashboard
│   ├── add_book.html          # Add book form
│   ├── edit_book.html         # Edit book form
│   ├── books.html             # Browse books with filters
│   ├── book_detail.html       # Single book details
│   ├── about.html             # About page
│   ├── 404.html               # Not found page
│   └── 500.html               # Error page
└── static/
    ├── css/
    │   └── style.css          # Custom stylesheet
    ├── js/
    │   ├── script.js          # Utility functions
    │   └── validation.js      # Form validation
    └── uploads/               # Book images directory
```

## Installation & Setup

### Prerequisites
- Python 3.10 or higher
- MySQL Server 5.7 or higher
- pip (Python package manager)

### Step 1: Clone/Download the Project
```bash
cd "c:\Users\SARAN\OneDrive\Desktop\old book -exchange"
```

### Step 2: Create Virtual Environment
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Setup MySQL Database

1. Open MySQL Command Line or MySQL Workbench
2. Run the following commands:

```bash
# Start MySQL
mysql -u root -p

# Then execute schema.sql
source schema.sql
```

Or copy-paste the entire content of `schema.sql` into MySQL:

```sql
-- Create Database
CREATE DATABASE IF NOT EXISTS old_books_exchange;
USE old_books_exchange;

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50) NOT NULL,
    year VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Books Table
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(150) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    condition VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_path VARCHAR(255),
    seller_id INT NOT NULL,
    status ENUM('available', 'sold') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Indexes
CREATE INDEX idx_seller_id ON books(seller_id);
CREATE INDEX idx_status ON books(status);
CREATE INDEX idx_department ON books(department);
CREATE INDEX idx_semester ON books(semester);
CREATE INDEX idx_created_at ON books(created_at DESC);
```

### Step 5: Configure Database Connection

Edit `config/config.py`:

```python
MYSQL_HOST = 'localhost'        # Your MySQL host
MYSQL_USER = 'root'            # Your MySQL username
MYSQL_PASSWORD = 'your_password'  # Your MySQL password
MYSQL_DB = 'old_books_exchange'
```

### Step 6: Run the Application

```bash
python app.py
```

The application will be available at: `http://localhost:5000`

## Usage Guide

### For Users

1. **Register Account**
   - Go to `/register`
   - Fill in your details (name, email, department, year)
   - Create a secure password (min 6 characters)

2. **Login**
   - Go to `/login`
   - Enter your email and password
   - Successful login redirects to dashboard

3. **Sell a Book**
   - Click "Sell Book" in navigation
   - Fill in book details (title, author, subject, etc.)
   - Optionally upload a book image (JPG/PNG, max 16MB)
   - Submit to list the book

4. **Buy Books**
   - Go to "Browse Books"
   - Use search, department, or semester filters
   - View book details and seller information
   - Contact seller directly via email

5. **Manage Listings**
   - Go to Dashboard
   - View all your books
   - Edit available books
   - Mark as sold when purchased
   - Delete books

### Dashboard Statistics
- Total Books: Count of all your listings
- Available: Books still for sale
- Sold: Books marked as sold

## API Routes

### Public Routes
- `GET /` - Home page
- `GET /register` - Registration form
- `POST /register` - Submit registration
- `GET /login` - Login form
- `POST /login` - Submit login
- `GET /logout` - Logout user
- `GET /books` - Browse all available books
- `GET /book/<id>` - View book details
- `GET /about` - About page

### Protected Routes (Login Required)
- `GET /dashboard` - User dashboard
- `GET /add-book` - Add book form
- `POST /add-book` - Submit new book
- `GET /edit-book/<id>` - Edit book form
- `POST /edit-book/<id>` - Submit book updates
- `POST /delete-book/<id>` - Delete a book
- `POST /mark-sold/<id>` - Mark book as sold

## Technical Stack

### Backend
- **Framework**: Flask 2.3.3
- **Database**: MySQL with mysql-connector-python
- **Security**: werkzeug for password hashing
- **Session**: Flask built-in session management

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom styles with Bootstrap 5.3
- **JavaScript**: ES6+ with vanilla JS (no jQuery)
- **Framework**: Bootstrap 5 for responsive design

## Features in Detail

### Search & Filter
- Search by: Title, Author, Subject
- Filter by: Department, Semester
- Combined filtering for precise results

### Form Validation
- Frontend: Real-time validation with instant feedback
- Backend: Server-side validation for security
- Password strength indicator
- File type and size validation
- Price validation

### Image Upload
- Supported formats: JPG, PNG
- Max file size: 16MB
- Automatic optimization of file names
- User-specific image directories

### Security Measures
- Parameterized queries prevent SQL injection
- Password hashing with werkzeug.security
- Session-based authentication
- File upload validation
- Access control (users can only edit their own books)
- Input sanitization

## Customization

### Add More Departments
Edit `add_book.html`, `edit_book.html`, `register.html`:
```html
<option value="Your Department">Your Department</option>
```

### Add More Semesters
Edit `add_book.html` and `edit_book.html`:
```html
<option value="Semester Name">Semester Name</option>
```

### Change Database Settings
Edit `config/config.py`:
```python
MYSQL_HOST = 'hostname'
MYSQL_USER = 'username'
MYSQL_PASSWORD = 'password'
MYSQL_DB = 'database_name'
```

### Modify Styling
Edit `static/css/style.css` to customize the appearance.

## Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| name | VARCHAR(100) | User's full name |
| email | VARCHAR(100) | Unique email address |
| department | VARCHAR(50) | Department/Faculty |
| year | VARCHAR(20) | Year of study |
| password | VARCHAR(255) | Hashed password |
| created_at | TIMESTAMP | Account creation date |

### Books Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| title | VARCHAR(150) | Book title |
| author | VARCHAR(150) | Author name |
| subject | VARCHAR(100) | Subject area |
| department | VARCHAR(50) | Department |
| semester | VARCHAR(20) | Semester |
| condition | VARCHAR(50) | Book condition |
| price | DECIMAL(10,2) | Listing price |
| image_path | VARCHAR(255) | Path to book image |
| seller_id | INT | Foreign key to users |
| status | ENUM | available/sold |
| created_at | TIMESTAMP | Listing date |

## Troubleshooting

### Issue: "No module named 'mysql'"
**Solution**: Install mysql-connector-python
```bash
pip install mysql-connector-python
```

### Issue: "Access denied for user 'root'"
**Solution**: Check your MySQL credentials in `config/config.py`

### Issue: "Database does not exist"
**Solution**: Run the schema.sql file to create database and tables

### Issue: "Port 5000 is already in use"
**Solution**: Change port in `app.py`:
```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)  # Change to different port
```

### Issue: Images not uploading
**Solution**: Ensure `static/uploads/` directory exists and has write permissions

## Environment Variables

Optional environment variables you can set:

```bash
# Linux/macOS
export FLASK_ENV=development
export FLASK_DEBUG=1
export SECRET_KEY=your-secret-key

# Windows PowerShell
$env:FLASK_ENV="development"
$env:FLASK_DEBUG="1"
$env:SECRET_KEY="your-secret-key"
```

## Performance Optimization

The application includes:
- Database indexes on frequently searched columns
- Efficient parameterized queries
- Caching-ready structure
- Minified CSS and JavaScript
- Lazy loading for images

## Future Enhancements

- Add seller ratings/reviews
- Implement messaging system
- Add wishlist feature
- Add book recommendations
- Integrate payment gateway
- Add book ISBN search
- Email notifications
- Admin dashboard
- Two-factor authentication

## License

This project is open source and available for educational purposes.

## Support

For issues, improvements, or questions, please refer to the code comments or review the route definitions in `app.py`.

---

**Happy Learning! 📚**

Built with ❤️ for students, by a senior backend developer.
