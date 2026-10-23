const products = [
  {
    id: 1, name: "Laptop Nova 14", category: "Tecnología", price: 12499,
    description: "Ligera y potente para tus clases, proyectos y trabajo diario.",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
    imageFallback: "💻", stock: true, tag: "Popular"
  },
  {
    id: 2, name: "Audífonos Wave", category: "Accesorios", price: 899,
    description: "Sonido envolvente y almohadillas cómodas para largas sesiones.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    imageFallback: "🎧", stock: true, tag: ""
  },
  {
    id: 3, name: "Mochila Urban", category: "Accesorios", price: 649,
    description: "Diseño resistente con compartimentos para tus dispositivos.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    imageFallback: "🎒", stock: true, tag: "Nuevo"
  },
  {
    id: 4, name: "Mouse Precision", category: "Tecnología", price: 349,
    description: "Control preciso y cómodo para estudiar o trabajar.",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=600&q=80",
    imageFallback: "🖱️", stock: true, tag: ""
  },
  {
    id: 5, name: "Teclado Compact", category: "Tecnología", price: 799,
    description: "Teclas cómodas y diseño compacto para cualquier escritorio.",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
    imageFallback: "⌨️", stock: false, tag: "Agotado"
  },
  {
    id: 6, name: "Termo Boreal", category: "Accesorios", price: 499,
    description: "Mantiene tus bebidas a la temperatura ideal durante horas.",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
    imageFallback: "🥤", stock: true, tag: ""
  }
];

let selectedCategory = "Todos";
let cart = [];
let toastTimer;

const productGrid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#searchInput");
const categorySelect = document.querySelector("#categorySelect");
const resultsText = document.querySelector("#resultsText");
const noResults = document.querySelector("#noResults");
const cartCount = document.querySelector("#cartCount");
const cartItems = document.querySelector("#cartItems");
const cartItemsLabel = document.querySelector("#cartItemsLabel");
const cartTotal = document.querySelector("#cartTotal");
const clearCartButton = document.querySelector("#clearCart");
const toast = document.querySelector("#toast");
const toastMessage = document.querySelector("#toastMessage");

const money = amount => new Intl.NumberFormat("es-MX", {
  style: "currency", currency: "MXN", maximumFractionDigits: 0
}).format(amount);

function safeImage(product) {
  return `<img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy"
    onerror="this.outerHTML='<span aria-hidden=&quot;true&quot; style=&quot;font-size:4rem&quot;>${product.imageFallback}</span>'">`;
}

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase("es-MX");
  const visibleProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
    const matchesQuery = `${product.name} ${product.description} ${product.category}`.toLocaleLowerCase("es-MX").includes(query);
    return matchesCategory && matchesQuery;
  });

  productGrid.innerHTML = visibleProducts.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        ${product.tag ? `<span class="tag ${product.stock ? "" : "sold"}">${product.tag}</span>` : ""}
        ${safeImage(product)}
      </div>
      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3>${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="price-row"><span class="price">${money(product.price)}</span></div>
        <button class="add-btn" type="button" data-add="${product.id}" ${product.stock ? "" : "disabled"}
          aria-label="${product.stock ? `Agregar ${product.name} al carrito` : `${product.name}, agotado`}">
          ${product.stock ? "＋ Agregar al carrito" : "Agotado"}
        </button>
      </div>
    </article>
  `).join("");

  resultsText.textContent = `Mostrando ${visibleProducts.length} ${visibleProducts.length === 1 ? "producto" : "productos"}`;
  noResults.hidden = visibleProducts.length !== 0;
  productGrid.hidden = visibleProducts.length === 0;
}

function showToast(message) {
  toastMessage.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3200);
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  if (!product || !product.stock) return; // Restricción adicional de seguridad.
  const existing = cart.find(item => item.id === productId);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  renderCart();
  showToast(`${product.name} se agregó al carrito.`);
}

function changeQuantity(productId, amount) {
  const item = cart.find(entry => entry.id === productId);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== productId);
  renderCart();
}

function renderCart() {
  const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCount.textContent = quantity;
  cartItemsLabel.textContent = `${quantity} ${quantity === 1 ? "artículo" : "artículos"}`;
  cartTotal.textContent = money(total);
  clearCartButton.disabled = cart.length === 0;

  if (!cart.length) {
    cartItems.innerHTML = `<div class="cart-empty"><span aria-hidden="true">🛒</span><strong>Tu carrito está vacío</strong><p>Agrega un producto para comenzar.</p></div>`;
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="" onerror="this.outerHTML='<span aria-hidden=&quot;true&quot;>${item.imageFallback}</span>'">
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${money(item.price)} c/u</div>
        <div class="quantity-controls" aria-label="Cantidad de ${item.name}">
          <button type="button" data-minus="${item.id}" aria-label="Quitar una unidad de ${item.name}">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-plus="${item.id}" aria-label="Agregar una unidad de ${item.name}">+</button>
        </div>
      </div>
      <button type="button" class="remove-btn" data-remove="${item.id}" aria-label="Eliminar ${item.name} del carrito">×</button>
    </div>
  `).join("");
}

document.querySelectorAll(".category-btn").forEach(button => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;
    categorySelect.value = selectedCategory;
    document.querySelectorAll(".category-btn").forEach(btn => {
      const active = btn === button;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
    renderProducts();
  });
});

categorySelect.addEventListener("change", () => {
  selectedCategory = categorySelect.value;
  document.querySelectorAll(".category-btn").forEach(button => {
    const active = button.dataset.category === selectedCategory;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  renderProducts();
});

searchInput.addEventListener("input", renderProducts);

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button && !button.disabled) addToCart(Number(button.dataset.add));
});

cartItems.addEventListener("click", event => {
  const plus = event.target.closest("[data-plus]");
  const minus = event.target.closest("[data-minus]");
  const remove = event.target.closest("[data-remove]");
  if (plus) changeQuantity(Number(plus.dataset.plus), 1);
  if (minus) changeQuantity(Number(minus.dataset.minus), -1);
  if (remove) {
    cart = cart.filter(item => item.id !== Number(remove.dataset.remove));
    renderCart();
  }
});

clearCartButton.addEventListener("click", () => {
  cart = [];
  renderCart();
  showToast("El carrito se vació.");
});

document.querySelector("#cartJump").addEventListener("click", () => {
  document.querySelector("#cartPanel").scrollIntoView({ behavior: "smooth", block: "start" });
});
document.querySelector("#closeToast").addEventListener("click", () => { toast.hidden = true; });

renderProducts();
renderCart();
