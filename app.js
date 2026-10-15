// app.js — Frontend client for PHP/MySQL backend
const API = 'api';
let globalHotels = [];
let globalTransports = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => loadDestinations());

// ── Explore ──────────────────────────────────────────────
async function loadDestinations() {
    const search   = document.getElementById('searchInput').value;
    const category = document.getElementById('categoryFilter').value;
    const res  = await fetch(`${API}/explore.php?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`);
    const data = await res.json();
    if (data.status === 'success') {
        globalHotels     = data.hotels;
        globalTransports = data.transports;
        renderDestinations(data.destinations);
        populateDropdowns();
    }
}

function renderDestinations(list) {
    document.getElementById('destinationsGrid').innerHTML = list.map(d => `
        <div class="col-md-6 col-lg-3">
            <div class="card place-card h-100 shadow-sm position-relative">
                <span class="badge bg-warning text-dark badge-category">${d.category}</span>
                <img src="${d.image_url || 'https://via.placeholder.com/400x210?text=No+Image'}" class="card-img-top place-img" alt="${d.name}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title fw-bold mb-1">${d.name}</h5>
                    <p class="text-muted small mb-2">📍 ${d.location} | ⭐ ${d.avg_rating} (${d.review_count})</p>
                    <p class="card-text small text-secondary flex-grow-1">${d.description}</p>
                    <div class="bg-light p-2 rounded mb-3 small">
                        <strong>Pkg:</strong> ${d.package_name || 'Custom Tour'} (${d.duration_days || 1}d) — ₹${Number(d.package_price || 0).toLocaleString('en-IN')}
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-primary btn-sm flex-grow-1"
                            onclick="openBookingModal('${d.package_id}','${d.package_name}',${d.package_price},${d.duration_days})">
                            Book
                        </button>
                        <button class="btn btn-outline-dark btn-sm"
                            onclick="openReviewModal('${d.destination_id}','${d.name}')">
                            Reviews
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function populateDropdowns() {
    document.getElementById('hotelSelect').innerHTML = globalHotels.map(h =>
        `<option value="${h.id}" data-price="${h.price_per_night}">${h.hotel_name} — ₹${h.price_per_night}/night (⭐${h.rating})</option>`
    ).join('');
    document.getElementById('transportSelect').innerHTML = globalTransports.map(t =>
        `<option value="${t.id}" data-price="${t.price}">${t.type} · ${t.operator_name} — ₹${t.price}</option>`
    ).join('');
}

// ── Booking ───────────────────────────────────────────────
function openBookingModal(pkgId, pkgName, pkgPrice, durationDays) {
    document.getElementById('selectedPackageId').value    = pkgId;
    document.getElementById('selectedPackagePrice').value = pkgPrice;
    document.getElementById('selectedDurationDays').value = durationDays;
    document.getElementById('pkgSummaryName').innerText   = pkgName;
    document.getElementById('pkgSummaryDetails').innerText = `${durationDays} Days | Base: ₹${Number(pkgPrice).toLocaleString('en-IN')}`;
    calculateTotal();
    new bootstrap.Modal(document.getElementById('bookingModal')).show();
}

function calculateTotal() {
    const pkgPrice = parseFloat(document.getElementById('selectedPackagePrice').value) || 0;
    const days     = parseInt(document.getElementById('selectedDurationDays').value)   || 1;
    const hotelSel = document.getElementById('hotelSelect');
    const hotelPPN = parseFloat(hotelSel.options[hotelSel.selectedIndex]?.dataset.price || 0);
    const transSel = document.getElementById('transportSelect');
    const transP   = parseFloat(transSel.options[transSel.selectedIndex]?.dataset.price || 0);
    const total    = pkgPrice + (hotelPPN * days) + transP;
    document.getElementById('liveTotalAmount').innerText = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

async function confirmBooking() {
    const payload = {
        user_id:      currentUser?.id,
        package_id:   document.getElementById('selectedPackageId').value,
        hotel_id:     document.getElementById('hotelSelect').value,
        transport_id: document.getElementById('transportSelect').value,
        travel_date:  document.getElementById('travelDate').value,
        payment_mode: document.getElementById('paymentMode').value
    };
    const res    = await fetch(`${API}/book_trip.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await res.json();
    alert(result.message);
    if (result.status === 'success') bootstrap.Modal.getInstance(document.getElementById('bookingModal')).hide();
}

// ── Reviews ───────────────────────────────────────────────
async function openReviewModal(destId, destName) {
    document.getElementById('reviewDestId').value          = destId;
    document.getElementById('reviewModalTitle').innerText  = `Reviews — ${destName}`;
    const res  = await fetch(`${API}/reviews.php?destination_id=${destId}`);
    const data = await res.json();
    const list = data.reviews || [];
    document.getElementById('reviewsList').innerHTML = list.length
        ? list.map(r => `<div class="border-bottom pb-1 mb-1 small"><strong>${r.traveller_name}:</strong> ${r.comment} <span class="text-warning">${'⭐'.repeat(r.rating)}</span></div>`).join('')
        : '<p class="text-muted small">No reviews yet.</p>';
    new bootstrap.Modal(document.getElementById('reviewModal')).show();
}

async function submitReview() {
    const destId = document.getElementById('reviewDestId').value;
    const res    = await fetch(`${API}/reviews.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination_id: destId, user_id: currentUser?.id, rating: document.getElementById('reviewRating').value, comment: document.getElementById('reviewComment').value })
    });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') { document.getElementById('reviewComment').value = ''; openReviewModal(destId, ''); loadDestinations(); }
}

// ── Admin ─────────────────────────────────────────────────
async function openAdminModal() {
    const res  = await fetch(`${API}/reviews.php`);
    const data = await res.json();
    document.getElementById('adminReviewsList').innerHTML = (data.reviews || []).map(r =>
        `<div class="d-flex justify-content-between align-items-center border-bottom py-1 small">
            <span><strong>${r.traveller_name}</strong> on ${r.destination_name}: ${r.comment}</span>
            <button class="btn btn-danger btn-sm ms-2" onclick="deleteReview('${r.review_id}')">Del</button>
        </div>`
    ).join('') || '<p class="text-muted small">No reviews.</p>';
    new bootstrap.Modal(document.getElementById('adminModal')).show();
}

async function addDestinationPackage() {
    const payload = {
        name: document.getElementById('admName').value, location: document.getElementById('admLocation').value,
        category: document.getElementById('admCategory').value, image_url: document.getElementById('admImage').value,
        description: document.getElementById('admDesc').value, package_name: document.getElementById('admPkgName').value,
        duration_days: document.getElementById('admDays').value, price: document.getElementById('admPrice').value
    };
    const res  = await fetch(`${API}/admin.php?action=add_destination_package`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    alert(data.message);
    if (data.status === 'success') { loadDestinations(); bootstrap.Modal.getInstance(document.getElementById('adminModal')).hide(); }
}

async function deleteReview(reviewId) {
    await fetch(`${API}/admin.php?action=delete_review`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ review_id: reviewId }) });
    openAdminModal();
    loadDestinations();
}

// ── Auth ──────────────────────────────────────────────────
async function handleAuth(action) {
    const payload = {
        role: document.getElementById('authRole').value, name: document.getElementById('authName').value,
        email: document.getElementById('authEmail').value, password: document.getElementById('authPass').value,
        phone: document.getElementById('authPhone').value
    };
    const res  = await fetch(`${API}/auth.php?action=${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.message) alert(data.message);
    if (data.user) {
        currentUser = data.user;
        document.getElementById('userGreeting').innerText = `Hi, ${data.user.name}`;
        bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
    }
}
