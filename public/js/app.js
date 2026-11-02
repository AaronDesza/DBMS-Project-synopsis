/* =====================================================
   TourQuest - Travel & Tour Booking System
   Frontend Logic (app.js)
   Aaron De Souza (24CE202) | PCCE Sem V 2026-27
   ===================================================== */

const API = '';  // same-origin API calls
let currentUser = null;
let authToken = null;
let selectedPackageId = null;
let selectedBookingId = null;
let currentBookingData = null;
let currentDestModalId = null;
let selectedPaymentMode = 'UPI';
let selectedBankName = 'HDFC Bank';
let allHotels = [];
let allTransport = [];
let allPackages = [];

/* Fallback image helper if any remote link fails */
const DEFAULT_DEST_IMG = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=85';

/* ======================================================
   INITIALIZATION
====================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const savedToken = localStorage.getItem('travelToken');
  const savedUser  = localStorage.getItem('travelUser');
  if (savedToken && savedUser) {
    try {
      authToken   = savedToken;
      currentUser = JSON.parse(savedUser);
      updateNavForUser();
    } catch (e) {
      localStorage.removeItem('travelToken');
      localStorage.removeItem('travelUser');
    }
  }
  showSection('explore');
  prefetchCatalogData();
});

async function prefetchCatalogData() {
  try {
    const [hRes, tRes, pRes] = await Promise.all([
      fetch(`${API}/api/hotels`),
      fetch(`${API}/api/transport`),
      fetch(`${API}/api/packages`)
    ]);
    if (hRes.ok) allHotels    = await hRes.json();
    if (tRes.ok) allTransport = await tRes.json();
    if (pRes.ok) allPackages  = await pRes.json();
  } catch(e) {
    console.warn('Catalog prefetch warning:', e);
  }
}

/* ======================================================
   NAVIGATION
====================================================== */
function showSection(name) {
  document.querySelectorAll('.app-section').forEach(s => s.classList.add('d-none'));
  const sec = document.getElementById('section-' + name);
  if (sec) {
    sec.classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (name === 'explore')       loadDestinations();
  if (name === 'packages')      loadPackages();
  if (name === 'my-bookings')   loadMyBookings();
  if (name === 'admin')         loadAdminDashboard();
}

/* ======================================================
   AUTHENTICATION
====================================================== */
function switchAuthTab(tab) {
  document.getElementById('loginForm').classList.toggle('d-none', tab !== 'login');
  document.getElementById('registerForm').classList.toggle('d-none', tab !== 'register');
  document.getElementById('loginTab').classList.toggle('active', tab === 'login');
  document.getElementById('registerTab').classList.toggle('active', tab === 'register');
}

async function doLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');
  errEl.classList.add('d-none');

  if (!email || !password) {
    errEl.textContent = 'Please enter both email and password.';
    errEl.classList.remove('d-none');
    return;
  }

  try {
    const res  = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.error || 'Login failed.';
      errEl.classList.remove('d-none');
      return;
    }

    authToken   = data.token;
    currentUser = data.user;
    localStorage.setItem('travelToken', authToken);
    localStorage.setItem('travelUser', JSON.stringify(currentUser));
    updateNavForUser();
    await prefetchCatalogData();
    showToast(`Welcome back, ${currentUser.name}! 🌟`);
    showSection('explore');
  } catch(e) {
    errEl.textContent = 'Cannot connect to backend server. Make sure it is running.';
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
  errEl.classList.add('d-none');
  sucEl.classList.add('d-none');

  if (!name || !email || !password) {
    errEl.textContent = 'Please fill in all required fields.';
    errEl.classList.remove('d-none');
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.error || 'Registration failed.';
      errEl.classList.remove('d-none');
      return;
    }

    authToken   = data.token;
    currentUser = data.user;
    localStorage.setItem('travelToken', authToken);
    localStorage.setItem('travelUser', JSON.stringify(currentUser));
    sucEl.textContent = 'Account created successfully! Redirecting…';
    sucEl.classList.remove('d-none');
    updateNavForUser();
    await prefetchCatalogData();
    setTimeout(() => showSection('explore'), 900);
  } catch(e) {
    errEl.textContent = 'Network error while registering.';
    errEl.classList.remove('d-none');
  }
}

function logout() {
  authToken = null;
  currentUser = null;
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
  document.getElementById('authNav').style.display = 'none';
  document.getElementById('userNav').style.display = 'flex';
  document.getElementById('myBookingsNav').style.display = 'block';
  document.getElementById('userGreeting').textContent = currentUser.name.split(' ')[0];
  if (currentUser.role === 'admin') {
    document.getElementById('adminNav').style.display   = 'block';
    document.getElementById('addDestBtn').style.display = 'block';
  }
}

