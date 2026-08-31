

document.addEventListener('DOMContentLoaded', async () => {
    const masonryGallery = document.getElementById('masonry-gallery');
    const catalogGrid = document.getElementById('catalog-grid');
    
    // We fetch all stickers
    let stickers = await fetchStickers();
    // Filter out sold out stickers if needed, but the prompt says they should be marked "SOLD OUT".
    
    function renderStickerCard(sticker) {
        const isSoldOut = sticker.soldOut;
        return `
            <div class="sticker-card ${isSoldOut ? 'sold-out' : ''}" style="position: relative; ${isSoldOut ? 'opacity: 0.9;' : ''}">
                ${isSoldOut ? '<img src="images/sold-out.png" alt="Sold Out" style="position: absolute; top: 10%; left: 10%; width: 80%; height: 80%; object-fit: contain; z-index: 10; pointer-events: none; transform: rotate(-15deg);">' : ''}
                <img src="${sticker.imageUrl}" alt="${sticker.name}" class="sticker-image" ${isSoldOut ? 'style="filter: grayscale(80%);"' : ''}>
                <h3>${sticker.name}</h3>
                <p class="category-tag">${sticker.category}</p>
                <p class="sticker-price">₹${sticker.price}</p>
                <div class="card-action-container" id="action-${sticker.id}">
                    <!-- Rendered dynamically by renderStickerActions -->
                </div>
            </div>
        `;
    }

    if (masonryGallery) {
        // Shuffle the array to randomize stickers
        const shuffledStickers = [...stickers].sort(() => 0.5 - Math.random());
        // Randomly pick a few or show all? Let's show up to 20 for a nice gallery effect.
        const galleryItems = shuffledStickers.slice(0, 20);
        
        masonryGallery.innerHTML = galleryItems.map(sticker => `
            <div class="masonry-item">
                <img src="${sticker.imageUrl}" alt="${sticker.name}">
            </div>
        `).join('');
    }

    if (catalogGrid) {
        const renderCatalog = (items) => {
            if (items.length === 0) {
                catalogGrid.innerHTML = '<p>No stickers found.</p>';
            } else {
                catalogGrid.innerHTML = items.map(renderStickerCard).join('');
            }
        };
        
        renderCatalog(stickers);

        // Setup filter
        const availabilityFilter = document.getElementById('availability-filter');
        const searchInput = document.getElementById('search-input');
        const sortSelect = document.getElementById('sort-select');

        function applyFilters() {
            let filtered = [...stickers];
            
            const avail = availabilityFilter?.value;
            if (avail === 'Available') {
                filtered = filtered.filter(s => !s.soldOut);
            } else if (avail === 'SoldOut') {
                filtered = filtered.filter(s => s.soldOut);
            }
            
            const term = searchInput?.value.toLowerCase();
            if (term) {
                filtered = filtered.filter(s => s.name.toLowerCase().includes(term));
            }

            const sort = sortSelect?.value;
            if (sort === 'price-asc') {
                filtered.sort((a, b) => a.price - b.price);
            } else if (sort === 'price-desc') {
                filtered.sort((a, b) => b.price - a.price);
            }
            
            renderCatalog(filtered);
        }

        if (availabilityFilter) availabilityFilter.addEventListener('change', applyFilters);
        if (searchInput) searchInput.addEventListener('input', applyFilters);
        if (sortSelect) sortSelect.addEventListener('change', applyFilters);
    }

    const justAddedIds = new Set();

    function renderStickerActions() {
        stickers.forEach(sticker => {
            const actionContainer = document.getElementById(`action-${sticker.id}`);
            if (actionContainer) {
                if (justAddedIds.has(sticker.id)) return; // Don't update during "Added!" animation
                
                const isSoldOut = sticker.soldOut;
                const cartItem = store.cart.find(i => i.id === sticker.id && i.type === 'catalog');
                let actionHtml = '';
                
                if (isSoldOut) {
                    actionHtml = '<button class="btn" style="width:100%; margin-top:10px; background:#e0e0e0; color:#888; cursor:not-allowed; border:none;" disabled>Out of Stock</button>';
                } else if (cartItem) {
                    actionHtml = `
                        <div class="qty-controls" data-id="${sticker.id}" style="display:flex; align-items:center; justify-content:center; gap:10px; margin-top: 10px;">
                            <button class="btn btn-secondary dec-qty" data-id="${sticker.id}" style="padding: 0.2rem 0.8rem; border-radius: 8px; font-size: 1.2rem; font-weight: bold;">-</button>
                            <span style="font-weight:bold; font-size:1.1rem; min-width:20px; text-align:center;">${cartItem.qty}</span>
                            <button class="btn btn-primary inc-qty" data-id="${sticker.id}" style="padding: 0.2rem 0.8rem; border-radius: 8px; font-size: 1.2rem; font-weight: bold;">+</button>
                        </div>
                    `;
                } else {
                    actionHtml = `<button class="btn btn-primary add-to-cart-btn" data-id="${sticker.id}" style="width:100%; margin-top: 10px;">Add to Cart</button>`;
                }
                
                // Avoid re-assigning if exactly same to prevent cursor/focus jumping
                if (actionContainer.innerHTML.trim() !== actionHtml.trim()) {
                    actionContainer.innerHTML = actionHtml;
                }
            }
        });
    }

    // Call once initially and subscribe
    renderStickerActions();
    store.subscribe(renderStickerActions);

    // Global Add to Cart listener
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const id = e.target.getAttribute('data-id');
            const sticker = stickers.find(s => s.id === id);
            if (sticker) {
                justAddedIds.add(sticker.id);
                store.addToCart({
                    id: sticker.id,
                    type: 'catalog',
                    name: sticker.name,
                    price: sticker.price,
                    imageUrl: sticker.imageUrl,
                    qty: 1
                });
                
                // Visual feedback
                const btn = e.target;
                const originalText = btn.textContent;
                btn.textContent = 'Added!';
                btn.style.backgroundColor = '#2ecc71';
                
                setTimeout(() => {
                    justAddedIds.delete(sticker.id);
                    renderStickerActions();
                }, 1000);
            }
        }
        
        if (e.target.classList.contains('inc-qty')) {
            const id = e.target.getAttribute('data-id');
            const cartItem = store.cart.find(i => i.id === id && i.type === 'catalog');
            if (cartItem) {
                store.updateQuantity(id, cartItem.qty + 1);
            }
        }

        if (e.target.classList.contains('dec-qty')) {
            const id = e.target.getAttribute('data-id');
            const cartItem = store.cart.find(i => i.id === id && i.type === 'catalog');
            if (cartItem) {
                store.updateQuantity(id, cartItem.qty - 1);
            }
        }
    });
});
