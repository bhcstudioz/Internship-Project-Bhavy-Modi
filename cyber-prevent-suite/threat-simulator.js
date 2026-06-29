/* Cyber Ops - Threat Simulator sandbox module */

const SCENARIOS = {
    "1": {
        title: "SCENARIO_01 // CORPORATE_PHISHING_EMAIL",
        totalHotspots: 3,
        clues: [
            { id: "sender", text: "Spot the spoofed email address." },
            { id: "urgency", text: "Identify the psychological fear/urgency hook." },
            { id: "link", text: "Audit the destination link parameter." }
        ],
        explanation: "This is a classic 'Brand Mimicry' phishing campaign. Phishers use domain spelling variations (typosquatting) like <code>netflix-billing-support.com</code> and register low-cost TLS certs to bypass basic web reputation filters. They deploy urgent threats of account lockout to trigger panic-induced clicks, redirecting users to credentials harvest forms. Training employees to spot sender discrepancies and hover-auditing links reduces click rates by over 75%.",
        render: () => `
            <div class="email-client">
                <div class="email-header-bar">
                    <div class="email-dots"><span></span><span></span><span></span></div>
                    <div class="email-subject-line">URGENT: Your Netflix subscription is suspended</div>
                </div>
                <div class="email-meta-info">
                    <div class="email-sender-line">
                        <div class="email-sender-details">
                            From: <span class="threat-hotspot" data-id="sender" title="Click to audit sender"><strong>Netflix Support</strong> &lt;no-reply@netflix-billing-support.com&gt;</span>
                        </div>
                        <div style="font-size:11px; color:#aaa;">Today, 14:02</div>
                    </div>
                    <div class="email-sender-line" style="margin-top: 5px;">
                        <div class="email-sender-details">To: employee_active@ops-net.org</div>
                    </div>
                </div>
                <div class="email-body-content">
                    <div class="email-netflix-logo">NETFLIX</div>
                    <p style="margin-bottom:15px; font-weight:bold;">Dear Customer,</p>
                    <p style="margin-bottom:15px;">We were unable to process your monthly renewal payment. Your credit card bank reported a verification timeout error.</p>
                    
                    <p class="threat-hotspot" data-id="urgency" style="margin-bottom:15px; padding:8px; border-left:2px solid transparent; font-weight:bold; color:#cc0000;" title="Click to audit urgency">
                        WARNING: If your billing profile is not updated within 24 hours, your streaming subscription will be permanently terminated and profile logs purged.
                    </p>
                    
                    <p style="margin-bottom:20px;">Please click the button below to update your payment settings and continue streaming:</p>
                    
                    <div style="text-align: center; margin-bottom: 25px;">
                        <span class="threat-hotspot" data-id="link" style="display:inline-block;" title="Click to audit action button link">
                            <a href="#" class="email-action-btn" onclick="event.preventDefault();" style="pointer-events:none;">UPDATE BILLING SETTINGS</a>
                            <div style="font-family: monospace; font-size:10px; color:#c62828; text-align:center; margin-top:5px; background:#fff3f3; padding:2px 6px; border:1px solid #ffcdd2;">
                                Link: http://secure.netflix.update-details.net/auth
                            </div>
                        </span>
                    </div>
                    
                    <p style="margin-bottom:15px;">If you have any questions, our support team is available online.</p>
                    <p>Cheers,<br>The Netflix Security Division</p>
                    
                    <div class="email-footer-notes">
                        This is an automated notification. Replies to this email address are routed to unmonitored mail queues. © 2026 Netflix Inc.
                    </div>
                </div>
            </div>
        `
    },
    "2": {
        title: "SCENARIO_02 // MFA_SMISHING_ALERT",
        totalHotspots: 3,
        clues: [
            { id: "number", text: "Flag the sender identity." },
            { id: "smslink", text: "Spot the dangerous redirect TLD link." },
            { id: "intimidation", text: "Identify the intimidation tactic." }
        ],
        explanation: "SMS-based Phishing ('Smishing') has surged because users trust mobile notifications more than email. Attackers use temporary VoIP numbers (often displayed as normal 10-digit mobile numbers) instead of official bank shortcodes. They insert aggressive intimidation hooks, like threats of bank asset freezes or police action, to force targets to click on low-cost TLD links (such as <code>.xyz</code> domains) masquerading as verification portals.",
        render: () => `
            <div class="sms-client">
                <div class="sms-phone-header">
                    <div class="phone-notch"></div>
                    <div class="sms-sender-number">
                        <span class="threat-hotspot" data-id="number" title="Click to audit sender mobile number">+1 (555) 438-9210</span>
                    </div>
                    <div class="sms-sender-sub">Active Chat: SMS Broadcast</div>
                </div>
                <div class="sms-body-container">
                    <div class="sms-date-stamp">TODAY 11:42 AM</div>
                    
                    <div class="sms-bubble">
                        [CHASE_BANK] ALERT: Suspicious log-on attempt detected from IP 185.10.42.9 (Moscow, RU). 
                        If this was not you, verify security immediately:
                        
                        <span class="threat-hotspot" data-id="smslink" style="display:inline-block; width:100%;" title="Click to audit SMS link">
                            <span class="sms-bubble-link">https://chase-security-verify.xyz/login</span>
                        </span>
                        
                        <span class="threat-hotspot" data-id="intimidation" style="display:inline-block; margin-top:8px; border-top:1px dashed transparent;" title="Click to audit bank threat details">
                            Notice: Non-action within 15 minutes will freeze cards and trigger alert files to regional enforcement authorities.
                        </span>
                    </div>
                </div>
                <div class="sms-input-footer">
                    <div class="sms-app-btn" style="background:#555;"></div>
                    <div class="sms-input-box">Text Message...</div>
                    <div class="sms-app-btn"></div>
                </div>
            </div>
        `
    },
    "3": {
        title: "SCENARIO_03 // CLONED_SSO_PORTAL",
        totalHotspots: 3,
        clues: [
            { id: "address", text: "Audit domain registry in the browser address bar." },
            { id: "typo", text: "Find the branding typography error." },
            { id: "claims", text: "Flag suspicious cybersecurity seal claims." }
        ],
        explanation: "SSO portals are highly prized by corporate espionage groups. Cloned portals mimic corporate Single Sign-On pages down to CSS stylesheet variables. The key indicators reside in the browser address bar: hackers use subdomains like <code>login.microsoftonline.portal-access.cc</code> hoping the user only reads <code>login.microsoftonline</code> and overlooks the root domain <code>portal-access.cc</code>. Additionally, subtle typos and fake 'security seals' are tell-tale signs of credential harvester setups.",
        render: () => `
            <div class="portal-client">
                <div class="portal-browser-header">
                    <div class="email-dots"><span></span><span></span><span></span></div>
                    <div class="portal-address-bar">
                        <span class="threat-hotspot" data-id="address" title="Click to audit URL domain" style="font-weight:bold;">https://login.microsoftonline.portal-access.cc/oauth2/v2.0/</span>
                    </div>
                </div>
                
                <div class="portal-body">
                    <div class="portal-logo-area">
                        <div class="portal-logo-icon">M</div>
                        <span class="threat-hotspot" data-id="typo" title="Click to audit branding spelling">Microsof Account</span>
                    </div>
                    
                    <div class="portal-login-card">
                        <h4 style="font-size:18px; margin-bottom:8px; font-weight:500; color:#1e293b;">Sign In</h4>
                        <p style="font-size:12px; color:#64748b; margin-bottom:15px;">Use your organizational credentials</p>
                        
                        <div class="portal-field">
                            <label>EMAIL OR USERNAME</label>
                            <input type="text" value="employee_active@ops-net.org" disabled style="background:#f1f5f9; color:#94a3b8;">
                        </div>
                        
                        <div class="portal-field">
                            <label>ENTER PASSWORD</label>
                            <input type="password" placeholder="••••••••••••" disabled>
                        </div>
                        
                        <button class="portal-submit-btn" onclick="event.preventDefault();">Sign In</button>
                    </div>
                    
                    <div style="text-align:center; margin-top:20px;">
                        <span class="threat-hotspot" data-id="claims" style="display:inline-block;" title="Click to audit security claims">
                            <span style="font-size:10px; color:#475569; border:1px solid #cbd5e1; padding:4px 8px; border-radius:3px; background:#fff;">
                                [🔒 Secure Shield Approved v4.2]
                            </span>
                        </span>
                    </div>
                    
                    <div class="portal-footer-copy">
                        Terms of use Privacy & cookies ...
                    </div>
                </div>
            </div>
        `
    },
    "4": {
        title: "SCENARIO_04 // PACKAGE_DELIVERY_RED_ALERT",
        totalHotspots: 3,
        clues: [
            { id: "number", text: "Verify sender number legitimacy." },
            { id: "link", text: "Audit redirect link TLD registry." },
            { id: "urgency", text: "Identify the false delivery emergency window." }
        ],
        explanation: "Postal delivery scams are popular because they target an action most users regularly perform: waiting for a delivery. Attackers register domains ending in <code>.info</code> or <code>.icu</code> and use automated SMS bulk services. The goal is to collect small 'address redirection fees' ($1.50) which acts as a gateway to steal credit card data. Always use official carrier apps to track deliveries.",
        render: () => `
            <div class="sms-client">
                <div class="sms-phone-header">
                    <div class="phone-notch"></div>
                    <div class="sms-sender-number">
                        <span class="threat-hotspot" data-id="number" title="Click to audit sender mobile">+1 (202) 555-0143</span>
                    </div>
                    <div class="sms-sender-sub">Active Chat: USPS Alerts</div>
                </div>
                <div class="sms-body-container">
                    <div class="sms-date-stamp">TODAY 08:15 AM</div>
                    
                    <div class="sms-bubble">
                        USPS NOTICE: Your package cannot be dispatched due to an incorrect street number address. 
                        Please update your delivery coordinates within 12 hours:
                        
                        <span class="threat-hotspot" data-id="link" style="display:inline-block; width:100%;" title="Click to audit delivery link">
                            <span class="sms-bubble-link">https://usps-redelivery-post.info/tracking</span>
                        </span>
                        
                        <span class="threat-hotspot" data-id="urgency" style="display:inline-block; margin-top:8px; border-top:1px dashed transparent;" title="Click to audit emergency message">
                            Warning: Failure to update details will result in package return to sender and storage fee assessment.
                        </span>
                    </div>
                </div>
                <div class="sms-input-footer">
                    <div class="sms-app-btn" style="background:#555;"></div>
                    <div class="sms-input-box">Text Message...</div>
                    <div class="sms-app-btn"></div>
                </div>
            </div>
        `
    },
    "5": {
        title: "SCENARIO_05 // SCAREWARE_SUPPORT_POPUP",
        totalHotspots: 3,
        clues: [
            { id: "url", text: "Scan browser connection security protocol." },
            { id: "scare", text: "Identify scareware data destruction claims." },
            { id: "logo", text: "Flag branding typography error." }
        ],
        explanation: "Scareware relies on psychological shock to bypass logic. Browser popups exploit system vulnerabilities or compromised ads to display warning windows claiming device infection. The warning instructs users to call a toll-free number where remote-access Trojans are installed under the guise of 'technical assistance.' Note that browser pages cannot scan local drives for malware.",
        render: () => `
            <div class="portal-client" style="background: #1c0205; color: #fff;">
                <div class="portal-browser-header" style="background: #3a0007; border-bottom: 1px solid #ff3366;">
                    <div class="email-dots"><span></span><span></span><span></span></div>
                    <div class="portal-address-bar" style="background: #000; border-color: #ff3366; color: #ff3366;">
                        <span class="threat-hotspot" data-id="url" title="Click to audit connection URL">http://security-warning-err0x802.xyz/index.html</span>
                    </div>
                </div>
                
                <div class="portal-body" style="max-width: 450px; text-align: center; padding: 40px 20px;">
                    <div class="portal-logo-area" style="color: #ff3366; justify-content: center;">
                        <div class="portal-logo-icon" style="background: #ff3366;">⚠️</div>
                        <span class="threat-hotspot" data-id="logo" title="Click to audit logo branding">Microsof Security Active</span>
                    </div>
                    
                    <div class="portal-login-card" style="background: #330005; border-color: #ff3366; color: #fff; padding: 25px;">
                        <h4 style="font-size:18px; margin-bottom:12px; font-weight:bold; color:#ff3366;">SYS_VIRUS_ALERT_0x809</h4>
                        
                        <p class="threat-hotspot" data-id="scare" style="font-size:12.5px; line-height:1.5; color:#fecdd3; border: 1px dashed transparent; padding: 5px;" title="Click to audit warning threats">
                            CRITICAL: Trojan.Spyware matches found in local directory files. System locked. Do not restart your computer or local hard drives will be purged.
                        </p>
                        
                        <div style="margin: 20px 0; padding: 10px; background: #000; border: 1px solid #ff3366; font-size: 13px;">
                            Call Windows Support: <strong style="font-size: 16px; color:#ff3366;">+1 (800) 555-0199</strong>
                        </div>
                        
                        <button class="portal-submit-btn" style="background: #ff3366; color: #000; border: none; pointer-events:none;">RUN SECURITY DISINFECT</button>
                    </div>
                </div>
            </div>
        `
    },
    "6": {
        title: "SCENARIO_06 // OAUTH_PERMISSION_CONSENT",
        totalHotspots: 3,
        clues: [
            { id: "dev", text: "Verify developer email registry." },
            { id: "scope", text: "Flag excessive data permission demands." },
            { id: "warning", text: "Identify native security verification warnings." }
        ],
        explanation: "OAuth Consent Phishing bypasses password controls by tricking users into authorizing a malicious third-party app. Once granted consent, the application obtains an API token allowing access to read and delete emails directly on the cloud server, bypassing MFA. Always review permissions and check developer identity before approving API integrations.",
        render: () => `
            <div class="portal-client" style="background: #fdfdfd;">
                <div class="portal-browser-header">
                    <div class="email-dots"><span></span><span></span><span></span></div>
                    <div class="portal-address-bar">
                        <span>https://accounts.google.com/o/oauth2/auth/oauthchoice</span>
                    </div>
                </div>
                
                <div class="portal-body" style="max-width: 440px; padding: 25px;">
                    <div style="text-align:center; margin-bottom: 20px;">
                        <strong style="color: #4285f4; font-size: 24px;">G</strong>
                        <span style="font-size: 18px; color: #5f6368;"> Sign in</span>
                    </div>
                    
                    <div style="border:1px solid #dadce0; border-radius:8px; padding: 20px; background:#fff;">
                        <h4 style="font-size: 15px; color:#202124; margin-bottom: 8px;">Permission Request</h4>
                        <p style="font-size: 12.5px; color: #5f6368; margin-bottom: 15px;">
                            The app <strong>PDF Reader Plus</strong> wants to integrate with your account.
                        </p>
                        
                        <div class="threat-hotspot" data-id="warning" style="background: #fef7e0; border: 1px solid #feefc3; border-radius:4px; padding: 8px 12px; margin-bottom: 15px; font-size: 11.5px; color:#b06000;" title="Click to audit verification warnings">
                            ⚠️ This developer has not verified identity details. Proceed only if you trust this publisher.
                        </div>

                        <div class="threat-hotspot" data-id="dev" style="font-size: 12px; color: #5f6368; margin-bottom: 15px;" title="Click to audit developer email">
                            Developer Email: <strong style="color:#202124;">admin-sync@calendar-google-support.org</strong>
                        </div>
                        
                        <div class="threat-hotspot" data-id="scope" style="border-top:1px solid #eee; padding-top: 12px;" title="Click to audit app access scopes">
                            <label style="font-weight:bold; font-size: 11px; color:#5f6368; display:block; margin-bottom:5px;">ACCESS SCOPES DEMANDED:</label>
                            <div style="font-size:12.5px; color:#202124; margin-bottom:6px;">• Read, edit, and permanently delete all Gmail messages.</div>
                            <div style="font-size:12.5px; color:#202124;">• Manage list of connected hardware authentication tokens.</div>
                        </div>
                        
                        <div style="margin-top: 25px; display: flex; justify-content: flex-end; gap: 10px;">
                            <button style="border:none; padding: 8px 16px; border-radius:4px; background:#e8f0fe; color:#1a73e8; cursor:pointer; font-size:12px;">DENY</button>
                            <button style="border:none; padding: 8px 16px; border-radius:4px; background:#1a73e8; color:#fff; cursor:pointer; font-size:12px;">AUTHORIZE</button>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    "7": {
        title: "SCENARIO_07 // EXECUTIVE_SPEAR_PHISHING",
        totalHotspots: 3,
        clues: [
            { id: "sender", text: "Flag sender address domains mismatch." },
            { id: "request", text: "Spot anomalous corporate purchase request profiles." },
            { id: "secret", text: "Identify confidentiality/secrecy overrides." }
        ],
        explanation: "Executive Impersonation (CEO Fraud / Business Email Compromise) relies on authority pressure. Attackers use the display name of a high-level executive (like the CEO) but route emails from unofficial domain handles like <code>@corporate-exec-mail.net</code>. They request urgent, untraceable transactions (like gift card purchases or wire transfers) and forbid out-of-band validation calls by claiming they are trapped in meetings.",
        render: () => `
            <div class="email-client">
                <div class="email-header-bar">
                    <div class="email-dots"><span></span><span></span><span></span></div>
                    <div class="email-subject-line">URGENT: Purchase request for board presentation client</div>
                </div>
                <div class="email-meta-info">
                    <div class="email-sender-line">
                        <div class="email-sender-details">
                            From: <span class="threat-hotspot" data-id="sender" title="Click to audit CEO sender email"><strong>John Doe (CEO)</strong> &lt;ceo-hq-office@corporate-exec-mail.net&gt;</span>
                        </div>
                        <div style="font-size:11px; color:#aaa;">Today, 09:30</div>
                    </div>
                    <div class="email-sender-line" style="margin-top: 5px;">
                        <div class="email-sender-details">To: financial-desk@ops-net.org</div>
                    </div>
                </div>
                <div class="email-body-content">
                    <p style="margin-bottom:15px; font-weight:bold;">Hi Team,</p>
                    
                    <p class="threat-hotspot" data-id="request" style="margin-bottom:15px; border-left:2px solid transparent; padding: 5px;" title="Click to audit CEO request details">
                        I am meeting with key presentation clients shortly. I need you to purchase 5 Apple gift cards ($100 each) immediately. Scratch the back coatings and send the digital redemption codes directly to this address.
                    </p>
                    
                    <p class="threat-hotspot" data-id="secret" style="margin-bottom:15px; font-weight:bold; color:#d97706; padding: 5px;" title="Click to audit call policy exceptions">
                        I am currently inside a silent board audit meeting. Do not call my office line or verify details via phone. Email the codes within 30 minutes.
                    </p>
                    
                    <p style="margin-bottom:15px;">Appreciate the prompt execution.</p>
                    <p>Regards,<br>John Doe<br>CEO, Ops-Net Group</p>
                    
                    <div class="email-footer-notes" style="margin-top: 25px;">
                        Confidentiality Notice: This message contains executive operations routing info.
                    </div>
                </div>
            </div>
        `
    },
    "8": {
        title: "SCENARIO_08 // INVOICE_MALWARE_INSTALLER",
        totalHotspots: 3,
        clues: [
            { id: "charge", text: "Flag charge structures designed to induce panic." },
            { id: "file", text: "Spot executable double file extension suffixes." },
            { id: "cancellation", text: "Identify cancellation links routing to unverified endpoints." }
        ],
        explanation: "Invoice phishing exploits financial anxiety. Attackers bill the user a large sum for services they did not order (e.g. $4,820.00), forcing them to react hastily to dispute the charge. The scam provides a link to download the 'invoice details' which is actually a double-extension malware installer (e.g., <code>invoice.pdf.exe</code>). Running the executable drops ransomware or info-stealers.",
        render: () => `
            <div class="email-client">
                <div class="email-header-bar">
                    <div class="email-dots"><span></span><span></span><span></span></div>
                    <div class="email-subject-line">Notification: QuickBooks Online Billing Invoice #98427</div>
                </div>
                <div class="email-meta-info">
                    <div class="email-sender-line">
                        <div class="email-sender-details">
                            From: <strong>QuickBooks Billing Service</strong> &lt;quickbooks-service@quickbooks-billing.com&gt;
                        </div>
                        <div style="font-size:11px; color:#aaa;">Yesterday, 17:15</div>
                    </div>
                </div>
                <div class="email-body-content">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #2b6cb0; padding-bottom:12px; margin-bottom:20px;">
                        <span style="font-weight:bold; font-size: 18px; color:#2b6cb0;">QuickBooks.</span>
                        <span style="font-size:12px; color:#555;">Invoice Date: 2026-06-22</span>
                    </div>
                    
                    <p style="margin-bottom:15px;">Your monthly subscription service has been successfully billed.</p>
                    
                    <div class="threat-hotspot" data-id="charge" style="background:#f8fafc; border:1px solid #e2e8f0; padding:15px; border-radius:4px; margin-bottom:20px; font-size:13.5px;" title="Click to audit transaction charge">
                        • TRANSACTION CODE: QB-98427<br>
                        • CHARGED SUM: <strong style="color:#c62828;">$4,820.00 USD</strong> (Auto-debit pending)<br>
                        • ACCOUNT PROFILE: financial-desk@ops-net.org
                    </div>
                    
                    <p style="margin-bottom:15px;">The detailed itemized ledger of this software maintenance charge is attached below:</p>
                    
                    <div style="margin-bottom: 25px;">
                        <span class="threat-hotspot" data-id="file" style="display:inline-block; border:1px solid #cbd5e1; padding:8px 15px; border-radius:4px; background:#f1f5f9; cursor:pointer;" title="Click to audit attachment type">
                            📎 <strong style="color:#2b6cb0;">invoice_details_QB-98427.pdf.exe</strong> (4.2 MB)
                        </span>
                    </div>

                    <p style="font-size: 12px; margin-bottom:15px;">If you did not authorize this service subscription, you must cancel the transfer files immediately:</p>
                    
                    <div style="margin-bottom:20px;">
                        <span class="threat-hotspot" data-id="cancellation" style="display:inline-block;" title="Click to audit dispute redirect link">
                            <a href="#" onclick="event.preventDefault();" style="color:#2b6cb0; font-weight:bold; text-decoration:underline; font-size:13px;">Dispute / Cancel Transaction Profile</a>
                            <div style="font-size:10px; color:#555; margin-top:2px;">Redirects to: https://quickbooks-cancellation-billing.com/dispute</div>
                        </span>
                    </div>
                </div>
            </div>
        `
    },
    "9": {
        title: "SCENARIO_09 // ROUTER_EVIL_TWIN_PORTAL",
        totalHotspots: 3,
        clues: [
            { id: "url", text: "Scan address domain structures." },
            { id: "wpa", text: "Identify request templates targeting WPA2/WPA3 keys." },
            { id: "lockout", text: "Flag network connection threat warnings." }
        ],
        explanation: "Wi-Fi Phishing (Evil Twin attack) occurs when an attacker deploys a rogue access point named identical to a trusted network (e.g. airport Wi-Fi). When you connect, the router displays a cloned portal page asserting that a firmware update has completed and requests your Wi-Fi password. Note that legitimate router setup portals never request your Wi-Fi password inside a web browser page to 'synchronize settings.'",
        render: () => `
            <div class="portal-client">
                <div class="portal-browser-header">
                    <div class="email-dots"><span></span><span></span><span></span></div>
                    <div class="portal-address-bar">
                        <span class="threat-hotspot" data-id="url" title="Click to audit router portal domain" style="font-weight:bold;">http://192.168.1.1.security-router-portal.tk/firmware/update.html</span>
                    </div>
                </div>
                
                <div class="portal-body" style="max-width:440px; padding: 25px;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
                        <span style="font-size: 24px;">🌐</span>
                        <strong style="font-size: 16px; color:#334155;">Router Management Portal v4.2</strong>
                    </div>
                    
                    <div class="portal-login-card" style="padding: 20px;">
                        <h4 style="font-size: 15px; margin-bottom:10px; color:#1e293b;">Subsystem Firmware Updated Successfully</h4>
                        
                        <p class="threat-hotspot" data-id="lockout" style="font-size: 12px; color:#c2410c; margin-bottom:15px; padding: 5px; border-left: 2px solid transparent;" title="Click to audit lockout alerts">
                            NOTICE: The router node requires credential authentication to establish network routing tables. Failure to log in within 5 minutes will terminate internet routing.
                        </p>
                        
                        <div class="threat-hotspot" data-id="wpa" style="border-top:1px solid #e2e8f0; padding-top:12px; margin-bottom:15px;" title="Click to audit form inputs">
                            <div class="portal-field">
                                <label>ROUTER ADMIN USERNAME</label>
                                <input type="text" value="admin" disabled style="background:#f1f5f9; color:#64748b;">
                            </div>
                            <div class="portal-field">
                                <label>ENTER WI-FI PASSWORD (WPA2 KEY)</label>
                                <input type="password" placeholder="Enter Wi-Fi security key" disabled>
                            </div>
                        </div>
                        
                        <button class="portal-submit-btn" style="background:#334155;">SYNC ROUTER CONNECTIONS</button>
                    </div>
                </div>
            </div>
        `
    },
    "10": {
        title: "SCENARIO_10 // CRYPTO_GIVEAWAY_SCAM",
        totalHotspots: 3,
        clues: [
            { id: "handle", text: "Flag spoofed account profiles." },
            { id: "btc", text: "Spot high yield cryptocurrency deposit prompts." },
            { id: "url", text: "Verify verification redirects." }
        ],
        explanation: "Social Media Crypto giveaways target greed. Scammers hijack accounts or build lookalike profiles (using handles like <code>@elonmusk_support_x</code>) and deploy bots to post promotional links. The scam promises to double any cryptocurrency sent to their wallet. Legitimate organizations or executives will never host giveaways asking you to send funds first. Always inspect handles and destination TLDs.",
        render: () => `
            <div class="portal-client" style="background:#fff; font-family:system-ui, -apple-system, sans-serif;">
                <div class="portal-browser-header">
                    <div class="email-dots"><span></span><span></span><span></span></div>
                    <div class="portal-address-bar">
                        <span>https://x.com/elonmusk/status/98472918</span>
                    </div>
                </div>
                
                <div style="max-width:500px; margin: 0 auto; padding: 20px; border: 1px solid #e1e8ed; border-top: none;">
                    <div style="display:flex; gap:12px; align-items:flex-start; margin-bottom:15px;">
                        <div style="width:48px; height:48px; border-radius:50%; background:#1e293b; color:#fff; display:flex; justify-content:center; align-items:center; font-weight:bold; font-size:20px;">X</div>
                        <div>
                            <div style="font-weight:bold; color:#0f1419; font-size:15px;">Elon Musk</div>
                            <span class="threat-hotspot" data-id="handle" style="color:#536471; font-size:13px;" title="Click to audit user handle">@elonmusk_support_x</span>
                        </div>
                    </div>
                    
                    <div style="font-size:15px; color:#0f1419; line-height:1.45; margin-bottom:15px;">
                        To celebrate the new Starship launch, I am donating 1,000 Bitcoins to our community. 
                        
                        <p class="threat-hotspot" data-id="btc" style="font-weight:bold; color:#0055ff; padding: 5px; margin: 8px 0;" title="Click to audit giveaway prompt">
                            Rules: Send 0.1 BTC to 1.0 BTC to our official verification node address, and we will return double the amount (0.2 BTC to 2.0 BTC) to your wallet instantly.
                        </p>
                        
                        Verify your address profile here:
                        
                        <span class="threat-hotspot" data-id="url" style="display:block; margin-top:8px;" title="Click to audit giveaway destination link">
                            <span style="color:#1d9bf0; text-decoration:underline; font-weight:bold;">http://tesla-double-crypto.xyz/wallet/</span>
                        </span>
                    </div>
                    
                    <div style="border-top:1px solid #eff3f4; padding-top:10px; color:#536471; font-size:13px; display:flex; gap:15px;">
                        <span>08:30 AM · Jun 23, 2026</span>
                        <span>· <strong style="color:#0f1419;">4.2M</strong> Views</span>
                    </div>
                </div>
            </div>
        `
    }
};

let currentLevel = null;
let foundIds = [];
let localScore = 0;

function initThreatSimulator() {
    const selectorCards = document.querySelectorAll(".scenario-card");
    const backBtn = document.getElementById("sim-back-btn");
    const reportBtn = document.getElementById("sim-action-report");
    const safeBtn = document.getElementById("sim-action-safe");
    const closeFeedbackBtn = document.getElementById("feedback-close-btn");

    selectorCards.forEach(card => {
        card.addEventListener("click", () => {
            const level = card.getAttribute("data-level");
            mountScenario(level);
        });
    });

    if (backBtn) {
        // Change text in index.html to be more cyber-authentic: [◀ ABANDON SESSION]
        backBtn.innerHTML = "[◀ ABANDON SESSION]";
        backBtn.addEventListener("click", () => {
            if (confirm("WARNING: Abandoning active threat analysis will wipe current session logs. Proceed?")) {
                if (typeof addDashboardAlert === "function") {
                    addDashboardAlert("warn", `SIM_WARNING: Session ${currentLevel} abandoned by operator.`);
                }
                resetSimulatorMenu();
            }
        });
    }

    if (reportBtn) {
        reportBtn.addEventListener("click", () => handleVerdictSubmit(true));
    }

    if (safeBtn) {
        safeBtn.addEventListener("click", () => handleVerdictSubmit(false));
    }

    if (closeFeedbackBtn) {
        closeFeedbackBtn.addEventListener("click", () => {
            document.getElementById("sim-feedback-overlay").classList.add("hidden");
            resetSimulatorMenu();
        });
    }

    // Run initial card locking evaluation
    resetSimulatorMenu();
}

function mountScenario(level) {
    const scenario = SCENARIOS[level];
    if (!scenario) return;

    if (typeof updateUserAction === "function") {
        updateUserAction("Solving Threat Scenario Level " + level);
    }

    currentLevel = level;
    foundIds = [];
    localScore = 150; // Starting score budget, clicking wrong subtracts

    // Hide selector screen (removes all other levels from view during session), show sandbox
    document.getElementById("sim-selector-screen").classList.add("hidden");
    document.getElementById("sim-sandbox-screen").classList.remove("hidden");

    // Load template
    document.getElementById("sandbox-scenario-title").textContent = scenario.title;
    document.getElementById("sim-found-count").textContent = "0";
    document.getElementById("sim-total-count").textContent = scenario.totalHotspots;
    document.getElementById("sim-current-score").textContent = localScore;

    const workspace = document.getElementById("mockup-container");
    workspace.innerHTML = scenario.render();

    // Reset clues checklist
    const cluesList = document.getElementById("sandbox-clues-list");
    cluesList.innerHTML = "";
    scenario.clues.forEach(clue => {
        const item = document.createElement("div");
        item.className = "clue-item";
        item.id = `clue-chk-${clue.id}`;
        item.innerHTML = `
            <span class="clue-chk">[ ]</span>
            <span class="clue-desc">${clue.text}</span>
        `;
        cluesList.appendChild(item);
    });

    // Wire clicks to mockup hotspots
    const hotspots = workspace.querySelectorAll(".threat-hotspot");
    hotspots.forEach(hs => {
        hs.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = hs.getAttribute("data-id");
            if (foundIds.includes(id)) return;
            triggerHotspotFound(hs, id);
        });
    });

    // Wire clicks to mockups generally (misclicks deduct score)
    const mockupFrame = workspace.querySelector(".email-client, .sms-client, .portal-client");
    if (mockupFrame) {
        mockupFrame.addEventListener("click", () => {
            // Deduct points for generic misclicks
            if (foundIds.length < scenario.totalHotspots) {
                localScore = Math.max(0, localScore - 30);
                document.getElementById("sim-current-score").textContent = localScore;
                
                // Print alert message
                if (typeof addDashboardAlert === "function") {
                    addDashboardAlert("warn", "SIM_WARNING: False positive warning clicked. Score penalized.");
                }
            }
        });
    }

    if (typeof addDashboardAlert === "function") {
        addDashboardAlert("cyan", `SIM_LOG: Mount operations complete. Sector ${level} isolated.`);
    }
}

function triggerHotspotFound(element, id) {
    const scenario = SCENARIOS[currentLevel];
    foundIds.push(id);
    
    // UI feedback
    element.classList.add("found-hotspot");
    
    // Check item off
    const clueEl = document.getElementById(`clue-chk-${id}`);
    if (clueEl) {
        clueEl.classList.add("resolved-clue");
        clueEl.querySelector(".clue-chk").textContent = "[X]";
    }

    // Add score
    localScore += 100;
    
    document.getElementById("sim-found-count").textContent = foundIds.length;
    document.getElementById("sim-current-score").textContent = localScore;

    if (typeof addDashboardAlert === "function") {
        addDashboardAlert("green", `SIM_LOG: Threat indicator '${id.toUpperCase()}' identified. +100 SCORE`);
    }

    // Auto flag complete if all elements verified
    if (foundIds.length === scenario.totalHotspots) {
        if (typeof addDashboardAlert === "function") {
            addDashboardAlert("green", "SIM_LOG: All compromise indicators identified. Awaiting operator final report.");
        }
    }
}

function handleVerdictSubmit(isReportingThreat) {
    const scenario = SCENARIOS[currentLevel];
    if (!scenario) return;

    if (foundIds.length < scenario.totalHotspots) {
        alert("CRITICAL WARNING: Locate all active indicators of compromise (IOCs) before submitting your assessment report.");
        return;
    }

    // Phishing assets are always threats in this simulator game
    const correctVerdict = true; // In all levels, they are simulated attacks
    
    const wasCorrect = (isReportingThreat === correctVerdict);
    const feedbackOverlay = document.getElementById("sim-feedback-overlay");
    const feedbackTitle = document.getElementById("feedback-title");
    const feedbackXp = document.getElementById("feedback-xp");
    const feedbackAccuracy = document.getElementById("feedback-accuracy");
    const feedbackExplain = document.getElementById("feedback-explanation");

    feedbackOverlay.classList.remove("hidden");

    if (wasCorrect) {
        feedbackTitle.textContent = "INCIDENT_RESOLVED_SUCCESSFULLY";
        feedbackTitle.className = "text-neon-green";
        feedbackAccuracy.textContent = "100% ACCURACY";
        feedbackAccuracy.className = "text-neon-cyan";
        
        let xpGranted = 250;
        // accuracy bonus based on remaining score budget
        if (localScore > 300) {
            xpGranted += 100;
            feedbackXp.textContent = `+${xpGranted} XP (Accuracy Bonus!)`;
        } else {
            feedbackXp.textContent = `+${xpGranted} XP`;
        }

        feedbackExplain.innerHTML = scenario.explanation;

        // Update Global State
        if (typeof CyberState !== "undefined") {
            CyberState.scenariosSolved[currentLevel] = true;
            if (typeof gainXP === "function") {
                gainXP(xpGranted, `Threat Simulation Level ${currentLevel} Defused`);
            }
        }
    } else {
        feedbackTitle.textContent = "SYSTEM_PERIMETER_BREACHED";
        feedbackTitle.className = "text-neon-red";
        feedbackXp.textContent = "0 XP";
        feedbackAccuracy.textContent = "0% ACCURACY";
        feedbackAccuracy.className = "text-neon-red";
        feedbackExplain.innerHTML = "You marked a confirmed attack payload as SAFE. In a production system, this allows threat actors to establish access vectors. Analyze the explanation to learn why this was a threat: <br><br>" + scenario.explanation;
    }
}

function resetSimulatorMenu() {
    if (typeof updateUserAction === "function" && currentLevel) {
        updateUserAction("Viewing Threat Simulator Lobby");
    }

    document.getElementById("sim-selector-screen").classList.remove("hidden");
    document.getElementById("sim-sandbox-screen").classList.add("hidden");
    document.getElementById("sim-feedback-overlay").classList.add("hidden");
    
    currentLevel = null;
    foundIds = [];

    // Redraw cards to reflect completed status check (all levels remain open)
    const cards = document.querySelectorAll(".scenario-card");
    cards.forEach(card => {
        const lvl = parseInt(card.getAttribute("data-level"));
        const isSolved = (typeof CyberState !== "undefined") && CyberState.scenariosSolved[lvl];

        card.className = "scenario-card"; // Reset classes
        const badge = card.querySelector(".scenario-badge");
        const btn = card.querySelector("button, .btn-locked, .btn-replay");

        if (isSolved) {
            card.classList.add("checked-card");
            if (badge) {
                badge.textContent = "RESOLVED";
                badge.className = "scenario-badge badge-resolved";
            }
            if (btn) {
                btn.outerHTML = `<button class="terminal-btn-sm btn-replay">REPLAY_SIMULATOR</button>`;
            }
        } else {
            if (badge) {
                badge.textContent = `LEVEL_${lvl.toString().padStart(2, '0')}`;
                badge.className = "scenario-badge";
            }
            if (btn) {
                btn.outerHTML = `<button class="terminal-btn-sm">MOUNT_SIMULATOR</button>`;
            }
        }
    });
}

// Expose SCENARIOS globally for PDF generation report compiles
window.SCENARIOS = SCENARIOS;
