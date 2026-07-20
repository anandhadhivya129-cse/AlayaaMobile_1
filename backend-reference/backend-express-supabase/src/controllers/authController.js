import { supabase, supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../middleware/errorHandler.js';


export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, role, reraNumber } = req.validated.body;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone, role }
    }
  });
  console.log('SIGNUP DATA:', data);
  console.log('SIGNUP ERROR:', error);
  if (error) throw error;

  sendCreated(res, { id: data.user.id, email, role }, 'Registration successful, please check your email to confirm your account');
});
export const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.validated.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new ApiError(401, 'Invalid email or password');

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
  if (profileError || !profile) throw new ApiError(403, 'Profile not found');
  console.log("LOGIN REQUEST ROLE:", role);
console.log("PROFILE ROLE:", profile.role);
console.log("PROFILE:", profile);
  if (role && profile.role !== role) throw new ApiError(403, `This account is not a ${role}`);

  sendSuccess(res, {
    user: { id: data.user.id, email: data.user.email, profile },
    session: data.session
  }, 'Login successful');
});

export const logout = asyncHandler(async (req, res) => {
  const { error } = await supabaseAdmin.auth.admin.signOut(req.authToken);
  if (error) throw error;
  sendSuccess(res, null, 'Logged out');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.validated.body;
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  sendSuccess(res, null, 'Password reset email sent');
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.validated.body;
  const { error } = await supabaseAdmin.auth.admin.updateUserById(req.user.id, { password });
  if (error) throw error;
  sendSuccess(res, null, 'Password updated');
});

export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, req.user.profile);
});
