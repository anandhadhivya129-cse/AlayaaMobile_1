import { supabaseAdmin } from '../config/supabase.js';
import { PROPERTY_STATUS } from '../config/constants.js';
import { toFrontendProperty } from '../utils/frontendProperty.js';
import { uploadPropertyImages } from './storageService.js';

const propertySelect = `
  *,
  property_images(*),
  nearby_amenities(*),
  profiles!properties_broker_id_fkey(id, full_name, email, phone, role)
`;

export const listProperties = async (query = {}) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 12), 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let request = supabaseAdmin
    .from('properties')
    .select(propertySelect, { count: 'exact' })
    .range(from, to);

  if (!query.includeInactive) request = request.eq('status', PROPERTY_STATUS.ACTIVE);
  if (query.city) request = request.ilike('city', query.city);
  if (query.locality) request = request.ilike('locality', `%${query.locality}%`);
  if (query.district) request = request.ilike('district', `%${query.district}%`);
  if (query.propertyType) request = request.eq('property_type', query.propertyType);
  if (query.listingType) request = request.eq('listing_type', query.listingType);
  if (query.bhk) request = request.eq('bhk', Number(query.bhk));
  if (query.featured != null) request = request.eq('featured', String(query.featured) === 'true' || query.featured === true);
  if (query.minPrice) request = request.gte('price', Number(query.minPrice));
  if (query.maxPrice) request = request.lte('price', Number(query.maxPrice));
  if (query.amenities) request = request.contains('amenities', String(query.amenities).split(','));
  if (query.keyword) {
    request = request.or(`title.ilike.%${query.keyword}%,description.ilike.%${query.keyword}%,address.ilike.%${query.keyword}%`);
  }

  const sort = query.sort || 'newest';
  if (sort === 'price_low') request = request.order('price', { ascending: true });
  else if (sort === 'price_high') request = request.order('price', { ascending: false });
  else if (sort === 'featured') request = request.order('featured', { ascending: false }).order('created_at', { ascending: false });
  else if (sort === 'most_viewed') request = request.order('views_count', { ascending: false });
  else request = request.order('created_at', { ascending: false });

  const { data, error, count } = await request;
  if (error) throw error;

  return {
    properties: data.map(toFrontendProperty),
    pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) }
  };
};

export const getPropertyById = async (id, viewerId = null) => {
  const { data, error } = await supabaseAdmin.from('properties').select(propertySelect).eq('id', id).single();
  if (error) throw error;

  await supabaseAdmin.rpc('increment_property_metric', { property_id_input: id, metric_name: 'views_count' });
  if (viewerId) {
    await supabaseAdmin.from('recently_viewed').upsert({ user_id: viewerId, property_id: id, viewed_at: new Date().toISOString() });
  }

  return toFrontendProperty(data);
};

export const createProperty = async ({ payload, ownerId, files }) => {
  const { data, error } = await supabaseAdmin
    .from('properties')
    .insert({ ...payload, broker_id: ownerId, status: payload.status || PROPERTY_STATUS.PENDING })
    .select('*')
    .single();
  if (error) throw error;

  const images = await uploadPropertyImages(data.id, files);
  if (images.length) {
    const rows = images.map((image, index) => ({ property_id: data.id, ...image, sort_order: index }));
    const { error: imageError } = await supabaseAdmin.from('property_images').insert(rows);
    if (imageError) throw imageError;
  }

  return getPropertyById(data.id);
};

export const updateProperty = async (id, payload) => {
  const { data, error } = await supabaseAdmin
    .from('properties')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return getPropertyById(data.id);
};

export const deleteProperty = async (id) => {
  const { error } = await supabaseAdmin.from('properties').delete().eq('id', id);
  if (error) throw error;
};

export const getMapMarkers = async (query = {}) => {
  const { properties } = await listProperties({ ...query, limit: query.limit || 500 });
  return properties
    .filter((property) => property.latitude && property.longitude)
    .map((property) => ({
      id: property.id,
      title: property.title,
      price: property.price,
      city: property.city,
      latitude: property.latitude,
      longitude: property.longitude,
      img: property.img,
      viewOnMapUrl: property.viewOnMapUrl,
      directionsUrl: property.directionsUrl
    }));
};
