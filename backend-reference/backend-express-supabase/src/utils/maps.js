export const buildDirectionsUrl = (latitude, longitude) => {
  if (latitude == null || longitude == null) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
};

export const buildViewOnMapUrl = (latitude, longitude) => {
  if (latitude == null || longitude == null) return null;
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
};
