/* Cyber Ops - Password Strength & Recommender Module */

function initPasswordChecker() {
    const passInput = document.getElementById("password-input");
    const scanBtn = document.getElementById("password-scan-btn");
    const copyBtn = document.getElementById("pass-copy-btn");

    if (passInput) {
        // Real-time audit as user types
        passInput.addEventListener("input", () => {
            const pass = passInput.value;
            if (pass.length === 0) {
                resetPassChecker();
            } else {
                runPasswordAudit(pass);
            }
        });
    }

    if (scanBtn && passInput) {
        scanBtn.addEventListener("click", () => {
            const pass = passInput.value;
            if (pass.length > 0) {
                runPasswordAudit(pass);
            }
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            const recommended = document.getElementById("pass-recommended-text").textContent;
            if (recommended && recommended !== "-") {
                navigator.clipboard.writeText(recommended).then(() => {
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = "COPIED!";
                    copyBtn.style.color = "var(--neon-green)";
                    copyBtn.style.borderColor = "var(--neon-green)";
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                        copyBtn.style.color = "";
                        copyBtn.style.borderColor = "";
                    }, 1500);
                });
            }
        });
    }
}

function resetPassChecker() {
    const entropyScore = document.getElementById("pass-entropy-score");
    const entropyLabel = document.getElementById("pass-entropy-label");
    const strengthBar = document.getElementById("pass-strength-bar");
    const metricsGrid = document.getElementById("pass-metrics-grid");
    const upgradeBox = document.getElementById("pass-upgrade-box");
    const placeholder = document.getElementById("pass-upgrade-placeholder");

    if (entropyScore) {
        entropyScore.textContent = "00";
        entropyScore.style.color = "var(--text-dim)";
        entropyScore.style.textShadow = "none";
    }
    if (entropyLabel) {
        entropyLabel.textContent = "NO CREDENTIAL";
        entropyLabel.style.color = "var(--text-dim)";
    }
    if (strengthBar) {
        strengthBar.style.width = "0%";
        strengthBar.style.backgroundColor = "var(--text-dim)";
        strengthBar.style.boxShadow = "none";
    }
    if (metricsGrid) {
        metricsGrid.innerHTML = "";
    }
    if (upgradeBox) upgradeBox.classList.add("hidden");
    if (placeholder) placeholder.classList.remove("hidden");
}

