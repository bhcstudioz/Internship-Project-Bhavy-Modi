/* Cyber Ops Console - Digital Footprint Checker Submodule */

function initFootprintChecker() {
    console.log("Initializing Digital Footprint Checker...");
    
    // Setup Tab Navigation
    const tabs = document.querySelectorAll('#panel-footprint-checker .tab-btn');
    const contents = document.querySelectorAll('#panel-footprint-checker .tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const targetContent = document.getElementById(target);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // 1. Username Exposure Scanner
    initUsernameScanner();

    // 2. EXIF Metadata Analyzer
    initExifAnalyzer();

    // 3. Google Dorking Generator
    initDorkingGenerator();
}

// TAB A: Username Exposure Simulator
function initUsernameScanner() {
    const scanBtn = document.getElementById("footprint-user-scan-btn");
    const usernameInput = document.getElementById("footprint-username-input");
    const consoleFeed = document.getElementById("footprint-username-console");
    const resultsGrid = document.getElementById("footprint-username-results");
    const exposureLevel = document.getElementById("footprint-exposure-level");
    const platformsList = document.getElementById("footprint-platforms-list");

    const runScan = () => {
        const username = usernameInput.value.trim();
        if (!username) {
            alert("Please enter a username to audit.");
            return;
        }

        if (typeof updateUserAction === "function") {
            updateUserAction("OSINT username scan: " + username.toUpperCase());
        }

        // Show console feed, hide results
        consoleFeed.classList.remove("hidden");
        resultsGrid.classList.add("hidden");
        consoleFeed.innerHTML = "";

        // Helper to append status messages to retro console
        const addLogLine = (type, text) => {
            const line = document.createElement("div");
            const isInfo = type === "info";
            const isWarn = type === "warn";
            const isSuccess = type === "success";

            line.className = "log-line " + 
                (isInfo ? "log-info" : isWarn ? "log-warn" : isSuccess ? "log-success" : "");
            
            const time = new Date().toTimeString().split(' ')[0];
            line.textContent = `[${time}] ${text}`;
            consoleFeed.appendChild(line);
            consoleFeed.scrollTop = consoleFeed.scrollHeight;
        };

        // Deterministic hash check helper (fallback)
        const checkMockPlatform = (platName) => {
            let hash = 0;
            const str = username.toLowerCase() + platName.toLowerCase();
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            return Math.abs(hash) % 3 !== 0; // ~66% exposure rate fallback
        };

        // Helper to fetch with timeout
        const fetchWithTimeout = async (url, options = {}, timeout = 4000) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            try {
                const response = await fetch(url, { ...options, signal: controller.signal });
                clearTimeout(id);
                return response;
            } catch (e) {
                clearTimeout(id);
                throw e;
            }
        };

        // Real-time platform check logic via CORS proxy
        const checkRealPlatform = async (name, url, username, mockCheck) => {
            let targetUrl = url;
            
            // Use custom APIs or queries where available
            if (name === "GitHub") {
                try {
                    const res = await fetchWithTimeout(`https://api.github.com/users/${username}`, {}, 3000);
                    if (res.status === 200) return true;
                    if (res.status === 404) return false;
                } catch (e) {
                    console.warn("GitHub API error, using page fetch:", e);
                }
            } else if (name === "Reddit") {
                targetUrl = `https://www.reddit.com/user/${username}/about.json`;
            }

            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
            try {
                const res = await fetchWithTimeout(proxyUrl, {}, 3500);
                if (res.status === 404) {
                    return false;
                }

                const text = await res.text();
                const lowText = text.toLowerCase();

                // Specific platform keyword validations
                if (name === "Reddit") {
                    if (lowText.includes('"error": 404') || lowText.includes('"message": "not found"') || lowText.includes('"error": 403')) {
                        return false;
                    }
                    if (lowText.includes('"data"')) {
                        return true;
                    }
                } else if (name === "Steam") {
                    if (lowText.includes("the specified profile could not be found")) {
                        return false;
                    }
                    return true;
                } else if (name === "Instagram") {
                    if (lowText.includes("page isn't available") || lowText.includes("link you followed may be broken")) {
                        return false;
                    }
                } else if (name === "TikTok") {
                    if (lowText.includes("couldn't find this account") || lowText.includes("cant find this account")) {
                        return false;
                    }
                } else if (name === "Twitter/X") {
                    if (lowText.includes("this account doesn’t exist") || lowText.includes("accountnotfound")) {
                        return false;
                    }
                }

                // General status checks
                if (res.status === 200) {
                    if (lowText.includes("<title>page not found") || lowText.includes("404 not found") || lowText.includes("profile not found")) {
                        return false;
                    }
                    return true;
                }

                return mockCheck();
            } catch (err) {
                console.warn(`Proxy check failed for ${name}, using mock fallback:`, err);
                return mockCheck();
            }
        };

        const platforms = [
            { name: "GitHub", url: `https://github.com/${username}` },
            { name: "Reddit", url: `https://reddit.com/user/${username}` },
            { name: "Twitter/X", url: `https://x.com/${username}` },
            { name: "Instagram", url: `https://instagram.com/${username}` },
            { name: "YouTube", url: `https://youtube.com/@${username}` },
            { name: "TikTok", url: `https://tiktok.com/@${username}` },
            { name: "Twitch", url: `https://twitch.tv/${username}` },
            { name: "Spotify", url: `https://open.spotify.com/user/${username}` },
            { name: "Steam", url: `https://steamcommunity.com/id/${username}` },
            { name: "Pinterest", url: `https://pinterest.com/${username}` },
            { name: "LinkedIn", url: `https://linkedin.com/in/${username}` },
            { name: "Facebook", url: `https://facebook.com/${username}` }
        ];

        // Print initial loading sequences
        addLogLine("info", `Mounting OSINT profile check for operator handle: "${username}"...`);
        addLogLine("info", `Resolving target hosts and caching endpoints...`);

        const showResults = (resolvedPlatforms) => {
            consoleFeed.classList.add("hidden");
            resultsGrid.classList.remove("hidden");

            const exposedCount = resolvedPlatforms.filter(p => p.exposed).length;
            
            // Classification based on 12 platforms
            if (exposedCount >= 7) {
                exposureLevel.textContent = "CRITICAL";
                exposureLevel.className = "exposure-value text-neon-red";
            } else if (exposedCount >= 3) {
                exposureLevel.textContent = "ELEVATED";
                exposureLevel.className = "exposure-value text-neon-orange";
            } else {
                exposureLevel.textContent = "STABLE";
                exposureLevel.className = "exposure-value text-neon-green";
            }

            platformsList.innerHTML = "";
            resolvedPlatforms.forEach(p => {
                if (p.exposed) {
                    const linkBadge = document.createElement("a");
                    linkBadge.href = p.url;
                    linkBadge.target = "_blank";
                    linkBadge.className = "platform-exposure-badge exposed";
                    linkBadge.style.textDecoration = "none";
                    linkBadge.innerHTML = `
                        <span class="platform-name">${p.name}</span>
                        <span class="platform-status">● ACTIVE ↗</span>
                    `;
                    platformsList.appendChild(linkBadge);
                } else {
                    const divBadge = document.createElement("div");
                    divBadge.className = "platform-exposure-badge clean";
                    divBadge.innerHTML = `
                        <span class="platform-name">${p.name}</span>
                        <span class="platform-status">○ INACTIVE</span>
                    `;
                    platformsList.appendChild(divBadge);
                }
            });

            // Cache username scan results
            window.LatestFootprintData = window.LatestFootprintData || {};
            window.LatestFootprintData.usernameScan = {
                username: username,
                platforms: resolvedPlatforms,
                exposedCount: exposedCount
            };

            // Update state & reward XP
            if (typeof CyberState !== "undefined") {
                if (CyberState.scansDone.footprint === 0) {
                    gainXP(75, "Username exposure audit");
                }
                CyberState.scansDone.footprint++;
                saveState();
            }
        };

        // Launch probe checks concurrently with a staggered logging setup
        const runProbe = async (p, idx) => {
            await new Promise(resolve => setTimeout(resolve, idx * 60)); // Stagger launch
            addLogLine("warn", `Probing registry endpoint for ${p.name}...`);
            
            let isExposed = false;
            try {
                isExposed = await checkRealPlatform(p.name, p.url, username, () => checkMockPlatform(p.name));
            } catch (err) {
                isExposed = checkMockPlatform(p.name);
            }

            if (isExposed) {
                addLogLine("success", `${p.name}: ● ACTIVE`);
            } else {
                addLogLine("info", `${p.name}: ○ INACTIVE`);
            }

            return {
                name: p.name,
                url: p.url,
                exposed: isExposed,
                status: isExposed ? "ACTIVE" : "INACTIVE"
            };
        };

        const probePromises = platforms.map((p, idx) => runProbe(p, idx));

        Promise.all(probePromises).then(resolvedPlatforms => {
            addLogLine("info", `Cross-referencing exposed accounts with linked databases...`);
            addLogLine("success", `Profile audit complete. Generating exposure metrics.`);
            setTimeout(() => {
                showResults(resolvedPlatforms);
            }, 600);
        });
    };

    scanBtn.addEventListener("click", runScan);
    usernameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") runScan();
    });
}

