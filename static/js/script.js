// ==================== Utility Functions ====================

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type of notification (success, danger, warning, info)
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
    }

    // Auto-close
    if (duration > 0) {
        setTimeout(() => {
            alertDiv.remove();
        }, duration);
    }
}

/**
 * Format currency
 * @param {number} value - The value to format
 * @param {string} currency - Currency symbol (default: ₹)
 * @returns {string} Formatted currency string
 */
function formatCurrency(value, currency = '₹') {
    return currency + parseFloat(value).toFixed(2);
}

/**
 * Parse currency string to number
 * @param {string} value - Currency string
 * @returns {number} Parsed number
 */
function parseCurrency(value) {
    return parseFloat(value.replace(/[^\d.-]/g, ''));
}

/**
 * Format date
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Debounce a function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay = 300) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

/**
 * Throttle a function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Confirm action before proceeding
 * @param {string} message - Confirmation message
 * @returns {boolean} User's response
 */
function confirmAction(message = 'Are you sure?') {
    return confirm(message);
}

/**
 * Clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// ==================== DOM Ready ====================

document.addEventListener('DOMContentLoaded', function () {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize Bootstrap popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Add active class to navigation links
    const currentLocation = location.pathname;
    const menuItems = document.querySelectorAll('.nav-link');
    menuItems.forEach((item) => {
        if (item.getAttribute('href') === currentLocation) {
            item.classList.add('active');
        }
    });
});

// ==================== Search & Filter ====================

/**
 * Search books
 * @param {string} query - Search query
 */
function searchBooks(query) {
    if (query.length < 1) {
        showToast('Please enter a search term', 'warning');
        return;
    }
    // Form submission handled by HTML form
}

/**
 * Filter books by department
 * @param {string} department - Department name
 */
function filterByDepartment(department) {
    // Form submission handled by HTML form
}

/**
 * Filter books by semester
 * @param {string} semester - Semester name
 */
function filterBySemester(semester) {
    // Form submission handled by HTML form
}

// ==================== Form Handling ====================

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
function validatePassword(password) {
    const result = {
        valid: true,
        strength: 'weak',
        messages: []
    };

    if (password.length < 6) {
        result.valid = false;
        result.messages.push('Password must be at least 6 characters');
    }

    if (!/[A-Z]/.test(password)) {
        result.messages.push('Password should contain uppercase letters');
    }

    if (!/[a-z]/.test(password)) {
        result.messages.push('Password should contain lowercase letters');
    }

    if (!/[0-9]/.test(password)) {
        result.messages.push('Password should contain numbers');
    }

    if (password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)) {
        result.strength = 'strong';
    } else if (password.length >= 6) {
        result.strength = 'medium';
    }

    return result;
}

/**
 * Validate file
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Allowed MIME types
 * @param {number} maxSize - Max file size in bytes
 * @returns {Object} Validation result
 */
function validateFile(file, allowedTypes = ['image/jpeg', 'image/png'], maxSize = 16 * 1024 * 1024) {
    const result = {
        valid: true,
        message: ''
    };

    if (!file) {
        result.valid = false;
        result.message = 'No file selected';
        return result;
    }

    if (!allowedTypes.includes(file.type)) {
        result.valid = false;
        result.message = `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
        return result;
    }

    if (file.size > maxSize) {
        result.valid = false;
        result.message = `File size exceeds ${maxSize / (1024 * 1024)}MB limit`;
        return result;
    }

    return result;
}

/**
 * Validate price
 * @param {string|number} price - Price to validate
 * @returns {Object} Validation result
 */
function validatePrice(price) {
    const result = {
        valid: true,
        message: ''
    };

    const numPrice = parseFloat(price);

    if (isNaN(numPrice)) {
        result.valid = false;
        result.message = 'Price must be a valid number';
        return result;
    }

    if (numPrice < 0) {
        result.valid = false;
        result.message = 'Price cannot be negative';
        return result;
    }

    return result;
}

// ==================== File Upload Preview ====================

/**
 * Preview image before upload
 * @param {Event} event - File input change event
 * @param {string} previewId - ID of preview element
 */
function previewImage(event, previewId = 'imagePreview') {
    const file = event.target.files[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
        showToast(validation.message, 'danger');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const previewElement = document.getElementById(previewId);
        if (previewElement) {
            previewElement.src = e.target.result;
            previewElement.style.display = 'block';
        }
    };
    reader.readAsDataURL(file);
}

// ==================== Modal Functions ====================

/**
 * Show a modal
 * @param {string} modalId - ID of the modal
 */
function showModal(modalId) {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}

/**
 * Hide a modal
 * @param {string} modalId - ID of the modal
 */
function hideModal(modalId) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) {
        modal.hide();
    }
}

// ==================== Table Functions ====================

/**
 * Sort table by column
 * @param {string} tableId - ID of the table
 * @param {number} columnIndex - Index of column to sort
 */
function sortTable(tableId, columnIndex) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const aValue = a.cells[columnIndex].textContent.trim();
        const bValue = b.cells[columnIndex].textContent.trim();

        // Try to parse as number
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);

        if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
        }

        // Fall back to string comparison
        return aValue.localeCompare(bValue);
    });

    rows.forEach((row) => tbody.appendChild(row));
}

// ==================== LocalStorage Functions ====================

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

/**
 * Get data from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Stored value or default
 */
function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
}

// ==================== Export Functions ====================

// Make functions globally available if needed
window.showToast = showToast;
window.formatCurrency = formatCurrency;
window.parseCurrency = parseCurrency;
window.formatDate = formatDate;
window.validateEmail = validateEmail;
window.validatePassword = validatePassword;
window.validateFile = validateFile;
window.validatePrice = validatePrice;
window.previewImage = previewImage;
window.showModal = showModal;
window.hideModal = hideModal;
window.sortTable = sortTable;
window.saveToStorage = saveToStorage;
window.getFromStorage = getFromStorage;
window.removeFromStorage = removeFromStorage;
