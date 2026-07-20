import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const brokerDashboard = asyncHandler(async (req, res) => {
  const [properties, inquiries, visits, leads] = await Promise.all([
    supabaseAdmin.from('properties').select('*', { count: 'exact', head: true }).eq('broker_id', req.user.id),
    supabaseAdmin.from('inquiries').select('properties!inner(broker_id)', { count: 'exact', head: true }).eq('properties.broker_id', req.user.id),
    supabaseAdmin.from('visit_bookings').select('properties!inner(broker_id)', { count: 'exact', head: true }).eq('properties.broker_id', req.user.id),
    supabaseAdmin.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new')
  ]);

  const { data: myProperties, error } = await supabaseAdmin
    .from('properties')
    .select('id,title,status,views_count,inquiries_count,favorites_count,created_at')
    .eq('broker_id', req.user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;

  sendSuccess(res, {
    totals: {
      properties: properties.count || 0,
      inquiries: inquiries.count || 0,
      visits: visits.count || 0,
      leads: leads.count || 0
    },
    myProperties
  });
});

export const adminDashboard = asyncHandler(async (_req, res) => {
  const [totalProperties, totalUsers, pendingApprovals, activeListings, featuredListings, recentRegistrations] = await Promise.all([
    supabaseAdmin.from('properties').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('properties').select('*', { count: 'exact', head: true }).eq('featured', true),
    supabaseAdmin.from('profiles').select('id,full_name,email,role,created_at').order('created_at', { ascending: false }).limit(10)
  ]);

  const { data: topCities } = await supabaseAdmin.rpc('top_property_cities');

  sendSuccess(res, {
    totalProperties: totalProperties.count || 0,
    totalUsers: totalUsers.count || 0,
    pendingApprovals: pendingApprovals.count || 0,
    activeListings: activeListings.count || 0,
    featuredListings: featuredListings.count || 0,
    topCities: topCities || [],
    recentRegistrations: recentRegistrations.data || [],
    revenueAnalytics: { ready: true, provider: 'future_payment_integration' }
  });
});

export const updateVisitStatus = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('visit_bookings')
    .update({ status: req.body.status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('*')
    .single();
  if (error) throw error;
  sendSuccess(res, data, 'Visit status updated');
});
