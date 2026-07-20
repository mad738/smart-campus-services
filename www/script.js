import { auth, db, provider, signInWithPopup, doc, getDoc, setDoc, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "./firebase-init.js";

document.addEventListener('DOMContentLoaded', () => {
    const roleChips = document.querySelectorAll('.role-chip');
    const googleSignInBtn = document.getElementById('google-signin-btn');
    const emailLoginForm = document.getElementById('email-login-form');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const emailSignupBtn = document.getElementById('email-signup-btn');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    let selectedRole = 'student'; // Default role

    // Toast Notification System
    const showToast = (message, type = 'info') => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'info';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'alert-circle';

        toast.innerHTML = `
            <i data-feather="${icon}" style="width: 20px; height: 20px; color: ${
                type === 'success' ? '#10b981' : type === 'error' ? '#f57676' : 'var(--primary-color)'
            };"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        if (typeof feather !== 'undefined') feather.replace();

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 400); // Wait for transition
        }, 3000);
    };

    window.showToast = showToast;

    // Global Modal System
    window.showGlobalModal = function(title, message, type = 'alert') {
        return new Promise((resolve) => {
            let overlay = document.getElementById('global-custom-modal');
            
            if (!overlay) {
                // Inject CSS
                const style = document.createElement('style');
                style.innerHTML = `
                    .global-modal-overlay {
                        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(0,0,0,0.6); backdrop-filter: blur(5px);
                        display: flex; align-items: center; justify-content: center;
                        z-index: 10000; opacity: 0; pointer-events: none; transition: opacity 0.3s;
                    }
                    .global-modal-overlay.active { opacity: 1; pointer-events: all; }
                    .global-modal-content {
                        background: rgba(30, 30, 35, 0.95); border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 16px; padding: 30px; width: 400px; max-width: 90%;
                        transform: translateY(20px); transition: transform 0.3s;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.5); color: #fff;
                    }
                    .global-modal-overlay.active .global-modal-content { transform: translateY(0); }
                    .global-modal-title { font-size: 20px; font-weight: 700; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
                    .global-modal-body { font-size: 14px; color: #a1a1aa; margin-bottom: 25px; line-height: 1.5; }
                    .global-modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
                `;
                document.head.appendChild(style);

                // Inject HTML
                overlay = document.createElement('div');
                overlay.id = 'global-custom-modal';
                overlay.className = 'global-modal-overlay';
                overlay.innerHTML = `
                    <div class="global-modal-content">
                        <div class="global-modal-title"><i data-feather="alert-triangle" id="global-modal-icon" style="color: #f59e0b;"></i> <span id="global-modal-title-text">Alert</span></div>
                        <div class="global-modal-body" id="global-modal-body-text">Message</div>
                        <div class="global-modal-actions">
                            <button class="btn btn-primary" id="global-modal-ok-btn" style="width: 100%;">Got it</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(overlay);
                if (typeof feather !== 'undefined') feather.replace();
            }

            document.getElementById('global-modal-title-text').innerText = title;
            document.getElementById('global-modal-body-text').innerHTML = message;
            
            const okBtn = document.getElementById('global-modal-ok-btn');
            overlay.classList.add('active');

            const cleanup = () => {
                overlay.classList.remove('active');
                okBtn.onclick = null;
            };

            okBtn.onclick = () => {
                cleanup();
                resolve(true);
            };
        });
    };

    const handleAuthSuccess = async (user) => {
        // Reference to the user document in Firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        let userRole = selectedRole;
        let isApproved = true;

        if (!userSnap.exists()) {
            // First time login: create user in Firestore
            const isVendor = ['food', 'xerox', 'delivery'].includes(selectedRole);
            isApproved = !isVendor; // Vendors start unapproved, students/admins start approved
            
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL || '',
                role: selectedRole,
                approved: isApproved,
                createdAt: new Date().toISOString()
            });
        } else {
            // Existing user: get their assigned role from database
            const userData = userSnap.data();
            userRole = userData.role;
            // If they are a vendor but 'approved' field is missing, default to true for legacy vendors
            // OR if 'approved' is explicitly false, keep it false
            if (['food', 'xerox', 'delivery'].includes(userRole)) {
                isApproved = userData.approved !== false;
            }
        }

        // Enforce vendor approval restriction
        if (['food', 'xerox', 'delivery'].includes(userRole) && !isApproved) {
            await signOut(auth);
            await window.showGlobalModal(
                'Approval Pending',
                'Your vendor account has been created successfully, but it requires Admin approval before you can access the dashboard.<br><br>Please contact the administrator or wait for approval.'
            );
            return;
        }

        // Enforce admin@gmail.com restriction
        if (userRole === 'admin' && user.email !== 'admin@gmail.com') {
            await signOut(auth);
            if (window.showToast) window.showToast('Access Denied: Only admin@gmail.com can log in as Admin.', 'error');
            return;
        }

        // Redirect based on role
        if (userRole === 'food') {
            window.location.href = 'vendor.html?type=food';
        } else if (userRole === 'xerox') {
            window.location.href = 'vendor.html?type=xerox';
        } else if (userRole === 'delivery') {
            window.location.href = 'delivery.html';
        } else if (userRole === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'home.html';
        }
    };

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

            // Set selected role
            selectedRole = chip.getAttribute('data-role');
        });
    });

    // Google Sign-In Logic
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', async () => {
            try {
                const result = await signInWithPopup(auth, provider);
                await handleAuthSuccess(result.user);
            } catch (error) {
                console.error("Error signing in with Google: ", error);
                showToast("Login failed: " + error.message, 'error');
            }
        });
    }

    // Email Login Logic
    if (emailLoginForm) {
        emailLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value;
            const password = passwordInput.value;
            try {
                const result = await signInWithEmailAndPassword(auth, email, password);
                await handleAuthSuccess(result.user);
            } catch (error) {
                console.error("Error signing in with Email: ", error);
                showToast("Login failed: " + error.message, 'error');
            }
        });
    }

    // Email Signup Logic
    if (emailSignupBtn) {
        emailSignupBtn.addEventListener('click', async () => {
            const email = emailInput.value;
            const password = passwordInput.value;
            if (!email || !password) {
                showToast("Please enter both email and password to sign up.", 'error');
                return;
            }
            try {
                const result = await createUserWithEmailAndPassword(auth, email, password);
                await handleAuthSuccess(result.user);
            } catch (error) {
                console.error("Error signing up with Email: ", error);
                showToast("Signup failed: " + error.message, 'error');
            }
        });
    }

    // Forgot Password Logic
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log("Forgot password link was clicked!");
            const email = emailInput.value;
            if (!email) {
                showToast("Please enter your email address first to reset your password.", 'info');
                return;
            }
            try {
                await sendPasswordResetEmail(auth, email);
                showToast("Password reset email sent! Check your inbox.", 'success');
            } catch (error) {
                console.error("Error sending reset email: ", error);
                showToast("Failed to send reset email: " + error.message, 'error');
            }
        });
    }
});
