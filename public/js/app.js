/* =====================================================
   Travel & Tour Booking System - app.js
   Aaron De Souza (24CE202) | PCCE Sem V 2026-27
   ===================================================== */

const API = '';  // same-origin
let currentUser = null;
let authToken = null;
let selectedPackageId = null;
let selectedBookingId = null;
let currentDestModalId = null;
let allHotels = [];
let allTransport = [];
let allPackages = [];

/* ======================================================
   INIT
====================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const savedToken = localStorage.getItem('travelToken');
  const savedUser  = localStorage.getItem('travelUser');
  if (savedToken && savedUser) {
    authToken   = savedToken;
    currentUser = JSON.parse(savedUser);
    updateNavForUser();
  }
  showSection('explore');
  prefetchHelperData();
});

async function prefetchHelperData() {
  try {
    const [hRes, tRes, pRes] = await Promise.all([
      fetch(`${API}/api/admin/hotels`, authHeaders()),
      fetch(`${API}/api/admin/transport`, authHeaders()),
      fetch(`${API}/api/packages`)
    ]);
    if (hRes.ok)  allHotels    = await hRes.json();
    if (tRes.ok)  allTransport = await tRes.json();
    if (pRes.ok)  allPackages  = await pRes.json();
  } catch(e) { /* silent */ }
}

/* ======================================================
   NAVIGATION
====================================================== */
function showSection(name) {
  document.querySelectorAll('.app-section').forEach(s => s.classList.add('d-none'));
  const sec = document.getElementById('section-' + name);
  if (sec) {
    sec.classList.remove('d-none');
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (name === 'explore')       loadDestinations();
  if (name === 'packages')      loadPackages();
  if (name === 'my-bookings')   loadMyBookings();
  if (name === 'admin')         loadAdminDashboard();
}

/* ======================================================
   AUTH
====================================================== */
function switchAuthTab(tab) {
  document.getElementById('loginForm').classList.toggle('d-none',   tab !== 'login');
  document.getElementById('registerForm').classList.toggle('d-none', tab !== 'register');
  document.getElementById('loginTab').classList.toggle('active',    tab === 'login');
  document.getElementById('registerTab').classList.toggle('active', tab === 'register');
}

async function doLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');
  errEl.classList.add('d-none');
  try {
    const res  = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error; errEl.classList.remove('d-none'); return; }
    authToken   = data.token;
    currentUser = data.user;
    localStorage.setItem('travelToken', authToken);
    localStorage.setItem('travelUser',  JSON.stringify(currentUser));
    updateNavForUser();
    await prefetchHelperData();
    showToast(`Welcome back, ${currentUser.name}! 🎉`);
    showSection('explore');
  } catch(e) {
    errEl.textContent = 'Network error. Is the server running?';
    errEl.classList.remove('d-none');
  }
}

async function doRegister() {
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const phone    = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;
  const errEl    = document.getElementById('registerError');
  const sucEl    = document.getElementById('registerSuccess');
  errEl.classList.add('d-none'); sucEl.classList.add('d-none');
  try {
    const res  = await fetch(`${API}/api/auth/register`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name, email, phone, password }) });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error; errEl.classList.remove('d-none'); return; }
    authToken   = data.token;
    currentUser = data.user;
    localStorage.setItem('travelToken', authToken);
    localStorage.setItem('travelUser',  JSON.stringify(currentUser));
    sucEl.textContent = 'Account created! Redirecting…';
    sucEl.classList.remove('d-none');
    updateNavForUser();
    await prefetchHelperData();
    setTimeout(() => showSection('explore'), 1000);
  } catch(e) {
    errEl.textContent = 'Network error.';
    errEl.classList.remove('d-none');
  }
}

