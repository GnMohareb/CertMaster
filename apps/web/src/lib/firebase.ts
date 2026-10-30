import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize shared CertMaster Firebase app
export const app = initializeApp(firebaseConfig);

// CRITICAL: Connect specifically to the provisioned named Firestore database instance
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Export canonical ecosystem identifiers for UI display & Android integration contract
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId;
export const FIREBASE_AUTH_DOMAIN = firebaseConfig.authDomain;
export const FIREBASE_STORAGE_BUCKET = firebaseConfig.storageBucket;
export const FIREBASE_APP_ID = firebaseConfig.appId;
export const OAUTH_CLIENT_ID = firebaseConfig.oAuthClientId;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Standardized Firestore error handler required by security diagnostics.
 */
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Defensive payload constraints matching firebase-blueprint.json & firestore.rules
 */
export function sanitizeString(val: string, maxLength: number, fallback = 'N/A'): string {
  const trimmed = (val || '').trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLength);
}

export function sanitizeId(id: string): string {
  const cleaned = (id || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  return cleaned || 'default_id';
}

export function clampNumber(val: number, min: number, max: number): number {
  if (Number.isNaN(val)) return min;
  return Math.max(min, Math.min(max, val));
}

/**
 * Validate live connection to Firestore on application boot
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // Permission denied on /test/connection confirms online connectivity to Firestore rules engine
    return true;
  }
}

testConnection();
