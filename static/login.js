const firebaseConfig = {
    apiKey: "AIzaSyCzY05cZ9e-IKl16IEjmqho9PYc-zkcvs4",
    authDomain: "research-paper-finder-db.firebaseapp.com",
    projectId: "research-paper-finder-db",
    storageBucket: "research-paper-finder-db.firebasestorage.app",
    messagingSenderId: "173791261393",
    appId: "1:173791261393:web:34416e6f26dd65dc170bf0",
    measurementId: "G-EL2GCC6V3H"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function register() {
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Email and password cannot be empty.");
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            alert("Registration successful! Please login.");
            window.location.href = "/login";
        })
        .catch((error) => {
            alert(error.message);
        });
}

function login() {
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Email and password cannot be empty.");
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("User logged in:", user.email);

            return fetch('/set_session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email })
            });
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                console.log("✅ Session set successfully. Redirecting...");
                window.location.href = "/rsp";  // Redirect to the research paper page
            } else {
                console.error("❌ Session setting failed:", data);
                alert("Session setting failed. Please try again.");
            }
        })
        .catch((error) => {
            console.error("❌ Error logging in:", error.code, error.message);
            alert("Invalid credentials! Please try again.");
        });
}
