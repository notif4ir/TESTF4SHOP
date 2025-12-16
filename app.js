import { GAME_DATA } from "./data.js";

const WEBHOOK_URL =
  "https://discord.com/api/webhooks/1450522279833501867/LB-uml9HdnnswckyGTV_RE9g-z3dJ6YWaZ5fYQhPxZjZsgXXJji1PixAW93dNRcLTjvs";

const state = {
  selectedGameId: null,
  selectedSubgameId: null,
  sort: "none",
  cart: []
};

const els = {
  categoryGrid: document.getElementById("categoryGrid"),
  sortSelect: document.getElementById("sortSelect"),
  listTitle: document.getElementById("listTitle"),
  products: document.getElementById("products"),
  cartButton: document.getElementById("cartButton"),
  cartCount: document.getElementById("cartCount"),
  cartSheet: document.getElementById("cartSheet"),
  cartSheetBackdrop: document.getElementById("cartSheetBackdrop"),
  closeCart: document.getElementById("closeCart"),
  cartItems: document.getElementById("cartItems"),
  cartTotal: document.getElementById("cartTotal"),
  cashoutButton: document.getElementById("cashoutButton"),
  buyerName: document.getElementById("buyerName"),
  toastContainer: document.getElementById("toastContainer"),
  gameModalBackdrop: document.getElementById("gameModalBackdrop"),
  gameModal: document.getElementById("gameModal"),
  gameModalTitle: document.getElementById("gameModalTitle"),
  gameModalSubtitle: document.getElementById("gameModalSubtitle"),
  gameModalBody: document.getElementById("gameModalBody"),
  closeGameModal: document.getElementById("closeGameModal"),
  gameSelect: document.getElementById("gameSelect")
};

function init() {
  initGameSelect();
  initSort();
  initCartSheet();
  initCartButton();
  initGameModalClose();
  initDefaultSelection();
  renderProducts();
}

function initGameSelect() {
  if (!els.gameSelect) return;
  els.gameSelect.innerHTML = "";
  const games = Object.values(GAME_DATA);

  games.forEach((game) => {
    const option = document.createElement("option");
    option.value = game.id;
    option.textContent = game.label;
    els.gameSelect.appendChild(option);
  });

  els.gameSelect.addEventListener("change", () => {
    state.selectedGameId = els.gameSelect.value;
    state.selectedSubgameId = null;
    updateListTitle();
    renderProducts();
  });
}

function initSort() {
  if (!els.sortSelect) return;
  els.sortSelect.addEventListener("change", () => {
    state.sort = els.sortSelect.value;
    if (document.body.classList.contains("game-modal-open")) {
      renderModalProducts();
    }
  });
}

function initGameModalClose() {
  els.closeGameModal.addEventListener("click", closeGameModal);
  els.gameModalBackdrop.addEventListener("click", closeGameModal);
}

function initDefaultSelection() {
  const firstGame = Object.values(GAME_DATA)[0];
  if (!firstGame) return;
  state.selectedGameId = firstGame.id;
  state.selectedSubgameId = null;
  if (els.gameSelect) {
    els.gameSelect.value = firstGame.id;
  }
  updateListTitle();
}

function openGameModal(gameId, subgameId) {
  const game = GAME_DATA[gameId];
  if (!game) return;
  const subgame = game.subgames.find((s) => s.id === subgameId);
  if (!subgame) return;

  state.selectedGameId = game.id;
  state.selectedSubgameId = subgame.id;

  els.gameModalTitle.textContent = subgame.label;
  els.gameModalSubtitle.textContent = `${game.label} • ${subgame.products.length} type${
    subgame.products.length !== 1 ? "s" : ""
  }`;

  renderModalProducts();

  document.body.classList.add("game-modal-open");
}

function closeGameModal() {
  document.body.classList.remove("game-modal-open");
}

function updateListTitle() {
  const game = GAME_DATA[state.selectedGameId];
  if (!game) {
    els.listTitle.textContent = "Select a game";
    return;
  }
  els.listTitle.textContent = `${game.label} • Pick a brainrot`;
}

function getFilteredProducts() {
  const game = GAME_DATA[state.selectedGameId];
  if (!game) return [];
  const subgame = game.subgames.find((s) => s.id === state.selectedSubgameId);
  if (!subgame) return [];

  let products = [...subgame.products];

  switch (state.sort) {
    case "costAsc":
      products.sort((a, b) => a.cost - b.cost);
      break;
    case "costDesc":
      products.sort((a, b) => b.cost - a.cost);
      break;
    case "incomeAsc":
      products.sort(
        (a, b) => (a.incomePerSecond || 0) - (b.incomePerSecond || 0)
      );
      break;
    case "incomeDesc":
      products.sort(
        (a, b) => (b.incomePerSecond || 0) - (a.incomePerSecond || 0)
      );
      break;
    default:
      break;
  }

  return products;
}

