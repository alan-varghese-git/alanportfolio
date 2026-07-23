const fs = require('fs');

const applyStateBody = `    function applyState(data) {
        if (!data) return;

        // 1. Global Settings
        if (data.themeColor) {
            document.documentElement.style.setProperty('--primary-color', data.themeColor);
        }
        // Background animation toggle (if any)
        if (typeof animationType !== 'undefined' && data.bgAnimation) {
            animationType = data.bgAnimation;
        }

        // 2. Inline Text Edits
        if (data.edits) {
            const savedEdits = {};
            data.edits.forEach(edit => {
                savedEdits[edit.id] = edit.html;
            });
            document.querySelectorAll('[data-editable="true"]').forEach(el => {
                if (el.id && savedEdits[el.id] !== undefined) {
                    if (el.innerHTML !== savedEdits[el.id]) {
                        el.innerHTML = savedEdits[el.id];
                    }
                }
            });
        }

        // 3. Simple Array Render Loops
        const projectContainer = document.getElementById('projects-container');
        if (projectContainer && data.projects) {
            projectContainer.innerHTML = data.projects.map(p => \`
                <div class="glass-tile scroll-animate">
                    <h3 style="color: var(--primary-color); margin-bottom: 10px;">\${p.title}</h3>
                    <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.5;">\${p.description}</p>
                </div>
            \`).join('');
        }

        const expertiseContainer = document.getElementById('expertise-container');
        if (expertiseContainer && data.expertise) {
            expertiseContainer.innerHTML = data.expertise.map(e => \`
                <div class="glass-tile scroll-animate">
                    <h3 style="color: var(--primary-color); margin-bottom: 10px;">\${e.title}</h3>
                    <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.5;">\${e.description}</p>
                </div>
            \`).join('');
        }

        const certContainer = document.getElementById('certifications-container');
        if (certContainer && data.certifications) {
            certContainer.innerHTML = data.certifications.map(c => \`
                <div class="glass-tile scroll-animate">
                    <h3 style="color: var(--primary-color); margin-bottom: 10px;">\${c.title}</h3>
                    <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.5;">\${c.issuer}</p>
                </div>
            \`).join('');
        }
    }
`;

function injectApplyState(filename) {
    let content = fs.readFileSync(filename, 'utf8');
    
    // Inject applyState function right before loadState
    if (!content.includes('function applyState(')) {
        content = content.replace('function loadState() {', applyStateBody + '\n            function loadState() {');
    }

    fs.writeFileSync(filename, content);
}

injectApplyState('app.js');
injectApplyState('admin.js');

console.log("Injected applyState into both files!");
