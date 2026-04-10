// ============================================
//  AENNAS — Admin Panel JavaScript
//  Full Firebase CRUD + Auth
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc,
    doc, query, orderBy, onSnapshot, serverTimestamp, getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
    getStorage, ref, uploadBytes, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ============================================
// AUTH
// ============================================
onAuthStateChanged(auth, user => {
    if (user) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'flex';
        initAdmin();
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
    }
});

window.doLogin = async function () {
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPass').value;
    const btn = document.getElementById('loginBtn');
    const err = document.getElementById('loginError');
    err.textContent = '';
    if (!email || !pass) { err.textContent = 'Please enter email and password'; return; }
    btn.disabled = true; btn.textContent = 'Signing in...';
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
        err.textContent = 'Invalid email or password';
        btn.disabled = false; btn.textContent = 'Sign In';
    }
};

window.doLogout = async function () {
    await signOut(auth);
};

// Enter key on login
document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.getElementById('loginScreen').style.display !== 'none') doLogin();
});

// ============================================
// INIT ADMIN
// ============================================
function initAdmin() {
    loadDashboard();
    loadProducts();
    loadOrders();
    loadCategories();
}

// ============================================
// TAB SWITCHING
// ============================================
window.switchTab = function (tab, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    el.classList.add('active');
    return false;
};

// ============================================
// DASHBOARD
// ============================================
function loadDashboard() {
    onSnapshot(collection(db, 'products'), snap => {
        document.getElementById('totalProducts').textContent = snap.size;
    });
    onSnapshot(collection(db, 'orders'), snap => {
        const orders = snap.docs.map(d => d.data());
        document.getElementById('totalOrders').textContent = orders.length;
        const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
        document.getElementById('totalRevenue').textContent = `৳${revenue.toLocaleString()}`;
        const pending = orders.filter(o => o.status === 'pending').length;
        document.getElementById('pendingOrders').textContent = pending;

        // Recent orders table
        const recent = snap.docs.map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 8);
        renderRecentOrders(recent);
    });
}

function renderRecentOrders(orders) {
    const el = document.getElementById('recentOrdersList');
    if (!orders.length) { el.innerHTML = '<p class="empty-msg">No orders yet.</p>'; return; }
    el.innerHTML = `<table class="data-table">
    <thead><tr>
      <th>Order #</th><th>Customer</th><th>Phone</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th>
    </tr></thead>
    <tbody>${orders.map(o => `<tr>
      <td style="font-family:var(--font-mono);font-size:0.78rem">${o.orderNumber || '—'}</td>
      <td>${o.customer?.name || '—'}</td>
      <td>${o.customer?.phone || '—'}</td>
      <td class="price-cell">৳${(o.total || 0).toLocaleString()}</td>
      <td><span class="status-badge ${o.status}">${o.status}</span></td>
      <td style="font-size:0.78rem;color:var(--text-muted)">${formatDate(o.createdAt)}</td>
      <td><button class="btn-view" onclick="openOrderDetail('${o.id}')">View</button></td>
    </tr>`).join('')}</tbody>
  </table>`;
}

// ============================================
// PRODUCTS
// ============================================
let allAdminProducts = [];
let allCategories = [];

function loadProducts() {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    onSnapshot(q, snap => {
        allAdminProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderProductsTable(allAdminProducts);
        populateCategorySelects();
    });
}

window.searchProducts = function () {
    const search = document.getElementById('productSearch').value.toLowerCase();
    const cat = document.getElementById('productCatFilter').value;
    const filtered = allAdminProducts.filter(p =>
        (!search || p.name.toLowerCase().includes(search)) &&
        (!cat || p.category === cat)
    );
    renderProductsTable(filtered);
};

