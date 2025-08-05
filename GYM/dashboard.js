// GCash Payment Simulation and QR Code Generation
document.addEventListener('DOMContentLoaded', function() {
  const gcashBtn = document.getElementById('gcashPayBtn');
  const qrSection = document.getElementById('qrSection');
  const qrCanvas = document.getElementById('userQrCode');
  const qrInfo = document.getElementById('qrInfo');
  if (gcashBtn) {
    gcashBtn.addEventListener('click', function() {
      const type = membershipType.value;
      if (!type) {
        alert('Please select a membership type first.');
        return;
      }
      // Simulate GCash payment
      if (confirm('Simulate GCash payment? (In production, redirect to GCash gateway)')) {
        // On payment success, update membership and show QR
        const expiry = getExpiryDate(type);
        updateCurrentUser({ membershipType: type, membershipExpiry: expiry.toISOString() });
        membershipStatus.innerHTML = `<strong>Membership active!</strong><br>Expiry Date: <span id="expiryDate">${formatDate(expiry)}</span>`;
        membershipStatus.style.display = 'block';
        // Generate QR code for gym access (encode user email + expiry)
        const user = getCurrentUser();
        const qrData = JSON.stringify({
          gym: 'Sison Strength',
          email: user.email,
          name: user.name,
          expiry: expiry.toISOString()
        });
        if (window.QRious && qrCanvas) {
          const qr = new QRious({
            element: qrCanvas,
            value: qrData,
            size: 180
          });
        }
        if (qrSection) {
          qrSection.style.display = 'block';
        }
        if (qrInfo) {
          qrInfo.textContent = `Show this QR code at the gym entrance. Expires: ${formatDate(expiry)}`;
        }
        renderCalendar();
      }
    });
  }
});
// Membership Payment Logic (Multi-user)
const membershipForm = document.getElementById('membershipForm');
const membershipType = document.getElementById('membershipType');
const membershipStatus = document.getElementById('membershipStatus');

function getExpiryDate(type) {
  const now = new Date();
  if (type === 'walkin') {
    now.setDate(now.getDate() + 1);
  } else if (type === 'oneweek') {
    now.setDate(now.getDate() + 7);
  } else if (type === 'onemonth') {
    now.setMonth(now.getMonth() + 1);
  }
  return now;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}
function setUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
function getCurrentUserEmail() {
  return localStorage.getItem('currentUser');
}
function getCurrentUser() {
  const users = getUsers();
  const email = getCurrentUserEmail();
  return users.find(u => u.email === email);
}
function updateCurrentUser(newData) {
  const users = getUsers();
  const email = getCurrentUserEmail();
  const idx = users.findIndex(u => u.email === email);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...newData };
    setUsers(users);
  }
}

if (membershipForm) {
  // Change button text if already availed
  function updateMembershipButton() {
    const user = getCurrentUser();
    const btn = membershipForm.querySelector('button[type="submit"]');
    if (user && user.membershipExpiry) {
      btn.textContent = 'Renew Membership';
    } else {
      btn.textContent = 'Pay';
    }
  }
  updateMembershipButton();
  membershipForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const type = membershipType.value;
    if (!type) return;
    const expiry = getExpiryDate(type);
    updateCurrentUser({ membershipType: type, membershipExpiry: expiry.toISOString() });
    membershipStatus.innerHTML = `<strong>Membership active!</strong><br>Expiry Date: <span id="expiryDate">${formatDate(expiry)}</span>`;
    membershipStatus.style.display = 'block';
    updateMembershipButton();
    renderCalendar();
  });
}
// Profile Form Logic (Multi-user)
document.addEventListener('DOMContentLoaded', function() {
  const membershipSection = document.getElementById('membership-section');
  const profileForm = document.getElementById('profileForm');
  const profileDisplay = document.getElementById('profileDisplay');
  const deleteBtn = document.getElementById('deleteAccountBtn');
  const user = getCurrentUser();
  if (!user && membershipSection) {
    membershipSection.style.display = 'none';
  } else if (membershipSection) {
    membershipSection.style.display = '';
  }
  if (user) {
    // Show read-only profile
    let html = '';
    if (user.photo) {
      html += `<img src="${user.photo}" alt="Profile Photo" style="max-width:120px;max-height:120px;border-radius:50%;margin-bottom:12px;">`;
    }
    html += `<h4>Profile Info</h4>`;
    html += `<p><strong>Name:</strong> ${user.name || ''}</p>`;
    html += `<p><strong>Email:</strong> ${user.email || ''}</p>`;
    html += `<p><strong>Gender:</strong> ${user.gender || ''}</p>`;
    html += `<p><strong>Phone:</strong> ${user.phone || ''}</p>`;
    profileDisplay.innerHTML = html;
    profileDisplay.style.display = 'block';
    if (profileForm) profileForm.style.display = 'none';
    if (deleteBtn) deleteBtn.style.display = 'inline-block';
  } else {
    // No registration, show editable form
    if (profileDisplay) profileDisplay.style.display = 'none';
    if (profileForm) profileForm.style.display = 'block';
    if (deleteBtn) deleteBtn.style.display = 'none';
  }
  renderCalendar();
});

