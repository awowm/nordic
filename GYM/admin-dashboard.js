// Reset all users functionality
document.addEventListener('DOMContentLoaded', function() {
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm('Are you sure you want to delete ALL users? This cannot be undone.')) {
        localStorage.removeItem('users');
        localStorage.removeItem('currentUser');
        // Optionally, reload the page to update the UI
        window.location.reload();
      }
    });
  }
});
// Admin Dashboard Logic

document.addEventListener('DOMContentLoaded', function() {
  // Show all registered users (multi-user)
  const usersList = document.getElementById('usersList');
  let html = '';
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.length > 0) {
    users.forEach(user => {
      let membership = 'None';
      let expiry = '';
      if (user.membershipType) {
        if (user.membershipType === 'walkin') membership = 'Walk-in (1 day)';
        else if (user.membershipType === 'oneweek') membership = 'One Week';
        else if (user.membershipType === 'onemonth') membership = 'One Month';
      }
      if (user.membershipExpiry) {
        const d = new Date(user.membershipExpiry);
        expiry = d.toISOString().split('T')[0];
      }
      html += `<div class="admin-user-card" style="margin-bottom:16px;">
        <strong>Name:</strong> ${user.name || ''}<br>
        <strong>Email:</strong> ${user.email || ''}<br>
        <strong>Membership:</strong> ${membership}<br>
        <strong>Expiry:</strong> ${expiry || 'N/A'}<br>
        <strong>Contact:</strong> ${user.phone || ''}
      </div>`;
    });
  } else {
    html = '<em>No registered users found.</em>';
  }
  usersList.innerHTML = html;

  // Simple calendar for admin
  renderAdminCalendar();

  // Download CSV functionality
  const downloadCsvBtn = document.getElementById('downloadCsvBtn');
  if (downloadCsvBtn) {
    downloadCsvBtn.addEventListener('click', function() {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (!users.length) {
        alert('No users to export.');
        return;
      }
      // Prepare CSV header and rows
      const header = ['Name','Email','Gender','Phone','Membership','Expiry'];
      const rows = users.map(user => {
        let membership = 'None';
        if (user.membershipType === 'walkin') membership = 'Walk-in (1 day)';
        else if (user.membershipType === 'oneweek') membership = 'One Week';
        else if (user.membershipType === 'onemonth') membership = 'One Month';
        let expiry = '';
        if (user.membershipExpiry) {
          const d = new Date(user.membershipExpiry);
          expiry = d.toISOString().split('T')[0];
        }
        return [
          user.name || '',
          user.email || '',
          user.gender || '',
          user.phone || '',
          membership,
          expiry
        ].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',');
      });
      const csvContent = [header.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Log-out
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'gym.html';
    });
  }
});

function renderAdminCalendar() {
  const calendar = document.getElementById('adminCalendar');
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
  for (let day = 1; day <= daysInMonth; day++) {
    if ((firstDay + day - 1) % 7 === 0 && day !== 1) html += '</tr><tr>';
    html += `<td>${day}</td>`;
  }
  html += '</tr></table>';
  calendar.innerHTML = html;
}
