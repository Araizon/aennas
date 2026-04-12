// ============================================
//  AENNAS — Main App JS v2
//  Infinite Circular Slider | Firebase | Sheets
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Google Sheets
const SHEET_ID = "1IC_-L2Fd3lppYKiHgVEilLra-L90FJ6_uvrQ6a4dU7k";
const SA_EMAIL = "aennas-sheets@aennas-store.iam.gserviceaccount.com";
const SA_KEY = `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCszjkSAYac89FW\nPerR6csytymAjAEsVf/OAitduhMdmL6/kLVEyJZSeQr/8OPwEdtYMqTikXZ3f7Ng\nbiHpM0YYd+98UBQIdEHW7VP7sPzCoUXr9I+z/7NLSBWwHH/WOG3brqy5zAcoYI1r\nFr9tBFfDmbs4WkPLnE4nbOqFNjwtkW3+6z1JgIERNzxnt2vmaNDUBVEOKoqCOPRR\nQLMVAGTSld+MaPxu50ybLedbgf7zCJqqWKgl3u+2/HjZ+j8FXmEWkLyriMGr2Xd8\n3sH9ucNXRNf+QTuSwJXHQzinVYKa0BhzZz0u6Rcl0IYRGQd9QKdl017IsCkWvyuA\nWYzalLuzAgMBAAECggEAIOva4IzM3frvXzxFj784OI2/iN9jW9R4ewFbzKvl92YB\ntRI3DoceaFDqIQ9+BV8JiDiBxC5NQP/hpxXkPP7JNGEpDWheIKwxXOZy8QjrZpL9\n9LFvbS3iNQ3jH92WFzRB7a/N9Umi9XTLjGLVjkndBIU1r0s3DkPVedpcpYtLFK0H\ngGAH7j2MDpfLYEzKrwTyFuQFZj7NaI5algO9tiRC2dupTnG26MJk3DI8ZDAw/LL5\nD4fFJ6nny29bsloTa9cGn8YpXKsbkOL9xhKiTTOxox0ClIs9/Qf0cFrePUQQciiK\nmJddLq5lUimAsomS1Ps11HCgPa0avoYJmB9S9KChrQKBgQDUA30AmCMV2S++3lDU\nMZEesvX9t976eJDSIWpkaaM0Utojpt6lvhb1TjtHPell2yDnNDaTviavy1syhK+f\nsn3e2qkSXy9qGmaGjV+XEpI1QimUt1c845dS5dQaWI1qz+cpnY8ZOXBBMpJ0jYaY\nfiMeMcli75foF6VzM7M2aavE3QKBgQDQqE6/S98j4iG3IUIy32fgTpi0h6IloEBu\nyAzvXCkxMOqiDKlC57I9L+mU3E9yegwZpFokvN7mcfe3S2Hwl5tUZuKg9lYTwIOm\nAM3IH9wNmXSVZMAtPiKeX1TMwu3oZ1/hZHLtnNfCCjCXDeUt5Vn8J5gXgF4nJhpn\nhX+IW8dxzwKBgQCRdnc8giWIZwQ4O8ZPYFbGLllSo+ZMCY6rbZvWmxgL3VCnp2UZ\naKvN0MghIBxT8x3HI+7SPWPDt42xwpHQyyFLVtErtr0MWmK/rJ3KREamXeezjns/\nXpPDn8Z/8QPOJijfR6gX0W3wfac4aqXPWLP1koku5V5fMmIlAXLTQXtFzQKBgGJK\nZo4Gl563r1os+JouUyh+3cBtBBzlWHTXGADJUT4y5NRhUnqJ2pSoNUhCX8p1Y63Q\nlgYoUngLx704bXKAeFNSA///Cp1TWrCgQE+9clOVri2RwFWPp48jKTcrvBZ2W9w5\nDUqRT7HASxNdIFB2ceUuYZ7wgWm/sUCCyojZcyJRAoGAJlOnZBFwPKzLUW3vLPZZ\npSXodycZwvAqcP39bVr3UOQqkn2SEbRVCHZBZvTRqa1SuSw0G86Z7rI18ieJJ8jh\nrMY9eFzwC/s87x/JYAHKAMbAfHx0GvVFEcLtg1sfvXX+Vljd+dfTQnoOT4MbK0vM\no5Z/Mj2EmTl4SjZSwxzlEfQ=\n-----END PRIVATE KEY-----`;

