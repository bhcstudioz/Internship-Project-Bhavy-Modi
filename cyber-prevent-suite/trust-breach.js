/* Cyber Ops - Trust Scanner & Data Breach Auditor Module */

// Deterministic hash helper to make unknown domain scans look realistic and consistent
function cyrb128(str) {
    let h1 = 1779033703, h2 = 3024733165, h3 = 336245363, h4 = 502493819;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

// Famous historical breaches mock database
const BREACHES_DATABASE = [
    {
        name: "Adobe Systems Leak",
        year: 2013,
        details: "Compromised accounts included internal encrypted passwords, hints, and emails.",
        dataTypes: "Emails, Password hints, Cryptographic passwords"
    },
    {
        name: "Canva Design Network",
        year: 2019,
        details: "Attackers breached files containing usernames, emails, cities of origin, and bcrypt password hashes.",
        dataTypes: "Usernames, Emails, Geographical locations, Salted passwords"
    },
    {
        name: "LinkedIn Core DB",
        year: 2016,
        details: "A massive archive of user details was posted online, featuring poorly hashed SHA1 passwords.",
        dataTypes: "Emails, Cryptographic passwords"
    },
    {
        name: "Dropbox Storage Sync",
        year: 2012,
        details: "Corporate network credentials were used to access cloud DBs, exposing user directories.",
        dataTypes: "Emails, Bcrypt passwords"
    },
    {
        name: "Yahoo! Account Breach",
        year: 2014,
        details: "State-sponsored actor stole user names, emails, dates of birth, telephone numbers, and hashed passwords.",
        dataTypes: "Names, Emails, Phone numbers, Password hashes"
    }
];

function initTrustBreach() {
    // A. SETUP WEBSITE SCAN TABS
    const tabs = document.querySelectorAll(".tabs-header .tab-btn");
    const tabContents = document.querySelectorAll(".trust-breach-container .tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const targetTab = tab.getAttribute("data-tab");
            tabs.forEach(t => t.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            tab.classList.add("active");
            const activeContent = document.getElementById(targetTab);
            if (activeContent) activeContent.classList.add("active");
        });
    });

    // B. DOMAIN PROBE LOGIC
    const probeBtn = document.getElementById("trust-scan-btn");
    const domainInput = document.getElementById("trust-domain-input");

    if (probeBtn && domainInput) {
        probeBtn.addEventListener("click", () => {
            const domain = domainInput.value.trim();
            if (!domain) return;
            if (typeof updateUserAction === "function") {
                updateUserAction("Probing domain security: " + domain.toUpperCase());
            }
            runDomainProbe(domain);
        });

        domainInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const domain = domainInput.value.trim();
                if (!domain) return;
                if (typeof updateUserAction === "function") {
                    updateUserAction("Probing domain security: " + domain.toUpperCase());
                }
                runDomainProbe(domain);
            }
        });
    }

    // C. BREACH DATABASE QUERY LOGIC
    const queryBtn = document.getElementById("breach-query-btn");
    const emailInput = document.getElementById("breach-email-input");

    if (queryBtn && emailInput) {
        queryBtn.addEventListener("click", () => {
            const email = emailInput.value.trim();
            if (!email) return;
            if (typeof updateUserAction === "function") {
                updateUserAction("Auditing email breaches: " + email.toUpperCase());
            }
            runBreachQuery(email);
        });

        emailInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const email = emailInput.value.trim();
                if (!email) return;
                if (typeof updateUserAction === "function") {
                    updateUserAction("Auditing email breaches: " + email.toUpperCase());
                }
                runBreachQuery(email);
            }
        });
    }
}