function logout() {
  authToken = null; currentUser = null;
  localStorage.removeItem('travelToken');
  localStorage.removeItem('travelUser');
  document.getElementById('userNav').style.display = 'none';
  document.getElementById('authNav').style.display = 'block';
  document.getElementById('myBookingsNav').style.display = 'none';
  document.getElementById('adminNav').style.display = 'none';
  document.getElementById('addDestBtn').style.display = 'none';
  showSection('explore');
  showToast('Logged out successfully.', 'bg-secondary');
}

function updateNavForUser() {
  if (!currentUser) return;
  document.getElementById('authNav').style.display    = 'none';
  document.getElementById('userNav').style.display    = 'flex';
  document.getElementById('myBookingsNav').style.display = 'block';
  document.getElementById('userGreeting').textContent = currentUser.name.split(' ')[0];
  if (currentUser.role === 'admin') {
    document.getElementById('adminNav').style.display   = 'block';
    document.getElementById('addDestBtn').style.display = 'block';
  }
}

function authHeaders() {
  return authToken ? { headers: { 'Authorization': 'Bearer ' + authToken, 'Content-Type': 'application/json' } } : {};
}

/* ======================================================
   EXPLORE / DESTINATIONS
====================================================== */
async function loadDestinations() {
  const grid = document.getElementById('destinationsGrid');
  grid.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-warning" role="status"></div></div>';
  try {
    const res  = await fetch(`${API}/api/destinations`);
    const data = await res.json();
    if (!data.length) { grid.innerHTML = '<div class="col-12 text-center text-muted py-5"><i class="bi bi-geo-alt-fill fs-1 d-block mb-3"></i>No destinations yet. Run npm run seed!</div>'; return; }
    grid.innerHTML = data.map(d => destCard(d)).join('');
  } catch(e) {
    grid.innerHTML = '<div class="col-12 text-center text-danger py-4"><i class="bi bi-wifi-off fs-1 d-block mb-3"></i>Cannot reach server. Make sure it is running on port 5000.</div>';
  }
}

function destCard(d) {
  return `
  <div class="col-sm-6 col-lg-3">
    <div class="place-card" onclick="openDestDetail('${d._id}')">
      <div class="place-img-wrapper">
        <img src="${d.imageUrl}" alt="${d.name}" class="place-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'" />
        <span class="badge-category">${d.category}</span>
      </div>
      <div class="p-3">
        <h5 class="fw-bold mb-1">${d.name}</h5>
        <p class="text-muted small mb-2"><i class="bi bi-geo-alt me-1"></i>${d.location}</p>
        <p class="small text-secondary mb-0" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${d.description}</p>
        <button class="btn btn-sm btn-outline-warning mt-3 w-100" onclick="event.stopPropagation(); openDestDetail('${d._id}')"><i class="bi bi-info-circle me-1"></i>View Details & Reviews</button>
      </div>
    </div>
  </div>`;
}

