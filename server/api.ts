import express, { Request, Response } from 'express';
import { globalGraph } from '../indexer/graph';

const app = express();
const port = 3000;

app.use(express.json());

/**
 * Record a new connection
 */
app.post('/api/connections', (req: Request, res: Response) => {
    const { walletA, walletB, timestamp, latitude, longitude, signature } = req.body;

    if (!walletA || !walletB) {
        return res.status(400).json({ error: 'Incomplete connection data' });
    }

    globalGraph.addConnection(walletA, walletB, { timestamp, latitude, longitude, signature });

    console.log('[VIBE API] Connection recorded:', walletA, '<->', walletB);
    res.status(201).json({ success: true });
});

app.get('/api/connections/:wallet', (req: Request, res: Response) => {
    const { wallet } = req.params;
    const connections = globalGraph.getConnections(wallet);
    res.json({
        wallet,
        connections,
        count: connections.length,
        status: 'Social Graph Sync Active'
    });
});

app.get('/api/stats', (req: Request, res: Response) => {
    res.json(globalGraph.getGlobalStats());
});

app.get('/api/separation/:walletA/:walletB', (req: Request, res: Response) => {
    const { walletA, walletB } = req.params;
    const distance = globalGraph.getDegreesOfSeparation(walletA, walletB);
    res.json({ walletA, walletB, degrees: distance });
});

app.get('/api/heatmap', (req: Request, res: Response) => {
    res.json({ dots: globalGraph.getHeatmapData() });
});

app.listen(port, () => {
    console.log(`VIBE API listening at http://localhost:${port}`);
});
