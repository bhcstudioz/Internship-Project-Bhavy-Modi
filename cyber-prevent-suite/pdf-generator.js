/* Cyber Ops Suite - Encrypted PDF Generator Module */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Listen for Auth State Changes to update dynamic notes
    if (window.firebaseActive) {
        firebase.auth().onAuthStateChanged(() => {
            updatePdfNotes();
        });
    } else {
        // Run once for local mode initialization
        setTimeout(updatePdfNotes, 500);
    }

    // 2. Bind click observers for PDF download buttons
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-download-pdf");
        if (btn) {
            e.preventDefault();
            const module = btn.getAttribute("data-module");
            if (module) {
                generateEncryptedPdf(module);
            }
        }
    });
});

/**
 * Update security decryption notes displayed under each PDF download button.
 */
function updatePdfNotes() {
    const notes = document.querySelectorAll(".pdf-decryption-note");
    let noteText = "";

    if (window.firebaseActive && firebase.auth().currentUser) {
        noteText = `🔒 SECURITY PROTOCOL: PDF reports are encrypted using industry-standard 128-bit RC4 algorithms. To decrypt and open, enter your registered email address.`;
    } else {
        noteText = `🔒 SECURITY PROTOCOL: PDF reports are encrypted using industry-standard 128-bit RC4 algorithms. To decrypt and open, enter your operator password.`;
    }

    notes.forEach(note => {
        note.innerHTML = noteText;
    });
}

/**
 * Master controller to generate, encrypt, and download PDF reports.
 * @param {string} module - The name of the module or 'master'
 */
