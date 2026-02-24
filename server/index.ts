import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './db/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import taskRoutes from './routes/tasks.js';
import { startReminderJob } from './jobs/reminderJob.js';


dotenv.config({ path: path.join(process.cwd(), '.env') });

console.log('MONGODB_URI loaded:', process.env.MONGODB_URI ? '✅ yes' : '❌ missing');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found.' });
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ TaskFlow API running at http://localhost:${PORT}`);
        startReminderJob();
    });
});

export default app;
