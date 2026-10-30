import { Flashcard, AudioBriefing, StudyGuide } from '../types/certmaster';

export const STUDY_GUIDES: StudyGuide[] = [
  {
    id: 'guide-blp-biba',
    domain: 'Security Architecture & Engineering',
    title: 'Formal Access Control Models: Bell-LaPadula vs. Biba Deep Dive',
    readTimeMin: 7,
    summary: 'Mathematical comparison between multi-level confidentiality lattices and integrity models.',
    content: [
      '# Bell-LaPadula Confidentiality vs. Biba Integrity\n\nWhen preparing for advanced cybersecurity certifications such as CISSP, CISM, and CASP+, understanding the dual nature of state machine models is paramount.',
      '### The Bell-LaPadula Model (Confidentiality)\nDeveloped by David Bell and Leonard LaPadula in 1973 for the United States Department of Defense, BLP focuses strictly on preventing unauthorized data disclosure.\n- **Simple Security Property (ss-property)**: A subject at a given security clearance cannot read an object at a higher classification level (**No Read Up**).\n- **Star Property (*-property)**: A subject cannot write data to an object at a lower classification level (**No Write Down**). This prevents a high-clearance user from accidentally or maliciously leaking classified intelligence to lower channels.\n- **Strong Star Property**: A subject may only write to objects at the exact same classification level.',
      '### The Biba Model (Integrity)\nDeveloped by Kenneth J. Biba in 1977, this model addresses data modification and contamination rather than confidentiality.\n- **Simple Integrity Axiom**: A subject cannot read an object of lower integrity (**No Read Down**), preventing untrusted data from contaminating a high-integrity process.\n- **Star Integrity Axiom (*-integrity)**: A subject cannot write data to an object of higher integrity (**No Write Up**), preventing untrusted subjects from tampering with critical systems.',
      '### Summary Table for Exam Day\n- **Bell-LaPadula**: Focus = Confidentiality | Rule 1: No Read Up | Rule 2: No Write Down\n- **Biba**: Focus = Integrity | Rule 1: No Read Down | Rule 2: No Write Up\n- **Clark-Wilson**: Focus = Commercial Integrity via Well-Formed Transactions & Separation of Duties\n- **Brewer-Nash**: Focus = Dynamic Conflicts of Interest (The Chinese Wall)',
    ],
    officialReference: 'NIST SP 800-53 Rev 5 / (ISC)² CBK Domain 3',
    keyTakeaways: [
      'Bell-LaPadula = Confidentiality (No Read Up, No Write Down)',
      'Biba = Integrity (No Read Down, No Write Up)',
      'Clark-Wilson uses Transformation Procedures (TPs) and Constrained Data Items (CDIs)',
      'Brewer-Nash adjusts permissions dynamically based on user session history',
    ],
  },
  {
    id: 'guide-kerberos',
    domain: 'Communication & Network Security',
    domainNumber: 4,
    title: 'Kerberos 5 Protocol Architecture & Attack Vectors (Kerberoasting / Golden Ticket)',
    readTimeMin: 9,
    summary: 'Detailed step-by-step breakdown of KDC ticket granting, AS-REQ, TGS, and enterprise mitigations.',
    content: [
      '# Kerberos 5 Architecture & Defenses\n\nKerberos is a ticket-based symmetric authentication protocol operating over UDP/TCP port 88. Understanding the 3-headed protocol flow is a frequent source of scenario questions.',
      '### Core Components\n1. **KDC (Key Distribution Center)**: Hosts the Authentication Server (AS) and Ticket Granting Server (TGS).\n2. **TGT (Ticket Granting Ticket)**: Encrypted with the KRBTGT secret key.\n3. **Service Ticket (ST/TGS)**: Encrypted with the target service account secret key.',
      '### The 6-Step Authentication Flow\n1. **AS-REQ**: Client sends username + timestamp encrypted with client password hash (Pre-Authentication).\n2. **AS-REP**: KDC validates timestamp, returns TGT encrypted with KRBTGT key + Client/TGS session key.\n3. **TGS-REQ**: Client forwards TGT + Authenticator requesting access to a Service Principal Name (SPN).\n4. **TGS-REP**: KDC decrypts TGT, returns Service Ticket encrypted with service account password hash.\n5. **AP-REQ**: Client presents Service Ticket to target application server.\n6. **AP-REP**: Application server verifies ticket and authenticates user mutual handshake.',
      '### Vulnerabilities & Countermeasures\n- **Kerberoasting**: Any domain user requests a TGS ticket for an SPN, takes ticket offline to crack the service account NTLM hash. *Mitigation*: Group Managed Service Accounts (gMSA) with high-entropy 128-char passwords.\n- **Golden Ticket**: Attacker compromises KRBTGT hash and generates arbitrary forged TGTs with 10-year expiration. *Mitigation*: Rotate KRBTGT password twice, 24 hours apart.',
    ],
    officialReference: 'RFC 4120 / NIST SP 800-63B Digital Identity Guidelines',
    keyTakeaways: [
      'KRBTGT compromise enables Golden Ticket attacks (TGT forgery)',
      'Service account NTLM compromise enables Silver Ticket attacks (Service Ticket forgery)',
      'Kerberoasting is thwarted by migrating service accounts to gMSAs',
      'Kerberos pre-authentication prevents offline AS-REP roasting',
    ],
  },
  {
    id: 'guide-zero-trust',
    domain: 'Security Architecture & Engineering',
    title: 'NIST SP 800-207 Zero Trust Architecture Framework',
    readTimeMin: 8,
    summary: 'The 7 Tenets of Zero Trust, Policy Engine (PE), Policy Administrator (PA), and Policy Enforcement Point (PEP).',
    content: [
      '# NIST SP 800-207 Zero Trust Principles\n\nTraditional perimeter defense ("castle and moat") assumes everything inside the network boundary is trusted. Zero Trust removes implicit trust and evaluates all resource requests continuously.',
      '### The Seven Tenets of Zero Trust\n1. All data sources and computing services are considered resources.\n2. All communication is secured regardless of network location.\n3. Access to individual enterprise resources is granted on a per-session basis.\n4. Access to resources is determined by dynamic policy (client identity, application, device health).\n5. Enterprise monitors and measures the integrity and security posture of all owned and associated assets.\n6. All resource authentication and authorization are dynamic and strictly enforced before access is allowed.\n7. Enterprise collects as much information as possible about the current state of assets, network infrastructure, and communications to improve security posture.',
      '### Architectural Components\n- **Policy Decision Point (PDP)**: Made up of the Policy Engine (brain calculating trust) and Policy Administrator (issues credentials/tokens).\n- **Policy Enforcement Point (PEP)**: Gateway, proxy, or agent that intercepts and terminates connections until authorized by the PDP.',
    ],
    officialReference: 'NIST Special Publication 800-207',
    keyTakeaways: [
      'Never trust, always verify',
      'Assume breach at all network layers',
      'Least privilege access granted dynamically per-session',
      'Continuous telemetry feeds PDP (Policy Decision Point)',
    ],
  },
  {
    id: 'guide-incident-response',
    domain: 'Security Operations',
    title: 'NIST SP 800-61 Rev 2 Incident Handling Lifecycle',
    readTimeMin: 6,
    summary: 'Comprehensive 4-step incident handling lifecycle and digital evidence order of volatility.',
    content: [
      '# Incident Handling & Order of Volatility\n\nManaging security incidents efficiently requires disciplined execution following standardized playbooks.',
      '### The 4 NIST Phases\n1. **Preparation**: Hardening infrastructure, establishing playbooks, assembling IR toolkits, configuring SIEM alerts.\n2. **Detection & Analysis**: Correlating IOCs, triaging alerts, determining attack scope, baseline anomalies.\n3. **Containment, Eradication & Recovery**: Isolating network segments, preserving volatile memory, wiping malware/backdoors, restoring from known-clean golden images.\n4. **Post-Incident Activity (Lessons Learned)**: Root-cause retrospective, updating threat intelligence, modifying policies.',
      '### Digital Evidence RFC 3227 Order of Volatility\nMemory disappears in order of hardware stability:\n1. CPU Registers and Cache\n2. Routing Tables, ARP cache, Kernel process table\n3. Main Memory (RAM)\n4. Temporary Filesystem (Swap/Pagefile)\n5. Disk Storage\n6. Remote Logs / Network flow dumps\n7. Archival Tapes & Physical Backups',
    ],
    officialReference: 'NIST SP 800-61 Rev 2 / RFC 3227',
    keyTakeaways: [
      'Containment occurs before eradication to avoid evidence destruction',
      'Volatile memory (RAM) must be imaged before pulling physical power cords',
      'Lessons learned meetings should conclude within 2 weeks of recovery',
      'Evidence chain of custody must log date, handler, location, and SHA-256 hash',
    ],
  },
];

