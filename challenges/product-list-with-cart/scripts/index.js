import { createSignal, createEffect, createDerivedSignal } from '../../../common/core/signals.js';
import { html } from '../../../common/core/templating.js';

// Initialize signals
const [products, setProducts] = createSignal([]);
const [cart, setCart] = createSignal({});

// Derived signals
const cartCount = createDerivedSignal(() => {
  const currentCart = cart();
  return Object.values(currentCart).reduce((sum, item) => sum + item.quantity, 0);
});

const cartTotal = createDerivedSignal(() => {
  const currentCart = cart();
  return Object.values(currentCart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

// Function to generate a unique key for a product
function generateProductKey(product) {
  return `${product.name}-${product.price}`.replace(/\s+/g, "-").toLowerCase();
}

// Fetch products from JSON
async function getProducts() {
  try {
    const response = await fetch("./data.json");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    setProducts(await response.json());
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Initialize products on page load
document.addEventListener("DOMContentLoaded", getProducts);

// Templates
const ProductTemplate = (product) => {
  const productKey = generateProductKey(product);
  const isInCart = cart()[productKey] !== undefined;

  return html`
    <div class="product ${isInCart ? 'selected' : ''}" data-product-key="${productKey}">
      <div class="product-image">
        <picture>
          <source srcset="${product.image.desktop}" media="(min-width: 1024px)">
          <source srcset="${product.image.tablet}" media="(min-width: 768px)">
          <img src="${product.image.mobile}" alt="">
        </picture>
        <div class="product-buttons" data-instance-in-cart="${isInCart}">
          <button class="add-to-cart js-add-to-cart">
            <img src="./assets/images/icon-add-to-cart.svg" alt="">Add to cart
          </button>
          <div class="change-quantity-in-cart">
            <button class="js-decrement">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2">
                <path fill="currentColor" d="M0 .375h10v1.25H0V.375Z"/>
              </svg>
            </button>
            <span class="js-item-quantity">
              ${isInCart ? cart()[productKey].quantity : ''}
            </span>
            <button class="js-increment">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                <path fill="currentColor" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <p class="product-category">${product.category}</p>
      <p class="product-name">${product.name}</p>
      <p class="product-price">${product.price.toFixed(2)}</p>
    </div>
  `;
};

const CartItemTemplate = (item) => html`
  <div class="cart-item">
    <div>
      <p class="cart-item-name">${item.name}</p>
      <p>
        <span class="cart-item-quantity">${item.quantity}x</span>
        <span class="cart-item-price">@ $${item.price.toFixed(2)}</span>
        <span class="cart-item-total">= $${(item.price * item.quantity).toFixed(2)}</span>
      </p>
    </div>
    <button class="cart-item-remove">
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 10 10">
        <path fill="currentColor" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/>
      </svg>
    </button>
  </div>
`;

const DialogCartItemTemplate = (item) => html`
<div class="cart-item">
  <div>
    <img src="${item.image.thumbnail}" alt="">
    <div>
      <span class="cart-item-name">${item.name}</span>
      <p>
        <span class="cart-item-quantity">${item.quantity}x</span>
        <span class="cart-item-price">@ $${item.price.toFixed(2)}</span>
      </p>
    </div>
  </div>
  <span class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</span>
</div>
`;

// Cart functions
function addToCart(productKey, product) {
  return () => {
    setCart({
      ...cart(),
      [productKey]: { ...product, quantity: 1 }
    });
  }
}

function removeFromCart(productKey) {
  const updatedCart = { ...cart() };
  delete updatedCart[productKey];
  setCart(updatedCart);
}

function incrementQuantity(productKey) {
  const updatedCart = { ...cart() };
  updatedCart[productKey].quantity++;
  setCart(updatedCart);
}

function decrementQuantity(productKey) {
  const currentQuantity = cart()[productKey].quantity;
  if (currentQuantity === 1) {
    removeFromCart(productKey);
  } else {
    const updatedCart = { ...cart() };
    updatedCart[productKey].quantity--;
    setCart(updatedCart);
  }
}

// Effects for rendering
createEffect(() => {
  const product_list = document.querySelector(".product-list");
  product_list.innerHTML = "";

  products().forEach((product) => {
    const productElement = ProductTemplate(product);
    const productKey = generateProductKey(product);

    // Add event listeners
    productElement.querySelector(".add-to-cart")
      .addEventListener("click", addToCart(productKey, product));
    productElement.querySelector(".js-decrement")
      .addEventListener("click", () => decrementQuantity(productKey));
    productElement.querySelector(".js-increment")
      .addEventListener("click", () => incrementQuantity(productKey));

    product_list.appendChild(productElement);
  });
});

createEffect(() => {
  const cart_content = document.querySelector(".cart-content");

  if (Object.keys(cart()).length === 0) {
    cart_content.innerHTML = `
      <div class="cart-empty">
        <img src="./assets/images/illustration-empty-cart.svg" alt="" />
        <p>Your added items will appear here</p>
      </div>
    `;
    return;
  }

  cart_content.innerHTML = `
    <div class="cart-item-list">
    </div>
    <p class="cart-order-total">Order Total<span>${cartTotal()}</span></p>
    <p class="carbon-neutral">
      <img src="./assets/images/icon-carbon-neutral.svg" alt="" />
      This is a <strong>carbon-neutral</strong> delivery.
    </p>
    <button class="confirm-order">Confirm Order</button>
  `;

  const cart_item_list = cart_content.querySelector(".cart-item-list");
  for (let productKey in cart()) {
    const item = cart()[productKey];
    cart_item_list.appendChild(CartItemTemplate(item));
  }

  // Add event listeners
  cart_content.querySelectorAll(".cart-item-remove").forEach((button, index) => {
    const productKey = Object.keys(cart())[index];
    button.addEventListener("click", () => removeFromCart(productKey));
  });

  cart_content.querySelector(".confirm-order")?.addEventListener("click", renderDialog);
});

createEffect(() => {
  const cartCounter = document.querySelector(".cart-counter");
  cartCounter.textContent = cartCount();
});

// Dialog rendering
function renderDialog() {
  let dialog = document.querySelector("dialog");

  dialog.querySelector(".cart-content").innerHTML = `
    <div class="cart-item-list"></div>
    <p class="cart-order-total">Order Total<span>${cartTotal()}</span></p>
  `;

  let cart_item_list = dialog.querySelector(".cart-item-list");
  for (let productKey in cart()) {
    const item = cart()[productKey];
    cart_item_list.appendChild(DialogCartItemTemplate(item));
  }

  dialog.showModal();
}

// Reset cart
document.querySelector(".start-new-order").addEventListener("click", () => {
  document.querySelector("dialog").close();
  setCart({});
});