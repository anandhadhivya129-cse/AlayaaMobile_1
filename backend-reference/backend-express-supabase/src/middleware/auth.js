import { supabase, supabaseAdmin } from '../config/supabase.js';
import { ApiError } from './errorHandler.js';

export const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new ApiError(401, 'Missing bearer token');

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) throw new ApiError(401, 'Invalid or expired token');

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) throw new ApiError(403, 'User profile not found');

    req.authToken = token;
    req.user = { ...data.user, profile, role: profile.role };
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new ApiError(401, 'Authentication required'));
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to access this resource'));
  }
  next();
};
