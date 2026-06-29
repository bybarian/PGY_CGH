import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA7RsVQzivcS6yvwnu96v_9lvFkyia5fhI",
  authDomain: "ai-studio-applet-webapp-bc93d.firebaseapp.com",
  projectId: "ai-studio-applet-webapp-bc93d",
  storageBucket: "ai-studio-applet-webapp-bc93d.firebasestorage.app",
  messagingSenderId: "336108927526",
  appId: "1:336108927526:web:b62073575f1f55215d44e7"
};

const app = initializeApp(firebaseConfig);

// Use custom firestoreDatabaseId if provided in configuration, otherwise default
const databaseId = "ai-studio-115pgy-3633df77-2637-4259-94f8-64ec5c159e66";
export const db = getFirestore(app, databaseId);

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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