async function openDestDetail(id) {
  currentDestModalId = id;
  const modal = new bootstrap.Modal(document.getElementById('destDetailModal'));
  const body  = document.getElementById('destModalBody');
  const title = document.getElementById('destModalTitle');
  body.innerHTML  = '<div class="text-center py-4"><div class="spinner-border text-warning"></div></div>';
  title.textContent = 'Loading…';
  modal.show();
  try {
    const [dRes, rRes] = await Promise.all([
      fetch(`${API}/api/destinations/${id}`),
      fetch(`${API}/api/reviews/${id}`)
    ]);
    const dest    = await dRes.json();
    const reviews = await rRes.json();
    title.textContent = dest.name;
    const avgRating = reviews.length ? (reviews.reduce((s,r) => s + r.rating, 0) / reviews.length).toFixed(1) : 'No ratings';
    body.innerHTML = `
      <img src="${dest.imageUrl}" class="w-100 rounded-3 mb-3" style="height:240px;object-fit:cover" alt="${dest.name}" onerror="this.src='https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'" />
      <p class="text-warning mb-1"><i class="bi bi-geo-alt me-1"></i>${dest.location} &nbsp;|&nbsp; <span class="badge" style="background:var(--primary-gold)">${dest.category}</span></p>
      <p class="mb-3">${dest.description}</p>
      <p class="mb-4"><i class="bi bi-star-fill text-warning me-1"></i><strong>Avg Rating: ${avgRating}</strong> (${reviews.length} reviews)</p>
      <hr class="border-secondary"/>
      <h6 class="fw-bold mb-3"><i class="bi bi-chat-dots me-2 text-warning"></i>Traveller Reviews</h6>
      <div id="reviewsList">${reviews.length ? reviews.map(reviewCard).join('') : '<p class="text-muted small">No reviews yet. Be the first!</p>'}</div>
      ${currentUser ? `
      <hr class="border-secondary mt-3"/>
      <h6 class="fw-bold mb-2">Write a Review</h6>
      <div id="reviewFormErr" class="alert alert-danger d-none small"></div>
      <div class="mb-2">
        <label class="form-label small">Rating</label>
        <select class="form-select form-select-sm bg-dark text-light border-secondary" id="reviewRating">
          <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
          <option value="4">⭐⭐⭐⭐ Good</option>
          <option value="3">⭐⭐⭐ Average</option>
          <option value="2">⭐⭐ Poor</option>
          <option value="1">⭐ Terrible</option>
        </select>
      </div>
      <div class="mb-2">
        <textarea class="form-control form-control-sm bg-dark text-light border-secondary" id="reviewComment" rows="2" placeholder="Share your experience…"></textarea>
      </div>
      <button class="btn btn-warning btn-sm" onclick="submitReview('${id}')"><i class="bi bi-send me-1"></i>Submit Review</button>` : '<p class="text-muted small mt-3">Login to leave a review.</p>'}
    `;
  } catch(e) {
    body.innerHTML = '<p class="text-danger">Failed to load details.</p>';
  }
}

function reviewCard(r) {
  const stars = '⭐'.repeat(r.rating);
  return `<div class="review-item">
    <div class="d-flex justify-content-between">
      <strong class="small">${r.user?.name || 'Traveller'}</strong>
      <span class="star-rating small">${stars}</span>
    </div>
    <p class="mb-0 small mt-1">${r.comment}</p>
  </div>`;
}

async function submitReview(destinationId) {
  const rating  = parseInt(document.getElementById('reviewRating').value);
  const comment = document.getElementById('reviewComment').value.trim();
  const errEl   = document.getElementById('reviewFormErr');
  errEl.classList.add('d-none');
  if (!comment) { errEl.textContent = 'Please write a comment.'; errEl.classList.remove('d-none'); return; }
  try {
    const res  = await fetch(`${API}/api/reviews`, { method: 'POST', headers: { 'Authorization': 'Bearer ' + authToken, 'Content-Type': 'application/json' }, body: JSON.stringify({ destinationId, rating, comment }) });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error; errEl.classList.remove('d-none'); return; }
    showToast('Review submitted! Thank you 🌟');
    openDestDetail(destinationId); // refresh
  } catch(e) {
    errEl.textContent = 'Network error.'; errEl.classList.remove('d-none');
  }
}

function goBookFromModal() {
  bootstrap.Modal.getInstance(document.getElementById('destDetailModal')).hide();
  showSection('packages');
}

/* ======================================================
   PACKAGES
====================================================== */
async function loadPackages() {
  const grid = document.getElementById('packagesGrid');
  grid.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-warning" role="status"></div></div>';
  try {
    const res  = await fetch(`${API}/api/packages`);
    const data = await res.json();
    allPackages = data;
    if (!data.length) { grid.innerHTML = '<div class="col-12 text-center text-muted py-5">No packages yet. Run npm run seed!</div>'; return; }
    grid.innerHTML = data.map(p => packageCard(p)).join('');
  } catch(e) {
    grid.innerHTML = '<div class="col-12 text-danger text-center py-4">Cannot reach server.</div>';
  }
}

