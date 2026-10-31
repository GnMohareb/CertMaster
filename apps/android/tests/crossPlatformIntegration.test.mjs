import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

function webClassifyArchetype(scorePct, avgLatency, totalSwitches, totalEliminations, total = 10) {
  let archetype = 'Analytical Hesitator';
  let stress = 68;
  if (scorePct >= 85 && avgLatency < 40 && totalSwitches <= 2) {
    archetype = 'Confident Master';
    stress = 35;
  } else if (totalEliminations >= 6 && scorePct >= 70) {
    archetype = 'Deliberate Strategist';
    stress = 54;
  } else if (avgLatency < 22 && scorePct < 70) {
    archetype = 'Fast Guesser';
    stress = 72;
  } else if (avgLatency >= 45 || totalSwitches >= 4) {
    archetype = 'Analytical Hesitator';
    stress = 68;
  } else {
    archetype = 'Methodical Verifier';
    stress = 50;
  }
  const distractorEliminationRate = Math.min(1, Math.round((totalEliminations / (total * 3)) * 100) / 100);
  const optionSwitchCountAvg = Math.round((totalSwitches / total) * 10) / 10;
  return { archetype, stress, distractorEliminationRate, optionSwitchCountAvg };
}

function webSimulationStress(totalSwitches, passed) {
  return Math.min(100, Math.max(30, 50 + totalSwitches * 5 - (passed ? 15 : 0)));
}

test('1. Shared Firebase Blueprint & Firestore Security Rules verify all 11 domains', () => {
  const blueprintPath = fs.existsSync(path.join(rootDir, 'config/firebase-blueprint.json'))
    ? path.join(rootDir, 'config/firebase-blueprint.json')
    : path.join(rootDir, 'firebase-blueprint.json');
  const rulesPath = fs.existsSync(path.join(rootDir, 'config/firestore.rules'))
    ? path.join(rootDir, 'config/firestore.rules')
    : path.join(rootDir, 'firestore.rules');

  const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));
  const rules = fs.readFileSync(rulesPath, 'utf8');

  assert.ok(blueprint.entities.UserCentralProfile, 'UserCentralProfile entity defined');
  assert.ok(blueprint.entities.ExamSubscription, 'ExamSubscription entity defined');
  assert.ok(blueprint.entities.SimulationAttempt, 'SimulationAttempt entity defined');
  assert.ok(blueprint.entities.StudyPlan, 'StudyPlan entity defined');
  assert.ok(blueprint.entities.FlashcardProgress, 'FlashcardProgress entity defined');
  assert.ok(blueprint.entities.StudySource, 'StudySource entity defined');

  assert.ok(blueprint.firestore['/users/{userId}'], 'Profile path defined');
  assert.ok(blueprint.firestore['/users/{userId}/entitlements/{examId}'], 'Entitlements path defined');
  assert.ok(blueprint.firestore['/users/{userId}/attempts/{sessionId}'], 'Attempts path defined');
  assert.ok(blueprint.firestore['/users/{userId}/studyPlans/{examId}'], 'StudyPlans path defined');
  assert.ok(blueprint.firestore['/users/{userId}/flashcards/{cardId}'], 'Flashcards path defined');
  assert.ok(blueprint.firestore['/users/{userId}/sources/{sourceId}'], 'Sources path defined');

  assert.ok(rules.includes('function isOwner(userId)'), 'Firestore rules enforce owner isolation');
  assert.ok(rules.includes('match /users/{userId}'), 'Firestore rules protect user documents');
  assert.ok(rules.includes('match /entitlements/{examId}'), 'Firestore rules protect entitlements');
  assert.ok(rules.includes('match /attempts/{sessionId}'), 'Firestore rules protect attempts');
  assert.ok(rules.includes('match /studyPlans/{examId}'), 'Firestore rules protect studyPlans');
  assert.ok(rules.includes('match /flashcards/{cardId}'), 'Firestore rules protect flashcards');
});

