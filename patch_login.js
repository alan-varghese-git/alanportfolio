const fs = require('fs');

// Patch app.js
let appJs = fs.readFileSync('app.js', 'utf8');

// Replace the logoTrigger logic
appJs = appJs.replace(/logoTrigger\.addEventListener\('click', \(e\) => \{[\s\S]*?\}\);/, `logoTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = "admin.html";
    });`);

// Remove loginForm submit logic if it exists
appJs = appJs.replace(/loginForm\.addEventListener\('submit', \(e\) => \{[\s\S]*?\}\);/, '');
appJs = appJs.replace(/logoutBtn\.addEventListener\('click', \(\) => \{[\s\S]*?\}\);/, '');
appJs = appJs.replace(/function closeAdminPanel\(\) \{[\s\S]*?\}/, '');
fs.writeFileSync('app.js', appJs);

// Patch admin.js
let adminJs = fs.readFileSync('admin.js', 'utf8');

// Replace the redirect in auth.onAuthStateChanged
adminJs = adminJs.replace(/window\.location\.href = "index\.html"; \/\/ Redirect unauthorized/, `
            // Show login popup instead of kicking them out
            const loginPopup = document.getElementById('login-popup');
            if (loginPopup) {
                loginPopup.classList.add('active');
                setTimeout(() => document.getElementById('admin-email').focus(), 100);
            }`);
            
fs.writeFileSync('admin.js', adminJs);
console.log("Login patched");