function packageCard(p) {
  const destNames = p.destinations?.map(d => d.name).join(', ') || 'Multiple Sites';
  return `
  <div class="col-md-6">
    <div class="pkg-card">
      <div class="pkg-header d-flex justify-content-between align-items-start">
        <div>
          <h5 class="fw-bold mb-1">${p.packageName}</h5>
          <p class="mb-0 small opacity-75"><i class="bi bi-geo-alt me-1"></i>${destNames}</p>
        </div>
        <span class="pkg-price-badge">₹${p.price.toLocaleString()}</span>
      </div>
      <div class="p-3">
        <p class="text-muted small mb-3">${p.details}</p>
        <div class="d-flex align-items-center justify-content-between">
          <span class="text-muted small"><i class="bi bi-calendar3 me-1"></i>${p.durationDays} days</span>
          <button class="btn btn-warning btn-sm px-3 fw-semibold" onclick="startBooking('${p._id}')">
            <i class="bi bi-bag-plus me-1"></i>Book Now
          </button>
        </div>
      </div>
    </div>
  </div>`;
}

/* ======================================================
   BOOKING FLOW
====================================================== */
async function startBooking(packageId) {
  if (!currentUser) { showToast('Please login to book a package.', 'bg-warning text-dark'); showSection('auth'); return; }
  selectedPackageId = packageId;
  showSection('booking');

  // Fill package info
  const pkg = allPackages.find(p => p._id === packageId);
  if (pkg) {
    document.getElementById('selectedPackageInfo').innerHTML = `
      <div class="alert alert-dark border-0 rounded-3 mb-0">
        <h5 class="mb-1"><i class="bi bi-bag-check text-warning me-2"></i>${pkg.packageName}</h5>
        <span class="text-muted small"><i class="bi bi-calendar3 me-1"></i>${pkg.durationDays} days &nbsp;|&nbsp; Package Price: <strong class="text-warning">₹${pkg.price.toLocaleString()}</strong></span>
      </div>`;
  }

  // Populate hotel select
  const hotelSel = document.getElementById('hotelSelect');
  hotelSel.innerHTML = '<option value="">-- Choose Hotel --</option>';
  if (!allHotels.length) {
    try { const r = await fetch(`${API}/api/admin/hotels`, { headers: { 'Authorization': 'Bearer ' + authToken } }); allHotels = await r.json(); } catch(e){}
  }
  allHotels.forEach(h => {
    const opt = document.createElement('option');
    opt.value = h._id;
    opt.textContent = `${h.hotelName} — ₹${h.pricePerNight}/night (${h.rating}★)`;
    opt.dataset.price = h.pricePerNight;
    hotelSel.appendChild(opt);
  });

  // Populate transport select
  const tSel = document.getElementById('transportSelect');
  tSel.innerHTML = '<option value="">-- Choose Transport --</option>';
  if (!allTransport.length) {
    try { const r = await fetch(`${API}/api/admin/transport`, { headers: { 'Authorization': 'Bearer ' + authToken } }); allTransport = await r.json(); } catch(e){}
  }
  allTransport.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t._id;
    opt.textContent = `${t.type} — ${t.operatorName} (₹${t.price.toLocaleString()})`;
    opt.dataset.price = t.price;
    tSel.appendChild(opt);
  });

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('travelDate').min = today;
  document.getElementById('travelDate').value = '';
  document.getElementById('costBreakdown').style.display = 'none';
}