// B1. Run Domain scan simulator
function runDomainProbe(domain) {
    const consoleFeed = document.getElementById("trust-console-log");
    const reportSection = document.getElementById("trust-report-section");
    
    // Clean input
    let cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/i, "").split('/')[0];
    
    // Hide report, reset console feed
    reportSection.classList.add("hidden");
    consoleFeed.classList.remove("hidden");
    consoleFeed.innerHTML = "";

    // Generate scan stages
    const seed = cyrb128(cleanDomain)[0];
    const isWhitelisted = ["google.com", "apple.com", "microsoft.com", "amazon.com", "paypal.com", "netflix.com", "facebook.com", "yahoo.com", "linkedin.com"].includes(cleanDomain.toLowerCase());
    const isPhishingSpoof = cleanDomain.toLowerCase().includes("paypal") || cleanDomain.toLowerCase().includes("netflix") || cleanDomain.toLowerCase().includes("login");
    const isLowCredibility = isPhishingSpoof && !isWhitelisted;

    // Deterministic parameters based on domain hash
    const domainAge = isWhitelisted ? (20 + (seed % 10)) : isLowCredibility ? 0 : (1 + (seed % 12)); // age in years (0 means brand new / days old)
    const hasHttps = true; // default TLS for probes
    const hasCsp = isWhitelisted ? true : (seed % 2 === 0);
    const hasHsts = isWhitelisted ? true : (seed % 3 !== 0);
    const hasXFrame = isWhitelisted ? true : (seed % 4 !== 0);
    const hasDnsSec = isWhitelisted ? true : (seed % 5 === 0);

    const logLines = [
        `[PING] Testing connection to gateway node ${cleanDomain}... SUCCESS`,
        `[WHOIS] Extracting registry files from WHOIS databases...`,
        `[WHOIS] Domain Registered: ${domainAge === 0 ? "24 hours ago (UNVERIFIED)" : `${domainAge} years ago`}`,
        `[TLS] Testing TLS/SSL handshake configuration...`,
        `[TLS] Handshake: TLS v1.3 Verified. Key Exchange: ECDHE-RSA-2048`,
        `[TLS] Certificate Authority: ${isWhitelisted ? "DigiCert Commercial CA" : "Let's Encrypt Authority DV (Free Tier)"}`,
        `[HEADERS] Fetching HTTP security configuration headers...`,
        `[HEADER] Content-Security-Policy (CSP): ${hasCsp ? "ACTIVE (STRICT)" : "MISSING (XSS vulnerability)"}`,
        `[HEADER] Strict-Transport-Security (HSTS): ${hasHsts ? "ACTIVE" : "MISSING (SSL strip vulnerability)"}`,
        `[HEADER] X-Frame-Options: ${hasXFrame ? "ACTIVE (SAMEORIGIN)" : "MISSING (Clickjacking vulnerability)"}`,
        `[DNS] Fetching DNS records...`,
        `[DNS] DNSSEC Signature: ${hasDnsSec ? "VALIDATED" : "INACTIVE / UNSIGNED"}`
    ];

    if (isLowCredibility) {
        logLines.push(`[WARN] Domain mimics commercial brand signature (Branding: Spoof Trigger).`);
        logLines.push(`[WARN] Threat Database matches negative reputation index.`);
    } else {
        logLines.push(`[INFO] Checked local threat lists. Clean signatures.`);
    }
    logLines.push(`[COMPLETE] Security audit compiled. Formulating trust verdict.`);

    // Stream lines out
    let index = 0;
    const streamInterval = setInterval(() => {
        if (index < logLines.length) {
            const line = document.createElement("div");
            line.className = "console-feed-line";
            
            const isWarn = logLines[index].includes("[WARN]") || logLines[index].includes("MISSING") || logLines[index].includes("UNVERIFIED");
            const isSuccess = logLines[index].includes("[SUCCESS]") || logLines[index].includes("ACTIVE") || logLines[index].includes("VALIDATED");
            
            if (isWarn) {
                line.innerHTML = `<span class="text-neon-orange">${logLines[index]}</span>`;
            } else if (isSuccess) {
                line.innerHTML = `<span class="text-neon-green">${logLines[index]}</span>`;
            } else {
                line.innerHTML = `<span class="text-secondary">${logLines[index]}</span>`;
            }
            
            consoleFeed.appendChild(line);
            consoleFeed.scrollTop = consoleFeed.scrollHeight;
            index++;
        } else {
            clearInterval(streamInterval);
            setTimeout(() => {
                consoleFeed.classList.add("hidden");
                renderDomainReport(cleanDomain, domainAge, hasHttps, hasCsp, hasHsts, hasXFrame, hasDnsSec, isLowCredibility);
            }, 800);
        }
    }, 250);
}