function authHeaders() {
  return authToken ? { 'Authorization': 'Bearer ' + authToken, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

/* ======================================================
   DESTINATIONS / EXPLORE
====================================================== */
async function loadDestinations() {
  const grid = document.getElementById('destinationsGrid');
  grid.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-warning" role="status"></div></div>';
  try {
    const res  = await fetch(`${API}/api/destinations`);
    const data = await res.json();
    if (!data || !data.length) {
      grid.innerHTML = '<div class="col-12 text-center text-muted py-5"><i class="bi bi-geo-alt-fill fs-1 d-block mb-3"></i>No destinations found. Run database seed to populate!</div>';
      return;
    }
    grid.innerHTML = data.map(d => destCard(d)).join('');
  } catch(e) {
    grid.innerHTML = '<div class="col-12 text-center text-danger py-4"><i class="bi bi-wifi-off fs-1 d-block mb-3"></i>Failed to load destinations. Ensure server is running.</div>';
  }
}

function destCard(d) {
  const imgUrl = d.imageUrl || DEFAULT_DEST_IMG;
  return `
  <div class="col-sm-6 col-lg-3">
    <div class="place-card" onclick="openDestDetail('${d._id}')">
      <div class="place-img-wrapper">
        <img src="${imgUrl}" alt="${d.name}" class="place-img" loading="lazy" onerror="this.onerror=null;this.src='${DEFAULT_DEST_IMG}'" />
        <span class="badge-category">${d.category}</span>
        <span class="badge-featured"><i class="bi bi-star-fill text-warning me-1"></i>Top Rated</span>
      </div>
      <div class="p-3 d-flex flex-column flex-grow-1">
        <h5 class="fw-bold mb-1 text-dark">${d.name}</h5>
        <p class="text-muted small mb-2"><i class="bi bi-geo-alt-fill text-warning me-1"></i>${d.location}</p>
        <p class="small text-secondary mb-3 flex-grow-1" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${d.description}</p>
        <button class="btn btn-sm btn-outline-warning w-100 fw-semibold rounded-pill" onclick="event.stopPropagation(); openDestDetail('${d._id}')">
          <i class="bi bi-eye me-1"></i>View Details & Reviews
        </button>
      </div>
    </div>
  </div>`;
}

async function openDestDetail(id) {
  currentDestModalId = id;
  const modalEl = document.getElementById('destDetailModal');
  const modal = new bootstrap.Modal(modalEl);
  const body  = document.getElementById('destModalBody');
  const title = document.getElementById('destModalTitle');
  body.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-warning"></div></div>';
  title.textContent = 'Loading destination...';
  modal.show();

  try {
    const [dRes, rRes] = await Promise.all([
      fetch(`${API}/api/destinations/${id}`),
      fetch(`${API}/api/reviews/${id}`)
    ]);
    const dest = await dRes.json();
    const reviews = await rRes.json();

    title.textContent = dest.name;
    const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';
    const imgUrl = dest.imageUrl || DEFAULT_DEST_IMG;

    body.innerHTML = `
      <div class="position-relative mb-3 rounded-4 overflow-hidden shadow">
        <img src="${imgUrl}" class="w-100" style="height:320px;object-fit:cover;" alt="${dest.name}" onerror="this.onerror=null;this.src='${DEFAULT_DEST_IMG}'" />
        <span class="badge bg-warning text-dark position-absolute top-0 start-0 m-3 px-3 py-2 fw-bold fs-6">${dest.category}</span>
      </div>
      <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <h4 class="fw-bold mb-0 text-light"><i class="bi bi-geo-alt-fill text-warning me-2"></i>${dest.location}</h4>
        <div class="fs-5 text-warning"><i class="bi bi-star-fill me-1"></i><strong>${avgRating}</strong> <span class="text-muted small">(${reviews.length} reviews)</span></div>
      </div>
      <p class="text-light-emphasis leading-relaxed mb-4">${dest.description}</p>
      
      <hr class="border-secondary my-4"/>
      
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-bold mb-0 text-light"><i class="bi bi-chat-quote-fill me-2 text-warning"></i>Verified Traveller Reviews</h5>
        <span class="badge bg-secondary">${reviews.length} Total</span>
      </div>
      
      <div id="reviewsList" class="mb-4">
        ${reviews.length ? reviews.map(reviewCard).join('') : '<p class="text-muted small">No reviews written yet. Be the first to review this historic site!</p>'}
      </div>

      ${currentUser ? `
      <div class="bg-secondary bg-opacity-25 p-3 rounded-3 border border-secondary">
        <h6 class="fw-bold text-light mb-2"><i class="bi bi-pencil-square me-1 text-warning"></i>Leave Your Review</h6>
        <div id="reviewFormErr" class="alert alert-danger d-none py-2 small"></div>
        <div class="row g-2 mb-2">
          <div class="col-sm-4">
            <select class="form-select form-select-sm bg-dark text-light border-secondary" id="reviewRating">
              <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
              <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
              <option value="3">⭐⭐⭐ 3 - Good</option>
              <option value="2">⭐⭐ 2 - Fair</option>
              <option value="1">⭐ 1 - Poor</option>
            </select>
          </div>
          <div class="col-sm-8">
            <input type="text" class="form-control form-control-sm bg-dark text-light border-secondary" id="reviewComment" placeholder="Share your experience (scenery, guide, tips)..." />
          </div>
        </div>
        <button class="btn btn-warning btn-sm fw-semibold" onclick="submitReview('${id}')"><i class="bi bi-send me-1"></i>Post Review</button>
      </div>` : '<p class="text-muted small mb-0"><i class="bi bi-info-circle me-1"></i>Please sign in to post a review.</p>'}
    `;
  } catch(e) {
    body.innerHTML = '<p class="text-danger py-4">Failed to load destination details.</p>';
  }
}

function reviewCard(r) {
  const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
  return `
  <div class="review-item text-dark">
    <div class="d-flex justify-content-between align-items-center mb-1">
      <strong class="text-dark"><i class="bi bi-person-check text-success me-1"></i>${r.user?.name || 'Verified Explorer'}</strong>
      <span class="text-warning fw-bold">${stars}</span>
    </div>
    <p class="mb-0 small text-secondary">${r.comment}</p>
  </div>`;
}

async function submitReview(destinationId) {
  const rating  = parseInt(document.getElementById('reviewRating').value);
  const comment = document.getElementById('reviewComment').value.trim();
  const errEl   = document.getElementById('reviewFormErr');
  errEl.classList.add('d-none');

  if (!comment) {
    errEl.textContent = 'Please write a review comment.';
    errEl.classList.remove('d-none');
    return;
  }

  try {
    const res = await fetch(`${API}/api/reviews`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ destinationId, rating, comment })
    });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.error || 'Failed to submit review.';
      errEl.classList.remove('d-none');
      return;
    }
    showToast('Review submitted successfully! 🌟');
    openDestDetail(destinationId);
  } catch(e) {
    errEl.textContent = 'Network error while submitting review.';
    errEl.classList.remove('d-none');
  }
}

