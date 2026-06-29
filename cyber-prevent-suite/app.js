/* Cyber Ops Console - Master Coordinator JS */

// Global State Management
const CyberState = {
    xp: 0,
    scenariosSolved: {
        "1": false,
        "2": false,
        "3": false,
        "4": false,
        "5": false,
        "6": false,
        "7": false,
        "8": false,
        "9": false,
        "10": false
    },
    scansDone: {
        url: 0,
        domain: 0,
        email: 0,
        network: 0,
        password: 0,
        smsShield: 0,
        footprint: 0
    },
    quizScore: 0,
    dailyQuizDone: false,
    lastResetDate: null
};

// Log Templates for sidebar ticker
const logTemplates = [
    { type: "info", text: "Initializing kernel modules... OK" },
    { type: "success", text: "Secure socket layer interface... CONNECTED" },
    { type: "warn", text: "External probe detected on WAN: 198.51.100.42" },
    { type: "info", text: "Encrypting local state payload via AES-GCM-256..." },
    { type: "success", text: "Maturity verification token: VERIFIED" },
    { type: "info", text: "Syncing with threat feeds: AlienVault, abuse.ch..." },
    { type: "warn", text: "Missing security headers detected on subsystem port 8080" },
    { type: "info", text: "Hashing audit trail... SHA256 matches master" },
    { type: "danger", text: "Alert: Malicious pattern matched on honeypot decoy-node" },
    { type: "success", text: "DNSSEC signatures validated successfully" },
    { type: "info", text: "Refreshing sandbox containers... ISOLATION COMPLETE" },
    { type: "info", text: "Querying historical data leak indexes... READY" }
];

document.addEventListener("DOMContentLoaded", () => {
    // Enforce mobile/emulation viewport access policy
    enforceDeviceSecurityPolicy();

    // 1. Start Matrix Background
    initMatrixRain();

    // 2. Start System clock
    setInterval(updateClock, 1000);
    updateClock();

    // 3. Start Ambient Sidebar Logs
    initSidebarLogs();

    // 4. Setup SPA Router Navigation
    initNavigation();

    // 5. Seed initial dashboard alerts
    seedDashboardAlerts();

    // 6. Initialize mobile menu drawer toggling
    initMobileMenu();

    // 7. Initialize Firebase authentication and sync gateway
    initGatewayAuth();

    // 8. Mount Session Inactivity Guard (15s logout policy)
    initSessionTimeoutGuard();

    // 9. Check lockout block status
    checkAndEnforceLoginBlock();

    // 10. Initialize Cyber Terminal Sound FX
    initCyberAudioListeners();

    // 11. Close Developer Watermark Handler
    const closeWatermarkBtn = document.getElementById("btn-close-watermark");
    const watermarkEl = document.getElementById("developer-watermark");
    if (closeWatermarkBtn && watermarkEl) {
        closeWatermarkBtn.addEventListener("click", () => {
            watermarkEl.style.display = "none";
        });
    }
});

// Load State Helper
function loadState() {
    const saved = localStorage.getItem("cyber_ops_state");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(CyberState, parsed);
        } catch (e) {
            console.error("Failed to load local state:", e);
        }
    }
    
    // Check if daily reset is needed (24h check)
    const today = new Date().toDateString();
    if (CyberState.lastResetDate !== today) {
        CyberState.dailyQuizDone = false;
        CyberState.lastResetDate = today;
        saveState();
    }
}

// Save State Helper
function saveState() {
    localStorage.setItem("cyber_ops_state", JSON.stringify(CyberState));
    updateDefenseIntegrity();
    
    // Sync to Firestore if user is authenticated and Firebase is active
    if (window.firebaseActive && firebase.auth().currentUser && db) {
        const uid = firebase.auth().currentUser.uid;
        db.collection("users").doc(uid).set({
            username: CyberState.username || "Operator",
            email: firebase.auth().currentUser.email || "",
            xp: CyberState.xp,
            scenariosSolved: CyberState.scenariosSolved,
            scansDone: CyberState.scansDone,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).catch(err => {
            console.error("Firestore sync failed:", err);
        });
    }
}

// SPA Navigation Router
function initNavigation() {
    const navButtons = document.querySelectorAll(".nav-btn");
    const linkCards = document.querySelectorAll(".tool-link-card");
    const panels = document.querySelectorAll(".console-panel");
    const currentPathText = document.getElementById("current-path-text");

    const switchPanel = (targetId) => {
        panels.forEach(p => p.classList.remove("active"));
        navButtons.forEach(btn => btn.classList.remove("active"));

        const activePanel = document.getElementById(`panel-${targetId}`);
        const activeNavBtn = document.querySelector(`.nav-btn[data-target="${targetId}"]`);

        if (activePanel) {
            activePanel.classList.add("active");
        }
        if (activeNavBtn) {
            activeNavBtn.classList.add("active");
        }

        currentPathText.textContent = targetId;
        
        // Push special events for specific page setups
        if (targetId === "threat-sim" && typeof resetSimulatorMenu === "function") {
            resetSimulatorMenu();
        }

        // Track user activity in Firestore
        if (typeof updateUserAction === "function") {
            updateUserAction("Viewing module: " + targetId.toUpperCase());
        }
    };

    window.switchPanel = switchPanel;

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.getAttribute("data-target");
            switchPanel(target);
        });
    });

    linkCards.forEach(card => {
        card.addEventListener("click", () => {
            const target = card.getAttribute("data-target");
            switchPanel(target);
        });
    });
}

// System clock
function updateClock() {
    const clockEl = document.getElementById("console-time");
    if (clockEl) {
        const now = new Date();
        clockEl.textContent = now.toTimeString().split(' ')[0];
    }
}

