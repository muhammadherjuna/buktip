/**
 * Helper Watermark & Kompresi Otomatis Buktip Menggunakan HTML5 Canvas API
 * Strategi 3 Lapisan Keamanan Elegan & Profesional:
 * - Lapisan 1: Watermark Strip Horizontal di Bagian Paling Bawah (Latar Hitam 75%, Shield + Buktip + @Username + buktip.id)
 * - Lapisan 2: Watermark Micro Shield di 4 Pojok Foto (Transparansi 50%)
 * - Mempertahankan kompresi & resolusi optimal (max 1600px, JPEG ~200-400KB)
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

          // Format nama pengguna
          const cleanUsername = String(username).replace(/^@+/, '').trim() || 'Pengguna';

          // =========================================================================
          // LAPISAN 1: WATERMARK STRIP DI BAGIAN PALING BAWAH (UTAMA)
          // =========================================================================
          const scale = canvas.width / 800; // Skala proporsional berbasis lebar 800px
          const stripHeight = Math.max(48, Math.floor(48 * scale));
          const stripY = canvas.height - stripHeight;

          // Latar belakang strip hitam semi-solid (75% opacity)
          ctx.fillStyle = 'rgba(15, 23, 42, 0.75)'; // Slate 900 75%
          ctx.fillRect(0, stripY, canvas.width, stripHeight);

          const centerY = stripY + stripHeight / 2;
          const paddingX = Math.max(16, Math.floor(16 * scale));
          const iconSize = Math.max(22, Math.floor(22 * scale));

          // A. Gambar Ikon Perisai di Kiri Strip
          drawShieldIcon(ctx, paddingX, centerY - iconSize / 2, iconSize, 'rgba(255, 255, 255, 0.95)');

          // B. Teks "Buktip" (Tebal / Semi-Bold 600)
          const fontSize = Math.max(15, Math.floor(16 * scale));
          ctx.font = `600 ${fontSize}px sans-serif`;
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';

          const textXBuktip = paddingX + iconSize + Math.max(8, Math.floor(8 * scale));
          ctx.fillText('Buktip', textXBuktip, centerY);
          const buktipWidth = ctx.measureText('Buktip').width;

          // C. Teks "@NamaPengguna" (Normal 400, sedikit lebih kecil)
          const userFontSize = Math.max(13, Math.floor(14 * scale));
          ctx.font = `400 ${userFontSize}px sans-serif`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';

          const textXUser = textXBuktip + buktipWidth + Math.max(10, Math.floor(10 * scale));
          const textRightSite = canvas.width - paddingX - Math.floor(80 * scale); // Ruang untuk buktip.id

          // Potong nama pengguna jika terlalu panjang (elipsis)
          let userText = `@${cleanUsername}`;
          const maxUserWidth = textRightSite - textXUser - 20;
          if (maxUserWidth > 40) {
            while (ctx.measureText(userText).width > maxUserWidth && userText.length > 4) {
              userText = userText.slice(0, -1);
            }
            if (userText !== `@${cleanUsername}`) {
              userText += '...';
            }
            ctx.fillText(userText, textXUser, centerY);
          }

          // D. Teks "buktip.id" di Kanan Strip
          const siteFontSize = Math.max(12, Math.floor(13 * scale));
          ctx.font = `500 ${siteFontSize}px sans-serif`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.textAlign = 'right';
          ctx.fillText('buktip.id', canvas.width - paddingX, centerY);


          // =========================================================================
          // LAPISAN 2: WATERMARK KECIL DI 4 POJOK (CADANGAN ANTI-CROP)
          // =========================================================================
          const cornerInset = Math.max(15, Math.floor(15 * scale));
          const cornerIconSize = Math.max(22, Math.floor(22 * scale));

          const cornerPositions = [
            { x: cornerInset, y: cornerInset }, // Pojok Kiri Atas
            { x: canvas.width - cornerInset - cornerIconSize, y: cornerInset }, // Pojok Kanan Atas
            { x: cornerInset, y: stripY - cornerInset - cornerIconSize }, // Pojok Kiri Bawah (Di atas strip)
            { x: canvas.width - cornerInset - cornerIconSize, y: stripY - cornerInset - cornerIconSize }, // Pojok Kanan Bawah (Di atas strip)
          ];

          cornerPositions.forEach((pos) => {
            // Gambar Ikon Perisai Kecil di Pojok (Transparansi 50%)
            drawShieldIcon(ctx, pos.x, pos.y, cornerIconSize, 'rgba(255, 255, 255, 0.50)');
          });

          // =========================================================================
          // 4. KONVERSI KE FILE JPEG TERKOMPRESI (<400KB)
          // =========================================================================
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
          console.warn('Gagal menerapkan watermark 3 lapisan, menggunakan file asli:', err);
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

/**
 * Helper menggambar Ikon Perisai Vektor Vektor Presisi pada Canvas
 */
function drawShieldIcon(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  const scale = size / 24;
  ctx.scale(scale, scale);

  // Perisai Luar
  ctx.beginPath();
  ctx.moveTo(12, 2);
  ctx.lineTo(20, 5);
  ctx.lineTo(20, 11);
  ctx.bezierCurveTo(20, 16.5, 16.5, 20.5, 12, 22);
  ctx.bezierCurveTo(7.5, 20.5, 4, 16.5, 4, 11);
  ctx.lineTo(4, 5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  // Tanda Centang / Huruf b di dalam perisai
  ctx.beginPath();
  ctx.moveTo(8.5, 11.5);
  ctx.lineTo(11, 14);
  ctx.lineTo(15.5, 9);
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  ctx.restore();
}