// B2. Render the computed Domain Trust report
function renderDomainReport(domain, age, https, csp, hsts, xframe, dnssec, isLowCredibility) {
    const reportSection = document.getElementById("trust-report-section");
    const numEl = document.getElementById("trust-score-num");
    const gaugeEl = document.getElementById("trust-score-gauge");
    const verdictEl = document.getElementById("trust-verdict-title");
    const gridEl = document.getElementById("trust-indicators-grid");

    reportSection.classList.remove("hidden");

    // Score Calculation
    let score = 50; // base score
    if (age > 10) score += 15;
    else if (age > 2) score += 10;
    else if (age === 0) score -= 25; // zero age is bad
    
    if (csp) score += 10;
    if (hsts) score += 10;
    if (xframe) score += 10;
    if (dnssec) score += 5;
    
    if (isLowCredibility) score -= 35;

    score = Math.max(5, Math.min(99, score)); // range bounded

    // Cache latest domain results for PDF reports
    window.LatestTrustBreachData = window.LatestTrustBreachData || {};
    window.LatestTrustBreachData.domain = {
        domain, age, https, csp, hsts, xframe, dnssec, isLowCredibility, score
    };

    // Animate score number
    let currentScore = 0;
    const countDuration = 600;
    const startTime = performance.now();
    
    const animate = (time) => {
        const progress = Math.min((time - startTime) / countDuration, 1);
        const val = Math.floor(progress * score);
        numEl.textContent = val.toString().padStart(2, '0');
        
        // Gauge stroke-dashoffset (Circumference is 282.7)
        const offset = 282.7 - (val / 100) * 282.7;
        gaugeEl.style.strokeDashoffset = offset;

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };
    requestAnimationFrame(animate);

    // Set Verdict Label
    if (score >= 80) {
        verdictEl.textContent = "LEGITIMATE / SECURE";
        verdictEl.className = "trust-verdict-title text-neon-green";
    } else if (score >= 45) {
        verdictEl.textContent = "SUSPICIOUS CONFIG";
        verdictEl.className = "trust-verdict-title text-neon-orange";
    } else {
        verdictEl.textContent = "HIGH RISK / THREAT";
        verdictEl.className = "trust-verdict-title text-neon-red";
    }

    // Load breakdown grid
    gridEl.innerHTML = `
        <div class="intel-item">
            <span class="intel-label">SSL Connection</span>
            <span class="intel-status-val success">PRESENT</span>
        </div>
        <div class="intel-item">
            <span class="intel-label">Domain Longevity</span>
            <span class="intel-status-val ${age === 0 ? 'danger' : age < 3 ? 'warning' : 'success'}">
                ${age === 0 ? 'New (< 24h)' : `${age} Years`}
            </span>
        </div>
        <div class="intel-item">
            <span class="intel-label">CSP Header</span>
            <span class="intel-status-val ${csp ? 'success' : 'danger'}">${csp ? 'ACTIVE' : 'MISSING'}</span>
        </div>
        <div class="intel-item">
            <span class="intel-label">HSTS Enforce</span>
            <span class="intel-status-val ${hsts ? 'success' : 'danger'}">${hsts ? 'ACTIVE' : 'MISSING'}</span>
        </div>
        <div class="intel-item">
            <span class="intel-label">X-Frame Defense</span>
            <span class="intel-status-val ${xframe ? 'success' : 'danger'}">${xframe ? 'ACTIVE' : 'MISSING'}</span>
        </div>
        <div class="intel-item">
            <span class="intel-label">DNSSEC Signed</span>
            <span class="intel-status-val ${dnssec ? 'success' : 'warning'}">${dnssec ? 'ACTIVE' : 'INACTIVE'}</span>
        </div>
    `;

    // Save scan to state
    if (typeof CyberState !== "undefined") {
        CyberState.scansDone.domain++;
        if (typeof gainXP === "function" && CyberState.scansDone.domain === 1) {
            gainXP(50, "First Domain Trust Scanner run");
        } else {
            saveState();
        }
    }
}

