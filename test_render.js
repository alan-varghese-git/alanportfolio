const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = `
<!DOCTYPE html>
<html>
<body>
    <div id="projects-container"></div>
    <div id="expertise-container"></div>
    <div id="certifications-container"></div>
</body>
</html>
`;

const dom = new JSDOM(html);
const document = dom.window.document;

const data = {
  "expertise": [
    { 
      "title": "JavaScript", 
      "description": "Building dynamic web experiences." 
    }
  ],
  "projects": [
    { 
      "title": "Portfolio CMS", 
      "description": "A fully serverless inline CMS. Static Rendering | GitHub API Save" 
    }
  ],
  "certifications": [
    { 
      "title": "BTech CSE", 
      "issuer": "University" 
    }
  ]
};

function applyState(data) {
    if (!data) return;

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

applyState(data);
console.log("Projects container HTML:");
console.log(document.getElementById('projects-container').innerHTML);