function updateCostBreakdown() {
  const pkg = allPackages.find(p => p._id === selectedPackageId);
  if (!pkg) return;

  const hotelSel = document.getElementById('hotelSelect');
  const transSel = document.getElementById('transportSelect');
  const selHotel = hotelSel.options[hotelSel.selectedIndex];
  const selTrans = transSel.options[transSel.selectedIndex];

  if (hotelSel.value && transSel.value) {
    const hotelNightly  = parseFloat(selHotel.dataset.price) || 0;
    const transportCost = parseFloat(selTrans.dataset.price) || 0;
    const hotelTotal    = hotelNightly * pkg.durationDays;
    const total         = pkg.price + hotelTotal + transportCost;

    document.getElementById('cb-nights').textContent    = pkg.durationDays;
    document.getElementById('cb-package').textContent   = '₹' + pkg.price.toLocaleString();
    document.getElementById('cb-hotel').textContent     = '₹' + hotelTotal.toLocaleString();
    document.getElementById('cb-transport').textContent = '₹' + transportCost.toLocaleString();
    document.getElementById('cb-total').textContent     = '₹' + total.toLocaleString();
    document.getElementById('costBreakdown').style.display = 'block';
  }
}

async function confirmBooking() {
  const packageId   = selectedPackageId;
  const hotelId     = document.getElementById('hotelSelect').value;
  const transportId = document.getElementById('transportSelect').value;
  const travelDate  = document.getElementById('travelDate').value;
  const errEl       = document.getElementById('bookingError');
  errEl.classList.add('d-none');

  if (!hotelId || !transportId || !travelDate) {
    errEl.textContent = 'Please fill all fields.'; errEl.classList.remove('d-none'); return;
  }

  try {
    const res  = await fetch(`${API}/api/bookings`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + authToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId, hotelId, transportId, travelDate })
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error; errEl.classList.remove('d-none'); return; }

    selectedBookingId = data._id;
    fillPaymentSection(data);
    showSection('payment');
  } catch(e) {
    errEl.textContent = 'Network error.'; errEl.classList.remove('d-none');
  }
}

function fillPaymentSection(booking) {
  document.getElementById('paymentBookingInfo').innerHTML = `
    <div class="cost-breakdown-box">
      <h6 class="fw-bold mb-3"><i class="bi bi-receipt text-warning me-2"></i>Order Summary</h6>
      <div class="d-flex justify-content-between mb-1"><span>Package Price</span><span>₹${booking.priceBreakdown?.packagePrice?.toLocaleString() || 0}</span></div>
      <div class="d-flex justify-content-between mb-1"><span>Hotel Total</span><span>₹${booking.priceBreakdown?.hotelTotal?.toLocaleString() || 0}</span></div>
      <div class="d-flex justify-content-between mb-1"><span>Transport</span><span>₹${booking.priceBreakdown?.transportPrice?.toLocaleString() || 0}</span></div>
      <hr/>
      <div class="d-flex justify-content-between fw-bold fs-5"><span>Total Amount</span><span class="text-warning">₹${booking.totalAmount?.toLocaleString()}</span></div>
    </div>`;
}

async function processPayment() {
  const payModeEl = document.querySelector('input[name="paymentMode"]:checked');
  const errEl     = document.getElementById('paymentError');
  errEl.classList.add('d-none');
  if (!payModeEl) { errEl.textContent = 'Please select a payment mode.'; errEl.classList.remove('d-none'); return; }

  try {
    const res  = await fetch(`${API}/api/payments`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + authToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: selectedBookingId, paymentMode: payModeEl.value })
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error; errEl.classList.remove('d-none'); return; }

    showReceipt(data.payment);
    showSection('receipt');
    showToast('Payment successful! Booking confirmed! ✈️');
  } catch(e) {
    errEl.textContent = 'Network error.'; errEl.classList.remove('d-none');
  }
}