// ============================================
// STATE
// ============================================
let cart = JSON.parse(localStorage.getItem('aennas_cart') || '[]');
let allProducts = [];
let currentSlide = 0;
const TOTAL_SLIDES = 4;
let autoSlideInterval;
let isAnimating = false;

// ============================================
// PAGE LOADER
// ============================================
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('pageLoader').classList.add('hidden');
    }, 2400);
});

// ============================================
// NAVBAR SCROLL
// ============================================
window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

// ============================================
// MOBILE MENU
// ============================================
window.toggleMobileMenu = function () {
    const nav = document.getElementById('navLinks');
    const ham = document.getElementById('hamburger');
    const overlay = document.getElementById('mobileOverlay');
    nav.classList.toggle('open');
    ham.classList.toggle('open');
    overlay.classList.toggle('active');
};
window.closeMobileMenu = function () {
    document.getElementById('navLinks').classList.remove('open');
    document.getElementById('hamburger').classList.remove('open');
    document.getElementById('mobileOverlay').classList.remove('active');
};

// ============================================
// CIRCULAR SLIDER (4→1 goes RIGHT, not left)
// ============================================
function initSlider() {
    const dotsWrap = document.getElementById('sliderDots');
    for (let i = 0; i < TOTAL_SLIDES; i++) {
        const d = document.createElement('div');
        d.className = 'dot' + (i === 0 ? ' active' : '');
        d.onclick = () => goToSlide(i, i > currentSlide ? 1 : -1);
        dotsWrap.appendChild(d);
    }
    startAuto();
}

function goToSlide(next, direction) {
    if (isAnimating || next === currentSlide) return;
    isAnimating = true;

    const slides = document.querySelectorAll('.slide');
    const prevSlide = slides[currentSlide];
    const nextSlide = slides[next];

    // Remove active from current
    prevSlide.classList.remove('active');

    // Add direction animation class to incoming slide
    nextSlide.classList.remove('slide-in-right', 'slide-in-left');
    void nextSlide.offsetWidth; // force reflow
    nextSlide.classList.add(direction >= 0 ? 'slide-in-right' : 'slide-in-left');
    nextSlide.classList.add('active');

    // Update dots
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === next));

    currentSlide = next;

    setTimeout(() => {
        nextSlide.classList.remove('slide-in-right', 'slide-in-left');
        isAnimating = false;
    }, 950);
}

window.changeSlide = function (dir) {
    resetAuto();
    // CIRCULAR: 4 → 1 goes dir=+1 (comes from RIGHT), 1 → 4 goes dir=-1 (comes from LEFT)
    const next = ((currentSlide + dir) % TOTAL_SLIDES + TOTAL_SLIDES) % TOTAL_SLIDES;
    goToSlide(next, dir);
};

function startAuto() {
    autoSlideInterval = setInterval(() => {
        const next = (currentSlide + 1) % TOTAL_SLIDES;
        goToSlide(next, 1); // always moves right (+1)
    }, 5000);
}
function resetAuto() {
    clearInterval(autoSlideInterval);
    startAuto();
}

// Touch swipe support
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) window.changeSlide(diff > 0 ? 1 : -1);
});

// ============================================
// SCROLL REVEAL
// ============================================
function initScrollReveal() {
    const targets = document.querySelectorAll('.pillar, .stat, .about-text, .section-header, .product-card');
    targets.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) {
                setTimeout(() => e.target.classList.add('visible'), i * 80);
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });

    targets.forEach(el => observer.observe(el));
}

