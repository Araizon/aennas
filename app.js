// ============================================
//  AENNAS — Main App JavaScript
//  Firebase + Google Sheets Integration
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// --- Firebase Init ---
const firebaseConfig = {
    apiKey: "AIzaSyDOZrjLwarenvRNIQMjozUqqfktEtQCfqQ",
    authDomain: "aennasreal.firebaseapp.com",
    projectId: "aennasreal",
    storageBucket: "aennasreal.firebasestorage.app",
    messagingSenderId: "500818612981",
    appId: "1:500818612981:web:f9a7c8f7a7434641ababbc"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Google Sheets Config ---
const SHEET_ID = "1IC_-L2Fd3lppYKiHgVEilLra-L90FJ6_uvrQ6a4dU7k";
const SERVICE_ACCOUNT_EMAIL = "aennas-sheets@aennas-store.iam.gserviceaccount.com";
const SERVICE_ACCOUNT_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCszjkSAYac89FW
PerR6csytymAjAEsVf/OAitduhMdmL6/kLVEyJZSeQr/8OPwEdtYMqTikXZ3f7Ng
biHpM0YYd+98UBQIdEHW7VP7sPzCoUXr9I+z/7NLSBWwHH/WOG3brqy5zAcoYI1r
Fr9tBFfDmbs4WkPLnE4nbOqFNjwtkW3+6z1JgIERNzxnt2vmaNDUBVEOKoqCOPRR
QLMVAGTSld+MaPxu50ybLedbgf7zCJqqWKgl3u+2/HjZ+j8FXmEWkLyriMGr2Xd8
3sH9ucNXRNf+QTuSwJXHQzinVYKa0BhzZz0u6Rcl0IYRGQd9QKdl017IsCkWvyuA
WYzalLuzAgMBAAECggEAIOva4IzM3frvXzxFj784OI2/iN9jW9R4ewFbzKvl92YB
tRI3DoceaFDqIQ9+BV8JiDiBxC5NQP/hpxXkPP7JNGEpDWheIKwxXOZy8QjrZpL9
9LFvbS3iNQ3jH92WFzRB7a/N9Umi9XTLjGLVjkndBIU1r0s3DkPVedpcpYtLFK0H
gGAH7j2MDpfLYEzKrwTyFuQFZj7NaI5algO9tiRC2dupTnG26MJk3DI8ZDAw/LL5
D4fFJ6nny29bsloTa9cGn8YpXKsbkOL9xhKiTTOxox0ClIs9/Qf0cFrePUQQciiK
mJddLq5lUimAsomS1Ps11HCgPa0avoYJmB9S9KChrQKBgQDUA30AmCMV2S++3lDU
MZEesvX9t976eJDSIWpkaaM0Utojpt6lvhb1TjtHPell2yDnNDaTviavy1syhK+f
sn3e2qkSXy9qGmaGjV+XEpI1QimUt1c845dS5dQaWI1qz+cpnY8ZOXBBMpJ0jYaY
fiMeMcli75foF6VzM7M2aavE3QKBgQDQqE6/S98j4iG3IUIy32fgTpi0h6IloEBu
yAzvXCkxMOqiDKlC57I9L+mU3E9yegwZpFokvN7mcfe3S2Hwl5tUZuKg9lYTwIOm
AM3IH9wNmXSVZMAtPiKeX1TMwu3oZ1/hZHLtnNfCCjCXDeUt5Vn8J5gXgF4nJhpn
hX+IW8dxzwKBgQCRdnc8giWIZwQ4O8ZPYFbGLllSo+ZMCY6rbZvWmxgL3VCnp2UZ
aKvN0MghIBxT8x3HI+7SPWPDt42xwpHQyyFLVtErtr0MWmK/rJ3KREamXeezjns/
XpPDn8Z/8QPOJijfR6gX0W3wfac4aqXPWLP1koku5V5fMmIlAXLTQXtFzQKBgGJK
Zo4Gl563r1os+JouUyh+3cBtBBzlWHTXGADJUT4y5NRhUnqJ2pSoNUhCX8p1Y63Q
lgYoUngLx704bXKAeFNSA///Cp1TWrCgQE+9clOVri2RwFWPp48jKTcrvBZ2W9w5
DUqRT7HASxNdIFB2ceUuYZ7wgWm/sUCCyojZcyJRAoGAJlOnZBFwPKzLUW3vLPZZ
pSXodycZwvAqcP39bVr3UOQqkn2SEbRVCHZBZvTRqa1SuSw0G86Z7rI18ieJJ8jh
rMY9eFzwC/s87x/JYAHKAMbAfHx0GvVFEcLtg1sfvXX+Vljd+dfTQnoOT4MbK0vM
o5Z/Mj2EmTl4SjZSwxzlEfQ=
-----END PRIVATE KEY-----`;

// ============================================
// STATE
// ============================================
let cart = JSON.parse(localStorage.getItem('aennas_cart') || '[]');
let allProducts = [];
let currentSlide = 0;
const totalSlides = 4;
let autoSlideInterval;
let currentProductDetail = null;

// ============================================
// SLIDER
// ============================================
function initSlider() {
    const dotsContainer = document.getElementById('sliderDots');
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
    }
    startAutoSlide();
}

function goToSlide(n) {
    currentSlide = ((n % totalSlides) + totalSlides) % totalSlides;
    document.getElementById('slider').style.transform = `translateX(-${currentSlide * 25}%)`;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

window.changeSlide = function (dir) {
    goToSlide(currentSlide + dir);
    resetAutoSlide();
};

function startAutoSlide() {
    autoSlideInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
}
function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

// Touch swipe
let touchStartX = 0;
document.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
document.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { changeSlide(diff > 0 ? 1 : -1); }
});

// ============================================
// NAVBAR SCROLL
// ============================================
window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

// ============================================
// LOAD PRODUCTS FROM FIRESTORE
// ============================================
async function loadProducts() {
    try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        onSnapshot(q, (snapshot) => {
            allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderCategories(allProducts);
            renderProducts(allProducts);
            updateProductCount(allProducts.length);
        });
    } catch (e) {
        console.error('Load products error:', e);
        document.getElementById('productsGrid').innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted)">
        <p>No products yet. Add products from the admin panel.</p>
      </div>`;
    }
}

