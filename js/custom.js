

document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('custom-items-list');
    const addAnotherBtn = document.getElementById('add-another-custom');
    const checkoutForm = document.getElementById('custom-checkout-form');
    const totalDisplay = document.getElementById('custom-total');
    const waButtonsContainer = document.getElementById('wa-buttons-container');
    const btnConfirm = document.getElementById('btn-confirm');
    
    let customItems = [];
    let generatedWaMessage = "";

    const waBtn1 = document.getElementById('btn-wa-1');
    const waBtn2 = document.getElementById('btn-wa-2');

    if (waBtn1) waBtn1.addEventListener('click', () => {
        const encodedMessage = encodeURIComponent(generatedWaMessage);
        const waUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBERS[0]}?text=${encodedMessage}`;
        window.location.href = waUrl;
    });
    if (waBtn2) waBtn2.addEventListener('click', () => {
        const encodedMessage = encodeURIComponent(generatedWaMessage);
        const waUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBERS[1]}?text=${encodedMessage}`;
        window.location.href = waUrl;
    });

    function createCustomItemForm() {
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        const itemObj = { id, fileBase64: null, notes: '', size: 'Medium', qty: 1 };
        customItems.push(itemObj);
        renderForms();
        updateTotal();
    }

    function removeCustomItemForm(id) {
        customItems = customItems.filter(i => i.id !== id);
        renderForms();
        updateTotal();
    }

    function updateItem(id, key, value) {
        const item = customItems.find(i => i.id === id);
        if (item) {
            item[key] = value;
            if (key === 'qty') updateTotal();
        }
    }

    function updateTotal() {
        if (!totalDisplay) return;
        const total = customItems.reduce((acc, item) => acc + (CONFIG.CUSTOM_STICKER_PRICE * item.qty), 0);
        totalDisplay.textContent = total;
    }

    function renderForms() {
        if (!listContainer) return;
        
        listContainer.innerHTML = customItems.map((item, index) => `
            <div class="custom-form-block" style="border: 1px solid #ddd; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; position: relative; background: #fafafa;">
                <h4 style="margin-bottom: 0.5rem; font-size: 1rem;">Custom Sticker #${index + 1}</h4>
                ${customItems.length > 1 ? `<button type="button" class="remove-custom-btn" data-id="${item.id}" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: var(--error-color); cursor: pointer; font-weight: bold; font-size: 1.2rem;">&times;</button>` : ''}
                
                <div class="form-group" style="margin-bottom: 0.5rem;">
                    <label style="font-size: 0.8rem;">Upload Image</label>
                    <input type="file" class="form-control file-input" style="padding: 0.25rem;" accept="image/png, image/jpeg, image/webp" data-id="${item.id}">
                    <div class="image-preview" id="preview-${item.id}" style="margin-top: 0.25rem;">
                        ${item.fileBase64 ? `<img src="${item.fileBase64}" style="max-height: 80px; border-radius: 4px;">` : ''}
                    </div>
                </div>

                <div style="display: flex; gap: 1rem; margin-bottom: 0.5rem;">
                    <div class="form-group" style="flex: 2; margin-bottom: 0;">
                        <label style="font-size: 0.8rem;">Size</label>
                        <select class="form-control size-input" style="padding: 0.25rem;" data-id="${item.id}">
                            <option value="Small" ${item.size === 'Small' ? 'selected' : ''}>Small (2x2")</option>
                            <option value="Medium" ${item.size === 'Medium' ? 'selected' : ''}>Medium (3x3")</option>
                            <option value="Large" ${item.size === 'Large' ? 'selected' : ''}>Large (4x4")</option>
                        </select>
                    </div>

                    <div class="form-group" style="flex: 1; margin-bottom: 0;">
                        <label style="font-size: 0.8rem;">Qty</label>
                        <input type="number" min="1" value="${item.qty}" class="form-control qty-input" style="padding: 0.25rem;" data-id="${item.id}">
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.8rem;">Notes</label>
                    <input type="text" class="form-control notes-input" style="padding: 0.25rem;" data-id="${item.id}" value="${item.notes}" placeholder="e.g. transparent background">
                </div>
            </div>
        `).join('');
    }

    if (listContainer) {
        listContainer.addEventListener('change', (e) => {
            const id = e.target.getAttribute('data-id');
            if (!id) return;

            if (e.target.classList.contains('file-input')) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const base64 = event.target.result;
                        updateItem(id, 'fileBase64', base64);
                        const preview = document.getElementById(`preview-${id}`);
                        if (preview) preview.innerHTML = `<img src="${base64}" style="max-height: 80px; border-radius: 4px;">`;
                    };
                    reader.readAsDataURL(file);
                }
            } else if (e.target.classList.contains('size-input')) {
                updateItem(id, 'size', e.target.value);
            } else if (e.target.classList.contains('qty-input')) {
                updateItem(id, 'qty', parseInt(e.target.value) || 1);
            } else if (e.target.classList.contains('notes-input')) {
                updateItem(id, 'notes', e.target.value);
            }
        });

        listContainer.addEventListener('input', (e) => {
             if (e.target.classList.contains('notes-input')) {
                const id = e.target.getAttribute('data-id');
                if(id) updateItem(id, 'notes', e.target.value);
            }
        });

        listContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-custom-btn')) {
                const id = e.target.getAttribute('data-id');
                removeCustomItemForm(id);
            }
        });
    }

    if (addAnotherBtn) {
        addAnotherBtn.addEventListener('click', () => {
            createCustomItemForm();
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (customItems.length === 0) return;

            let valid = true;
            for (const item of customItems) {
                if (!item.fileBase64) {
                    alert("Please upload an image for all custom stickers.");
                    valid = false;
                    break;
                }
            }
            if (!valid) return;

            if (!confirm("Are you sure you want to confirm this order?")) {
                return;
            }

            btnConfirm.classList.add('hidden');
            waButtonsContainer.classList.remove('hidden');

            const name = document.getElementById('cust-name').value;
            const phone = document.getElementById('cust-phone').value;
            const email = document.getElementById('cust-email').value;
            const notes = document.getElementById('cust-notes').value;

            const orderId = 'ORD-C-' + Date.now();
            const totalAmount = customItems.reduce((acc, item) => acc + (CONFIG.CUSTOM_STICKER_PRICE * item.qty), 0);

            // Format WhatsApp Message
            let message = `*NEW CUSTOM STICKER ORDER*\n\n`;
            message += `Name: ${name}\n`;
            message += `Phone: ${phone}\n`;
            if(email) message += `Email: ${email}\n`;
            message += `\n`;
            
            message += `*Order Details:*\n`;
            customItems.forEach((item, index) => {
                message += `- CUSTOM STICKER #${index + 1} (Qty: ${item.qty}) - Size: ${item.size}, Notes: ${item.notes || 'None'}\n`;
            });

            message += `\n*Total Amount: ₹${totalAmount}*\n\n`;
            if(notes) message += `Delivery Notes: ${notes}\n\n`;
            message += `Order ID: ${orderId}\n`;
            message += `Date: ${new Date().toLocaleString()}`;

            generatedWaMessage = message;

            const payloadItems = customItems.map(i => ({
                type: 'custom',
                name: 'Custom Sticker',
                price: CONFIG.CUSTOM_STICKER_PRICE,
                qty: i.qty,
                imageUrl: i.fileBase64,
                notes: i.notes,
                size: i.size
            }));

            const payload = {
                action: 'placeOrder',
                orderId,
                timestamp: new Date().toISOString(),
                customerName: name,
                phone,
                email,
                notes,
                totalAmount,
                items: payloadItems // Base64 data included
            };

            // Local Fallback for Demo
            const existingOrders = JSON.parse(localStorage.getItem('sticker_orders')) || [];
            existingOrders.unshift(payload);
            try {
                localStorage.setItem('sticker_orders', JSON.stringify(existingOrders));
            } catch(e) {
                console.warn("Storage quota exceeded, clearing old orders");
                localStorage.setItem('sticker_orders', JSON.stringify([payload]));
            }

            // Background send to Apps Script to save in Google Sheets
            if (CONFIG.APPS_SCRIPT_URL) {
                try {
                    fetch(CONFIG.APPS_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors', 
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                } catch(err) {
                    console.error('Failed to log order to sheets', err);
                }
            }
        });
    }

    // Initialize one form empty
    if (listContainer) {
        createCustomItemForm();
    }
});