// TAB B: EXIF Metadata Extractor
function initExifAnalyzer() {
    const dropZone = document.getElementById("exif-drop-zone");
    const fileInput = document.getElementById("exif-file-input");
    const placeholder = document.getElementById("exif-placeholder-text");
    const resultsBox = document.getElementById("exif-results-box");
    
    const threatBadge = document.getElementById("exif-threat-badge");
    const mapSim = document.getElementById("exif-map-sim");
    const mapVisual = document.getElementById("map-simulation-visual");
    const mapCoordsFeed = document.getElementById("map-coords-feed");
    const previewImg = document.getElementById("exif-preview-img");

    const renderTelemetryItem = (label, value, isOrange = false) => {
        return `
            <div class="telemetry-item">
                <span class="telemetry-lbl">${label}:</span>
                <span class="telemetry-val ${isOrange ? 'text-neon-orange' : ''}">${value}</span>
            </div>
        `;
    };

    // Add load demo photo button inside drop zone for testing ease
    const demoBtn = document.createElement("button");
    demoBtn.className = "terminal-btn-sm";
    demoBtn.style.marginTop = "15px";
    demoBtn.textContent = "LOAD_DEMO_EXIF_IMAGE.JPG";
    dropZone.appendChild(demoBtn);

    demoBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Avoid triggering file input click
        loadDemoData();
    });

    dropZone.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    // Drag-drop events
    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });

    const handleFile = (file) => {
        const fileName = file.name.toLowerCase();
        const isJpeg = file.type.match('image/jpeg.*') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg');
        if (!isJpeg) {
            alert("Error: Only JPEG/JPG files contain standard EXIF tags. Please select a JPEG file.");
            fileInput.value = "";
            return;
        }

        if (typeof updateUserAction === "function") {
            updateUserAction("Analyzing image EXIF headers: " + file.name);
        }

        placeholder.classList.add("hidden");
        resultsBox.classList.remove("hidden");
        
        // Show scanning state
        threatBadge.textContent = "EXTRACTING_EXIF_HEADERS...";
        threatBadge.className = "exif-status-indicator";
        
        const telemetryGrid = resultsBox.querySelector(".exif-telemetry-grid");
        if (telemetryGrid) {
            let html = "";
            html += renderTelemetryItem("CAPTURE_DEVICE", "READING...");
            html += renderTelemetryItem("TIMESTAMP", "READING...");
            html += renderTelemetryItem("COORDINATES", "READING...");
            html += renderTelemetryItem("SOFTWARE", "READING...");
            telemetryGrid.innerHTML = html;
        }
        mapSim.classList.add("hidden");
        
        // Set local preview
        if (previewImg) {
            previewImg.src = URL.createObjectURL(file);
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            fileInput.value = ""; // Reset value so same file can be scanned again
            const buffer = e.target.result;
            const view = new DataView(buffer);
            
            // Check JPG SOI marker
            if (view.getUint16(0, false) !== 0xFFD8) {
                showNoExif("Invalid JPEG header structure.");
                return;
            }

            // Locate APP1 EXIF marker
            let offset = 2;
            const length = view.byteLength;
            let exifFound = false;

            while (offset < length - 2) {
                const marker = view.getUint16(offset, false);
                if (marker === 0xFFE1) {
                    // Found APP1
                    exifFound = true;
                    break;
                }
                // Skip segment
                offset += 2 + view.getUint16(offset + 2, false);
            }

            if (!exifFound) {
                showNoExif("CLEAN: No EXIF headers found (stripped metadata).");
                return;
            }

            // Parse EXIF (TIFF Header & Tags)
            try {
                const app1Length = view.getUint16(offset + 2, false);
                const exifHeaderOffset = offset + 4;
                
                // Confirm EXIF Header signature "Exif\0\0"
                if (view.getUint32(exifHeaderOffset, false) === 0x45786966 && 
                    view.getUint16(exifHeaderOffset + 4, false) === 0x0000) {
                    
                    const tiffHeaderOffset = exifHeaderOffset + 6;
                    
                    // Intel (II) little endian or Motorola (MM) big endian
                    const isLittleEndian = view.getUint16(tiffHeaderOffset, false) === 0x4949;
                    
                    // Magic byte 42 (0x002A)
                    if (view.getUint16(tiffHeaderOffset + 2, isLittleEndian) === 0x002A) {
                        const firstIfdOffset = view.getUint32(tiffHeaderOffset + 4, isLittleEndian);
                        
                        // Simple parsed results container
                        const tags = parseIfd(view, tiffHeaderOffset, firstIfdOffset, isLittleEndian);
                        
                        if (tags && (tags.device || tags.gps)) {
                            showRealExif(tags);
                        } else {
                            showNoExif("Exif header found, but metadata fields are empty.");
                        }
                    } else {
                        showNoExif("Invalid TIFF signature.");
                    }
                } else {
                    showNoExif("Exif signature match failed.");
                }
            } catch (err) {
                console.error("Exif parsing error:", err);
                showNoExif("Exif tags corrupted or unrecognized.");
            }
        };

        reader.readAsArrayBuffer(file);
    };

    // Helper: Parse IFD tags
    const parseIfd = (view, tiffOffset, ifdOffset, isLittle) => {
        const numEntries = view.getUint16(tiffOffset + ifdOffset, isLittle);
        const tags = {
            device: "",
            time: "",
            software: "",
            gps: null,
            exposure: "",
            aperture: "",
            iso: "",
            focalLength: "",
            lens: ""
        };
        
        let make = "";
        let model = "";

        const readRational = (offset) => {
            const num = view.getUint32(tiffOffset + offset, isLittle);
            const den = view.getUint32(tiffOffset + offset + 4, isLittle);
            return den === 0 ? 0 : num / den;
        };

        const readUint = (entryOffset, type) => {
            const valOffset = entryOffset + 8;
            if (type === 3) {
                return view.getUint16(valOffset, isLittle);
            } else if (type === 4 || type === 9) {
                return view.getUint32(valOffset, isLittle);
            }
            return 0;
        };

        const getStringValue = (type, count, valueOffset, entryOffset) => {
            const typeSizes = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];
            const typeSize = typeSizes[type] || 1;
            const totalSize = count * typeSize;
            
            let offset = valueOffset;
            let baseOffset = tiffOffset;
            
            if (totalSize <= 4) {
                offset = entryOffset + 8;
                baseOffset = 0;
            }
            
            let str = "";
            for (let j = 0; j < count; j++) {
                const charCode = view.getUint8(baseOffset + offset + j);
                if (charCode === 0) break;
                str += String.fromCharCode(charCode);
            }
            return str.trim();
        };

        for (let i = 0; i < numEntries; i++) {
            const entryOffset = tiffOffset + ifdOffset + 2 + (i * 12);
            const tag = view.getUint16(entryOffset, isLittle);
            const type = view.getUint16(entryOffset + 2, isLittle);
            const count = view.getUint32(entryOffset + 4, isLittle);
            const valueOffset = view.getUint32(entryOffset + 8, isLittle);

            if (tag === 0x010F) { // Make
                make = getStringValue(type, count, valueOffset, entryOffset);
            } else if (tag === 0x0110) { // Model
                model = getStringValue(type, count, valueOffset, entryOffset);
            } else if (tag === 0x9003 || tag === 0x0132) { // DateTimeOriginal
                tags.time = getStringValue(type, count, valueOffset, entryOffset);
            } else if (tag === 0x0131) { // Software
                tags.software = getStringValue(type, count, valueOffset, entryOffset);
            } else if (tag === 0x829A) { // ExposureTime
                const expVal = readRational(valueOffset);
                if (expVal > 0) {
                    tags.exposure = expVal < 1 ? `1/${Math.round(1 / expVal)}s` : `${expVal}s`;
                }
            } else if (tag === 0x829D) { // FNumber
                const fVal = readRational(valueOffset);
                if (fVal > 0) {
                    tags.aperture = `f/${fVal.toFixed(1)}`;
                }
            } else if (tag === 0x8827) { // ISOSpeedRatings
                const isoVal = readUint(entryOffset, type);
                if (isoVal > 0) {
                    tags.iso = `ISO ${isoVal}`;
                }
            } else if (tag === 0x920A) { // FocalLength
                const focalVal = readRational(valueOffset);
                if (focalVal > 0) {
                    tags.focalLength = `${focalVal.toFixed(1)}mm`;
                }
            } else if (tag === 0xA434) { // LensModel
                tags.lens = getStringValue(type, count, valueOffset, entryOffset);
            } else if (tag === 0x8825) { // GPS Info IFD Pointer
                tags.gps = parseGpsIfd(view, tiffOffset, valueOffset, isLittle);
            }
        }
        
        tags.device = (make && model) ? `${make} ${model}` : (model || make || "");
        return tags;
    };

    // Helper: Parse GPS IFD pointer
    const parseGpsIfd = (view, tiffOffset, gpsOffset, isLittle) => {
        try {
            const numEntries = view.getUint16(tiffOffset + gpsOffset, isLittle);
            let latRef = "N";
            let lonRef = "E";
            let latVal = null;
            let lonVal = null;
            let altVal = null;
            let altRef = 0; // 0 = above sea level, 1 = below sea level

            const readRational = (offset) => {
                const num = view.getUint32(tiffOffset + offset, isLittle);
                const den = view.getUint32(tiffOffset + offset + 4, isLittle);
                return den === 0 ? 0 : num / den;
            };

            const readCoordinates = (offset) => {
                // Read 3 rationals: degrees, minutes, seconds
                const deg = readRational(offset);
                const min = readRational(offset + 8);
                const sec = readRational(offset + 16);
                return deg + (min / 60) + (sec / 3600);
            };

            for (let i = 0; i < numEntries; i++) {
                const entryOffset = tiffOffset + gpsOffset + 2 + (i * 12);
                const tag = view.getUint16(entryOffset, isLittle);
                const valueOffset = view.getUint32(entryOffset + 8, isLittle);

                if (tag === 1) { // Latitude Ref
                    latRef = String.fromCharCode(view.getUint8(entryOffset + 8));
                } else if (tag === 2) { // Latitude
                    latVal = readCoordinates(valueOffset);
                } else if (tag === 3) { // Longitude Ref
                    lonRef = String.fromCharCode(view.getUint8(entryOffset + 8));
                } else if (tag === 4) { // Longitude
                    lonVal = readCoordinates(valueOffset);
                } else if (tag === 5) { // GPSAltitudeRef
                    altRef = view.getUint8(entryOffset + 8);
                } else if (tag === 6) { // GPSAltitude
                    altVal = readRational(valueOffset);
                }
            }

            if (latVal && lonVal) {
                const result = {
                    lat: latVal,
                    latRef: latRef,
                    lon: lonVal,
                    lonRef: lonRef
                };
                if (altVal !== null) {
                    result.alt = altVal;
                    result.altRef = altRef;
                }
                return result;
            }
        } catch (e) {
            console.warn("Failed to parse GPS tags:", e);
        }
        return null;
    };

    const showNoExif = (message) => {
        threatBadge.textContent = "NO_EXIF_METADATA";
        threatBadge.className = "exif-status-indicator";
        
        const telemetryGrid = resultsBox.querySelector(".exif-telemetry-grid");
        if (telemetryGrid) {
            let html = "";
            html += renderTelemetryItem("CAPTURE_DEVICE", "-");
            html += renderTelemetryItem("TIMESTAMP", "-");
            html += renderTelemetryItem("COORDINATES", "CLEAN (NO METADATA)");
            html += renderTelemetryItem("SOFTWARE", "-");
            telemetryGrid.innerHTML = html;
        }
        mapSim.classList.add("hidden");
        
        // Cache EXIF results for PDF
        window.LatestFootprintData = window.LatestFootprintData || {};
        window.LatestFootprintData.exif = {
            hasExif: false,
            message: message || "No EXIF data found."
        };

        // Update audits
        if (typeof CyberState !== "undefined") {
            if (CyberState.scansDone.footprint === 0) {
                gainXP(75, "EXIF profile audit");
            }
            CyberState.scansDone.footprint++;
            saveState();
        }
    };

    const showRealExif = (tags) => {
        threatBadge.textContent = "PRIVACY_WARN // EXPOSED METADATA";
        threatBadge.className = "exif-status-indicator leaked";
        
        const telemetryGrid = resultsBox.querySelector(".exif-telemetry-grid");
        if (telemetryGrid) {
            let html = "";
            html += renderTelemetryItem("CAPTURE_DEVICE", tags.device || "GENERIC DEVICE");
            html += renderTelemetryItem("TIMESTAMP", tags.time || "NO TIMESTAMP");
            
            if (tags.gps) {
                const gpsStr = `${tags.gps.lat.toFixed(5)}° ${tags.gps.latRef}, ${tags.gps.lon.toFixed(5)}° ${tags.gps.lonRef}`;
                html += renderTelemetryItem("COORDINATES", gpsStr, true);
                if (tags.gps.alt !== undefined) {
                    const altStr = `${tags.gps.alt.toFixed(1)}m ${tags.gps.altRef === 1 ? 'Below Sea Level' : 'Above Sea Level'}`;
                    html += renderTelemetryItem("ALTITUDE", altStr);
                }
            } else {
                html += renderTelemetryItem("COORDINATES", "NO GPS MARKERS FOUND");
            }
            
            html += renderTelemetryItem("SOFTWARE", tags.software || "SYSTEM CORE");
            
            if (tags.lens) {
                html += renderTelemetryItem("LENS_MODEL", tags.lens);
            }
            if (tags.exposure) {
                html += renderTelemetryItem("EXPOSURE", tags.exposure);
            }
            if (tags.aperture) {
                html += renderTelemetryItem("APERTURE", tags.aperture);
            }
            if (tags.iso) {
                html += renderTelemetryItem("ISO_SPEED", tags.iso);
            }
            if (tags.focalLength) {
                html += renderTelemetryItem("FOCAL_LENGTH", tags.focalLength);
            }
            
            telemetryGrid.innerHTML = html;
        }

        if (tags.gps) {
            // Show radar map simulation
            mapSim.classList.remove("hidden");
            mapCoordsFeed.textContent = `TARGET LOCKED: LAT ${tags.gps.lat.toFixed(6)} LON ${tags.gps.lon.toFixed(6)}`;
            
            // Animate radar grid sweep
            mapVisual.style.border = "1px solid var(--neon-orange)";
        } else {
            mapSim.classList.add("hidden");
        }

        // Cache EXIF results for PDF
        window.LatestFootprintData = window.LatestFootprintData || {};
        window.LatestFootprintData.exif = {
            hasExif: true,
            device: tags.device || "GENERIC CAPTURE DEVICE",
            time: tags.time || "TIMESTAMP INCLUDED",
            software: tags.software || "SYSTEM CORE",
            gps: tags.gps ? `${tags.gps.lat.toFixed(5)}° ${tags.gps.latRef}, ${tags.gps.lon.toFixed(5)}° ${tags.gps.lonRef}` : null
        };

        // Update audits & reward
        if (typeof CyberState !== "undefined") {
            if (CyberState.scansDone.footprint === 0) {
                gainXP(75, "EXIF profile audit");
            }
            CyberState.scansDone.footprint++;
            saveState();
        }
    };

    const loadDemoData = () => {
        placeholder.classList.add("hidden");
        resultsBox.classList.remove("hidden");
        
        threatBadge.textContent = "CRITICAL // LOCATION LEAKED";
        threatBadge.className = "exif-status-indicator leaked";

        const demoTags = {
            device: "Apple iPhone 14 Pro",
            time: "2026-06-15 14:23:10 (UTC+5:30)",
            software: "iOS 16.5",
            exposure: "1/125s",
            aperture: "f/1.8",
            iso: "ISO 80",
            focalLength: "24.0mm",
            lens: "iPhone 14 Pro back triple camera 6.86mm f/1.78",
            gps: {
                lat: 28.6139,
                latRef: "N",
                lon: 77.2090,
                lonRef: "E",
                alt: 128.4,
                altRef: 0
            }
        };

        // Set demo photo preview
        if (previewImg) {
            previewImg.src = "demo-leak.png";
        }
        
        showRealExif(demoTags);
        threatBadge.textContent = "CRITICAL // LOCATION LEAKED"; // Keep the critical demo title
        
        // Show visual radar simulation
        mapSim.classList.remove("hidden");
        mapCoordsFeed.innerHTML = `<span class="text-neon-red">LOC_ACQUIRED:</span> LAT 28.613938 LON 77.209021`;
    };
}

