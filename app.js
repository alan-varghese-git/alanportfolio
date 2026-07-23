// Clear legacy cached data keys on load to prevent old template fallbacks
try {
    localStorage.clear();
    sessionStorage.clear();
} catch (e) {
    console.error("Storage clear error:", e);
}

// Unregister stale service workers
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            registration.unregister();
        }
    });
}
// Clear old browser caches
if ('caches' in window) {
    caches.keys().then(function(names) {
        for (let name of names) {
            caches.delete(name);
        }
    });
}

// Ensure all fetch requests bypass Safari caching
async function loadFreshContent(url) {
    const response = await fetch(url + '?t=' + new Date().getTime(), {
        cache: 'no-store'
    });
    return await response.text();
}

const firebaseConfig = {
    apiKey: "AIzaSyCEiDFvWsPif3_vC9V5vu7eBPMXl7TFfT8",
    authDomain: "alanportfolio-21b78.firebaseapp.com",
    projectId: "alanportfolio-21b78",
    storageBucket: "alanportfolio-21b78.appspot.com",
    messagingSenderId: "473600126183",
    appId: "1:473600126183:web:b4f1aaf7e1d2fc2ce98642"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const storage = firebase.storage();
storage.setMaxUploadRetryTime(15000); // 15 seconds (default is 10 minutes)
let isAuthenticated = false;

window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
});

