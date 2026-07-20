export const sendSuccess = (res, data = null, message = 'Success', status = 200, meta = undefined) => {
  res.status(status).json({ success: true, message, data, ...(meta ? { meta } : {}) });
};

export const sendCreated = (res, data, message = 'Created') => {
  sendSuccess(res, data, message, 201);
};
