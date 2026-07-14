import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './errors/appError.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors({
    origin: '*',
    credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));
// 2) API Routes
app.use('/api/v1', apiRouter);
// 3) Serve frontend static assets if the build folder exists on disk
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    // Serve index.html for all non-API paths (SPA fallback routing)
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}
// 4) Fallback Route Handler (404)
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// 5) Global Error Middleware
app.use(errorHandler);
export default app;
