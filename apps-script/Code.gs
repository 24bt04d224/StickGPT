/**
 * StickerStore - Google Apps Script Backend
 * 
 * Setup Instructions:
 * 1. Go to script.google.com and create a new project.
 * 2. Paste this code into Code.gs.
 * 3. Create a Google Sheet. Name one tab "Orders" and another tab "Stickers".
 * 4. Create a folder in Google Drive for custom uploaded images.
 * 5. Replace SHEET_ID and DRIVE_FOLDER_ID below with your actual IDs.
 * 6. Deploy -> New Deployment -> Select "Web app". 
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Copy the resulting Web App URL and paste it into js/config.js.
 */

const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; 
const DRIVE_FOLDER_ID = 'YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE';

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getStickers') {
    return ContentService.createTextOutput(JSON.stringify(getStickers()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getOrders') {
    return ContentService.createTextOutput(JSON.stringify(getOrders()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({error: 'Invalid action'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'placeOrder') {
      return handlePlaceOrder(data);
    }
    
    if (action === 'updateOrderStatus') {
      return handleUpdateOrderStatus(data);
    }
    
    if (action === 'saveSticker') {
      return handleSaveSticker(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({error: 'Invalid action'}));
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}));
  }
}

function getStickers() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Stickers');
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const stickers = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    let sticker = {};
    for (let j = 0; j < headers.length; j++) {
      sticker[headers[j]] = row[j];
    }
    // ensure soldOut is boolean
    sticker.soldOut = sticker.soldOut === true || sticker.soldOut === 'true' || sticker.soldOut === 'TRUE';
    stickers.push(sticker);
  }
  return stickers;
}

function getOrders() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Orders');
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const orders = [];
  
  for (let i = data.length - 1; i >= 1; i--) { // Reverse order to get newest first
    const row = data[i];
    let order = {};
    for (let j = 0; j < headers.length; j++) {
      if (headers[j] === 'items') {
        try { order[headers[j]] = JSON.parse(row[j]); } catch(e) { order[headers[j]] = []; }
      } else {
        order[headers[j]] = row[j];
      }
    }
    orders.push(order);
  }
  return orders;
}

function handlePlaceOrder(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Orders');
  
  // Initialize headers if empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['orderId', 'timestamp', 'customerName', 'phone', 'email', 'address', 'notes', 'totalAmount', 'status', 'items']);
  }
  
  // Handle custom image uploads
  const processedItems = data.items.map(item => {
    if (item.type === 'custom' && item.imageUrl && item.imageUrl.startsWith('data:image')) {
      // Upload to Drive
      try {
        const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
        const split = item.imageUrl.split(',');
        const contentType = split[0].match(/:(.*?);/)[1];
        const blob = Utilities.newBlob(Utilities.base64Decode(split[1]), contentType, `custom_${Date.now()}`);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        item.imageUrl = file.getUrl();
      } catch(e) {
        item.imageUrl = 'Upload failed: ' + e.toString();
      }
    }
    return item;
  });

  sheet.appendRow([
    data.orderId,
    data.timestamp,
    data.customerName,
    data.phone,
    data.email,
    data.address,
    data.notes,
    data.totalAmount,
    'New', // Default status
    JSON.stringify(processedItems)
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({success: true}));
}

function handleUpdateOrderStatus(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Orders');
  const d = sheet.getDataRange().getValues();
  const orderIdIdx = d[0].indexOf('orderId');
  const statusIdx = d[0].indexOf('status');
  
  for (let i = 1; i < d.length; i++) {
    if (d[i][orderIdIdx] === data.orderId) {
      sheet.getRange(i + 1, statusIdx + 1).setValue(data.status);
      return ContentService.createTextOutput(JSON.stringify({success: true}));
    }
  }
  return ContentService.createTextOutput(JSON.stringify({success: false, error: 'Order not found'}));
}

function handleSaveSticker(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Stickers');
  
  // Initialize headers if empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id', 'name', 'category', 'price', 'imageUrl', 'soldOut']);
  }
  
  const d = sheet.getDataRange().getValues();
  const idIdx = d[0].indexOf('id');
  
  let found = false;
  for (let i = 1; i < d.length; i++) {
    if (d[i][idIdx] === data.id) {
      // Update
      const headers = d[0];
      for (let j = 0; j < headers.length; j++) {
        sheet.getRange(i + 1, j + 1).setValue(data[headers[j]]);
      }
      found = true;
      break;
    }
  }
  
  if (!found) {
    // Add new
    const headers = d[0];
    const newRow = headers.map(h => data[h] !== undefined ? data[h] : '');
    sheet.appendRow(newRow);
  }
  
  return ContentService.createTextOutput(JSON.stringify({success: true}));
}
