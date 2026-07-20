import { z } from 'zod';

export const inquirySchema = z.object({
  body: z.object({
    propertyId: z.string().uuid(),
    type: z.enum(['callback', 'inquiry', 'contact_broker', 'chat']).default('inquiry'),
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(8).optional(),
    message: z.string().optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const visitSchema = z.object({
  body: z.object({
    propertyId: z.string().uuid(),
    visitType: z.enum(['property_viewing', 'site_visit', 'broker_meeting']).default('property_viewing'),
    scheduledAt: z.string().datetime(),
    notes: z.string().optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const compareSchema = z.object({
  body: z.object({ propertyIds: z.array(z.string().uuid()).min(2).max(5) }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});