function renderProductsTable(products) {
    const el = document.getElementById('productsTable');
    if (!products.length) {
        el.innerHTML = '<p class="empty-msg">No products found. Add your first product!</p>'; return;
    }
    el.innerHTML = `<table class="data-table">
    <thead><tr>
      <th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th>
    </tr></thead>
    <tbody>${products.map(p => `<tr>
      <td>${p.imageUrl
            ? `<img src="${p.imageUrl}" class="product-thumb" alt="${p.name}"/>`
            : `<div class="no-thumb">◈</div>`}</td>
      <td><div class="product-name-cell">${p.name}</div>
          ${p.badge ? `<span style="font-size:0.65rem;color:var(--orange)">${p.badge}</span>` : ''}</td>
      <td>${p.category ? `<span class="product-cat-badge">${p.category}</span>` : '—'}</td>
      <td class="price-cell">৳${Number(p.price).toLocaleString()}</td>
      <td><span class="status-badge ${p.stock || 'in_stock'}">${(p.stock || 'in_stock').replace('_', ' ')}</span></td>
      <td><div class="action-btns">
        <button class="btn-edit" onclick="editProduct('${p.id}')">Edit</button>
        <button class="btn-delete" onclick="confirmDeleteProduct('${p.id}','${p.name}')">Delete</button>
      </div></td>
    </tr>`).join('')}</tbody>
  </table>`;
}

// ============================================
// PRODUCT MODAL
// ============================================
window.openProductModal = function () {
    document.getElementById('productModalTitle').textContent = 'Add Product';
    document.getElementById('editProductId').value = '';
    document.getElementById('pName').value = '';
    document.getElementById('pPrice').value = '';
    document.getElementById('pCategory').value = '';
    document.getElementById('pBadge').value = '';
    document.getElementById('pDesc').value = '';
    document.getElementById('pImgUrl').value = '';
    document.getElementById('pStock').value = 'in_stock';
    document.getElementById('imgPreviewWrap').innerHTML = `
    <span class="upload-icon">⊕</span>
    <p>Click to upload image</p>
    <small>JPG, PNG, WEBP — max 5MB</small>`;
    document.getElementById('productModal').classList.add('active');
};

window.closeProductModal = function () {
    document.getElementById('productModal').classList.remove('active');
};

window.editProduct = function (id) {
    const p = allAdminProducts.find(x => x.id === id);
    if (!p) return;
    document.getElementById('productModalTitle').textContent = 'Edit Product';
    document.getElementById('editProductId').value = id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pPrice').value = p.price;
    document.getElementById('pCategory').value = p.category || '';
    document.getElementById('pBadge').value = p.badge || '';
    document.getElementById('pDesc').value = p.description || '';
    document.getElementById('pImgUrl').value = p.imageUrl || '';
    document.getElementById('pStock').value = p.stock || 'in_stock';
    if (p.imageUrl) {
        document.getElementById('imgPreviewWrap').innerHTML = `<img src="${p.imageUrl}" class="img-preview" alt="preview"/>`;
    }
    document.getElementById('productModal').classList.add('active');
};

window.previewImage = function (event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById('imgPreviewWrap').innerHTML = `<img src="${e.target.result}" class="img-preview" alt="preview"/>`;
    };
    reader.readAsDataURL(file);
};

window.saveProduct = async function () {
    const name = document.getElementById('pName').value.trim();
    const price = document.getElementById('pPrice').value.trim();
    const category = document.getElementById('pCategory').value;
    const badge = document.getElementById('pBadge').value.trim();
    const description = document.getElementById('pDesc').value.trim();
    const imgUrl = document.getElementById('pImgUrl').value.trim();
    const stock = document.getElementById('pStock').value;
    const editId = document.getElementById('editProductId').value;
    const imgFile = document.getElementById('pImgFile').files[0];

    if (!name || !price) { adminToast('Name and price are required', 'error'); return; }

    const btn = document.getElementById('saveProductBtn');
    btn.disabled = true; btn.textContent = 'Saving...';

    try {
        let imageUrl = imgUrl;

        // Upload image if file selected
        if (imgFile) {
            const storageRef = ref(storage, `products/${Date.now()}_${imgFile.name}`);
            await uploadBytes(storageRef, imgFile);
            imageUrl = await getDownloadURL(storageRef);
        }

        const data = {
            name, price: Number(price), category, badge, description,
            imageUrl, stock, updatedAt: new Date().toISOString()
        };

        if (editId) {
            await updateDoc(doc(db, 'products', editId), data);
            adminToast('Product updated ✓', 'success');
        } else {
            data.createdAt = new Date().toISOString();
            await addDoc(collection(db, 'products'), data);
            adminToast('Product added ✓', 'success');
        }
        closeProductModal();
    } catch (e) {
        console.error(e);
        adminToast('Error saving product', 'error');
    } finally {
        btn.disabled = false; btn.textContent = 'Save Product';
    }
};

// ============================================
// DELETE
// ============================================
let deleteCallback = null;

