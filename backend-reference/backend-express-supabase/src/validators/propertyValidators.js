import { z } from 'zod';

const propertyBody = z.object({
  title: z.string().min(3),
  description: z.string().min(10).optional(),
  propertyType: z.string().optional(),
  property_type: z.string().optional(),
  listingType: z.string().optional(),
  listing_type: z.string().optional(),
  price: z.coerce.number().nonnegative(),
  area: z.string().or(z.coerce.number()).optional(),
  bhk: z.coerce.number().int().optional(),
  bathrooms: z.coerce.number().int().optional(),
  parking: z.coerce.number().int().optional(),
  furnished: z.string().optional(),
  city: z.string().min(2),
  locality: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  featured: z.coerce.boolean().optional(),
  verified: z.coerce.boolean().optional(),
  status: z.string().optional(),
  amenities: z.array(z.string()).or(z.string()).optional()
});

export const createPropertySchema = z.object({
  body: propertyBody.transform(({ propertyType, listingType, ...body }) => ({
    ...body,
    property_type: body.property_type || propertyType,
    listing_type: body.listing_type || listingType,
    amenities: typeof body.amenities === 'string' ? body.amenities.split(',').map((item) => item.trim()) : body.amenities
  })),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const updatePropertySchema = z.object({
  body: propertyBody.partial().transform(({ propertyType, listingType, ...body }) => ({
    ...body,
    property_type: body.property_type || propertyType,
    listing_type: body.listing_type || listingType,
    amenities: typeof body.amenities === 'string' ? body.amenities.split(',').map((item) => item.trim()) : body.amenities
  })),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() })
});

export const propertyIdSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() })
});
