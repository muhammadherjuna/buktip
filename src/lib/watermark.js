/**
 * Helper Watermark & Kompresi Otomatis Buktip Menggunakan HTML5 Canvas API
 * - Menyesuaikan dimensi maksimal gambar (max 1600px) agar tajam dan hemat ukuran
 * - Mengompresi file menjadi JPEG optimal (~200KB - 400KB) agar tidak melebihi limit Supabase Storage
 * - Menambahkan watermark transparan "Buktip - @[NamaPengguna]" di pojok kanan bawah
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

          let originalWidth = img.naturalWidth || img.width;
          let originalHeight = img.naturalHeight || img.height;

          // Batasi resolusi maksimal 1600px untuk ketajaman optimal & ukuran file ringan
          const MAX_SIZE = 1600;
          let targetWidth = originalWidth;
          let targetHeight = originalHeight;

          if (targetWidth > MAX_SIZE || targetHeight > MAX_SIZE) {
            if (targetWidth > targetHeight) {
              targetHeight = Math.round((targetHeight * MAX_SIZE) / targetWidth);
              targetWidth = MAX_SIZE;
            } else {
              targetWidth = Math.round((targetWidth * MAX_SIZE) / targetHeight);
              targetHeight = MAX_SIZE;
            }
          }

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(file);
            return;
          }

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // Aktifkan perataan gambar berkualitas tinggi
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Gambar foto dengan dimensi yang sudah dioptimasi
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Hitung ukuran watermark proporsional
          const fontSize = Math.max(14, Math.floor(canvas.width * 0.024));
          const paddingX = Math.floor(fontSize * 0.75);
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
          ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
          ctx.fillText(watermarkText, badgeX + paddingX, badgeY + badgeHeight / 2);

          // Konversi ke File JPEG dengan kompresi optimal 0.82 (kualitas tinggi, ukuran kecil < 500KB)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const baseName = file.name.replace(/\.[^/.]+$/, '');
                const optimizedFile = new File([blob], `${baseName}.jpg`, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(optimizedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.82
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