function generateEncryptedPdf(module) {
    const { jsPDF } = window.jspdf;
    
    // 1. Determine encryption password
    let password = "LOCAL_OPERATOR";
    if (window.firebaseActive && firebase.auth().currentUser) {
        password = firebase.auth().currentUser.email;
    } else {
        password = sessionStorage.getItem("cyber_ops_operator_pass") || "LOCAL_OPERATOR";
    }

    // 2. Define theme colors
    const themes = {
        "dashboard": { hex: "#b900ff", rgb: [185, 0, 255] },
        "threat-sim": { hex: "#ff5500", rgb: [255, 85, 0] },
        "trust-breach": { hex: "#00ff66", rgb: [0, 255, 102] },
        "sms-shield": { hex: "#ffaa00", rgb: [255, 170, 0] },
        "password-checker": { hex: "#ff007f", rgb: [255, 0, 127] },
        "footprint-checker": { hex: "#00f0ff", rgb: [0, 240, 255] },
        "master": { hex: "#00f0ff", rgb: [0, 240, 255] }
    };

    const theme = themes[module] || themes["master"];

    // 3. Initialize Document with 128-bit encryption
    const doc = new jsPDF({
        orientation: "p",
        unit: "pt",
        format: "a4",
        encryption: {
            userPassword: password,
            ownerPassword: password,
            userPermissions: ["print", "copy"]
        }
    });

    // A4 dimensions: 595.28 x 841.89 points
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Helper: Render common page background & header frame
    const renderPageSkeleton = (pageNum, totalPages, pageTitle) => {
        // Draw deep midnight background (#0d1117)
        doc.setFillColor(13, 17, 23);
        doc.rect(0, 0, width, height, "F");

        // Faint matrix background grid lines
        doc.setDrawColor(20, 28, 44);
        doc.setLineWidth(0.5);
        for (let x = 40; x < width; x += 45) {
            doc.line(x, 0, x, height);
        }
        for (let y = 0; y < height; y += 45) {
            doc.line(0, y, width, y);
        }

        // Top Header Border Line (Accent-colored)
        doc.setDrawColor(theme.rgb[0], theme.rgb[1], theme.rgb[2]);
        doc.setLineWidth(1.5);
        doc.line(40, 75, width - 40, 75);

        // Header Text
        doc.setFont("courier", "bold");
        doc.setFontSize(14);
        doc.setTextColor(theme.rgb[0], theme.rgb[1], theme.rgb[2]);
        doc.text("CYBER_OPERATIONS // SECURITY_REPORT", 40, 50);

        doc.setFont("courier", "normal");
        doc.setFontSize(8);
        doc.setTextColor(110, 120, 140);
        
        const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";
        doc.text(`DATE_GENERATED: ${timestamp}`, 40, 68);

        const opName = (CyberState.username || "UNKNOWN_OPERATOR").toUpperCase();
        doc.text(`OPERATOR: ${opName}`, width - 200, 68);

        // Page title
        doc.setFont("courier", "bold");
        doc.setFontSize(10);
        doc.setTextColor(theme.rgb[0], theme.rgb[1], theme.rgb[2]);
        doc.text(`MODULE // ${pageTitle}`, 40, 95);

        // Footer Border & Text
        doc.setDrawColor(40, 50, 70);
        doc.setLineWidth(0.5);
        doc.line(40, height - 50, width - 40, height - 50);

        doc.setFont("courier", "normal");
        doc.setFontSize(8);
        doc.setTextColor(80, 90, 110);
        doc.text("CLASSIFICATION: RESTRICTED // CODENAME: CYBER_PREVENT_SUITE // SYSTEM_LOG_DEBRIEF", 40, height - 35);
        doc.text(`PAGE ${pageNum} OF ${totalPages}`, width - 100, height - 35);
    };

    // Helper: Draw terminal card layout container
    const drawTerminalPanel = (x, y, w, h, title, rgbColor) => {
        doc.setDrawColor(rgbColor[0], rgbColor[1], rgbColor[2]);
        doc.setLineWidth(1);
        doc.rect(x, y, w, h, "D");

        // Fills a small header label bar
        doc.setFillColor(rgbColor[0], rgbColor[1], rgbColor[2]);
        const titleWidth = doc.getTextWidth(title) + 16;
        doc.rect(x, y, titleWidth, 14, "F");

        doc.setFont("courier", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(13, 17, 23);
        doc.text(title, x + 8, y + 10);
    };

    // Helper: Print wrapped lines of text
    const printWrappedLines = (text, x, y, maxWidth, size = 9, color = [200, 210, 220], isBold = false) => {
        doc.setFont("courier", isBold ? "bold" : "normal");
        doc.setFontSize(size);
        doc.setTextColor(color[0], color[1], color[2]);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        let currY = y;
        lines.forEach(l => {
            doc.text(l, x, currY);
            currY += size + 3;
        });
        return currY;
    };

    // Helper: Render placeholder when scans/audits are incomplete
    const drawIncompletePlaceholder = (y, moduleName, colorRgb) => {
        doc.setDrawColor(220, 80, 80);
        doc.setFillColor(35, 20, 25);
        doc.rect(40, y, width - 80, 70, "FD");

        doc.setFont("courier", "bold");
        doc.setFontSize(10);
        doc.setTextColor(255, 100, 100);
        doc.text(`[!] SECURITY WARNING: ${moduleName.toUpperCase()}_AUDIT_NOT_RUN`, 55, y + 25);

        doc.setFont("courier", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(200, 180, 180);
        doc.text("No scanned telemetric parameters captured in memory for this subsystem.", 55, y + 42);
        doc.text("Launch this module and run audit probes to synchronize real-time statistics.", 55, y + 54);
    };

    // 5. Compile Contents per Module
    if (module === "dashboard") {
        renderPageSkeleton(1, 1, "DASHBOARD // OPERATIONS_OVERVIEW");
        
        // --- 1. Operations Clearance Card ---
        drawTerminalPanel(40, 115, 250, 90, "SEC_OPERATOR_CLEARANCE", theme.rgb);
        doc.setFont("courier", "bold");
        doc.setFontSize(10);
        doc.setTextColor(230, 240, 255);
        
        doc.text("CODENAME:", 55, 145);
        doc.setTextColor(theme.rgb[0], theme.rgb[1], theme.rgb[2]);
        doc.text((CyberState.username || "Operator").toUpperCase(), 130, 145);

        doc.setTextColor(230, 240, 255);
        doc.text("TOTAL XP:", 55, 165);
        doc.setTextColor(0, 240, 255);
        doc.text(`${CyberState.xp} XP`, 130, 165);

        doc.setTextColor(230, 240, 255);
        doc.text("RANK LEVEL:", 55, 185);
        doc.setTextColor(57, 255, 20); // neon green
        let rank = "NOVICE_OPERATOR";
        if (CyberState.xp > 800) rank = "CYBER_CHIEF";
        else if (CyberState.xp > 300) rank = "SPECIALIST";
        doc.text(rank, 130, 185);

        // --- 2. Defense Status Card ---
        drawTerminalPanel(305, 115, 250, 90, "DEFENSE_INTEGRITY_INDEX", theme.rgb);
        
        // Calculate dynamic Defense Index
        let simScore = 0;
        Object.values(CyberState.scenariosSolved).forEach(v => { if (v) simScore += 7; });
        let auditScore = 0;
        if (CyberState.scansDone.domain > 0) auditScore += 7.5;
        if (CyberState.scansDone.password > 0) auditScore += 7.5;
        if (CyberState.scansDone.smsShield > 0) auditScore += 7.5;
        if (CyberState.scansDone.footprint > 0) auditScore += 7.5;
        const defenseIndex = Math.min(100, Math.round(simScore + auditScore));

        doc.setFont("courier", "bold");
        doc.setFontSize(30);
        let indexColor = [220, 50, 50]; // Red
        if (defenseIndex >= 70) indexColor = [50, 220, 100]; // Green
        else if (defenseIndex >= 40) indexColor = [255, 150, 0]; // Orange

        doc.setTextColor(indexColor[0], indexColor[1], indexColor[2]);
        doc.text(`${defenseIndex}%`, 330, 165);

        doc.setFont("courier", "bold");
        doc.setFontSize(9);
        doc.setTextColor(200, 210, 220);
        doc.text("STATUS STATUS:", 330, 185);
        
        let statusStr = "VULNERABLE";
        if (defenseIndex === 100) statusStr = "MAXIMUM_SECURITY";
        else if (defenseIndex >= 70) statusStr = "STABLE // PROTECTED";
        else if (defenseIndex >= 40) statusStr = "ELEVATED_RISK";
        doc.setTextColor(indexColor[0], indexColor[1], indexColor[2]);
        doc.text(statusStr, 420, 185);

        // --- 3. Scenario Matrix Audit Checklist ---
        drawTerminalPanel(40, 225, 515, 205, "THREAT_SIMULATOR_SCENARIO_LOGS", [255, 85, 0]);
        let solveCount = 0;
        
        doc.setFont("courier", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(150, 160, 180);
        doc.text("SCENARIO NODE", 55, 252);
        doc.text("STATUS", 370, 252);
        doc.text("AWARD", 480, 252);
        doc.line(55, 258, 540, 258);

        const scenariosList = [
            "Corporate Phishing Email", "SMS Double-Hook Phishing", "Fake Banking Portal",
            "MFA Session Interceptor", "Ransomware Invoice Spoof", "Wireless Honey-Relay",
            "OAuth Token Exploit", "Malicious USB Drop", "Waterhole Drive-By", "Customer Support Spoof"
        ];

        let sy = 271;
        for (let i = 1; i <= 10; i++) {
            const isSolved = CyberState.scenariosSolved[i];
            if (isSolved) solveCount++;

            doc.setFont("courier", "normal");
            doc.setFontSize(8);
            doc.setTextColor(220, 230, 240);
            doc.text(`NODE_${i.toString().padStart(2, '0')} // ${scenariosList[i-1].substring(0, 28)}`, 55, sy);
            
            if (isSolved) {
                doc.setTextColor(0, 255, 102);
                doc.setFont("courier", "bold");
                doc.text("DEFUSED", 370, sy);
                doc.setTextColor(255, 170, 0);
                doc.text("+100 XP", 480, sy);
            } else {
                doc.setTextColor(255, 68, 68);
                doc.text("ACTIVE_ALERT", 370, sy);
                doc.setTextColor(110, 120, 140);
                doc.text("000 XP", 480, sy);
            }
            sy += 16;
        }

        // --- 4. Subsystem Audits Clearance Card ---
        drawTerminalPanel(40, 450, 515, 100, "SUBSYSTEM_AUDIT_CLEARANCE", [0, 240, 255]);
        
        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        const audits = [
            { label: "Website Trust Scan (domain)", status: CyberState.scansDone.domain > 0 ? "SECURED" : "PENDING", val: CyberState.scansDone.domain, color: CyberState.scansDone.domain > 0 ? [0, 255, 102] : [255, 80, 80] },
            { label: "Credential Strength (password)", status: CyberState.scansDone.password > 0 ? "SECURED" : "PENDING", val: CyberState.scansDone.password, color: CyberState.scansDone.password > 0 ? [0, 255, 102] : [255, 80, 80] },
            { label: "SMS Bomb Rate-Limiter (shield)", status: CyberState.scansDone.smsShield > 0 ? "SECURED" : "PENDING", val: CyberState.scansDone.smsShield, color: CyberState.scansDone.smsShield > 0 ? [0, 255, 102] : [255, 80, 80] },
            { label: "Digital Footprint OSINT (footprint)", status: CyberState.scansDone.footprint > 0 ? "SECURED" : "PENDING", val: CyberState.scansDone.footprint, color: CyberState.scansDone.footprint > 0 ? [0, 255, 102] : [255, 80, 80] }
        ];

        let ay = 478;
        audits.forEach(a => {
            doc.setTextColor(200, 210, 220);
            doc.text(`• ${a.label}`, 55, ay);
            doc.setTextColor(a.color[0], a.color[1], a.color[2]);
            doc.setFont("courier", "bold");
            doc.text(`${a.status} (SCANS: ${a.val})`, 410, ay);
            doc.setFont("courier", "normal");
            ay += 18;
        });

        // --- 5. Console History Logs Card ---
        drawTerminalPanel(40, 570, 515, 190, "RECENT_CONSOLE_AUDIT_LOG_STREAM", [185, 0, 255]);
        const alertElements = document.querySelectorAll("#dash-alerts-container .alert-item");
        let ly = 598;
        doc.setFont("courier", "normal");
        doc.setFontSize(8);

        if (alertElements && alertElements.length > 0) {
            const maxLogs = Math.min(10, alertElements.length);
            for (let k = 0; k < maxLogs; k++) {
                const item = alertElements[k];
                const msg = item.querySelector(".alert-msg") ? item.querySelector(".alert-msg").textContent : item.textContent;
                const time = item.querySelector(".alert-time") ? item.querySelector(".alert-time").textContent : "";
                
                doc.setTextColor(140, 150, 170);
                doc.text(`[${time}] `, 55, ly);
                
                doc.setTextColor(220, 225, 235);
                const truncatedMsg = msg.length > 80 ? msg.substring(0, 77) + "..." : msg;
                doc.text(truncatedMsg, 115, ly);
                ly += 17;
            }
        } else {
            doc.setTextColor(110, 120, 140);
            doc.text("• No logs recorded in current session buffer.", 55, ly);
        }

    } else if (module === "threat-sim") {
        renderPageSkeleton(1, 1, "THREAT_SIMULATION_LOGS");
        
        // Overview Summary Box
        drawTerminalPanel(40, 115, 515, 50, "SIMULATION_SUMMARY", theme.rgb);
        doc.setFont("courier", "bold");
        doc.setFontSize(10);
        doc.setTextColor(230, 240, 255);
        let solved = 0;
        Object.values(CyberState.scenariosSolved).forEach(v => { if(v) solved++; });
        
        doc.text(`TOTAL SCENARIOS COMPLETED: ${solved} / 10`, 55, 137);
        doc.setFont("courier", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(160, 170, 180);
        doc.text(`Defusing scenarios measures target identification capability and reduces social engineering exposure.`, 55, 150);

        // List details
        const list = window.SCENARIOS || {};
        let py = 185;
        
        const scenNames = [
            "Corporate Phishing Email", "SMS Double-Hook Phishing", "Fake Banking Portal",
            "MFA Session Interceptor", "Ransomware Invoice Spoof", "Wireless Honey-Relay",
            "OAuth Token Exploit", "Malicious USB Drop", "Waterhole Drive-By", "Customer Support Spoof"
        ];

        for (let i = 1; i <= 10; i++) {
            const isSolved = CyberState.scenariosSolved[i];

            drawTerminalPanel(40, py, 515, 52, `NODE_${i.toString().padStart(2, '0')} // ${scenNames[i-1].toUpperCase()}`, isSolved ? [0, 255, 102] : [255, 85, 0]);
            
            doc.setFont("courier", "normal");
            doc.setFontSize(8);
            doc.setTextColor(220, 230, 240);
            
            doc.text("STATUS: ", 55, py + 23);
            if (isSolved) {
                doc.setTextColor(0, 255, 102);
                doc.setFont("courier", "bold");
                doc.text("RESOLVED & DEFUSED", 110, py + 23);
            } else {
                doc.setTextColor(255, 85, 85);
                doc.setFont("courier", "bold");
                doc.text("ACTIVE VULNERABILITY ALERT", 110, py + 23);
            }

            doc.setFont("courier", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(140, 150, 160);
            
            const explanationText = list[i] ? list[i].explanation.replace(/<\/?[^>]+(>|$)/g, "") : "Simulates attack tactics used by advanced persistent threats. Review anomalies to resolve.";
            const truncatedExpl = explanationText.substring(0, 135) + "...";
            doc.text(truncatedExpl, 55, py + 38);

            py += 59;
        }

    } else if (module === "trust-breach") {
        renderPageSkeleton(1, 1, "TRUST_AND_BREACH_AUDIT_LOGS");

        const data = window.LatestTrustBreachData || {};

        // SECTION A: Domain Audit Details
        drawTerminalPanel(40, 115, 515, 235, "DOMAIN_SECURITY_AUDIT_REPORT", theme.rgb);
        
        if (data.domain) {
            const d = data.domain;
            doc.setFont("courier", "bold");
            doc.setFontSize(11);
            doc.setTextColor(255, 255, 255);
            doc.text(`TARGET DOMAIN SCAN: ${d.domain.toUpperCase()}`, 55, 145);

            doc.setFont("courier", "bold");
            doc.setFontSize(10);
            doc.text("INTEGRITY SCORE: ", 55, 165);
            let scoreColor = [220, 50, 50];
            if (d.score >= 70) scoreColor = [0, 255, 102];
            else if (d.score >= 40) scoreColor = [255, 150, 0];
            doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
            doc.text(`${d.score} / 100`, 180, 165);

            doc.setTextColor(200, 210, 220);
            doc.setFont("courier", "normal");
            doc.setFontSize(9);
            doc.text(`Registry Age: ${d.age === 0 ? "Under 1 year (High Risk)" : `${d.age} Years`}`, 55, 185);
            
            // Indicators
            doc.setFont("courier", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(150, 160, 180);
            doc.text("INFRASTRUCTURE NODE TEST", 55, 215);
            doc.text("STATUS", 350, 215);
            doc.text("RATING", 480, 215);
            doc.line(55, 221, 540, 221);

            doc.setFont("courier", "normal");
            doc.setFontSize(8);
            const ind = [
                { name: "SSL Certificate (HTTPS Encryption)", ok: d.https, desc: d.https ? "ACTIVE" : "MISSING", r: "SECURE" },
                { name: "Content-Security-Policy (CSP Headers)", ok: d.csp, desc: d.csp ? "ACTIVE" : "MISSING", r: "STRICT" },
                { name: "HTTP Strict-Transport-Security (HSTS)", ok: d.hsts, desc: d.hsts ? "ACTIVE" : "MISSING", r: "STRICT" },
                { name: "X-Frame-Options (Clickjack Shield)", ok: d.xframe, desc: d.xframe ? "ACTIVE" : "MISSING", r: "STRICT" },
                { name: "DNSSEC Zone Authentication Signatures", ok: d.dnssec, desc: d.dnssec ? "ACTIVE" : "MISSING", r: "STRICT" }
            ];

            let iy = 236;
            ind.forEach(i => {
                doc.setTextColor(220, 230, 240);
                doc.text(i.name, 55, iy);
                
                if (i.ok) {
                    doc.setTextColor(0, 255, 102);
                    doc.text(i.desc, 350, iy);
                    doc.text(i.r, 480, iy);
                } else {
                    doc.setTextColor(255, 85, 85);
                    doc.text(i.desc, 350, iy);
                    doc.text("VULNERABLE", 480, iy);
                }
                iy += 19;
            });

        } else {
            drawIncompletePlaceholder(130, "domain_trust_probe", theme.rgb);
        }

        // SECTION B: Email Data Breach History
        drawTerminalPanel(40, 375, 515, 385, "EMAIL_LEAK_EXPOSURE_INTELLIGENCE", theme.rgb);

        if (data.emailBreaches) {
            const eb = data.emailBreaches;
            doc.setFont("courier", "bold");
            doc.setFontSize(10.5);
            doc.setTextColor(255, 255, 255);
            doc.text(`TARGET EMAIL AUDIT: ${eb.email.toUpperCase()}`, 55, 405);

            doc.setFont("courier", "bold");
            doc.setFontSize(9.5);
            doc.text(`EXPOSURE COUNT: `, 55, 425);
            if (eb.leaks.length > 0) {
                doc.setTextColor(255, 85, 85);
                doc.text(`${eb.leaks.length} EXPOSURE(S) MATCHED`, 180, 425);
            } else {
                doc.setTextColor(0, 255, 102);
                doc.text("0 EXPOSURES (CLEAN DATABASE STATE)", 180, 425);
            }

            doc.setFont("courier", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(150, 160, 170);
            doc.text("Exposures indicate that password details or private hashes were leaked by third parties.", 55, 442);

            let ly = 465;
            if (eb.leaks.length > 0) {
                eb.leaks.forEach(l => {
                    if (ly > height - 100) return;
                    
                    doc.setDrawColor(255, 85, 85);
                    doc.setFillColor(25, 15, 17);
                    doc.rect(55, ly, 485, 52, "FD");

                    doc.setFont("courier", "bold");
                    doc.setFontSize(8.5);
                    doc.setTextColor(255, 100, 100);
                    doc.text(`${l.name.toUpperCase()} (${l.year})`, 65, ly + 15);

                    doc.setFont("courier", "bold");
                    doc.setFontSize(7.5);
                    doc.setTextColor(255, 170, 0);
                    doc.text(`LEAKED_FIELDS: ${l.dataTypes}`, 65, ly + 28);

                    doc.setFont("courier", "normal");
                    doc.setFontSize(7.5);
                    doc.setTextColor(170, 180, 190);
                    doc.text(l.details.substring(0, 105) + "...", 65, ly + 41);

                    ly += 60;
                });
            } else {
                doc.setDrawColor(0, 255, 102);
                doc.setFillColor(15, 25, 17);
                doc.rect(55, ly, 485, 50, "FD");

                doc.setFont("courier", "bold");
                doc.setFontSize(9);
                doc.setTextColor(0, 255, 102);
                doc.text("[SAFE] NO LEAKS ASSOCIATED WITH THIS IDENTITY", 70, ly + 20);

                doc.setFont("courier", "normal");
                doc.setFontSize(8);
                doc.setTextColor(170, 190, 170);
                doc.text("Maintain security hygiene and configure multi-factor authentication (2FA).", 70, ly + 35);
            }

        } else {
            drawIncompletePlaceholder(390, "identity_leak_check", theme.rgb);
        }

    } else if (module === "sms-shield") {
        renderPageSkeleton(1, 1, "SMS_FIREWALL_TELEMETRY_LOGS");

        const sim = window.smsSimState || { shieldActive: false, attackCount: 0, blockedCount: 0, allowedCount: 0 };

        // Card 1: Shield Configuration
        drawTerminalPanel(40, 115, 515, 120, "RATE_LIMITER_FIREWALL_STATUS", theme.rgb);
        doc.setFont("courier", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(255, 255, 255);
        
        doc.text("FIREWALL PROTECT LAYER:", 55, 145);
        if (sim.shieldActive) {
            doc.setTextColor(0, 255, 102);
            doc.text("ON // SHIELD_ACTIVE", 240, 145);
        } else {
            doc.setTextColor(255, 85, 85);
            doc.text("OFF // PERIMETER_BYPASSED", 240, 145);
        }

        doc.setTextColor(220, 230, 240);
        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        doc.text("Max OTP Submits Allowed: 1 Request / 30 seconds", 55, 170);
        doc.text("Rate Limit Cooldown Window: 60 Seconds", 55, 185);
        doc.text("Gateway Action on Burst Trigger: DROP_CONNECTIONS (Error 429)", 55, 200);
        doc.text("Target Firewall Node Ref: local_ip_rate_limiter", 55, 215);

        // Card 2: Simulation statistics
        drawTerminalPanel(40, 255, 515, 160, "SIMULATION_ATTACK_TELEMETRY", theme.rgb);
        doc.setFont("courier", "bold");
        doc.setFontSize(10);
        doc.setTextColor(230, 240, 255);
        doc.text("FIREWALL PACKET TRAFFIC METRICS", 55, 285);

        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        doc.text("Total OTP Blast Requests Processed: ", 55, 310);
        doc.setFont("courier", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text(sim.attackCount.toString(), 380, 310);

        doc.setFont("courier", "normal");
        doc.setTextColor(200, 210, 220);
        doc.text("Allowed Packet Inlets (Traffic Passed): ", 55, 330);
        doc.setFont("courier", "bold");
        doc.setTextColor(255, 85, 85);
        doc.text(sim.allowedCount.toString(), 380, 330);

        doc.setFont("courier", "normal");
        doc.setTextColor(200, 210, 220);
        doc.text("Dropped/Blocked Packets (Shield Protected): ", 55, 350);
        doc.setFont("courier", "bold");
        doc.setTextColor(0, 255, 102);
        doc.text(sim.blockedCount.toString(), 380, 350);

        doc.setFont("courier", "normal");
        doc.setTextColor(200, 210, 220);
        doc.text("Limiter Efficiency Rating (Block Percentage): ", 55, 370);
        doc.setFont("courier", "bold");
        const total = sim.attackCount || 1;
        const blockPct = Math.round((sim.blockedCount / total) * 100);
        let effColor = [220, 85, 85];
        if (sim.shieldActive) effColor = [0, 255, 102];
        else if (blockPct > 0) effColor = [255, 150, 0];
        doc.setTextColor(effColor[0], effColor[1], effColor[2]);
        doc.text(`${sim.shieldActive ? "100" : blockPct}% PROTECTED`, 380, 370);

        // Card 3: Firewall Rules
        drawTerminalPanel(40, 435, 515, 120, "FIREWALL_POLICY_RECOMMENDATIONS", theme.rgb);
        doc.setFont("courier", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(220, 230, 240);
        
        doc.text("1. Deploy server-side IP/Device Fingerprinting filters on all OTP submission hooks.", 55, 465);
        doc.text("2. Run aggressive rate-limits (e.g. max 3 requests per 10 mins per mobile number).", 55, 485);
        doc.text("3. Integrate recaptcha/CAPTCHA checks on registration loops if OTP flood is detected.", 55, 505);
        doc.text("4. Implement Web Application Firewall (WAF) rule sets to block known server-host blast relays.", 55, 525);

    } else if (module === "password-checker") {
        renderPageSkeleton(1, 1, "CREDENTIAL_ENTROPY_AUDIT");

        const data = window.LatestPasswordData;

        drawTerminalPanel(40, 115, 515, 230, "CREDENTIAL_STRENGTH_EVALUATION", theme.rgb);
        
        if (data) {
            doc.setFont("courier", "bold");
            doc.setFontSize(10.5);
            doc.setTextColor(255, 255, 255);
            doc.text("ANALYZED PASSKEY: ", 55, 145);
            doc.setTextColor(theme.rgb[0], theme.rgb[1], theme.rgb[2]);
            
            // Mask the password for privacy
            const origLen = data.length;
            const masked = origLen > 2 ? "p" + "•".repeat(origLen - 2) + "d" : "••";
            doc.text(`${masked} (${origLen} Characters)`, 180, 145);

            doc.setTextColor(255, 255, 255);
            doc.text("ENTROPY RATING:", 55, 165);
            let color = [255, 85, 85];
            if (data.score > 70) color = [0, 255, 102];
            else if (data.score > 35) color = [255, 150, 0];
            doc.setTextColor(color[0], color[1], color[2]);
            doc.text(`${data.score}% - ${data.label}`, 180, 165);

            // Print details
            doc.setFont("courier", "normal");
            doc.setFontSize(9);
            doc.setTextColor(200, 210, 220);
            
            doc.text(`Length Count: ${data.length} characters ${data.length >= 12 ? '(Secure)' : '(Short)'}`, 55, 195);
            doc.text(`Casing Variety (Upper & Lower Case): ${data.hasUpper && data.hasLower ? 'YES (Valid)' : 'NO (Missing)'}`, 55, 215);
            doc.text(`Numeric Variety (Digits present): ${data.hasDigit ? 'YES (Valid)' : 'NO (Missing)'}`, 55, 235);
            doc.text(`Symbol Variety (Special chars present): ${data.hasSpecial ? 'YES (Valid)' : 'NO (Missing)'}`, 55, 255);
            doc.text(`Common Password Index Check: ${data.isCommon ? 'CRITICAL MATCH! (Extremely Vulnerable)' : 'Passed (Not in dictionary)'}`, 55, 275);
            
            if (data.isCommon) {
                doc.setDrawColor(255, 85, 85);
                doc.setFillColor(30, 15, 17);
                doc.rect(55, 290, 485, 42, "FD");
                doc.setFont("courier", "bold");
                doc.setFontSize(8);
                doc.setTextColor(255, 100, 100);
                doc.text("DICTIONARY ATTACK WARNING: This password is in public lists of common credentials.", 65, 307);
                doc.text("Brute-force scripts will crack this profile instantly. Reset immediately.", 65, 321);
            }

        } else {
            drawIncompletePlaceholder(130, "credential_entropy", theme.rgb);
        }

        // Section B: Upgrade transforms
        drawTerminalPanel(40, 365, 515, 220, "CRYPTOGRAPHIC_UPGRADE_RECOMMENDATIONS", theme.rgb);
        if (data) {
            doc.setFont("courier", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(255, 255, 255);
            doc.text("RECOMMENDED CYBER-PROOF PASSKEY:", 55, 395);
            doc.setTextColor(0, 255, 102);
            doc.setFontSize(10.5);
            doc.text(data.upgradedPass, 55, 415);

            doc.setFont("courier", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(150, 160, 180);
            doc.text("APPLIED ALGORITHMIC TRANSLATION RULES:", 55, 445);

            let ry = 465;
            doc.setFont("courier", "normal");
            doc.setFontSize(8);
            doc.setTextColor(200, 210, 220);
            data.upgradedRules.forEach(rule => {
                doc.text(`• ${rule}`, 55, ry);
                ry += 18;
            });
        } else {
            drawIncompletePlaceholder(380, "upgraded_credential_policies", theme.rgb);
        }

    } else if (module === "footprint-checker") {
        renderPageSkeleton(1, 1, "DIGITAL_FOOTPRINT_AND_OSINT");

        const data = window.LatestFootprintData || {};

        // SECTION A: Username scan
        drawTerminalPanel(40, 115, 515, 150, "USERNAME_EXPOSURE_INDEX", theme.rgb);
        if (data.usernameScan) {
            const u = data.usernameScan;
            doc.setFont("courier", "bold");
            doc.setFontSize(10);
            doc.setTextColor(255, 255, 255);
            doc.text(`AUDITED USERNAME: "${u.username.toUpperCase()}"`, 55, 145);

            doc.text("PLATFORM ACCOUNT REGISTRY PROBES:", 55, 165);
            
            let ex = 55;
            let ey = 182;
            doc.setFont("courier", "normal");
            doc.setFontSize(7.5);
            u.platforms.forEach((p, idx) => {
                if (idx > 0 && idx % 4 === 0) {
                    ex = 55;
                    ey += 12;
                }
                
                doc.setTextColor(200, 210, 220);
                doc.text(`${p.name.substring(0, 10)}:`, ex, ey);
                if (p.exposed) {
                    doc.setTextColor(255, 85, 85);
                    doc.setFont("courier", "bold");
                    doc.text("ACTIVE", ex + 52, ey);
                } else {
                    doc.setTextColor(110, 120, 140);
                    doc.setFont("courier", "normal");
                    doc.text("INACTIVE", ex + 52, ey);
                }
                doc.setFont("courier", "normal");
                ex += 122;
            });

            doc.setFont("courier", "bold");
            doc.setFontSize(8);
            doc.setTextColor(140, 150, 160);
            doc.text(`Total exposed profiles matched: ${u.exposedCount} platforms.`, 55, 255);

        } else {
            drawIncompletePlaceholder(130, "username_probe", theme.rgb);
        }

        // SECTION B: EXIF Analyzer
        drawTerminalPanel(40, 280, 515, 180, "IMAGE_EXIF_METADATA_PRIVACY_AUDIT", theme.rgb);
        if (data.exif) {
            const e = data.exif;
            doc.setFont("courier", "bold");
            doc.setFontSize(10);
            doc.setTextColor(255, 255, 255);
            doc.text("METADATA PROBE STATUS: ", 55, 310);
            
            if (e.hasExif) {
                doc.setTextColor(255, 85, 85);
                doc.text("PRIVACY_WARN // GEOLOCATION LEAKED", 200, 310);

                doc.setFont("courier", "normal");
                doc.setFontSize(9);
                doc.setTextColor(200, 210, 220);
                doc.text(`Capture Hardware Device: ${e.device}`, 55, 335);
                doc.text(`Creation/Export Date:   ${e.time}`, 55, 355);
                doc.text(`Active Software Build:  ${e.software}`, 55, 375);
                
                doc.setFont("courier", "bold");
                doc.text(`GEOLOCATION COORDINATES: `, 55, 395);
                doc.setTextColor(255, 170, 0);
                doc.text(e.gps || "NO GPS INFO FOUND", 200, 395);
                
                doc.setDrawColor(255, 85, 85);
                doc.setFillColor(30, 15, 17);
                doc.rect(55, 410, 485, 35, "FD");
                doc.setFont("courier", "bold");
                doc.setFontSize(7.5);
                doc.setTextColor(255, 100, 100);
                doc.text("EXIF WARNING: Image files uploaded to social apps expose exact GPS telemetry.", 65, 423);
                doc.text("Attackers can use these coordinates to track physical coordinate parameters.", 65, 435);

            } else {
                doc.setTextColor(0, 255, 102);
                doc.text("SAFE // NO EXIF METADATA FOUND", 200, 310);
                doc.setFont("courier", "normal");
                doc.setFontSize(9);
                doc.setTextColor(200, 210, 220);
                doc.text("The uploaded test file has header segments stripped of camera metadata profiles.", 55, 335);
                doc.text("No camera serials, timestamps, or GPS location tags leaked.", 55, 350);
            }

        } else {
            drawIncompletePlaceholder(295, "exif_metadata", theme.rgb);
        }

        // SECTION C: Google Dorks
        drawTerminalPanel(40, 475, 515, 285, "OSINT_GOOGLE_DORKING_QUERIES", theme.rgb);
        if (data.dorking) {
            const dk = data.dorking;
            doc.setFont("courier", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(170, 180, 190);
            doc.text(`Probing identities on target parameters: Name = ${dk.name}, Domain = ${dk.domain}`, 55, 505);

            let dy = 525;
            dk.dorks.forEach(d => {
                if (dy > height - 100) return;
                
                doc.setFont("courier", "bold");
                doc.setFontSize(8.5);
                doc.setTextColor(0, 240, 255);
                doc.text(`• ${d.title}:`, 55, dy);

                doc.setFont("courier", "normal");
                doc.setFontSize(7.5);
                doc.setTextColor(255, 170, 0);
                doc.text(`  Dork Query: ${d.query}`, 55, dy + 12);

                doc.setTextColor(140, 150, 160);
                doc.text(`  Objective:  ${d.desc}`, 55, dy + 22);

                dy += 34;
            });

        } else {
            drawIncompletePlaceholder(490, "google_dork_generation", theme.rgb);
        }

    } else if (module === "master") {
        // ==========================================
        // MULTI-PAGE COMPREHENSIVE REPORT GENERATION
        // ==========================================

        const totalPages = 4;

        // ---------- PAGE 1: EXECUTIVE SUMMARY ----------
        renderPageSkeleton(1, totalPages, "MASTER_SECURITY_POSTURE_DEBRIEF");

        // Operator Rank Clearance Panel
        drawTerminalPanel(40, 120, 250, 95, "SEC_OPERATOR_CLEARANCE", theme.rgb);
        doc.setFont("courier", "bold");
        doc.setFontSize(10);
        doc.setTextColor(230, 240, 255);
        
        doc.text("CODENAME:", 55, 150);
        doc.setTextColor(theme.rgb[0], theme.rgb[1], theme.rgb[2]);
        doc.text((CyberState.username || "Operator").toUpperCase(), 130, 150);

        doc.setTextColor(230, 240, 255);
        doc.text("TOTAL XP:", 55, 170);
        doc.setTextColor(0, 240, 255);
        doc.text(`${CyberState.xp} XP`, 130, 170);

        doc.setTextColor(230, 240, 255);
        doc.text("RANK LEVEL:", 55, 190);
        doc.setTextColor(57, 255, 20); 
        let rank = "NOVICE_OPERATOR";
        if (CyberState.xp > 800) rank = "CYBER_CHIEF";
        else if (CyberState.xp > 300) rank = "SPECIALIST";
        doc.text(rank, 130, 190);

        // Security Shield Gauge Panel
        drawTerminalPanel(305, 120, 250, 95, "DEFENSE_SECURITY_INDEX", theme.rgb);
        
        let simScore = 0;
        Object.values(CyberState.scenariosSolved).forEach(v => { if (v) simScore += 7; });
        let auditScore = 0;
        if (CyberState.scansDone.domain > 0) auditScore += 7.5;
        if (CyberState.scansDone.password > 0) auditScore += 7.5;
        if (CyberState.scansDone.smsShield > 0) auditScore += 7.5;
        if (CyberState.scansDone.footprint > 0) auditScore += 7.5;
        const defenseIndex = Math.min(100, Math.round(simScore + auditScore));

        doc.setFont("courier", "bold");
        doc.setFontSize(30);
        let indexColor = [220, 50, 50]; 
        if (defenseIndex >= 70) indexColor = [50, 220, 100]; 
        else if (defenseIndex >= 40) indexColor = [255, 150, 0]; 

        doc.setTextColor(indexColor[0], indexColor[1], indexColor[2]);
        doc.text(`${defenseIndex}%`, 330, 170);

        doc.setFont("courier", "bold");
        doc.setFontSize(9);
        doc.setTextColor(200, 210, 220);
        doc.text("SHIELD INDEX:", 330, 190);
        
        let statusStr = "VULNERABLE";
        if (defenseIndex === 100) statusStr = "MAXIMUM_SECURITY";
        else if (defenseIndex >= 70) statusStr = "STABLE // PROTECTED";
        else if (defenseIndex >= 40) statusStr = "ELEVATED_RISK";
        doc.setTextColor(indexColor[0], indexColor[1], indexColor[2]);
        doc.text(statusStr, 420, 190);

        // Audited Modules list
        drawTerminalPanel(40, 235, 515, 120, "AUDITED_COMPONENT_STATUS", [0, 240, 255]);
        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        const mods = [
            { label: "Website Trust Scan (domain)", status: CyberState.scansDone.domain > 0 ? "SECURED" : "PENDING", val: CyberState.scansDone.domain, color: CyberState.scansDone.domain > 0 ? [0, 255, 102] : [255, 80, 80] },
            { label: "Credential Strength (password)", status: CyberState.scansDone.password > 0 ? "SECURED" : "PENDING", val: CyberState.scansDone.password, color: CyberState.scansDone.password > 0 ? [0, 255, 102] : [255, 80, 80] },
            { label: "SMS Bomb Rate-Limiter (shield)", status: CyberState.scansDone.smsShield > 0 ? "SECURED" : "PENDING", val: CyberState.scansDone.smsShield, color: CyberState.scansDone.smsShield > 0 ? [0, 255, 102] : [255, 80, 80] },
            { label: "Digital Footprint OSINT (footprint)", status: CyberState.scansDone.footprint > 0 ? "SECURED" : "PENDING", val: CyberState.scansDone.footprint, color: CyberState.scansDone.footprint > 0 ? [0, 255, 102] : [255, 80, 80] }
        ];

        let my = 265;
        mods.forEach(m => {
            doc.setTextColor(200, 210, 220);
            doc.text(`• ${m.label}`, 55, my);
            doc.setTextColor(m.color[0], m.color[1], m.color[2]);
            doc.setFont("courier", "bold");
            doc.text(`${m.status} (SCANS: ${m.val})`, 410, my);
            doc.setFont("courier", "normal");
            my += 20;
        });

        // Console alerts list
        drawTerminalPanel(40, 375, 515, 385, "SYSTEM_CONSOLE_ALERT_STREAM", [185, 0, 255]);
        const alertEls = document.querySelectorAll("#dash-alerts-container .alert-item");
        let aly = 405;
        doc.setFont("courier", "normal");
        doc.setFontSize(8.5);

        if (alertEls && alertEls.length > 0) {
            const maxL = Math.min(20, alertEls.length);
            for (let k = 0; k < maxL; k++) {
                const item = alertEls[k];
                const msg = item.querySelector(".alert-msg") ? item.querySelector(".alert-msg").textContent : item.textContent;
                const time = item.querySelector(".alert-time") ? item.querySelector(".alert-time").textContent : "";
                
                doc.setTextColor(140, 150, 170);
                doc.text(`[${time}] `, 55, aly);
                
                doc.setTextColor(220, 225, 235);
                const truncatedM = msg.length > 80 ? msg.substring(0, 77) + "..." : msg;
                doc.text(truncatedM, 115, aly);
                aly += 18;
            }
        } else {
            doc.setTextColor(110, 120, 140);
            doc.text("• No logs recorded in current session buffer.", 55, aly);
        }

        // ---------- PAGE 2: THREAT SIMULATOR COMPREHENSIVE ----------
        doc.addPage();
        renderPageSkeleton(2, totalPages, "THREAT_SIMULATION_LOGS");

        drawTerminalPanel(40, 115, 515, 640, "THREAT_DEBRIEF_SANDBOX_MATRIX", [255, 85, 0]);
        let sl = 0;
        Object.values(CyberState.scenariosSolved).forEach(v => { if(v) sl++; });
        
        doc.setFont("courier", "bold");
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text(`NODE SIMULATIONS CLEARED: ${sl} / 10`, 55, 145);
        doc.line(55, 153, 540, 153);

        const list2 = window.SCENARIOS || {};
        let sy2 = 175;
        const scenNames2 = [
            "Corporate Phishing Email", "SMS Double-Hook Phishing", "Fake Banking Portal",
            "MFA Session Interceptor", "Ransomware Invoice Spoof", "Wireless Honey-Relay",
            "OAuth Token Exploit", "Malicious USB Drop", "Waterhole Drive-By", "Customer Support Spoof"
        ];

        for (let i = 1; i <= 10; i++) {
            const isSolved = CyberState.scenariosSolved[i];
            
            doc.setFont("courier", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(230, 240, 255);
            doc.text(`[NODE_${i.toString().padStart(2, '0')}] ${scenNames2[i-1].toUpperCase()}`, 55, sy2);
            
            if (isSolved) {
                doc.setTextColor(0, 255, 102);
                doc.text("DEFUSED", 480, sy2);
            } else {
                doc.setTextColor(255, 85, 85);
                doc.text("VULNERABLE", 460, sy2);
            }

            doc.setFont("courier", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(140, 150, 160);
            const explanation = list2[i] ? list2[i].explanation.replace(/<\/?[^>]+(>|$)/g, "") : "Simulates attack tactics used by advanced threat groups. Audit parameters to resolve.";
            const truncatedExp = explanation.substring(0, 130) + "...";
            doc.text(truncatedExp, 55, sy2 + 13);
            
            doc.setDrawColor(30, 38, 54);
            doc.line(55, sy2 + 22, 540, sy2 + 22);

            sy2 += 29;
        }

        // ---------- PAGE 3: WEBSITE SCAN & EMAIL BREACHES & PASSWORDS ----------
        doc.addPage();
        renderPageSkeleton(3, totalPages, "INFRASTRUCTURE_&_CREDENTIALS_REPORT");

        // Trust Breach Block
        const tb = window.LatestTrustBreachData || {};
        drawTerminalPanel(40, 115, 515, 230, "DOMAIN_TRUST_&_INFRASTRUCTURE_AUDIT", [0, 255, 102]);
        if (tb.domain) {
            const d = tb.domain;
            doc.setFont("courier", "bold");
            doc.setFontSize(9.5);
            doc.setTextColor(255, 255, 255);
            doc.text(`TARGET DOMAIN: ${d.domain.toUpperCase()}`, 55, 140);
            doc.text(`TRUST SCORE:   ${d.score} / 100`, 55, 155);

            doc.setFont("courier", "normal");
            doc.setFontSize(8);
            doc.setTextColor(200, 210, 220);
            doc.text(`• SSL/HTTPS Encryption Status:   ${d.https ? 'ENABLED // SECURE' : 'MISSING // UNSECURE'}`, 55, 175);
            doc.text(`• Content-Security-Policy (CSP):  ${d.csp ? 'CONFIGURED // ACTIVE' : 'MISSING // HIGH RISK'}`, 55, 190);
            doc.text(`• Strict Transport Security (HSTS): ${d.hsts ? 'CONFIGURED // ACTIVE' : 'MISSING // DEGRADED'}`, 55, 205);
            doc.text(`• X-Frame-Options (Clickjack):     ${d.xframe ? 'CONFIGURED // ACTIVE' : 'MISSING // RISK'}`, 55, 220);
            doc.text(`• DNSSEC Domain Signatures:       ${d.dnssec ? 'CONFIGURED // SECURE' : 'MISSING // BYPASSED'}`, 55, 235);
        } else {
            drawIncompletePlaceholder(130, "domain_infrastructure_scan", [0, 255, 102]);
        }

        // Identity leaks
        if (tb.emailBreaches) {
            const eb = tb.emailBreaches;
            doc.setFont("courier", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(255, 255, 255);
            doc.text(`TARGET EMAIL EXPOSURES: ${eb.email.toUpperCase()} (${eb.leaks.length} LEAKS FOUND)`, 55, 275);
            let offset = 290;
            const items = eb.leaks.slice(0, 2); // show up to 2 for space
            items.forEach(l => {
                doc.setDrawColor(255, 80, 80);
                doc.setFillColor(25, 15, 17);
                doc.rect(55, offset, 485, 25, "FD");
                doc.setFont("courier", "bold");
                doc.setFontSize(7.5);
                doc.setTextColor(255, 100, 100);
                doc.text(`${l.name.toUpperCase()} (${l.year}) - Leaks: ${l.dataTypes.substring(0, 40)}`, 65, offset + 15);
                offset += 30;
            });
        } else {
            doc.setFont("courier", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(110, 120, 140);
            doc.text("• IDENTITY LEAK AUDIT NOT PERFORMED", 55, 275);
        }

        // Credential strength
        const pc = window.LatestPasswordData;
        drawTerminalPanel(40, 375, 515, 380, "CREDENTIAL_ENTROPY_AUDITING", [255, 0, 127]);
        if (pc) {
            doc.setFont("courier", "bold");
            doc.setFontSize(10);
            doc.setTextColor(255, 255, 255);
            doc.text("PASSKEY ENTROPY METRICS:", 55, 405);
            
            const origLen = pc.length;
            const masked = origLen > 2 ? "p" + "•".repeat(origLen - 2) + "d" : "••";
            doc.setFont("courier", "normal");
            doc.setFontSize(9);
            doc.text(`• Masked Passkey:   ${masked} (${origLen} Characters)`, 55, 430);

            let color = [255, 85, 85];
            if (pc.score > 70) color = [0, 255, 102];
            else if (pc.score > 35) color = [255, 150, 0];
            doc.text(`• Security Rating:   `, 55, 450);
            doc.setFont("courier", "bold");
            doc.setTextColor(color[0], color[1], color[2]);
            doc.text(`${pc.score}% - ${pc.label}`, 220, 450);

            doc.setFont("courier", "normal");
            doc.setTextColor(200, 210, 220);
            doc.text(`• Variety Metrics:  Upper: ${pc.hasUpper?'YES':'NO'}, Lower: ${pc.hasLower?'YES':'NO'}, Digit: ${pc.hasDigit?'YES':'NO'}, Symbol: ${pc.hasSpecial?'YES':'NO'}`, 55, 470);
            doc.text(`• Common Passkey Check: ${pc.isCommon ? 'DICTIONARY DANGER MATCH' : 'PASSED (STABLE)'}`, 55, 490);

            doc.setFont("courier", "bold");
            doc.setTextColor(255, 255, 255);
            doc.text("RECOMMENDED UPGRADED PASSKEY:", 55, 525);
            doc.setTextColor(0, 255, 102);
            doc.setFontSize(11);
            doc.text(pc.upgradedPass, 55, 545);

            doc.setFont("courier", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(150, 160, 180);
            doc.text("CRYPTOGRAPHIC CONVERSION STEPS APPLIED:", 55, 575);
            
            let ry = 595;
            doc.setFont("courier", "normal");
            doc.setFontSize(8);
            doc.setTextColor(190, 200, 210);
            pc.upgradedRules.forEach(rule => {
                doc.text(`- ${rule}`, 55, ry);
                ry += 16;
            });
        } else {
            drawIncompletePlaceholder(395, "credential_auditor", [255, 0, 127]);
        }

        // ---------- PAGE 4: SMS SHIELD & DIGITAL FOOTPRINT ----------
        doc.addPage();
        renderPageSkeleton(4, totalPages, "FIREWALLS_&_OSINT_PROBES");

        // SMS Rate Limiter
        const sms = window.smsSimState || { shieldActive: false, attackCount: 0, blockedCount: 0, allowedCount: 0 };
        drawTerminalPanel(40, 115, 515, 190, "SMS_FIREWALL_RATE_LIMITER_LOGS", [255, 170, 0]);
        doc.setFont("courier", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(255, 255, 255);
        doc.text("SMS BOMB FIREWALL SECURITY PROFILE:", 55, 145);

        doc.setFont("courier", "normal");
        doc.setFontSize(9);
        doc.setTextColor(200, 210, 220);
        doc.text(`• Firewall Shield Protection State: `, 55, 170);
        doc.setFont("courier", "bold");
        if (sms.shieldActive) {
            doc.setTextColor(0, 255, 102);
            doc.text("ENABLED // PROTECTION ON", 290, 170);
        } else {
            doc.setTextColor(255, 85, 85);
            doc.text("DISABLED // FIREWALL OFF", 290, 170);
        }
        
        doc.setFont("courier", "normal");
        doc.setTextColor(200, 210, 220);
        doc.text(`• Total Simulation Packets Logged:   ${sms.attackCount}`, 55, 190);
        doc.text(`• Traffic Blocked (Filter Dropped):  ${sms.blockedCount}`, 55, 210);
        doc.text(`• Traffic Bypassed (Allowed Ports):  ${sms.allowedCount}`, 55, 230);
        
        const totalS = sms.attackCount || 1;
        const blockP = Math.round((sms.blockedCount / totalS) * 100);
        doc.text(`• Filter Blocking Shield Efficiency: `, 55, 250);
        doc.setFont("courier", "bold");
        const smsColor = sms.shieldActive ? [0, 255, 102] : [255, 150, 0];
        doc.setTextColor(smsColor[0], smsColor[1], smsColor[2]);
        doc.text(`${sms.shieldActive ? "100" : blockP}% PROTECTED`, 290, 250);

        // Digital Footprint
        const fp = window.LatestFootprintData || {};
        drawTerminalPanel(40, 325, 515, 430, "DIGITAL_FOOTPRINT_OSINT_EXPOSURE_INTELLIGENCE", [0, 240, 255]);
        
        // Username scan summary
        if (fp.usernameScan) {
            const u = fp.usernameScan;
            doc.setFont("courier", "bold");
            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
            doc.text(`CODENAME OSINT PROBES: "${u.username.toUpperCase()}"`, 55, 355);

            let exposureLabel = "STABLE";
            let expColor = [0, 255, 102];
            if (u.exposedCount >= 7) { exposureLabel = "CRITICAL"; expColor = [255, 85, 85]; }
            else if (u.exposedCount >= 4) { exposureLabel = "ELEVATED"; expColor = [255, 150, 0]; }

            doc.setFont("courier", "normal");
            doc.text("Platform Registration Vulnerability: ", 55, 375);
            doc.setFont("courier", "bold");
            doc.setTextColor(expColor[0], expColor[1], expColor[2]);
            doc.text(`${exposureLabel} (${u.exposedCount} Exposed)`, 290, 375);
        } else {
            doc.setFont("courier", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(110, 120, 140);
            doc.text("• USERNAME OSINT PROBES NOT PERFORMED", 55, 355);
        }

        // EXIF Image metadata
        if (fp.exif) {
            const e = fp.exif;
            doc.setFont("courier", "bold");
            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
            doc.text("TEST FILE METADATA PROBE:", 55, 415);
            
            doc.setFont("courier", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(200, 210, 220);
            if (e.hasExif) {
                doc.text(`- Camera Device Model: ${e.device}`, 55, 435);
                doc.text(`- Capture Time Stamp:  ${e.time}`, 55, 455);
                doc.text(`- Creation Software:   ${e.software}`, 55, 475);
                
                doc.setFont("courier", "bold");
                doc.text(`- GPS COORDINATES:     `, 55, 495);
                doc.setTextColor(255, 170, 0);
                doc.text(e.gps || "NO GPS LEAKED", 200, 495);
            } else {
                doc.setTextColor(0, 255, 102);
                doc.text("- Image file stripped of all metadata tags (Secure).", 55, 435);
            }
        } else {
            doc.setFont("courier", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(110, 120, 140);
            doc.text("• EXIF IMAGE PRIVACY AUDIT NOT RUN", 55, 415);
        }

        // Google Dorks
        if (fp.dorking) {
            const dk = fp.dorking;
            doc.setFont("courier", "bold");
            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
            doc.text("INDEXED GOOGLE DORK PROFILES:", 55, 540);

            let dy = 560;
            doc.setFont("courier", "normal");
            doc.setFontSize(7.5);
            dk.dorks.slice(0, 4).forEach(d => {
                doc.setTextColor(0, 240, 255);
                doc.text(`• ${d.title}:`, 55, dy);
                doc.setTextColor(255, 170, 0);
                doc.text(`  Dork: ${d.query.substring(0, 80)}`, 55, dy + 11);
                dy += 24;
            });
        } else {
            doc.setFont("courier", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(110, 120, 140);
            doc.text("• GOOGLE DORK INDEXING SEARCH NOT RUN", 55, 540);
        }
    }

    // 6. Save PDF naming it according to their username
    const cleanUsername = (CyberState.username || "operator").toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    const moduleName = module.replace("-", "_");
    const filename = `${cleanUsername}_${moduleName}_report.pdf`;
    
    try {
        doc.save(filename);
        
        // Add log entry to terminal dashboard
        if (typeof addDashboardAlert === "function") {
            addDashboardAlert("green", `SECURE_EXPORT: Encrypted report saved as ${filename}`);
        }

        // Determine correct explanation note
        const keyNote = (window.firebaseActive && firebase.auth().currentUser)
            ? "To decrypt and open the file, enter your registered operator email address."
            : "To decrypt and open the file, enter your operator password.";
        
        showCustomAlert(
            `SUCCESS: Secure PDF report "${filename}" has been generated and downloaded successfully.\n\nDECRYPTION KEY NOTE:\n${keyNote}`,
            "PDF_DOWNLOAD_SUCCESS",
            true
        );
    } catch (err) {
        console.error("PDF download execution failed:", err);
    }
}
