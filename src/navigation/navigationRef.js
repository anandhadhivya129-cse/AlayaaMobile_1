import { createNavigationContainerRef } from '@react-navigation/native';

// Lets code outside the navigator tree (e.g. the Supabase deep-link handler
// in AuthContext) trigger navigation directly — needed because passive
// linking-config URL matching doesn't reliably override an already-mounted
// navigator sitting on a different screen (e.g. an already-logged-in user
// on their dashboard when a password-recovery link is tapped).
export const navigationRef = createNavigationContainerRef();

// A deep link can arrive before the navigator has finished mounting (cold
// start racing the splash screen). Queue the request and flush it once
// the container reports ready, instead of silently dropping it.
let pending = null;

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    pending = { name, params };
  }
}

export function flushPendingNavigation() {
  if (pending && navigationRef.isReady()) {
    navigationRef.navigate(pending.name, pending.params);
    pending = null;
  }
}