export const AUDIO_BRIEFINGS: AudioBriefing[] = [
  {
    id: 'briefing-cissp-01',
    title: 'Mastering Domain 3: Bell-LaPadula vs. Biba on the Real Exam',
    domain: 'Security Architecture & Engineering',
    durationFormatted: '4:15',
    durationSeconds: 255,
    dialogue: [
      {
        speaker: 'Maya',
        timestampSec: 0,
        text: 'Welcome back to the CertMaster Audio Briefing. I\'m Maya, Chief Security Strategist. Today, Liam and I are tackling one of the most frequently missed question types on the CISSP and CISM exams: formal security models.',
      },
      {
        speaker: 'Liam',
        timestampSec: 15,
        text: 'Thanks Maya. Candidates constantly confuse Bell-LaPadula with Biba because they both use lattice structures and the famous star property. But their goals are completely polar opposites.',
      },
      {
        speaker: 'Maya',
        timestampSec: 28,
        text: 'Exactly, Liam. The memory anchor you want to write down immediately on your exam scratch pad is: Bell-LaPadula is for Confidentiality, Biba is for Integrity. Think of the letter B in Biba standing for Bad integrity if you read down.',
      },
      {
        speaker: 'Liam',
        timestampSec: 46,
        text: 'Let\'s break that down with a scenario. In Bell-LaPadula, why do we have the star property, which is No Write Down? If a Colonel has Top Secret clearance, why can\'t he write an email down to an unclassified inbox?',
      },
      {
        speaker: 'Maya',
        timestampSec: 62,
        text: 'Because if he writes down, he could accidentally or intentionally copy Top Secret intel into a public bulletin. The Simple Security Property says No Read Up. The Star Property says No Write Down. Both protect confidentiality.',
      },
      {
        speaker: 'Liam',
        timestampSec: 81,
        text: 'Now flip to Biba. Biba cares about integrity, meaning data trustworthiness. In Biba, the star property is inverted: it is No Write Up. An intern cannot write code up into the production financial ledger.',
      },
      {
        speaker: 'Maya',
        timestampSec: 101,
        text: 'And Biba\'s simple property is No Read Down: a high-integrity medical algorithm cannot ingest unverified public message board data, or else its calculations become tainted. Simple as that!',
      },
      {
        speaker: 'Liam',
        timestampSec: 120,
        text: 'What about Clark-Wilson? When you see questions about commercial banking or accounting systems with separation of duties and well-formed transactions, what should candidates immediately look for?',
      },
      {
        speaker: 'Maya',
        timestampSec: 137,
        text: 'Look for Transformation Procedures (TPs) acting on Constrained Data Items (CDIs). Clark-Wilson ensures that users can only modify data through audited, well-formed programs, preventing authorized users from making fraudulent changes.',
      },
      {
        speaker: 'Liam',
        timestampSec: 158,
        text: 'And finally, Brewer-Nash, also called the Chinese Wall model. Remember that Brewer-Nash is dynamic: your permissions change based on which client portfolio you accessed during that exact active work session.',
      },
      {
        speaker: 'Maya',
        timestampSec: 178,
        text: 'Keep these principles locked in, use your distractor elimination shortcuts, and you\'ll cruise through Domain 3 questions. Let\'s get back to practice questions!',
      },
    ],
  },
  {
    id: 'briefing-cissp-02',
    title: 'Kerberos 5 Under Attack: TGTs, Kerberoasting & Golden Tickets',
    domain: 'Communication & Network Security',
    durationFormatted: '3:50',
    durationSeconds: 230,
    dialogue: [
      {
        speaker: 'Liam',
        timestampSec: 0,
        text: 'Hey everyone, Liam here with Maya. Today we\'re demystifying Kerberos authentication tickets and how modern threat actors exploit them during Red Team engagements.',
      },
      {
        speaker: 'Maya',
        timestampSec: 14,
        text: 'Liam, in almost every enterprise scenario question, exam makers test whether candidates know the difference between the Authentication Server, the Ticket Granting Server, and the target Service.',
      },
      {
        speaker: 'Liam',
        timestampSec: 29,
        text: 'Right. Remember: step one is AS-REQ. The user encrypts a timestamp with their password hash. Step two is AS-REP, where the KDC sends back the TGT, encrypted with the KRBTGT account secret key.',
      },
      {
        speaker: 'Maya',
        timestampSec: 48,
        text: 'And that brings us to the infamous Golden Ticket. If an adversary dumps the KRBTGT hash from a domain controller, what can they do?',
      },
      {
        speaker: 'Liam',
        timestampSec: 60,
        text: 'They can mint their own arbitrary TGTs with enterprise administrator privileges for 10 years! And to remediate a Golden Ticket attack, you must rotate the KRBTGT password twice, 24 hours apart.',
      },
      {
        speaker: 'Maya',
        timestampSec: 80,
        text: 'Now what about Kerberoasting? Why is that so popular with attackers right now?',
      },
      {
        speaker: 'Liam',
        timestampSec: 91,
        text: 'Because any normal authenticated domain user can legitimately ask the KDC for a service ticket to any registered SPN. That ticket is encrypted with the service account\'s password. Attackers pull that ticket offline and run GPU brute-force dictionary attacks without generating network noise.',
      },
      {
        speaker: 'Maya',
        timestampSec: 114,
        text: 'And the definitive enterprise mitigation? Group Managed Service Accounts (gMSAs), because Active Directory automatically generates complex 128-character passwords and rotates them on schedule.',
      },
      {
        speaker: 'Liam',
        timestampSec: 132,
        text: 'Master these distinctions, and you\'ll pick up easy points on both the CISSP and Security+ exams!',
      },
    ],
  },
];

