// Theme Management
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    body.dataset.theme = body.dataset.theme === 'dark' ? 'light' : 'dark';
    themeToggle.innerHTML = body.dataset.theme === 'dark' ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
    saveThemePreference();
});

function loadThemePreference() {
    const theme = localStorage.getItem('theme') || 'light';
    body.dataset.theme = theme;
    themeToggle.innerHTML = theme === 'dark' ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
}

function saveThemePreference() {
    localStorage.setItem('theme', body.dataset.theme);
}

// Form Validation and Registration
const signupForm = document.getElementById('signupForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');

function validateForm(event) {
    event.preventDefault();
    let isValid = true;

    // Reset error messages
    nameError.style.display = 'none';
    emailError.style.display = 'none';
    passwordError.style.display = 'none';
    confirmPasswordError.style.display = 'none';

    // Name validation
    if (nameInput.value.trim().length < 2) {
        nameError.textContent = 'Name must be at least 2 characters long';
        nameError.style.display = 'block';
        isValid = false;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value)) {
        emailError.textContent = 'Please enter a valid email address';
        emailError.style.display = 'block';
        isValid = false;
    }

    // Password validation
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(passwordInput.value)) {
        passwordError.textContent = 'Password does not meet requirements';
        passwordError.style.display = 'block';
        isValid = false;
    }

    // Confirm password validation
    if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordError.textContent = 'Passwords do not match';
        confirmPasswordError.style.display = 'block';
        isValid = false;
    }

    if (isValid) {
        registerUser({
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value
        });
    }

    return false;
}

function registerUser(userData) {
    // Simulate API call (replace with actual registration API)
    setTimeout(() => {
        // For demo purposes, store user data in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userName', userData.name);
        
        // Redirect to main page
        window.location.href = 'index.html';
    }, 1000);
}

// Check if user is already logged in
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        window.location.href = 'index.html';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference();
    checkLoginStatus();
});