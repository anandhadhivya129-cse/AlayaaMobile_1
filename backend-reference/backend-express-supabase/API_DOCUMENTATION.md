# ALAYAA API Documentation

Base URL:

```text
http://localhost:5000/api
```

Production URL on Render:

```text
https://your-render-service.onrender.com/api
```

Use `Authorization: Bearer <supabase_access_token>` for protected endpoints.

## Auth

`POST /auth/customer/register`

```json
{
  "fullName": "Rahul Kumar",
  "email": "rahul@example.com",
  "password": "Password123",
  "phone": "+919876543210",
  "role": "customer"
}
```

`POST /auth/broker/register`

```json
{
  "fullName": "Ravi Broker",
  "email": "broker@example.com",
  "password": "Password123",
  "phone": "+919876543211",
  "role": "broker",
  "reraNumber": "TN-RERA-12345"
}
```

`POST /auth/customer/login`, `POST /auth/broker/login`, `POST /auth/admin/login`

```json
{
  "email": "rahul@example.com",
  "password": "Password123",
  "role": "customer"
}
```

Other auth endpoints:

- `GET /auth/me`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

## Properties

`GET /properties`

Supported query parameters:

- `city`
- `locality`
- `district`
- `propertyType`
- `listingType`
- `minPrice`
- `maxPrice`
- `bhk`
- `amenities`
- `keyword`
- `sort`: `price_low`, `price_high`, `newest`, `featured`, `most_viewed`
- `page`
- `limit`

`POST /properties`

Protected for `broker` and `admin`. Use multipart form data with property fields and `images`.

Property fields:

- `title`
- `description`
- `propertyType`
- `listingType`
- `price`
- `area`
- `bhk`
- `bathrooms`
- `parking`
- `furnished`
- `city`
- `district`
- `locality`
- `address`
- `latitude`
- `longitude`
- `featured`
- `verified`
- `status`
- `amenities`

Other property endpoints:

- `GET /properties/featured`
- `GET /properties/map`
- `GET /properties/:id`
- `PATCH /properties/:id`
- `DELETE /properties/:id`
- `GET /properties/:id/amenities`
- `POST /properties/:id/click`
- `GET /properties/:id/analytics`

Map marker response includes:

```json
{
  "id": "uuid",
  "title": "3BHK Apartment",
  "price": 7800000,
  "city": "Chennai",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "viewOnMapUrl": "https://www.google.com/maps/search/?api=1&query=13.0827,80.2707",
  "directionsUrl": "https://www.google.com/maps/dir/?api=1&destination=13.0827,80.2707"
}
```

## Wishlist and Customer Dashboard

- `GET /users/dashboard`
- `GET /users/wishlist`
- `POST /users/wishlist/:id`
- `DELETE /users/wishlist/:id`
- `GET /users/recently-viewed`
- `GET /users/recommendations`
- `PATCH /users/profile`

## Comparison

`POST /compare`

```json
{
  "propertyIds": ["uuid-1", "uuid-2"]
}
```

Returns comparable property records including price, area, BHK, bathrooms, parking, amenities, and location fields.

## Inquiries and Visits

`POST /inquiries`

```json
{
  "propertyId": "uuid",
  "type": "callback",
  "name": "Rahul Kumar",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "message": "Please call me about this property."
}
```

`POST /visits`

```json
{
  "propertyId": "uuid",
  "visitType": "site_visit",
  "scheduledAt": "2026-06-15T10:30:00.000Z",
  "notes": "Prefer morning slot"
}
```

Other visit endpoints:

- `GET /visits/me`
- `PATCH /dashboard/admin/visits/:id`

## Dashboards

- `GET /dashboard/broker`: broker properties, property views, inquiries, visits, leads, status
- `GET /dashboard/admin`: total properties, users, approvals, active listings, featured listings, top cities, recent registrations, revenue-ready structure

## Locations

`GET /locations/tamil-nadu/cities`

Preconfigured Tamil Nadu cities:

- Chennai
- Coimbatore
- Madurai
- Salem
- Tiruchirappalli
- Tirunelveli
- Erode
- Vellore
- Hosur
- Thanjavur
