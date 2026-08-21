import { Router, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import crypto from 'crypto';
import { storage, PastePayload } from '../services/storage';

export const pasteRouter = Router();

// Max allowed payload size: 10MB
const MAX_CIPHERTEXT_SIZE = 10 * 1024 * 1024;

// Expiration options in seconds
const EXPIRATION_MAP: Record<string, number> = {
  '5m': 5 * 60,
  '1h': 60 * 60,
  '1d': 24 * 60 * 60,
  '1w': 7 * 24 * 60 * 60,
  'never': 0,
};

/**
 * POST /api/pastes
 * Creates a zero-knowledge encrypted paste entry.
 */
pasteRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      ciphertext,
      iv,
      salt,
      algorithm = 'AES-GCM',
      keyLength = 256,
      isPasswordProtected = false,
      mimeType = 'text/plain',
      burnAfterReading = false,
      expiry = '1d',
      maxViews = 0,
      panicDeleteHash,
    } = req.body;

    // Basic validation
    if (!ciphertext || typeof ciphertext !== 'string') {
      return res.status(400).json({ error: 'Ciphertext is required' });
    }
    if (!iv || typeof iv !== 'string') {
      return res.status(400).json({ error: 'Initialization Vector (iv) is required' });
    }
    if (!panicDeleteHash || typeof panicDeleteHash !== 'string') {
      return res.status(400).json({ error: 'Panic delete token hash is required' });
    }
    if (algorithm !== 'AES-GCM' || ![128, 192, 256].includes(Number(keyLength))) {
      return res.status(400).json({ error: 'Unsupported encryption configuration' });
    }
    if (ciphertext.length > MAX_CIPHERTEXT_SIZE) {
      return res.status(413).json({ error: 'Payload exceeds maximum limit (10MB)' });
    }

    const id = nanoid(12);
    const ttlSeconds = EXPIRATION_MAP[expiry] ?? EXPIRATION_MAP['1d'];
    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : undefined;

    const newPaste: PastePayload = {
      id,
      ciphertext,
      iv,
      salt: salt || undefined,
      algorithm,
      keyLength: Number(keyLength) as 128 | 192 | 256,
      isPasswordProtected: Boolean(isPasswordProtected),
      mimeType,
      burnAfterReading: Boolean(burnAfterReading),
      maxViews: Number(maxViews) || 0,
      viewCount: 0,
      expiresAt,
      panicDeleteHash,
      createdAt: Date.now(),
    };

    await storage.savePaste(newPaste, ttlSeconds);

    return res.status(201).json({
      id,
      expiresAt,
      burnAfterReading: newPaste.burnAfterReading,
      maxViews: newPaste.maxViews,
      message: 'Encrypted paste stored successfully. Decryption key was never transmitted to server.',
    });
  } catch (error) {
    console.error('Error storing paste:', error);
    return res.status(500).json({ error: 'Failed to save encrypted paste' });
  }
});

/**
 * GET /api/pastes/:id
 * Fetches and updates view counts / burn state.
 */
pasteRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paste = await storage.getPaste(id);

    if (!paste) {
      return res.status(404).json({ error: 'Paste not found or has expired/been burned.' });
    }

    // Increment views & check auto-destruction
    const updated = await storage.incrementViews(id);

    return res.json({
      id: paste.id,
      ciphertext: paste.ciphertext,
      iv: paste.iv,
      salt: paste.salt,
      algorithm: paste.algorithm || 'AES-GCM',
      keyLength: paste.keyLength || 256,
      isPasswordProtected: paste.isPasswordProtected,
      mimeType: paste.mimeType,
      burnAfterReading: paste.burnAfterReading,
      maxViews: paste.maxViews,
      viewCount: updated ? updated.viewCount : paste.viewCount + 1,
      createdAt: paste.createdAt,
    });
  } catch (error) {
    console.error('Error fetching paste:', error);
    return res.status(500).json({ error: 'Failed to retrieve paste' });
  }
});

/**
 * DELETE /api/pastes/:id/panic
 * Instantly destroys a paste via owner's panic secret token.
 */
pasteRouter.delete('/:id/panic', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { panicSecret } = req.body;

    if (!panicSecret || typeof panicSecret !== 'string') {
      return res.status(400).json({ error: 'Panic delete secret is required' });
    }

    const paste = await storage.getPaste(id);
    if (!paste) {
      return res.status(404).json({ error: 'Paste not found or already deleted' });
    }

    // Verify SHA-256 hash of provided secret
    const hash = crypto.createHash('sha256').update(panicSecret).digest('hex');
    if (hash !== paste.panicDeleteHash) {
      return res.status(403).json({ error: 'Invalid panic secret key' });
    }

    await storage.deletePaste(id);

    return res.json({ success: true, message: 'Paste permanently destroyed.' });
  } catch (error) {
    console.error('Panic delete error:', error);
    return res.status(500).json({ error: 'Failed to destroy paste' });
  }
});
