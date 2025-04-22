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

// Form Validation and Authentication
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const rememberMeCheckbox = document.getElementById('rememberMe');

function validateForm(event) {
    event.preventDefault();
    let isValid = true;

    // Reset error messages
    emailError.style.display = 'none';
    passwordError.style.display = 'none';

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value)) {
        emailError.textContent = 'Please enter a valid email address';
        emailError.style.display = 'block';
        isValid = false;
    }

    // Password validation
    if (passwordInput.value.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters long';
        passwordError.style.display = 'block';
        isValid = false;
    }

    if (isValid) {
        // Save remember me preference
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('rememberedEmail', emailInput.value);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        // Simulate authentication (replace with actual authentication logic)
        authenticateUser(emailInput.value, passwordInput.value);
    }

    return false;
}

function authenticateUser(email, password) {
    // Simulate API call (replace with actual authentication API)
    setTimeout(() => {
        // For demo purposes, any login attempt is successful
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        window.location.href = 'index.html';
    }, 1000);
}

// Load remembered email if exists
function loadRememberedEmail() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberMeCheckbox.checked = true;
    }
}

// Check if user is already logged in
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!isLoggedIn && currentPage !== 'signup.html') {
        window.location.href = 'login.html';
    }
}

// Logout functionality
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference();
    loadRememberedEmail();
    checkLoginStatus();
});