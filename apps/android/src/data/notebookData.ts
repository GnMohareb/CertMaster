import { SourceDoc, AudioOverview, Flashcard } from '../types';

export const STUDY_SOURCE_DOCS: SourceDoc[] = [
  {
    id: 'src_nist_rmf',
    examId: 'cissp',
    domainId: 'd1',
    domainName: 'Security and Risk Management',
    title: 'NIST SP 800-37 Rev. 2: Risk Management Framework (RMF)',
    authorOrStandard: 'National Institute of Standards and Technology',
    type: 'Official Standard',
    summary: 'Comprehensive 7-step lifecycle for system risk management: Prepare, Categorize, Select, Implement, Assess, Authorize, and Monitor.',
    keyTakeaways: [
      'Prepare step establishes organizational risk context and assigns roles before system authorization.',
      'Categorize utilizes FIPS 199 based on impact to Confidentiality, Integrity, and Availability (Low, Moderate, High).',
      'Assess determines whether controls are implemented correctly and operating as intended.',
      'Authorize requires the Authorizing Official (AO) to accept residual risk formally.',
      'Continuous Monitoring maintains ongoing situational awareness.'
    ],
    fullContent: `# NIST SP 800-37 Rev. 2: Risk Management Framework
The Risk Management Framework (RMF) provides a disciplined, structured, and flexible process for managing security and privacy risk in organizational information systems.

## The 7 RMF Steps:
1. **PREPARE**: Essential activities to prepare all levels of the organization to manage its security and privacy risks.
2. **CATEGORIZE**: Categorize the system and information processed based on impact analysis (FIPS 199).
3. **SELECT**: Select an initial set of baseline security controls (NIST SP 800-53) and tailor as needed.
4. **IMPLEMENT**: Implement the controls and describe how they are employed within the system architecture.
5. **ASSESS**: Assess the controls to determine if they produce desired results with respect to meeting security requirements.
6. **AUTHORIZE**: Senior leadership authorizes system operation based on determination of acceptable risk to organizational operations.
7. **MONITOR**: Continuously monitor control implementation and the security/privacy state of the system.`
  },
  {
    id: 'src_access_models',
    examId: 'cissp',
    domainId: 'd3',
    domainName: 'Security Architecture and Engineering',
    title: 'Formal Access Control Models: Bell-LaPadula vs. Biba vs. Clark-Wilson',
    authorOrStandard: 'DoD Directive 5200.28-STD & Computer Security Foundations',
    type: 'Formal Specification',
    summary: 'Mathematical state machine security models governing confidentiality (Bell-LaPadula) vs integrity (Biba) in multi-level secure architectures.',
    keyTakeaways: [
      'Bell-LaPadula is strictly for CONFIDENTIALITY. Rule 1: Simple Security (No Read-Up). Rule 2: *-Property (No Write-Down).',
      'Biba is strictly for INTEGRITY. Rule 1: Simple Integrity (No Read-Down). Rule 2: *-Integrity (No Write-Up).',
      'Remember: "Biba prevents dirty data from floating up to clean systems".',
      'Clark-Wilson enforces integrity for commercial transactions via Well-Formed Transactions and Separation of Duties.'
    ],
    fullContent: `# Formal Access Control Models

### 1. Bell-LaPadula (Confidentiality Model)
- Developed in 1973 for government multi-level security.
- **Simple Security Property (ss-property)**: Subject cannot read higher classification (No Read Up).
- ***-Property (star-property)**: Subject cannot write lower classification (No Write Down), preventing exfiltration of secrets.
- Tranquility Principle: Security labels do not change dynamically during execution.

### 2. Biba Integrity Model
- Developed in 1977 as the mathematical mirror of Bell-LaPadula.
- **Simple Integrity Axiom**: Subject cannot read lower integrity objects (No Read Down).
- ***-Integrity Axiom**: Subject cannot write to higher integrity objects (No Write Up), preventing contamination of trusted code.

### 3. Clark-Wilson Model
- Commercial integrity framework.
- Uses Constrained Data Items (CDIs) transformed solely by Transformation Procedures (TPs).
- Enforces Separation of Duties to prevent accounting fraud.`
  },
  {
    id: 'src_incident_resp',
    examId: 'cissp',
    domainId: 'd7',
    domainName: 'Security Operations',
    title: 'NIST SP 800-61 Rev. 2: Computer Security Incident Handling Guide',
    authorOrStandard: 'NIST Special Publication',
    type: 'Operational Guide',
    summary: 'The standard 4-phase incident response lifecycle: Preparation, Detection & Analysis, Containment Eradication & Recovery, Post-Incident Activity.',
    keyTakeaways: [
      'Phase 1: Preparation includes establishing policy, CSIRT team, toolkits, and contact lists.',
      'Phase 2: Detection and Analysis involves correlation of precursors, indicators, and baseline deviation.',
      'Phase 3: Containment, Eradication, and Recovery. Containment must happen before eradication to prevent adversary reaction.',
      'Phase 4: Post-Incident Activity (Lessons Learned). Must conduct meetings within 2 weeks of incident close.'
    ],
    fullContent: `# NIST SP 800-61 Rev. 2 Incident Response Lifecycle

Organized incident response consists of four interdependent steps:

1. **Preparation**: Equipping the Computer Security Incident Response Team (CSIRT) with jump-bags, forensics tools, authorized communication channels, and clear escalation protocols.
2. **Detection & Analysis**: Distinguishing between harmless anomaly and security event. Determining attack vectors and scope.
3. **Containment, Eradication & Recovery**:
   - Short-term and long-term containment (network isolation, blackholing).
   - Eradication of malicious artifacts (reimaging disks, resetting credentials).
   - Controlled restoration to production with enhanced telemetry.
4. **Post-Incident Activity**: Documenting lessons learned, updating standard operating procedures (SOPs), and feeding findings back into the Preparation phase.`
  },
  {
    id: 'src_bia_metrics',
    examId: 'cissp',
    domainId: 'd1',
    domainName: 'Security and Risk Management',
    title: 'Business Impact Analysis (BIA) & Disaster Recovery Metrics Guide',
    authorOrStandard: 'ISO 22301 / NIST SP 800-34 Rev. 1',
    type: 'Operational Guide',
    summary: 'Definitive mathematical guide on BIA timelines: MTD = RTO + WRT, RPO backup delta, and SLA penalty curves.',
    keyTakeaways: [
      'RPO represents maximum data loss backward in time.',
      'RTO represents hardware/system restoration time forward from disruption.',
      'WRT is data verification, integrity checking, and ledger replay time.',
      'MTD = RTO + WRT. Exceeding MTD means permanent business insolvency.'
    ],
    fullContent: `# Business Continuity & BIA Mathematical Metrics

When designing disaster recovery strategies, the CISO must establish quantifiable recovery timelines:

$$MTD = RTO + WRT$$

- **Maximum Tolerable Downtime (MTD)**: The total duration of downtime the business can withstand before suffering fatal operational or legal collapse.
- **Recovery Time Objective (RTO)**: Target time to repair servers, restore images, and re-establish network connectivity.
- **Work Recovery Time (WRT)**: Duration required after system recovery to verify database consistency, re-enter uncommitted physical paperwork, and validate transactions.
- **Recovery Point Objective (RPO)**: The tolerance for lost transactional data measured in elapsed time from the last successful verified snapshot.`
  }
];

