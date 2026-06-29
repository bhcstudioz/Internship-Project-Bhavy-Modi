/* Cyber Ops Gateway - Firebase Configuration & Initialization Loader */

// Place your Firebase configuration object here if you wish to hardcode it:
let firebaseConfig = {
  apiKey: "AIzaSyC31yvKDcFQ1SLk2WP9LK-Hxa8eBwiRys4",
  authDomain: "internship-project-40e69.firebaseapp.com",
  databaseURL: "https://internship-project-40e69-default-rtdb.firebaseio.com",
  projectId: "internship-project-40e69",
  storageBucket: "internship-project-40e69.firebasestorage.app",
  messagingSenderId: "499716627092",
  appId: "1:499716627092:web:e6ec11c41b80341b543281",
  measurementId: "G-80KX5JS5CB"
};

// Check if a configuration was saved in local storage (dynamic UI setup)
function getActiveFirebaseConfig() {
    // If the hardcoded config has an apiKey, use it
    if (firebaseConfig && firebaseConfig.apiKey) {
        return firebaseConfig;
    }
    
    // Otherwise, check if user pasted a config in the web interface and stored it
    const storedConfig = localStorage.getItem("cyber_ops_firebase_config");
    if (storedConfig) {
        try {
            return JSON.parse(storedConfig);
        } catch (e) {
            console.error("Failed to parse stored Firebase config:", e);
        }
    }
    return null;
}

// Initialize Firebase dynamically if config is available
function initializeFirebaseConnection() {
    if (typeof firebase === 'undefined') {
        console.error("Firebase SDK libraries failed to load. Check network connection.");
        return false;
    }
    const config = getActiveFirebaseConfig();
    if (!config || !config.apiKey) {
        console.warn("Firebase configuration not found or invalid. Gateway setup required.");
        return false;
    }
    
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(config);
            // Enable offline persistence for Firestore
            firebase.firestore().enablePersistence().catch(err => {
                if (err.code == 'failed-precondition') {
                    console.warn("Firestore persistence failed: Multiple tabs open.");
                } else if (err.code == 'unimplemented') {
                    console.warn("Firestore persistence not supported in this browser.");
                }
            });
            console.log("Firebase initialized successfully.");
        }
        return true;
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        return false;
    }
}
