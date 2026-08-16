/**
 * Helper Watermark Otomatis Buktip Menggunakan HTML5 Canvas API
 * Menambahkan watermark transparan "Buktip - @[NamaPengguna]" di pojok kanan bawah foto
 * sebelum diunggah ke Supabase Storage.
 */

export async function applyWatermark(file, username = 'Pengguna') {
  return new Promise((resolve) => {
    try {
      if (!file || !file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        try {
          URL.revokeObjectURL(objectUrl);

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(file);
            return;
          }

          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;

          // Gambar foto asli
          ctx.drawImage(img, 0, 0);

          // Hitung ukuran teks proporsional terhadap resolusi foto
          const fontSize = Math.max(14, Math.floor(canvas.width * 0.025));
          const paddingX = Math.floor(fontSize * 0.8);
          const paddingY = Math.floor(fontSize * 0.4);
          const margin = Math.floor(fontSize * 0.8);

          const cleanUsername = String(username).replace(/^@+/, '');
          const watermarkText = `Buktip - @${cleanUsername}`;

          ctx.font = `600 ${fontSize}px sans-serif`;
          ctx.textBaseline = 'middle';

          const textMetrics = ctx.measureText(watermarkText);
          const badgeWidth = textMetrics.width + paddingX * 2;
          const badgeHeight = fontSize + paddingY * 2;

          const badgeX = canvas.width - badgeWidth - margin;
          const badgeY = canvas.height - badgeHeight - margin;

          // Gambar badge latar belakang semi-transparan
          ctx.fillStyle = 'rgba(15, 23, 42, 0.45)'; // Slate 900 dengan opacity 0.45
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, Math.floor(badgeHeight * 0.25));
            ctx.fill();
          } else {
            ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
          }

          // Gambar teks watermark putih transparan
          ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
          ctx.fillText(watermarkText, badgeX + paddingX, badgeY + badgeHeight / 2);

          // Konversi kembali ke File
          const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const watermarkedFile = new File([blob], file.name, {
                  type: mimeType,
                  lastModified: Date.now(),
                });
                resolve(watermarkedFile);
              } else {
                resolve(file);
              }
            },
            mimeType,
            0.9
          );
        } catch (err) {
          console.warn('Gagal memproses watermark pada canvas, menggunakan file asli:', err);
          resolve(file);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    } catch (e) {
      console.warn('Kesalahan saat inisialisasi watermark:', e);
      resolve(file);
    }
  });
}