// ============================================
// LOAD PRODUCTS
// ============================================
function loadProducts() {
    try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        onSnapshot(q, snap => {
            allProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            renderCategories(allProducts);
            renderProducts(allProducts);
            const el = document.getElementById('stat-products');
            if (el) el.textContent = allProducts.length + '+';
        });
    } catch (e) {
        document.getElementById('productsGrid').innerHTML =
            `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted)"><p>Add products from the admin panel.</p></div>`;
    }
}

function renderCategories(products) {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    const wrap = document.getElementById('categoryFilter');
    wrap.innerHTML = `<button class="cat-btn active" data-cat="all" onclick="filterCategory('all')">All</button>`;
    cats.forEach(c => {
        const b = document.createElement('button');
        b.className = 'cat-btn'; b.dataset.cat = c; b.textContent = c;
        b.onclick = () => filterCategory(c);
        wrap.appendChild(b);
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
    <div class="product-card reveal" style="animation-delay:${i * 0.06}s" onclick="openProductDetail('${p.id}')">
      <div class="product-img-wrap">
        ${p.imageUrl
            ? `<img src="${p.imageUrl}" alt="${p.name}" loading="lazy"/>`
            : `<div class="product-no-img" style="min-height:200px">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span style="font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.1em;color:var(--text-dim)">No Image</span>
            </div>`
        }
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
      </div>
      <div class="product-info">
        ${p.category ? `<p class="product-cat">${p.category}</p>` : ''}
        <h3 class="product-name">${p.name}</h3>
        <p class="product-price">৳${Number(p.price).toLocaleString()}</p>
        <div class="product-actions" onclick="event.stopPropagation()">
          <button class="btn-cart" onclick="addToCart('${p.id}')">+ Cart</button>
          <button class="btn-buy" onclick="buyNow('${p.id}')">Buy Now</button>
        </div>
      </div>
    </div>`).join('');

    // Re-observe new cards
    setTimeout(() => {
        document.querySelectorAll('.product-card.reveal:not(.visible)').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 60);
        });
    }, 100);
}

// ============================================
// PRODUCT DETAIL
// ============================================
window.openProductDetail = function (id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;
    const img = document.getElementById('pdImg');
    img.src = p.imageUrl || '';
    img.style.display = p.imageUrl ? 'block' : 'none';
    document.getElementById('pdCategory').textContent = p.category || '';
    document.getElementById('pdName').textContent = p.name;
    document.getElementById('pdPrice').textContent = `৳${Number(p.price).toLocaleString()}`;
    document.getElementById('pdDesc').textContent = p.description || '';
    document.getElementById('pdAddCart').onclick = () => { addToCart(id); closeProductDetail(); };
    document.getElementById('pdBuyNow').onclick = () => { addToCart(id); closeProductDetail(); openCheckout(); };
    document.getElementById('productDetailOverlay').classList.add('active');
};
window.closeProductDetail = () => document.getElementById('productDetailOverlay').classList.remove('active');

// ============================================
// CART
// ============================================
function saveCart() { localStorage.setItem('aennas_cart', JSON.stringify(cart)); }

function updateCartUI() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const el = document.getElementById('cartCount');
    el.textContent = count;
    el.classList.toggle('visible', count > 0);

    const items = document.getElementById('cartItems');
    const footer = document.getElementById('cartFooter');

    if (!cart.length) {
        items.innerHTML = `<div class="cart-empty"><p>Your cart is empty</p></div>`;
        footer.style.display = 'none';
        return;
    }
    items.innerHTML = cart.map(item => `
    <div class="cart-item">
      ${item.imageUrl ? `<img class="cart-item-img" src="${item.imageUrl}" alt="${item.name}" onerror="this.style.display='none'"/>` : ''}
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">৳${Number(item.price).toLocaleString()}</p>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button>
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
    const ex = cart.find(x => x.id === id);
    if (ex) ex.qty++;
    else cart.push({ id: p.id, name: p.name, price: Number(p.price), imageUrl: p.imageUrl || '', qty: 1 });
    saveCart(); updateCartUI();
    showToast(`${p.name} added ✓`);
};
window.changeQty = function (id, d) {
    const item = cart.find(x => x.id === id);
    if (!item) return;
    item.qty += d;
    if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
    saveCart(); updateCartUI();
};
window.removeFromCart = function (id) {
    cart = cart.filter(x => x.id !== id);
    saveCart(); updateCartUI();
};
window.buyNow = function (id) {
    addToCart(id);
    setTimeout(openCheckout, 200);
};
window.toggleCart = function () {
    document.getElementById('cartSidebar').classList.toggle('open');
    document.getElementById('cartOverlay').classList.toggle('active');
};

// ============================================
// CHECKOUT
// ============================================
window.openCheckout = function () {
    if (!cart.length) { showToast('Cart is empty', 'error'); return; }
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('active');

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    document.getElementById('orderSummary').innerHTML =
        cart.map(i => `<div class="order-summary-item"><span>${i.name} ×${i.qty}</span><span>৳${(i.price * i.qty).toLocaleString()}</span></div>`).join('') +
        `<div class="order-summary-total"><span>Total</span><span>৳${total.toLocaleString()}</span></div>`;
    document.getElementById('checkoutOverlay').classList.add('active');
};
window.closeCheckout = () => document.getElementById('checkoutOverlay').classList.remove('active');

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('checkoutOverlay').addEventListener('click', e => { if (e.target.id === 'checkoutOverlay') closeCheckout(); });
    document.getElementById('productDetailOverlay').addEventListener('click', e => { if (e.target.id === 'productDetailOverlay') closeProductDetail(); });
});

