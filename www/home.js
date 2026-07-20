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
            try {
                const userSnap = await getDoc(doc(db, 'users', user.uid));
                if (userSnap.exists()) {
                    const role = userSnap.data().role;
                    if (dropdownRole) dropdownRole.textContent = role;
                }
            } catch (err) {
                console.error("Error fetching role:", err);
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
                    width: 220px;
                    padding: 15px;
                    border-radius: 12px;
                    display: none;
                    flex-direction: column;
                    gap: 5px;
                    z-index: 9999;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.8);
                    border: 1px solid rgba(255,255,255,0.1);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                `;
                
                dropdown.innerHTML = `
                    <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 8px;">
                        <div style="font-weight: 600; font-size: 15px; color: #fff;">${user.displayName || "SmartCampus User"}</div>
                        <div style="font-size: 12px; color: #a1a1aa; word-break: break-all; margin-top: 2px;">${user.email}</div>
                    </div>
                    <div id="dynamic-profile-btn" style="padding: 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; color: #e4e4e7; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
                        <i data-feather="user" style="width: 16px; height: 16px; margin-right: 12px;"></i> My Profile
                    </div>
                    <div id="dynamic-logout-btn" style="padding: 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; color: #f57676; font-size: 14px; transition: background 0.2s;" onmouseover="this.style.background='rgba(245, 118, 118, 0.1)'" onmouseout="this.style.background='transparent'">
                        <i data-feather="log-out" style="width: 16px; height: 16px; margin-right: 12px;"></i> Sign Out
                    </div>
                `;
                
                userProfileDiv.appendChild(dropdown);
                if (typeof feather !== 'undefined') feather.replace();
                
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
