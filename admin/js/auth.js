// Import Firebase modules
import { auth } from '../../js/firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut as firebaseSignOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// Check authentication state
onAuthStateChanged(auth, (user) => {
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.endsWith('login.html');
    const isDashboardPage = currentPath.endsWith('dashboard.html');

    if (user) {
        // User is signed in
        if (isLoginPage) {
            // Redirect to dashboard if on login page
            window.location.href = 'dashboard.html';
        }
    } else {
        // No user is signed in
        if (isDashboardPage) {
            // Redirect to login if on dashboard
            window.location.href = 'login.html';
        }
    }
});

// Handle login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorText = document.getElementById('loginError');
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Successful login will trigger onAuthStateChanged
        } catch (error) {
            console.error('Login error:', error);
            errorText.textContent = 'Invalid email or password';
            errorText.style.display = 'block';
        }
    });
}

// Handle sign out
export async function signOut() {
    try {
        await firebaseSignOut(auth);
        // Successful logout will trigger onAuthStateChanged
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Failed to sign out', 'error');
    }
}
