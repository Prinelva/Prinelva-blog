import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {connectDB} from './config/db.js';
import {ensureDefaultCategories} from './config/defaultCategories.js';
import routes from './routes/index.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './models/User.js';
import {submissionLimiter} from './middleware/rateLimit.js';

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY) {
    const trustProxy = Number(process.env.TRUST_PROXY);
    if (!Number.isInteger(trustProxy) || trustProxy < 1) {
        throw new Error('TRUST_PROXY must be a positive integer when configured');
    }
    app.set('trust proxy', trustProxy);
}

if (process.env.NODE_ENV === 'production') {
    const required = ['JWT_SECRET', 'CLIENT_URL', 'API_PUBLIC_URL'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length) {
        throw new Error(`Missing required production configuration: ${missing.join(', ')}`);
    }
    if (!process.env.MONGO_URI && !process.env.MONGO_URL) {
        throw new Error('Missing required production configuration: set MONGO_URI or MONGO_URL');
    }
    if (process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET === 'replace_with_a_long_random_secret') {
        throw new Error('JWT_SECRET must be a unique random value of at least 32 characters in production');
    }
}

const configuredOrigins = (process.env.CLIENT_URL || '').split(',').map((origin) => origin.trim()).filter(Boolean);
const allowedOrigins = new Set(process.env.NODE_ENV === 'production'
    ? configuredOrigins
    : [...configuredOrigins, 'http://localhost:5173', 'http://127.0.0.1:5173',
        'http://localhost:5174', 'http://127.0.0.1:5174',
        'http://localhost:5177', 'http://127.0.0.1:5177']);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            callback(null, true);
            return;
        }

        const error = new Error('Not allowed by CORS');
        error.status = 403;
        callback(error);
    },
    credentials: true,
}));

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (process.env.NODE_ENV === 'production' && req.secure) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});

app.use(express.json({ limit: '2mb' }));
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', routes);
app.use('/api', (req, res) => res.status(404).json({ message: 'API endpoint not found' }));
app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600
        ? err.status
        : 500;
    const message = status < 500
        ? err.message
        : process.env.NODE_ENV === 'production' ? 'Server error' : err.message || 'Server error';
    res.status(status).json({ message });
});

connectDB()
    .then(async () => {
        await ensureDefaultCategories();

        if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
            const exists = await User.findOne({ email: process.env.ADMIN_EMAIL });
            if (!exists) {
                await User.create({
                    name: 'Administrator',
                    email: process.env.ADMIN_EMAIL,
                    password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
                    role: 'admin',
                });
            }
        }

        const port = process.env.PORT || 5000;
        const server = app.listen(port, () => console.log(`API running on ${port}`));
        let shuttingDown = false;
        const shutdown = (signal) => {
            if (shuttingDown) return;
            shuttingDown = true;
            console.log(`${signal} received; closing API server`);
            server.close(async (error) => {
                if (error) {
                    console.error('Failed to close API server cleanly', error);
                    process.exitCode = 1;
                }
                try {
                    await mongoose.disconnect();
                } catch (disconnectError) {
                    console.error('Failed to disconnect from MongoDB cleanly', disconnectError);
                    process.exitCode = 1;
                }
            });
        };
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
