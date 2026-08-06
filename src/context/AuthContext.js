import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as Linking from 'expo-linking';
import {
  forgotPassword as apiForgotPassword,
  getSessionUser,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  resetPassword as apiResetPassword,
  updateProfile as apiUpdateProfile,
  uploadProfilePicture as apiUploadProfilePicture,
} from '../services/api';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

function applyUserProfile(authUser, profile) {
  if (!authUser) return null;
  return {
    id: authUser.id,
    email: authUser.email || profile?.email || '',
    profile: profile || {
      id: authUser.id,
      full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
      email: authUser.email || '',
      phone: authUser.user_metadata?.phone || '',
      role: authUser.user_metadata?.role || 'customer',
      profile_picture: authUser.user_metadata?.profile_picture || '',
      city: authUser.user_metadata?.city || '',
      bio: authUser.user_metadata?.bio || '',
      brokerApproval: null,
    },
  };
}

// Pulls access_token / refresh_token out of a Supabase deep-link redirect,
// e.g. alayaa://login#access_token=...&refresh_token=...
// Handles both a leading "#" fragment and a leading "?" query, since
// different Supabase flows (confirm signup vs magic link) can format it either way.
function parseTokensFromUrl(url) {
  if (!url) return null;
  const fragment = url.split('#')[1];
  const query = url.split('?')[1];
  const paramsString = fragment || query;
  if (!paramsString) return null;

  const params = new URLSearchParams(paramsString);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (access_token && refresh_token) {
    return { access_token, refresh_token };
  }
  return null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bootstrapped, setBootstrapped] = useState(false);

  async function hydrate(nextSessionUser) {
    if (!nextSessionUser) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const currentUser = await getSessionUser();
      const resolved = currentUser || applyUserProfile(nextSessionUser, null);
      setUser(resolved);
      return resolved;
    } catch (error) {
      console.error('Failed to hydrate session user', error);
      const fallback = applyUserProfile(nextSessionUser, null);
      setUser(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        setSession(data.session || null);
        if (data.session?.user) {
          await hydrate(data.session.user);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Session bootstrap failed', error);
        if (active) setLoading(false);
      } finally {
        if (active) setBootstrapped(true);
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) return;
      setSession(nextSession || null);
      if (nextSession?.user) {
        setLoading(true);
        await hydrate(nextSession.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Handles the alayaa://login (or alayaa://auth/callback) link that Supabase
  // sends in confirmation / password-reset emails. When tapped, it hands the
  // access_token + refresh_token to supabase.auth.setSession(), which then
  // fires onAuthStateChange above and hydrates the user automatically.
  useEffect(() => {
    const handleDeepLink = async (event) => {
      const url = typeof event === 'string' ? event : event?.url;
      const tokens = parseTokensFromUrl(url);
      if (!tokens) return;

      try {
        const { error } = await supabase.auth.setSession(tokens);
        if (error) throw error;
      } catch (error) {
        console.error('Failed to set session from deep link', error);
      }
    };

    // App opened cold, directly from the email link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // App already running in background, link brings it to foreground
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => subscription.remove();
  }, []);

  const login = async (payload) => {
    const result = await apiLogin(payload);
    setSession(result.session || null);
    setUser(result.user || null);
    return result;
  };

  const register = async (payload) => apiRegister(payload);

  const logout = async () => {
    await apiLogout();
    setSession(null);
    setUser(null);
  };

  const forgotPassword = async (email) => apiForgotPassword(email);
  const resetPassword = async (password) => apiResetPassword(password);

  const updateProfile = async (updates) => {
    if (!user?.id) throw new Error('You must be signed in to update your profile.');
    const updated = await apiUpdateProfile(user.id, updates);
    setUser((current) => (current ? { ...current, profile: updated } : current));
    return updated;
  };

  const uploadProfilePicture = async (asset) => {
    if (!user?.id) throw new Error('You must be signed in to upload a profile picture.');
    const publicUrl = await apiUploadProfilePicture(asset, user.id);
    return updateProfile({ profile_picture: publicUrl });
  };

  const refreshUser = async () => {
    const fresh = await getSessionUser();
    setUser(fresh);
    return fresh;
  };

  const value = useMemo(
    () => ({
      session,
      user,
      loading: loading || !bootstrapped,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile,
      uploadProfilePicture,
      refreshUser,
    }),
    [session, user, loading, bootstrapped]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}