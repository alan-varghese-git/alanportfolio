const fs = require('fs');

const newSaveFn = `    async function savePortfolioStateToGitHub() {
        // Collect edits
        const edits = [];
        editableElements.forEach((el, index) => {
            if (!el.id) el.id = \`editable-node-\${index}\`;
            edits.push({ id: el.id, html: el.innerHTML });
        });

        const state = {
            themeColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
            bgAnimation: typeof animationType !== 'undefined' ? animationType : 'particles',
            popupsEnabled: document.getElementById('popups-toggle') ? document.getElementById('popups-toggle').checked : true,
            photoUrl: document.getElementById('profile-img') && document.getElementById('profile-img').src.startsWith('data:') ? document.getElementById('profile-img').src : null,
            edits: edits
        };

        // Fetch existing data.json to preserve the custom arrays
        try {
            const isGitHubPages = window.location.hostname.includes("github.io");
            const jsonPath = isGitHubPages ? "/alanportfolio/data.json" : "./data.json";
            const response = await fetch(jsonPath + '?t=' + new Date().getTime());
            if (response.ok) {
                const existingData = await response.json();
                // Preserve custom arrays
                if (existingData.projects) state.projects = existingData.projects;
                if (existingData.expertise) state.expertise = existingData.expertise;
                if (existingData.certifications) state.certifications = existingData.certifications;
            }
        } catch (e) {
            console.error("Failed to fetch existing data to preserve arrays:", e);
        }

        let githubToken = sessionStorage.getItem('github_pat');
        if (!githubToken) {
            githubToken = prompt("Enter your GitHub Personal Access Token to publish to data.json:");
            if (!githubToken) return false;
            sessionStorage.setItem('github_pat', githubToken);
        }

        const repoOwner = "alan-varghese-git";
        const repoName = "alanportfolio";
        const urlJson = \`https://api.github.com/repos/\${repoOwner}/\${repoName}/contents/data.json\`;

        try {
            let shaJson = null;
            const getResJson = await fetch(urlJson, { headers: { "Authorization": \`token \${githubToken}\` } });
            if (getResJson.ok) {
                const jsonData = await getResJson.json();
                shaJson = jsonData.sha;
            }
            
            const base64Json = btoa(unescape(encodeURIComponent(JSON.stringify(state, null, 2))));
            const putResJson = await fetch(urlJson, {
                method: "PUT",
                headers: {
                    "Authorization": \`token \${githubToken}\`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: "Update CMS state (text edits)",
                    content: base64Json,
                    sha: shaJson
                })
            });

            if (putResJson.ok) {
                return true;
            } else {
                if (putResJson.status === 401 || putResJson.status === 403) {
                    sessionStorage.removeItem('github_pat'); 
                }
                throw new Error("Failed to push data.json to GitHub.");
            }
        } catch (error) {
            throw error;
        }
    }`;

let content = fs.readFileSync('admin.js', 'utf8');

// The regex will match from async function savePortfolioStateToGitHub() { 
// down to the first occurrence of const addSectionBtn
const regex = /async function savePortfolioStateToGitHub\(\) \{[\s\S]*?(?=const addSectionBtn)/;

if (regex.test(content)) {
    content = content.replace(regex, newSaveFn + '\n\n    ');
    fs.writeFileSync('admin.js', content);
    console.log("Successfully replaced savePortfolioStateToGitHub.");
} else {
    console.error("Could not find savePortfolioStateToGitHub to replace.");
}
