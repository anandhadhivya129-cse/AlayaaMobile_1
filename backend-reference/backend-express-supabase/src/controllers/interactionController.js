import { supabaseAdmin } from '../config/supabase.js';
import { sendCreated, sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { toFrontendProperty } from '../utils/frontendProperty.js';
import { sendNotification } from '../services/notificationService.js';

export const compare = asyncHandler(async (req, res) => {
  const { propertyIds } = req.validated.body;
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('*, property_images(*), nearby_amenities(*)')
    .in('id', propertyIds);
  if (error) throw error;

  await supabaseAdmin.rpc('track_property_comparisons', { property_ids_input: propertyIds });
  sendSuccess(res, data.map(toFrontendProperty));
});

export const createInquiry = asyncHandler(async (req, res) => {
  const { propertyId, type, name, email, phone, message } = req.validated.body;
  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .insert({
      property_id: propertyId,
      user_id: req.user?.id || null,
      type,
      name,
      email,
      phone,
      message,
      status: 'new'
    })
    .select('*')
    .single();
  if (error) throw error;

  await supabaseAdmin.rpc('increment_property_metric', { property_id_input: propertyId, metric_name: 'inquiries_count' });
  await sendNotification({ subject: 'New property inquiry', template: 'property-inquiry', payload: data });
  sendCreated(res, data, 'Inquiry sent');
});

export const createVisit = asyncHandler(async (req, res) => {
  const { propertyId, visitType, scheduledAt, notes } = req.validated.body;
  const { data, error } = await supabaseAdmin
    .from('visit_bookings')
    .insert({
      property_id: propertyId,
      user_id: req.user.id,
      visit_type: visitType,
      scheduled_at: scheduledAt,
      notes,
      status: 'pending'
    })
    .select('*')
    .single();
  if (error) throw error;

  await sendNotification({ subject: 'New visit booking', template: 'visit-booking', payload: data });
  sendCreated(res, data, 'Visit booked');
});

export const listMyVisits = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('visit_bookings')
    .select('*, properties(title, city, address)')
    .eq('user_id', req.user.id)
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  sendSuccess(res, data);
});

export const listAmenities = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('nearby_amenities')
    .select('*')
    .eq('property_id', req.params.id)
    .order('distance_km', { ascending: true });
  if (error) throw error;
  sendSuccess(res, data);
});