test('2. Android AuthoritativeMetricsEngine matches Web AssessmentScreen & SimulatorScreen formulas', () => {
  const androidEngineSrc = fs.readFileSync(
    path.join(rootDir, 'app/src/main/java/com/example/domain/AuthoritativeMetricsEngine.kt'),
    'utf8'
  );
  const webAssessmentSrc = fs.readFileSync(
    path.join(rootDir, 'src/screens/AssessmentScreen.tsx'),
    'utf8'
  );
  const webSimulatorSrc = fs.readFileSync(
    path.join(rootDir, 'src/screens/SimulatorScreen.tsx'),
    'utf8'
  );

  const thresholds = [
    'scorePct >= 85 && avgLatency',
    'totalEliminations >= 6 && scorePct >= 70',
    'avgLatency < 22 && scorePct < 70',
    'avgLatency >= 45 || totalSwitches >= 4',
    'Confident Master',
    'Deliberate Strategist',
    'Fast Guesser',
    'Analytical Hesitator',
    'Methodical Verifier'
  ];

  for (const t of thresholds) {
    const normalizedAndroid = androidEngineSrc.replace(/avgLatencySec/g, 'avgLatency');
    assert.ok(normalizedAndroid.includes(t), `Android engine contains authoritative rule: ${t}`);
    assert.ok(webAssessmentSrc.includes(t), `Web AssessmentScreen contains authoritative rule: ${t}`);
  }

  assert.ok(
    webSimulatorSrc.includes('50 + totalSwitches * 5 - (passed ? 15 : 0)'),
    'Web SimulatorScreen uses authoritative stress formula'
  );
  assert.ok(
    androidEngineSrc.includes('50 + (totalSwitches * 5) - (if (passed) 15 else 0)'),
    'Android AuthoritativeMetricsEngine uses identical stress formula'
  );

  const v1 = webClassifyArchetype(90, 32, 1, 8, 10);
  assert.equal(v1.archetype, 'Confident Master');
  assert.equal(v1.stress, 35);
  assert.equal(v1.distractorEliminationRate, 0.27);
  assert.equal(v1.optionSwitchCountAvg, 0.1);

  assert.equal(webSimulationStress(2, true), 45);
  assert.equal(webSimulationStress(5, false), 75);
});

test('3. Shared Identity & SSO Configuration matches across Web AuthContext and Android SharedAuthManager', () => {
  const webAuthSrc = fs.readFileSync(path.join(rootDir, 'src/context/AuthContext.tsx'), 'utf8');
  const androidProfileSrc = fs.readFileSync(
    path.join(rootDir, 'app/src/main/java/com/example/model/CentralProfile.kt'),
    'utf8'
  );
  const androidAuthSrc = fs.readFileSync(
    path.join(rootDir, 'app/src/main/java/com/example/auth/SharedAuthManager.kt'),
    'utf8'
  );
  const ssoConfigXml = fs.readFileSync(
    path.join(rootDir, 'app/src/main/res/values/sso_config.xml'),
    'utf8'
  );

  assert.ok(webAuthSrc.includes('usr_gnmohareb_cissp_001'));
  assert.ok(androidProfileSrc.includes('usr_gnmohareb_cissp_001'));
  assert.ok(webAuthSrc.includes('gnmohareb@gmail.com'));
  assert.ok(androidProfileSrc.includes('gnmohareb@gmail.com'));
  assert.ok(
    androidProfileSrc.includes('814967786900-9idd4t0m0qikfs4g739to1s2fda2mefu.apps.googleusercontent.com')
  );
  assert.ok(
    ssoConfigXml.includes('814967786900-9idd4t0m0qikfs4g739to1s2fda2mefu.apps.googleusercontent.com')
  );

  assert.ok(androidAuthSrc.includes('GetSignInWithGoogleOption'));
  assert.ok(androidAuthSrc.includes('GetGoogleIdOption'));
  assert.ok(!androidAuthSrc.includes('signInAnonymously('));
  assert.ok(!androidAuthSrc.includes('signInWithEmailAndPassword('));
});

test('4. Offline Caching, Pending Sync Queue, and Conflict Resolution are wired in Android Room & Repository', () => {
  const certDbSrc = fs.readFileSync(
    path.join(rootDir, 'app/src/main/java/com/example/data/local/CertDatabase.kt'),
    'utf8'
  );
  const repoSrc = fs.readFileSync(
    path.join(rootDir, 'app/src/main/java/com/example/data/ExamRepository.kt'),
    'utf8'
  );
  const syncClientSrc = fs.readFileSync(
    path.join(rootDir, 'app/src/main/java/com/example/network/CertMasterFirebaseSyncClient.kt'),
    'utf8'
  );

  assert.ok(certDbSrc.includes('StudySourceEntity::class'));
  assert.ok(certDbSrc.includes('FlashcardEntity::class'));
  assert.ok(certDbSrc.includes('SimulationScoreEntity::class'));
  assert.ok(certDbSrc.includes('UserProfileEntity::class'));
  assert.ok(certDbSrc.includes('StudyPlanEntity::class'));
  assert.ok(certDbSrc.includes('SyncQueueEntity::class'));

  assert.ok(repoSrc.includes('ingestWebProfileJson'));
  assert.ok(repoSrc.includes('ingestWebSimulationResultJson'));
  assert.ok(repoSrc.includes('recomputeReadinessAndStudyPlan'));
  assert.ok(syncClientSrc.includes('executeWithRetry'));
  assert.ok(syncClientSrc.includes('syncAllWithFirestore'));
});
