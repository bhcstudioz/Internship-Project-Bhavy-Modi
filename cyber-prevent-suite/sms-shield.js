/* Cyber Ops - SMS Bombing Defender Module */

// Mock APIs that spammers abuse for sending OTP messages
const mockOtpApis = [
    { name: "Zomato OTP Gateway", host: "api.zomato.com", endpoint: "/v2/auth/send-otp" },
    { name: "Swiggy Login Service", host: "identity.swiggy.com", endpoint: "/api/v1/request-otp" },
    { name: "Amazon Direct SMS", host: "sns.us-east-1.amazonaws.com", endpoint: "/?Action=Publish" },
    { name: "Flipkart Verification", host: "passport.flipkart.com", endpoint: "/otp/dispatch" },
    { name: "Uber Mobile Auth", host: "api.uber.com", endpoint: "/v1/auth/otp" },
    { name: "Ola Cab Verify", host: "consumer.olacabs.com", endpoint: "/api/otp/send" },
    { name: "JioMart SMS Node", host: "login.jiomart.com", endpoint: "/v2/sms/send-otp" },
    { name: "PharmEasy OTP Node", host: "api.pharmeasy.in", endpoint: "/auth/requestOtp" },
    { name: "Zepto Delivery Auth", host: "auth.zepto.co", endpoint: "/api/v1/auth/otp/send" },
    { name: "Licious Verification", host: "identity.licious.in", endpoint: "/api/otp/request" },
    { name: "Myntra Account Core", host: "accounts.myntra.com", endpoint: "/v1/otp/generate" }
];

// Messages templates matching common transactional spam OTPs
const otpMessages = [
    { title: "Zomato OTP", body: "Your OTP is 8294. Use this to verify your Zomato account. Do not share this code." },
    { title: "Swiggy OTP", body: "3029 is your verification OTP for Swiggy. Valid for 5 minutes." },
    { title: "Amazon Auth", body: "Amazon: 729104 is your authentication OTP code. Do not share it." },
    { title: "Flipkart Verification", body: "Flipkart: Use 482019 to complete your login. Valid for 10 mins." },
    { title: "Uber Security", body: "Uber code: 9381. Reply STOP to unsubscribe or log in to secure your account." },
    { title: "Ola cabs", body: "Ola Cabs: Your login verification OTP code is 3829. Do not disclose." },
    { title: "JioMart Care", body: "Your OTP code for JioMart login is 8203. Secure connection." },
    { title: "PharmEasy Health", body: "PharmEasy: Your OTP is 1948. Do not share with anyone." },
    { title: "Zepto Fast", body: "Zepto login: 4920 is your OTP code. Happy ordering!" },
    { title: "Licious OTP", body: "Licious: Use OTP 3920 to sign in. Code valid for 3 minutes." },
    { title: "Myntra Support", body: "Myntra verification: 938201. Do not share this OTP." }
];

let smsSimState = {
    isAttacking: false,
    shieldActive: false,
    attackInterval: null,
    phoneNum: "",
    count: 0
};

function initSmsShield() {
    const phoneInput = document.getElementById("sms-phone-input");
    const simBtn = document.getElementById("sms-sim-btn");
    const shieldToggle = document.getElementById("sms-shield-toggle");

    if (!simBtn || !shieldToggle) return;

    // Load initial shield toggle state
    smsSimState.shieldActive = shieldToggle.checked;
    updateShieldUI(shieldToggle.checked);

    // Bind Shield Switch Toggle
    shieldToggle.addEventListener("change", (e) => {
        smsSimState.shieldActive = e.target.checked;
        updateShieldUI(smsSimState.shieldActive);

        if (typeof updateUserAction === "function") {
            updateUserAction(smsSimState.shieldActive ? "Enabling SMS Bomb Shield Firewall" : "Disabling SMS Bomb Shield Firewall");
        }

        // Print log
        if (smsSimState.shieldActive) {
            appendSmsLog("info", `[CONFIG] Anti-Bombing API WAF Firewall activated.`);
            appendSmsLog("blocked", `[SHIELD] Dynamic Rate Limiting engaged. Max 3 OTP requests/min enabled.`);
            
            // If currently under attack, award XP and trigger scan done state
            if (smsSimState.isAttacking) {
                triggerSmsShieldAuditSuccess();
            }
        } else {
            appendSmsLog("info", `[CONFIG] Firewall deactivated. Protection offline.`);
            appendSmsLog("attack", `[WARNING] System vulnerable to bulk API abuse flood.`);
        }
    });

    // Bind Simulation Button
    simBtn.addEventListener("click", () => {
        if (smsSimState.isAttacking) {
            stopSmsAttackSimulation();
        } else {
            const rawPhone = phoneInput.value.trim();
            if (!rawPhone || rawPhone.length < 8) {
                appendSmsLog("attack", `[ERROR] Invalid mobile number. Provide country code & numeric digit path.`);
                // Shake input
                phoneInput.style.borderColor = "var(--neon-red)";
                setTimeout(() => { phoneInput.style.borderColor = ""; }, 500);
                return;
            }
            smsSimState.phoneNum = rawPhone;
            if (typeof updateUserAction === "function") {
                updateUserAction("Simulating SMS bombing on: " + rawPhone);
            }
            startSmsAttackSimulation();
        }
    });
}

