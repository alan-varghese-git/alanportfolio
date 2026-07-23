const fs = require('fs');

let adminJs = fs.readFileSync('admin.js', 'utf8');

const target = `        } else {
            isAuthenticated = false;
            document.body.classList.remove('admin-mode'); // Disable editing only on logout
            closeAdminPanel();
        }`;

const replacement = `        } else {
            isAuthenticated = false;
            document.body.classList.remove('admin-mode');
            closeAdminPanel();
            if (typeof loginPopup !== 'undefined' && loginPopup) {
                loginPopup.classList.add('active');
                setTimeout(() => {
                    const emailInput = document.getElementById('admin-email');
                    if (emailInput) emailInput.focus();
                }, 100);
            }
        }`;

adminJs = adminJs.replace(target, replacement);
fs.writeFileSync('admin.js', adminJs);
console.log("Patched admin.js popup logic");
