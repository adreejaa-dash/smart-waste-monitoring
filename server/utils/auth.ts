import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User } from '@shared/schema';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: User): string => {
  const payload = {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '24h',
  });
};

export const calculateRewardPoints = (wasteType: string): number => {
  const pointsMap: Record<string, number> = {
    plastic: 10,
    organic: 5,
    recyclable: 8,
    hazardous: 20,
  };
  
  return pointsMap[wasteType] || 5;
};

export const calculateRewardLevel = (totalPoints: number): string => {
  if (totalPoints >= 1000) return 'Platinum';
  if (totalPoints >= 500) return 'Gold';
  if (totalPoints >= 200) return 'Silver';
  return 'Bronze';
};