function showReceipt(payment) {
  const booking = payment.booking || {};
  const pkg     = booking.package || {};
  const hotel   = booking.hotel   || {};
  document.getElementById('receiptContent').innerHTML = `
    <div class="text-center mb-4">
      <i class="bi bi-patch-check-fill text-success fs-1"></i>
      <h4 class="mt-2 fw-bold text-success">Booking Confirmed!</h4>
    </div>
    <div class="row g-2 mb-3">
      <div class="col-6"><small class="text-muted">Receipt No.</small><div class="fw-bold">${payment.receiptNo}</div></div>
      <div class="col-6"><small class="text-muted">Payment Mode</small><div class="fw-bold">${payment.paymentMode}</div></div>
      <div class="col-6"><small class="text-muted">Package</small><div class="fw-semibold">${pkg.packageName || '—'}</div></div>
      <div class="col-6"><small class="text-muted">Hotel</small><div class="fw-semibold">${hotel.hotelName || '—'}</div></div>
      <div class="col-6"><small class="text-muted">Payment Date</small><div class="fw-semibold">${new Date(payment.paymentDate).toLocaleDateString('en-IN')}</div></div>
      <div class="col-6"><small class="text-muted">Total Paid</small><div class="fw-bold text-success fs-5">₹${payment.amount?.toLocaleString()}</div></div>
    </div>
    <div class="text-center mt-3">
      <span class="badge bg-success px-4 py-2 fs-6">Status: CONFIRMED ✓</span>
    </div>`;
}

/* ======================================================
   MY BOOKINGS
====================================================== */
async function loadMyBookings() {
  if (!currentUser) { showSection('auth'); return; }
  const el = document.getElementById('myBookingsList');
  el.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-warning"></div></div>';
  try {
    const res  = await fetch(`${API}/api/bookings/my`, { headers: { 'Authorization': 'Bearer ' + authToken } });
    const data = await res.json();
    if (!data.length) { el.innerHTML = '<div class="text-center text-muted py-5"><i class="bi bi-calendar-x fs-1 d-block mb-3"></i>No bookings yet. Explore packages and book a trip!</div>'; return; }
    el.innerHTML = data.map(b => bookingItem(b)).join('');
  } catch(e) {
    el.innerHTML = '<div class="text-danger text-center py-4">Failed to load bookings.</div>';
  }
}

function bookingItem(b) {
  const statusColors = { confirmed: 'success', pending: 'warning', cancelled: 'danger' };
  const color = statusColors[b.status] || 'secondary';
  return `
  <div class="booking-item status-${b.status}">
    <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
      <div>
        <h5 class="fw-bold mb-1">${b.package?.packageName || 'Package'}</h5>
        <p class="text-muted small mb-1"><i class="bi bi-building me-1"></i>${b.hotel?.hotelName || '—'} &nbsp;|&nbsp; <i class="bi bi-train-front me-1"></i>${b.transport?.type || '—'}</p>
        <p class="text-muted small mb-0"><i class="bi bi-calendar3 me-1"></i>Travel Date: ${new Date(b.travelDate).toLocaleDateString('en-IN')}</p>
      </div>
      <div class="text-end">
        <div class="fw-bold text-warning fs-5">₹${b.totalAmount?.toLocaleString()}</div>
        <span class="badge bg-${color} mt-1">${b.status.toUpperCase()}</span>
        ${b.status === 'pending' ? `<div class="mt-2"><button class="btn btn-sm btn-outline-danger" onclick="cancelBooking('${b._id}')"><i class="bi bi-x-circle me-1"></i>Cancel</button></div>` : ''}
      </div>
    </div>
  </div>`;
}

async function cancelBooking(id) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  try {
    const res = await fetch(`${API}/api/bookings/${id}/cancel`, { method: 'PATCH', headers: { 'Authorization': 'Bearer ' + authToken } });
    if (res.ok) { showToast('Booking cancelled.', 'bg-secondary'); loadMyBookings(); }
    else { const d = await res.json(); showToast(d.error, 'bg-danger'); }
  } catch(e) { showToast('Network error.', 'bg-danger'); }
}

