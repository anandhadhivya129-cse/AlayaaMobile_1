import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';
import { supabaseAdmin } from '../config/supabase.js';

export const uploadPropertyImages = async (propertyId, files = []) => {
  const uploaded = [];

  for (const file of files) {
    const extension = file.originalname.split('.').pop() || 'jpg';
    const path = `${propertyId}/${randomUUID()}.${extension}`;
    const { error } = await supabaseAdmin.storage
      .from(env.storageBucket)
      .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });

    if (error) throw error;

    const { data } = supabaseAdmin.storage.from(env.storageBucket).getPublicUrl(path);
    uploaded.push({ path, url: data.publicUrl });
  }

  return uploaded;
};
