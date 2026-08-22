import crypto from 'crypto';

// Encryption key from environment variable
// Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
const ENCRYPTION_KEY = process.env.FACE_ENCRYPTION_KEY || (() => {
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ [Security] FACE_ENCRYPTION_KEY not set in production!');
    console.warn('⚠️ [Security] Using auto-generated key. Set FACE_ENCRYPTION_KEY environment variable.');
  }
  return crypto.randomBytes(32).toString('hex');
})();
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt face descriptor array
 * @param {Array<number>} faceDescriptor - Face descriptor array (128 floats)
 * @returns {string} Encrypted string with IV and auth tag
 */
export const encryptFaceDescriptor = (faceDescriptor) => {
  if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length === 0) {
    return null;
  }

  try {
    // Convert array to JSON string
    const plaintext = JSON.stringify(faceDescriptor);
    
    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    
    // Encrypt
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get auth tag
    const authTag = cipher.getAuthTag();
    
    // Combine IV + authTag + encrypted data
    const combined = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    
    return combined;
  } catch (error) {
    console.error('❌ [Encryption] Face descriptor encryption failed:', error.message);
    throw new Error('Failed to encrypt face descriptor');
  }
};

/**
 * Decrypt face descriptor
 * @param {string} encryptedData - Encrypted string with IV and auth tag
 * @returns {Array<number>} Decrypted face descriptor array
 */
export const decryptFaceDescriptor = (encryptedData) => {
  if (!encryptedData || typeof encryptedData !== 'string') {
    return null;
  }

  try {
    // Split IV, authTag, and encrypted data
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    // Parse JSON back to array
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('❌ [Decryption] Face descriptor decryption failed:', error.message);
    throw new Error('Failed to decrypt face descriptor');
  }
};

// Log warning if using auto-generated key (not recommended for production)
if (!process.env.FACE_ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ [Security] Using auto-generated encryption key in production.');
  console.warn('⚠️ [Security] This key will change on restart. Add FACE_ENCRYPTION_KEY to environment variables.');
}
