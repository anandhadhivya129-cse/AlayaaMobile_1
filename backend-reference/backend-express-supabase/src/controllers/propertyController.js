import { ROLES } from '../config/constants.js';
import { sendCreated, sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../middleware/errorHandler.js';
import { createProperty, deleteProperty, getMapMarkers, getPropertyById, listProperties, updateProperty } from '../services/propertyService.js';

export const index = asyncHandler(async (req, res) => {
  const data = await listProperties(req.query);
  sendSuccess(res, data.properties, 'Properties fetched', 200, data.pagination);
});

export const featured = asyncHandler(async (_req, res) => {
  const data = await listProperties({ featured: true, sort: 'featured', limit: 12 });
  sendSuccess(res, data.properties);
});

export const show = asyncHandler(async (req, res) => {
  const property = await getPropertyById(req.params.id, req.user?.id);
  sendSuccess(res, property);
});

export const store = asyncHandler(async (req, res) => {
  const property = await createProperty({
    payload: req.validated.body,
    ownerId: req.user.id,
    files: req.files || []
  });
  sendCreated(res, property, 'Property created');
});

export const patch = asyncHandler(async (req, res) => {
  const existing = await getPropertyById(req.params.id);
  const isOwner = existing.broker_id === req.user.id;
  if (!isOwner && req.user.role !== ROLES.ADMIN) throw new ApiError(403, 'Only the owner or admin can update this property');
  const property = await updateProperty(req.params.id, req.validated.body);
  sendSuccess(res, property, 'Property updated');
});

export const destroy = asyncHandler(async (req, res) => {
  const existing = await getPropertyById(req.params.id);
  const isOwner = existing.broker_id === req.user.id;
  if (!isOwner && req.user.role !== ROLES.ADMIN) throw new ApiError(403, 'Only the owner or admin can delete this property');
  await deleteProperty(req.params.id);
  sendSuccess(res, null, 'Property deleted');
});

export const map = asyncHandler(async (req, res) => {
  const markers = await getMapMarkers(req.query);
  sendSuccess(res, markers);
});
