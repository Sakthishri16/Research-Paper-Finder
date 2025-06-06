<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #4A90E2, #1446A0);
            color: #333;
        }

        .container {
            background: #ffffff;
            padding: 2.5rem;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 420px;
            text-align: center;
        }

        h2 {
            margin-bottom: 1.5rem;
            color: #1446A0;
            font-size: 28px;
            font-weight: 600;
        }

        .form-group {
            margin-bottom: 1.5rem;
            text-align: left;
        }

        .form-group label {
            display: block;
            font-weight: 500;
            margin-bottom: 8px;
            color: #333;
            font-size: 15px;
        }

        .form-control {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: all 0.3s ease;
            background-color: #f9f9f9;
        }

        .form-control:focus {
            border-color: #4A90E2;
            outline: none;
            box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
            background-color: #fff;
        }

        .btn {
            background: #1446A0;
            color: white;
            padding: 14px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
            font-weight: 600;
            margin-top: 8px;
        }

        .btn:hover {
            background: #0d3a8a;
            transform: translateY(-2px);
        }

        .footer-text {
            margin-top: 1.5rem;
            font-size: 14px;
            color: #666;
        }

        .footer-text a {
            color: #1446A0;
            text-decoration: none;
            font-weight: 600;
        }
    </style>
    <script src="https://www.gstatic.com/firebasejs/9.6.7/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.7/firebase-auth-compat.js"></script>
    <script>
        const firebaseConfig = {
            apiKey: "",
            authDomain: "",
            projectId: "",
            storageBucket: "",
            messagingSenderId: "",
            appId: ""
        };

        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();

        async function login() {
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                // 1. Sign in with Firebase
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                console.log("Firebase login success");
                
                // 2. Get ID token
                const idToken = await userCredential.user.getIdToken();
                console.log("Got ID token");
                
                // 3. Verify with backend
                const response = await fetch('/verify_token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: idToken })
                });
                
                if (!response.ok) {
                    throw new Error('Backend verification failed');
                }
                console.log("Backend verification success");
                
                // 4. Check session
                const sessionCheck = await fetch('/verify_session');
                if (!sessionCheck.ok) {
                    throw new Error('Session not set');
                }
                console.log("Session check success");
                
                // 5. Redirect
                window.location.href = "/rsp";
                
            } catch (error) {
                console.error("Login error:", error);
                alert(error.message);
            }
        }

        // Handle Enter key
        document.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    </script>
</head>
<body>
    <div class="container">
        <h2>Login</h2>
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" class="form-control" placeholder="Enter your email">
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" class="form-control" placeholder="Enter your password">
        </div>
        <button onclick="login()" class="btn">Login</button>
        <p class="footer-text">Don't have an account? <a href="/register">Register</a></p>
    </div>
</body>
</html>
