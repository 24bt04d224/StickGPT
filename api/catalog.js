const clientPromise = require('./mongodb');

export default async function handler(req, res) {
    if (!process.env.MONGODB_URI) {
        return res.status(500).json({ error: 'Database connection string is missing' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('stickgpt');
        const catalogCollection = db.collection('catalog');

        switch (req.method) {
            case 'GET':
                // Fetch catalog
                const catalog = await catalogCollection.find({}).toArray();
                res.status(200).json(catalog);
                break;
            case 'POST':
                // Update catalog (Bulk replace or single updates depending on the request)
                // For simplicity given the frontend logic, if an array is passed, we replace everything
                // Or if it's a single sticker, we upsert it.
                if (req.body && req.body.action === 'saveSticker') {
                    // Update single sticker
                    const { action, _id, ...stickerData } = req.body;
                    await catalogCollection.updateOne(
                        { id: stickerData.id },
                        { $set: stickerData },
                        { upsert: true }
                    );
                    res.status(200).json({ success: true });
                } else if (req.body && req.body.action === 'updateCatalog') {
                    // Bulk update
                    const { catalog } = req.body;
                    
                    // The safest way is to delete all and insert many, or loop and upsert
                    // Looping is safer to preserve other fields
                    const bulkOps = catalog.map(item => {
                        const { _id, ...rest } = item;
                        return {
                            updateOne: {
                                filter: { id: rest.id },
                                update: { $set: rest },
                                upsert: true
                            }
                        };
                    });
                    if(bulkOps.length > 0) {
                        await catalogCollection.bulkWrite(bulkOps);
                    }
                    res.status(200).json({ success: true });
                } else {
                    res.status(400).json({ error: 'Invalid action' });
                }
                break;
            case 'DELETE':
                // Delete one or multiple stickers
                const { ids } = req.query; // Comma-separated string of IDs
                if (!ids) {
                    return res.status(400).json({ error: 'IDs are required to delete' });
                }
                const idArray = ids.split(',');
                await catalogCollection.deleteMany({ id: { $in: idArray } });
                res.status(200).json({ success: true });
                break;
            default:
                res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
}
