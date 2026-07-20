export const sendNotification = async ({ to, subject, template, payload }) => {
  console.log('[notification]', { to, subject, template, payload });
  return { queued: true };
};