// Matrix Falling Code rain background
function initMatrixRain() {
    const canvas = document.getElementById("matrix-canvas");
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const alphabet = "01ABCDEFGHIJKLMNOPQRSTUVWXYZｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
    const fontSize = 14;
    const columns = width / fontSize;

    const rainDrops = [];
    for (let x = 0; x < columns; x++) {
        rainDrops[x] = 1;
    }

    const draw = () => {
        ctx.fillStyle = "rgba(2, 7, 20, 0.15)";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = Math.random() > 0.5 ? "#00f0ff" : "#0066ff";
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < rainDrops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

            if (rainDrops[i] * fontSize > height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
    };

    setInterval(draw, 33);
}

// Ambient logs generator in the sidebar
function initSidebarLogs() {
    const container = document.getElementById("logs-container");
    if (!container) return;

    const appendLog = (type, text) => {
        const time = new Date().toTimeString().split(' ')[0];
        const log = document.createElement("div");
        log.classList.add("log-line", `log-${type}`);
        log.textContent = `[${time}] ${text}`;
        container.appendChild(log);
        
        // Keep logs capped at 50
        while (container.childNodes.length > 50) {
            container.removeChild(container.firstChild);
        }
        
        container.scrollTop = container.scrollHeight;
    };

    // Initial logs
    appendLog("success", "Console operator secure channel mounted.");
    appendLog("info", "Loading cyber prevent tools index...");
    appendLog("info", "Local database state encrypted.");

    // Regular updates
    setInterval(() => {
        const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
        appendLog(template.type, template.text);
    }, 4500);
}

// Compute dynamic Defense Index & Rank clearance
function updateDefenseIntegrity() {
    // 1. Calculate Defense Shield score (0 to 100)
    // - Threat Simulator scenarios: 10 scenarios, 7% each (70% total)
    let simScore = 0;
    Object.values(CyberState.scenariosSolved).forEach(val => {
        if (val) simScore += 7;
    });

    // - Audits performed (at least 1 of each = 7.5% each, 30% total)
    let auditScore = 0;
    if (CyberState.scansDone.domain > 0) auditScore += 7.5;
    if (CyberState.scansDone.password > 0) auditScore += 7.5;
    if (CyberState.scansDone.smsShield > 0) auditScore += 7.5;
    if (CyberState.scansDone.footprint > 0) auditScore += 7.5;

    const defenseIndex = Math.min(100, Math.round(simScore + auditScore));

    // Update Header Indicators
    const defenseHeaderVal = document.getElementById("header-defense-index");
    const threatHeaderVal = document.getElementById("header-threat-level");
    if (defenseHeaderVal) {
        defenseHeaderVal.textContent = `${defenseIndex}%`;
    }

    if (threatHeaderVal) {
        if (defenseIndex < 30) {
            threatHeaderVal.textContent = "CRITICAL";
            threatHeaderVal.className = "stat-val text-neon-red";
        } else if (defenseIndex < 70) {
            threatHeaderVal.textContent = "ELEVATED";
            threatHeaderVal.className = "stat-val text-neon-orange";
        } else {
            threatHeaderVal.textContent = "STABLE";
            threatHeaderVal.className = "stat-val text-neon-green";
        }
    }

    // Update Dashboard circle gauge
    const dashValEl = document.getElementById("dashboard-health-val");
    const dashGaugeEl = document.getElementById("dashboard-health-gauge");
    const shieldStatusEl = document.getElementById("shield-status-indicator");
    const shieldDescEl = document.getElementById("shield-status-desc");

    if (dashValEl) dashValEl.textContent = `${defenseIndex}%`;
    if (dashGaugeEl) {
        const radius = dashGaugeEl.r.baseVal.value;
        const circumference = 2 * Math.PI * radius; // 251.2
        const offset = circumference - (defenseIndex / 100) * circumference;
        dashGaugeEl.style.strokeDashoffset = offset;
    }

    if (shieldStatusEl && shieldDescEl) {
        if (defenseIndex === 100) {
            shieldStatusEl.textContent = "SEC_SHIELD_MAX";
            shieldStatusEl.className = "shield-indicator text-neon-cyan";
            shieldDescEl.textContent = "Defenses optimized. System perimeter locked and impervious.";
        } else if (defenseIndex >= 70) {
            shieldStatusEl.textContent = "SHIELD_SECURE";
            shieldStatusEl.className = "shield-indicator text-neon-green";
            shieldDescEl.textContent = "Active shield operations secure. Keep up the daily habits.";
        } else if (defenseIndex >= 40) {
            shieldStatusEl.textContent = "SHIELD_WARNING";
            shieldStatusEl.className = "shield-indicator text-neon-orange";
            shieldDescEl.textContent = "Subsystem perimeters degraded. Run SMS Bomb Shield or perform credential audits.";
        } else {
            shieldStatusEl.textContent = "SHIELD_DOWN";
            shieldStatusEl.className = "shield-indicator text-neon-red";
            shieldDescEl.textContent = "Vulnerable to breach. Perform immediate scenarios and verify credential integrity.";
        }
    }

    // 2. Calculate Rank clearance
    let rank = "NOVICE";
    let nextRank = "SPECIALIST";
    let nextRankXp = 300;
    let baseXp = 0;
    
    if (CyberState.xp > 800) {
        rank = "CYBER_CHIEF";
        nextRank = "MAXIMUM_CLEARANCE";
        nextRankXp = 1500; // Cap visual progress
        baseXp = 800;
    } else if (CyberState.xp > 300) {
        rank = "SPECIALIST";
        nextRank = "CYBER_CHIEF";
        nextRankXp = 800;
        baseXp = 300;
    }

    const sidebarRank = document.getElementById("sidebar-rank");
    const sidebarRankFill = document.getElementById("sidebar-rank-fill");
    
    if (sidebarRank) {
        sidebarRank.textContent = `${rank} (${CyberState.xp} XP)`;
    }

    if (sidebarRankFill) {
        const pct = Math.min(100, Math.max(0, ((CyberState.xp - baseXp) / (nextRankXp - baseXp)) * 100));
        sidebarRankFill.style.width = `${pct}%`;
        if (rank === "CYBER_CHIEF") {
            sidebarRankFill.style.backgroundColor = "var(--neon-cyan)";
            sidebarRankFill.style.boxShadow = "var(--glow-shadow-cyan)";
        } else {
            sidebarRankFill.style.backgroundColor = "var(--neon-green)";
            sidebarRankFill.style.boxShadow = "var(--glow-shadow-green)";
        }
    }

    // Trigger updates in specific pages if they are loaded
    if (typeof updateHabitsPage === "function") updateHabitsPage();
}

// Global state modification helpers
function gainXP(amount, message) {
    CyberState.xp += amount;
    saveState();
    
    // Add custom alarm to dashboard list
    addDashboardAlert("cyan", `XP_EARNED: +${amount} XP (${message})`);
}

function addDashboardAlert(type, message) {
    const alertsContainer = document.getElementById("dash-alerts-container");
    if (!alertsContainer) return;

    const time = new Date().toTimeString().split(' ')[0];
    const alert = document.createElement("div");
    alert.className = `alert-item alert-${type}`;
    alert.innerHTML = `
        <span class="alert-msg">${message}</span>
        <span class="alert-time">${time}</span>
    `;

    alertsContainer.insertBefore(alert, alertsContainer.firstChild);

    // Keep alert list capped at 15
    while (alertsContainer.childNodes.length > 15) {
        alertsContainer.removeChild(alertsContainer.lastChild);
    }
}

// Mobile Slide Menu drawer handlers
function initMobileMenu() {
    const toggleBtn = document.getElementById("mobile-menu-toggle");
    const sidebar = document.querySelector(".console-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    const navBtns = document.querySelectorAll(".nav-btn");

    if (toggleBtn && sidebar && backdrop) {
        const openMenu = () => {
            sidebar.classList.add("mobile-open");
            backdrop.classList.add("active");
        };

        const closeMenu = () => {
            sidebar.classList.remove("mobile-open");
            backdrop.classList.remove("active");
        };

        toggleBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (sidebar.classList.contains("mobile-open")) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        backdrop.addEventListener("click", closeMenu);

        // Auto close side drawer when user clicks on nav item
        navBtns.forEach(btn => {
            btn.addEventListener("click", closeMenu);
        });
    }
}

// Initial alerts monitoring seeds
function seedDashboardAlerts() {
    const alertsContainer = document.getElementById("dash-alerts-container");
    if (!alertsContainer || alertsContainer.children.length > 0) return;

    const seedAlerts = [
        { type: "green", text: "SYS_SHIELD: Operations firewall enabled. Subsystem shields active." },
        { type: "warn", text: "AUDIT_WARNING: Port 8080 missing Content-Security-Policy (CSP) headers." },
        { type: "cyan", text: "INTEL_LINK: Phishing feed indexes downloaded successfully." },
        { type: "danger", text: "THREAT_ALERT: Elevated login anomaly rate matched on honey-relays." }
    ];

    const time = new Date().toTimeString().split(' ')[0];

    // Append to container
    seedAlerts.forEach(al => {
        const alert = document.createElement("div");
        alert.className = `alert-item alert-${al.type}`;
        alert.innerHTML = `
            <span class="alert-msg">${al.text}</span>
            <span class="alert-time">${time}</span>
        `;
        alertsContainer.appendChild(alert);
    });
}

// Global click event listener for help protocol widgets toggling & click-outside-to-close
document.addEventListener("click", (e) => {
    const helpToggleBtn = e.target.closest(".help-toggle-btn");
    
    // 1. Handle toggle button click
    if (helpToggleBtn) {
        const helpId = helpToggleBtn.getAttribute("data-help");
        const helpBox = document.getElementById(`help-${helpId}`);
        if (helpBox) {
            const isHidden = helpBox.classList.toggle("hidden");
            if (isHidden) {
                helpToggleBtn.textContent = "[?] HELP_PROTOCOL";
                helpToggleBtn.style.opacity = "1";
            } else {
                helpToggleBtn.textContent = "[x] CLOSE_HELP";
                helpToggleBtn.style.opacity = "0.7";
            }
        }
        return; // Exit to avoid auto-closing immediately
    }

    // 2. Handle click outside open help boxes to auto-close
    const openHelpBoxes = document.querySelectorAll(".help-protocol-box:not(.hidden)");
    openHelpBoxes.forEach(helpBox => {
        const clickInside = helpBox.contains(e.target);
        if (!clickInside) {
            helpBox.classList.add("hidden");
            
            // Reset button text
            const helpId = helpBox.id.replace("help-", "");
            const matchingBtn = document.querySelector(`.help-toggle-btn[data-help="${helpId}"]`);
            if (matchingBtn) {
                matchingBtn.textContent = "[?] HELP_PROTOCOL";
                matchingBtn.style.opacity = "1";
            }
        }
    });
});

// Firebase Gateway UI & State Handlers
let db = null;
let dbRealtime = null; // Used for migrating old users
window.firebaseActive = false;

// Helper to wrap promise with timeout (to prevent hanging on network delays/offline state)
function promiseWithTimeout(promise, timeoutMs, errorLabel) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`${errorLabel} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
        promise.then(
            res => { clearTimeout(timer); resolve(res); },
            err => { clearTimeout(timer); reject(err); }
        );
    });
}

function updateUserAction(actionName) {}

// Global CAPTCHA registry
let activeLoginCaptcha = "";
let activeSignupCaptcha = "";

// Dynamic status updater helper
const updateGatewayStatus = (text) => {
    document.querySelectorAll(".gateway-status-text").forEach(el => {
        el.textContent = text;
    });
};

// Captcha generation engine (Canvas-based)
function generateCaptcha(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return "";

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // 1. Draw solid dark background
    ctx.fillStyle = "#020714";
    ctx.fillRect(0, 0, width, height);

    // 2. Draw matrix grid lines in background
    ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 15) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + (Math.random() - 0.5) * 8, height);
        ctx.stroke();
    }
    for (let i = 0; i < height; i += 10) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i + (Math.random() - 0.5) * 5);
        ctx.stroke();
    }

    // 3. Generate random 5-char code (omitting visually similar characters for accessibility)
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let captchaText = "";
    for (let i = 0; i < 5; i++) {
        captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 4. Draw characters with distortion & noise
    ctx.font = "bold 21px 'Share Tech Mono', monospace";
    ctx.textBaseline = "middle";

    const colors = ["#00f0ff", "#00ff66", "#ff007f", "#ffaa00"];

    for (let i = 0; i < captchaText.length; i++) {
        const char = captchaText.charAt(i);
        const charWidth = width / 6;
        const cx = 15 + i * charWidth + (Math.random() - 0.5) * 4;
        const cy = height / 2 + (Math.random() - 0.5) * 4;
        
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        
        ctx.save();
        ctx.translate(cx, cy);
        const angle = (Math.random() - 0.5) * 0.35;
        ctx.rotate(angle);
        ctx.fillText(char, -7, 0);
        ctx.restore();
    }

    // 5. Draw laser bezier noise line across text
    ctx.strokeStyle = "rgba(255, 0, 127, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(5, height / 2 + (Math.random() - 0.5) * 12);
    ctx.bezierCurveTo(width / 3, Math.random() * height, 2 * width / 3, Math.random() * height, width - 5, height / 2 + (Math.random() - 0.5) * 12);
    ctx.stroke();

    if (canvasId === "login-captcha-canvas") {
        activeLoginCaptcha = captchaText;
    } else {
        activeSignupCaptcha = captchaText;
    }

    return captchaText;
}

// Separate Page Router
function showGatewayAuthPage() {
    const loginCard = document.getElementById("gateway-login-card");
    const signupCard = document.getElementById("gateway-signup-card");
    if (!loginCard || !signupCard) return;

    if (location.hash === "#/signup") {
        loginCard.classList.add("hidden");
        signupCard.classList.remove("hidden");
        generateCaptcha("signup-captcha-canvas");
        
        // Clear input and error states
        const input = document.getElementById("signup-captcha-input");
        if (input) input.value = "";
        const err = document.getElementById("signup-error-msg");
        if (err) err.textContent = "";
    } else {
        // Default to login page card
        location.hash = "#/login";
        signupCard.classList.add("hidden");
        loginCard.classList.remove("hidden");
        generateCaptcha("login-captcha-canvas");
        
        // Clear input and error states
        const input = document.getElementById("login-captcha-input");
        if (input) input.value = "";
        const err = document.getElementById("login-error-msg");
        if (err) err.textContent = "";
    }
}

function initGatewayAuth() {
    const overlay = document.getElementById("gateway-overlay");
    const configCard = document.getElementById("gateway-config-card");
    const logoutBtn = document.getElementById("btn-logout");
    let googleAuthInProgress = false;

    // Hook Hash Routing
    window.addEventListener("hashchange", showGatewayAuthPage);

    // Initialize Firebase Connection (uses the hardcoded config in firebase-config.js)
    const initSuccess = initializeFirebaseConnection();
    window.firebaseActive = initSuccess;
    if (initSuccess && typeof firebase !== "undefined") {
        try {
            db = firebase.firestore();
        } catch (e) {
            console.error("Firestore initialization failed:", e);
            window.firebaseActive = false;
        }
        try {
            dbRealtime = firebase.database();
        } catch (e) {
            console.error("Realtime Database initialization failed:", e);
        }
        
        // Handle redirect results for Google Auth fallback (especially on mobile/popups blocked)
        firebase.auth().getRedirectResult().then((result) => {
            if (result && result.user) {
                console.log("Redirect sign-in successful:", result.user);
            }
        }).catch((err) => {
            console.error("Redirect sign-in error:", err);
            const errEl = document.getElementById("login-error-msg");
            if (errEl) {
                errEl.textContent = `GOOGLE_AUTH_FAILED: ${err.message}`;
            }
        });
    }

    // Config screen is completely hidden/ignored.
    if (configCard) {
        configCard.classList.add("hidden");
    }
    
    // Always display the gateway credentials card (landing page)
    overlay.classList.remove("hidden");
    document.body.classList.add("auth-pending");
    setLoading(true); // Lock authentication interactions until initial auth handshake is processed

    // Check lockout block status
    checkAndEnforceLoginBlock();

    // Router evaluates current page hash (redirects to login/sign-in as landing page)
    showGatewayAuthPage();
    updateGatewayStatus("SYS_HANDSHAKE: ACTIVE");



    // CAPTCHA Refresh listeners
    const refreshLoginBtn = document.getElementById("btn-login-captcha-refresh");
    if (refreshLoginBtn) {
        refreshLoginBtn.addEventListener("click", () => {
            generateCaptcha("login-captcha-canvas");
            document.getElementById("login-captcha-input").value = "";
        });
    }

    const refreshSignupBtn = document.getElementById("btn-signup-captcha-refresh");
    if (refreshSignupBtn) {
        refreshSignupBtn.addEventListener("click", () => {
            generateCaptcha("signup-captcha-canvas");
            document.getElementById("signup-captcha-input").value = "";
        });
    }

    // Force real-time uppercase on codename & captcha inputs for cyber aesthetic and matching lookup keys
    const loginEmailInput = document.getElementById("login-email");
    if (loginEmailInput) {
        loginEmailInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    const signupUserInput = document.getElementById("signup-username");
    if (signupUserInput) {
        signupUserInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    const loginCaptchaInput = document.getElementById("login-captcha-input");
    if (loginCaptchaInput) {
        loginCaptchaInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    const signupCaptchaInput = document.getElementById("signup-captcha-input");
    if (signupCaptchaInput) {
        signupCaptchaInput.addEventListener("input", (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    // Password visibility toggle (eye element)
    const toggleLoginPass = document.getElementById("toggle-login-password");
    if (toggleLoginPass) {
        toggleLoginPass.addEventListener("click", () => {
            const passInput = document.getElementById("login-password");
            if (passInput) {
                if (passInput.type === "password") {
                    passInput.type = "text";
                    toggleLoginPass.textContent = "🙈";
                } else {
                    passInput.type = "password";
                    toggleLoginPass.textContent = "👁️";
                }
            }
        });
    }

    const toggleSignupPass = document.getElementById("toggle-signup-password");
    if (toggleSignupPass) {
        toggleSignupPass.addEventListener("click", () => {
            const passInput = document.getElementById("signup-password");
            if (passInput) {
                if (passInput.type === "password") {
                    passInput.type = "text";
                    toggleSignupPass.textContent = "🙈";
                } else {
                    passInput.type = "password";
                    toggleSignupPass.textContent = "👁️";
                }
            }
        });
    }

    // Loading indicator helper (Dual-Bar support)
    function setLoading(loading) {
        const isSignup = location.hash === "#/signup";
        const loadingBar = document.getElementById(isSignup ? "gateway-loading-bar-signup" : "gateway-loading-bar-login");
        const loadingFill = document.getElementById(isSignup ? "gateway-loading-bar-signup-fill" : "gateway-loading-bar-login-fill");
        if (!loadingBar || !loadingFill) return;

        const loginBtn = document.getElementById("btn-login-submit");
        const signupBtn = document.getElementById("btn-signup-submit");
        const googleBtn = document.getElementById("btn-google-signin");

        if (loading) {
            loadingBar.classList.remove("hidden");
            loadingFill.style.width = "0%";
            setTimeout(() => loadingFill.style.width = "40%", 100);
            setTimeout(() => loadingFill.style.width = "80%", 600);
            
            if (loginBtn) loginBtn.disabled = true;
            if (signupBtn) signupBtn.disabled = true;
            if (googleBtn) googleBtn.disabled = true;
        } else {
            loadingFill.style.width = "100%";
            setTimeout(() => {
                loadingBar.classList.add("hidden");
                if (loginBtn) loginBtn.disabled = false;
                if (signupBtn) signupBtn.disabled = false;
                if (googleBtn) googleBtn.disabled = false;
            }, 300);
        }
    }

    // Setup forgot password handler
    const forgotKeyLink = document.getElementById("link-forgot-password");
    if (forgotKeyLink) {
        forgotKeyLink.addEventListener("click", async (e) => {
            e.preventDefault();
            
            // Check if blocked first
            const blockedUntilStr = localStorage.getItem("cyber_ops_blocked_until");
            if (blockedUntilStr && Date.now() < parseInt(blockedUntilStr, 10)) {
                showCustomAlert("SECURITY_LOCKOUT: Terminal is currently locked. Try again later.");
                return;
            }

            const email = await showCustomPrompt("Enter your registered operator email to receive decryption key reset link:");
            if (!email) return;

            if (!email.includes("@")) {
                showCustomAlert("ERROR: Invalid email address format.");
                return;
            }

            setLoading(true);
            if (typeof CyberAudio !== "undefined") {
                CyberAudio.playHackingScan(1.5);
            }
            firebase.auth().sendPasswordResetEmail(email).then(() => {
                setLoading(false);
                showCustomAlert("SUCCESS: Decryption key reset link has been dispatched to your email.", "SECURE_DISPATCH", true);
            }).catch(err => {
                setLoading(false);
                showCustomAlert(`RESET_FAILED: ${err.message}`);
            });
        });
    }

    // Firebase Auth Observer
    window.isSigningUp = false;

    const enterConsole = (loginMethod = "manual") => {
        // Reset failed attempts count
        localStorage.setItem("cyber_ops_failed_attempts", "0");

        // Regular operator mode
        document.body.classList.remove("admin-mode");

        // Mark session as logged in
        sessionStorage.setItem("is_logged_in", "1");

        // Save configuration updates
        localStorage.setItem("cyber_ops_state", JSON.stringify(CyberState));

        // UI adjustments
        document.getElementById("btn-logout").style.display = "block";
        document.querySelector(".status-text").textContent = `SYS_OPERATOR: ${CyberState.username.toUpperCase()}`;
        
        // Add console alert
        addDashboardAlert("green", `ACCESS_GRANTED: Welcome back, ${CyberState.username.toUpperCase()}`);

        // Hide overlay
        setLoading(false);
        overlay.classList.add("hidden");
        document.body.classList.remove("auth-pending");
        if (typeof CyberAudio !== "undefined") {
            CyberAudio.playSuccess();
            if (loginMethod === "google") {
                CyberAudio.speak("Sign in successful using Google.");
            } else {
                CyberAudio.speak("Log in successful.");
            }
        }

        // Initialize interactive sub-modules
        if (typeof initThreatSimulator === "function") initThreatSimulator();
        if (typeof initTrustBreach === "function") initTrustBreach();
        if (typeof initPasswordChecker === "function") initPasswordChecker();
        if (typeof initSmsShield === "function") initSmsShield();
        if (typeof initFootprintChecker === "function") initFootprintChecker();
        
        updateDefenseIntegrity();
    };

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // If we are forcing a sign out (e.g. after refresh or timeout on startup), ignore user state
            if (window.forceSignOut) {
                firebase.auth().signOut().catch(err => console.error(err));
                return;
            }
            // If the user is currently registering through the sign-up form,
            // let the sign-up submit listener handle database initialization & console unlocking.
            if (window.isSigningUp) {
                return;
            }

            setLoading(true);
            updateGatewayStatus("KEYS MATCHED // DOWNLOADING PROFILE...");
            
            const handleNoProfileFound = () => {
                const isGoogleUser = user.providerData.some(p => p.providerId === "google.com");
                if (isGoogleUser) {
                    const defaultName = user.email ? user.email.split("@")[0].toUpperCase() : "OPERATOR";
                    CyberState.username = defaultName;
                    
                    const profileData = {
                        username: defaultName,
                        email: user.email || "",
                        xp: 0,
                        scenariosSolved: {
                            "1": false, "2": false, "3": false, "4": false, "5": false,
                            "6": false, "7": false, "8": false, "9": false, "10": false
                        },
                        scansDone: {
                            url: 0, domain: 0, email: 0, network: 0, password: 0, smsShield: 0, footprint: 0
                        },
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    };

                    if (db) {
                        db.collection("users").doc(user.uid).set(profileData).then(() => {
                            enterConsole("google");
                        }).catch(e => {
                            console.warn("Firestore profile creation rejected:", e);
                            enterConsole("google");
                        });
                    } else {
                        enterConsole("google");
                    }
                } else {
                    // For manual login/email/password user, check if we can migrate from Realtime DB
                    if (dbRealtime && db) {
                        promiseWithTimeout(
                            dbRealtime.ref("users/" + user.uid).once("value"),
                            4000,
                            "Realtime DB profile check"
                        ).then(snapshot => {
                            if (snapshot.exists()) {
                                const data = snapshot.val();
                                console.log("Migrating user from Realtime DB to Firestore:", user.uid);
                                
                                // Write to Firestore
                                const profileData = {
                                    username: data.username || "Operator",
                                    email: data.email || user.email || "",
                                    xp: data.xp || 0,
                                    scenariosSolved: data.scenariosSolved || {
                                        "1": false, "2": false, "3": false, "4": false, "5": false,
                                        "6": false, "7": false, "8": false, "9": false, "10": false
                                    },
                                    scansDone: data.scansDone || {
                                        url: 0, domain: 0, email: 0, network: 0, password: 0, smsShield: 0, footprint: 0
                                    },
                                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                                };
                                
                                db.collection("users").doc(user.uid).set(profileData).then(() => {
                                    // Successfully migrated, load into console
                                    CyberState.username = profileData.username;
                                    CyberState.xp = profileData.xp;
                                    Object.assign(CyberState.scenariosSolved, profileData.scenariosSolved);
                                    Object.assign(CyberState.scansDone, profileData.scansDone);
                                    enterConsole("manual");
                                    addDashboardAlert("success", "DATABASE_MIGRATION: User profile migrated to cloud store.");
                                }).catch(fsErr => {
                                    console.error("Failed to write migrated profile to Firestore:", fsErr);
                                    // Fallback to local session since data exists in Realtime DB
                                    CyberState.username = profileData.username;
                                    CyberState.xp = profileData.xp;
                                    Object.assign(CyberState.scenariosSolved, profileData.scenariosSolved);
                                    Object.assign(CyberState.scansDone, profileData.scansDone);
                                    enterConsole("manual");
                                    addDashboardAlert("warn", "MIGRATION_PENDING: Firestore sync delayed.");
                                });
                            } else {
                                // No profile in RTDB either, sign out
                                setLoading(false);
                                firebase.auth().signOut().then(() => {
                                    showCustomAlert("ACCESS_DENIED: Your operator clearance has been revoked.", "REVOKED_ACCESS");
                                });
                            }
                        }).catch(rtErr => {
                            console.warn("RTDB migration lookup failed:", rtErr);
                            // Sign out as fallback
                            setLoading(false);
                            firebase.auth().signOut().then(() => {
                                showCustomAlert("ACCESS_DENIED: Your operator clearance has been revoked.", "REVOKED_ACCESS");
                            });
                        });
                    } else {
                        setLoading(false);
                        firebase.auth().signOut().then(() => {
                            showCustomAlert("ACCESS_DENIED: Your operator clearance has been revoked.", "REVOKED_ACCESS");
                        });
                    }
                }
            };

            const fallbackToLocal = () => {
                const defaultName = user.email ? user.email.split("@")[0].toUpperCase() : "OPERATOR";
                CyberState.username = CyberState.username || defaultName;
                const isGoogleUser = user.providerData.some(p => p.providerId === "google.com");
                enterConsole(isGoogleUser ? "google" : "manual");
                addDashboardAlert("warn", `LOCAL_SYNC_ACTIVE: Offline cache running.`);
            };

            if (db) {
                promiseWithTimeout(db.collection("users").doc(user.uid).get(), 5000, "Firestore profile fetch")
                    .then(doc => {
                        if (doc.exists) {
                            const data = doc.data();
                            CyberState.username = data.username || "Operator";
                            CyberState.xp = data.xp || 0;
                            if (data.scenariosSolved) {
                                Object.assign(CyberState.scenariosSolved, data.scenariosSolved);
                            }
                            if (data.scansDone) {
                                Object.assign(CyberState.scansDone, data.scansDone);
                            }
                            const isGoogleUser = user.providerData.some(p => p.providerId === "google.com");
                            enterConsole(isGoogleUser ? "google" : "manual");
                        } else {
                            handleNoProfileFound();
                        }
                    }).catch(err => {
                        console.warn("Firestore profile read failed or timed out:", err);
                        fallbackToLocal();
                    });
            } else {
                fallbackToLocal();
            }
        } else {
            // User logged out
            setLoading(false); // Enable auth interactions once handshake/logout completes
            overlay.classList.remove("hidden");
            document.body.classList.add("auth-pending");
            logoutBtn.style.display = "none";
            document.querySelector(".status-text").textContent = "SYS_OPERATOR: INACTIVE";
            
            document.body.classList.remove("admin-mode");

            // Reset state
            CyberState.xp = 0;
            Object.keys(CyberState.scenariosSolved).forEach(k => CyberState.scenariosSolved[k] = false);
            Object.keys(CyberState.scansDone).forEach(k => CyberState.scansDone[k] = 0);
            updateDefenseIntegrity();
        }
    });

    // Login submit (Supports dual login: Email or Codename/Username & CAPTCHA validation)
    document.getElementById("btn-login-submit").addEventListener("click", async () => {
        window.forceSignOut = false; // Reset auto-logout flag
        // Check lockout block status
        const blockedUntilStr = localStorage.getItem("cyber_ops_blocked_until");
        if (blockedUntilStr && Date.now() < parseInt(blockedUntilStr, 10)) {
            showCustomAlert("SECURITY_LOCKOUT: Terminal access is currently blocked.");
            return;
        }

        const identifier = document.getElementById("login-email").value.trim();
        const pass = document.getElementById("login-password").value;
        const captchaVal = document.getElementById("login-captcha-input").value.trim().toUpperCase();
        const errEl = document.getElementById("login-error-msg");
        errEl.textContent = "";

        if (!identifier || !pass) {
            errEl.textContent = "Error: Input email or codename and decryption key.";
            return;
        }

        if (captchaVal !== activeLoginCaptcha) {
            errEl.textContent = "SECURITY_VERIFICATION_FAILED: Captcha code incorrect.";
            generateCaptcha("login-captcha-canvas");
            document.getElementById("login-captcha-input").value = "";
            return;
        }

        // Confirmation Prompt
        const confirmed = await showCustomConfirm("Are you sure you want to log in?");
        if (!confirmed) {
            return;
        }

        sessionStorage.setItem("cyber_ops_operator_pass", pass);

        setLoading(true);
        if (typeof CyberAudio !== "undefined") {
            CyberAudio.playHackingScan(2.5);
        }

        const performSignIn = (emailToUse) => {
            firebase.auth().signInWithEmailAndPassword(emailToUse, pass).catch((err) => {
                console.error("Auth error:", err);
                setLoading(false);
                errEl.textContent = `AUTHENTICATION_FAILED: ${err.message}`;
                handleFailedLoginAttempt();
            });
        };

        if (identifier.includes("@")) {
            // Identifier is an email address, login directly
            performSignIn(identifier);
        } else {
            // Identifier is a username/codename, lookup the email first
            if (db) {
                const searchVal = identifier.toUpperCase();
                promiseWithTimeout(
                    db.collection("users").where("username", "==", searchVal).get(),
                    5000,
                    "Codename lookup"
                ).then((querySnapshot) => {
                    if (querySnapshot.empty) {
                        // Check in Realtime Database before failing
                        if (dbRealtime) {
                            promiseWithTimeout(
                                dbRealtime.ref("users").orderByChild("username").equalTo(searchVal).once("value"),
                                4000,
                                "Realtime DB codename lookup"
                            ).then((snapshot) => {
                                if (snapshot.exists()) {
                                    let userData = null;
                                    snapshot.forEach(child => {
                                        userData = child.val();
                                    });
                                    if (userData && userData.email) {
                                        performSignIn(userData.email);
                                    } else {
                                        setLoading(false);
                                        errEl.textContent = "AUTHENTICATION_FAILED: Codename not found.";
                                        handleFailedLoginAttempt();
                                    }
                                } else {
                                    setLoading(false);
                                    errEl.textContent = "AUTHENTICATION_FAILED: Codename not found.";
                                    handleFailedLoginAttempt();
                                }
                            }).catch(rtErr => {
                                console.warn("Realtime DB backup lookup failed:", rtErr);
                                setLoading(false);
                                errEl.textContent = "AUTHENTICATION_FAILED: Codename not found.";
                                handleFailedLoginAttempt();
                            });
                        } else {
                            setLoading(false);
                            errEl.textContent = "AUTHENTICATION_FAILED: Codename not found.";
                            handleFailedLoginAttempt();
                        }
                        return;
                    }
                    const userDoc = querySnapshot.docs[0];
                    const userData = userDoc.data();
                    const email = userData.email;
                    if (!email) {
                        setLoading(false);
                        errEl.textContent = "AUTHENTICATION_FAILED: Associated email not found.";
                        handleFailedLoginAttempt();
                        return;
                    }
                    performSignIn(email);
                })
                .catch((err) => {
                    console.error("Firestore username query error:", err);
                    setLoading(false);
                    errEl.textContent = `AUTHENTICATION_FAILED: ${err.message}`;
                    handleFailedLoginAttempt();
                });
            } else {
                setLoading(false);
                errEl.textContent = "AUTHENTICATION_FAILED: Database connection offline.";
                handleFailedLoginAttempt();
            }
        }
    });

    // Google Sign-In trigger (uses popup with custom instructions for popup-blockers)
    const googleBtn = document.getElementById("btn-google-signin");
    if (googleBtn) {
        googleBtn.addEventListener("click", () => {
            if (googleAuthInProgress) return;
            window.forceSignOut = false; // Reset auto-logout flag
            googleAuthInProgress = true;
            googleBtn.disabled = true;
            googleBtn.style.opacity = "0.5";
            googleBtn.style.cursor = "not-allowed";
            setLoading(true);
            
            const provider = new firebase.auth.GoogleAuthProvider();
            
            firebase.auth().signInWithPopup(provider).then(() => {
                // Let onAuthStateChanged handle loading finish and terminal unlock
                googleAuthInProgress = false;
                googleBtn.disabled = false;
                googleBtn.style.opacity = "1";
                googleBtn.style.cursor = "pointer";
            }).catch((err) => {
                console.error("Google Auth error:", err);
                setLoading(false);
                googleAuthInProgress = false;
                googleBtn.disabled = false;
                googleBtn.style.opacity = "1";
                googleBtn.style.cursor = "pointer";
                
                if (err.code === "auth/popup-blocked") {
                    showCustomAlert(
                        "SECURITY_WARNING: The Google authentication popup was blocked by your browser.\n\nPlease click the popup blocker icon in your browser address bar and select 'Always allow popups', then retry.",
                        "POPUP_BLOCKED",
                        true
                    );
                } else if (err.code === "auth/popup-closed-by-user") {
                    showCustomAlert(
                        "AUTHENTICATION_CANCELLED: The Google sign-in window was closed before completion.",
                        "LOGIN_CANCELLED"
                    );
                } else {
                    document.getElementById("login-error-msg").textContent = `GOOGLE_AUTH_FAILED: ${err.message}`;
                }
            });
        });
    }


    // Signup submit (Supports CAPTCHA validation)
    document.getElementById("btn-signup-submit").addEventListener("click", async () => {
        window.forceSignOut = false; // Reset auto-logout flag
        // Check lockout block status
        const blockedUntilStr = localStorage.getItem("cyber_ops_blocked_until");
        if (blockedUntilStr && Date.now() < parseInt(blockedUntilStr, 10)) {
            showCustomAlert("SECURITY_LOCKOUT: Terminal access is currently blocked.");
            return;
        }

        const user = document.getElementById("signup-username").value.trim().toUpperCase();
        const email = document.getElementById("signup-email").value.trim();
        const pass = document.getElementById("signup-password").value;
        const captchaVal = document.getElementById("signup-captcha-input").value.trim().toUpperCase();
        const errEl = document.getElementById("signup-error-msg");
        errEl.textContent = "";

        if (!user || !email || !pass) {
            errEl.textContent = "Error: Fill in all fields.";
            return;
        }

        if (captchaVal !== activeSignupCaptcha) {
            errEl.textContent = "SECURITY_VERIFICATION_FAILED: Captcha code incorrect.";
            generateCaptcha("signup-captcha-canvas");
            document.getElementById("signup-captcha-input").value = "";
            return;
        }

        // Confirmation Prompt
        const confirmed = await showCustomConfirm("Are you sure you want to sign up?");
        if (!confirmed) {
            return;
        }

        sessionStorage.setItem("cyber_ops_operator_pass", pass);

        setLoading(true);
        if (typeof CyberAudio !== "undefined") {
            CyberAudio.playHackingScan(2.5);
        }
        window.isSigningUp = true;
        
        firebase.auth().createUserWithEmailAndPassword(email, pass).then(cred => {
            const uid = cred.user.uid;
            
            // Initial document sync
            const profileDataFS = {
                username: user,
                email: email,
                xp: 0,
                scenariosSolved: {
                    "1": false, "2": false, "3": false, "4": false, "5": false,
                    "6": false, "7": false, "8": false, "9": false, "10": false
                },
                scansDone: {
                    url: 0, domain: 0, email: 0, network: 0, password: 0, smsShield: 0, footprint: 0
                },
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (db) {
                return promiseWithTimeout(
                    db.collection("users").doc(uid).set(profileDataFS),
                    5000,
                    "Signup profile sync"
                ).then(() => {
                    // Sign out immediately to prevent auto-login
                    return firebase.auth().signOut();
                });
            } else {
                return firebase.auth().signOut();
            }
        }).then(() => {
            window.isSigningUp = false;
            setLoading(false);
            
            // Clear fields
            document.getElementById("signup-username").value = "";
            document.getElementById("signup-email").value = "";
            document.getElementById("signup-password").value = "";
            document.getElementById("signup-captcha-input").value = "";
            generateCaptcha("signup-captcha-canvas");
            
            showCustomAlert(
                `SUCCESS: Operator account "${user}" has been provisioned.\n\nFor security clearance, you must now authenticate manually at the login terminal.`,
                "ACCOUNT_PROVISIONED",
                true
            ).then(() => {
                location.hash = "#/login";
            });
        }).catch(firestoreErr => {
            console.warn("Firestore signup write failed, falling back to local session:", firestoreErr);
            window.isSigningUp = false;
            setLoading(false);
            
            // Clear fields
            document.getElementById("signup-username").value = "";
            document.getElementById("signup-email").value = "";
            document.getElementById("signup-password").value = "";
            document.getElementById("signup-captcha-input").value = "";
            generateCaptcha("signup-captcha-canvas");

            // Proceed with local operator mode
            CyberState.username = user;
            enterConsole();
            addDashboardAlert("warn", `LOCAL_SYNC_ACTIVE: Firebase database rules rejected sync. Offline cache running.`);
        }).catch(err => {
            console.error("Signup error:", err);
            window.isSigningUp = false;
            setLoading(false);
            errEl.textContent = `PROVISIONING_FAILED: ${err.message}`;
        });
    });

    // Logout trigger
    logoutBtn.addEventListener("click", () => {
        sessionStorage.setItem("just_terminated", "1");
        sessionStorage.removeItem("is_logged_in");
        if (window.firebaseActive) {
            firebase.auth().signOut().then(() => {
                location.reload();
            });
        } else {
            localStorage.removeItem("cyber_ops_state");
            location.reload();
        }
    });

    // Reset connection trigger
    document.querySelectorAll(".link-reset-config").forEach(el => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("cyber_ops_firebase_config");
            localStorage.removeItem("cyber_ops_state");
            location.reload();
        });
    });
}

// Enforce Mobile & Emulated Viewport Access Policy
function enforceDeviceSecurityPolicy() {
    const isMobileDevice = () => {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        
        // 1. Standard mobile browser user agents
        if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini|silk/i.test(ua)) {
            return true;
        }

        // 2. iOS 13+ iPad Safari in Desktop Mode (pretends to be macOS desktop Safari but has touch points)
        if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
            return true;
        }

        // 3. Android browsers in Desktop Mode (pretend to be desktop Chrome but are touch devices under 1024px width)
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice) {
            const isDesktopOS = /windows|cros/i.test(ua);
            if (!isDesktopOS) {
                const screenWidth = Math.min(screen.width, screen.height);
                if (screenWidth < 1024) {
                    return true;
                }
            }
        }

        return false;
    };

    if (isMobileDevice()) {
        const overlay = document.getElementById("mobile-warning-overlay");
        if (overlay) {
            overlay.style.setProperty("display", "flex", "important");
            document.body.classList.add("mobile-blocked");
        }
    }
}

// Session Inactivity Guard (30s logout policy & page refresh logout policy)
function initSessionTimeoutGuard() {
    const TIMEOUT_MS = 30000; // 30 seconds
    window.forceSignOut = false;

    // Detect if page was refreshed or loaded while logged in
    if (sessionStorage.getItem("is_logged_in") === "1") {
        sessionStorage.removeItem("is_logged_in");
        sessionStorage.setItem("just_terminated", "1");
        window.forceSignOut = true;
    }

    // Unconditionally sign out on startup if forceSignOut is active
    if (window.forceSignOut) {
        localStorage.removeItem("cyber_ops_last_active");
        if (window.firebaseActive) {
            firebase.auth().signOut().catch(err => console.error("Auto signout failed:", err));
        } else {
            localStorage.removeItem("cyber_ops_state");
        }
    } else {
        // Check if they closed the tab/browser and returned after more than 30 seconds
        const lastActive = localStorage.getItem("cyber_ops_last_active");
        if (lastActive) {
            const elapsed = Date.now() - parseInt(lastActive, 10);
            if (elapsed > TIMEOUT_MS) {
                localStorage.removeItem("cyber_ops_last_active");
                window.forceSignOut = true;
                if (window.firebaseActive) {
                    firebase.auth().signOut().catch(err => console.error("Auto signout failed:", err));
                } else {
                    localStorage.removeItem("cyber_ops_state");
                }
            }
        }
    }

    // 2. Track tab visibility changes
    let hiddenTimestamp = null;
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            hiddenTimestamp = Date.now();
            localStorage.setItem("cyber_ops_last_active", hiddenTimestamp.toString());
        } else if (document.visibilityState === "visible") {
            const lastActive = localStorage.getItem("cyber_ops_last_active");
            if (lastActive) {
                const elapsed = Date.now() - parseInt(lastActive, 10);
                if (elapsed > TIMEOUT_MS) {
                    triggerTimeoutLogout();
                }
                localStorage.removeItem("cyber_ops_last_active");
            }
            hiddenTimestamp = null;
        }
    });

    // 3. Track page unload/close
    window.addEventListener("beforeunload", () => {
        localStorage.setItem("cyber_ops_last_active", Date.now().toString());
    });

    // Helper to perform the logout
    const triggerTimeoutLogout = () => {
        sessionStorage.setItem("just_terminated", "1");
        sessionStorage.removeItem("is_logged_in");
        if (window.firebaseActive && firebase.auth().currentUser) {
            firebase.auth().signOut().then(() => {
                location.reload();
            }).catch(err => {
                console.error("Timeout signout failed:", err);
                location.reload();
            });
        } else {
            // Local mode
            localStorage.removeItem("cyber_ops_state");
            location.reload();
        }
    };
}

// Custom Modal Promise Helpers
function showCustomConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById("custom-confirm-modal");
        const msgEl = document.getElementById("custom-confirm-message");
        const yesBtn = document.getElementById("custom-confirm-yes");
        const noBtn = document.getElementById("custom-confirm-no");

        if (!modal || !msgEl || !yesBtn || !noBtn) {
            resolve(confirm(message));
            return;
        }

        msgEl.textContent = message;
        modal.classList.add("show");

        const handleYes = () => {
            cleanup();
            resolve(true);
        };

        const handleNo = () => {
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            yesBtn.removeEventListener("click", handleYes);
            noBtn.removeEventListener("click", handleNo);
            modal.classList.remove("show");
        };

        yesBtn.addEventListener("click", handleYes);
        noBtn.addEventListener("click", handleNo);
    });
}

function showCustomAlert(message, title = "SYSTEM_ALERT", isSuccess = false) {
    return new Promise((resolve) => {
        const modal = document.getElementById("custom-alert-modal");
        const msgEl = document.getElementById("custom-alert-message");
        const okBtn = document.getElementById("custom-alert-ok");

        if (!modal || !msgEl || !okBtn) {
            alert(message);
            resolve();
            return;
        }

        // Dynamically style based on isSuccess
        const contentEl = modal.querySelector(".custom-modal-content");
        const titleEl = modal.querySelector(".modal-title");
        
        if (contentEl && titleEl) {
            titleEl.textContent = `> ${title}`;
            if (isSuccess) {
                contentEl.classList.remove("border-red");
                contentEl.classList.add("border-cyan");
                titleEl.classList.remove("text-neon-red");
                titleEl.classList.add("text-neon-cyan");
                okBtn.classList.remove("btn-danger");
                okBtn.classList.add("btn-safe");
                okBtn.textContent = "CONFIRM";
            } else {
                contentEl.classList.remove("border-cyan");
                contentEl.classList.add("border-red");
                titleEl.classList.remove("text-neon-cyan");
                titleEl.classList.add("text-neon-red");
                okBtn.classList.remove("btn-safe");
                okBtn.classList.add("btn-danger");
                okBtn.textContent = "ACKNOWLEDGE";
            }
        }

        msgEl.textContent = message;
        modal.classList.add("show");

        const handleOk = () => {
            cleanup();
            resolve();
        };

        const cleanup = () => {
            okBtn.removeEventListener("click", handleOk);
            modal.classList.remove("show");
        };

        okBtn.addEventListener("click", handleOk);
    });
}

function showCustomPrompt(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById("custom-prompt-modal");
        const msgEl = document.getElementById("custom-prompt-message");
        const inputEl = document.getElementById("custom-prompt-input");
        const submitBtn = document.getElementById("custom-prompt-submit");
        const cancelBtn = document.getElementById("custom-prompt-cancel");
        const errorEl = document.getElementById("custom-prompt-error-msg");

        if (!modal || !msgEl || !inputEl || !submitBtn || !cancelBtn) {
            resolve(prompt(message));
            return;
        }

        msgEl.textContent = message;
        inputEl.value = "";
        if (errorEl) errorEl.textContent = "";
        modal.classList.add("show");
        inputEl.focus();

        const handleSubmit = () => {
            const val = inputEl.value.trim();
            if (!val) {
                if (errorEl) errorEl.textContent = "Error: Input required.";
                return;
            }
            cleanup();
            resolve(val);
        };

        const handleCancel = () => {
            cleanup();
            resolve(null);
        };

        const handleKeyDown = (e) => {
            if (e.key === "Enter") {
                handleSubmit();
            } else if (e.key === "Escape") {
                handleCancel();
            }
        };

        const cleanup = () => {
            submitBtn.removeEventListener("click", handleSubmit);
            cancelBtn.removeEventListener("click", handleCancel);
            inputEl.removeEventListener("keydown", handleKeyDown);
            modal.classList.remove("show");
        };

        submitBtn.addEventListener("click", handleSubmit);
        cancelBtn.addEventListener("click", handleCancel);
        inputEl.addEventListener("keydown", handleKeyDown);
    });
}

// Authentication Lockout & Blocking Logic
const authInputIds = [
    "login-email",
    "login-password",
    "login-captcha-input",
    "btn-login-submit",
    "btn-google-signin",
    "btn-login-captcha-refresh",
    "signup-username",
    "signup-email",
    "signup-password",
    "signup-captcha-input",
    "btn-signup-submit",
    "btn-signup-captcha-refresh"
];

let blockIntervalId = null;

function handleFailedLoginAttempt() {
    let attempts = parseInt(localStorage.getItem("cyber_ops_failed_attempts") || "0", 10);
    attempts++;
    
    // Clear credentials and captcha fields so they can try again
    const captchaInput = document.getElementById("login-captcha-input");
    if (captchaInput) captchaInput.value = "";
    
    const passwordInput = document.getElementById("login-password");
    if (passwordInput) passwordInput.value = "";
    
    // Refresh CAPTCHA code
    if (typeof generateCaptcha === "function") {
        generateCaptcha("login-captcha-canvas");
    }
    
    if (typeof CyberAudio !== "undefined") {
        CyberAudio.playFailure();
    }
    
    if (attempts >= 3) {
        // Block the user for 5 minutes (300,000 ms)
        const blockedUntil = Date.now() + 5 * 60 * 1000;
        localStorage.setItem("cyber_ops_blocked_until", blockedUntil.toString());
        localStorage.setItem("cyber_ops_failed_attempts", "0");
        
        showCustomAlert("SECURITY_LOCKOUT: 3 incorrect attempts. Access blocked for 5 minutes.");
        checkAndEnforceLoginBlock();
    } else {
        localStorage.setItem("cyber_ops_failed_attempts", attempts.toString());
        showCustomAlert(`AUTHENTICATION_FAILED: Credentials are wrong. You will be blocked for a while if attempts continue. (Attempt ${attempts}/3)`);
    }
}

function checkAndEnforceLoginBlock() {
    const blockedUntilStr = localStorage.getItem("cyber_ops_blocked_until");
    if (!blockedUntilStr) {
        enableAuthInputs();
        return;
    }

    const blockedUntil = parseInt(blockedUntilStr, 10);
    const now = Date.now();

    if (now < blockedUntil) {
        disableAuthInputs();
        updateBlockTimer(blockedUntil);
        
        if (!blockIntervalId) {
            blockIntervalId = setInterval(() => {
                const currentNow = Date.now();
                if (currentNow >= blockedUntil) {
                    clearInterval(blockIntervalId);
                    blockIntervalId = null;
                    localStorage.removeItem("cyber_ops_blocked_until");
                    enableAuthInputs();
                } else {
                    updateBlockTimer(blockedUntil);
                }
            }, 1000);
        }
    } else {
        localStorage.removeItem("cyber_ops_blocked_until");
        enableAuthInputs();
    }
}

function disableAuthInputs() {
    authInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = true;
        }
    });
    const overlay = document.getElementById("gateway-overlay");
    if (overlay) {
        overlay.classList.add("lockout-active");
    }
}

function enableAuthInputs() {
    authInputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.disabled = false;
        }
    });
    
    const loginSubmitBtn = document.getElementById("btn-login-submit");
    if (loginSubmitBtn) {
        loginSubmitBtn.textContent = "INITIATE DECRYPTION";
    }
    
    const signupSubmitBtn = document.getElementById("btn-signup-submit");
    if (signupSubmitBtn) {
        signupSubmitBtn.textContent = "PROVISION ACCESS";
    }

    const overlay = document.getElementById("gateway-overlay");
    if (overlay) {
        overlay.classList.remove("lockout-active");
    }
}

function updateBlockTimer(blockedUntil) {
    const totalSeconds = Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    const loginSubmitBtn = document.getElementById("btn-login-submit");
    if (loginSubmitBtn) {
        loginSubmitBtn.textContent = `BLOCKED: ${timeString}`;
    }
    
    const signupSubmitBtn = document.getElementById("btn-signup-submit");
    if (signupSubmitBtn) {
        signupSubmitBtn.textContent = `BLOCKED: ${timeString}`;
    }
}

// Web Audio API Synthesizer for Retro Cyber Sounds
const CyberAudio = {
    ctx: null,
    humNode: null,
    isHumming: false,
    speechTimeout: null,

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        try {
            this.ctx = new AudioContext();
        } catch (e) {
            console.warn("Web Audio API not supported:", e);
        }
    },

    playClick() {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    },

    playKeystroke() {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.03);

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.03);
    },

    playSuccess() {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C Major Arpeggio
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0.08, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.2);
        });
    },

    playFailure() {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.35);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    },

    playHackingScan(duration = 2.0) {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const interval = 0.06;
        const steps = duration / interval;

        for (let i = 0; i < steps; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = Math.random() > 0.5 ? "sine" : "triangle";
            const randomFreq = 400 + Math.random() * 1200;
            osc.frequency.setValueAtTime(randomFreq, now + i * interval);

            gain.gain.setValueAtTime(0.03, now + i * interval);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * interval + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + i * interval);
            osc.stop(now + i * interval + 0.05);
        }
    },

    startTerminalHum() {
        this.init();
        if (!this.ctx || this.isHumming) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A hum

        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(110, this.ctx.currentTime); // 1st overtone

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(150, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.02, this.ctx.currentTime); // subtle background hum

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start();
        osc2.start();

        this.humNode = { osc1, osc2, gain };
        this.isHumming = true;
    },

    stopTerminalHum() {
        if (!this.isHumming || !this.humNode) return;
        try {
            this.humNode.osc1.stop();
            this.humNode.osc2.stop();
        } catch (e) {}
        this.isHumming = false;
        this.humNode = null;
    },

    speak(text) {
        if (!window.speechSynthesis) return;
        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => 
                v.name.toLowerCase().includes("robotic") ||
                v.name.toLowerCase().includes("david") || 
                v.name.toLowerCase().includes("google us english") || 
                v.lang.startsWith("en-")
            );
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            utterance.pitch = 0.55; // Lower pitch for a deep, real-world hacker voice
            utterance.rate = 0.85;  // Slower rate for measured robotic delivery
            utterance.volume = 0.9;
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn("Speech synthesis failed:", e);
        }
    },

    cleanButtonText(text) {
        if (!text) return "";
        let cleaned = text.trim();
        cleaned = cleaned.replace(/[><\[\]\?\↻]/g, "");
        cleaned = cleaned.replace(/_/g, " ");
        cleaned = cleaned.replace(/\s+/g, " ").trim();
        return cleaned.toLowerCase();
    }
};

function initCyberAudioListeners() {
    let hasSpokenStartup = false;

    // Pre-load voices for speech synthesis
    if (typeof window !== "undefined" && window.speechSynthesis) {
        const checkAndSpeakTermination = () => {
            if (hasSpokenStartup) return;
            
            if (sessionStorage.getItem("just_terminated") === "1") {
                sessionStorage.removeItem("just_terminated");
                hasSpokenStartup = true;
                setTimeout(() => {
                    CyberAudio.speak("Session terminated.");
                }, 200);
            } else {
                const isGatewayVisible = document.getElementById("gateway-overlay") && !document.getElementById("gateway-overlay").classList.contains("hidden");
                if (isGatewayVisible || sessionStorage.getItem("is_logged_in") !== "1") {
                    hasSpokenStartup = true;
                    setTimeout(() => {
                        CyberAudio.speak("Welcome to cyber operations. Please log in or sign up to access.");
                    }, 500);
                }
            }
        };

        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
            checkAndSpeakTermination();
        };
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
            checkAndSpeakTermination();
        }
    }

    // Start ambient hum on first click
    document.addEventListener("click", () => {
        CyberAudio.startTerminalHum();
    }, { once: true });

    // Play click sound and announce button name
    document.addEventListener("click", (e) => {
        const btn = e.target.closest("button") || e.target.closest("a") || e.target.closest(".tool-link-card") || e.target.closest(".tab-btn");
        if (btn) {
            CyberAudio.playClick();
            
            // Hacker voice button announcer: Only trigger on Login/Signup pages or Terminate Session
            const isGatewayOrLogout = btn.closest("#gateway-overlay") || btn.id === "btn-logout" || btn.closest("#btn-logout");
            if (isGatewayOrLogout) {
                let buttonText = "";
                if (btn.classList.contains("tool-link-card")) {
                    const header = btn.querySelector("h3");
                    buttonText = header ? header.textContent : "module select";
                } else {
                    buttonText = btn.textContent;
                }
                
                const cleanText = CyberAudio.cleanButtonText(buttonText);
                if (cleanText) {
                    // Cancel current speech immediately on click to cut off previous voice
                    if (window.speechSynthesis) {
                        window.speechSynthesis.cancel();
                    }
                    // Clear any pending queued speech timeouts
                    if (CyberAudio.speechTimeout) {
                        clearTimeout(CyberAudio.speechTimeout);
                    }
                    // Short delay after click sound to avoid overlap
                    CyberAudio.speechTimeout = setTimeout(() => {
                        CyberAudio.speak(cleanText);
                        CyberAudio.speechTimeout = null;
                    }, 100);
                }
            }
        }
    });

    // Play typing keystrokes
    document.addEventListener("keydown", (e) => {
        if (e.target.closest("input") || e.target.closest("textarea")) {
            if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter") {
                CyberAudio.playKeystroke();
            }
        }
    });
}


