let products = loadProducts();
let currentCategory = "All";
let user = loadUser();

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function formatMoney(n) {
  return "$" + n.toFixed(2);
}

function render() {
  renderHeader();
  renderCategories();
  renderProducts();
  renderCart();
  renderAdmin();
}

function renderHeader() {
  const count = getCartItemCount(products);
  $("#cart-count").textContent = count;
  const authArea = $("#auth-area");
  if (user) {
    authArea.innerHTML = `
      <span class="user-greeting">Hi, ${escapeHtml(user.name)}</span>
      ${isAdmin(user) ? '<a href="#admin" class="btn btn-ghost">Admin</a>' : ""}
      <button type="button" class="btn btn-ghost" id="btn-logout">Logout</button>
    `;
    $("#btn-logout")?.addEventListener("click", () => {
      logout();
      user = null;
      render();
    });
  } else {
    authArea.innerHTML = `<button type="button" class="btn btn-primary" id="btn-login">Login</button>`;
    $("#btn-login")?.addEventListener("click", openLoginModal);
  }
}

function renderCategories() {
  const container = $("#category-tabs");
  container.innerHTML = CATEGORIES.map(
    (cat) =>
      `<button type="button" class="tab ${cat === currentCategory ? "active" : ""}" data-category="${cat}">${cat}</button>`
  ).join("");
  container.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentCategory = btn.dataset.category;
      renderProducts();
      renderCategories();
    });
  });
}

function filteredProducts() {
  if (currentCategory === "All") return products;
  return products.filter((p) => p.category === currentCategory);
}

function renderProducts() {
  const list = filteredProducts();
  const grid = $("#product-grid");
  if (!list.length) {
    grid.innerHTML = `<p class="empty">No products in this category.</p>`;
    return;
  }
  grid.innerHTML = list
    .map(
      (p) => `
    <article class="product-card" data-id="${p.id}">
      <img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}" loading="lazy" />
      <div class="product-body">
        <span class="badge">${escapeHtml(p.category)}</span>
        <h3>${escapeHtml(p.name)}</h3>
        <p class="desc">${escapeHtml(p.description)}</p>
        <div class="product-footer">
          <strong>${formatMoney(p.price)}</strong>
          <button type="button" class="btn btn-primary btn-add" data-id="${p.id}">Add to cart</button>
        </div>
      </div>
    </article>
  `
    )
    .join("");

  grid.querySelectorAll(".btn-add").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!user) {
        openLoginModal();
        return;
      }
      addToCart(Number(btn.dataset.id), products);
      render();
      flashMessage("Added to cart");
    });
  });
}

function renderCart() {
  const lines = getCartLines(products);
  const list = $("#cart-items");
  const totalEl = $("#cart-total");

  if (!lines.length) {
    list.innerHTML = `<p class="empty">Your cart is empty.</p>`;
    totalEl.textContent = formatMoney(0);
    $("#btn-checkout").disabled = true;
    return;
  }

  list.innerHTML = lines
    .map(
      (line) => `
    <div class="cart-line" data-id="${line.id}">
      <div class="cart-line-info">
        <strong>${escapeHtml(line.name)}</strong>
        <span>${formatMoney(line.price)} each</span>
      </div>
      <div class="qty-controls">
        <button type="button" class="btn-qty" data-action="dec" data-id="${line.id}">−</button>
        <input type="number" min="1" value="${line.quantity}" class="qty-input" data-id="${line.id}" />
        <button type="button" class="btn-qty" data-action="inc" data-id="${line.id}">+</button>
      </div>
      <div class="cart-line-total">${formatMoney(line.lineTotal)}</div>
      <button type="button" class="btn-remove" data-id="${line.id}" title="Remove">×</button>
    </div>
  `
    )
    .join("");

  totalEl.textContent = formatMoney(getCartTotal(products));
  $("#btn-checkout").disabled = !user;

  list.querySelectorAll(".btn-qty").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const line = lines.find((l) => l.id === id);
      const delta = btn.dataset.action === "inc" ? 1 : -1;
      updateCartQuantity(id, line.quantity + delta);
      render();
    });
  });

  list.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("change", () => {
      updateCartQuantity(Number(input.dataset.id), parseInt(input.value, 10) || 1);
      render();
    });
  });

  list.querySelectorAll(".btn-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromCart(Number(btn.dataset.id));
      render();
    });
  });
}