function goBookFromModal() {
  const modalEl = document.getElementById('destDetailModal');
  const instance = bootstrap.Modal.getInstance(modalEl);
  if (instance) instance.hide();
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
    allPackages = data || [];
    if (!data.length) {
      grid.innerHTML = '<div class="col-12 text-center text-muted py-5">No packages configured. Run database seed to populate!</div>';
      return;
    }
    grid.innerHTML = data.map(p => packageCard(p)).join('');
  } catch(e) {
    grid.innerHTML = '<div class="col-12 text-danger text-center py-4">Cannot reach server to load packages.</div>';
  }
}

function packageCard(p) {
  const destNames = p.destinations?.map(d => d.name).join(', ') || 'Historical Highlights';
  const coverImg = p.imageUrl || (p.destinations && p.destinations[0]?.imageUrl) || DEFAULT_DEST_IMG;
  return `
  <div class="col-md-6">
    <div class="pkg-card">
      <div class="pkg-img-wrapper">
        <img src="${coverImg}" alt="${p.packageName}" class="pkg-img" onerror="this.onerror=null;this.src='${DEFAULT_DEST_IMG}'" />
        <div class="pkg-img-overlay">
          <div class="d-flex justify-content-between align-items-end">
            <div>
              <span class="badge bg-warning text-dark fw-bold mb-2"><i class="bi bi-clock-history me-1"></i>${p.durationDays} Days / ${p.durationDays - 1} Nights</span>
              <h4 class="fw-bold mb-0 text-white">${p.packageName}</h4>
            </div>
            <span class="pkg-price-badge">₹${p.price.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
      <div class="p-4 d-flex flex-column flex-grow-1">
        <div class="mb-2 text-warning small fw-semibold">
          <i class="bi bi-geo-alt-fill me-1"></i>Sites Included: <span class="text-dark">${destNames}</span>
        </div>
        <p class="text-muted small mb-4 flex-grow-1 leading-relaxed">${p.details}</p>
        <div class="d-flex align-items-center justify-content-between pt-2 border-top">
          <span class="badge bg-light text-dark border px-3 py-2"><i class="bi bi-shield-check text-success me-1"></i>Instant Booking</span>
          <button class="btn btn-warning px-4 py-2 fw-bold rounded-pill" onclick="startBooking('${p._id}')">
            <i class="bi bi-lightning-charge-fill me-1"></i>Book Now
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
  if (!currentUser) {
    showToast('Please sign in first to customize and book your trip.', 'bg-warning text-dark');
    showSection('auth');
    return;
  }

  selectedPackageId = packageId;
  showSection('booking');

  // Fill package header banner
  const pkg = allPackages.find(p => p._id === packageId);
  const pkgInfoEl = document.getElementById('selectedPackageInfo');
  if (pkg) {
    const cover = pkg.imageUrl || (pkg.destinations && pkg.destinations[0]?.imageUrl) || DEFAULT_DEST_IMG;
    pkgInfoEl.innerHTML = `
      <div class="d-flex align-items-center gap-3 p-3 bg-light rounded-3 border">
        <img src="${cover}" class="rounded-3" style="width:90px;height:70px;object-fit:cover;" alt="Package cover" onerror="this.onerror=null;this.src='${DEFAULT_DEST_IMG}'" />
        <div class="flex-grow-1">
          <span class="badge bg-dark text-warning mb-1">${pkg.durationDays} Days Itinerary</span>
          <h5 class="fw-bold mb-0 text-dark">${pkg.packageName}</h5>
          <span class="small text-muted">Base Package Price: <strong class="text-warning fs-6">₹${pkg.price.toLocaleString('en-IN')}</strong></span>
        </div>
      </div>`;
  }

  // Populate hotels dropdown from public endpoint
  const hotelSel = document.getElementById('hotelSelect');
  hotelSel.innerHTML = '<option value="">-- Choose Hotel --</option>';
  if (!allHotels.length) {
    try {
      const r = await fetch(`${API}/api/hotels`);
      if (r.ok) allHotels = await r.json();
    } catch(e) {}
  }
  allHotels.forEach(h => {
    const opt = document.createElement('option');
    opt.value = h._id;
    opt.textContent = `${h.hotelName} — ₹${h.pricePerNight.toLocaleString('en-IN')}/night (${h.rating}★)`;
    opt.dataset.price = h.pricePerNight;
    hotelSel.appendChild(opt);
  });

  // Populate transport dropdown from public endpoint
  const tSel = document.getElementById('transportSelect');
  tSel.innerHTML = '<option value="">-- Choose Transport --</option>';
  if (!allTransport.length) {
    try {
      const r = await fetch(`${API}/api/transport`);
      if (r.ok) allTransport = await r.json();
    } catch(e) {}
  }
  allTransport.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t._id;
    opt.textContent = `${t.type} — ${t.operatorName} (₹${t.price.toLocaleString('en-IN')})`;
    opt.dataset.price = t.price;
    tSel.appendChild(opt);
  });

  // Set default travel date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  const travelDateInput = document.getElementById('travelDate');
  travelDateInput.min = minDate;
  if (!travelDateInput.value) travelDateInput.value = minDate;

  // Auto select first hotel & transport if available for convenience
  if (hotelSel.options.length > 1) hotelSel.selectedIndex = 1;
  if (tSel.options.length > 1) tSel.selectedIndex = 1;

  updateCostBreakdown();
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
    document.getElementById('cb-package').textContent   = '₹' + pkg.price.toLocaleString('en-IN');
    document.getElementById('cb-hotel').textContent     = '₹' + hotelTotal.toLocaleString('en-IN');
    document.getElementById('cb-transport').textContent = '₹' + transportCost.toLocaleString('en-IN');
    document.getElementById('cb-total').textContent     = '₹' + total.toLocaleString('en-IN');
    document.getElementById('costBreakdown').style.display = 'block';
  } else {
    document.getElementById('costBreakdown').style.display = 'none';
  }
}

async function confirmBooking() {
  const packageId   = selectedPackageId;
  const hotelId     = document.getElementById('hotelSelect').value;
  const transportId = document.getElementById('transportSelect').value;
  const travelDate  = document.getElementById('travelDate').value;
  const errEl       = document.getElementById('bookingError');
  errEl.classList.add('d-none');

  if (!packageId || !hotelId || !transportId || !travelDate) {
    errEl.textContent = 'Please select a hotel, transit option, and travel date.';
    errEl.classList.remove('d-none');
    return;
  }

  try {
    const res  = await fetch(`${API}/api/bookings`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ packageId, hotelId, transportId, travelDate })
    });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.error || 'Failed to create booking.';
      errEl.classList.remove('d-none');
      return;
    }

    selectedBookingId = data._id;
    currentBookingData = data;
    fillPaymentSection(data);
    showSection('payment');
  } catch(e) {
    errEl.textContent = 'Network error while initiating booking.';
    errEl.classList.remove('d-none');
  }
}

/* ======================================================
   PAYMENT OPTIONS & PROCESSING
====================================================== */
function selectPaymentTab(mode) {
  selectedPaymentMode = mode;
  document.querySelectorAll('.payment-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.pay-form-panel').forEach(p => p.classList.add('d-none'));

  if (mode === 'UPI') {
    document.getElementById('tabBtn-upi').classList.add('active');
    document.getElementById('payForm-upi').classList.remove('d-none');
  } else if (mode === 'Credit Card' || mode === 'Debit Card') {
    const tabId = mode === 'Credit Card' ? 'tabBtn-credit' : 'tabBtn-debit';
    document.getElementById(tabId).classList.add('active');
    document.getElementById('payForm-card').classList.remove('d-none');
    document.getElementById('cardTypeLabel').textContent = mode.toUpperCase();
    updateCardPreview();
  } else if (mode === 'Net Banking') {
    document.getElementById('tabBtn-netbanking').classList.add('active');
    document.getElementById('payForm-netbanking').classList.remove('d-none');
  }
}

function selectBank(el, name) {
  document.querySelectorAll('.bank-tile').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
  selectedBankName = name;
  document.getElementById('otherBankSelect').value = name;
}

function updateCardPreview() {
  const num  = document.getElementById('cardNumInput').value || '4532 •••• •••• 8920';
  const name = document.getElementById('cardNameInput').value || (currentUser?.name || 'AARON DE SOUZA');
  const exp  = document.getElementById('cardExpInput').value || '08/29';

  document.getElementById('cardNumPreview').textContent  = num;
  document.getElementById('cardNamePreview').textContent = name.toUpperCase();
  document.getElementById('cardExpPreview').textContent  = exp;
}

function fillPaymentSection(booking) {
  const pkg = allPackages.find(p => p._id === booking.package || p._id === selectedPackageId);
  const pkgTitle = pkg ? pkg.packageName : 'Curated Tour Package';
  const pkgCover = pkg?.imageUrl || (pkg?.destinations && pkg?.destinations[0]?.imageUrl) || DEFAULT_DEST_IMG;

  document.getElementById('paymentBookingInfo').innerHTML = `
    <div class="booking-card p-4">
      <div class="d-flex align-items-center gap-3 mb-3">
        <img src="${pkgCover}" class="rounded-3 shadow-sm" style="width:75px;height:60px;object-fit:cover;" alt="Package" onerror="this.onerror=null;this.src='${DEFAULT_DEST_IMG}'" />
        <div>
          <h6 class="fw-bold mb-0 text-dark">${pkgTitle}</h6>
          <span class="text-muted small"><i class="bi bi-calendar-event me-1"></i>Date: ${new Date(booking.travelDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
        </div>
      </div>
      <hr class="my-3"/>
      <h6 class="fw-bold text-dark mb-2"><i class="bi bi-receipt me-1 text-warning"></i>Order Summary</h6>
      <div class="d-flex justify-content-between mb-1 small text-secondary">
        <span>Package Fare</span><span>₹${booking.priceBreakdown?.packagePrice?.toLocaleString('en-IN') || 0}</span>
      </div>
      <div class="d-flex justify-content-between mb-1 small text-secondary">
        <span>Hotel Accommodation</span><span>₹${booking.priceBreakdown?.hotelTotal?.toLocaleString('en-IN') || 0}</span>
      </div>
      <div class="d-flex justify-content-between mb-1 small text-secondary">
        <span>Transit / Flight Fare</span><span>₹${booking.priceBreakdown?.transportPrice?.toLocaleString('en-IN') || 0}</span>
      </div>
      <div class="d-flex justify-content-between mb-1 small text-secondary">
        <span>Taxes & GST (0%)</span><span class="text-success fw-semibold">Waived / Inclusive</span>
      </div>
      <hr class="my-2"/>
      <div class="d-flex justify-content-between fw-bold fs-5 text-dark">
        <span>Total Due</span>
        <span class="text-warning fs-4">₹${booking.totalAmount?.toLocaleString('en-IN')}</span>
      </div>
      <div class="bg-light p-2 rounded-2 mt-3 text-center small text-muted border">
        <i class="bi bi-patch-check-fill text-success me-1"></i>100% Secure Checkout Guarantee
      </div>
    </div>`;

  // Pre-fill user name into card input if available
  if (currentUser) {
    const cardNameInput = document.getElementById('cardNameInput');
    if (cardNameInput) cardNameInput.value = currentUser.name;
    updateCardPreview();
  }
}

async function processPayment() {
  const errEl = document.getElementById('paymentError');
  errEl.classList.add('d-none');

  if (!selectedBookingId) {
    errEl.textContent = 'No active booking to pay for.';
    errEl.classList.remove('d-none');
    return;
  }

  const payBtn = document.getElementById('paySubmitBtn');
  payBtn.disabled = true;
  payBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing Secure Transaction…';

  try {
    const res = await fetch(`${API}/api/payments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        bookingId: selectedBookingId,
        paymentMode: selectedPaymentMode,
        paymentDetails: {
          mode: selectedPaymentMode,
          bank: selectedBankName
        }
      })
    });
    const data = await res.json();
    payBtn.disabled = false;
    payBtn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Authorize & Complete Payment';

    if (!res.ok) {
      errEl.textContent = data.error || 'Payment gateway declined transaction.';
      errEl.classList.remove('d-none');
      return;
    }

    showReceipt(data.payment);
    showSection('receipt');
    showToast('Payment successful! Booking confirmed! ✈️🎉');
  } catch(e) {
    payBtn.disabled = false;
    payBtn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Authorize & Complete Payment';
    errEl.textContent = 'Network error while finalizing payment.';
    errEl.classList.remove('d-none');
  }
}

