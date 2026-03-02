// ==================== Form Validation ====================

document.addEventListener('DOMContentLoaded', function () {
    // Get all forms that need validation
    const forms = document.querySelectorAll('form[novalidate]');

    forms.forEach((form) => {
        form.addEventListener('submit', function (event) {
            if (form.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
            }

            form.classList.add('was-validated');

            // Additional validation
            if (!validateFormInputs(form)) {
                event.preventDefault();
                event.stopPropagation();
            }
        }, false);
    });
});

/**
 * Validate form inputs
 * @param {HTMLFormElement} form - The form to validate
 * @returns {boolean} Whether form is valid
 */
function validateFormInputs(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach((input) => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });

    return isValid;
}

/**
 * Validate individual input
 * @param {HTMLElement} input - The input to validate
 * @returns {boolean} Whether input is valid
 */
function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    const name = input.name;
    let isValid = true;
    let errorMessage = '';

    // Check required
    if (input.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    // Validate email
    if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }

    // Validate password
    if (type === 'password' && value && input.hasAttribute('required')) {
        if (value.length < 6) {
            isValid = false;
            errorMessage = 'Password must be at least 6 characters';
        }
    }

    // Validate number
    if (type === 'number' && value) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            isValid = false;
            errorMessage = 'Please enter a valid number';
        }
        if (input.hasAttribute('min') && numValue < parseFloat(input.getAttribute('min'))) {
            isValid = false;
            errorMessage = `Value must be at least ${input.getAttribute('min')}`;
        }
    }

    // Validate file
    if (type === 'file' && input.files && input.files.length > 0) {
        const file = input.files[0];
        const allowedExts = ['jpg', 'jpeg', 'png'];
        const fileExt = file.name.split('.').pop().toLowerCase();

        if (!allowedExts.includes(fileExt)) {
            isValid = false;
            errorMessage = 'Only JPG and PNG files are allowed';
        }

        const maxSize = 16 * 1024 * 1024; // 16MB
        if (file.size > maxSize) {
            isValid = false;
            errorMessage = 'File size must not exceed 16MB';
        }
    }

    // Display validation message
    displayValidationMessage(input, isValid, errorMessage);

    return isValid;
}

/**
 * Display validation message
 * @param {HTMLElement} input - The input element
 * @param {boolean} isValid - Whether input is valid
 * @param {string} message - Error message
 */
function displayValidationMessage(input, isValid, message) {
    // Remove existing error message
    const existingError = input.parentElement.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }

    if (!isValid && message) {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');

        // Create and display error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback d-block';
        errorDiv.textContent = message;
        input.parentElement.appendChild(errorDiv);
    } else if (isValid && input.value.trim()) {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    } else {
        input.classList.remove('is-invalid', 'is-valid');
    }
}

/**
 * Real-time validation on input change
 */
document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('input, select, textarea');

    inputs.forEach((input) => {
        input.addEventListener('blur', function () {
            validateInput(this);
        });

        input.addEventListener('input', function () {
            // Clear error on input
            if (this.classList.contains('is-invalid')) {
                const existingError = this.parentElement.querySelector('.invalid-feedback');
                if (existingError) {
                    existingError.remove();
                }
                this.classList.remove('is-invalid');
            }
        });
    });
});

/**
 * Password strength indicator
 */
document.addEventListener('DOMContentLoaded', function () {
    const passwordInput = document.querySelector('input[name="password"]');
    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            const strength = getPasswordStrength(this.value);
            displayPasswordStrength(strength, this);
        });
    }
});

/**
 * Get password strength
 * @param {string} password - The password to check
 * @returns {string} Password strength level
 */
function getPasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength < 2) return 'weak';
    if (strength < 3) return 'fair';
    if (strength < 4) return 'good';
    return 'strong';
}

/**
 * Display password strength indicator
 * @param {string} strength - Password strength level
 * @param {HTMLElement} input - The password input
 */
function displayPasswordStrength(strength, input) {
    let existingIndicator = input.parentElement.querySelector('.password-strength');
    if (existingIndicator) {
        existingIndicator.remove();
    }

    if (input.value.length === 0) return;

    const indicator = document.createElement('div');
    indicator.className = 'password-strength mt-2';

    const colors = {
        weak: 'danger',
        fair: 'warning',
        good: 'info',
        strong: 'success'
    };

    indicator.innerHTML = `
        <div class="progress" style="height: 5px;">
            <div class="progress-bar bg-${colors[strength]}" style="width: ${(Object.keys(colors).indexOf(strength) + 1) * 25}%;"></div>
        </div>
        <small class="text-${colors[strength]}">Password strength: ${strength}</small>
    `;

    input.parentElement.appendChild(indicator);
}

/**
 * Match password validation
 */
document.addEventListener('DOMContentLoaded', function () {
    const confirmPasswordInput = document.querySelector('input[name="confirm_password"]');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('blur', function () {
            const passwordInput = document.querySelector('input[name="password"]');
            if (passwordInput && this.value !== passwordInput.value) {
                displayValidationMessage(this, false, 'Passwords do not match');
            }
        });
    }
});

/**
 * Price validation with real-time feedback
 */
document.addEventListener('DOMContentLoaded', function () {
    const priceInputs = document.querySelectorAll('input[name="price"]');
    priceInputs.forEach((input) => {
        input.addEventListener('blur', function () {
            const price = parseFloat(this.value);
            if (isNaN(price) || price < 0) {
                displayValidationMessage(this, false, 'Price must be a valid positive number');
            } else {
                displayValidationMessage(this, true, '');
            }
        });
    });
});

/**
 * Image upload preview and validation
 */
document.addEventListener('DOMContentLoaded', function () {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => {
        input.addEventListener('change', function (event) {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const allowedExts = ['jpg', 'jpeg', 'png'];
                const fileExt = file.name.split('.').pop().toLowerCase();

                if (!allowedExts.includes(fileExt)) {
                    displayValidationMessage(this, false, 'Only JPG and PNG files are allowed');
                    this.value = '';
                    return;
                }

                const maxSize = 16 * 1024 * 1024;
                if (file.size > maxSize) {
                    displayValidationMessage(this, false, 'File size must not exceed 16MB');
                    this.value = '';
                    return;
                }

                // Preview image
                const reader = new FileReader();
                reader.onload = (e) => {
                    const previewContainer = document.createElement('div');
                    previewContainer.className = 'mt-3';
                    previewContainer.innerHTML = `<img src="${e.target.result}" style="max-width: 150px; max-height: 150px; border-radius: 0.375rem;" alt="Preview">`;

                    const existingPreview = this.parentElement.querySelector('[data-preview]');
                    if (existingPreview) {
                        existingPreview.remove();
                    }

                    previewContainer.setAttribute('data-preview', 'true');
                    this.parentElement.appendChild(previewContainer);
                };
                reader.readAsDataURL(file);

                displayValidationMessage(this, true, '');
            }
        });
    });
});

// Export validation functions
window.validateFormInputs = validateFormInputs;
window.validateInput = validateInput;
window.getPasswordStrength = getPasswordStrength;
