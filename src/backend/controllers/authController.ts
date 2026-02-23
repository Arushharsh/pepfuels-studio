import { redis, prisma } from '../../../server';
import { generateAccessToken, generateRefreshToken } from '../utils/tokens';
import { Request, Response } from 'express';
import { z } from 'zod';

const loginSchema = z.object({
  phone: z.string().min(10).max(15),
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  otp: z.string().length(6),
});

export const requestOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = loginSchema.parse(req.body);
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in Redis with expiry
    await redis.set(`otp:${phone}`, otp, 'EX', parseInt(process.env.OTP_EXPIRY_SECONDS || '300'));
    
    // In production, send via SMS gateway
    console.log(`[OTP for ${phone}]: ${otp}`);
    
    return res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error("Request OTP Error:", error);
    return res.status(400).json({ error: 'Invalid request' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = verifyOtpSchema.parse(req.body);
    
    const storedOtp = await redis.get(`otp:${phone}`);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
    
    // Clear OTP
    await redis.del(`otp:${phone}`);
    
    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name: 'New User',
          role: 'MAIN_USER',
        }
      });
    }
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });
    
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    // Yahan aayega aapka asli error Render ke logs mein!
    console.error("MERA ASLI ERROR YE HAI:", error); 
    
    return res.status(400).json({ error: 'Invalid request' });
  }
};
