/**
 * Helper Watermark & Kompresi Otomatis Buktip Menggunakan HTML5 Canvas API
 * - Menyesuaikan resolusi maksimal (max 1600px) agar tajam dan ringan (<400KB)
 * - Menerapkan pola watermark tersebar (tiled) berulang 28-30 derajat ke seluruh permukaan foto
 * - Format teks: "Buktip @[NamaPengguna]" (Font 18-20px, ketebalan semi-bold, jarak rapat 100-120px, opacity 30-35%)
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

          const originalWidth = img.naturalWidth || img.width;
          const originalHeight = img.naturalHeight || img.height;

          // 1. Batasi dimensi maksimal 1600px untuk resolusi tajam namun file tetap ringan
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

          // 2. Gambar foto asli dengan dimensi yang dioptimasi
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // 3. Terapkan Watermark Tersebar (Tiled Pattern)
          const cleanUsername = String(username).replace(/^@+/, '').trim() || 'Pengguna';
          const watermarkText = `Buktip @${cleanUsername}`;

          // Ukuran font tegas & jelas terbaca (18-20px)
          const fontSize = Math.max(18, Math.min(22, Math.floor(canvas.width * 0.020)));
          ctx.font = `600 ${fontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Jarak antar watermark lebih rapat (sekitar 100-120px)
          const stepX = Math.max(120, Math.floor(canvas.width * 0.12));
          const stepY = Math.max(90, Math.floor(canvas.height * 0.08));
          const angleRad = -28 * (Math.PI / 180); // Kemiringan 28 derajat

          ctx.save();

          // Loop untuk mengisi seluruh permukaan foto secara berulang
          let rowIndex = 0;
          for (let y = -stepY; y <= canvas.height + stepY * 2; y += stepY) {
            const rowOffset = (rowIndex % 2 !== 0) ? (stepX / 2) : 0;
            for (let x = -stepX; x <= canvas.width + stepX * 2; x += stepX) {
              ctx.save();
              ctx.translate(x + rowOffset, y);
              ctx.rotate(angleRad);

              // Bayangan halus hitam tipis (16%) agar tegas dan terbaca di latar terang/putih
              ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
              ctx.fillText(watermarkText, 1.2, 1.2);

              // Teks putih tegas dengan opasitas 32-35% (jelas terlihat, tidak mengaburkan detail HP)
              ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
              ctx.fillText(watermarkText, 0, 0);

              ctx.restore();
            }
            rowIndex++;
          }

          ctx.restore();

          // 4. Konversi ke File JPEG terkompresi (kualitas 0.82, ukuran <400KB)
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
          console.warn('Gagal menerapkan watermark tersebar, menggunakan file asli:', err);
          resolve(file);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    } catch (e) {
      console.warn('Kesalahan inisialisasi watermark:', e);
      resolve(file);
    }
  });
}
