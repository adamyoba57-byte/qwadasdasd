import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { GameAccount, AdsterraConfig, ShortlinkConfig, SiteContent, MemberUser, ClaimActivity, VIPTier } from '../types';

// Production Google Cloud Firestore Config with embedded defaults for zero-failure builds anywhere (Vercel, Netlify, Custom Domains)
const EMBEDDED_FIREBASE_CONFIG = {
  projectId: "superb-planet-npthm",
  appId: "1:438404875069:web:d8b4976f8ddcc5a4c6fb54",
  apiKey: "AIzaSyCkdBf98_gHF4FSms6lOp3TG7NoFAlVzBY",
  authDomain: "superb-planet-npthm.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-bc7dac3f-0ad5-4409-a8a1-623cb8b95133",
  storageBucket: "superb-planet-npthm.firebasestorage.app",
  messagingSenderId: "438404875069",
  measurementId: "",
  oAuthClientId: "438404875069-irroru2m00dmcrao4q3oqf2stccmc9cm.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

const activeConfig = {
  ...EMBEDDED_FIREBASE_CONFIG,
  ...(firebaseConfigData || {})
};

// Ensure Firebase is initialized with the dedicated applet configuration
const app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();

// Target the specific firestoreDatabaseId if provided in config
export const db = activeConfig.firestoreDatabaseId
  ? getFirestore(app, activeConfig.firestoreDatabaseId)
  : getFirestore(app);

export { app };

export interface GlobalRemoteState {
  accounts?: GameAccount[];
  members?: MemberUser[];
  siteContent?: SiteContent;
  shortlinkConfig?: ShortlinkConfig;
  adsterraConfig?: AdsterraConfig;
  vipTiers?: VIPTier[];
  activities?: ClaimActivity[];
}

/**
 * Fetch all documents from Firestore
 */
export async function fetchAllFromFirestore(): Promise<GlobalRemoteState | null> {
  try {
    const result: GlobalRemoteState = {};

    // 1. Fetch site_settings
    const settingsCol = collection(db, 'site_settings');
    const settingsSnap = await getDocs(settingsCol);
    if (!settingsSnap.empty) {
      settingsSnap.forEach((docSnap) => {
        const d = docSnap.data();
        const sid = docSnap.id;
        if (sid === 'site_content' && d.data) result.siteContent = d.data;
        if (sid === 'shortlink' && d.data) result.shortlinkConfig = d.data;
        if (sid === 'adsterra' && d.data) result.adsterraConfig = d.data;
        if (sid === 'vip_tiers' && d.data) result.vipTiers = d.data;
      });
    }

    // 2. Fetch accounts
    const accountsCol = collection(db, 'accounts');
    const accountsSnap = await getDocs(accountsCol);
    if (!accountsSnap.empty) {
      const accs: GameAccount[] = [];
      accountsSnap.forEach((docSnap) => {
        accs.push(docSnap.data() as GameAccount);
      });
      if (accs.length > 0) {
        result.accounts = accs;
      }
    }

    // 3. Fetch members
    const membersCol = collection(db, 'members');
    const membersSnap = await getDocs(membersCol);
    if (!membersSnap.empty) {
      const mems: MemberUser[] = [];
      membersSnap.forEach((docSnap) => {
        mems.push(docSnap.data() as MemberUser);
      });
      if (mems.length > 0) {
        result.members = mems;
      }
    }

    // 4. Fetch activities
    const activitiesCol = collection(db, 'claim_activities');
    const activitiesSnap = await getDocs(activitiesCol);
    if (!activitiesSnap.empty) {
      const acts: ClaimActivity[] = [];
      activitiesSnap.forEach((docSnap) => {
        acts.push(docSnap.data() as ClaimActivity);
      });
      if (acts.length > 0) {
        result.activities = acts;
      }
    }

    return result;
  } catch (error) {
    console.warn('[Firestore] Error reading data:', error);
    return null;
  }
}

/**
 * Sanitizes object by removing undefined keys and serializing cleanly for Firestore
 */
export function cleanForFirestore<T>(data: T): T {
  if (data === undefined || data === null) return null as any;
  return JSON.parse(JSON.stringify(data, (key, value) => {
    return value === undefined ? null : value;
  }));
}

/**
 * Save / Update a single account in Firestore
 */
export async function saveAccountToFirestore(account: GameAccount): Promise<void> {
  try {
    const cleaned = cleanForFirestore(account);
    const ref = doc(db, 'accounts', account.id);
    await setDoc(ref, cleaned, { merge: true });
  } catch (error) {
    console.error('[Firestore] Failed to save account:', error);
    throw error;
  }
}

/**
 * Save / Update accounts array in Firestore (upsert each account)
 */
export async function saveAccountsToFirestore(accounts: GameAccount[]): Promise<void> {
  try {
    const promises = accounts.map((acc) => {
      const cleaned = cleanForFirestore(acc);
      const ref = doc(db, 'accounts', acc.id);
      return setDoc(ref, cleaned, { merge: true });
    });
    await Promise.all(promises);
  } catch (error) {
    console.error('[Firestore] Failed to save accounts:', error);
  }
}

/**
 * Save / Update a single account document in Firestore
 */
export async function saveSingleAccountToFirestore(account: GameAccount): Promise<boolean> {
  try {
    const cleaned = cleanForFirestore(account);
    const ref = doc(db, 'accounts', account.id);
    await setDoc(ref, cleaned, { merge: true });
    return true;
  } catch (error) {
    console.error('[Firestore] Failed to save single account:', error);
    return false;
  }
}

/**
 * Delete an account document from Firestore
 */
export async function deleteAccountFromFirestore(accountId: string): Promise<boolean> {
  try {
    const ref = doc(db, 'accounts', accountId);
    await deleteDoc(ref);
    return true;
  } catch (error) {
    console.error('[Firestore] Failed to delete account:', error);
    return false;
  }
}

/**
 * Save Site Content to Firestore
 */
export async function saveSiteContentToFirestore(siteContent: SiteContent): Promise<void> {
  try {
    const cleaned = cleanForFirestore(siteContent);
    const ref = doc(db, 'site_settings', 'site_content');
    await setDoc(ref, { id: 'site_content', data: cleaned, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('[Firestore] Failed to save siteContent:', error);
  }
}

/**
 * Save Shortlink Config to Firestore
 */
export async function saveShortlinkConfigToFirestore(shortlinkConfig: ShortlinkConfig): Promise<void> {
  try {
    const cleaned = cleanForFirestore(shortlinkConfig);
    const ref = doc(db, 'site_settings', 'shortlink');
    await setDoc(ref, { id: 'shortlink', data: cleaned, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('[Firestore] Failed to save shortlinkConfig:', error);
  }
}

/**
 * Save Adsterra Config to Firestore
 */
export async function saveAdsterraConfigToFirestore(adsterraConfig: AdsterraConfig): Promise<void> {
  try {
    const cleaned = cleanForFirestore(adsterraConfig);
    const ref = doc(db, 'site_settings', 'adsterra');
    await setDoc(ref, { id: 'adsterra', data: cleaned, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('[Firestore] Failed to save adsterraConfig:', error);
  }
}

/**
 * Save VIP Tiers to Firestore
 */
export async function saveVipTiersToFirestore(vipTiers: VIPTier[]): Promise<void> {
  try {
    const cleaned = cleanForFirestore(vipTiers);
    const ref = doc(db, 'site_settings', 'vip_tiers');
    await setDoc(ref, { id: 'vip_tiers', data: cleaned, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    console.error('[Firestore] Failed to save vipTiers:', error);
  }
}

/**
 * Save members to Firestore
 */
export async function saveMembersToFirestore(members: MemberUser[]): Promise<void> {
  try {
    const promises = members.map((m) => {
      const cleaned = cleanForFirestore(m);
      const ref = doc(db, 'members', m.id);
      return setDoc(ref, cleaned, { merge: true });
    });
    await Promise.all(promises);
  } catch (error) {
    console.error('[Firestore] Failed to save members:', error);
  }
}

/**
 * Save all changes in bulk to Firestore
 */
export async function saveAllToFirestore(data: {
  accounts?: GameAccount[];
  members?: MemberUser[];
  siteContent?: SiteContent;
  shortlinkConfig?: ShortlinkConfig;
  adsterraConfig?: AdsterraConfig;
  vipTiers?: VIPTier[];
  activities?: ClaimActivity[];
}): Promise<boolean> {
  try {
    const tasks: Promise<any>[] = [];
    if (data.accounts) tasks.push(saveAccountsToFirestore(data.accounts));
    if (data.members) tasks.push(saveMembersToFirestore(data.members));
    if (data.siteContent) tasks.push(saveSiteContentToFirestore(data.siteContent));
    if (data.shortlinkConfig) tasks.push(saveShortlinkConfigToFirestore(data.shortlinkConfig));
    if (data.adsterraConfig) tasks.push(saveAdsterraConfigToFirestore(data.adsterraConfig));
    if (data.vipTiers) tasks.push(saveVipTiersToFirestore(data.vipTiers));
    await Promise.all(tasks);
    return true;
  } catch (err) {
    console.error('[Firestore] Error saving all:', err);
    return false;
  }
}

/**
 * Setup Realtime Listeners for live synchronization across all browsers and devices
 */
export function subscribeToFirestoreChanges(callbacks: {
  onAccountsChange?: (accounts: GameAccount[]) => void;
  onSettingsChange?: (settings: {
    siteContent?: SiteContent;
    shortlinkConfig?: ShortlinkConfig;
    adsterraConfig?: AdsterraConfig;
    vipTiers?: VIPTier[];
  }) => void;
  onMembersChange?: (members: MemberUser[]) => void;
  onActivitiesChange?: (activities: ClaimActivity[]) => void;
}): () => void {
  const unsubs: Unsubscribe[] = [];

  // Listen to accounts
  if (callbacks.onAccountsChange) {
    const unsubAccounts = onSnapshot(collection(db, 'accounts'), (snapshot) => {
      if (!snapshot.empty) {
        const accs: GameAccount[] = [];
        snapshot.forEach((docSnap) => {
          accs.push(docSnap.data() as GameAccount);
        });
        callbacks.onAccountsChange!(accs);
      }
    }, (err) => console.warn('[Firestore Live] Accounts listener error:', err));
    unsubs.push(unsubAccounts);
  }

  // Listen to site_settings
  if (callbacks.onSettingsChange) {
    const unsubSettings = onSnapshot(collection(db, 'site_settings'), (snapshot) => {
      const settingsResult: {
        siteContent?: SiteContent;
        shortlinkConfig?: ShortlinkConfig;
        adsterraConfig?: AdsterraConfig;
        vipTiers?: VIPTier[];
      } = {};
      snapshot.forEach((docSnap) => {
        const sid = docSnap.id;
        const d = docSnap.data();
        if (sid === 'site_content' && d.data) settingsResult.siteContent = d.data;
        if (sid === 'shortlink' && d.data) settingsResult.shortlinkConfig = d.data;
        if (sid === 'adsterra' && d.data) settingsResult.adsterraConfig = d.data;
        if (sid === 'vip_tiers' && d.data) settingsResult.vipTiers = d.data;
      });
      callbacks.onSettingsChange!(settingsResult);
    }, (err) => console.warn('[Firestore Live] Settings listener error:', err));
    unsubs.push(unsubSettings);
  }

  // Listen to members
  if (callbacks.onMembersChange) {
    const unsubMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
      if (!snapshot.empty) {
        const mems: MemberUser[] = [];
        snapshot.forEach((docSnap) => {
          mems.push(docSnap.data() as MemberUser);
        });
        callbacks.onMembersChange!(mems);
      }
    }, (err) => console.warn('[Firestore Live] Members listener error:', err));
    unsubs.push(unsubMembers);
  }

  // Return unsubscribe all
  return () => {
    unsubs.forEach((u) => u());
  };
}

/**
 * Validates connection to Firestore
 */
export async function testFirestoreConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const testDocRef = doc(db, 'site_settings', 'connection_test');
    await setDoc(testDocRef, { testedAt: new Date().toISOString(), status: 'online' }, { merge: true });
    return { success: true, message: 'Successfully connected to Google Firestore Cloud Database!' };
  } catch (err: any) {
    console.warn('[Firestore] Connection test error:', err);
    return { success: false, message: err?.message || 'Failed to communicate with Firestore.' };
  }
}
