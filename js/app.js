

class StateStore {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('sticker_cart')) || [];
        this.listeners = [];
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.cart));
        localStorage.setItem('sticker_cart', JSON.stringify(this.cart));
    }

    addToCart(item) {
        // item = { id (optional), type: 'catalog'|'custom', name, price, qty, imageUrl, notes, size }
        
        if (item.type === 'catalog' && item.id) {
            const existing = this.cart.find(i => i.id === item.id && i.type === 'catalog');
            if (existing) {
                existing.qty += item.qty;
                this.notify();
                return;
            }
        }
        
        // For custom items, or new catalog items
        // Generate a unique id for cart operations if not catalog
        const cartItem = {
            ...item,
            cartId: item.type === 'catalog' ? item.id : 'custom_' + Date.now() + Math.random().toString(36).substr(2, 9)
        };
        
        this.cart.push(cartItem);
        this.notify();
    }

    removeFromCart(cartId) {
        this.cart = this.cart.filter(item => item.cartId !== cartId);
        this.notify();
    }

    updateQuantity(cartId, newQty) {
        const item = this.cart.find(i => i.cartId === cartId);
        if (item) {
            item.qty = parseInt(newQty);
            if (item.qty <= 0) {
                this.removeFromCart(cartId);
            } else {
                this.notify();
            }
        }
    }

    clearCart() {
        this.cart = [];
        this.notify();
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.qty), 0);
    }
    
    getCartCount() {
        return this.cart.reduce((total, item) => total + item.qty, 0);
    }
}

const store = new StateStore();

// Utility for fetching local or remote data
async function fetchStickers() {
    if (CONFIG.APPS_SCRIPT_URL) {
        try {
            const res = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=getStickers`);
            if (res.ok) {
                const data = await res.json();
                return data; // assuming data is array of objects
            }
        } catch (e) {
            console.error("Failed to fetch from Apps Script, falling back to local/mock", e);
        }
    }
    
    // Fallback/Mock data (until backend is linked)
    const mockData = [
    {
        "id": "1",
        "name": "Sticker 1",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.08 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "2",
        "name": "Sticker 2",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.08 PM (2).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "3",
        "name": "Sticker 3",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.08 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "4",
        "name": "Sticker 4",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.09 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "5",
        "name": "Sticker 5",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.09 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "6",
        "name": "Sticker 6",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.10 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "7",
        "name": "Sticker 7",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.10 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "8",
        "name": "Sticker 8",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.12 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "9",
        "name": "Sticker 9",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.12 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "10",
        "name": "Sticker 10",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.15 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "11",
        "name": "Sticker 11",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.16 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "12",
        "name": "Sticker 12",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.16 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "13",
        "name": "Sticker 13",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.17 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "14",
        "name": "Sticker 14",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.17 PM (2).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "15",
        "name": "Sticker 15",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.17 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "16",
        "name": "Sticker 16",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.20 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "17",
        "name": "Sticker 17",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.20 PM (2).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "18",
        "name": "Sticker 18",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.20 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "19",
        "name": "Sticker 19",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.21 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "20",
        "name": "Sticker 20",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.21 PM (2).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "21",
        "name": "Sticker 21",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.21 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "22",
        "name": "Sticker 22",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.22 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "23",
        "name": "Sticker 23",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.22 PM (2).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "24",
        "name": "Sticker 24",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.22 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "25",
        "name": "Sticker 25",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.23 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "26",
        "name": "Sticker 26",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.24 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "27",
        "name": "Sticker 27",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.28 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "28",
        "name": "Sticker 28",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.29 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "29",
        "name": "Sticker 29",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.29 PM (2).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "30",
        "name": "Sticker 30",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.29 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "31",
        "name": "Sticker 31",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.30 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "32",
        "name": "Sticker 32",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.30 PM (2).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "33",
        "name": "Sticker 33",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.30 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "34",
        "name": "Sticker 34",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.31 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "35",
        "name": "Sticker 35",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.31 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "36",
        "name": "Sticker 36",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.32 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "37",
        "name": "Sticker 37",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.32 PM (2).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "38",
        "name": "Sticker 38",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.32 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "39",
        "name": "Sticker 39",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.33 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "40",
        "name": "Sticker 40",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.33 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "41",
        "name": "Sticker 41",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.34 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "42",
        "name": "Sticker 42",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.34 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "43",
        "name": "Sticker 43",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.35 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "44",
        "name": "Sticker 44",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.36 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "45",
        "name": "Sticker 45",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.37 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "46",
        "name": "Sticker 46",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.38 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "47",
        "name": "Sticker 47",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.39 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "48",
        "name": "Sticker 48",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.39 PM (2).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "49",
        "name": "Sticker 49",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.39 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "50",
        "name": "Sticker 50",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.40 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "51",
        "name": "Sticker 51",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.40 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "52",
        "name": "Sticker 52",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.41 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "53",
        "name": "Sticker 53",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.41 PM (2).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "54",
        "name": "Sticker 54",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.41 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "55",
        "name": "Sticker 55",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.42 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "56",
        "name": "Sticker 56",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.42 PM (2).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "57",
        "name": "Sticker 57",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.42 PM.jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "58",
        "name": "Sticker 58",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.43 PM (1).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "59",
        "name": "Sticker 59",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.43 PM (2).jpeg",
        "isPack": false,
        "soldOut": false
    },
    {
        "id": "60",
        "name": "Sticker 60",
        "category": "All",
        "price": 30,
        "imageUrl": "STICKERS/WhatsApp Image 2026-08-31 at 8.37.43 PM.jpeg",
        "isPack": false,
        "soldOut": false
    }
];

    const localData = JSON.parse(localStorage.getItem('sticker_catalog'));
    const sourceData = localData || mockData;
    
    const finalData = sourceData.map(s => {
        // Deterministic pseudo-random quantity based on ID for demo purposes
        // So some items will have qty <= 2 to trigger low stock warnings.
        const idNum = parseInt(s.id) || 1;
        const generatedQty = (idNum * 7) % 15 + 1; 
        
        return {
            ...s,
            quantity: s.quantity !== undefined ? s.quantity : generatedQty
        };
    });

    if (!localData) {
        localStorage.setItem('sticker_catalog', JSON.stringify(finalData));
    }
    return finalData;
}
