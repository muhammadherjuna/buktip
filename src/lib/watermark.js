/**
 * Helper Watermark & Kompresi Otomatis Buktip Menggunakan HTML5 Canvas API
 * - Mengompresi & menyesuaikan resolusi maksimal (max 1600px) agar file ringan (<400KB)
 * - Menerapkan pola watermark tersebar (tiled) berulang miring 30 derajat ke seluruh permukaan foto
 * - Format teks: "Buktip @[NamaPengguna]" dengan transparansi halus (15-20%) anti-crop
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

          // Ukuran font proporsional (13-16px)
          const fontSize = Math.max(13, Math.min(16, Math.floor(canvas.width * 0.015)));
          ctx.font = `500 ${fontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Jarak antar watermark (step grid)
          const stepX = Math.max(180, Math.floor(canvas.width * 0.18));
          const stepY = Math.max(130, Math.floor(canvas.height * 0.14));
          const angleRad = -30 * (Math.PI / 180); // Sudut kemiringan 30 derajat

          ctx.save();

          // Loop untuk mengisi seluruh permukaan foto secara berulang
          let rowIndex = 0;
          for (let y = -stepY; y <= canvas.height + stepY * 2; y += stepY) {
            const rowOffset = (rowIndex % 2 !== 0) ? (stepX / 2) : 0;
            for (let x = -stepX; x <= canvas.width + stepX * 2; x += stepX) {
              ctx.save();
              ctx.translate(x + rowOffset, y);
              ctx.rotate(angleRad);

              // Bayangan halus hitam tipis (10%) agar terbaca di background terang
              ctx.fillStyle = 'rgba(0, 0, 0, 0.10)';
              ctx.fillText(watermarkText, 1, 1);

              // Teks putih transparan (18%) agar tidak merusak visual foto asli
              ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
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