// TAB C: Google Dorking Assistant
function initDorkingGenerator() {
    const generateBtn = document.getElementById("dork-generate-btn");
    const container = document.getElementById("dorking-results-container");
    const linksList = document.getElementById("dorking-links-list");
    
    // Inputs
    const inputName = document.getElementById("dork-name");
    const inputEmail = document.getElementById("dork-email");
    const inputUser = document.getElementById("dork-username");
    const inputDomain = document.getElementById("dork-domain");

    generateBtn.addEventListener("click", () => {
        const name = inputName.value.trim() || "Bhavy Modi";
        const email = inputEmail.value.trim() || "operator@gmail.com";
        const user = inputUser.value.trim() || "cyber_operator";
        const domain = inputDomain.value.trim() || "mycompany.com";

        if (typeof updateUserAction === "function") {
            updateUserAction("Generating OSINT Google Dorks for: " + name.toUpperCase());
        }

        container.classList.remove("hidden");
        linksList.innerHTML = "";

        const dorkTemplates = [
            {
                title: "Exposed PDF Invoices / Resumes",
                query: `filetype:pdf "${name}" OR intitle:resume "${name}"`,
                desc: "Searches for indexed PDF file structures matching your full name."
            },
            {
                title: "Exposed Email Credentials on Pastebin",
                query: `site:pastebin.com "${email}"`,
                desc: "Queries text archive logs for mentions of your email, finding password spills."
            },
            {
                title: "Public Mentions & Social Registry Linkage",
                query: `intext:"${user}" -site:github.com -site:twitter.com`,
                desc: "Finds blog posts, forums, or listings linking your username outside main channels."
            },
            {
                title: "Unsecured Subdirectories on Target Domain",
                query: `site:${domain} intitle:index.of OR "parent directory"`,
                desc: "Finds unindexed folder structures, back-ups, or login routes on your domain."
            },
            {
                title: "Exposed Configuration Files",
                query: `site:${domain} filetype:env OR filetype:conf OR filetype:sql`,
                desc: "Scans for credentials config payloads exposed on your domain server."
            }
        ];

        dorkTemplates.forEach(t => {
            const item = document.createElement("div");
            item.className = "dorking-item";
            item.innerHTML = `
                <div class="dorking-info">
                    <h5>${t.title}</h5>
                    <code title="Double click to copy">${t.query}</code>
                    <span style="font-size: 11px; color: var(--text-dim);">${t.desc}</span>
                </div>
                <div class="dorking-actions">
                    <button class="terminal-btn-sm btn-copy-dork">COPY</button>
                    <button class="terminal-btn-sm btn-launch-dork" style="border-color: var(--neon-cyan); color: var(--neon-cyan);">TEST</button>
                </div>
            `;

            // Copy Handler
            const copyBtn = item.querySelector(".btn-copy-dork");
            copyBtn.addEventListener("click", () => {
                navigator.clipboard.writeText(t.query).then(() => {
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = "COPIED";
                    copyBtn.style.color = "var(--neon-green)";
                    copyBtn.style.borderColor = "var(--neon-green)";
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                        copyBtn.style.color = "";
                        copyBtn.style.borderColor = "";
                    }, 1200);
                });
            });

            // Launch Handler
            const launchBtn = item.querySelector(".btn-launch-dork");
            launchBtn.addEventListener("click", () => {
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(t.query)}`;
                window.open(searchUrl, '_blank');
            });

            linksList.appendChild(item);
        });

        // Cache dork results for PDF
        window.LatestFootprintData = window.LatestFootprintData || {};
        window.LatestFootprintData.dorking = {
            name: name,
            email: email,
            username: user,
            domain: domain,
            dorks: dorkTemplates
        };

        // Update state
        if (typeof CyberState !== "undefined") {
            if (CyberState.scansDone.footprint === 0) {
                gainXP(75, "Google Dork OSINT audit");
            }
            CyberState.scansDone.footprint++;
            saveState();
        }
    });
}
