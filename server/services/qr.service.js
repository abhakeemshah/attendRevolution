// server/services/qr.service.js

const QRCode = require('qrcode');

/**
 * Generates a QR code from a data string.
 *
 * @param {string} data - The data to encode in the QR code.
 * @returns {Promise<string>} A data URL representing the QR code image.
 */
async function generateQRCode(data) {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error.message);
    throw new Error('Failed to generate QR code.');
  }
}

module.exports = {
  generateQRCode,
};


