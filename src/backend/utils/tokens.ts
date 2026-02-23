import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export const generateAccessToken = (user: { id: string; role: Role; phone: string }) => {
  const secret = process.env.JWT_ACCESS_SECRET || 'default_access_secret';
  return jwt.sign(
    { id: user.id, role: user.role, phone: user.phone },
    secret,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user: { id: string }) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';
  return jwt.sign(
    { id: user.id },
    secret,
    { expiresIn: '7d' }
  );
};
