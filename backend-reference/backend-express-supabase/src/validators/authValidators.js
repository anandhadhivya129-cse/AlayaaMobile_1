import { z } from 'zod';
import { ROLES } from '../config/constants.js';

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    phone: z.string().min(8).optional(),
    role: z.enum([ROLES.CUSTOMER, ROLES.BROKER]).default(ROLES.CUSTOMER),
    reraNumber: z.string().optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
    role: z.enum([ROLES.ADMIN, ROLES.BROKER, ROLES.CUSTOMER]).optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email: z.string().email() }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const resetPasswordSchema = z.object({
  body: z.object({ password: z.string().min(8) }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});
