/** Static product catalog — no database; edit here or via Admin UI (localStorage). */
const DEFAULT_PRODUCTS = [
  { id: 1, category: "Vegetables", name: "Fresh Carrots", price: 2.49, description: "Organic carrots, 1 lb bag.", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop" },
  { id: 2, category: "Vegetables", name: "Broccoli", price: 3.29, description: "Crisp green broccoli crowns.", image: "https://images.unsplash.com/photo-1459411621453-7b03985f4f48?w=400&h=300&fit=crop" },
  { id: 3, category: "Vegetables", name: "Tomatoes", price: 2.99, description: "Vine-ripened tomatoes.", image: "https://images.unsplash.com/photo-1546094115-0df3e4e2d4b6?w=400&h=300&fit=crop" },
  { id: 4, category: "Fruits", name: "Apples", price: 4.49, description: "Honeycrisp apples, 6 pack.", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop" },
  { id: 5, category: "Fruits", name: "Bananas", price: 1.99, description: "Ripe yellow bananas.", image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop" },
  { id: 6, category: "Fruits", name: "Strawberries", price: 5.99, description: "Sweet local strawberries.", image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=300&fit=crop" },
  { id: 7, category: "Cakes", name: "Chocolate Cake", price: 18.99, description: "Rich double-layer chocolate cake.", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop" },
  { id: 8, category: "Cakes", name: "Vanilla Cupcakes", price: 12.49, description: "Box of 6 vanilla cupcakes.", image: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&h=300&fit=crop" },
  { id: 9, category: "Cakes", name: "Cheesecake Slice", price: 6.99, description: "New York style cheesecake.", image: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400&h=300&fit=crop" },
  { id: 10, category: "Biscuits", name: "Butter Cookies", price: 4.99, description: "Classic buttery shortbread.", image: "https://images.unsplash.com/photo-1558961363-fa8fdf64db53?w=400&h=300&fit=crop" },
  { id: 11, category: "Biscuits", name: "Oatmeal Biscuits", price: 3.79, description: "Homestyle oatmeal biscuits.", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop" },
  { id: 12, category: "Biscuits", name: "Chocolate Chip", price: 5.49, description: "Soft-baked chocolate chip pack.", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop" }
];

const CATEGORIES = ["All", "Vegetables", "Fruits", "Cakes", "Biscuits"];
const PRODUCTS_STORAGE_KEY = "simplecart_products";

function loadProducts() {
  try {
    const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return DEFAULT_PRODUCTS.map((p) => ({ ...p }));
}

function saveProducts(products) {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

function nextProductId(products) {
  return products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
}
