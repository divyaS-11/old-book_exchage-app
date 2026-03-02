import os
import re
from functools import wraps
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask import Flask, render_template, request, redirect, url_for, session, flash
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

# Load configuration
from config.config import DevelopmentConfig
app.config.from_object(DevelopmentConfig)

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


# ====================== Database Helper Functions ======================

def get_db_connection():
    """Create a database connection"""
    try:
        connection = mysql.connector.connect(
            host=app.config['MYSQL_HOST'],
            user=app.config['MYSQL_USER'],
            password=app.config['MYSQL_PASSWORD'],
            database=app.config['MYSQL_DB']
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None


def execute_query(query, params=None, fetch_one=False, fetch_all=False):
    """Execute a query and return results"""
    connection = get_db_connection()
    if connection is None:
        return None
    
    try:
        cursor = connection.cursor(dictionary=True)
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        else:
            connection.commit()
            result = cursor.rowcount
        
        cursor.close()
        return result
    except Error as e:
        print(f"Database error: {e}")
        return None
    finally:
        if connection.is_connected():
            connection.close()


# ====================== Validation & Security Functions ======================

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password):
    """Validate password strength"""
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    return True, "Password is valid"


def validate_price(price):
    """Validate price format"""
    try:
        price_float = float(price)
        if price_float < 0:
            return False, "Price cannot be negative"
        return True, "Price is valid"
    except ValueError:
        return False, "Price must be a valid number"


# ====================== Decorator for Login Protection ======================