window.confirmDeleteProduct = function (id, name) {
    document.getElementById('deleteMsg').textContent = `Delete "${name}"? This cannot be undone.`;
    document.getElementById('confirmDeleteBtn').onclick = async () => {
        try {
            await deleteDoc(doc(db, 'products', id));
            adminToast('Product deleted', 'success');
        } catch (e) { adminToast('Error deleting', 'error'); }
        closeDeleteModal();
    };
    document.getElementById('deleteModal').classList.add('active');
};

window.closeDeleteModal = function () {
    document.getElementById('deleteModal').classList.remove('active');
};

// ============================================
// ORDERS
// ============================================
let allOrders = [];

function loadOrders() {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    onSnapshot(q, snap => {
        allOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderOrdersTable(allOrders);
    });
}

window.loadOrders = function () {
    const statusFilter = document.getElementById('orderStatusFilter')?.value || '';
    const filtered = statusFilter ? allOrders.filter(o => o.status === statusFilter) : allOrders;
    renderOrdersTable(filtered);
};

function renderOrdersTable(orders) {
    const el = document.getElementById('ordersTable');
    if (!orders.length) {
        el.innerHTML = '<p class="empty-msg">No orders yet.</p>'; return;
    }
    el.innerHTML = `<table class="data-table">
    <thead><tr>
      <th>Order #</th><th>Customer</th><th>Phone</th><th>Address</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th>
    </tr></thead>
    <tbody>${orders.map(o => `<tr>
      <td style="font-family:var(--font-mono);font-size:0.78rem">${o.orderNumber || '—'}</td>
      <td>${o.customer?.name || '—'}</td>
      <td>${o.customer?.phone || '—'}</td>
      <td style="max-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${o.customer?.address || '—'}</td>
      <td style="font-size:0.78rem;color:var(--text-muted)">${(o.items || []).length} item(s)</td>
      <td class="price-cell">৳${(o.total || 0).toLocaleString()}</td>
      <td><span class="status-badge ${o.status}">${o.status}</span></td>
      <td style="font-size:0.78rem;color:var(--text-muted)">${formatDate(o.createdAt)}</td>
      <td><button class="btn-view" onclick="openOrderDetail('${o.id}')">View</button></td>
    </tr>`).join('')}</tbody>
  </table>`;
}

window.openOrderDetail = function (id) {
    const o = allOrders.find(x => x.id === id);
    if (!o) return;
    document.getElementById('currentOrderId').value = id;

    const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    document.getElementById('orderStatusSelect').innerHTML = statuses.map(s =>
        `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`
    ).join('');

    document.getElementById('orderDetailBody').innerHTML = `
    <div class="order-detail-grid">
      <div class="od-section">
        <h4>Customer Info</h4>
        <div class="od-row"><span>Name</span><span>${o.customer?.name || '—'}</span></div>
        <div class="od-row"><span>Phone</span><span>${o.customer?.phone || '—'}</span></div>
        <div class="od-row"><span>Email</span><span>${o.customer?.email || '—'}</span></div>
        <div class="od-row"><span>Address</span><span>${o.customer?.address || '—'}</span></div>
        ${o.customer?.note ? `<div class="od-row"><span>Note</span><span>${o.customer.note}</span></div>` : ''}
      </div>
      <div class="od-section">
        <h4>Order Info</h4>
        <div class="od-row"><span>Order #</span><span style="font-family:var(--font-mono)">${o.orderNumber || '—'}</span></div>
        <div class="od-row"><span>Status</span><span><span class="status-badge ${o.status}">${o.status}</span></span></div>
        <div class="od-row"><span>Date</span><span>${formatDate(o.createdAt)}</span></div>
      </div>
    </div>
    <div class="od-items-list">
      <h4 style="font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);margin-bottom:12px">Items Ordered</h4>
      ${(o.items || []).map(i => `
        <div class="od-item">
          <span>${i.name} × ${i.qty}</span>
          <span style="font-family:var(--font-mono);color:var(--gold)">৳${(i.price * i.qty).toLocaleString()}</span>
        </div>`).join('')}
      <div class="od-total">
        <span>Total</span><span>৳${(o.total || 0).toLocaleString()}</span>
      </div>
    </div>`;

    document.getElementById('orderDetailModal').classList.add('active');
};

window.closeOrderDetail = function () {
    document.getElementById('orderDetailModal').classList.remove('active');
};