function updateProductCount(count) {
    const el = document.getElementById('stat-products');
    if (el) el.textContent = count + '+';
}

function renderCategories(products) {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    const filter = document.getElementById('categoryFilter');
    filter.innerHTML = `<button class="cat-btn active" data-cat="all" onclick="filterCategory('all')">All</button>`;
    cats.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'cat-btn';
        btn.dataset.cat = cat;
        btn.textContent = cat;
        btn.onclick = () => filterCategory(cat);
        filter.appendChild(btn);
    });
}

window.filterCategory = function (cat) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
    const filtered = cat === 'all' ? allProducts : allProducts.filter(p => p.category === cat);
    renderProducts(filtered);
};

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!products.length) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted)">No products in this category yet.</div>`;
        return;
    }
    grid.innerHTML = products.map((p, i) => `
    <div class="product-card" style="animation-delay:${i * 0.07}s" onclick="openProductDetail('${p.id}')">
      <div class="product-img-wrap">
        ${p.imageUrl
            ? `<img src="${p.imageUrl}" alt="${p.name}" loading="lazy"/>`
            : `<div class="product-no-img">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span style="font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.1em;color:var(--text-dim)">No Image</span>
            </div>`
        }
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
      </div>
      <div class="product-info">
        ${p.category ? `<p class="product-cat">${p.category}</p>` : ''}
        <h3 class="product-name">${p.name}</h3>
        <p class="product-price">৳${Number(p.price).toLocaleString()}</p>
        <div class="product-actions" onclick="event.stopPropagation()">
          <button class="btn-cart" onclick="addToCart('${p.id}')">Add to Cart</button>
          <button class="btn-buy" onclick="buyNow('${p.id}')">Buy Now</button>
        </div>
      </div>
    </div>`).join('');
}

// ============================================
// PRODUCT DETAIL MODAL
// ============================================
window.openProductDetail = function (id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;
    currentProductDetail = p;
    document.getElementById('pdImg').src = p.imageUrl || '';
    document.getElementById('pdImg').style.display = p.imageUrl ? 'block' : 'none';
    document.getElementById('pdCategory').textContent = p.category || '';
    document.getElementById('pdName').textContent = p.name;
    document.getElementById('pdPrice').textContent = `৳${Number(p.price).toLocaleString()}`;
    document.getElementById('pdDesc').textContent = p.description || '';
    document.getElementById('pdAddCart').onclick = () => { addToCart(id); closeProductDetail(); };
    document.getElementById('pdBuyNow').onclick = () => { addToCart(id); closeProductDetail(); openCheckout(); };
    document.getElementById('productDetailOverlay').classList.add('active');
};
window.closeProductDetail = function () {
    document.getElementById('productDetailOverlay').classList.remove('active');
};

// ============================================
// CART
// ============================================
function saveCart() { localStorage.setItem('aennas_cart', JSON.stringify(cart)); }