function formatMoneyShort(value) {
  if (!value || value <= 0) return "$0/s";
  const abs = Math.abs(value);

  const format = (num) =>
    num.toLocaleString("en-US", {
      maximumFractionDigits: num >= 100 ? 0 : 1
    });

  if (abs >= 1_000_000_000_000) {
    return `$${format(value / 1_000_000_000_000)}T/s`;
  }
  if (abs >= 1_000_000_000) {
    return `$${format(value / 1_000_000_000)}B/s`;
  }
  if (abs >= 1_000_000) {
    return `$${format(value / 1_000_000)}M/s`;
  }
  if (abs >= 1_000) {
    return `$${format(value / 1_000)}K/s`;
  }
  return `$${format(value)}/s`;
}

function renderProducts() {
  const game = GAME_DATA[state.selectedGameId];
  els.products.innerHTML = "";

  if (!game) {
    els.products.innerHTML =
      '<div style="text-align:center;font-size:0.8rem;color:var(--muted);padding:12px 0;">Select a game to see brainrots</div>';
    return;
  }

  if (!game.subgames || game.subgames.length === 0) {
    els.products.innerHTML =
      '<div style="text-align:center;font-size:0.8rem;color:var(--muted);padding:12px 0;">No brainrots configured yet</div>';
    return;
  }

  game.subgames.forEach((sg) => {
    const card = document.createElement("button");
    card.className = "brainrot-card";
    card.dataset.subgame = sg.id;

    const img = document.createElement("div");
    img.className = "brainrot-image";
    if (sg.imageUrl) {
      img.style.backgroundImage = `url("${sg.imageUrl}")`;
    }

    const body = document.createElement("div");
    body.className = "brainrot-body";

    const name = document.createElement("div");
    name.className = "brainrot-name";
    name.textContent = sg.label;

    const meta = document.createElement("div");
    meta.className = "brainrot-meta";
    meta.textContent = sg.subtitle || "Configured route";

    body.appendChild(name);
    body.appendChild(meta);

    card.appendChild(img);
    card.appendChild(body);

    card.addEventListener("click", () => openGameModal(game.id, sg.id));

    els.products.appendChild(card);
  });
}

function renderModalProducts() {
  els.gameModalBody.innerHTML = "";

  const products = getFilteredProducts();

  if (!state.selectedGameId || !state.selectedSubgameId) {
    els.gameModalBody.innerHTML =
      '<div style="text-align:center;font-size:0.8rem;color:var(--muted);padding:12px 0;">Pick a brainrot to see types</div>';
    return;
  }

  if (products.length === 0) {
    els.gameModalBody.innerHTML =
      '<div style="text-align:center;font-size:0.8rem;color:var(--muted);padding:12px 0;">No products configured yet</div>';
    return;
  }

  products.forEach((p) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const tag = document.createElement("div");
    tag.className = "product-tag";
    tag.textContent = p.tag || "Type";

    const name = document.createElement("div");
    name.className = "product-name";
    name.textContent = p.name;

    const meta = document.createElement("div");
    meta.className = "product-meta";
    meta.innerHTML = `
      <div class="product-meta-row">
        <span class="product-meta-label">Generation</span>
        <span class="product-meta-value-money">${formatMoneyShort(
          p.incomePerSecond
        )}</span>
      </div>
      <div class="product-meta-row">
        <span class="product-meta-label">Desc</span>
        <span class="product-meta-value-strong">${
          p.description || "Configured route"
        }</span>
      </div>
    `;

    const actions = document.createElement("div");
    actions.className = "product-actions";

    const stockInCart =
      state.cart.find((c) => c.id === p.id)?.qty || 0;
    const totalStock = typeof p.stock === "number" ? p.stock : Infinity;
    const remaining = Math.max(totalStock - stockInCart, 0);

    const stockEl = document.createElement("span");
    stockEl.className = "product-stock";
    stockEl.textContent =
      totalStock === Infinity
        ? "∞ stock"
        : `Stock: ${remaining}/${totalStock}`;

    const price = document.createElement("span");
    price.className = "product-price money";
    price.textContent = `$${p.cost.toFixed(2)} ${p.currency}`;

    const addBtn = document.createElement("button");
    addBtn.className = "add-button";
    if (remaining <= 0) {
      addBtn.disabled = true;
      addBtn.textContent = "Sold out";
    } else {
      addBtn.innerHTML = `<span>+</span><span>Add</span>`;
      addBtn.addEventListener("click", () => addToCart(p));
    }

    actions.appendChild(stockEl);
    actions.appendChild(price);
    actions.appendChild(addBtn);

    card.appendChild(tag);
    card.appendChild(name);
    card.appendChild(meta);
    card.appendChild(actions);

    els.gameModalBody.appendChild(card);
  });
}

