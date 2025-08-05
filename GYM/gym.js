// Prevent login if not registered
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.querySelector('#loginPopup .form-container');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        alert('Invalid credentials or not registered.');
        return false;
      }
      // Set current user
      localStorage.setItem('currentUser', email);
      window.location.href = 'dashboard.html';
    });
  }
});
// Save registration info to localStorage on register
document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.querySelector('#registerPopup .form-container');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const gender = document.getElementById('reg-gender').value;
      const phone = document.getElementById('reg-phone').value;
      const password = document.getElementById('reg-password').value;
      // Get users array from localStorage
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      // Check if email already exists
      if (users.some(u => u.email === email)) {
        alert('Email already registered. Please log in.');
        return;
      }
      const user = { name, email, gender, phone, password };
      users.push(user);
      localStorage.setItem('users', JSON.stringify(users));
      // Set current user
      localStorage.setItem('currentUser', email);
      // Optionally, redirect to dashboard after registration
      window.location.href = 'dashboard.html';
    });
  }
});
// (Removed duplicate login redirect. Only registered users can access dashboard.)
function toggleLoginPopup() {
    const loginPopup = document.getElementById('loginPopup');
    loginPopup.classList.toggle('show');
}

function toggleRegisterPopup() {
    const registerPopup = document.getElementById('registerPopup');
    registerPopup.classList.toggle('show');
}