def login_required(f):
    """Decorator to protect routes that require login"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function


# ====================== PUBLIC ROUTES ======================

@app.route('/')
def home():
    """Home page"""
    return render_template('home.html')


@app.route('/about')
def about():
    """About page"""
    return render_template('about.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    """User registration"""
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip().lower()
        department = request.form.get('department', '').strip()
        year = request.form.get('year', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # Validation
        errors = []
        
        if not name or len(name) < 2:
            errors.append('Name must be at least 2 characters long')
        
        if not email or not validate_email(email):
            errors.append('Please enter a valid email address')
        
        if not department:
            errors.append('Please select a department')
        
        if not year:
            errors.append('Please select your year')
        
        if not password:
            errors.append('Password is required')
        
        is_valid, msg = validate_password(password)
        if not is_valid:
            errors.append(msg)
        
        if password != confirm_password:
            errors.append('Passwords do not match')
        
        if errors:
            for error in errors:
                flash(error, 'danger')
            return render_template('register.html')
        
        # Check if email already exists
        existing_user = execute_query(
            'SELECT id FROM users WHERE email = %s',
            (email,),
            fetch_one=True
        )
        
        if existing_user:
            flash('Email already registered. Please log in.', 'danger')
            return render_template('register.html')
        
        # Hash password and create user
        hashed_password = generate_password_hash(password)
        
        result = execute_query(
            'INSERT INTO users (name, email, department, year, password) VALUES (%s, %s, %s, %s, %s)',
            (name, email, department, year, hashed_password)
        )
        
        if result is not None and result > 0:
            flash('Registration successful! Please log in.', 'success')
            return redirect(url_for('login'))
        else:
            flash('Registration failed. Please try again.', 'danger')
            return render_template('register.html')
    
    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        
        if not email or not password:
            flash('Email and password are required.', 'danger')
            return render_template('login.html')
        
        # Find user by email
        user = execute_query(
            'SELECT id, name, password FROM users WHERE email = %s',
            (email,),
            fetch_one=True
        )
        
        if user and check_password_hash(user['password'], password):
            session.permanent = True
            session['user_id'] = user['id']
            session['user_name'] = user['name']
            flash(f'Welcome back, {user["name"]}!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password.', 'danger')
            return render_template('login.html')
    
    return render_template('login.html')


@app.route('/logout')
def logout():
    """User logout"""
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('home'))


@app.route('/books', methods=['GET'])
def books():
    """Display all available books with filtering and search"""
    search = request.args.get('search', '').strip()
    department = request.args.get('department', '').strip()
    semester = request.args.get('semester', '').strip()
    
    # Build base query
    query = 'SELECT b.*, u.name as seller_name FROM books b JOIN users u ON b.seller_id = u.id WHERE b.status = "available"'
    params = []
    
    # Add search filter
    if search:
        query += ' AND (b.title LIKE %s OR b.author LIKE %s OR b.subject LIKE %s)'
        search_param = f'%{search}%'
        params.extend([search_param, search_param, search_param])
    
    # Add department filter
    if department:
        query += ' AND b.department = %s'
        params.append(department)
    
    # Add semester filter
    if semester:
        query += ' AND b.semester = %s'
        params.append(semester)
    
    # Order by newest first
    query += ' ORDER BY b.created_at DESC'
    
    books_list = execute_query(query, params if params else None, fetch_all=True)
    
    if books_list is None:
        books_list = []
    
    # Get unique departments and semesters for filter dropdowns
    departments = execute_query('SELECT DISTINCT department FROM books ORDER BY department', fetch_all=True)
    semesters = execute_query('SELECT DISTINCT semester FROM books ORDER BY semester', fetch_all=True)
    
    return render_template(
        'books.html',
        books=books_list,
        departments=departments or [],
        semesters=semesters or [],
        search=search,
        selected_department=department,
        selected_semester=semester
    )


@app.route('/book/<int:book_id>')
def book_detail(book_id):
    """Display book details"""
    book = execute_query(
        'SELECT b.*, u.name as seller_name, u.email as seller_email, u.department as seller_department FROM books b JOIN users u ON b.seller_id = u.id WHERE b.id = %s',
        (book_id,),
        fetch_one=True
    )
    
    if book is None:
        flash('Book not found.', 'danger')
        return redirect(url_for('books'))
    
    return render_template('book_detail.html', book=book)


# ====================== PROTECTED ROUTES (Login Required) ======================

@app.route('/dashboard')
@login_required
def dashboard():
    """User dashboard showing their listings"""
    user_id = session.get('user_id')
    user_name = session.get('user_name')
    
    # Get user's books
    books_list = execute_query(
        'SELECT * FROM books WHERE seller_id = %s ORDER BY created_at DESC',
        (user_id,),
        fetch_all=True
    )
    
    if books_list is None:
        books_list = []
    
    # Count statistics
    total_books = len(books_list)
    available_books = sum(1 for book in books_list if book['status'] == 'available')
    sold_books = total_books - available_books
    
    return render_template(
        'dashboard.html',
        user_name=user_name,
        books=books_list,
        total_books=total_books,
        available_books=available_books,
        sold_books=sold_books
    )


@app.route('/add-book', methods=['GET', 'POST'])
@login_required
def add_book():
    """Add a new book"""
    if request.method == 'POST':
        user_id = session.get('user_id')
        
        # Get form data
        title = request.form.get('title', '').strip()
        author = request.form.get('author', '').strip()
        subject = request.form.get('subject', '').strip()
        department = request.form.get('department', '').strip()
        semester = request.form.get('semester', '').strip()
        condition = request.form.get('condition', '').strip()
        price = request.form.get('price', '').strip()
        
        # Validation
        errors = []
        
        if not title or len(title) < 3:
            errors.append('Title must be at least 3 characters long')
        
        if not author or len(author) < 2:
            errors.append('Author name is required')
        
        if not subject:
            errors.append('Subject is required')
        
        if not department:
            errors.append('Department is required')
        
        if not semester:
            errors.append('Semester is required')
        
        if not condition:
            errors.append('Book condition is required')
        
        if not price:
            errors.append('Price is required')
        
        is_valid_price, price_msg = validate_price(price)
        if not is_valid_price:
            errors.append(price_msg)
        
        if errors:
            for error in errors:
                flash(error, 'danger')
            return render_template('add_book.html')
        
        # Handle file upload
        image_path = None
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename != '' and allowed_file(file.filename):
                filename = secure_filename(f"{user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}")
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                image_path = f"uploads/{filename}"
        
        # Insert book into database
        result = execute_query(
            'INSERT INTO books (title, author, subject, department, semester, `condition`, price, image_path, seller_id) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)',
            (title, author, subject, department, semester, condition, price, image_path, user_id)
        )
        
        if result is not None and result > 0:
            flash('Book added successfully!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Failed to add book. Please try again.', 'danger')
            return render_template('add_book.html')
    
    return render_template('add_book.html')


@app.route('/edit-book/<int:book_id>', methods=['GET', 'POST'])
@login_required
def edit_book(book_id):
    """Edit a book"""
    user_id = session.get('user_id')
    
    # Get book
    book = execute_query(
        'SELECT * FROM books WHERE id = %s',
        (book_id,),
        fetch_one=True
    )
    
    if book is None:
        flash('Book not found.', 'danger')
        return redirect(url_for('dashboard'))
    
    # Check ownership
    if book['seller_id'] != user_id:
        flash('You can only edit your own books.', 'danger')
        return redirect(url_for('dashboard'))
    
    # If book is sold, prevent editing
    if book['status'] == 'sold':
        flash('You cannot edit a sold book.', 'danger')
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        # Get form data
        title = request.form.get('title', '').strip()
        author = request.form.get('author', '').strip()
        subject = request.form.get('subject', '').strip()
        department = request.form.get('department', '').strip()
        semester = request.form.get('semester', '').strip()
        condition = request.form.get('condition', '').strip()
        price = request.form.get('price', '').strip()
        
        # Validation
        errors = []
        
        if not title or len(title) < 3:
            errors.append('Title must be at least 3 characters long')
        
        if not author or len(author) < 2:
            errors.append('Author name is required')
        
        if not subject:
            errors.append('Subject is required')
        
        if not department:
            errors.append('Department is required')
        
        if not semester:
            errors.append('Semester is required')
        
        if not condition:
            errors.append('Book condition is required')
        
        if not price:
            errors.append('Price is required')
        
        is_valid_price, price_msg = validate_price(price)
        if not is_valid_price:
            errors.append(price_msg)
        
        if errors:
            for error in errors:
                flash(error, 'danger')
            return render_template('edit_book.html', book=book)
        
        # Handle file upload
        image_path = book['image_path']
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename != '' and allowed_file(file.filename):
                # Delete old image if it exists
                if image_path and os.path.exists(os.path.join('static', image_path)):
                    os.remove(os.path.join('static', image_path))
                
                filename = secure_filename(f"{user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}")
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                image_path = f"uploads/{filename}"
        
        # Update book in database
        result = execute_query(
            'UPDATE books SET title = %s, author = %s, subject = %s, department = %s, semester = %s, `condition` = %s, price = %s, image_path = %s WHERE id = %s',
            (title, author, subject, department, semester, condition, price, image_path, book_id)
        )
        
        if result is not None and result > 0:
            flash('Book updated successfully!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Failed to update book. Please try again.', 'danger')
            return render_template('edit_book.html', book=book)
    
    return render_template('edit_book.html', book=book)


@app.route('/delete-book/<int:book_id>', methods=['POST'])
@login_required
def delete_book(book_id):
    """Delete a book"""
    user_id = session.get('user_id')
    
    # Get book
    book = execute_query(
        'SELECT * FROM books WHERE id = %s',
        (book_id,),
        fetch_one=True
    )
    
    if book is None:
        flash('Book not found.', 'danger')
        return redirect(url_for('dashboard'))
    
    # Check ownership
    if book['seller_id'] != user_id:
        flash('You can only delete your own books.', 'danger')
        return redirect(url_for('dashboard'))
    
    # Delete image if it exists
    if book['image_path'] and os.path.exists(os.path.join('static', book['image_path'])):
        os.remove(os.path.join('static', book['image_path']))
    
    # Delete book from database
    result = execute_query(
        'DELETE FROM books WHERE id = %s',
        (book_id,)
    )
    
    if result is not None and result > 0:
        flash('Book deleted successfully!', 'success')
    else:
        flash('Failed to delete book. Please try again.', 'danger')
    
    return redirect(url_for('dashboard'))


@app.route('/mark-sold/<int:book_id>', methods=['POST'])
@login_required
def mark_sold(book_id):
    """Mark a book as sold"""
    user_id = session.get('user_id')
    
    # Get book
    book = execute_query(
        'SELECT * FROM books WHERE id = %s',
        (book_id,),
        fetch_one=True
    )
    
    if book is None:
        flash('Book not found.', 'danger')
        return redirect(url_for('dashboard'))
    
    # Check ownership
    if book['seller_id'] != user_id:
        flash('You can only mark your own books as sold.', 'danger')
        return redirect(url_for('dashboard'))
    
    # Update book status
    result = execute_query(
        'UPDATE books SET status = %s WHERE id = %s',
        ('sold', book_id)
    )
    
    if result is not None and result > 0:
        flash('Book marked as sold!', 'success')
    else:
        flash('Failed to mark book as sold. Please try again.', 'danger')
    
    return redirect(url_for('dashboard'))


# ====================== ERROR HANDLERS ======================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return render_template('404.html'), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return render_template('500.html'), 500


# ====================== CONTEXT PROCESSORS ======================

@app.context_processor
def inject_user():
    """Make user info available in all templates"""
    return {
        'user_id': session.get('user_id'),
        'user_name': session.get('user_name')
    }


# ====================== APP INITIALIZATION ======================

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