function updateCartUI() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const countEl = document.getElementById('cartCount');
    countEl.textContent = count;
    countEl.classList.toggle('visible', count > 0);

    const items = document.getElementById('cartItems');
    const footer = document.getElementById('cartFooter');

    if (!cart.length) {
        items.innerHTML = `<div class="cart-empty"><p>Your cart is empty</p></div>`;
        footer.style.display = 'none';
        return;
    }

    items.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.imageUrl || ''}" alt="${item.name}"
        onerror="this.style.display='none'"
        style="${!item.imageUrl ? 'display:none' : ''}"/>
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">৳${Number(item.price).toLocaleString()}</p>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
          <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">✕</button>
        </div>
      </div>
    </div>`).join('');

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    document.getElementById('cartTotal').textContent = `৳${total.toLocaleString()}`;
    footer.style.display = 'block';
}

window.addToCart = function (id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;
    const existing = cart.find(x => x.id === id);
    if (existing) existing.qty++;
    else cart.push({ id: p.id, name: p.name, price: Number(p.price), imageUrl: p.imageUrl || '', qty: 1 });
    saveCart(); updateCartUI();
    showToast(`${p.name} added to cart ✓`);
};

window.changeQty = function (id, delta) {
    const item = cart.find(x => x.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
    saveCart(); updateCartUI();
};

window.removeFromCart = function (id) {
    cart = cart.filter(x => x.id !== id);
    saveCart(); updateCartUI();
};

window.buyNow = function (id) {
    addToCart(id);
    toggleCart();
    setTimeout(openCheckout, 400);
};

// ============================================
// CART SIDEBAR
// ============================================
window.toggleCart = function () {
    document.getElementById('cartSidebar').classList.toggle('open');
    document.getElementById('cartOverlay').classList.toggle('active');
};

// ============================================
// CHECKOUT
// ============================================
window.openCheckout = function () {
    if (!cart.length) { showToast('Your cart is empty', 'error'); return; }
    // close cart first
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('active');

    // Build order summary
    const summary = document.getElementById('orderSummary');
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    summary.innerHTML = cart.map(i => `
    <div class="order-summary-item">
      <span>${i.name} × ${i.qty}</span>
      <span>৳${(i.price * i.qty).toLocaleString()}</span>
    </div>`).join('') + `
    <div class="order-summary-total">
      <span>Total</span><span>৳${total.toLocaleString()}</span>
    </div>`;

    document.getElementById('checkoutOverlay').classList.add('active');
};

window.closeCheckout = function () {
    document.getElementById('checkoutOverlay').classList.remove('active');
};

// Close modals on overlay click
document.getElementById('checkoutOverlay').addEventListener('click', function (e) {
    if (e.target === this) closeCheckout();
});
document.getElementById('productDetailOverlay').addEventListener('click', function (e) {
    if (e.target === this) closeProductDetail();
});

// ============================================
// PLACE ORDER — Firestore + Google Sheets
// ============================================
window.placeOrder = async function () {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const note = document.getElementById('custNote').value.trim();

    if (!name || !phone || !address) {
        showToast('Please fill in Name, Phone & Address', 'error'); return;
    }

    const btn = document.getElementById('placeOrderBtn');
    const btnText = document.getElementById('orderBtnText');
    btn.disabled = true;
    btnText.textContent = 'Placing Order...';

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const orderData = {
        customer: { name, phone, email, address, note },
        items: cart,
        total,
        status: 'pending',
        createdAt: new Date().toISOString(),
        orderNumber: 'AEN-' + Date.now()
    };

    try {
        // 1. Save to Firestore
        const { addDoc, collection: col } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        await addDoc(col(db, 'orders'), orderData);

        // 2. Save to Google Sheets
        await appendToGoogleSheets(orderData);

        // Success
        cart = []; saveCart(); updateCartUI();
        closeCheckout();
        showToast(`Order ${orderData.orderNumber} placed! ✓`, 'success');
        ['custName', 'custPhone', 'custEmail', 'custAddress', 'custNote'].forEach(id => {
            document.getElementById(id).value = '';
        });
    } catch (err) {
        console.error('Order error:', err);
        showToast('Order failed. Please try WhatsApp.', 'error');
    } finally {
        btn.disabled = false;
        btnText.textContent = 'Place Order';
    }
};

// ============================================
// GOOGLE SHEETS — JWT Auth + Append
// ============================================
async function appendToGoogleSheets(order) {
    try {
        const token = await getGoogleAccessToken();
        const row = [
            order.orderNumber,
            new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' }),
            order.customer.name,
            order.customer.phone,
            order.customer.email,
            order.customer.address,
            order.items.map(i => `${i.name} x${i.qty}`).join(', '),
            `৳${order.total.toLocaleString()}`,
            order.status,
            order.customer.note
        ];

        const res = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A:J:append?valueInputOption=USER_ENTERED`,
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ values: [row] })
            }
        );
        if (!res.ok) throw new Error(await res.text());
    } catch (e) {
        console.error('Sheets error:', e);
        // Non-fatal — order still saved in Firestore
    }
}

async function getGoogleAccessToken() {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
        iss: SERVICE_ACCOUNT_EMAIL,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
    };

    const encodeB64 = obj => btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const headerB64 = encodeB64(header);
    const payloadB64 = encodeB64(payload);
    const sigInput = `${headerB64}.${payloadB64}`;

    // Import key and sign
    const keyData = SERVICE_ACCOUNT_KEY
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\s+/g, '');
    const keyBuffer = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
        'pkcs8', keyBuffer.buffer,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false, ['sign']
    );
    const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(sigInput));
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const jwt = `${sigInput}.${sigB64}`;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
    });
    const data = await tokenRes.json();
    if (!data.access_token) throw new Error('No access token');
    return data.access_token;
}

// ============================================
// TOAST
// ============================================
function showToast(msg, type = '') {
    const t = document.createElement('div');
    t.className = `toast${type ? ' ' + type : ''}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3500);
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initSlider();
    loadProducts();
    updateCartUI();
});