document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const roleChips = document.querySelectorAll('.role-chip');

    // Initialize Feather Icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // Role Selection Logic
    roleChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Update active state UI
            roleChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            // Optionally auto-fill username based on role
            const role = chip.getAttribute('data-role');
            if (role === 'user') {
                usernameInput.value = 'user';
                usernameInput.placeholder = 'Username';
            } else if (role === 'food') {
                usernameInput.value = 'food';
                usernameInput.placeholder = 'Canteen Name';
            } else if (role === 'xerox') {
                usernameInput.value = 'xerox';
                usernameInput.placeholder = 'Xerox Center No.';
            } else if (role === 'delivery') {
                usernameInput.value = 'delivery';
                usernameInput.placeholder = 'Agent ID';
            } else if (role === 'admin') {
                usernameInput.value = 'admin';
                usernameInput.placeholder = 'Admin ID';
            }
        });
    });

    // Password visibility toggle
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            if (type === 'text') {
                togglePasswordBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                `;
            } else {
                togglePasswordBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye-off"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                `;
            }
        });
    }

    // Login logic
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = usernameInput.value.trim().toLowerCase();
            const password = passwordInput.value;

            // Role-based redirection
            if (username === 'vendor' || username === 'food') {
                window.location.href = 'vendor.html?type=food';
            } else if (username === 'xerox') {
                window.location.href = 'vendor.html?type=xerox';
            } else if (username === 'delivery') {
                window.location.href = 'delivery.html';
            } else if (username === 'admin') {
                window.location.href = 'admin.html';
            } else if (username === 'user' || username === 'student' || username === 'staff') {
                window.location.href = 'home.html';
            } else {
                // Default to home for any other entry for demo purposes
                window.location.href = 'home.html';
            }
        });
    }
});