// Save registration info to localStorage (for current user)
window.saveRegistrationInfo = function(userData) {
  const email = getCurrentUserEmail();
  if (!email) return;
  const users = getUsers();
  const idx = users.findIndex(u => u.email === email);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...userData };
    setUsers(users);
  }
}

// Delete account logic (Multi-user)
const deleteBtn = document.getElementById('deleteAccountBtn');
if (deleteBtn) {
  deleteBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      const email = getCurrentUserEmail();
      let users = getUsers();
      users = users.filter(u => u.email !== email);
      setUsers(users);
      localStorage.removeItem('currentUser');
      window.location.href = 'gym.html'; // Log out after deletion
    }
  });
}


const profileForm = document.getElementById('profileForm');
const profileDisplay = document.getElementById('profileDisplay');
const profilePhotoInput = document.getElementById('profilePhoto');
const logoutBtn = document.getElementById('logoutBtn');

if (profileForm) {
  profileForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const gender = document.getElementById('profileGender').value;
    const phone = document.getElementById('profilePhone').value;
    let photoHTML = '';
    let photoData = '';
    if (profilePhotoInput && profilePhotoInput.files && profilePhotoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        photoData = evt.target.result;
        photoHTML = `<img src="${photoData}" alt="Profile Photo" style="max-width:120px;max-height:120px;border-radius:50%;margin-bottom:12px;">`;
        profileDisplay.innerHTML = `
          ${photoHTML}
          <h4>Profile Info</h4>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Gender:</strong> ${gender}</p>
          <p><strong>Phone:</strong> ${phone}</p>
        `;
        profileDisplay.style.display = 'block';
        profileForm.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
        // Save to localStorage (for current user)
        window.saveRegistrationInfo({ name, email, gender, phone, photo: photoData });
      };
      reader.readAsDataURL(profilePhotoInput.files[0]);
    } else {
      profileDisplay.innerHTML = `
        <h4>Profile Info</h4>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Gender:</strong> ${gender}</p>
        <p><strong>Phone:</strong> ${phone}</p>
      `;
      profileDisplay.style.display = 'block';
      profileForm.style.display = 'none';
      if (deleteBtn) deleteBtn.style.display = 'inline-block';
      // Save to localStorage (for current user)
      window.saveRegistrationInfo({ name, email, gender, phone });
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'gym.html';
  });
}

// Simple Calendar (Current Month, Multi-user)
function renderCalendar() {
  const calendar = document.getElementById('calendar');
  if (!calendar) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let html = `<h4>${monthNames[month]} ${year}</h4>`;
  html += '<table class="calendar-table"><tr>';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let d of days) html += `<th>${d}</th>`;
  html += '</tr><tr>';
  for (let i = 0; i < firstDay; i++) html += '<td></td>';
  const user = getCurrentUser();
  let expiryDay = null, expiryMonth = null, expiryYear = null;
  if (user && user.membershipExpiry) {
    const expiryDate = new Date(user.membershipExpiry);
    expiryDay = expiryDate.getDate();
    expiryMonth = expiryDate.getMonth();
    expiryYear = expiryDate.getFullYear();
  }
  for (let day = 1; day <= daysInMonth; day++) {
    if ((firstDay + day - 1) % 7 === 0 && day !== 1) html += '</tr><tr>';
    let highlight = '';
    if (expiryDay === day && expiryMonth === month && expiryYear === year) {
      highlight = ' style="background:#d7263d;color:#fff;font-weight:bold;" title="Membership Expiry"';
    }
    html += `<td${highlight}>${day}</td>`;
  }
  html += '</tr></table>';
  calendar.innerHTML = html;
  // Show expiry date in status if exists
  if (user && user.membershipExpiry && membershipStatus) {
    const expiryDate = new Date(user.membershipExpiry);
    membershipStatus.innerHTML = `<strong>Membership active!</strong><br>Expiry Date: <span id="expiryDate">${formatDate(expiryDate)}</span>`;
    membershipStatus.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', renderCalendar);
