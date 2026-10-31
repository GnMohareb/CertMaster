// Live Firestore Emulator rules tests (run via: firebase emulators:exec --only firestore "node firestore.emulator.test.mjs")
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const env = await initializeTestEnvironment({
  projectId: 'demo-certmaster-rules',
  firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
});

const results = [];
async function t(name, fn) {
  try { await fn(); results.push(['PASS', name]); console.log('PASS', name); }
  catch (e) { results.push(['FAIL', name]); console.log('FAIL', name, '-', e.message.split('\n')[0]); }
}

const alice = env.authenticatedContext('alice', { email: 'a@x.com', email_verified: true }).firestore();
const unverified = env.authenticatedContext('carol', { email: 'c@x.com', email_verified: false }).firestore();
const bob = env.authenticatedContext('bob', { email: 'b@x.com', email_verified: true }).firestore();
const anon = env.unauthenticatedContext().firestore();

const profile = (uid, over = {}) => ({
  userId: uid, displayName: 'Alice', subscriptionTier: 'Free Trial', assessmentScorePercent: 50,
  cognitiveStressBaseline: 40, preferredTheme: 'dark', targetExamId: 'cissp',
  lastActivePlatform: 'WEB', schemaVersion: 2, ...over,
});

await t('verified owner creates valid profile', () => assertSucceeds(setDoc(doc(alice, 'users/alice'), profile('alice'))));
await t('owner reads own profile', () => assertSucceeds(getDoc(doc(alice, 'users/alice'))));
await t('other user cannot read profile', () => assertFails(getDoc(doc(bob, 'users/alice'))));
await t('unauthenticated cannot read profile', () => assertFails(getDoc(doc(anon, 'users/alice'))));
await t('unverified email cannot write profile', () => assertFails(setDoc(doc(unverified, 'users/carol'), profile('carol'))));
await t('cannot write profile for another uid', () => assertFails(setDoc(doc(bob, 'users/alice'), profile('alice'))));
await t('cannot self-grant paid tier "Universal Multi-Pass" via invalid tier string "ACTIVE"', () =>
  assertFails(updateDoc(doc(alice, 'users/alice'), { subscriptionTier: 'ACTIVE' })));
await t('cannot inject unknown field (isAdmin)', () =>
  assertFails(setDoc(doc(alice, 'users/alice'), profile('alice', { isAdmin: true }))));
await t('entitlement ACTIVE rejected from client', () =>
  assertFails(setDoc(doc(alice, 'users/alice/entitlements/cissp'), { examId: 'cissp', status: 'ACTIVE', userId: 'alice' })));
await t('entitlement PAID/ACTIVE in subscriptions path rejected', () =>
  assertFails(setDoc(doc(alice, 'users/alice/subscriptions/cissp'), { examId: 'cissp', status: 'ACTIVE', userId: 'alice' })));
await t('catalog write denied', () => assertFails(setDoc(doc(alice, 'catalog/cissp'), { x: 1 })));
await t('question bank write denied', () => assertFails(setDoc(doc(alice, 'exams/cissp/questions/q1'), { x: 1 })));
await t('catch-all default deny on unknown collection', () => assertFails(setDoc(doc(alice, 'misc/x'), { a: 1 })));
await t('unauthenticated cannot read catalog', () => assertFails(getDoc(doc(anon, 'catalog/cissp'))));
await t('signed-in can read catalog', () => assertSucceeds(getDoc(doc(alice, 'catalog/cissp'))));

await env.cleanup();
const failed = results.filter(r => r[0] === 'FAIL').length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