export const AUDIO_BRIEFINGS: AudioOverview[] = [
  {
    id: 'audio_deepdive_1',
    examId: 'cissp',
    domainId: 'd3',
    title: 'Mastering the Formal Security Models: Bell-LaPadula vs Biba vs Clark-Wilson',
    subtitle: 'NotebookLM Multi-Speaker Deep Dive Audio Briefing (12 min)',
    durationSeconds: 720,
    host1: 'Maya (Senior Security Architect)',
    host2: 'Liam (Lead Certification Tutor)',
    keyConceptsCovered: [
      'Simple Security vs *-Property',
      'Integrity vs Confidentiality Tradeoffs',
      'Commercial Clark-Wilson CDIs & TPs',
      'High-Stakes CISSP Exam Traps'
    ],
    turns: [
      { speaker: 'Liam (Lead Certification Tutor)', text: "Welcome to today's CertMaster Deep Dive audio overview! Today we're tackling one of the most notoriously tested concepts on the CISSP and CISM exams: formal access control models. Maya, why do students get tripped up on Bell-LaPadula versus Biba?", timeSeconds: 0 },
      { speaker: 'Maya (Senior Security Architect)', text: "Great to be here, Liam! The number one pitfall is that candidates try to memorize the mathematical axioms without understanding the underlying business intent. Bell-LaPadula was commissioned for military confidentiality—think Top Secret versus Secret. It has one prime directive: prevent confidential leaks.", timeSeconds: 9 },
      { speaker: 'Liam (Lead Certification Tutor)', text: "Right, so that's where the famous 'No Read-Up' and 'No Write-Down' rules come from. Can you unpack what the star-property prevents?", timeSeconds: 20 },
      { speaker: 'Maya (Senior Security Architect)', text: "Exactly. If an officer with Top Secret clearance is logged in, the star-property prevents them from accidentally or maliciously writing that Top Secret intel into an Unclassified document. No write-down protects confidentiality.", timeSeconds: 30 },
      { speaker: 'Liam (Lead Certification Tutor)', text: "And Biba is essentially the exact inverse because it protects integrity rather than secrecy, right?", timeSeconds: 42 },
      { speaker: 'Maya (Senior Security Architect)', text: "Spot on! In Biba, you don't want untrusted data corrupting trusted systems. So an integrity subject cannot read down from an untrusted source, and cannot write up to dirty a clean dataset. On the exam, when you see 'prevent unauthorized modification', think Biba or Clark-Wilson immediately!", timeSeconds: 52 },
      { speaker: 'Liam (Lead Certification Tutor)', text: "What about Clark-Wilson? When does the exam favor that over Biba?", timeSeconds: 67 },
      { speaker: 'Maya (Senior Security Architect)', text: "Remember the two keywords for Clark-Wilson: 'Well-Formed Transactions' and 'Separation of Duties'. Biba is mathematical; Clark-Wilson is designed for commercial accounting systems to prevent internal fraud.", timeSeconds: 76 },
      { speaker: 'Liam (Lead Certification Tutor)', text: "Brilliant distinction! That's going to save at least three questions on exam day. Let's move to our next review topic: Cryptography and PKI.", timeSeconds: 90 }
    ]
  },
  {
    id: 'audio_deepdive_2',
    examId: 'cissp',
    domainId: 'd1',
    title: 'BIA Metrics Unpacked: MTD, RTO, RPO, and WRT',
    subtitle: 'Executive briefing on disaster recovery and contingency planning',
    durationSeconds: 540,
    host1: 'Maya (Senior Security Architect)',
    host2: 'Liam (Lead Certification Tutor)',
    keyConceptsCovered: [
      'RPO vs RTO Timeline Distinction',
      'Maximum Tolerable Downtime (MTD)',
      'Work Recovery Time (WRT) verification'
    ],
    turns: [
      { speaker: 'Liam (Lead Certification Tutor)', text: "In this audio briefing, we're dissecting Business Impact Analysis metrics. RTO and RPO are always tested, but questions love to mix in WRT and MTD. How do we draw this timeline in our minds?", timeSeconds: 0 },
      { speaker: 'Maya (Senior Security Architect)', text: "Picture a timeline of a disaster. The disaster strikes at 12:00 PM. RPO looks BACKWARD: how many hours of transactions are lost since the last backup? That's data loss.", timeSeconds: 11 },
      { speaker: 'Liam (Lead Certification Tutor)', text: "So RPO is strictly about data loss delta, not server downtime duration.", timeSeconds: 23 },
      { speaker: 'Maya (Senior Security Architect)', text: "Exactly! Now, looking forward from the disaster: RTO is the time to restore the server hardware and OS. But you can't open for business yet until you test the database and replay transactions—that second phase is WRT, Work Recovery Time.", timeSeconds: 31 },
      { speaker: 'Maya (Senior Security Architect)', text: "And RTO plus WRT equals MTD, Maximum Tolerable Downtime. If your recovery exceeds MTD, the organization fails permanently.", timeSeconds: 46 },
      { speaker: 'Liam (Lead Certification Tutor)', text: "That simple formula: RTO + WRT = MTD is pure exam gold. Thanks Maya!", timeSeconds: 57 }
    ]
  }
];

