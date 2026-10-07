import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const HEALTH_CHECK_PATHS = new Set(['/api/health', '/health', '/healthz']);

const getClientIp = (req) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    const header = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    const forwardedIp = typeof header === 'string' ? header.split(',')[0].trim() : '';
    return ipKeyGenerator(forwardedIp || req.ip || req.socket?.remoteAddress || 'unknown');
};

const skipHealthChecks = (req) => {
    const path = (req.originalUrl || req.url || '').split('?')[0];
    return HEALTH_CHECK_PATHS.has(path);
};

const baseOptions = {
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    keyGenerator: getClientIp,
    skip: skipHealthChecks,
    // The client IP is resolved explicitly from X-Forwarded-For above, so the
    // trust proxy validation is not needed when running behind Railway's proxy.
    validate: { xForwardedForHeader: false, trustProxy: false },
};

export const authLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { message: 'Too many authentication attempts. Please try again in 15 minutes.' },
});

export const submissionLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 30,
    message: { message: 'Too many requests. Please try again later.' },
});
