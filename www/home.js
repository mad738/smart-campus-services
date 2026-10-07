import { auth, db, doc, getDoc, onAuthStateChanged, signOut } from "./firebase-init.js";

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Feather Icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    const userProfileDiv = document.querySelector('.user-profile');
    const profileImg = document.getElementById('profile-img');
    const profileDropdown = document.getElementById('profile-dropdown');
    const dropdownName = document.getElementById('dropdown-name');
    const dropdownEmail = document.getElementById('dropdown-email');
    const dropdownRole = document.getElementById('dropdown-role');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Update profile image
            const photoUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=a476f5&color=fff`;
            if (profileImg) profileImg.src = photoUrl;

            // Update dropdown info
            if (dropdownName) dropdownName.textContent = user.displayName || "User";
            if (dropdownEmail) dropdownEmail.textContent = user.email;

            // Fetch role from Firestore
            let userRole = 'student';
            try {
                const userSnap = await getDoc(doc(db, 'users', user.uid));
                if (userSnap.exists()) {
                    userRole = userSnap.data().role || 'student';
                    if (dropdownRole) dropdownRole.textContent = userRole;
                }
            } catch (err) {
                console.error("Error fetching role:", err);
            }

            const isAdmin = userRole === 'admin' || 
                            user.email === 'admin.test@campus.com' || 
                            user.email === 'admin@gmail.com' || 
                            user.email === 'admin@campus.com';

            // Add Admin button in navbar if admin
            const navActions = document.querySelector('.nav-actions');
            if (isAdmin && navActions && !document.getElementById('nav-admin-btn')) {
                const adminNavBtn = document.createElement('button');
                adminNavBtn.id = 'nav-admin-btn';
                adminNavBtn.className = 'btn btn-sm btn-primary';
                adminNavBtn.style.cssText = 'display: inline-flex; align-items: center; gap: 6px; font-weight: 600; margin-right: 6px; padding: 6px 12px; font-size: 12px;';
                adminNavBtn.innerHTML = `<i data-feather="shield" style="width: 14px; height: 14px;"></i> Admin Panel`;
                adminNavBtn.onclick = () => window.location.href = 'admin.html';
                navActions.insertBefore(adminNavBtn, navActions.firstChild);
                if (typeof feather !== 'undefined') feather.replace();
            }

            // Build dynamic dropdown popup for professional profile management
            const userProfileDiv = document.querySelector('.user-profile');
            if (userProfileDiv && !document.querySelector('.profile-popup')) {
                userProfileDiv.style.position = 'relative';
                
                const dropdown = document.createElement('div');
                dropdown.className = 'profile-popup glass-panel';
                dropdown.style.cssText = `
                    position: absolute;
                    top: 55px;
                    right: 0;
                    width: 230px;
                    padding: 15px;
                    border-radius: 12px;
                    display: none;
                    flex-direction: column;
                    gap: 6px;
                    z-index: 9999;
                    background: #1e1e24; /* Solid background to prevent text bleed */
                    box-shadow: 0 10px 30px rgba(0,0,0,0.8);
                    border: 1px solid rgba(255,255,255,0.1);
                `;
                
                let adminItemHtml = '';
                if (isAdmin) {
                    adminItemHtml = `
                        <div id="dynamic-admin-btn" style="padding: 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; color: var(--primary-color); font-size: 13px; font-weight: 600; background: rgba(164, 118, 245, 0.12); margin-bottom: 4px; transition: background 0.2s;" onmouseover="this.style.background='rgba(164, 118, 245, 0.22)'" onmouseout="this.style.background='rgba(164, 118, 245, 0.12)'">
                            <i data-feather="shield" style="width: 16px; height: 16px; margin-right: 10px; color: var(--primary-color);"></i> Admin Dashboard
                        </div>
                    `;
                }

                dropdown.innerHTML = `
                    <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 6px;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <span style="font-weight: 600; font-size: 14px; color: #fff;">${user.displayName || (isAdmin ? "Campus Admin" : "SmartCampus User")}</span>
                            ${isAdmin ? '<span class="status-badge" style="background: rgba(164,118,245,0.2); color: var(--primary-color); font-size: 10px; padding: 2px 6px;">ADMIN</span>' : ''}
                        </div>
                        <div style="font-size: 11px; color: #a1a1aa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 3px;">${user.email}</div>
                    </div>
                    ${adminItemHtml}
                    <div id="dynamic-profile-btn" style="padding: 9px 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; color: #e4e4e7; font-size: 13px; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='transparent'">
                        <i data-feather="user" style="width: 15px; height: 15px; margin-right: 10px;"></i> My Profile
                    </div>
                    <div id="dynamic-logout-btn" style="padding: 9px 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; color: #f57676; font-size: 13px; transition: background 0.2s;" onmouseover="this.style.background='rgba(245, 118, 118, 0.1)'" onmouseout="this.style.background='transparent'">
                        <i data-feather="log-out" style="width: 15px; height: 15px; margin-right: 10px;"></i> Sign Out
                    </div>
                `;
                
                userProfileDiv.appendChild(dropdown);
                if (typeof feather !== 'undefined') feather.replace();
                
                if (isAdmin) {
                    const adminBtn = document.getElementById('dynamic-admin-btn');
                    if (adminBtn) {
                        adminBtn.addEventListener('click', () => {
                            window.location.href = 'admin.html';
                        });
                    }
                }

                document.getElementById('dynamic-profile-btn').addEventListener('click', () => {
                    window.location.href = 'profile.html';
                });
                
                document.getElementById('dynamic-logout-btn').addEventListener('click', () => {
                    signOut(auth).then(() => {
                        window.location.href = 'index.html';
                    });
                });
                
                userProfileDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isHidden = dropdown.style.display === 'none';
                    dropdown.style.display = isHidden ? 'flex' : 'none';
                });
                
                document.addEventListener('click', (e) => {
                    if (!userProfileDiv.contains(e.target)) {
                        dropdown.style.display = 'none';
                    }
                });
            }
        } else {
            // User is signed out, redirect to login
            window.location.href = 'index.html';
        }
    });
});