export const FLASHCARD_DECK: Flashcard[] = [
  {
    id: 'fc_1',
    examId: 'cissp',
    domainId: 'd1',
    domainName: 'Security & Risk Management',
    frontPrompt: 'What is the mathematical relationship between MTD, RTO, and WRT?',
    backAnswer: 'MTD = RTO + WRT\n\nMaximum Tolerable Downtime is the sum of Recovery Time Objective (bringing systems back online) and Work Recovery Time (verifying integrity and replaying data).',
    keyFormulaOrRule: 'MTD = RTO + WRT',
    sourceCitation: 'NIST SP 800-34 Contingency Planning §3.2',
    boxLevel: 1,
    status: 'UNREVIEWED'
  },
  {
    id: 'fc_2',
    examId: 'cissp',
    domainId: 'd3',
    domainName: 'Security Architecture',
    frontPrompt: 'What does the *-Property (Star Property) enforce in the Bell-LaPadula Model?',
    backAnswer: 'NO WRITE-DOWN (Confinement Property).\n\nA subject at a higher security classification level cannot write information to an object at a lower classification level, preventing confidential leaks.',
    keyFormulaOrRule: 'Bell-LaPadula: * = No Write-Down',
    sourceCitation: 'Bell-LaPadula Formal Model Technical Report',
    boxLevel: 1,
    status: 'UNREVIEWED'
  },
  {
    id: 'fc_3',
    examId: 'cissp',
    domainId: 'd7',
    domainName: 'Security Operations',
    frontPrompt: 'List the Order of Volatility for digital forensics from highest to lowest priority.',
    backAnswer: '1. CPU registers & cache\n2. Routing tables, ARP cache, process table, kernel stats, RAM\n3. Temporary file systems\n4. Disk & non-volatile media\n5. Remote logging data\n6. Physical topology & archival media',
    keyFormulaOrRule: 'RFC 3227 Volatility Order',
    sourceCitation: 'RFC 3227 Guidelines for Evidence Collection §2.1',
    boxLevel: 2,
    status: 'KNOWN'
  },
  {
    id: 'fc_4',
    examId: 'cissp',
    domainId: 'd5',
    domainName: 'Identity and Access Management',
    frontPrompt: 'What is the fundamental difference between OAuth 2.0 and OpenID Connect (OIDC)?',
    backAnswer: 'OAuth 2.0 is strictly for AUTHORIZATION (issuing access tokens to resources).\n\nOpenID Connect (OIDC) is an identity layer built ON TOP of OAuth 2.0 that provides AUTHENTICATION (issuing ID tokens in JWT format).',
    keyFormulaOrRule: 'OIDC = AuthN (Who you are) | OAuth 2.0 = AuthZ (What you can access)',
    sourceCitation: 'OpenID Connect Core 1.0 Spec',
    boxLevel: 1,
    status: 'UNREVIEWED'
  },
  {
    id: 'fc_5',
    examId: 'cissp',
    domainId: 'd4',
    domainName: 'Communication & Network Security',
    frontPrompt: 'Does IPsec Authentication Header (AH) provide payload encryption?',
    backAnswer: 'NO. AH provides data origin authentication, data integrity, and anti-replay protection, but NO CONFIDENTIALITY (no payload encryption). Use ESP for encryption.',
    keyFormulaOrRule: 'AH = Integrity Only | ESP = Integrity + Encryption',
    sourceCitation: 'RFC 4302 (AH) & RFC 4303 (ESP)',
    boxLevel: 2,
    status: 'KNOWN'
  },
  {
    id: 'fc_6',
    examId: 'cissp',
    domainId: 'd3',
    domainName: 'Security Architecture',
    frontPrompt: 'What are the two core integrity axioms of the Biba Model?',
    backAnswer: '1. Simple Integrity Axiom: No Read-Down (subject cannot read lower integrity data).\n2. *-Integrity Axiom: No Write-Up (subject cannot write to higher integrity objects).',
    keyFormulaOrRule: 'Biba: Simple = No Read-Down | * = No Write-Up',
    sourceCitation: 'Biba Integrity Architecture Technical Spec',
    boxLevel: 1,
    status: 'NEEDS_REVIEW'
  },
  {
    id: 'fc_7',
    examId: 'cissp',
    domainId: 'd7',
    domainName: 'Security Operations',
    frontPrompt: 'What are the 4 main phases of the NIST SP 800-61 Incident Handling Lifecycle?',
    backAnswer: '1. Preparation\n2. Detection & Analysis\n3. Containment, Eradication, and Recovery\n4. Post-Incident Activity (Lessons Learned within 2 weeks)',
    keyFormulaOrRule: 'Prep -> Detect -> Contain/Eradicate/Recover -> Post-Incident',
    sourceCitation: 'NIST SP 800-61 Rev. 2 §2.3',
    boxLevel: 3,
    status: 'KNOWN'
  }
];