/* ======================================================
   RECEIPT / TRAVEL VOUCHER
====================================================== */
function showReceipt(payment) {
  const booking   = payment.booking || currentBookingData || {};
  const pkg       = booking.package || {};
  const hotel     = booking.hotel   || {};
  const transport = booking.transport || {};
  const user      = booking.user || currentUser || {};

  const travelDateFormatted = booking.travelDate ? new Date(booking.travelDate).toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
  }) : 'Scheduled on Booking';

  const paymentDateFormatted = payment.paymentDate ? new Date(payment.paymentDate).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');

  document.getElementById('receiptContent').innerHTML = `
    <div class="receipt-watermark">CONFIRMED</div>
    <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4 flex-wrap gap-2">
      <div>
        <h3 class="fw-bold mb-0 text-dark" style="font-family:'Playfair Display',serif;"><i class="bi bi-compass text-warning me-2"></i>TourQuest</h3>
        <p class="text-muted small mb-0">Official E-Ticket & Tour Confirmation Voucher</p>
      </div>
      <div class="text-end">
        <span class="badge bg-success px-3 py-2 fs-6 mb-1"><i class="bi bi-check-circle-fill me-1"></i>CONFIRMED</span>
        <div class="small text-muted font-monospace">${payment.receiptNo}</div>
      </div>
    </div>

    <!-- Traveller & Trip Details -->
    <div class="row g-3 mb-4">
      <div class="col-sm-6">
        <div class="p-3 bg-light rounded-3 border">
          <small class="text-muted text-uppercase fw-bold letter-spacing d-block mb-1">Traveller Information</small>
          <div class="fw-bold fs-6 text-dark">${user.name || 'Valued Traveller'}</div>
          <div class="small text-secondary"><i class="bi bi-envelope me-1"></i>${user.email || '—'}</div>
          <div class="small text-secondary"><i class="bi bi-telephone me-1"></i>${user.phone || '+91 9876543210'}</div>
        </div>
      </div>
      <div class="col-sm-6">
        <div class="p-3 bg-light rounded-3 border">
          <small class="text-muted text-uppercase fw-bold letter-spacing d-block mb-1">Transaction Details</small>
          <div class="small"><span class="text-muted">Payment Mode:</span> <strong class="text-dark">${payment.paymentMode || 'Digital Payment'}</strong></div>
          <div class="small"><span class="text-muted">Payment Date:</span> <span class="text-dark">${paymentDateFormatted}</span></div>
          <div class="small"><span class="text-muted">Departure Date:</span> <strong class="text-warning">${travelDateFormatted}</strong></div>
        </div>
      </div>
    </div>

    <!-- Itinerary Items Table -->
    <div class="table-responsive mb-4">
      <table class="table table-bordered mb-0 align-middle">
        <thead class="table-dark">
          <tr>
            <th>Service Component</th>
            <th>Details & Provider</th>
            <th class="text-end">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Tour Package</strong></td>
            <td>${pkg.packageName || 'Historical Heritage Tour'}<br><small class="text-muted">${pkg.durationDays ? pkg.durationDays + ' Days Guided Exploration' : 'Comprehensive Guided Tour'}</small></td>
            <td class="text-end fw-semibold">₹${booking.priceBreakdown?.packagePrice?.toLocaleString('en-IN') || pkg.price?.toLocaleString('en-IN') || '—'}</td>
          </tr>
          <tr>
            <td><strong>Accommodation</strong></td>
            <td>${hotel.hotelName || 'Luxury Heritage Hotel'}<br><small class="text-muted">${hotel.rating ? hotel.rating + '★ Star Rating' : 'Standard Deluxe'}</small></td>
            <td class="text-end fw-semibold">₹${booking.priceBreakdown?.hotelTotal?.toLocaleString('en-IN') || '—'}</td>
          </tr>
          <tr>
            <td><strong>Transit Transfer</strong></td>
            <td>${transport.type ? transport.type + ' — ' + transport.operatorName : 'Direct Travel Transit'}</td>
            <td class="text-end fw-semibold">₹${booking.priceBreakdown?.transportPrice?.toLocaleString('en-IN') || transport.price?.toLocaleString('en-IN') || '—'}</td>
          </tr>
          <tr class="table-light">
            <td colspan="2" class="fw-bold text-end fs-5 text-dark">Total Amount Paid:</td>
            <td class="text-end fw-bold text-success fs-4">₹${payment.amount?.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="p-3 bg-light rounded-3 border text-center small text-muted">
      <p class="mb-1"><i class="bi bi-info-circle text-primary me-1"></i>Please present this digital voucher or photo ID at your hotel and transit check-in.</p>
      <span>For 24/7 concierge support or booking assistance: <b>support@tourquest.com</b></span>
    </div>`;
}

