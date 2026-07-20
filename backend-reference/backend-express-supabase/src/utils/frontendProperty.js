import { buildDirectionsUrl, buildViewOnMapUrl } from './maps.js';

export const toFrontendProperty = (property) => {
  const firstImage = property.property_images?.[0]?.url || property.images?.[0]?.url || property.image_url || null;
  const location = [property.locality, property.city, property.district].filter(Boolean).join(', ');

  return {
    ...property,
    img: firstImage,
    location,
    beds: property.bhk,
    baths: property.bathrooms,
    tag: property.featured ? 'Featured' : property.tag,
    rating: property.rating || 4.7,
    reviews: property.reviews_count || 0,
    viewOnMapUrl: buildViewOnMapUrl(property.latitude, property.longitude),
    directionsUrl: buildDirectionsUrl(property.latitude, property.longitude)
  };
};