// C1. Run Email breach verification query
function runBreachQuery(email) {
    const loadingAnim = document.getElementById("breach-loading-anim");
    const resultsSection = document.getElementById("breach-results-section");

    // Hide old results, show loader
    resultsSection.classList.add("hidden");
    loadingAnim.classList.remove("hidden");

    setTimeout(() => {
        loadingAnim.classList.add("hidden");
        resultsSection.classList.remove("hidden");

        const cleanEmail = email.toLowerCase().trim();
        const seed = cyrb128(cleanEmail)[0];

        // Specific trigger conditions
        const isSafeTest = cleanEmail.includes("clean") || cleanEmail.includes("secure");
        const isHackedTest = cleanEmail.includes("hacked") || cleanEmail.includes("compromised");
        
        let leaks = [];
        
        if (isSafeTest) {
            // Keep empty
        } else if (isHackedTest) {
            // Return 3 mock leaks
            leaks = [BREACHES_DATABASE[0], BREACHES_DATABASE[1], BREACHES_DATABASE[2]];
        } else {
            // Deterministic selection for random users
            // 40% probability of having leaks
            const hasLeaks = (seed % 10) < 4;
            if (hasLeaks) {
                const leakCount = 1 + (seed % 3); // 1 to 3 leaks
                const indices = [];
                while (indices.length < leakCount) {
                    const idx = (seed + indices.length) % BREACHES_DATABASE.length;
                    if (!indices.includes(idx)) indices.push(idx);
                }
                leaks = indices.map(i => BREACHES_DATABASE[i]);
            }
        }

        renderBreachResults(cleanEmail, leaks);
    }, 1800);
}

// C2. Render Email breach query results
function renderBreachResults(email, leaks) {
    const banner = document.getElementById("breach-banner");
    const listEl = document.getElementById("breach-leaks-list");
    const mitigationsEl = document.getElementById("breach-mitigations");

    listEl.innerHTML = "";

    // Cache latest email leaks for PDF reports
    window.LatestTrustBreachData = window.LatestTrustBreachData || {};
    window.LatestTrustBreachData.emailBreaches = {
        email: email,
        leaks: leaks
    };

    if (leaks.length === 0) {
        banner.className = "breach-summary-banner breach-banner-clean";
        banner.innerHTML = `
            <span>0 DATA BREACH EXPOSURES IDENTIFIED</span>
            <span style="font-size:11px;">EMAIL: ${email}</span>
        `;
        listEl.innerHTML = `
            <div class="leak-card" style="grid-column: span 2; border-color: var(--neon-green); text-align:center; padding: 25px;">
                <h4 class="text-neon-green" style="font-size: 18px; margin-bottom:10px;">CREDENTIAL SECURITY SECURE</h4>
                <p style="font-size:13.5px; color: var(--text-secondary);">Your email profile does not match entries in our index logs of public historical corporate leaks. Maintain vigilance and enable 2FA on active profiles.</p>
            </div>
        `;

        mitigationsEl.innerHTML = `
            <li class="mitigation-step">
                <span class="mitigation-num">[01]</span>
                <span class="mitigation-detail">No action required. Maintain security hygene schedule.</span>
            </li>
        `;
    } else {
        banner.className = "breach-summary-banner breach-banner-leaked";
        banner.innerHTML = `
            <span>${leaks.length} EXPOSURE(S) DETECTED IN KNOWN LEAKS</span>
            <span style="font-size:11px;">EMAIL: ${email}</span>
        `;

        leaks.forEach(leak => {
            const card = document.createElement("div");
            card.className = "leak-card";
            card.innerHTML = `
                <div class="leak-title">
                    <span>${leak.name}</span>
                    <span class="leak-year">${leak.year}</span>
                </div>
                <div class="leak-data-types text-neon-orange">Leaks: ${leak.dataTypes}</div>
                <p class="leak-desc">${leak.details}</p>
            `;
            listEl.appendChild(card);
        });

        mitigationsEl.innerHTML = `
            <li class="mitigation-step">
                <span class="mitigation-num">[01]</span>
                <span class="mitigation-detail"><strong>IMMEDIATE PASSWORD RESET</strong>: Cycle the passwords for all credentials associated with the email <code>${email}</code>. Avoid recycling hashes.</span>
            </li>
            <li class="mitigation-step">
                <span class="mitigation-num">[02]</span>
                <span class="mitigation-detail"><strong>ENFORCE MULTI-FACTOR AUTHENTICATION (MFA)</strong>: Add a mobile Authenticator (Google/Microsoft Auth) to keys. Avoid reliance on SMS OTP.</span>
            </li>
            <li class="mitigation-step">
                <span class="mitigation-num">[03]</span>
                <span class="mitigation-detail"><strong>TRANSITION TO PASSPHRASES</strong>: Standardize account access using high-entropy passphrases (4-5 randomized words) stored inside password vaults.</span>
            </li>
        `;
    }

    // Save check state
    if (typeof CyberState !== "undefined") {
        CyberState.scansDone.email++;
        if (typeof gainXP === "function" && CyberState.scansDone.email === 1) {
            gainXP(50, "First Data Breach search performed");
        } else {
            saveState();
        }
    }
}
