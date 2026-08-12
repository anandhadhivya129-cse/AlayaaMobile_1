import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { toFrontendProperty } from '../utils/frontendProperty.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', req.user.id)
    .select('*')
    .single();
  if (error) throw error;
  sendSuccess(res, data, 'Profile updated');
});

export const saveProperty = asyncHandler(async (req, res) => {
  const { error } = await supabaseAdmin.from('wishlist').upsert({ user_id: req.user.id, property_id: req.params.id });
  if (error) throw error;
  await supabaseAdmin.rpc('increment_property_metric', { property_id_input: req.params.id, metric_name: 'favorites_count' });
  sendSuccess(res, null, 'Property saved');
});

export const removeSavedProperty = asyncHandler(async (req, res) => {
  const { error } = await supabaseAdmin.from('wishlist').delete().eq('user_id', req.user.id).eq('property_id', req.params.id);
  if (error) throw error;
  sendSuccess(res, null, 'Property removed from wishlist');
});

export const wishlist = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('wishlist')
    .select('properties(*, property_images(*))')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  sendSuccess(res, data.map((row) => toFrontendProperty(row.properties)));
});

export const recentlyViewed = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('recently_viewed')
    .select('viewed_at, properties(*, property_images(*))')
    .eq('user_id', req.user.id)
    .order('viewed_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  sendSuccess(res, data.map((row) => ({ viewedAt: row.viewed_at, property: toFrontendProperty(row.properties) })));
});

export const recommendations = asyncHandler(async (req, res) => {
  const { data: viewed } = await supabaseAdmin
    .from('recently_viewed')
    .select('properties(city, property_type)')
    .eq('user_id', req.user.id)
    .limit(5);

  const city = viewed?.[0]?.properties?.city;
  let query = supabaseAdmin.from('properties').select('*, property_images(*)').eq('status', 'active').limit(12);
  if (city) query = query.eq('city', city);

  const { data, error } = await query;
  if (error) throw error;
  sendSuccess(res, data.map(toFrontendProperty));
});

export const customerDashboard = asyncHandler(async (req, res) => {
  const [{ count: saved }, { count: viewed }, { count: inquiries }, { count: visits }] = await Promise.all([
    supabaseAdmin.from('wishlist').select('*', { count: 'exact', head: true }).eq('user_id', req.user.id),
    supabaseAdmin.from('recently_viewed').select('*', { count: 'exact', head: true }).eq('user_id', req.user.id),
    supabaseAdmin.from('inquiries').select('*', { count: 'exact', head: true }).eq('user_id', req.user.id),
    supabaseAdmin.from('visit_bookings').select('*', { count: 'exact', head: true }).eq('user_id', req.user.id)
  ]);

  sendSuccess(res, { saved, viewed, inquiries, visits });
});
