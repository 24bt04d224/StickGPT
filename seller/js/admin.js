

document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navOrders = document.getElementById('nav-orders');
    const navCatalog = document.getElementById('nav-catalog');
    const navStats = document.getElementById('nav-stats');
    const navLogout = document.getElementById('nav-logout');
    
    const viewOrders = document.getElementById('view-orders');
    const viewCatalog = document.getElementById('view-catalog');
    const viewStats = document.getElementById('view-stats');

    navOrders.addEventListener('click', () => {
        navOrders.classList.add('active');
        navCatalog.classList.remove('active');
        navStats.classList.remove('active');
        viewOrders.classList.remove('hidden');
        viewCatalog.classList.add('hidden');
        viewStats.classList.add('hidden');
        loadOrders();
    });

    navCatalog.addEventListener('click', () => {
        navCatalog.classList.add('active');
        navOrders.classList.remove('active');
        navStats.classList.remove('active');
        viewCatalog.classList.remove('hidden');
        viewOrders.classList.add('hidden');
        viewStats.classList.add('hidden');
        loadCatalog();
    });

    navStats.addEventListener('click', () => {
        navStats.classList.add('active');
        navOrders.classList.remove('active');
        navCatalog.classList.remove('active');
        viewStats.classList.remove('hidden');
        viewOrders.classList.add('hidden');
        viewCatalog.classList.add('hidden');
        loadStats();
    });

    navLogout.addEventListener('click', () => {
        localStorage.removeItem('seller_auth');
        localStorage.removeItem('seller_email');
        window.location.href = 'index.html';
    });

    // Mock state for if Apps Script isn't connected yet
    let mockOrders = [
        {
            orderId: 'ORD-12345678',
            timestamp: new Date().toISOString(),
            customerName: 'John Doe',
            phone: '+91 9876543210',
            address: '123 Fake St, Mumbai',
            status: 'New',
            totalAmount: 95,
            items: [
                { type: 'catalog', name: 'One Piece Logo', qty: 2, price: 30 },
                { type: 'custom', name: 'Custom Sticker', size: 'Medium', notes: 'No background', qty: 1, price: 35, imageUrl: 'https://via.placeholder.com/150' }
            ]
        }
    ];

    let currentOrders = [];

    // Orders Logic
    async function loadOrders() {
        const container = document.getElementById('orders-container');
        container.innerHTML = '<div style="text-align: center; padding: 2rem;">Loading orders...</div>';

        let orders = mockOrders;
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                orders = await res.json();
            } else {
                console.error('Failed to fetch orders from MongoDB API');
            }
        } catch (e) {
            console.error('Fetch error', e);
        }
        currentOrders = orders;

        if (orders.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; background: #fff; border-radius: 8px;">No orders found.</div>';
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-card" style="display: flex; background: #fff; border-radius: 12px; border: 1px solid #eee; box-shadow: 0 4px 6px rgba(0,0,0,0.02); padding: 1rem 1.5rem; gap: 2rem; align-items: center; transition: transform 0.2s;">
                
                <!-- Left: Images Bundle -->
                <div class="order-images-bundle" data-id="${order.orderId}" style="flex: 0 0 80px; height: 80px; position: relative; cursor: pointer;" title="Click to view all images">
                    ${(order.items || []).slice(0, 3).map((i, idx) => `
                        <img src="${i.type === 'custom' ? i.imageUrl : '../' + i.imageUrl}" 
                             style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 2px solid #fff; position: absolute; left: ${idx * 10}px; top: ${idx * 10}px; z-index: ${3 - idx}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onerror="this.src='https://via.placeholder.com/60?text=IMG'">
                    `).join('')}
                    ${(order.items || []).length > 3 ? `<div style="position: absolute; bottom: -5px; right: -5px; background: #222; color: #fff; font-size: 0.75rem; padding: 2px 6px; border-radius: 10px; z-index: 4; font-weight: bold;">+${order.items.length - 3}</div>` : ''}
                </div>

                <!-- Middle: Details (Tabular) -->
                <div style="flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; align-items: center;">
                    <div>
                        <strong style="font-size: 1.05rem; color: #333; display: block; margin-bottom: 2px;">${order.orderId}</strong>
                        <span style="color: #777; font-size: 0.85rem;">${new Date(order.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div>
                        <strong style="color:#222; display: block; margin-bottom: 2px;">${order.customerName}</strong>
                        <span style="color: #555; font-size: 0.85rem;">${order.phone}</span>
                    </div>
                    <div>
                        <span style="color: #555; display: block; margin-bottom: 2px;">Items: <strong>${(order.items || []).length}</strong></span>
                        <span style="color: #555;">Total: <strong style="color: #e53935; font-size: 1.1rem;">₹${order.totalAmount}</strong></span>
                    </div>
                </div>

                <!-- Right: Actions (Vertical) -->
                <div style="flex: 0 0 120px; display: flex; flex-direction: column; gap: 8px;">
                    <label style="cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 6px; padding: 6px; border-radius: 6px; background: ${order.status === 'Completed' ? '#e8f5e9' : '#fff3e0'}; color: ${order.status === 'Completed' ? '#2e7d32' : '#e65100'}; border: 1px solid ${order.status === 'Completed' ? '#81c784' : '#ffb74d'}; transition: all 0.2s; user-select: none;">
                        <input type="checkbox" class="status-checkbox" data-id="${order.orderId}" ${order.status === 'Completed' ? 'checked' : ''} style="accent-color: #2e7d32; cursor: pointer; width:16px; height:16px;">
                        <span class="status-text" style="font-weight: 600; font-size: 0.9rem;">${order.status === 'Completed' ? 'Completed' : 'Pending'}</span>
                    </label>
                    <button class="btn btn-outline view-order-btn" style="padding: 6px; font-size: 0.85rem;" data-id="${order.orderId}">View Details</button>
                    <button class="btn view-order-link" style="color:#d32f2f; border:1px solid #ef9a9a; background:#ffebee; padding: 6px; font-size: 0.85rem; border-radius: 6px;" data-action="delete" data-id="${order.orderId}">Delete Order</button>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('refresh-orders').addEventListener('click', loadOrders);

    // View Order Details
    const orderModal = document.getElementById('order-modal');
    document.getElementById('close-order-modal').addEventListener('click', () => orderModal.classList.add('hidden'));

    // Gallery Modal
    const galleryModal = document.getElementById('gallery-modal');
    document.getElementById('close-gallery-modal').addEventListener('click', () => galleryModal.classList.add('hidden'));

    document.getElementById('orders-container').addEventListener('click', async (e) => {
        const targetBundle = e.target.closest('.order-images-bundle');
        if (targetBundle) {
            const id = targetBundle.getAttribute('data-id');
            let orders = JSON.parse(localStorage.getItem('sticker_orders')) || mockOrders;
            const order = orders.find(o => o.orderId === id);
            if (order) {
                const galleryContent = document.getElementById('gallery-content');
                galleryContent.innerHTML = (order.items || []).map(i => `
                    <div style="display:flex; flex-direction:column; gap:4px; text-align:center;">
                        <div class="img-download-wrapper" style="border-radius:8px; overflow:hidden; border:1px solid #ddd;">
                            <img src="${i.type === 'custom' ? i.imageUrl : '../' + i.imageUrl}" style="width:100%; aspect-ratio:1; object-fit:cover;">
                            <div class="img-download-overlay">
                                <a href="${i.type === 'custom' ? i.imageUrl : '../' + i.imageUrl}" download="${i.name.replace(/[^a-z0-9]/gi, '_')}.png" title="Download Image" target="_blank">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                </a>
                            </div>
                        </div>
                        <span style="font-size:0.8rem; color:#555; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${i.name}</span>
                    </div>
                `).join('');
                galleryModal.classList.remove('hidden');
            }
            return;
        }

        const id = e.target.getAttribute('data-id') || (e.target.closest('button') && e.target.closest('button').getAttribute('data-id'));
        if (!id) return;

        if (e.target.classList.contains('status-checkbox')) {
            const isChecked = e.target.checked;
            const newStatus = isChecked ? 'Completed' : 'Pending';
            
            const orderIndex = currentOrders.findIndex(o => o.orderId === id);
            if (orderIndex > -1) {
                currentOrders[orderIndex].status = newStatus;
            }

            fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: id, status: newStatus })
            }).catch(err => console.error('Failed to update status', err));
            
            // visually update without full re-render
            const label = e.target.closest('label');
            const textSpan = label.querySelector('.status-text');
            textSpan.textContent = newStatus;
            if (isChecked) {
                label.style.background = '#e8f5e9';
                label.style.color = '#2e7d32';
                label.style.borderColor = '#81c784';
            } else {
                label.style.background = '#fff3e0';
                label.style.color = '#e65100';
                label.style.borderColor = '#ffb74d';
            }
            return;
        }

        if (e.target.dataset.action === 'delete') {
            if(confirm("Delete this order?")) {
                console.log(`Delete order ${id}`);
                fetch(`/api/orders?id=${id}`, { method: 'DELETE' })
                    .then(() => loadOrders())
                    .catch(err => console.error('Failed to delete order', err));
            }
            return;
        }

        // View Order
        if (e.target.classList.contains('view-order-btn') || e.target.classList.contains('view-order-link')) {
            e.preventDefault();
            // find order
            const order = currentOrders.find(o => o.orderId === id);
            if (order) {
                const detailsHtml = `
                    <p><strong>Customer:</strong> ${order.customerName}</p>
                    <p><strong>Phone:</strong> ${order.phone}</p>
                    <p><strong>Address:</strong> ${order.address}</p>
                    <p><strong>Notes:</strong> ${order.notes || 'None'}</p>
                    <hr style="margin: 1rem 0;">
                    <h4>Items</h4>
                    <ul style="list-style:none; padding:0;">
                        ${(order.items || []).map(i => `
                            <li style="margin-bottom: 1rem; border:1px solid #ddd; padding:0.5rem; border-radius:4px;">
                                <strong>${i.type === 'custom' ? '🏷️ Custom' : '📦 Catalog'}: ${i.name}</strong> x${i.qty} — ₹${i.price}
                                ${i.type === 'custom' ? `
                                    <br><small>Size: ${i.size} | Notes: ${i.notes}</small>
                                ` : ''}
                                <div class="img-download-wrapper" style="margin-top: 0.5rem; border-radius:4px; overflow:hidden; border: 1px solid #eee;">
                                    <img src="${i.type === 'custom' ? i.imageUrl : '../' + i.imageUrl}" style="max-width:100%; max-height:150px;">
                                    <div class="img-download-overlay">
                                        <a href="${i.type === 'custom' ? i.imageUrl : '../' + i.imageUrl}" download="${i.name.replace(/[^a-z0-9]/gi, '_')}.png" title="Download Image" target="_blank">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        </a>
                                    </div>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                    <h4>Total: ₹${order.totalAmount}</h4>
                `;
                document.getElementById('order-details-content').innerHTML = detailsHtml;
                orderModal.classList.remove('hidden');
            }
        }
    });

    // Catalog Logic
    let currentCatalog = [];
    async function loadCatalog() {
        const tbody = document.getElementById('catalog-table-body');
        tbody.innerHTML = '<tr><td colspan="6">Loading catalog...</td></tr>';
        
        try {
            currentCatalog = await fetchStickers();
        } catch (e) {
            console.error('Error fetching catalog', e);
            currentCatalog = [];
        }
        
        tbody.innerHTML = currentCatalog.map(sticker => {
            const imgPath = (sticker.imageUrl || '').startsWith('data:image') ? sticker.imageUrl : `../${sticker.imageUrl}`;
            const safeName = (sticker.name || 'Sticker').replace(/[^a-z0-9]/gi, '_');
            return `
            <tr>
                <td><input type="checkbox" class="catalog-row-checkbox" data-id="${sticker.id}"></td>
                <td>
                    <div class="img-download-wrapper" style="width:50px; height:50px; border-radius:4px; overflow:hidden;">
                        <img src="${imgPath}" alt="${sticker.name}" style="width:100%; height:100%; object-fit:contain;" onerror="this.src='https://via.placeholder.com/50?text=IMG'">
                        <div class="img-download-overlay">
                            <a href="${imgPath}" download="${safeName}.jpg" title="Download Image" style="width:24px; height:24px;" target="_blank">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            </a>
                        </div>
                    </div>
                </td>
                <td><span contenteditable="true" class="editable-field" data-field="name" data-id="${sticker.id}" style="border-bottom:1px dashed #ccc; outline:none; padding:2px; min-width: 50px; display: inline-block; cursor:text;" title="Click to edit">${sticker.name || ''}</span></td>
                <td><span contenteditable="true" class="editable-field" data-field="category" data-id="${sticker.id}" style="border-bottom:1px dashed #ccc; outline:none; padding:2px; min-width: 50px; display: inline-block; cursor:text;">${sticker.category || ''}</span></td>
                <td>₹<span contenteditable="true" class="editable-field" data-field="price" data-id="${sticker.id}" style="border-bottom:1px dashed #ccc; outline:none; padding:2px; min-width: 30px; display: inline-block; cursor:text;">${sticker.price || 0}</span></td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span contenteditable="true" class="editable-field" data-field="quantity" data-id="${sticker.id}" style="border-bottom:1px dashed #ccc; outline:none; padding:2px; min-width: 30px; display: inline-block; cursor:text;">${sticker.quantity || 0}</span>
                        <label style="display:flex; align-items:center; gap:4px; font-size:0.8rem; cursor:pointer;">
                            <input type="checkbox" class="soldout-toggle" data-id="${sticker.id}" ${sticker.soldOut ? 'checked' : ''}>
                            Sold Out
                        </label>
                    </div>
                </td>
                <td>
                    <button class="btn btn-outline edit-sticker-btn" data-id="${sticker.id}">Edit</button>
                    <button class="btn btn-outline delete-sticker-btn" data-id="${sticker.id}" style="color: #c62828; border-color: #c62828; margin-left: 4px;">Delete</button>
                </td>
            </tr>
        `;
        }).join('');
    }

    async function loadStats() {
        let orders = currentOrders;
        
        let completedCount = 0;
        let pendingCount = 0;
        let revenue = 0;

        orders.forEach(o => {
            if (o.status === 'Completed') {
                completedCount++;
                revenue += parseFloat(o.totalAmount || 0);
            } else {
                pendingCount++;
            }
        });

        document.getElementById('stat-completed').textContent = completedCount;
        document.getElementById('stat-pending').textContent = pendingCount;
        document.getElementById('stat-revenue').textContent = `₹${revenue}`;

        // Get catalog items for sold out warning
        let catalog = await fetchStickers();
        const soldOutItems = catalog.filter(s => s.soldOut === true || s.soldOut === 'true');
        
        const lowStockList = document.getElementById('low-stock-list');
        if (soldOutItems.length === 0) {
            lowStockList.innerHTML = '<li style="color:#555;">No stickers are currently sold out.</li>';
        } else {
            lowStockList.innerHTML = soldOutItems.map(s => `
                <li style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding:0.5rem 0;">
                    <div style="display:flex; align-items:center; gap: 10px;">
                        <img src="../${s.imageUrl}" style="width:30px; height:30px; object-fit:contain; background:#f9f9f9;">
                        <strong>${s.name}</strong>
                    </div>
                    <span style="color:#c62828; font-weight:bold; background:#ffebee; padding:4px 8px; border-radius:12px; font-size:0.8rem;">Sold Out</span>
                </li>
            `).join('');
        }
    }
    
    document.getElementById('refresh-stats').addEventListener('click', loadStats);

    // Modal logic for Catalog
    const stickerModal = document.getElementById('sticker-modal');
    document.getElementById('close-sticker-modal').addEventListener('click', () => stickerModal.classList.add('hidden'));
    
    document.getElementById('add-sticker-btn').addEventListener('click', () => {
        document.getElementById('sticker-form').reset();
        document.getElementById('sticker-id').value = '';
        document.getElementById('sticker-image-url').value = '';
        document.getElementById('add-fields-container').style.display = 'block';
        document.getElementById('edit-fields-container').style.display = 'none';
        document.getElementById('image-preview-container').innerHTML = '';
        document.getElementById('modal-title').textContent = 'Add New Sticker(s)';
        stickerModal.classList.remove('hidden');
    });

    document.getElementById('sticker-image').addEventListener('change', (e) => {
        const previewContainer = document.getElementById('image-preview-container');
        previewContainer.innerHTML = '';
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.width = '60px';
                    img.style.height = '60px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '4px';
                    img.style.border = '1px solid #ccc';
                    previewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        }
    });

    // Bulk Delete Logic
    document.getElementById('select-all-catalog').addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.catalog-row-checkbox');
        checkboxes.forEach(cb => cb.checked = e.target.checked);
        toggleDeleteSelectedBtn();
    });

    document.getElementById('catalog-table-body').addEventListener('change', (e) => {
        if (e.target.classList.contains('catalog-row-checkbox')) {
            toggleDeleteSelectedBtn();
        }
    });

    function toggleDeleteSelectedBtn() {
        const anyChecked = document.querySelectorAll('.catalog-row-checkbox:checked').length > 0;
        document.getElementById('delete-selected-btn').style.display = anyChecked ? 'inline-block' : 'none';
    }

    document.getElementById('delete-selected-btn').addEventListener('click', () => {
        const checkedBoxes = document.querySelectorAll('.catalog-row-checkbox:checked');
        if (checkedBoxes.length === 0) return;
        
        if (confirm(`Are you sure you want to delete ${checkedBoxes.length} selected sticker(s)?`)) {
            const idsToDelete = Array.from(checkedBoxes).map(cb => cb.getAttribute('data-id'));
            currentCatalog = currentCatalog.filter(s => !idsToDelete.includes(s.id));
            fetch(`/api/catalog?ids=${idsToDelete.join(',')}`, { method: 'DELETE' }).catch(console.error);
            
            loadCatalog();
            document.getElementById('delete-selected-btn').style.display = 'none';
            document.getElementById('select-all-catalog').checked = false;
        }
    });

    document.getElementById('catalog-table-body').addEventListener('blur', (e) => {
        if (e.target.classList.contains('editable-field')) {
            const id = e.target.getAttribute('data-id');
            const field = e.target.getAttribute('data-field');
            const value = e.target.innerText.trim();
            
            const stickerIndex = currentCatalog.findIndex(s => s.id === id);
            if (stickerIndex > -1) {
                if (field === 'price') {
                    const num = parseFloat(value.replace(/[^0-9.]/g, ''));
                    currentCatalog[stickerIndex][field] = isNaN(num) ? 0 : num;
                    e.target.innerText = currentCatalog[stickerIndex][field];
                } else {
                    currentCatalog[stickerIndex][field] = value;
                }
                
                fetch('/api/catalog', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'saveSticker', ...currentCatalog[stickerIndex] })
                }).catch(console.error);
            }
        }
    }, true);

    document.getElementById('catalog-table-body').addEventListener('change', async (e) => {
        if (e.target.classList.contains('soldout-toggle')) {
            const id = e.target.getAttribute('data-id');
            const stickerIndex = currentCatalog.findIndex(s => s.id === id);
            if (stickerIndex > -1) {
                currentCatalog[stickerIndex].soldOut = e.target.checked;
                
                fetch('/api/catalog', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'saveSticker', ...currentCatalog[stickerIndex] })
                }).catch(console.error);
            }
        }
    });

    document.getElementById('catalog-table-body').addEventListener('click', async (e) => {
        if (e.target.classList.contains('toggle-soldout-catalog-btn')) {
            // Deprecated button handler, removed logic to avoid duplication
            return;
        }

        if (e.target.classList.contains('edit-sticker-btn')) {
            const id = e.target.getAttribute('data-id');
            const sticker = currentCatalog.find(s => s.id === id);
            if (sticker) {
                document.getElementById('sticker-form').reset();
                document.getElementById('add-fields-container').style.display = 'none';
                document.getElementById('edit-fields-container').style.display = 'block';
                document.getElementById('sticker-id').value = sticker.id;
                document.getElementById('sticker-name').value = sticker.name;
                document.getElementById('sticker-category').value = sticker ? sticker.category : 'All';
                document.getElementById('sticker-price').value = sticker ? sticker.price : '';
                document.getElementById('sticker-image-url').value = sticker ? sticker.imageUrl : '';
                document.getElementById('sticker-quantity').value = sticker ? (sticker.quantity || 0) : 0;
                document.getElementById('sticker-soldout').checked = sticker ? sticker.soldOut : false;
                
                document.getElementById('modal-title').textContent = 'Edit Sticker';
                stickerModal.classList.remove('hidden');
            }
        }

        if (e.target.classList.contains('delete-sticker-btn')) {
            const id = e.target.getAttribute('data-id');
            const sticker = currentCatalog.find(s => s.id === id);
            if (sticker && confirm(`Are you sure you want to delete "${sticker.name}"?`)) {
                currentCatalog = currentCatalog.filter(s => s.id !== id);
                fetch(`/api/catalog?ids=${id}`, { method: 'DELETE' }).catch(console.error);
                loadCatalog();
            }
        }
    });

    document.getElementById('sticker-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.querySelector('#sticker-form button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Loading...';
        submitBtn.disabled = true;

        const idField = document.getElementById('sticker-id').value;
        const isEdit = !!idField;
        const fileInput = document.getElementById('sticker-image');
        const files = fileInput.files;
        
        if (!isEdit && files.length === 0) {
            alert('Please select at least one image file to add stickers.');
            return;
        }

        const category = document.getElementById('sticker-category').value || 'All';
        const price = document.getElementById('sticker-price').value || 30;
        const quantity = parseInt(document.getElementById('sticker-quantity').value) || 0;
        const soldOut = document.getElementById('sticker-soldout').checked;
        const manualName = document.getElementById('sticker-name').value;
        
        // Find highest sticker number for auto-naming
        let highestStickerNum = 0;
        currentCatalog.forEach(s => {
            const match = s.name.match(/^Sticker\s+(\d+)$/i);
            if (match) {
                const num = parseInt(match[1]);
                if (num > highestStickerNum) highestStickerNum = num;
            }
        });
        
        let addedCount = 0;

        if (files.length > 0 && !isEdit) {
            // Bulk Add
            const processFile = (file, i) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 400;
                            const MAX_HEIGHT = 400;
                            let width = img.width;
                            let height = img.height;
                            
                            if (width > height) {
                                if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                }
                            } else {
                                if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                }
                            }
                            
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                            
                            highestStickerNum++;
                            let stickerName = `Sticker ${highestStickerNum}`;
                            
                            const stickerData = {
                                id: 'STK-' + Date.now() + '-' + i,
                                name: stickerName,
                                category: 'All',
                                price: 30,
                                imageUrl: dataUrl, // Save compressed base64 string
                                quantity: 0,
                                soldOut: false
                            };
                            
                            currentCatalog.push(stickerData);
                            addedCount++;
                            resolve();
                        };
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                });
            };

            const filePromises = [];
            for (let i = 0; i < files.length; i++) {
                filePromises.push(processFile(files[i], i));
            }

            await Promise.all(filePromises);
        } else if (isEdit) {
            // Edit without changing image
            const idx = currentCatalog.findIndex(s => s.id === idField);
            if (idx > -1) {
                currentCatalog[idx] = {
                    id: idField,
                    name: manualName || currentCatalog[idx].name,
                    category: category,
                    price: price,
                    imageUrl: document.getElementById('sticker-image-url').value,
                    quantity: quantity,
                    soldOut: soldOut
                };
                addedCount = 1;
            }
        }

        await fetch('/api/catalog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'updateCatalog', catalog: currentCatalog })
        }).catch(console.error);

        stickerModal.classList.add('hidden');
        loadCatalog();
        
        if (addedCount > 1) {
            alert(`Successfully added ${addedCount} stickers!`);
        }
        
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    });

    // Init
    loadOrders();
});
