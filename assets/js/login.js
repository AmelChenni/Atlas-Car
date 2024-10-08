// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDMAzGX_3eIkfFTaz-CdIjTHgxJvle7-g",
  authDomain: "carsales-6433d.firebaseapp.com",
  databaseURL: "https://carsales-6433d-default-rtdb.firebaseio.com",
  projectId: "carsales-6433d",
  storageBucket: "carsales-6433d.appspot.com",
  messagingSenderId: "936369720694",
  appId: "1:936369720694:web:010c3e995aad2d17e8be57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Event listener for the login form
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        await signInWithEmailAndPassword(auth, email, password);

        // Success alert
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Redirecting to admin dashboard...',
          timer: 2000,
          showConfirmButton: false
        });

        // Redirect to admin dashboard after a delay
        setTimeout(() => {
          window.location.href = 'admindash.html';
        }, 2000);

      } catch (error) {
        console.error('Login error:', error);

        // Error alert
        Swal.fire({
          icon: 'error',
          title: 'Login Failed!',
          text: 'Please check your credentials and try again.'
        });
      }

      // Clear inputs
      loginForm.reset();
    });

    // Add enter key event listener for form submission
    loginForm.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        loginForm.querySelector('button[type="submit"]').click();
      }
    });
  } else {
    console.error("Login form not found!");
  }
});
