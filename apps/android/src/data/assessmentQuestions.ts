import { Question } from '../types';

export const ASSESSMENT_10_QUESTIONS: Question[] = [
  {
    id: 'assess_q1',
    examId: 'cissp',
    domainId: 'd1',
    domainName: 'Security and Risk Management',
    questionText: 'Under GDPR and modern data protection frameworks, which entity determines the *purposes and means* of the processing of personal data, and bears primary legal liability?',
    options: [
      'Data Processor',
      'Data Controller',
      'Data Protection Officer (DPO)',
      'Supervisory Authority'
    ],
    correctIndex: 1,
    explanation: 'The Data Controller is the natural or legal person, public authority, agency, or other body which, alone or jointly with others, determines the purposes and means of the processing of personal data. The Processor merely acts on behalf of the Controller.',
    optionAnalysis: {
      0: 'Data Processors act under the instruction of the Controller.',
      1: 'CORRECT. The Data Controller determines the reasons and methods of processing.',
      2: 'The DPO is an advisory role monitoring compliance.',
      3: 'The Supervisory Authority is the regulatory enforcement body.'
    },
    citation: {
      title: 'EU GDPR Regulation 2016/679',
      sectionOrPage: 'Article 4(7): Definitions of Controller & Processor',
      standardOrFramework: 'GDPR Privacy Standard'
    },
    difficulty: 'EASY'
  },
  {
    id: 'assess_q2',
    examId: 'cissp',
    domainId: 'd2',
    domainName: 'Asset Security',
    questionText: 'In modern information classification hierarchies, what is the primary factor that should determine an asset\'s classification level?',
    options: [
      'The monetary cost to acquire the server hardware hosting the data',
      'The business impact of unauthorized disclosure, alteration, or destruction (CIA Triad)',
      'The file size and storage footprint on high-speed NVMe storage',
      'The technical complexity of the encryption algorithm protecting the files'
    ],
    correctIndex: 1,
    explanation: 'Classification must always be based on the negative impact to the organization (or individuals) if the confidentiality, integrity, or availability of the asset were compromised.',
    optionAnalysis: {
      0: 'Hardware acquisition cost does not reflect the value or sensitivity of the data residing on it.',
      1: 'CORRECT. Business impact on Confidentiality, Integrity, and Availability dictates sensitivity classification.',
      2: 'File size has zero correlation with sensitivity.',
      3: 'Encryption complexity is a control, not a classification basis.'
    },
    citation: {
      title: 'FIPS PUB 199: Standards for Security Categorization',
      sectionOrPage: 'Section 3: Categorization Impact Mapping',
      standardOrFramework: 'FIPS 199 Categorization'
    },
    difficulty: 'EASY'
  },
  {
    id: 'assess_q3',
    examId: 'cissp',
    domainId: 'd3',
    domainName: 'Security Architecture and Engineering',
    questionText: 'A security engineer is evaluating symmetric encryption modes for disk storage. Which block cipher mode provides authenticated encryption with associated data (AEAD) in hardware-accelerated environments?',
    options: [
      'Cipher Block Chaining (CBC)',
      'Electronic Codebook (ECB)',
      'Galois/Counter Mode (GCM)',
      'Output Feedback (OFB)'
    ],
    correctIndex: 2,
    explanation: 'Galois/Counter Mode (GCM) is an AEAD mode that provides both confidentiality and data origin authentication/integrity simultaneously using a universal hash function over a Galois field, offering high parallel performance.',
    optionAnalysis: {
      0: 'CBC requires sequential processing and needs a separate MAC for integrity (vulnerable to padding oracles).',
      1: 'ECB leaks plaintext patterns (e.g. ECB Tux penguin) and does not provide authentication.',
      2: 'CORRECT. AES-GCM provides high-throughput AEAD with hardware pipelining.',
      3: 'OFB turns a block cipher into a synchronous stream cipher without built-in authentication.'
    },
    citation: {
      title: 'NIST SP 800-38D: Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM)',
      sectionOrPage: 'Section 5: Underlying Cryptographic Primitives',
      standardOrFramework: 'NIST Cryptography Standard'
    },
    difficulty: 'MEDIUM'
  },
  {
    id: 'assess_q4',
    examId: 'cissp',
    domainId: 'd4',
    domainName: 'Communication and Network Security',
    questionText: 'Which protocol improvement in Transport Layer Security (TLS) 1.3 provides Perfect Forward Secrecy (PFS) by mandating ephemeral key exchange and entirely removing static RSA key transport?',
    options: [
      'Diffie-Hellman Ephemeral (DHE) or Elliptic Curve DHE (ECDHE)',
      'Static RSA Key Exchange',
      'RC4 Stream Cipher Exchange',
      'MD5 Message Authentication'
    ],
    correctIndex: 0,
    explanation: 'TLS 1.3 completely deprecated static RSA handshake and legacy ciphers. All key exchange algorithms in TLS 1.3 mandate ephemeral Diffie-Hellman (ECDHE/DHE), guaranteeing Perfect Forward Secrecy so future compromise of the server private key cannot decrypt past traffic.',
    optionAnalysis: {
      0: 'CORRECT. TLS 1.3 strictly permits only ephemeral DH/ECDH for key establishment.',
      1: 'Static RSA lacks forward secrecy and was permanently removed in TLS 1.3.',
      2: 'RC4 has severe cryptographic biases and was prohibited by RFC 7465.',
      3: 'MD5 is broken by collision attacks and banned in modern TLS.'
    },
    citation: {
      title: 'IETF RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3',
      sectionOrPage: 'Section 1.2: Major Differences from TLS 1.2',
      standardOrFramework: 'IETF TLS 1.3 Standard'
    },
    difficulty: 'MEDIUM'
  },
  {
    id: 'assess_q5',
    examId: 'cissp',
    domainId: 'd5',
    domainName: 'Identity and Access Management (IAM)',
    questionText: 'In Kerberos authentication, what credential does the Key Distribution Center (KDC) Authentication Service (AS) issue to the client after successfully validating the user password hash?',
    options: [
      'Service Ticket (ST)',
      'Ticket Granting Ticket (TGT)',
      'SAML Bearer Assertion',
      'X.509 Certificate Revocation List'
    ],
    correctIndex: 1,
    explanation: 'Upon authenticating the user with the pre-authentication timestamp, the Kerberos AS issues a Ticket Granting Ticket (TGT) encrypted with the KDC secret key, plus a session key. The user then presents this TGT to the Ticket Granting Server (TGS) to request Service Tickets.',
    optionAnalysis: {
      0: 'Service Tickets are issued later by the TGS, not directly by the initial AS authentication step.',
      1: 'CORRECT. The AS issues the TGT, which the client uses to request individual service tickets without re-entering credentials.',
      2: 'SAML is a web federation assertion protocol, not Kerberos.',
      3: 'CRLs are PKI revocation lists, not Kerberos authentication tokens.'
    },
    citation: {
      title: 'IETF RFC 4120: The Kerberos Network Authentication Service (V5)',
      sectionOrPage: 'Section 3.1: The Authentication Service Exchange',
      standardOrFramework: 'Kerberos V5 Standard'
    },
    difficulty: 'MEDIUM'
  },
  {
    id: 'assess_q6',
    examId: 'cissp',
    domainId: 'd6',
    domainName: 'Security Assessment and Testing',
    questionText: 'What is the key differentiator between Static Application Security Testing (SAST) and Dynamic Application Security Testing (DAST)?',
    options: [
      'SAST requires source code and analyzes execution state without compiling, whereas DAST operates in a black-box running state from the outside',
      'DAST is conducted only during architectural planning, whereas SAST requires deployment in production',
      'SAST detects network firewall misconfigurations, whereas DAST detects database physical hardware faults',
      'There is no difference; SAST and DAST are identical testing methodologies'
    ],
    correctIndex: 0,
    explanation: 'SAST (white-box) inspects source code or bytecode statically without executing the program. DAST (black-box) tests the application in its running runtime state from the external interface without access to internal source code.',
    optionAnalysis: {
      0: 'CORRECT. SAST analyzes code syntax trees statically; DAST attacks running endpoints dynamically.',
      1: 'Inverted. SAST is done during coding/CI; DAST is executed against running staging/test environments.',
      2: 'Both are software application security testing disciplines.',
      3: 'They use fundamentally different testing methodologies.'
    },
    citation: {
      title: 'NIST SP 800-115: Technical Guide to Information Security Testing and Assessment',
      sectionOrPage: 'Section 4: Software Security Testing (SAST vs DAST)',
      standardOrFramework: 'NIST Assessment Framework'
    },
    difficulty: 'EASY'
  },
  {
    id: 'assess_q7',
    examId: 'cissp',
    domainId: 'd7',
    domainName: 'Security Operations',
    questionText: 'An attacker uses an authorized user\'s stolen active session token to trigger fund transfers on an online banking portal by tricking the user into clicking a disguised image link on a malicious third-party forum. What type of web attack is this?',
    options: [
      'Cross-Site Scripting (XSS)',
      'Cross-Site Request Forgery (CSRF)',
      'Server-Side Request Forgery (SSRF)',
      'SQL Injection (SQLi)'
    ],
    correctIndex: 1,
    explanation: 'CSRF (Cross-Site Request Forgery) tricks a victim\'s browser into executing unwanted actions on an application where the user is currently authenticated. Modern mitigation includes SameSite cookie attributes and anti-CSRF synchronizer tokens.',
    optionAnalysis: {
      0: 'XSS executes malicious JavaScript inside the victim\'s browser context on the vulnerable site itself.',
      1: 'CORRECT. CSRF abuses existing browser credentials/cookies without stealing the session key directly.',
      2: 'SSRF abuses the backend server to make outbound HTTP requests to internal networks.',
      3: 'SQLi injects malicious queries into backend database parsers.'
    },
    citation: {
      title: 'OWASP Top 10 Application Security Risks',
      sectionOrPage: 'Cross-Site Request Forgery (CSRF) Prevention Cheat Sheet',
      standardOrFramework: 'OWASP Security Guide'
    },
    difficulty: 'MEDIUM'
  },
  {
    id: 'assess_q8',
    examId: 'cissp',
    domainId: 'd8',
    domainName: 'Software Development Security',
    questionText: 'In secure software engineering, which testing technique involves providing unexpected, malformed, or random inputs to a program interface to observe crash states, memory leaks, and buffer exceptions?',
    options: [
      'Regression Testing',
      'Fuzz Testing (Fuzzing)',
      'Code Review Walkthrough',
      'User Acceptance Testing (UAT)'
    ],
    correctIndex: 1,
    explanation: 'Fuzz testing (fuzzing) is an automated testing technique that generates invalid, unexpected, or random data inputs to reveal boundary condition crashes, memory leaks, assertion failures, and exploitable code defects.',
    optionAnalysis: {
      0: 'Regression testing ensures code updates did not break existing functional features.',
      1: 'CORRECT. Fuzzing generates mutated, pseudo-random malformed payloads to force boundary defects.',
      2: 'Code review is a manual peer inspection of code syntax.',
      3: 'UAT confirms business requirements are met from a user perspective.'
    },
    citation: {
      title: 'NIST SP 800-218: Secure Software Development Framework (SSDF)',
      sectionOrPage: 'Practice PW.8: Test Executable Code for Vulnerabilities (Fuzzing)',
      standardOrFramework: 'NIST SSDF Standard'
    },
    difficulty: 'EASY'
  },
  {
    id: 'assess_q9',
    examId: 'cissp',
    domainId: 'd1',
    domainName: 'Security and Risk Management',
    questionText: 'Which risk response strategy involves purchasing cyber insurance or drafting contractual indemnity clauses to shift the financial consequence of a breach to an external third party?',
    options: [
      'Risk Avoidance',
      'Risk Mitigation (Reduction)',
      'Risk Transference (Sharing)',
      'Risk Acceptance'
    ],
    correctIndex: 2,
    explanation: 'Risk transference (or sharing) shifts the financial or operational impact of a potential loss to a third party, typically via cyber insurance policies, warranty contracts, or outsourcing agreements.',
    optionAnalysis: {
      0: 'Risk avoidance means eliminating the activity entirely (e.g. canceling a high-risk product launch).',
      1: 'Risk mitigation applies controls (e.g. firewalls, MFA) to lower likelihood or severity.',
      2: 'CORRECT. Purchasing insurance or warranties is the textbook definition of risk transference.',
      3: 'Risk acceptance acknowledges the risk without allocating additional controls or insurance.'
    },
    citation: {
      title: 'ISO/IEC 27005: Information Security Risk Management',
      sectionOrPage: 'Section 9: Risk Treatment Options',
      standardOrFramework: 'ISO/IEC 27005 Risk Standard'
    },
    difficulty: 'EASY'
  },
  {
    id: 'assess_q10',
    examId: 'cissp',
    domainId: 'd3',
    domainName: 'Security Architecture and Engineering',
    questionText: 'Under the Zero Trust Architecture model outlined in NIST SP 800-207, which core tenet governs access to enterprise resources?',
    options: [
      'Implicit trust is granted once an endpoint passes perimeter 802.1X network access control',
      'No implicit trust is granted based solely on physical or network location; all requests are authenticated and authorized dynamically',
      'VPN tunnels establish a permanent trusted security perimeter for all connected devices',
      'Internal intranet subnets are assumed secure if protected by traditional stateful firewalls'
    ],
    correctIndex: 1,
    explanation: 'NIST SP 800-207 explicitly states that Zero Trust assumes there is no implicit trust granted to assets or user accounts based on their physical or network location (i.e. whether they are on the corporate intranet or external). All communication is secured regardless of network location, and access to individual resources is granted on a per-session basis.',
    optionAnalysis: {
      0: 'Zero trust completely rejects perimeter-based implicit trust.',
      1: 'CORRECT. "Never trust, always verify" dynamically evaluates identity, device posture, and context on every request.',
      2: 'VPN perimeter trust is the antithesis of Zero Trust.',
      3: 'Intranets are presumed hostile in Zero Trust architecture.'
    },
    citation: {
      title: 'NIST SP 800-207: Zero Trust Architecture',
      sectionOrPage: 'Section 2.1: Tenets of Zero Trust',
      standardOrFramework: 'NIST Zero Trust Standard'
    },
    difficulty: 'MEDIUM'
  }
];