/* ======================================================
   ADMIN DASHBOARD
====================================================== */
async function loadAdminDashboard() {
  if (!currentUser || currentUser.role !== 'admin') { showSection('explore'); return; }
  try {
    const res  = await fetch(`${API}/api/admin/stats`, { headers: { 'Authorization': 'Bearer ' + authToken } });
    const data = await res.json();
    document.getElementById('stat-users').textContent        = data.users;
    document.getElementById('stat-bookings').textContent     = data.bookings;
    document.getElementById('stat-revenue').textContent      = '₹' + (data.totalRevenue || 0).toLocaleString();
    document.getElementById('stat-destinations').textContent = data.destinations;
  } catch(e) {}
  loadAdminTab('bookings', document.querySelector('#adminTabs .nav-link'));
}

async function loadAdminTab(tab, btn) {
  document.querySelectorAll('#adminTabs .nav-link').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const content = document.getElementById('adminTabContent');
  content.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-warning"></div></div>';

  if (tab === 'bookings') {
    const res  = await fetch(`${API}/api/admin/bookings`, { headers: { 'Authorization': 'Bearer ' + authToken } });
    const data = await res.json();
    content.innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover admin-table align-middle">
          <thead class="table-dark"><tr><th>User</th><th>Package</th><th>Hotel</th><th>Amount</th><th>Travel Date</th><th>Status</th></tr></thead>
          <tbody>
            ${data.map(b => `
            <tr>
              <td>${b.user?.name || '—'}<br><small class="text-muted">${b.user?.email || ''}</small></td>
              <td>${b.package?.packageName || '—'}</td>
              <td>${b.hotel?.hotelName || '—'}</td>
              <td class="fw-bold text-warning">₹${b.totalAmount?.toLocaleString()}</td>
              <td>${new Date(b.travelDate).toLocaleDateString('en-IN')}</td>
              <td><span class="badge bg-${b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'danger'}">${b.status}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } else if (tab === 'users') {
    const res  = await fetch(`${API}/api/admin/users`, { headers: { 'Authorization': 'Bearer ' + authToken } });
    const data = await res.json();
    content.innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover admin-table align-middle">
          <thead class="table-dark"><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
          <tbody>
            ${data.map(u => `
            <tr>
              <td class="fw-semibold">${u.name}</td>
              <td>${u.email}</td>
              <td>${u.phone}</td>
              <td><span class="badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-info text-dark'}">${u.role}</span></td>
              <td>${new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }
}

/* ======================================================
   ADD DESTINATION (Admin)
====================================================== */
function showAddDestinationModal() {
  new bootstrap.Modal(document.getElementById('addDestModal')).show();
}

async function submitNewDestination() {
  const name     = document.getElementById('newDestName').value.trim();
  const location = document.getElementById('newDestLocation').value.trim();
  const category = document.getElementById('newDestCategory').value;
  const desc     = document.getElementById('newDestDesc').value.trim();
  const imgUrl   = document.getElementById('newDestImg').value.trim();
  const errEl    = document.getElementById('addDestError');
  errEl.classList.add('d-none');

  if (!name || !location || !desc || !imgUrl) { errEl.textContent = 'All fields are required.'; errEl.classList.remove('d-none'); return; }

  try {
    const res  = await fetch(`${API}/api/destinations`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + authToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, location, category, description: desc, imageUrl: imgUrl })
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.error; errEl.classList.remove('d-none'); return; }
    bootstrap.Modal.getInstance(document.getElementById('addDestModal')).hide();
    showToast(`Destination "${name}" added successfully!`);
    loadDestinations();
  } catch(e) {
    errEl.textContent = 'Network error.'; errEl.classList.remove('d-none');
  }
}

/* ======================================================
   TOAST UTILITY
====================================================== */
function showToast(msg, cls = 'text-bg-success') {
  const toastEl = document.getElementById('appToast');
  toastEl.className = `toast align-items-center border-0 ${cls}`;
  document.getElementById('toastMsg').textContent = msg;
  new bootstrap.Toast(toastEl, { delay: 3500 }).show();
}