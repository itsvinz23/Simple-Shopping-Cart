const CART_STORAGE_KEY = "simplecart_cart";

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return [];
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function addToCart(productId, products, qty = 1) {
  const cart = loadCart();
  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ productId, quantity: qty });
  }
  saveCart(cart);
  return cart;
}

function updateCartQuantity(productId, quantity) {
  const cart = loadCart();
  const item = cart.find((i) => i.productId === productId);
  if (!item) return cart;
  if (quantity <= 0) {
    return removeFromCart(productId);
  }
  item.quantity = quantity;
  saveCart(cart);
  return cart;
}

function removeFromCart(productId) {
  const cart = loadCart().filter((i) => i.productId !== productId);
  saveCart(cart);
  return cart;
}

function clearCart() {
  saveCart([]);
  return [];
}

function getCartLines(products) {
  const cart = loadCart();
  return cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return {
        ...product,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity
      };
    })
    .filter(Boolean);
}

function getCartTotal(products) {
  return getCartLines(products).reduce((sum, line) => sum + line.lineTotal, 0);
}

function getCartItemCount(products) {
  return getCartLines(products).reduce((sum, line) => sum + line.quantity, 0);
}