/* Cart */

function initCartButton() {
  els.cartButton.addEventListener("click", () => {
    openCart();
  });
}

function initCartSheet() {
  els.closeCart.addEventListener("click", closeCart);
  els.cartSheetBackdrop.addEventListener("click", closeCart);
  els.cashoutButton.addEventListener("click", handleCashout);
}

function openCart() {
  document.body.classList.add("cart-sheet-open");
}

function closeCart() {
  document.body.classList.remove("cart-sheet-open");
}

function addToCart(product) {
  const existing = state.cart.find((c) => c.id === product.id);
  const totalStock =
    typeof product.stock === "number" ? product.stock : Infinity;
  const currentQty = existing ? existing.qty : 0;

  if (currentQty >= totalStock) {
    showToast("Out of stock", "error");
    return;
  }

  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      cost: product.cost,
      currency: product.currency,
      subgameId: state.selectedSubgameId,
      gameId: state.selectedGameId,
      qty: 1
    });
  }
  updateCartUI();
  showToast("Added to cart", "success");
}

function removeFromCart(id) {
  state.cart = state.cart.filter((c) => c.id !== id);
  updateCartUI();
}

function updateCartUI() {
  els.cartCount.textContent = state.cart.reduce((sum, c) => sum + c.qty, 0);

  els.cartItems.innerHTML = "";
  if (state.cart.length === 0) {
    els.cartItems.innerHTML =
      '<div style="text-align:center;font-size:0.8rem;color:var(--muted);padding:10px 0;">Cart is empty</div>';
  } else {
    state.cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-item";

      const info = document.createElement("div");
      info.className = "cart-item-info";
      info.innerHTML = `
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">${item.qty} × $${item.cost.toFixed(2)} ${
        item.currency
      }</div>
      `;

      const actions = document.createElement("div");
      actions.className = "cart-item-actions";

      const qty = document.createElement("div");
      qty.className = "qty-pill";
      qty.textContent = `x${item.qty}`;

      const rm = document.createElement("button");
      rm.className = "remove-button";
      rm.textContent = "Remove";
      rm.addEventListener("click", () => removeFromCart(item.id));

      actions.appendChild(qty);
      actions.appendChild(rm);

      row.appendChild(info);
      row.appendChild(actions);

      els.cartItems.appendChild(row);
    });
  }

  const total = state.cart.reduce((sum, c) => sum + c.cost * c.qty, 0);
  els.cartTotal.textContent = total ? `$${total.toFixed(2)}` : "$0";
}

/* Cashout -> Discord */

async function handleCashout() {
  if (state.cart.length === 0) {
    showToast("Cart is empty", "error");
    return;
  }

  const buyerName = els.buyerName.value.trim() || "Unknown buyer";

  let ip = "unknown";
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    if (res.ok) {
      const data = await res.json();
      ip = data.ip || "unknown";
    }
  } catch {
    // ignore
  }

  const game = GAME_DATA[state.selectedGameId] || {};
  const subgame =
    (game.subgames || []).find((s) => s.id === state.selectedSubgameId) || {};

  const total = state.cart.reduce((sum, c) => sum + c.cost * c.qty, 0);

  const cartLines = state.cart.map(
    (item, idx) =>
      `${idx + 1}. **${item.name}** — x${item.qty} — $${item.cost.toFixed(
        2
      )} ${item.currency}`
  );

  const description = [
    "```",
    cartLines.join("\n") || "No items",
    "```"
  ].join("\n");

  const embed = {
    title: "New cashout request",
    color: 0x23d18b,
    fields: [
      {
        name: "Buyer",
        value: buyerName,
        inline: true
      },
      {
        name: "IP (client)",
        value: ip,
        inline: true
      },
      {
        name: "Game",
        value: game.label || "Unknown",
        inline: true
      },
      {
        name: "Mode",
        value: subgame.label || state.selectedSubgameId || "Unknown",
        inline: true
      },
      {
        name: "Total",
        value: `$${total.toFixed(2)}`,
        inline: true
      }
    ],
    description,
    timestamp: new Date().toISOString(),
    footer: {
      text: "F4IR Shop • Cashout"
    }
  };

  const payload = {
    username: "F4IR Shop",
    embeds: [embed]
  };

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Webhook failed");
    showToast("Cashout sent", "success");
    state.cart = [];
    updateCartUI();
    closeCart();
  } catch (err) {
    showToast("Failed to send cashout", "error");
    // eslint-disable-next-line no-console
    console.error(err);
  }
}

/* Toasts */

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${
    type === "error" ? "toast-error" : "toast-success"
  }`;
  toast.textContent = message;
  els.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(4px)";
    setTimeout(() => toast.remove(), 220);
  }, 1400);
}

init();

