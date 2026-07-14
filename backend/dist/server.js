import { connectDB } from './config/db.js';
import app from './app.js';
import { env } from './config/env.js';
connectDB();
const port = env.PORT;
const server = app.listen(port, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${port}`);
});
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    process.exit(1);
});
process.on('unhandledRejection', (err) => {
    console.error('❌ UNHANDLED REJECTION! Shutting down...');
    console.error(err?.name || 'Error', err?.message || err);
    server.close(() => {
        process.exit(1);
    });
});
