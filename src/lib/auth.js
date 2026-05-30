import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const SALT_ROUNDS = 12;

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

export async function hashPassword(password) {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
  if (!password || !hash) {
    return false;
  }
  return bcrypt.compare(password, hash);
}

export async function getAuthUser(request) {
  try {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    const token = parts[1];

    if (!token || token === 'undefined' || token === 'null') {
      return null;
    }

    const payload = verifyToken(token);
    return payload;
  } catch (error) {
    console.error('Auth error:', error.message);
    return null;
  }
}
