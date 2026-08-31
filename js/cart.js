

document.addEventListener('DOMContentLoaded', () => {
    const cartToggle = document.getElementById('cart-toggle');
    const closeCart = document.getElementById('close-cart');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');

    function openCart() {
        cartDrawer.classList.add('open');
        cartOverlay.classList.remove('hidden');
    }

    function hideCart() {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.add('hidden');
    }

    if (cartToggle) cartToggle.addEventListener('click', openCart);
    if (closeCart) closeCart.addEventListener('click', hideCart);
    if (cartOverlay) cartOverlay.addEventListener('click', hideCart);

    function renderCart(cartData) {
        if (!cartCount || !cartItemsContainer || !cartTotalPrice) return;
        
        cartCount.textContent = store.getCartCount();
        cartTotalPrice.textContent = store.getCartTotal();

        if (cartData.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            return;
        }

        cartItemsContainer.innerHTML = cartData.map(item => `
            <div class="cart-item" data-id="${item.cartId}">
                <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.type === 'custom' ? '🏷️ Custom: ' : ''}${item.name}</div>
                    ${item.notes ? `<div style="font-size:0.8rem; color:#666;">Note: ${item.notes}</div>` : ''}
                    <div class="cart-item-price">₹${item.price}</div>
                    <div class="cart-item-actions">
                        <button class="qty-btn minus" data-id="${item.cartId}">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn plus" data-id="${item.cartId}">+</button>
                        <button class="remove-btn" data-id="${item.cartId}">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Event delegation for cart actions
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            if (!id) return;

            const item = store.cart.find(i => i.cartId === id);
            
            if (e.target.classList.contains('minus')) {
                store.updateQuantity(id, item.qty - 1);
            } else if (e.target.classList.contains('plus')) {
                store.updateQuantity(id, item.qty + 1);
            } else if (e.target.classList.contains('remove-btn')) {
                store.removeFromCart(id);
            }
        });
    }

    // Subscribe to store changes
    store.subscribe(renderCart);
    
    // Initial render
    renderCart(store.cart);
});