function runPasswordAudit(pass) {
    if (typeof updateUserAction === "function") {
        updateUserAction("Auditing password strength");
    }

    const entropyScoreEl = document.getElementById("pass-entropy-score");
    const entropyLabelEl = document.getElementById("pass-entropy-label");
    const strengthBarEl = document.getElementById("pass-strength-bar");
    const metricsGridEl = document.getElementById("pass-metrics-grid");
    const upgradeBox = document.getElementById("pass-upgrade-box");
    const placeholder = document.getElementById("pass-upgrade-placeholder");
    const recommendedTextEl = document.getElementById("pass-recommended-text");
    const rulesListEl = document.getElementById("pass-upgrade-rules-list");

    // 1. Calculate metrics
    const len = pass.length;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasDigit = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);

    // Common bad passwords check
    const commonPasswords = ["123456", "password", "qwerty", "12345678", "12345", "123456789", "credentials", "admin123", "password123"];
    const isCommon = commonPasswords.includes(pass.toLowerCase());

    // 2. Compute entropy score
    let score = 0;
    // Length contribution
    score += Math.min(40, len * 3);
    // Variety contribution
    if (hasUpper) score += 15;
    if (hasLower) score += 10;
    if (hasDigit) score += 15;
    if (hasSpecial) score += 20;

    // Penalties
    if (isCommon) {
        score = Math.min(10, score - 50); // Severe penalty for common passwords
    } else if (len < 6) {
        score = Math.max(5, score - 30);
    }

    score = Math.max(0, Math.min(100, score));

    // Determine strength profile
    let label = "WEAK";
    let labelColor = "var(--neon-red)";
    let shadowColor = "var(--glow-shadow-red)";
    if (score > 70) {
        label = "SECURE // STRONG";
        labelColor = "var(--neon-green)";
        shadowColor = "var(--glow-shadow-green)";
    } else if (score > 35) {
        label = "WARNING // MEDIUM";
        labelColor = "var(--neon-orange)";
        shadowColor = "var(--glow-shadow-orange)";
    } else {
        label = "CRITICAL // WEAK";
        labelColor = "var(--neon-red)";
        shadowColor = "var(--glow-shadow-red)";
    }

    // Update UI elements
    if (entropyScoreEl) {
        entropyScoreEl.textContent = score.toString().padStart(2, '0');
        entropyScoreEl.style.color = labelColor;
        entropyScoreEl.style.textShadow = shadowColor;
    }
    if (entropyLabelEl) {
        entropyLabelEl.textContent = label;
        entropyLabelEl.style.color = labelColor;
    }
    if (strengthBarEl) {
        strengthBarEl.style.width = `${score}%`;
        strengthBarEl.style.backgroundColor = labelColor;
        strengthBarEl.style.boxShadow = shadowColor;
    }

    if (metricsGridEl) {
        metricsGridEl.innerHTML = `
            <div class="intel-item">
                <span class="intel-label">Length Count</span>
                <span class="intel-status-val ${len >= 12 ? 'success' : (len >= 8 ? 'warning' : 'danger')}">${len} chars</span>
            </div>
            <div class="intel-item">
                <span class="intel-label">Casing Variety</span>
                <span class="intel-status-val ${hasUpper && hasLower ? 'success' : 'danger'}">${hasUpper && hasLower ? 'YES' : 'NO'}</span>
            </div>
            <div class="intel-item">
                <span class="intel-label">Digit Variety</span>
                <span class="intel-status-val ${hasDigit ? 'success' : 'danger'}">${hasDigit ? 'YES' : 'NO'}</span>
            </div>
            <div class="intel-item">
                <span class="intel-label">Symbol Variety</span>
                <span class="intel-status-val ${hasSpecial ? 'success' : 'danger'}">${hasSpecial ? 'YES' : 'NO'}</span>
            </div>
        `;
    }

    // 3. Generate Smart Upgrade Recommendation
    const upgradeResults = getSmartUpgrade(pass);
    if (recommendedTextEl) {
        recommendedTextEl.textContent = upgradeResults.password;
    }

    if (rulesListEl) {
        rulesListEl.innerHTML = `
            <div class="help-title">> APPLIED UPGRADE TRANSFORMS:</div>
            <ul class="help-list" style="margin-top: 10px; font-size: 12px; gap: 5px;">
                ${upgradeResults.rules.map(rule => `<li><span class="help-bullet" style="color: var(--neon-pink)">*</span> ${rule}</li>`).join('')}
            </ul>
        `;
    }

    if (placeholder) placeholder.classList.add("hidden");
    if (upgradeBox) upgradeBox.classList.remove("hidden");

    // Cache latest password audit results for PDF reports
    window.LatestPasswordData = {
        score: score,
        label: label,
        length: len,
        hasUpper: hasUpper,
        hasLower: hasLower,
        hasDigit: hasDigit,
        hasSpecial: hasSpecial,
        isCommon: isCommon,
        upgradedPass: upgradeResults.password,
        upgradedRules: upgradeResults.rules
    };

    // Save scan to state & gain XP
    if (typeof CyberState !== "undefined") {
        if (!CyberState.scansDone.password) {
            CyberState.scansDone.password = 1;
            if (typeof gainXP === "function") {
                gainXP(100, "First Credential Entropy Audit");
            }
        }
    }
}

function getSmartUpgrade(pass) {
    let upgraded = pass;
    const rules = [];

    // 1. Substitute characters (Leetspeak substitutions)
    const original = upgraded;
    const subMap = {
        'a': '@', 'A': '@',
        's': '$', 'S': '$',
        'e': '3', 'E': '3',
        'o': '0', 'O': '0',
        'i': '!', 'I': '!',
        't': '7', 'T': '7'
    };
    
    let subbed = "";
    let hasSub = false;
    for (let char of upgraded) {
        if (subMap[char]) {
            subbed += subMap[char];
            hasSub = true;
        } else {
            subbed += char;
        }
    }
    if (hasSub) {
        upgraded = subbed;
        rules.push("Applied leetspeak character transformations (e.g. s → $, e → 3, a → @)");
    }

    // 2. Introduce casing complexity
    if (!/[A-Z]/.test(upgraded) || !/[a-z]/.test(upgraded)) {
        // Alternating case
        let mixed = "";
        for (let i = 0; i < upgraded.length; i++) {
            mixed += i % 2 === 0 ? upgraded[i].toUpperCase() : upgraded[i].toLowerCase();
        }
        upgraded = mixed;
        rules.push("Injected capitalization variance (alternating character cases)");
    }

    // 3. Special character check
    if (!/[^A-Za-z0-9]/.test(upgraded)) {
        upgraded += "_#";
        rules.push("Appended special security symbols (_#)");
    }

    // 4. Digit check
    if (!/[0-9]/.test(upgraded)) {
        upgraded += "99";
        rules.push("Appended cryptographic digit sequence (99)");
    }

    // 5. Pad short passwords
    if (upgraded.length < 12) {
        const padding = "!OpsSecure";
        upgraded += padding;
        rules.push(`Padded short length to ${upgraded.length} characters for maximum entropy`);
    }

    return {
        password: upgraded,
        rules: rules.length > 0 ? rules : ["No upgrades needed! Password already meets strong cryptographic thresholds."]
    };
}
