

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
        masonryGallery.className = 'sticker-grid mini-grid';
        masonryGallery.innerHTML = stickers.map(renderStickerCard).join('');
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

            renderCatalog(filtered);
            renderStickerActions();
        }

        if (availabilityFilter) availabilityFilter.addEventListener('change', applyFilters);
        if (searchInput) searchInput.addEventListener('input', applyFilters);
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

    // ── Helpers for particle effects ──
    function createParticle(x, y, color, size, duration) {
        const p = document.createElement('div');
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 80;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        p.style.cssText = `
            position: fixed; z-index: 10000; pointer-events: none;
            left: ${x}px; top: ${y}px;
            width: ${size}px; height: ${size}px;
            background: ${color};
            border-radius: 50%;
            box-shadow: 0 0 ${size * 2}px ${color};
            transition: all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
            opacity: 1;
        `;
        document.body.appendChild(p);
        requestAnimationFrame(() => {
            p.style.left = `${x + dx}px`;
            p.style.top = `${y + dy}px`;
            p.style.opacity = '0';
            p.style.transform = `scale(0)`;
        });
        setTimeout(() => p.remove(), duration);
    }

    function burstParticles(x, y, count, colors, sizeRange, duration) {
        for (let i = 0; i < count; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
            setTimeout(() => createParticle(x, y, color, size, duration), i * 15);
        }
    }

    function createTrailDot(x, y) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: fixed; z-index: 9998; pointer-events: none;
            left: ${x}px; top: ${y}px;
            width: 6px; height: 6px;
            background: radial-gradient(circle, #ffd700, #ff8c00);
            border-radius: 50%;
            box-shadow: 0 0 8px #ffd700, 0 0 16px rgba(255,215,0,0.4);
            opacity: 0.9;
            transition: opacity 0.5s ease, transform 0.5s ease;
        `;
        document.body.appendChild(dot);
        requestAnimationFrame(() => {
            dot.style.opacity = '0';
            dot.style.transform = 'scale(0.2)';
        });
        setTimeout(() => dot.remove(), 500);
    }

    function createShockwave(x, y) {
        const ring = document.createElement('div');
        ring.style.cssText = `
            position: fixed; z-index: 10001; pointer-events: none;
            left: ${x}px; top: ${y}px;
            width: 0; height: 0;
            border: 3px solid var(--primary-color);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            opacity: 1;
            transition: all 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
        `;
        document.body.appendChild(ring);
        requestAnimationFrame(() => {
            ring.style.width = '80px';
            ring.style.height = '80px';
            ring.style.opacity = '0';
            ring.style.borderWidth = '1px';
        });
        setTimeout(() => ring.remove(), 550);

        // Second ring, slightly delayed
        setTimeout(() => {
            const ring2 = document.createElement('div');
            ring2.style.cssText = `
                position: fixed; z-index: 10001; pointer-events: none;
                left: ${x}px; top: ${y}px;
                width: 0; height: 0;
                border: 2px solid #ff8c00;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                opacity: 0.7;
                transition: all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
            `;
            document.body.appendChild(ring2);
            requestAnimationFrame(() => {
                ring2.style.width = '50px';
                ring2.style.height = '50px';
                ring2.style.opacity = '0';
            });
            setTimeout(() => ring2.remove(), 450);
        }, 80);
    }

    // ── Added to Cart Popup Notification ──
    let addedPopupTimeout = null;
    function showAddedPopup(sticker) {
        let popup = document.getElementById('added-cart-popup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'added-cart-popup';
            popup.className = 'added-cart-popup';
            document.body.appendChild(popup);
        }

        popup.innerHTML = `
            <div class="popup-inner">
                <div class="popup-badge">✓</div>
                <img src="${sticker.imageUrl}" alt="${sticker.name}" class="popup-img">
                <div class="popup-text">
                    <span class="popup-status">Added!</span>
                    <span class="popup-name">${sticker.name}</span>
                </div>
                <button class="popup-view-cart" id="popup-view-cart-btn">View Cart 🛒</button>
                <button class="popup-close-btn" id="popup-close-btn" aria-label="Close">&times;</button>
            </div>
        `;

        const viewCartBtn = popup.querySelector('#popup-view-cart-btn');
        if (viewCartBtn) {
            viewCartBtn.onclick = () => {
                const cartToggle = document.getElementById('cart-toggle');
                if (cartToggle) cartToggle.click();
                hidePopup();
            };
        }

        const closeBtn = popup.querySelector('#popup-close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                hidePopup();
            };
        }

        function hidePopup() {
            popup.classList.remove('show');
            popup.classList.add('hide');
        }

        popup.classList.remove('hide');
        void popup.offsetWidth; // Trigger reflow
        popup.classList.add('show');

        if (addedPopupTimeout) clearTimeout(addedPopupTimeout);
        addedPopupTimeout = setTimeout(() => {
            hidePopup();
        }, 3500);
    }

    // ── Main fly-to-cart animation ──
    function flyToCart(btnElement, sticker) {
        const card = btnElement.closest('.sticker-card');
        const img = card?.querySelector('.sticker-image');
        const cartBtn = document.getElementById('cart-toggle');
        if (!img || !cartBtn) return Promise.resolve();

        // Target the trolley icon directly
        const trolleyIcon = cartBtn.querySelector('.cart-trolley-svg') || cartBtn;
        const imgRect = img.getBoundingClientRect();
        const cartRect = trolleyIcon.getBoundingClientRect();

        // Source & destination centers (aims right at trolley basket)
        const startX = imgRect.left + imgRect.width / 2;
        const startY = imgRect.top + imgRect.height / 2;
        const endX = cartRect.left + cartRect.width / 2;
        const endY = cartRect.top + cartRect.height / 2;

        // Activate receiving trolley state immediately
        cartBtn.classList.add('cart-receiving');

        // Flash the card with a golden glow
        card.style.transition = 'box-shadow 0.3s ease, transform 0.3s ease';
        card.style.boxShadow = '0 0 30px rgba(255,215,0,0.6), inset 0 0 20px rgba(255,215,0,0.1)';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.boxShadow = '';
            card.style.transform = '';
        }, 400);

        // Burst sparkle particles from the image
        burstParticles(startX, startY, 14, ['#ffd700', '#ffb300', '#fff4c2', '#ff8c00', '#ffffff'], [3, 8], 600);

        // Create the flying clone
        const clone = document.createElement('img');
        clone.src = sticker.imageUrl;
        clone.style.cssText = `
            position: fixed; z-index: 9999; pointer-events: none;
            left: ${imgRect.left}px; top: ${imgRect.top}px;
            width: ${imgRect.width}px; height: ${imgRect.height}px;
            object-fit: contain; border-radius: 12px;
            filter: drop-shadow(0 0 20px rgba(255,215,0,0.8));
        `;
        document.body.appendChild(clone);

        return new Promise(resolve => {
            // Phase 1 – pop out with spring
            clone.animate([
                { transform: 'scale(1)', filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))' },
                { transform: 'scale(1.3) rotate(-5deg)', filter: 'drop-shadow(0 0 30px rgba(255,215,0,0.9))' }
            ], { duration: 300, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'forwards' });

            setTimeout(() => {
                // Phase 2 – fly along a parabolic arc using Web Animations API
                const dx = endX - startX;
                const dy = endY - startY;
                // Control point for the arc (lift upward)
                const arcHeight = Math.min(Math.abs(dy) * 0.6, 200);
                const steps = 30;
                const keyframes = [];

                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    // Quadratic bezier: P = (1-t)²P0 + 2(1-t)t·Pc + t²·P1
                    const cpX = startX + dx * 0.5;
                    const cpY = Math.min(startY, endY) - arcHeight;
                    const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * cpX + t * t * endX;
                    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * cpY + t * t * endY;

                    const scale = 1.3 - t * 1.15;  // 1.3 → 0.15 shrinks right into trolley basket
                    const rotation = t * 720;       // two full spins
                    const opacity = t > 0.88 ? (1 - (t - 0.88) / 0.12) : 1; // sinks into cart at the end

                    keyframes.push({
                        left: `${x - imgRect.width / 2 * scale}px`,
                        top: `${y - imgRect.height / 2 * scale}px`,
                        width: `${imgRect.width * scale}px`,
                        height: `${imgRect.height * scale}px`,
                        transform: `rotate(${rotation}deg)`,
                        opacity: opacity,
                        borderRadius: `${t * 50}%`,
                        filter: `drop-shadow(0 0 ${20 - t * 18}px rgba(255,215,0,${0.8 - t * 0.6}))`,
                        offset: t
                    });
                }

                const flyAnim = clone.animate(keyframes, {
                    duration: 700,
                    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
                    fill: 'forwards'
                });

                // Spawn trail particles along the path
                let trailInterval = setInterval(() => {
                    const r = clone.getBoundingClientRect();
                    createTrailDot(r.left + r.width / 2, r.top + r.height / 2);
                }, 35);

                flyAnim.onfinish = () => {
                    clearInterval(trailInterval);
                    clone.remove();
                    cartBtn.classList.remove('cart-receiving');

                    // Landing effects right at the trolley
                    createShockwave(endX, endY);
                    burstParticles(endX, endY, 14, ['#ffd700', '#ff8c00', '#25d366', '#fff'], [2, 6], 500);

                    // Elastic bounce on cart button
                    cartBtn.animate([
                        { transform: 'scale(1)' },
                        { transform: 'scale(1.35) translateY(4px)', offset: 0.2 },
                        { transform: 'scale(0.9) translateY(-2px)', offset: 0.45 },
                        { transform: 'scale(1.1) translateY(1px)', offset: 0.7 },
                        { transform: 'scale(0.98)', offset: 0.85 },
                        { transform: 'scale(1)' }
                    ], { duration: 500, easing: 'ease-out' });

                    // Golden flash on cart badge
                    const badge = document.getElementById('cart-count');
                    if (badge) {
                        badge.animate([
                            { background: '#ffd700', color: '#000', transform: 'scale(1.8)', boxShadow: '0 0 16px #ffd700' },
                            { background: '', color: '', transform: 'scale(1)', boxShadow: 'none' }
                        ], { duration: 500, easing: 'ease-out', fill: 'forwards' });
                    }

                    // Show the "Added!" popup!
                    showAddedPopup(sticker);

                    resolve();
                };
            }, 320);
        });
    }

    // Global Add to Cart listener
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const id = e.target.getAttribute('data-id');
            const sticker = stickers.find(s => s.id === id);
            if (sticker) {
                justAddedIds.add(sticker.id);

                // Immediately update button text while animation plays
                const btn = e.target;
                btn.disabled = true;
                btn.textContent = 'Adding...';
                btn.style.backgroundColor = '#e6c200';

                flyToCart(btn, sticker).then(() => {
                    // Actually add to cart after the animation finishes
                    store.addToCart({
                        id: sticker.id,
                        type: 'catalog',
                        name: sticker.name,
                        price: sticker.price,
                        imageUrl: sticker.imageUrl,
                        qty: 1
                    });

                    btn.textContent = '✓ Added!';
                    btn.style.backgroundColor = '#2ecc71';
                    btn.style.color = '#fff';

                    setTimeout(() => {
                        justAddedIds.delete(sticker.id);
                        renderStickerActions();
                    }, 1200);
                });
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