window.updateOrderStatus = async function () {
    const id = document.getElementById('currentOrderId').value;
    const status = document.getElementById('orderStatusSelect').value;
    try {
        await updateDoc(doc(db, 'orders', id), { status, updatedAt: new Date().toISOString() });
        adminToast('Order status updated ✓', 'success');
        closeOrderDetail();
    } catch (e) { adminToast('Error updating status', 'error'); }
};

// ============================================
// CATEGORIES
// ============================================
let allCats = [];

function loadCategories() {
    onSnapshot(collection(db, 'categories'), snap => {
        allCats = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderCategories(allCats);
        populateCategorySelects();
    });
}

function renderCategories(cats) {
    const el = document.getElementById('categoriesList');
    if (!cats.length) {
        el.innerHTML = '<p class="empty-msg">No categories yet.</p>'; return;
    }
    el.innerHTML = cats.map(c => `
    <div class="cat-card">
      <div>
        <div class="cat-name">${c.name}</div>
        ${c.description ? `<div class="cat-desc">${c.description}</div>` : ''}
      </div>
      <div class="cat-actions">
        <button class="btn-edit" onclick="editCat('${c.id}')">Edit</button>
        <button class="btn-delete" onclick="confirmDeleteCat('${c.id}','${c.name}')">✕</button>
      </div>
    </div>`).join('');
}

function populateCategorySelects() {
    const cats = allCats.length > 0 ? allCats : [];
    const adminCats = cats.map(c => c.name);

    // Product modal category select
    const pCat = document.getElementById('pCategory');
    if (pCat) {
        const cur = pCat.value;
        pCat.innerHTML = '<option value="">Select Category</option>' +
            adminCats.map(c => `<option value="${c}" ${c === cur ? 'selected' : ''}>${c}</option>`).join('');
    }

    // Product filter
    const filter = document.getElementById('productCatFilter');
    if (filter) {
        const cur2 = filter.value;
        filter.innerHTML = '<option value="">All Categories</option>' +
            adminCats.map(c => `<option value="${c}" ${c === cur2 ? 'selected' : ''}>${c}</option>`).join('');
    }
}

window.openCatModal = function () {
    document.getElementById('catModalTitle').textContent = 'Add Category';
    document.getElementById('catName').value = '';
    document.getElementById('catDesc').value = '';
    document.getElementById('editCatId').value = '';
    document.getElementById('catModal').classList.add('active');
};

window.closeCatModal = function () {
    document.getElementById('catModal').classList.remove('active');
};

window.editCat = function (id) {
    const c = allCats.find(x => x.id === id);
    if (!c) return;
    document.getElementById('catModalTitle').textContent = 'Edit Category';
    document.getElementById('catName').value = c.name;
    document.getElementById('catDesc').value = c.description || '';
    document.getElementById('editCatId').value = id;
    document.getElementById('catModal').classList.add('active');
};

window.saveCategory = async function () {
    const name = document.getElementById('catName').value.trim();
    const desc = document.getElementById('catDesc').value.trim();
    const editId = document.getElementById('editCatId').value;
    if (!name) { adminToast('Category name required', 'error'); return; }
    try {
        if (editId) {
            await updateDoc(doc(db, 'categories', editId), { name, description: desc });
            adminToast('Category updated ✓', 'success');
        } else {
            await addDoc(collection(db, 'categories'), { name, description: desc, createdAt: new Date().toISOString() });
            adminToast('Category added ✓', 'success');
        }
        closeCatModal();
    } catch (e) { adminToast('Error saving category', 'error'); }
};

window.confirmDeleteCat = function (id, name) {
    document.getElementById('deleteMsg').textContent = `Delete category "${name}"?`;
    document.getElementById('confirmDeleteBtn').onclick = async () => {
        try {
            await deleteDoc(doc(db, 'categories', id));
            adminToast('Category deleted', 'success');
        } catch (e) { adminToast('Error deleting', 'error'); }
        closeDeleteModal();
    };
    document.getElementById('deleteModal').classList.add('active');
};

// ============================================
// HELPERS
// ============================================
function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function adminToast(msg, type = '') {
    const t = document.createElement('div');
    t.className = `admin-toast${type ? ' ' + type : ''}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// Close modals on overlay click
['productModal', 'catModal', 'orderDetailModal', 'deleteModal'].forEach(id => {
    document.getElementById(id).addEventListener('click', function (e) {
        if (e.target === this) this.classList.remove('active');
    });
});