document.addEventListener('DOMContentLoaded', () => {

    window.scrollTo(0, 0);
    // Clear any URL hash on initial load to prevent browser jump behavior
    if (window.location.hash && history.replaceState) {
        history.replaceState(null, null, window.location.pathname + window.location.search);
    }

    // Fix Home Navigation Scroll Offset
    const homeNavBtn = document.querySelector('a[href="#home"], .nav-home');
    if (homeNavBtn) {
        homeNavBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            // Remove hash fragment if it causes an unwanted jump
            if (history.pushState) {
                history.pushState(null, null, ' ');
            }
        });
    }

    // Scroll-Triggered Fade-In Animations
    const animatedElements = document.querySelectorAll('section, .glass-card, .glass-tile');

    animatedElements.forEach(el => el.classList.add('scroll-animate'));

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Triggers when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));

    // --- 1. Background Animation (Canvas) ---
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particlesArray = [];
    let animationType = 'particles'; // 'particles', 'waves', 'none'
    let waveOffset = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        draw() {
            const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
            ctx.fillStyle = primaryColor;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    function initParticles() {
        particlesArray = [];
        for (let i = 0; i < 100; i++) {
            particlesArray.push(new Particle());
        }
    }

    function drawWaves() {
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;

        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            for (let x = 0; x < canvas.width; x++) {
                const y = Math.sin(x * 0.005 + waveOffset + (i * 2)) * 100 + canvas.height / 2 + (i * 50);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        waveOffset += 0.01;
        ctx.globalAlpha = 1;
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (animationType === 'particles') {
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
        } else if (animationType === 'waves') {
            drawWaves();
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    initParticles();
    animate();

    // --- 2. Layout Controls ---
    const layoutControls = document.querySelectorAll('.layout-controls .btn-icon');
    layoutControls.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.parentElement.dataset.target;
            const targetGrid = document.getElementById(targetId);
            const layout = btn.dataset.layout;

            // Update buttons active state
            btn.parentElement.querySelectorAll('.btn-icon').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Apply class
            targetGrid.classList.remove('grid', 'list', 'stack', 'carousel');
            targetGrid.classList.add(layout);
        });
    });

    // --- 3. Pop-ups ---
    const popupTriggers = document.querySelectorAll('.popup-trigger');
    const closeBtns = document.querySelectorAll('.close-popup');
    const overlays = document.querySelectorAll('.glass-popup-overlay');
    const popupsToggle = document.getElementById('popups-toggle');

    popupTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!popupsToggle.checked) return; // Respect Admin setting
            const targetId = btn.dataset.target;
            document.getElementById(targetId).classList.add('active');
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.glass-popup-overlay').classList.remove('active');
        });
    });
    overlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // --- 4. Admin Panel Logic ---
    const adminPanel = document.getElementById('admin-panel');
    const logoTrigger = document.getElementById('logo-trigger');
    const closeAdminBtn = document.getElementById('close-admin-btn');
    const adminHeaderDrag = document.getElementById('admin-header-drag');

    const loginPopup = document.getElementById('login-popup');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    let initialLoadComplete = false;
    auth.onAuthStateChanged((user) => {
        if (user) {
            isAuthenticated = true;
            document.body.classList.add('admin-mode'); // Enable editing globally
        } else {
            isAuthenticated = false;
            document.body.classList.remove('admin-mode'); // Disable editing only on logout
            closeAdminPanel();
        }

        if (!initialLoadComplete) {
            initialLoadComplete = true;



            // Quietly fetch Firebase data in the background
            try {
                loadState().catch(error => {
                    console.error("Firebase load error:", error);
                });
            } catch (err) {
                console.error("Synchronous error during loadState:", err);
            }
        }
    });

    function closeAdminPanel() {
        adminPanel.classList.remove('open');
        adminPanel.style.transform = 'translate(-50%, -50%) scale(0.95)';
    }

    logoTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isAuthenticated) {
            const isOpen = adminPanel.classList.toggle('open');

            if (isOpen) {
                adminPanel.style.transform = 'translate(-50%, -50%) scale(1)';
                adminPanel.style.left = '50%';
                adminPanel.style.top = '50%';
            } else {
                adminPanel.style.transform = 'translate(-50%, -50%) scale(0.95)';
            }
        } else {
            loginPopup.classList.add('active');
            loginError.style.display = 'none';

            // Remove readonly protection right when user actively opens the modal
            setTimeout(() => {
                document.getElementById('admin-email').removeAttribute('readonly');
                document.getElementById('admin-password').removeAttribute('readonly');
            }, 150);
        }
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;

        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                loginPopup.classList.remove('active');
                loginForm.reset();
                // Open panel on login
                adminPanel.classList.add('open');
                document.body.classList.add('admin-mode');
                adminPanel.style.transform = 'translate(-50%, -50%) scale(1)';
                adminPanel.style.left = '50%';
                adminPanel.style.top = '50%';
            })
            .catch((error) => {
                loginError.textContent = "Invalid email or password";
                loginError.style.display = 'block';
            });
    });

    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    closeAdminBtn.addEventListener('click', closeAdminPanel);


    // Draggable Admin Modal
    let isDraggingAdmin = false;
    let dragStartX, dragStartY, initialLeft, initialTop;

    adminHeaderDrag.addEventListener('mousedown', (e) => {
        if (e.target.closest('#close-admin-btn')) return;
        isDraggingAdmin = true;

        const rect = adminPanel.getBoundingClientRect();
        adminPanel.style.transform = 'none';
        adminPanel.style.left = rect.left + 'px';
        adminPanel.style.top = rect.top + 'px';

        dragStartX = e.clientX;
        dragStartY = e.clientY;
        initialLeft = rect.left;
        initialTop = rect.top;
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDraggingAdmin) {
            e.preventDefault();
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            adminPanel.style.left = (initialLeft + dx) + 'px';
            adminPanel.style.top = (initialTop + dy) + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDraggingAdmin = false;
        document.body.style.userSelect = '';
    });

    // Theme Colors
    const swatches = document.querySelectorAll('.swatch');
    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            swatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            const color = swatch.dataset.color;
            document.documentElement.style.setProperty('--primary-color', color);
        });
    });

    // Profile Photo Upload
    const uploadPhoto = document.getElementById('upload-photo');
    const profileImg = document.getElementById('main-profile-img');
    uploadPhoto.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profileImg.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Text Editor Mode
    const editModeToggle = document.getElementById('edit-mode-toggle');
    const editableElements = Array.from(document.querySelectorAll('[data-editable="true"]'));
    function addDeleteButtonToTile(tile) {
        // Prevent duplicate delete buttons
        if (tile.querySelector('.delete-tile-btn')) return;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-tile-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.title = 'Delete Tile';

        // Style to position it neatly inside the tile (e.g., top-right corner)
        deleteBtn.style.cssText = 'position: absolute; top: 10px; right: 10px; background: rgba(255, 0, 0, 0.7); border: none; color: white; padding: 6px 10px; border-radius: 4px; cursor: pointer; z-index: 10; display: none;';

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent opening the edit modal
            if (confirm('Are you sure you want to delete this tile?')) {
                tile.remove();
            }
        });

        tile.style.position = 'relative'; // Ensure absolute positioning works for the button
        tile.appendChild(deleteBtn);
    }

    function toggleAdminMode(enabled) {
        document.querySelectorAll('.glass-tile').forEach(tile => {
            addDeleteButtonToTile(tile);
            const btn = tile.querySelector('.delete-tile-btn');
            if (btn) {
                btn.style.display = enabled ? 'block' : 'none';
            }
        });
    }


    editModeToggle.addEventListener('change', (e) => {
        const isEditable = e.target.checked;
        editableElements.forEach(el => {
            el.contentEditable = isEditable;
            if (isEditable) {
                el.style.cursor = 'text';
            } else {
                el.style.cursor = '';
                // Clean formatting on blur
                el.blur();
            }
        });
        toggleAdminMode(isEditable);
    });

    // Background Animation setting
    const bgAnimationSelect = document.getElementById('bg-animation-select');
    bgAnimationSelect.addEventListener('change', (e) => {
        animationType = e.target.value;
        if (animationType === 'particles') initParticles();
    });

    // --- 5. Drag & Drop Reordering (Basic implementation) ---
    let draggedItem = null;
    const draggables = Array.from(document.querySelectorAll('.glass-tile'));

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggedItem = draggable;
            setTimeout(() => draggable.style.opacity = '0.5', 0);
        });

        draggable.addEventListener('dragend', () => {
            setTimeout(() => {
                draggable.style.opacity = '1';
                draggedItem = null;
            }, 0);
        });
    });

    const grids = document.querySelectorAll('.glass-grid');
    grids.forEach(grid => {
        grid.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(grid, e.clientY, e.clientX);
            if (draggedItem) {
                if (afterElement == null) {
                    grid.appendChild(draggedItem);
                } else {
                    grid.insertBefore(draggedItem, afterElement);
                }
            }
        });
    });

    function getDragAfterElement(container, y, x) {
        const draggableElements = [...container.querySelectorAll('.glass-tile:not([style*="opacity: 0.5"])')];

        // This is a simplified check. Works well for stacked, decent for grids
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            // Checking both x and y distances
            const offset = (container.classList.contains('stack') || container.classList.contains('carousel'))
                ? y - box.top - box.height / 2
                : (y - box.top - box.height / 2) + (x - box.left - box.width / 2);

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // --- 5b. Tile Editing & Dynamic Popups ---
    let currentEditingTile = null;
    const tileSettingsPopup = document.getElementById('tile-settings-popup');
    const tileSettingsForm = document.getElementById('tile-settings-form');
    const tileIconInput = document.getElementById('tile-icon-input');

    const projectPopup = document.getElementById('project-popup');
    const popupProjTitle = document.getElementById('popup-proj-title');
    const popupProjSubtitle = document.getElementById('popup-proj-subtitle');
    const popupProjTech = document.getElementById('popup-proj-tech');
    const popupProjOverview = document.getElementById('popup-proj-overview');
    const popupProjFeatures = document.getElementById('popup-proj-features');
    const popupProjLink = document.getElementById('popup-proj-link');

    const largeTileEditPopup = document.getElementById('large-tile-edit-popup');
    const largeTileForm = document.getElementById('large-tile-form');
    const largeTileTitle = document.getElementById('large-tile-title');
    const largeTileSubtitle = document.getElementById('large-tile-subtitle');
    const largeTileTech = document.getElementById('large-tile-tech');
    const largeTileOverview = document.getElementById('large-tile-overview');
    const largeTileFeatures = document.getElementById('large-tile-features');
    const largeTileImageFile = document.getElementById('large-tile-image-file');
    const largeTileImageUrl = document.getElementById('large-tile-image-url');

    function renderTile(tile) {
        if (tile.classList.contains('expertise-tile')) {
            const iconVal = tile.dataset.icon;
            if (!iconVal) return;
            let iconEl = tile.querySelector('i, svg, img');
            if (iconEl && !iconEl.classList.contains('drag-handle')) iconEl.remove(); // keep drag handle safe if any

            if (iconVal.startsWith('<svg')) {
                tile.insertAdjacentHTML('afterbegin', iconVal);
            } else if (iconVal.startsWith('http') || iconVal.startsWith('data:')) {
                const img = document.createElement('img');
                img.src = iconVal;
                img.style.width = '32px';
                img.style.height = '32px';
                tile.insertBefore(img, tile.firstChild);
            } else if (iconVal) {
                const i = document.createElement('i');
                i.className = iconVal + ' highlight-text';
                tile.insertBefore(i, tile.firstChild);
            }
        } else if (tile.classList.contains('vertical-tile')) {
            let imgContainer = tile.querySelector('.tile-image, .tile-img-tag');
            if (imgContainer) {
                if (tile.dataset.image) {
                    if (imgContainer.tagName.toLowerCase() === 'img') {
                        imgContainer.src = tile.dataset.image;
                    } else {
                        const img = document.createElement('img');
                        img.src = tile.dataset.image;
                        img.className = 'tile-img-tag';
                        tile.replaceChild(img, imgContainer);
                    }
                } else {
                    if (imgContainer.tagName.toLowerCase() === 'img') {
                        const div = document.createElement('div');
                        div.className = 'tile-image placeholder-img';
                        tile.replaceChild(div, imgContainer);
                    } else {
                        imgContainer.innerHTML = '';
                    }
                }
            }
        }
    }

    draggables.forEach((tile, index) => {
        if (!tile.id) tile.id = `tile-node-${index}`;

        tile.addEventListener('click', (e) => {
            if (draggedItem) return;
            if (e.target.isContentEditable) return;

            const isLarge = tile.classList.contains('vertical-tile');
            const isSmall = tile.classList.contains('expertise-tile');

            if (document.body.classList.contains('admin-mode')) {
                currentEditingTile = tile;
                if (isSmall) {
                    tileIconInput.value = tile.dataset.icon || '';
                    tileSettingsPopup.classList.add('active');
                } else if (isLarge) {
                    const titleEl = tile.querySelector('h3');
                    largeTileTitle.value = titleEl ? titleEl.innerText : '';
                    largeTileSubtitle.value = tile.dataset.subtitle || '';
                    largeTileTech.value = tile.dataset.tech || '';
                    largeTileOverview.value = tile.dataset.desc || tile.querySelector('p')?.innerText || '';
                    largeTileFeatures.value = tile.dataset.features || '';
                    largeTileImageUrl.value = tile.dataset.image || '';
                    largeTileImageFile.value = ''; // Reset file input

                    largeTileEditPopup.classList.add('active');
                }
            } else {
                if (isLarge) {
                    const titleEl = tile.querySelector('h3');
                    popupProjTitle.innerHTML = titleEl ? titleEl.innerHTML : 'Details';
                    popupProjSubtitle.innerHTML = tile.dataset.subtitle || '';

                    popupProjTech.innerHTML = '';
                    if (tile.dataset.tech) {
                        const tags = tile.dataset.tech.split(',').map(s => s.trim()).filter(s => s);
                        tags.forEach(tag => {
                            const span = document.createElement('span');
                            span.className = 'tech-stack-tag';
                            span.innerText = tag;
                            popupProjTech.appendChild(span);
                        });
                    }

                    popupProjOverview.innerHTML = tile.dataset.desc || tile.querySelector('p')?.innerHTML || '';

                    popupProjFeatures.innerHTML = '';
                    if (tile.dataset.features) {
                        const feats = tile.dataset.features.split(',').map(s => s.trim()).filter(s => s);
                        feats.forEach(feat => {
                            const li = document.createElement('li');
                            li.innerText = feat;
                            popupProjFeatures.appendChild(li);
                        });
                    }

                    if (tile.dataset.link) {
                        popupProjLink.href = tile.dataset.link;
                        popupProjLink.style.display = 'inline-block';
                    } else {
                        popupProjLink.style.display = 'none';
                    }

                    projectPopup.classList.add('active');
                }
            }
        });
    });

    if (tileSettingsForm) {
        tileSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentEditingTile || !currentEditingTile.classList.contains('expertise-tile')) return;
            currentEditingTile.dataset.icon = tileIconInput.value.trim();
            renderTile(currentEditingTile);
            tileSettingsPopup.classList.remove('active');
        });
    }

    if (largeTileForm) {
        largeTileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentEditingTile || !currentEditingTile.classList.contains('vertical-tile')) return;

            const submitBtn = largeTileForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = "Saving...";

            try {
                console.log("1. Save sequence started.");
                // 1. Storage Block
                let finalImageUrl = largeTileImageUrl.value.trim();
                const file = largeTileImageFile.files[0];
                if (file) {
                    // Enforce 700KB limit to stay under Firestore's 1MB document limit
                    if (file.size > 700 * 1024) {
                        alert("Image is too large. Please compress it below 700KB.");
                        submitBtn.innerText = "Save";
                        submitBtn.disabled = false;
                        return;
                    }

                    console.log("Converting image to Base64...");
                    try {
                        finalImageUrl = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = error => reject(error);
                        });
                        console.log("Image successfully converted to Data URL.");
                    } catch (error) {
                        console.error("FileReader Error:", error);
                        alert("Failed to read image file.");
                        submitBtn.innerText = "Save";
                        submitBtn.disabled = false;
                        return;
                    }
                }

                // Update local DOM data
                const titleEl = currentEditingTile.querySelector('h3');
                if (titleEl) titleEl.innerText = largeTileTitle.value.trim();
                const descEl = currentEditingTile.querySelector('p');
                if (descEl) descEl.innerText = largeTileOverview.value.trim();

                currentEditingTile.dataset.subtitle = largeTileSubtitle.value.trim();
                currentEditingTile.dataset.tech = largeTileTech.value.trim();
                currentEditingTile.dataset.desc = largeTileOverview.value.trim();
                currentEditingTile.dataset.features = largeTileFeatures.value.trim();
                currentEditingTile.dataset.image = finalImageUrl;

                renderTile(currentEditingTile);
                largeTileEditPopup.classList.remove('active');

                // 2. Firestore Block
                try {
                    await savePortfolioStateToFirestore();
                } catch (error) {
                    console.error("Save failed:", error);
                    alert("Firestore Error: " + error.code);
                }
            } catch (fatalError) {
                console.error("Fatal Save Error:", fatalError);
                alert(`Fatal Error: ${fatalError.message}`);
            } finally {
                console.log("6. Finally block reached. Resetting button.");
                // This MUST execute no matter what crashes above
                submitBtn.innerText = "Save";
                submitBtn.disabled = false;
            }
        });
    }

    // --- 6. Persistence (Save State) ---
    function attachLayoutControls(controlsContainer) {
        controlsContainer.querySelectorAll('.btn-icon').forEach(btn => {
            btn.addEventListener('click', () => {
                controlsContainer.querySelectorAll('.btn-icon').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const targetGridId = controlsContainer.dataset.target;
                const grid = document.getElementById(targetGridId);
                if (grid) {
                    grid.classList.remove('grid', 'stack', 'list', 'carousel');
                    grid.classList.add(btn.dataset.layout);
                }
            });
        });
    }

    // Attach to existing controls
    document.querySelectorAll('.layout-controls').forEach(controls => {
        attachLayoutControls(controls);
    });

    window.createNewTile = function(gridElement, isExpertise = false, addTileBtnElement = null, existingTileId = null) {
        let grid = typeof gridElement === 'string' ? document.getElementById(gridElement) : gridElement;
        if (!grid) return;
        
        const tileId = existingTileId || `tile-node-${Date.now()}`;
        const newTile = document.createElement('div');
        newTile.className = 'glass-tile ' + (isExpertise ? 'expertise-tile' : 'vertical-tile');
        newTile.draggable = true;
        newTile.id = tileId;
        
        if (isExpertise) {
            newTile.dataset.icon = 'fas fa-star';
            newTile.innerHTML = `
                <i class="fas fa-star highlight-text"></i>
                <h3 class="tile-title" data-editable="true" id="${tileId}-title">New Skill</h3>
            `;
        } else {
            newTile.dataset.image = '';
            newTile.dataset.subtitle = 'Subtitle';
            newTile.dataset.tech = 'Tech 1';
            newTile.dataset.desc = 'Description...';
            newTile.dataset.features = 'Feature 1';
            newTile.innerHTML = `
                <div class="drag-handle admin-only" style="display: ${document.body.classList.contains('admin-mode') ? 'flex' : 'none'};"><i class="fa-solid fa-grip-lines"></i></div>
                <div class="tile-image placeholder-img"></div>
                <h3 class="highlight-text" data-editable="true" id="${tileId}-title">New Project</h3>
                <p data-editable="true" id="${tileId}-desc">Short description...</p>
            `;
        }
        
        newTile.querySelectorAll('[data-editable="true"]').forEach(el => {
            if (!editableElements.includes(el)) editableElements.push(el);
            if (document.body.classList.contains('admin-mode')) {
                el.contentEditable = true;
                el.style.cursor = 'text';
            }
        });
        
        if (!addTileBtnElement) addTileBtnElement = grid.querySelector('.add-tile-btn');
        if (addTileBtnElement) grid.insertBefore(newTile, addTileBtnElement);
        else grid.appendChild(newTile);
        
        if (!draggables.includes(newTile)) draggables.push(newTile);
        attachTileListeners(newTile);
        newTile.addEventListener('click', handleTileClick);
        renderTile(newTile);
        
        addDeleteButtonToTile(newTile);
        const isEditable = document.getElementById('edit-mode-toggle') && document.getElementById('edit-mode-toggle').checked;
        const btn = newTile.querySelector('.delete-tile-btn');
        if (btn) btn.style.display = isEditable ? 'block' : 'none';
        
        return newTile;
    };

    window.createNewSection = function(sectionName, existingSecId = null, existingTitleId = null, existingGridId = null) {
        const sectionId = existingSecId || `section-${Date.now()}`;
        const gridId = existingGridId || `grid-${Date.now()}`;
        const titleId = existingTitleId || `title-${Date.now()}`;
        const section = document.createElement('section');
        section.id = sectionId;
        section.className = 'dynamic-section';
        
        section.innerHTML = `
            <div class="section-header">
                <h2 data-editable="true" id="${titleId}">${sectionName}</h2>
                <div class="layout-controls admin-only" data-target="${gridId}" style="display: ${document.body.classList.contains('admin-mode') ? 'flex' : 'none'};">
                    <button class="btn-icon active" data-layout="grid"><i class="fa-solid fa-border-all"></i></button>
                    <button class="btn-icon" data-layout="stack"><i class="fa-solid fa-layer-group"></i></button>
                    <button class="btn-icon" data-layout="carousel"><i class="fa-solid fa-images"></i></button>
                </div>
            </div>
            <div class="glass-grid layout-grid grid" id="${gridId}">
                <button class="btn btn-outline add-tile-btn admin-only" data-grid="${gridId}" style="display: ${document.body.classList.contains('admin-mode') ? 'block' : 'none'}; width: 100%;"><i class="fa-solid fa-plus"></i> Add Tile</button>
            </div>
        `;
        
        document.querySelector('main').appendChild(section);
        section.querySelectorAll('[data-editable="true"]').forEach(el => {
            if (!editableElements.includes(el)) editableElements.push(el);
        });
        attachLayoutControls(section.querySelector('.layout-controls'));
        return section;
    };

    window.handleTileClick = function(e) {
        const tile = e.currentTarget;
        if (typeof draggedItem !== 'undefined' && draggedItem) return;
        if (e.target.isContentEditable) return;

        const isLarge = tile.classList.contains('vertical-tile');
        const isSmall = tile.classList.contains('expertise-tile');

        if (document.body.classList.contains('admin-mode')) {
            currentEditingTile = tile;
            if (isSmall) {
                tileIconInput.value = tile.dataset.icon || '';
                tileSettingsPopup.classList.add('active');
            } else if (isLarge) {
                const titleEl = tile.querySelector('h3.tile-title') || tile.querySelector('h3');
                largeTileTitle.value = titleEl ? titleEl.innerText : '';
                largeTileSubtitle.value = tile.dataset.subtitle || '';
                largeTileTech.value = tile.dataset.tech || '';
                largeTileOverview.value = tile.dataset.desc || tile.querySelector('p')?.innerText || '';
                largeTileFeatures.value = tile.dataset.features || '';
                largeTileImageUrl.value = tile.dataset.image || '';
                largeTileImageFile.value = '';

                largeTileEditPopup.classList.add('active');
            }
        } else {
            if (isLarge) {
                const titleEl = tile.querySelector('h3.tile-title') || tile.querySelector('h3');
                popupProjTitle.innerHTML = titleEl ? titleEl.innerHTML : 'Details';
                popupProjSubtitle.innerHTML = tile.dataset.subtitle || '';

                popupProjTech.innerHTML = '';
                if (tile.dataset.tech) {
                    const tags = tile.dataset.tech.split(',').map(s => s.trim()).filter(s => s);
                    tags.forEach(tag => {
                        const span = document.createElement('span');
                        span.className = 'tech-stack-tag';
                        span.innerText = tag;
                        popupProjTech.appendChild(span);
                    });
                }

                popupProjOverview.innerHTML = tile.dataset.desc || tile.querySelector('p')?.innerHTML || '';

                popupProjFeatures.innerHTML = '';
                if (tile.dataset.features) {
                    const feats = tile.dataset.features.split(',').map(s => s.trim()).filter(s => s);
                    feats.forEach(feat => {
                        const li = document.createElement('li');
                        li.innerText = feat;
                        popupProjFeatures.appendChild(li);
                    });
                }

                if (tile.dataset.link) {
                    popupProjLink.href = tile.dataset.link;
                    popupProjLink.style.display = 'inline-block';
                } else {
                    popupProjLink.style.display = 'none';
                }

                projectPopup.classList.add('active');
            }
        }
    };

    function attachTileListeners(tile) {
        tile.addEventListener('dragstart', () => {
            if (!document.body.classList.contains('admin-mode')) return;
            draggedItem = tile;
            setTimeout(() => tile.classList.add('dragging'), 0);
        });

        tile.addEventListener('dragend', () => {
            if (!document.body.classList.contains('admin-mode')) return;
            draggedItem = null;
            tile.classList.remove('dragging');
            // Re-enable content editable after drag
            if (editModeToggle && editModeToggle.checked) {
                document.querySelectorAll('[data-editable="true"]').forEach(el => el.setAttribute('contenteditable', 'true'));
            }
        });

        tile.addEventListener('click', handleTileClick);
    }

    async function savePortfolioStateToGitHub() {
        // Collect edits
        const edits = [];
        editableElements.forEach((el, index) => {
            if (!el.id) el.id = `editable-node-${index}`;
            edits.push({ id: el.id, html: el.innerHTML });
        });

        // Collect sections and their ordered tile IDs
        const sectionsData = [];
        document.querySelectorAll('main > section').forEach(sec => {
            const titleEl = sec.querySelector('.section-header h2');
            const titleId = titleEl ? titleEl.id : null;
            const isDynamic = sec.classList.contains('dynamic-section');
            const isExpertise = sec.classList.contains('expertise-section'); // to know what type of tiles to generate
            const grid = sec.querySelector('.glass-grid');
            const gridId = grid ? grid.id : null;
            
            const tileIds = [];
            if (grid) {
                grid.querySelectorAll('.glass-tile').forEach(tile => {
                    tileIds.push(tile.id);
                });
            }
            sectionsData.push({
                id: sec.id,
                titleId: titleId,
                gridId: gridId,
                isDynamic: isDynamic,
                isExpertise: isExpertise,
                tileIds: tileIds
            });
        });

        // Collect tiles data
        const tilesData = [];
        document.querySelectorAll('.glass-tile').forEach(tile => {
            tilesData.push({
                id: tile.id,
                icon: tile.dataset.icon || '',
                image: tile.dataset.image || '',
                link: tile.dataset.link || '',
                subtitle: tile.dataset.subtitle || '',
                tech: tile.dataset.tech || '',
                desc: tile.dataset.desc || '',
                features: tile.dataset.features || ''
            });
        });
        const layouts = {};
        document.querySelectorAll('.layout-grid').forEach(grid => {
            if (grid.classList.contains('stack')) layouts[grid.id] = 'stack';
            else if (grid.classList.contains('carousel')) layouts[grid.id] = 'carousel';
            else if (grid.classList.contains('list')) layouts[grid.id] = 'list';
            else layouts[grid.id] = 'grid';
        });

        const state = {
            themeColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
            bgAnimation: animationType,
            popupsEnabled: popupsToggle.checked,
            edits: edits,
            sections: sectionsData,
            layouts: layouts,
            photoUrl: profileImg.src.startsWith('data:') ? profileImg.src : null,
            tilesData: tilesData
        };

        let githubToken = sessionStorage.getItem('github_pat');
        if (!githubToken) {
            githubToken = prompt("Enter your GitHub Personal Access Token to save changes to data.json:");
            if (!githubToken) return Promise.reject(new Error("No GitHub PAT provided"));
            sessionStorage.setItem('github_pat', githubToken);
        }

        const repoOwner = "alan-varghese-git";
        const repoName = "alanportfolio";
        const filePath = "data.json";
        const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

        try {
            // 1. Get current file SHA
            const getRes = await fetch(url, {
                headers: { "Authorization": `token ${githubToken}` }
            });
            let sha = null;
            if (getRes.ok) {
                const fileData = await getRes.json();
                sha = fileData.sha;
            }

            // 2. Push updated commit
            const contentString = JSON.stringify(state, null, 2);
            // Safe Base64 encoding for Unicode
            const base64Content = btoa(unescape(encodeURIComponent(contentString)));
            
            const putRes = await fetch(url, {
                method: "PUT",
                headers: {
                    "Authorization": `token ${githubToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: "Update portfolio content via Admin panel",
                    content: base64Content,
                    sha: sha
                })
            });

            if (putRes.ok) {
                return true;
            } else {
                if (putRes.status === 401 || putRes.status === 403) {
                    sessionStorage.removeItem('github_pat'); // clear invalid token
                }
                const errorData = await putRes.json();
                throw new Error(errorData.message || "Failed to push to GitHub");
            }
        } catch (error) {
            throw error;
        }
    }

    const addSectionBtn = document.getElementById('add-section-btn');
    if (addSectionBtn) {
        addSectionBtn.addEventListener('click', () => {
            const sectionName = prompt("Enter section name:");
            if (sectionName) createNewSection(sectionName);
        });
    }

    const saveBtn = document.getElementById('save-btn');
    saveBtn.addEventListener('click', () => {
        savePortfolioStateToGitHub().then(() => {
            const originalText = saveBtn.innerText;
            saveBtn.innerText = "Saved!";
            saveBtn.style.backgroundColor = '#10b981';
            setTimeout(() => {
                saveBtn.innerText = originalText;
                saveBtn.style.backgroundColor = '';
            }, 2000);
        }).catch(error => {
            console.error("Error saving state to GitHub:", error);
            alert(`Save Error: ${error.message}`);
            saveBtn.innerText = "Error!";
        });
    });



    // Load state
    async function loadState() {
        try {
            const response = await fetch('./data.json?t=' + new Date().getTime());
            if (!response.ok) return;
            const state = await response.json();
            
            if (Object.keys(state).length === 0) return; // empty data.json

            if (state) {

                // Restore theme
                document.documentElement.style.setProperty('--primary-color', state.themeColor);

                // Restore UI controls
                if (state.bgAnimation) {
                    bgAnimationSelect.value = state.bgAnimation;
                    animationType = state.bgAnimation;
                }
                if (state.popupsEnabled !== undefined) {
                    popupsToggle.checked = state.popupsEnabled;
                }

                if (state.layouts) {
                    Object.keys(state.layouts).forEach(gridId => {
                        const grid = document.getElementById(gridId);
                        if (grid) {
                            const layout = state.layouts[gridId];
                            grid.className = `glass-grid layout-grid ${gridId} ${layout}`;

                            const controls = document.querySelector(`[data-target="${gridId}"]`);
                            if (controls) {
                                controls.querySelectorAll('.btn-icon').forEach(b => b.classList.remove('active'));
                                const activeBtn = controls.querySelector(`[data-layout="${layout}"]`);
                                if (activeBtn) activeBtn.classList.add('active');
                            }
                        }
                    });
                }

                const savedEdits = {};
                if (state.edits) {
                    state.edits.forEach(edit => {
                        savedEdits[edit.id] = edit.html;
                    });
                }
                
                // Restore all editable text across the DOM (Guarding against null snapshots)
                document.querySelectorAll('[data-editable="true"]').forEach(el => {
                    if (el.id) {
                        const htmlVal = savedEdits[el.id];
                        if (htmlVal !== undefined && htmlVal !== "") {
                            // Only overwrite the DOM if the CMS data actually differs from the hardcoded HTML
                            if (el.innerHTML !== htmlVal) {
                                el.innerHTML = htmlVal;
                            }
                        }
                    }
                });
                
                // Hydrate Dynamic Sections and Tiles
                if (state.sections) {
                    state.sections.forEach(secData => {
                        let secEl = document.getElementById(secData.id);
                        if (!secEl) {
                            secEl = createNewSection("New Section", secData.id, secData.titleId, secData.gridId);
                            if (secData.isExpertise) secEl.classList.add('expertise-section');
                        }
                        
                        if (secData.tileIds) {
                            const grid = secEl.querySelector('.glass-grid');
                            if (grid) {
                                // Remove any hardcoded HTML tiles that were deleted in a previous session
                                grid.querySelectorAll('.glass-tile').forEach(existingTile => {
                                    if (!secData.tileIds.includes(existingTile.id)) {
                                        existingTile.remove();
                                    }
                                });

                                secData.tileIds.forEach(tileId => {
                                    let tileEl = document.getElementById(tileId);
                                    if (!tileEl) {
                                        tileEl = createNewTile(grid.id, secData.isExpertise, null, tileId);
                                    }
                                    // Append it to ensure correct order
                                    const addTileBtn = grid.querySelector('.add-tile-btn');
                                    if (addTileBtn) {
                                        grid.insertBefore(tileEl, addTileBtn);
                                    } else {
                                        grid.appendChild(tileEl);
                                    }
                                });
                            }
                        }
                    });
                }

                updateProfileImage(state.photoUrl);

                // Restore active swatch
                swatches.forEach(s => {
                    if (s.dataset.color === state.themeColor) {
                        swatches.forEach(sw => sw.classList.remove('active'));
                        s.classList.add('active');
                    }
                });

                // Restore tiles
                if (state.tilesData) {
                    state.tilesData.forEach(tData => {
                        const el = document.getElementById(tData.id);
                        if (el) {
                            if (tData.icon) el.dataset.icon = tData.icon;
                            if (tData.image) el.dataset.image = tData.image;
                            if (tData.link) el.dataset.link = tData.link;
                            if (tData.subtitle) el.dataset.subtitle = tData.subtitle;
                            if (tData.tech) el.dataset.tech = tData.tech;
                            if (tData.desc) el.dataset.desc = tData.desc;
                            if (tData.features) el.dataset.features = tData.features;
                            renderTile(el);
                        }
                    });
                }
            } else {
            }
        });
    }

    // Assign IDs to tiles and editables initially so they align on load
    document.querySelectorAll('main > section').forEach((sec, index) => {
        if (!sec.id) sec.id = `section-node-${index}`;
        const grid = sec.querySelector('.glass-grid');
        if (grid && !grid.id) grid.id = `grid-node-${index}`;
    });
    
    draggables.forEach((tile, index) => {
        if (!tile.id) tile.id = `tile-node-${index}`;
        tile.addEventListener('click', handleTileClick);
    });
    
    // Inject Add Tile buttons into hardcoded grids
    document.querySelectorAll('.glass-grid').forEach(grid => {
        if (!grid.querySelector('.add-tile-btn')) {
            const addTileBtn = document.createElement('button');
            addTileBtn.className = 'btn btn-outline add-tile-btn admin-only';
            addTileBtn.dataset.grid = grid.id;
            addTileBtn.style.display = document.body.classList.contains('admin-mode') ? 'block' : 'none';
            addTileBtn.style.width = '100%';
            addTileBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Tile';
            grid.appendChild(addTileBtn);
        }
    });

    editableElements.forEach((el, index) => {
        if (!el.id) el.id = `editable-node-${index}`;
    });

    // Global listener for Add Tile buttons
    document.addEventListener('click', (e) => {
        // Find the add tile button either by class or by text content if it's a generic block
        const addTileBtn = e.target.closest('.add-tile-btn');
        const isAddTileTextClick = e.target.innerText && (e.target.innerText.includes('Add Tile') || e.target.innerText.includes('+Add Tile'));
        
        const placeholderElement = addTileBtn || (isAddTileTextClick ? e.target.closest('div, button') : null);

        if (placeholderElement && document.body.classList.contains('admin-mode')) {
            e.preventDefault();
            const parentGrid = placeholderElement.closest('.glass-grid');

            if (parentGrid) {
                // Determine tile type based on the grid layout class or section
                const isExpertise = parentGrid.classList.contains('expertise-grid') || 
                                    (parentGrid.closest('section') && parentGrid.closest('section').classList.contains('expertise-section'));
                createNewTile(parentGrid, isExpertise, placeholderElement);
            }
        }
    });

    // Contact Form AJAX Submission
    document.getElementById('contact-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        
        submitBtn.innerText = 'Sending...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                alert('Thank you! Your message has been sent successfully.');
                form.reset();
                document.getElementById('contact-popup').classList.remove('active');
            } else {
                alert('Oops! There was a problem submitting your form.');
            }
        } catch (error) {
            alert('Error connecting to the server. Please try again later.');
        } finally {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});

// Ensure clicking email input explicitly focuses email without bubbling or interference
const emailInput = document.getElementById('admin-email');
const passwordInput = document.getElementById('admin-password');

if (emailInput && passwordInput) {
    emailInput.addEventListener('click', (e) => {
        e.stopPropagation();
        emailInput.focus();
    });

    passwordInput.addEventListener('click', (e) => {
        e.stopPropagation();
        passwordInput.focus();
    });
}



window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        window.location.reload();
    }
});


// Safe DOM update wrapper for Firebase data
function updateProfileImage(url) {
    const img = document.getElementById('main-profile-img');
    if (img && url && (url.startsWith('http') || url.startsWith('data:'))) {
        img.src = url;
    }
}