/* ======================================================
   MY BOOKINGS
====================================================== */
async function loadMyBookings() {
  if (!currentUser) {
    showSection('auth');
    return;
  }
  const el = document.getElementById('myBookingsList');
  el.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-warning"></div></div>';
  try {
    const res  = await fetch(`${API}/api/bookings/my`, { headers: authHeaders() });
    const data = await res.json();
    if (!data || !data.length) {
      el.innerHTML = `
        <div class="text-center text-muted py-5 bg-white rounded-4 p-5 shadow-sm">
          <i class="bi bi-suitcase-lg fs-1 text-warning d-block mb-3"></i>
          <h4>No Bookings Yet</h4>
          <p class="text-secondary">You haven't booked any tours yet. Explore packages to plan your next adventure!</p>
          <button class="btn btn-warning px-4 rounded-pill mt-2" onclick="showSection('packages')">Explore Packages</button>
        </div>`;
      return;
    }
    el.innerHTML = data.map(b => bookingItem(b)).join('');
  } catch(e) {
    el.innerHTML = '<div class="text-danger text-center py-4">Failed to load bookings.</div>';
  }
}

function bookingItem(b) {
  const statusColors = { confirmed: 'success', pending: 'warning', cancelled: 'danger' };
  const color = statusColors[b.status] || 'secondary';
  const travelDateFormatted = new Date(b.travelDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return `
  <div class="booking-item status-${b.status}">
    <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
      <div class="flex-grow-1">
        <div class="d-flex align-items-center gap-2 mb-1">
          <h5 class="fw-bold mb-0 text-dark">${b.package?.packageName || 'Curated Tour Package'}</h5>
          <span class="badge bg-${color}">${b.status.toUpperCase()}</span>
        </div>
        <p class="text-muted small mb-1">
          <i class="bi bi-building me-1 text-warning"></i>${b.hotel?.hotelName || 'Selected Hotel'} &nbsp;|&nbsp; 
          <i class="bi bi-airplane me-1 text-warning"></i>${b.transport?.type || 'Transit'} (${b.transport?.operatorName || 'Standard'})
        </p>
        <p class="text-muted small mb-0">
          <i class="bi bi-calendar-event me-1 text-warning"></i>Departure Date: <strong class="text-dark">${travelDateFormatted}</strong>
        </p>
      </div>
      <div class="text-end">
        <div class="fw-bold text-dark fs-4">₹${b.totalAmount?.toLocaleString('en-IN')}</div>
        <div class="small text-muted mb-2">Total Amount</div>
        ${b.status === 'pending' ? `
          <div class="d-flex gap-2 justify-content-end">
            <button class="btn btn-sm btn-warning fw-semibold" onclick="resumePaymentForBooking('${b._id}')">Pay Now</button>
            <button class="btn btn-sm btn-outline-danger" onclick="cancelBooking('${b._id}')">Cancel</button>
          </div>
        ` : ''}
      </div>
    </div>
  </div>`;
}

async function resumePaymentForBooking(bookingId) {
  try {
    const res = await fetch(`${API}/api/bookings/${bookingId}`, { headers: authHeaders() });
    if (!res.ok) throw new Error();
    const data = await res.json();
    selectedBookingId = data._id;
    currentBookingData = data;
    fillPaymentSection(data);
    showSection('payment');
  } catch(e) {
    showToast('Failed to retrieve booking for payment.', 'bg-danger');
  }
}

async function cancelBooking(id) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  try {
    const res = await fetch(`${API}/api/bookings/${id}/cancel`, {
      method: 'PATCH',
      headers: authHeaders()
    });
    if (res.ok) {
      showToast('Booking cancelled.', 'bg-secondary');
      loadMyBookings();
    } else {
      const d = await res.json();
      showToast(d.error || 'Failed to cancel.', 'bg-danger');
    }
  } catch(e) {
    showToast('Network error while cancelling.', 'bg-danger');
  }
}

