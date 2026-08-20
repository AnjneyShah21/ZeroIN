import Redis from 'ioredis';
import crypto from 'crypto';

export interface PastePayload {
  id: string;
  ciphertext: string;
  iv: string;
  salt?: string;
  isPasswordProtected: boolean;
  mimeType?: string;
  burnAfterReading: boolean;
  maxViews: number;
  viewCount: number;
  expiresAt?: number; // epoch ms
  panicDeleteHash: string; // SHA-256 hash of panic secret
  createdAt: number;
}

class StorageManager {
  private redis: Redis | null = null;
  private memoryStore: Map<string, PastePayload> = new Map();
  private useRedis = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 2,
          retryStrategy: (times) => (times > 3 ? null : 200),
        });
        this.redis.on('connect', () => {
          console.log('[StorageManager] Connected to Redis');
          this.useRedis = true;
        });
        this.redis.on('error', (err) => {
          console.warn('[StorageManager] Redis error, falling back to in-memory store:', err.message);
          this.useRedis = false;
        });
      } catch (e) {
        console.warn('[StorageManager] Could not init Redis, using in-memory store.');
      }
    } else {
      console.log('[StorageManager] No REDIS_URL provided. Using high-performance in-memory store.');
    }
  }

  public async savePaste(paste: PastePayload, ttlSeconds?: number): Promise<void> {
    if (this.useRedis && this.redis) {
      const key = `paste:${paste.id}`;
      const payloadStr = JSON.stringify(paste);
      if (ttlSeconds && ttlSeconds > 0) {
        await this.redis.setex(key, ttlSeconds, payloadStr);
      } else {
        await this.redis.set(key, payloadStr);
      }
    } else {
      this.memoryStore.set(paste.id, paste);
      if (ttlSeconds && ttlSeconds > 0) {
        setTimeout(() => {
          this.memoryStore.delete(paste.id);
        }, ttlSeconds * 1000);
      }
    }
  }

  public async getPaste(id: string): Promise<PastePayload | null> {
    if (this.useRedis && this.redis) {
      const raw = await this.redis.get(`paste:${id}`);
      if (!raw) return null;
      return JSON.parse(raw) as PastePayload;
    } else {
      const paste = this.memoryStore.get(id);
      if (!paste) return null;

      // Check expiration
      if (paste.expiresAt && Date.now() > paste.expiresAt) {
        this.memoryStore.delete(id);
        return null;
      }
      return paste;
    }
  }

  public async incrementViews(id: string): Promise<PastePayload | null> {
    const paste = await this.getPaste(id);
    if (!paste) return null;

    paste.viewCount += 1;

    // Check if max views reached or burn-after-reading triggered
    const shouldDestroy = 
      paste.burnAfterReading || 
      (paste.maxViews > 0 && paste.viewCount >= paste.maxViews);

    if (shouldDestroy) {
      await this.deletePaste(id);
    } else {
      // Update store
      let remainingTtl: number | undefined;
      if (paste.expiresAt) {
        remainingTtl = Math.max(1, Math.floor((paste.expiresAt - Date.now()) / 1000));
      }
      await this.savePaste(paste, remainingTtl);
    }

    return paste;
  }

  public async deletePaste(id: string): Promise<boolean> {
    if (this.useRedis && this.redis) {
      const res = await this.redis.del(`paste:${id}`);
      return res > 0;
    } else {
      return this.memoryStore.delete(id);
    }
  }
}

export const storage = new StorageManager();
