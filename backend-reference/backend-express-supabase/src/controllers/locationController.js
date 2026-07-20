import { TAMIL_NADU_CITIES } from '../config/constants.js';
import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const tamilNaduCities = asyncHandler(async (_req, res) => {
  const { data } = await supabaseAdmin.from('locations').select('*').eq('state', 'Tamil Nadu').order('city');
  sendSuccess(res, data?.length ? data : TAMIL_NADU_CITIES.map((city) => ({ city, state: 'Tamil Nadu', active: true })));
});
