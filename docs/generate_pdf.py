"""Generate SimpleCart-Code-Guide.pdf. Run: pip install fpdf2 && python docs/generate_pdf.py"""
from pathlib import Path

try:
    from fpdf import FPDF
except ImportError:
    raise SystemExit("Install fpdf2: pip install fpdf2")

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "SimpleCart-Code-Guide.pdf"


class GuidePDF(FPDF):
    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")


def section(pdf, title, body_lines):
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    w = pdf.w - pdf.l_margin - pdf.r_margin
    for line in body_lines:
        safe = line.replace("\t", " ").strip()
        if not safe:
            pdf.ln(3)
            continue
        pdf.multi_cell(w, 5, safe)
    pdf.ln(2)


def main():
    pdf = GuidePDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 10, "Simple Cart - Code Guide", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(
        0,
        6,
        "Reference document for the static shopping cart app (no database). "
        "Matches the Shopping Cart SRS: categories, cart CRUD, dynamic totals, "
        "login options (demo), admin product management, checkout summary.",
    )
    pdf.ln(4)

    section(
        pdf,
        "1. SRS requirements covered",
        [
            "- Category browsing: Vegetables, Fruits, Cakes, Biscuits (+ All).",
            "- Each product: image, name, price, description.",
            "- Cart: add, change quantity, remove, live total.",
            "- Checkout: order summary modal (payment = future scope in SRS).",
            "- Login: Google, Facebook, Passkey buttons (client demo; see auth.js).",
            "- Admin: separate login; add/edit/delete products.",
            "- Responsive layout for mobile and desktop (css/styles.css).",
            "- No MySQL/MongoDB: data in JavaScript + browser localStorage.",
        ],
    )

    section(
        pdf,
        "2. Project structure",
        [
            "index.html - Page layout, modals, cart drawer",
            "css/styles.css - Visual design and responsive rules",
            "js/products.js - Product catalog and categories",
            "js/cart.js - Cart logic (add, update, remove, totals)",
            "js/auth.js - User and admin session (localStorage)",
            "js/app.js - UI rendering and event handlers",
            "vercel.json - Static hosting on Vercel",
        ],
    )

    section(
        pdf,
        "3. index.html",
        [
            "Single-page application shell. Regions:",
            "- Header: logo, auth-area (filled by app.js), cart button.",
            "- category-tabs + product-grid: shop UI.",
            "- admin-panel: hidden until admin logs in.",
            "- cart-drawer: slide-in cart from the right.",
            "- login-modal: Google/Facebook/Passkey + admin form.",
            "- checkout-modal: order summary before place order.",
            "Scripts load in order: products, cart, auth, app.",
        ],
    )

    section(
        pdf,
        "4. js/products.js",
        [
            "DEFAULT_PRODUCTS: 12 sample items across 4 categories.",
            "CATEGORIES: filter tabs including 'All'.",
            "loadProducts(): reads localStorage key simplecart_products, else defaults.",
            "saveProducts(): writes catalog after admin edits.",
            "nextProductId(): auto-increment id for new products.",
        ],
    )

    section(
        pdf,
        "5. js/cart.js",
        [
            "Cart stored as [{ productId, quantity }] in simplecart_cart.",
            "addToCart(productId, products, qty): merge duplicate lines.",
            "updateCartQuantity(productId, quantity): set qty; 0 removes line.",
            "removeFromCart(productId): delete one line.",
            "getCartLines(products): join cart with product details + lineTotal.",
            "getCartTotal / getCartItemCount: for UI badges and checkout.",
        ],
    )

    section(
        pdf,
        "6. js/auth.js",
        [
            "Static hosting cannot securely verify OAuth tokens without a server.",
            "loginWithProvider('google'|'facebook'|...): saves demo user object.",
            "simulatePasskeyLogin(): demo Passkey sign-in.",
            "loginAsAdmin(username): after password check in app.js.",
            "Admin password constant: ADMIN_PASSWORD = 'admin123' (change for demos).",
            "User object: { id, name, provider, role, loggedInAt } in simplecart_user.",
        ],
    )

    section(
        pdf,
        "7. js/app.js (main UI)",
        [
            "render(): refreshes header, categories, products, cart, admin table.",
            "renderProducts(): builds cards; requires login to add to cart.",
            "renderCart(): quantity +/- buttons, number input, remove, total.",
            "openCheckoutModal(): lists lines and total; Place order clears cart.",
            "Admin form submit: create or update product, then saveProducts().",
            "escapeHtml(): prevents XSS when inserting names into innerHTML.",
        ],
    )

    section(
        pdf,
        "8. css/styles.css",
        [
            "CSS variables for colors and spacing (easy theme tweaks).",
            "CSS Grid for product cards: repeat(auto-fill, minmax(240px, 1fr)).",
            "cart-drawer: fixed panel with translateX animation.",
            "modal: centered overlay for login and checkout.",
            "Media query at 900px: admin form beside product table.",
        ],
    )

    section(
        pdf,
        "9. Deploy to Vercel (free static host)",
        [
            "1. Push this folder to GitHub.",
            "2. vercel.com -> New Project -> import repo.",
            "3. Framework Preset: Other (static files). Root: ./",
            "4. Deploy. Your URL will be like https://simple-cart-xxx.vercel.app",
            "No environment variables or database needed.",
        ],
    )

    section(
        pdf,
        "10. How to use the live demo",
        [
            "Browse categories, click Add to cart (login if prompted).",
            "Open Cart, adjust quantities, Checkout, Place order.",
            "Admin: Login modal -> Admin sign in (password: admin123).",
            "Scroll to Admin section to add/edit/delete products.",
            "Data persists in the same browser via localStorage.",
        ],
    )

    section(
        pdf,
        "11. Extending to production",
        [
            "- Replace demo auth with Google/Facebook OAuth + server session.",
            "- Add WebAuthn Passkey registration on a backend.",
            "- Move products/orders to an API + database when you outgrow static.",
            "- Integrate Stripe/PayPal for real checkout (SRS future enhancement).",
        ],
    )

    pdf.output(str(OUT))
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