function updateShieldUI(active) {
    const shieldStatusText = document.getElementById("sms-shield-status-text");
    const phoneDisplay = document.getElementById("phone-notifications-area");

    if (active) {
        if (shieldStatusText) {
            shieldStatusText.textContent = "ACTIVE (FIREWALL PROTECTED)";
            shieldStatusText.className = "shield-status-indicator text-neon-green";
        }
        if (phoneDisplay) {
            phoneDisplay.classList.add("secured");
            const overlay = phoneDisplay.querySelector(".phone-status-overlay");
            if (overlay) overlay.textContent = "SHIELD: ON";
        }
    } else {
        if (shieldStatusText) {
            shieldStatusText.textContent = "OFFLINE (UNPROTECTED)";
            shieldStatusText.className = "shield-status-indicator text-neon-red";
        }
        if (phoneDisplay) {
            phoneDisplay.classList.remove("secured");
            const overlay = phoneDisplay.querySelector(".phone-status-overlay");
            if (overlay) overlay.textContent = "SHIELD: OFF";
        }
    }
}

function appendSmsLog(type, text) {
    const logContainer = document.getElementById("sms-log-container");
    if (!logContainer) return;

    const time = new Date().toTimeString().split(' ')[0];
    const entry = document.createElement("div");
    entry.className = `log-entry log-${type}`;
    entry.textContent = `[${time}] ${text}`;
    logContainer.appendChild(entry);
    
    // Auto-scroll
    logContainer.scrollTop = logContainer.scrollHeight;
}

function startSmsAttackSimulation() {
    const simBtn = document.getElementById("sms-sim-btn");
    const phoneDisplay = document.getElementById("phone-notifications-area");
    
    smsSimState.isAttacking = true;
    simBtn.textContent = "STOP ATTACK";
    simBtn.style.borderColor = "var(--neon-red)";
    simBtn.style.color = "var(--neon-red)";

    appendSmsLog("attack", `[ATTACK_START] Mounting SMS bombing attack targetting: ${smsSimState.phoneNum}`);
    appendSmsLog("info", `[ATTACK_INFO] Spinning up automated HTTP request loop threads...`);

    // Clear display placeholder
    if (phoneDisplay) {
        const placeholder = phoneDisplay.querySelector(".phone-placeholder-text");
        if (placeholder) placeholder.style.display = "none";
    }

    // Award XP if shield is active already
    if (smsSimState.shieldActive) {
        triggerSmsShieldAuditSuccess();
    }

    // Interval loop for attacks (every 1000ms)
    smsSimState.attackInterval = setInterval(() => {
        // Get random service
        const idx = Math.floor(Math.random() * mockOtpApis.length);
        const api = mockOtpApis[idx];
        const msg = otpMessages[idx];

        // Format raw packet log representation
        appendSmsLog("system", `>> POST ${api.endpoint} HTTP/1.1 (Host: ${api.host}, phone: ${smsSimState.phoneNum})`);

        setTimeout(() => {
            if (!smsSimState.isAttacking) return;

            if (smsSimState.shieldActive) {
                // Intercepted
                appendSmsLog("blocked", `<< HTTP/1.1 429 Too Many Requests (Blocked by API rate limit rules)`);
                appendSmsLog("blocked", `[FIREWALL] Intercepted abuse thread targeting phone.`);
            } else {
                // Dispatched successfully
                appendSmsLog("attack", `<< HTTP/1.1 200 OK (OTP successfully generated and sent to SMS carrier gateway)`);
                
                // Add phone notification UI card
                displayPhoneNotification(msg.title, msg.body);
                
                // Shake phone
                shakePhoneMockup();
            }
        }, 250);

    }, 1000);
}

function stopSmsAttackSimulation() {
    const simBtn = document.getElementById("sms-sim-btn");
    smsSimState.isAttacking = false;
    
    if (smsSimState.attackInterval) {
        clearInterval(smsSimState.attackInterval);
        smsSimState.attackInterval = null;
    }

    simBtn.textContent = "MOUNT ATTACK";
    simBtn.style.borderColor = "";
    simBtn.style.color = "";

    appendSmsLog("info", `[ATTACK_COOLDOWN] Attack script terminated. Active threads closing... OK`);
}

function displayPhoneNotification(title, text) {
    const phoneDisplay = document.getElementById("phone-notifications-area");
    if (!phoneDisplay) return;

    const noti = document.createElement("div");
    noti.className = "phone-notification";
    noti.innerHTML = `
        <div class="noti-header" style="display:flex;justify-content:space-between;align-items:center;">
            <span class="noti-title">${title}</span>
            <span class="noti-time" style="font-size:7px;color:#a0aec0;">now</span>
        </div>
        <div class="noti-body">${text}</div>
    `;

    phoneDisplay.appendChild(noti);

    // Keep display capped at 5 notifications
    while (phoneDisplay.children.length > 5) {
        const notifications = phoneDisplay.querySelectorAll(".phone-notification");
        if (notifications.length > 0) {
            phoneDisplay.removeChild(notifications[0]);
        } else {
            break;
        }
    }

    // Auto-scroll phone area
    phoneDisplay.scrollTop = phoneDisplay.scrollHeight;
}

function shakePhoneMockup() {
    const container = document.getElementById("phone-vibe-container");
    if (!container) return;

    container.classList.add("phone-vibrate");
    setTimeout(() => {
        container.classList.remove("phone-vibrate");
    }, 250);
}

function triggerSmsShieldAuditSuccess() {
    if (typeof CyberState !== "undefined") {
        if (!CyberState.scansDone.smsShield) {
            CyberState.scansDone.smsShield = 1;
            if (typeof gainXP === "function") {
                gainXP(150, "First SMS Bombing Defense Activation");
            }
            if (typeof saveState === "function") {
                saveState();
            }
        }
    }
}

// Expose smsSimState globally for PDF generation
window.smsSimState = smsSimState;