// ============================================
// PLACE ORDER
// ============================================
window.placeOrder = async function () {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const note = document.getElementById('custNote').value.trim();

    if (!name || !phone || !address) { showToast('Name, Phone & Address required', 'error'); return; }

    const btn = document.getElementById('placeOrderBtn');
    const btnText = document.getElementById('orderBtnText');
    btn.disabled = true; btnText.textContent = 'Placing...';

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const order = {
        customer: { name, phone, email, address, note },
        items: cart, total, status: 'pending',
        createdAt: new Date().toISOString(),
        orderNumber: 'AEN-' + Date.now()
    };

    try {
        await addDoc(collection(db, 'orders'), order);
        await appendToSheets(order).catch(e => console.warn('Sheets:', e));
        cart = []; saveCart(); updateCartUI();
        closeCheckout();
        ['custName', 'custPhone', 'custEmail', 'custAddress', 'custNote'].forEach(id => { document.getElementById(id).value = ''; });
        showToast(`Order ${order.orderNumber} placed! ✓`, 'success');
    } catch (err) {
        console.error(err);
        showToast('Error. Try WhatsApp.', 'error');
    } finally {
        btn.disabled = false; btnText.textContent = 'Place Order';
    }
};

// ============================================
// GOOGLE SHEETS
// ============================================
async function appendToSheets(order) {
    const token = await getGToken();
    const row = [
        order.orderNumber,
        new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' }),
        order.customer.name, order.customer.phone, order.customer.email,
        order.customer.address,
        order.items.map(i => `${i.name} x${i.qty}`).join(', '),
        `৳${order.total.toLocaleString()}`, order.status, order.customer.note
    ];
    const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A:J:append?valueInputOption=USER_ENTERED`,
        { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ values: [row] }) }
    );
    if (!res.ok) throw new Error(await res.text());
}

async function getGToken() {
    const now = Math.floor(Date.now() / 1000);
    const enc = obj => btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const h = enc({ alg: 'RS256', typ: 'JWT' });
    const p = enc({ iss: SA_EMAIL, scope: 'https://www.googleapis.com/auth/spreadsheets', aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now });
    const si = `${h}.${p}`;
    const kd = SA_KEY.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s+/g, '');
    const kb = Uint8Array.from(atob(kd), c => c.charCodeAt(0));
    const ck = await crypto.subtle.importKey('pkcs8', kb.buffer, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', ck, new TextEncoder().encode(si));
    const sb = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const jwt = `${si}.${sb}`;
    const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}` });
    const td = await tr.json();
    if (!td.access_token) throw new Error('No token');
    return td.access_token;
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
    setTimeout(initScrollReveal, 500);
});