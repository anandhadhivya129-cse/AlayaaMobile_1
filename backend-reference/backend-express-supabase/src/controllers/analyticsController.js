import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const trackClick = asyncHandler(async (req, res) => {
  await supabaseAdmin.rpc('increment_property_metric', {
    property_id_input: req.params.id,
    metric_name: 'clicks_count'
  });
  sendSuccess(res, null, 'Click tracked');
});

export const propertyAnalytics = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('id,title,views_count,clicks_count,favorites_count,comparisons_count,inquiries_count')
    .eq('id', req.params.id)
    .single();
  if (error) throw error;
  sendSuccess(res, data);
});
