const clientPromise = require('./mongodb');

export default async function handler(req, res) {
    if (!process.env.MONGODB_URI) {
        return res.status(500).json({ error: 'Database connection string is missing' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('stickgpt');
        const ordersCollection = db.collection('orders');

        switch (req.method) {
            case 'GET':
                // Fetch all orders
                const orders = await ordersCollection.find({}).sort({ timestamp: -1 }).toArray();
                res.status(200).json(orders);
                break;
            case 'POST':
                // Create a new order
                const newOrder = req.body;
                if (!newOrder.orderId) {
                    return res.status(400).json({ error: 'Order ID is required' });
                }
                const result = await ordersCollection.insertOne(newOrder);
                res.status(201).json({ success: true, result });
                break;
            case 'PUT':
            case 'PATCH':
                // Update order status
                const { orderId, status } = req.body;
                if (!orderId || !status) {
                    return res.status(400).json({ error: 'Order ID and status are required' });
                }
                await ordersCollection.updateOne(
                    { orderId: orderId },
                    { $set: { status: status } }
                );
                res.status(200).json({ success: true });
                break;
            case 'DELETE':
                // Delete an order
                const { id } = req.query; // e.g. /api/orders?id=ORD-123
                if (!id) {
                    return res.status(400).json({ error: 'Order ID is required to delete' });
                }
                await ordersCollection.deleteOne({ orderId: id });
                res.status(200).json({ success: true });
                break;
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
}
