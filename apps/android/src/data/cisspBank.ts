import { Question } from '../types';

export const CISSP_EXAM_QUESTIONS: Question[] = [
  {
    id: 'cissp_q1',
    examId: 'cissp',
    domainId: 'd1',
    domainName: 'Security and Risk Management',
    questionText: 'An enterprise healthcare provider has suffered an operational ransomware incident rendering patient records inaccessible. The CISO is evaluating enterprise survivability. Which metric specifies the maximum acceptable period of data loss measured in time prior to the disruption?',
    options: [
      'Maximum Tolerable Downtime (MTD)',
      'Recovery Point Objective (RPO)',
      'Recovery Time Objective (RTO)',
      'Work Recovery Time (WRT)'
    ],
    correctIndex: 1,
    explanation: 'Recovery Point Objective (RPO) dictates the acceptable amount of data loss expressed in time (e.g. 4 hours of transaction logs). It determines how frequently backups, snapshots, and database replications must occur.',
    optionAnalysis: {
      0: 'MTD is the overarching maximum time the business can survive without the system before catastrophic failure.',
      1: 'CORRECT. RPO measures data loss tolerance backward from the moment of disruption.',
      2: 'RTO is the target duration within which technical systems and servers must be restored after a disaster.',
      3: 'WRT is the time needed after technical restoration to test data integrity, replay logs, and verify operations.'
    },
    citation: {
      title: 'NIST SP 800-34 Rev. 1: Contingency Planning Guide for Federal Information Systems',
      sectionOrPage: 'Section 3.2: Business Impact Analysis (BIA) Metrics',
      standardOrFramework: 'NIST BIA Framework'
    },
    difficulty: 'MEDIUM'
  },
  {
    id: 'cissp_q2',
    examId: 'cissp',
    domainId: 'd3',
    domainName: 'Security Architecture and Engineering',
    questionText: 'In a multi-level secure operating system designed according to formal access control models, which mathematical model enforces the *no write-down* (*-property) and *no read-up* (Simple Security Property) to guarantee confidentiality?',
    options: [
      'Biba Integrity Model',
      'Clark-Wilson Commercial Model',
      'Bell-LaPadula Confidentiality Model',
      'Brewer-Nash (Chinese Wall) Conflict Model'
    ],
    correctIndex: 2,
    explanation: 'The Bell-LaPadula model is a formal state machine confidentiality model. It enforces the Simple Security Property (no read-up: a subject at a lower classification cannot read higher classification objects) and the *-Property (no write-down: a subject at a higher classification cannot write to lower classification objects).',
    optionAnalysis: {
      0: 'Biba enforces data integrity, using inverted rules: no read-down and no write-up.',
      1: 'Clark-Wilson focuses on commercial integrity through well-formed transactions and separation of duties.',
      2: 'CORRECT. Bell-LaPadula strictly prevents unauthorized confidentiality leaks via *-property and simple security.',
      3: 'Brewer-Nash dynamically mitigates conflicts of interest in consulting and financial services.'
    },
    citation: {
      title: '(ISC)² CISSP Official Study Guide 9th Edition',
      sectionOrPage: 'Chapter 7: Formal Security Models & Cryptography',
      standardOrFramework: 'Bell-LaPadula Confidentiality Model'
    },
    difficulty: 'HARD'
  },
  {
    id: 'cissp_q3',
    examId: 'cissp',
    domainId: 'd5',
    domainName: 'Identity and Access Management (IAM)',
    questionText: 'A modern cloud-native SaaS application requires delegated user authentication and API authorization. Which protocol stack correctly separates the identity assertion layer (user profile ID tokens in JWT format) from the API authorization token grant mechanism?',
    options: [
      'SAML 2.0 Web Browser SSO profile',
      'OpenID Connect (OIDC) over OAuth 2.0',
      'Kerberos V5 Ticket Granting Service (TGS)',
      'RADIUS RFC 2865 with EAP-TLS'
    ],
    correctIndex: 1,
    explanation: 'OAuth 2.0 is strictly an authorization framework (issuing access tokens). OpenID Connect (OIDC) is an identity layer built on top of OAuth 2.0 that provides authentication by issuing signed JSON Web Tokens (id_tokens) containing claims about the user.',
    optionAnalysis: {
      0: 'SAML 2.0 is XML-heavy and primarily intended for legacy enterprise federated web browser SSO, not mobile REST API scopes.',
      1: 'CORRECT. OIDC provides AuthN (ID token) while underlying OAuth 2.0 provides AuthZ (Access token).',
      2: 'Kerberos is an intranet symmetric key ticket-granting mechanism, not suited for decoupled internet REST services.',
      3: 'RADIUS is an AAA protocol designed for network access switches and VPN concentrators.'
    },
    citation: {
      title: 'OpenID Connect Core 1.0 incorporating errata set 1',
      sectionOrPage: 'Section 1.3: Overview of OpenID Connect Profile',
      standardOrFramework: 'OIDC / IETF OAuth 2.0'
    },
    difficulty: 'MEDIUM'
  },
  {
    id: 'cissp_q4',
    examId: 'cissp',
    domainId: 'd4',
    domainName: 'Communication and Network Security',
    questionText: 'An enterprise security architect is specifying cryptographic requirements for site-to-site IPsec tunnels. Management requires both origin authentication and protection against wiretapping / payload eavesdropping. Which IPsec protocol header and mode combination MUST be selected?',
    options: [
      'Authentication Header (AH) in Transport Mode',
      'Encapsulating Security Payload (ESP) with NULL encryption in Tunnel Mode',
      'Encapsulating Security Payload (ESP) with encryption enabled in Tunnel Mode',
      'Authentication Header (AH) paired with Generic Routing Encapsulation (GRE) plaintext'
    ],
    correctIndex: 2,
    explanation: 'Authentication Header (AH) does NOT provide confidentiality (no encryption). Encapsulating Security Payload (ESP) provides both confidentiality (symmetric cipher encryption) and integrity/authentication. Tunnel mode encrypts the entire original IP packet and adds a new IP header, which is standard for site-to-site gateways.',
    optionAnalysis: {
      0: 'AH provides integrity and anti-replay, but completely lacks payload confidentiality.',
      1: 'ESP with NULL encryption explicitly disables encryption, violating the confidentiality requirement.',
      2: 'CORRECT. ESP with cipher suites (e.g. AES-256-GCM) in Tunnel Mode provides end-to-end payload encryption and origin authentication across untrusted transit paths.',
      3: 'GRE by itself provides zero security or encryption.'
    },
    citation: {
      title: 'IETF RFC 4303: IP Encapsulating Security Payload (ESP)',
      sectionOrPage: 'Section 2: Encapsulation Modes and Security Association',
      standardOrFramework: 'IETF IPsec Standard'
    },
    difficulty: 'MEDIUM'
  },
  {
    id: 'cissp_q5',
    examId: 'cissp',
    domainId: 'd7',
    domainName: 'Security Operations',
    questionText: 'During a live digital forensics triage on a compromised server suspected of running an in-memory fileless malware beacon, a forensics investigator arrives on the scene. According to RFC 3227 Order of Volatility, which evidence source must be captured FIRST?',
    options: [
      'Local Solid-State Disk (SSD) physical bit-stream image',
      'CPU registers, on-chip cache, and L1/L2 caches',
      'Routing tables, ARP cache, active process table, and physical RAM',
      'Remote Syslog and SIEM event archives'
    ],
    correctIndex: 1,
    explanation: 'Order of Volatility (RFC 3227) dictates capturing the most transient, ephemeral data first: 1. CPU registers and cache; 2. Routing table, ARP cache, process table, kernel stats, and RAM; 3. Temporary file systems; 4. Disk media; 5. Remote logging; 6. Archival backups.',
    optionAnalysis: {
      0: 'Disks are non-volatile and can be imaged after volatile RAM and registers have been preserved.',
      1: 'CORRECT. Registers and CPU caches are the most volatile data on a system, lost in nanoseconds upon state transition or power down.',
      2: 'RAM and process tables are second in the order of volatility, immediately following CPU cache/registers.',
      3: 'Remote logs are preserved off-box on central servers and are least vulnerable to local host loss.'
    },
    citation: {
      title: 'IETF RFC 3227: Guidelines for Evidence Collection and Archiving',
      sectionOrPage: 'Section 2.1: Order of Volatility Hierarchy',
      standardOrFramework: 'RFC 3227 Forensics Protocol'
    },
    difficulty: 'HARD'
  },
  {
    id: 'cissp_q6',
    examId: 'cissp',
    domainId: 'd2',
    domainName: 'Asset Security',
    questionText: 'An enterprise is decommissioning several hundred solid-state drives (SSDs) containing top-secret regulatory financial data. According to NIST SP 800-88 Rev. 1 Guidelines for Media Sanitization, which method provides the highest sanitization assurance against laboratory forensic reconstruction?',
    options: [
      'Overwriting all logical block addresses with random bit patterns using a 7-pass DoD 5220.22-M tool',
      'Degaussing the solid-state drives in a high-intensity magnetic coil',
      'Physical destruction via disintegration, incineration, or shredding to less than 2mm particles',
      'Performing a single-pass ATA Secure Erase firmware command'
    ],
    correctIndex: 2,
    explanation: 'NIST SP 800-88 defines three sanitization categories: Clear, Purge, and Destroy. For SSDs, overwriting is often incomplete due to wear-leveling algorithms and bad block remapping. Degaussing has zero effect on flash memory (which relies on electrical charge, not magnetic fields). Physical destruction (shredding/incineration) is the ultimate method preventing recovery.',
    optionAnalysis: {
      0: 'Wear leveling and over-provisioned cells on SSDs bypass traditional magnetic software overwrites.',
      1: 'Degaussing only affects magnetic media (HDDs, tapes); SSDs are non-magnetic and remain fully readable after degaussing.',
      2: 'CORRECT. Physical destruction renders recovery impossible even with advanced electron-microscopy reconstruction.',
      3: 'Cryptographic erase or Secure Erase purges data, but NIST SP 800-88 mandates Destroy for top-secret decommissioned hardware.'
    },
    citation: {
      title: 'NIST SP 800-88 Rev. 1: Guidelines for Media Sanitization',
      sectionOrPage: 'Table A-8: Flash-Based Storage Devices Sanitization',
      standardOrFramework: 'NIST SP 800-88 Sanitization Standard'
    },
    difficulty: 'MEDIUM'
  },
  {
    id: 'cissp_q7',
    examId: 'cissp',
    domainId: 'd6',
    domainName: 'Security Assessment and Testing',
    questionText: 'A healthcare compliance officer requests an independent audit report to evaluate whether a cloud service provider has implemented effective security controls over a 12-month operating window. Which AICPA SOC report format is specifically required?',
    options: [
      'SOC 1 Type I',
      'SOC 2 Type I',
      'SOC 2 Type II',
      'SOC 3 General Use Summary'
    ],
    correctIndex: 2,
    explanation: 'SOC 2 evaluates Trust Services Criteria (Security, Availability, Processing Integrity, Confidentiality, Privacy). Type I only reports on the suitability of control design as of a single point in time. Type II evaluates both control design and operational effectiveness over a specified testing period (minimum 6-12 months).',
    optionAnalysis: {
      0: 'SOC 1 focuses exclusively on internal controls over financial reporting (ICFR).',
      1: 'Type I is an assessment at a single snapshot date, which does not prove sustained operational efficacy.',
      2: 'CORRECT. SOC 2 Type II verifies that controls were tested and actively working throughout a prolonged period (e.g. 12 months).',
      3: 'SOC 3 is a high-level public marketing summary with no detailed test procedures or auditor findings.'
    },
    citation: {
      title: 'AICPA Trust Services Criteria (TSP 100) & SSAE 18',
      sectionOrPage: 'Section 200: Types of System and Organization Controls Reports',
      standardOrFramework: 'AICPA SOC 2 Compliance'
    },
    difficulty: 'MEDIUM'
  },
  {
    id: 'cissp_q8',
    examId: 'cissp',
    domainId: 'd8',
    domainName: 'Software Development Security',
    questionText: 'During a software security architecture review, an engineer discovers that an API endpoint decodes user-supplied XML documents without disabling Document Type Definitions (DTDs) or external entity resolution. Which OWASP Top 10 vulnerability does this design directly permit?',
    options: [
      'Server-Side Request Forgery (SSRF) / XML External Entity (XXE)',
      'Cross-Site Scripting (XSS)',
      'Insecure Direct Object References (IDOR)',
      'Broken Access Control via JWT manipulation'
    ],
    correctIndex: 0,
    explanation: 'XML External Entity (XXE) attacks occur when an XML parser processes external entity references in user-supplied input without proper validation. This can lead to local file disclosure (/etc/passwd), internal server-side port scanning, and remote SSRF.',
    optionAnalysis: {
      0: 'CORRECT. Parsing untrusted XML DTDs allows external entity expansion leading to file exfiltration and SSRF.',
      1: 'XSS injects client-side scripts into web browser DOMs, unrelated to server XML DTD parsing.',
      2: 'IDOR bypasses authorization checks on object identifiers (e.g. /account/412), not XML parser directives.',
      3: 'JWT token manipulation affects cryptographic claim signatures.'
    },
    citation: {
      title: 'OWASP Top 10:2021 Security Risks',
      sectionOrPage: 'A05:2021 Security Misconfiguration & XXE Guidelines',
      standardOrFramework: 'OWASP Application Security'
    },
    difficulty: 'MEDIUM'
  },
  {
    id: 'cissp_q9',
    examId: 'cissp',
    domainId: 'd3',
    domainName: 'Security Architecture and Engineering',
    questionText: 'Which formal integrity model addresses commercial transaction integrity by requiring that subjects can only modify objects through authorized transformation procedures (TPs), and enforces Separation of Duties using Constrained Data Items (CDIs)?',
    options: [
      'Biba Integrity Model',
      'Clark-Wilson Model',
      'Bell-LaPadula Model',
      'Lipner Lattice Model'
    ],
    correctIndex: 1,
    explanation: 'The Clark-Wilson integrity model was created specifically for commercial business systems. It mandates that Constrained Data Items (CDIs) can only be altered by Transformation Procedures (TPs). Integrity Verification Procedures (IVPs) ensure CDIs are in a valid state, enforcing Separation of Duties.',
    optionAnalysis: {
      0: 'Biba relies on hierarchical mathematical levels (no read down, no write up) and lacks commercial transformation procedures.',
      1: 'CORRECT. Clark-Wilson uses CDIs, TPs, and IVPs to enforce commercial fraud prevention and separation of duties.',
      2: 'Bell-LaPadula is a confidentiality model for government multi-level classification.',
      3: 'Lipner combines Bell-LaPadula and Biba to demonstrate commercial feasibility, but Clark-Wilson is the pure model specifying CDIs/TPs.'
    },
    citation: {
      title: 'A Comparison of Commercial and Military Computer Security Policies (IEEE)',
      sectionOrPage: 'David D. Clark & David R. Wilson, 1987 Foundations',
      standardOrFramework: 'Clark-Wilson Model'
    },
    difficulty: 'HARD'
  },
  {
    id: 'cissp_q10',
    examId: 'cissp',
    domainId: 'd1',
    domainName: 'Security and Risk Management',
    questionText: 'An organization calculates that a critical database server has an Asset Value (AV) of $500,000. A flood risk assessment reveals an Exposure Factor (EF) of 40% and an Annualized Rate of Occurrence (ARO) of 0.2 (once every five years). What is the Annualized Loss Expectancy (ALE)?',
    options: [
      '$20,000',
      '$40,000',
      '$100,000',
      '$200,000'
    ],
    correctIndex: 1,
    explanation: 'Single Loss Expectancy (SLE) = Asset Value (AV) × Exposure Factor (EF) = $500,000 × 0.40 = $200,000. Annualized Loss Expectancy (ALE) = Single Loss Expectancy (SLE) × Annualized Rate of Occurrence (ARO) = $200,000 × 0.2 = $40,000.',
    optionAnalysis: {
      0: 'Incorrect calculation ($500k × 0.40 × 0.1).',
      1: 'CORRECT. SLE = $500,000 × 40% = $200,000. ALE = $200,000 × 0.2 = $40,000 per year.',
      2: 'Incorrect calculation.',
      3: '$200,000 is the Single Loss Expectancy (SLE), not the Annualized Loss Expectancy (ALE).'
    },
    citation: {
      title: 'NIST SP 800-30 Rev. 1: Guide for Conducting Risk Assessments',
      sectionOrPage: 'Appendix G: Quantitative Risk Assessment Calculations',
      standardOrFramework: 'Quantitative Risk Formulas'
    },
    difficulty: 'EASY'
  }
];
