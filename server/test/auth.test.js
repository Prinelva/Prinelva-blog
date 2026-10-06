import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import {auth} from '../src/utils/auth.js';

const secret = 'test-only-secret-with-enough-length';

function response() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
}

test('auth rejects requests without a bearer token', () => {
    const res = response();
    let nextCalled = false;

    auth({headers: {}}, res, () => {
        nextCalled = true;
    });

    assert.equal(res.statusCode, 401);
    assert.equal(res.body.message, 'Authentication required');
    assert.equal(nextCalled, false);
});

test('auth rejects invalid and expired bearer tokens', () => {
    process.env.JWT_SECRET = secret;
    const expired = jwt.sign({id: 'user-id'}, secret, {expiresIn: -1});

    for (const token of ['not-a-token', expired]) {
        const res = response();
        let nextCalled = false;
        auth({headers: {authorization: `Bearer ${token}`}}, res, () => {
            nextCalled = true;
        });

        assert.equal(res.statusCode, 401);
        assert.equal(res.body.message, 'Invalid or expired token');
        assert.equal(nextCalled, false);
    }
});

test('auth verifies bearer tokens and attaches the verified claims', () => {
    process.env.JWT_SECRET = secret;
    const claims = {id: 'user-id', role: 'admin'};
    const token = jwt.sign(claims, secret, {expiresIn: '1m'});
    const req = {headers: {authorization: `Bearer ${token}`}};
    let nextCalled = false;

    auth(req, response(), () => {
        nextCalled = true;
    });

    assert.equal(nextCalled, true);
    assert.equal(req.user.id, claims.id);
    assert.equal(req.user.role, claims.role);
    assert.equal(typeof req.user.exp, 'number');
    assert.equal(typeof req.user.iat, 'number');
});
