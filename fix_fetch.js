const fs = require('fs');

function fixFetch(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // In app.js and admin.js, find:
    // return fetch('./data.json')
    // and replace with:
    // const isGitHubPages = window.location.hostname.includes("github.io");
    // const jsonPath = isGitHubPages ? "/alanportfolio/data.json" : "./data.json";
    // return fetch(jsonPath + '?t=' + new Date().getTime())
    
    const replacement = `const isGitHubPages = window.location.hostname.includes("github.io");
                const jsonPath = isGitHubPages ? "/alanportfolio/data.json" : "./data.json";
                return fetch(jsonPath + '?t=' + new Date().getTime())`;
                
    content = content.replace(/return fetch\('\.\/data\.json'\)/g, replacement);
    fs.writeFileSync(file, content);
    console.log("Fixed", file);
}

fixFetch('app.js');
// Check if admin.js needs it too: admin.js has a loadState?
try {
    let adminContent = fs.readFileSync('admin.js', 'utf8');
    if (adminContent.includes("return fetch('./data.json')")) {
        fixFetch('admin.js');
    }
} catch (e) {}