/* ======================================================
   ADMIN DASHBOARD
====================================================== */
async function loadAdminDashboard() {
  if (!currentUser || currentUser.role !== 'admin') {
    showSection('explore');
    return;
  }
  try {
    const res  = await fetch(`${API}/api/admin/stats`, { headers: authHeaders() });
    const data = await res.json();
    document.getElementById('stat-users').textContent        = data.users || 0;
    document.getElementById('stat-bookings').textContent     = data.bookings || 0;
    document.getElementById('stat-revenue').textContent      = '₹' + (data.totalRevenue || 0).toLocaleString('en-IN');
    document.getElementById('stat-destinations').textContent = data.destinations || 0;
    loadAdminTab('bookings', document.querySelector('#adminTabs .nav-link.active'));
  } catch(e) {
    console.error('Admin load error:', e);
  }
}

async function loadAdminTab(tab, btn) {
  document.querySelectorAll('#adminTabs .nav-link').forEach(l => l.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const container = document.getElementById('adminTabContent');
  container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-warning"></div></div>';

  if (tab === 'bookings') {
    try {
      const res  = await fetch(`${API}/api/admin/bookings`, { headers: authHeaders() });
      const data = await res.json();
      if (!data.length) { container.innerHTML = '<p class="text-muted text-center py-4">No bookings found in system.</p>'; return; }
      container.innerHTML = `
        <div class="table-responsive bg-white rounded-3 shadow-sm p-3">
          <table class="table table-hover admin-table align-middle">
            <thead class="table-dark">
              <tr>
                <th>Booking ID</th><th>Traveller</th><th>Package</th><th>Date</th><th>Amount</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(b => `
                <tr>
                  <td><code class="small">${b._id.slice(-6)}</code></td>
                  <td><strong>${b.user?.name || 'User'}</strong><br><small class="text-muted">${b.user?.email || ''}</small></td>
                  <td>${b.package?.packageName || '—'}</td>
                  <td>${new Date(b.travelDate).toLocaleDateString('en-IN')}</td>
                  <td class="fw-bold">₹${b.totalAmount?.toLocaleString('en-IN')}</td>
                  <td><span class="badge bg-${b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'danger'}">${b.status}</span></td>
                  <td>
                    ${b.status !== 'confirmed' ? `<button class="btn btn-sm btn-outline-success me-1" onclick="updateBookingStatus('${b._id}','confirmed')">Confirm</button>` : ''}
                    ${b.status !== 'cancelled' ? `<button class="btn btn-sm btn-outline-danger" onclick="updateBookingStatus('${b._id}','cancelled')">Cancel</button>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`;
    } catch(e) {
      container.innerHTML = '<p class="text-danger">Failed to load admin bookings.</p>';
    }
  }

  if (tab === 'users') {
    try {
      const res  = await fetch(`${API}/api/admin/users`, { headers: authHeaders() });
      const data = await res.json();
      container.innerHTML = `
        <div class="table-responsive bg-white rounded-3 shadow-sm p-3">
          <table class="table table-hover admin-table align-middle">
            <thead class="table-dark">
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr>
            </thead>
            <tbody>
              ${data.map(u => `
                <tr>
                  <td><strong>${u.name}</strong></td>
                  <td>${u.email}</td>
                  <td>${u.phone || '—'}</td>
                  <td><span class="badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-secondary'}">${u.role}</span></td>
                  <td>${new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`;
    } catch(e) {
      container.innerHTML = '<p class="text-danger">Failed to load users.</p>';
    }
  }
}

async function updateBookingStatus(id, status) {
  try {
    const res = await fetch(`${API}/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      showToast(`Booking marked as ${status}.`);
      loadAdminDashboard();
    }
  } catch(e) {
    showToast('Failed to update status.', 'bg-danger');
  }
}

function showAddDestinationModal() {
  new bootstrap.Modal(document.getElementById('addDestModal')).show();
}

async function submitNewDestination() {
  const name     = document.getElementById('newDestName').value.trim();
  const location = document.getElementById('newDestLocation').value.trim();
  const category = document.getElementById('newDestCategory').value;
  const description = document.getElementById('newDestDesc').value.trim();
  const imageUrl = document.getElementById('newDestImg').value.trim() || DEFAULT_DEST_IMG;
  const errEl    = document.getElementById('addDestError');
  errEl.classList.add('d-none');

  if (!name || !location || !description) {
    errEl.textContent = 'Please fill out name, location, and description.';
    errEl.classList.remove('d-none');
    return;
  }

  try {
    const res = await fetch(`${API}/api/destinations`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name, location, category, description, imageUrl })
    });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.error || 'Failed to add destination.';
      errEl.classList.remove('d-none');
      return;
    }
    bootstrap.Modal.getInstance(document.getElementById('addDestModal')).hide();
    showToast('Destination added successfully! 📍');
    loadDestinations();
  } catch(e) {
    errEl.textContent = 'Network error while adding destination.';
    errEl.classList.remove('d-none');
  }
}

/* ======================================================
   TOAST HELPER
====================================================== */
function showToast(msg, bgClass = 'text-bg-success') {
  const toastEl = document.getElementById('appToast');
  const toastMsg = document.getElementById('toastMsg');
  toastEl.className = `toast align-items-center ${bgClass} border-0 shadow`;
  toastMsg.textContent = msg;
  const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
  toast.show();
}