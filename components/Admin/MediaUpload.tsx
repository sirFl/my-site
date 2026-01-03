'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function MediaUpload() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (error) throw error;

      // Получаем публичный URL
      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      alert(`Файл загружен: ${data.publicUrl}`);
    } catch (error) {
      alert('Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleUpload}
        disabled={uploading}
        accept="image/*,.pdf,.doc,.docx"
      />
      {uploading && <span>Загрузка...</span>}
    </div>
  );
}