export const FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    domain: 'Security Architecture & Engineering',
    front: 'What is the Bell-LaPadula *-Property (Star Property), and what is its objective?',
    back: 'No Write Down. A subject at a higher classification level cannot write data down into an object at a lower classification level. Its objective is to preserve Confidentiality.',
    reference: 'CISSP CBK 6th Ed. Chapter 7',
    state: 'known',
  },
  {
    id: 'fc-2',
    domain: 'Security Architecture & Engineering',
    front: 'What is the Biba Simple Integrity Axiom, and what does it prevent?',
    back: 'No Read Down. A subject cannot read data of lower integrity than its own clearance. This prevents high-integrity processes from being contaminated by untrusted data.',
    reference: 'Biba Integrity Model / NIST SP 800-53',
    state: 'unstudied',
  },
  {
    id: 'fc-3',
    domain: 'Security & Risk Management',
    front: 'How is Annualized Loss Expectancy (ALE) calculated mathematically?',
    back: 'ALE = SLE × ARO\nWhere SLE (Single Loss Expectancy) = Asset Value (AV) × Exposure Factor (EF), and ARO is the Annualized Rate of Occurrence.',
    reference: '(ISC)² Quantitative Risk Standard',
    state: 'known',
  },
  {
    id: 'fc-4',
    domain: 'Identity & Access Management (IAM)',
    front: 'What is the key architectural difference between OAuth 2.0 and OpenID Connect (OIDC)?',
    back: 'OAuth 2.0 is an Authorization framework that issues access tokens for API delegation. OpenID Connect (OIDC) is an Authentication identity layer built on top of OAuth 2.0 that issues verifiable ID Tokens (JWTs).',
    reference: 'OIDC Core 1.0 Spec / RFC 6749',
    state: 'unstudied',
  },
  {
    id: 'fc-5',
    domain: 'Communication & Network Security',
    front: 'What is the primary difference between IPsec Transport Mode and Tunnel Mode?',
    back: 'Transport Mode only encrypts the IP payload, keeping original IP packet headers visible (host-to-host). Tunnel Mode encrypts the entire original IP packet (payload + headers) inside a new IP header (gateway-to-gateway VPN).',
    reference: 'RFC 4301 IPsec Architecture',
    state: 'needs_review',
  },
  {
    id: 'fc-6',
    domain: 'Security Operations',
    front: 'What is the first step in the RFC 3227 Order of Volatility during digital evidence collection?',
    back: 'CPU registers and processor cache, followed by routing tables, ARP cache, kernel process tables, and main system memory (RAM).',
    reference: 'IETF RFC 3227 & NIST SP 800-86',
    state: 'needs_review',
  },
  {
    id: 'fc-7',
    domain: 'Asset Security',
    front: 'Why does degaussing fail to sanitize Solid State Drives (SSDs)?',
    back: 'Degaussing disrupts magnetic domains on magnetic media (tapes/HDDs). SSDs use semiconductor silicon flash memory cells (NAND flash), which are impervious to magnetic degaussers.',
    reference: 'NIST SP 800-88 Rev 1 Guidelines',
    state: 'known',
  },
  {
    id: 'fc-8',
    domain: 'Software Development Security',
    front: 'What is a Time-of-Check to Time-of-Use (TOCTOU) vulnerability?',
    back: 'A concurrency race condition where an application verifies permissions or state at time T1, but an attacker alters the underlying resource before execution at time T2 without atomic lock synchronization.',
    reference: 'MITRE CWE-367',
    state: 'unstudied',
  },
];