function renderAdmin() {
  const panel = $("#admin-panel");
  if (!isAdmin(user)) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;
  const tbody = $("#admin-products-body");
  tbody.innerHTML = products
    .map(
      (p) => `
    <tr>
      <td>${p.id}</td>
      <td>${escapeHtml(p.category)}</td>
      <td>${escapeHtml(p.name)}</td>
      <td>${formatMoney(p.price)}</td>
      <td>
        <button type="button" class="btn btn-ghost btn-edit" data-id="${p.id}">Edit</button>
        <button type="button" class="btn btn-ghost btn-delete" data-id="${p.id}">Delete</button>
      </td>
    </tr>
  `
    )
    .join("");

  tbody.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      if (!confirm("Delete this product?")) return;
      products = products.filter((p) => p.id !== id);
      saveProducts(products);
      removeFromCart(id);
      render();
    });
  });

  tbody.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = products.find((x) => x.id === Number(btn.dataset.id));
      if (p) fillAdminForm(p);
    });
  });
}

function fillAdminForm(p) {
  $("#admin-form-title").textContent = p ? "Edit product" : "Add product";
  $("#product-id").value = p ? p.id : "";
  $("#product-category").value = p ? p.category : "Vegetables";
  $("#product-name").value = p ? p.name : "";
  $("#product-price").value = p ? p.price : "";
  $("#product-desc").value = p ? p.description : "";
  $("#product-image").value = p ? p.image : "";
}

function openLoginModal() {
  $("#login-modal").classList.add("open");
}

function closeLoginModal() {
  $("#login-modal").classList.remove("open");
}

function openCheckoutModal() {
  const lines = getCartLines(products);
  const summary = $("#checkout-summary");
  summary.innerHTML = lines
    .map(
      (l) =>
        `<div class="summary-row"><span>${escapeHtml(l.name)} × ${l.quantity}</span><span>${formatMoney(l.lineTotal)}</span></div>`
    )
    .join("");
  $("#checkout-total").textContent = formatMoney(getCartTotal(products));
  $("#checkout-modal").classList.add("open");
}

function flashMessage(text) {
  const el = $("#toast");
  el.textContent = text;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2000);
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

function initLoginModal() {
  $("#login-modal .modal-backdrop, #login-modal .modal-close").addEventListener("click", closeLoginModal);

  $("#btn-google").addEventListener("click", () => {
    user = loginWithProvider("google", "Google User");
    closeLoginModal();
    render();
    flashMessage("Signed in with Google (demo)");
  });

  $("#btn-facebook").addEventListener("click", () => {
    user = loginWithProvider("facebook", "Facebook User");
    closeLoginModal();
    render();
    flashMessage("Signed in with Facebook (demo)");
  });

  $("#btn-passkey").addEventListener("click", async () => {
    user = await simulatePasskeyLogin();
    closeLoginModal();
    render();
    flashMessage("Signed in with Passkey (demo)");
  });

  $("#admin-login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const pass = $("#admin-password").value;
    const name = $("#admin-username").value.trim() || "Admin";
    if (pass !== ADMIN_PASSWORD) {
      flashMessage("Invalid admin password");
      return;
    }
    user = loginAsAdmin(name);
    closeLoginModal();
    render();
    flashMessage("Admin signed in");
  });
}

function initCheckout() {
  $("#checkout-modal .modal-backdrop, #checkout-modal .modal-close").addEventListener("click", () => {
    $("#checkout-modal").classList.remove("open");
  });
  $("#btn-checkout").addEventListener("click", () => {
    if (!user) {
      openLoginModal();
      return;
    }
    if (!getCartLines(products).length) return;
    openCheckoutModal();
  });
  $("#btn-place-order").addEventListener("click", () => {
    clearCart();
    $("#checkout-modal").classList.remove("open");
    render();
    flashMessage("Order placed (demo — payment is future scope)");
  });
}

function initAdminForm() {
  $("#admin-product-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const idVal = $("#product-id").value;
    const payload = {
      category: $("#product-category").value,
      name: $("#product-name").value.trim(),
      price: parseFloat($("#product-price").value),
      description: $("#product-desc").value.trim(),
      image: $("#product-image").value.trim() || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop"
    };
    if (!payload.name || isNaN(payload.price)) return;

    if (idVal) {
      const id = Number(idVal);
      products = products.map((p) => (p.id === id ? { ...p, ...payload } : p));
    } else {
      products.push({ id: nextProductId(products), ...payload });
    }
    saveProducts(products);
    fillAdminForm(null);
    $("#admin-form-title").textContent = "Add product";
    render();
    flashMessage("Product saved");
  });

  $("#btn-reset-form").addEventListener("click", () => {
    fillAdminForm(null);
    $("#admin-form-title").textContent = "Add product";
  });
}

function initCartToggle() {
  $("#btn-cart-toggle").addEventListener("click", () => {
    $("#cart-drawer").classList.toggle("open");
  });
  $("#cart-close").addEventListener("click", () => {
    $("#cart-drawer").classList.remove("open");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fillAdminForm(null);
  initLoginModal();
  initCheckout();
  initAdminForm();
  initCartToggle();
  render();
});
