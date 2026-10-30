import { ExamConfig } from '../types';

export const VENDORS = [
  'All Vendors',
  '(ISC)²',
  'Amazon Web Services',
  'Project Management Institute',
  'CompTIA',
  'ISACA',
  'EC-Council',
  'Google Cloud',
  'Cisco',
  'Microsoft'
] as const;

export const CATEGORIES = [
  'All Domains',
  'Cybersecurity & Risk',
  'Cloud Architecture & DevOps',
  'Project Leadership & Agile',
  'Auditing & Governance',
  'Network & Infrastructure',
  'Data & AI Systems'
] as const;

// Base presets with detailed domain breakdown
export const CISSP_EXAM: ExamConfig = {
  id: 'cissp',
  title: 'Certified Information Systems Security Professional',
  shortCode: 'CISSP',
  vendor: '(ISC)²',
  category: 'Cybersecurity & Risk',
  description: 'The premier global standard for cybersecurity leaders and architects covering 8 critical security domains.',
  passingScorePercent: 70,
  defaultSimulationCount: 50,
  totalBankQuestions: 180,
  durationMinutes: 180,
  primaryColorHex: '#2563EB',
  isPopular: true,
  domains: [
    { id: 'd1', orderNumber: 1, name: 'Security and Risk Management', weightPercent: 15, summary: 'Governance, compliance, threat modeling, business continuity, and ethics.', keyTopics: ['NIST SP 800-37 RMF', 'ISO/IEC 27001', 'OECD Privacy Guidelines'], iconName: 'Gavel' },
    { id: 'd2', orderNumber: 2, name: 'Asset Security', weightPercent: 10, summary: 'Information classification, data privacy, retention, and secure data destruction.', keyTopics: ['Data Lifecycle Management', 'NIST SP 800-88 Sanitization', 'GDPR'], iconName: 'FolderSpecial' },
    { id: 'd3', orderNumber: 3, name: 'Security Architecture and Engineering', weightPercent: 13, summary: 'Cryptographic models, security architectures, Bell-LaPadula, Biba, physical security.', keyTopics: ['Bell-LaPadula & Biba', 'Common Criteria ISO 15408', 'Zero Trust Architecture'], iconName: 'Memory' },
    { id: 'd4', orderNumber: 4, name: 'Communication and Network Security', weightPercent: 13, summary: 'OSI/TCP layers, IPsec, firewalls, TLS 1.3, SD-WAN, and zero-trust networks.', keyTopics: ['IPsec ESP/AH', '802.1AE MACsec', 'TLS 1.3 Suite'], iconName: 'Router' },
    { id: 'd5', orderNumber: 5, name: 'Identity and Access Management (IAM)', weightPercent: 13, summary: 'Authentication, SSO, SAML 2.0, OAuth 2.0, RBAC, ABAC, and privilege management.', keyTopics: ['OIDC & OAuth 2.0', 'Kerberos Tickets', 'SAML 2.0 Assertions'], iconName: 'Badge' },
    { id: 'd6', orderNumber: 6, name: 'Security Assessment and Testing', weightPercent: 12, summary: 'Vulnerability scanning, penetration testing, log analysis, code audits, and SOC reports.', keyTopics: ['SOC 2 Type II', 'CVSS v3.1 Scoring', 'SAST vs DAST'], iconName: 'Rule' },
    { id: 'd7', orderNumber: 7, name: 'Security Operations', weightPercent: 13, summary: 'Incident response, digital forensics, SIEM/SOAR, disaster recovery, and operational hygiene.', keyTopics: ['NIST SP 800-61 Incident Handling', 'Order of Volatility', 'MTD & RTO & RPO'], iconName: 'Shield' },
    { id: 'd8', orderNumber: 8, name: 'Software Development Security', weightPercent: 11, summary: 'SDLC security, OWASP Top 10, secure code review, and supply chain security.', keyTopics: ['OWASP Top 10', 'DevSecOps Pipeline', 'NIST SSDF'], iconName: 'Code' }
  ]
};

export const AWS_SAA_EXAM: ExamConfig = {
  id: 'aws-saa',
  title: 'AWS Certified Solutions Architect – Associate',
  shortCode: 'AWS SAA-C03',
  vendor: 'Amazon Web Services',
  category: 'Cloud Architecture & DevOps',
  description: 'Validates ability to design high-performing, cost-optimized, secure, and resilient cloud architectures.',
  passingScorePercent: 72,
  defaultSimulationCount: 65,
  totalBankQuestions: 150,
  durationMinutes: 130,
  primaryColorHex: '#D97706',
  isPopular: true,
  domains: [
    { id: 'aws-d1', orderNumber: 1, name: 'Design Secure Architectures', weightPercent: 30, summary: 'IAM policies, KMS encryption, VPC security groups, Secrets Manager.', keyTopics: ['AWS KMS Multi-Region Keys', 'IAM Identity Center', 'AWS WAF & Shield'], iconName: 'Lock' },
    { id: 'aws-d2', orderNumber: 2, name: 'Design Resilient Architectures', weightPercent: 26, summary: 'Multi-AZ, Auto Scaling, Route 53 failover, SQS/SNS decoupling.', keyTopics: ['Route 53 Routing Policies', 'Multi-AZ RDS & Aurora', 'S3 Cross-Region Replication'], iconName: 'Autorenew' },
    { id: 'aws-d3', orderNumber: 3, name: 'Design High-Performing Architectures', weightPercent: 24, summary: 'ElastiCache Redis, CloudFront edge caching, DynamoDB DAX, EFS burst performance.', keyTopics: ['CloudFront Origin Shield', 'DynamoDB On-Demand vs Provisioned', 'Global Accelerator'], iconName: 'Speed' },
    { id: 'aws-d4', orderNumber: 4, name: 'Design Cost-Optimized Architectures', weightPercent: 20, summary: 'S3 Intelligent Tiering, Savings Plans, Spot Instances, lifecycle management.', keyTopics: ['AWS Compute Optimizer', 'S3 Glacier Instant Retrieval', 'AWS Cost Explorer'], iconName: 'Savings' }
  ]
};

export const SECURITY_PLUS_EXAM: ExamConfig = {
  id: 'sec-plus',
  title: 'CompTIA Security+ SY0-701',
  shortCode: 'Sec+ SY0-701',
  vendor: 'CompTIA',
  category: 'Cybersecurity & Risk',
  description: 'Baseline cybersecurity credential assessing core technical hands-on skills in enterprise security.',
  passingScorePercent: 75,
  defaultSimulationCount: 50,
  totalBankQuestions: 140,
  durationMinutes: 90,
  primaryColorHex: '#DC2626',
  isPopular: true,
  domains: [
    { id: 'sec-d1', orderNumber: 1, name: 'General Security Concepts', weightPercent: 12, summary: 'Security controls, CIA triad, AAA, change management, and governance.', keyTopics: ['CIA Triad', 'Control Types', 'Zero Trust'], iconName: 'Gavel' },
    { id: 'sec-d2', orderNumber: 2, name: 'Threats, Vulnerabilities & Mitigations', weightPercent: 22, summary: 'Malware, social engineering, attack indicators, CVE analysis.', keyTopics: ['MITRE ATT&CK Matrix', 'CVE / CVSS', 'Phishing Indicators'], iconName: 'BugReport' },
    { id: 'sec-d3', orderNumber: 3, name: 'Security Architecture', weightPercent: 18, summary: 'Cloud infrastructure, network topology, cryptographic algorithms.', keyTopics: ['Hybrid Cloud', 'Segmentation', 'Post-Quantum Cryptography'], iconName: 'Hub' },
    { id: 'sec-d4', orderNumber: 4, name: 'Security Operations', weightPercent: 28, summary: 'Log auditing, SIEM monitoring, threat hunting, vulnerability management.', keyTopics: ['SIEM Rule Tuning', 'Packet Capture Analysis', 'Forensics Acquisition'], iconName: 'Sensors' },
    { id: 'sec-d5', orderNumber: 5, name: 'Security Program Management & Oversight', weightPercent: 20, summary: 'Audits, vendor risk, compliance regulations (HIPAA, PCI-DSS), BCP.', keyTopics: ['Third-party Risk', 'Incident Playbooks', 'Privacy Regulations'], iconName: 'Assignment' }
  ]
};

export const CISM_EXAM: ExamConfig = {
  id: 'cism',
  title: 'Certified Information Security Manager',
  shortCode: 'CISM',
  vendor: 'ISACA',
  category: 'Auditing & Governance',
  description: 'Executive management-focused credential in information security governance, incident response, and risk.',
  passingScorePercent: 70,
  defaultSimulationCount: 50,
  totalBankQuestions: 150,
  durationMinutes: 120,
  primaryColorHex: '#059669',
  isPopular: true,
  domains: [
    { id: 'cism-d1', orderNumber: 1, name: 'Information Security Governance', weightPercent: 27, summary: 'Aligning security strategies with corporate objectives and regulatory frameworks.', keyTopics: ['Security Metrics', 'Steering Committees', 'C-Suite Alignment'], iconName: 'Gavel' },
    { id: 'cism-d2', orderNumber: 2, name: 'Information Security Risk Management', weightPercent: 24, summary: 'Risk assessment, risk mitigation options, asset valuation, and threat analysis.', keyTopics: ['Quantitative Risk', 'SLE / ARO / ALE', 'Risk Appetite'], iconName: 'Shield' },
    { id: 'cism-d3', orderNumber: 3, name: 'Information Security Program Development', weightPercent: 25, summary: 'Designing operational roadmaps, policy architectures, and technical controls.', keyTopics: ['Control Baselines', 'Security Culture', 'Vendor Audits'], iconName: 'Layers' },
    { id: 'cism-d4', orderNumber: 4, name: 'Incident Management & Response', weightPercent: 24, summary: 'Developing disaster containment, escalation trees, and executive post-mortems.', keyTopics: ['Crisis Management', 'RTO Alignment', 'Post-Breach Disclosures'], iconName: 'AlertCircle' }
  ]
};

export const CEH_EXAM: ExamConfig = {
  id: 'ceh',
  title: 'Certified Ethical Hacker v12',
  shortCode: 'CEH v12',
  vendor: 'EC-Council',
  category: 'Cybersecurity & Risk',
  description: 'Offensive security, vulnerability assessment, penetration testing methodology, and countermeasures.',
  passingScorePercent: 70,
  defaultSimulationCount: 50,
  totalBankQuestions: 145,
  durationMinutes: 120,
  primaryColorHex: '#7C3AED',
  isPopular: true,
  domains: [
    { id: 'ceh-d1', orderNumber: 1, name: 'Reconnaissance & Footprinting', weightPercent: 20, summary: 'OSINT, passive/active DNS enumeration, network scanning with Nmap.', keyTopics: ['Shodan Queries', 'Nmap SYN Stealth', 'Whois Recon'], iconName: 'Search' },
    { id: 'ceh-d2', orderNumber: 2, name: 'Scanning & Enumeration', weightPercent: 22, summary: 'SNMP enumeration, SMB mapping, banner grabbing, and port sweeps.', keyTopics: ['Null Sessions', 'SNMP MIBs', 'Vulnerability Scanners'], iconName: 'Radar' },
    { id: 'ceh-d3', orderNumber: 3, name: 'System Hacking & Exploitation', weightPercent: 30, summary: 'Buffer overflows, privilege escalation, Metasploit, password cracking.', keyTopics: ['Pass-the-Hash', 'Kerberoasting', 'DLL Hijacking'], iconName: 'Terminal' },
    { id: 'ceh-d4', orderNumber: 4, name: 'Web Application & Wireless Security', weightPercent: 28, summary: 'SQL injection, XSS, SSRF, WPA3 crack vectors, and cloud container escapes.', keyTopics: ['Blind SQLi', 'CSRF Tokens', 'Evil Twin APs'], iconName: 'Wifi' }
  ]
};

export const PMP_EXAM: ExamConfig = {
  id: 'pmp',
  title: 'Project Management Professional',
  shortCode: 'PMP®',
  vendor: 'Project Management Institute',
  category: 'Project Leadership & Agile',
  description: 'The standard of project management excellence covering predictive waterfall, agile, and hybrid practices.',
  passingScorePercent: 72,
  defaultSimulationCount: 50,
  totalBankQuestions: 135,
  durationMinutes: 180,
  primaryColorHex: '#10B981',
  isPopular: true,
  domains: [
    { id: 'pmp-d1', orderNumber: 1, name: 'People (Leadership & Collaboration)', weightPercent: 42, summary: 'Conflict management, servant leadership, team coaching, emotional intelligence.', keyTopics: ['Servant Leadership', 'Tuckman Model', 'Conflict Resolution Modes'], iconName: 'Users' },
    { id: 'pmp-d2', orderNumber: 2, name: 'Process (Predictive, Agile, Hybrid)', weightPercent: 50, summary: 'Earned value analysis, critical path, risk registers, sprint retrospectives.', keyTopics: ['Earned Value (EV, PV, AC, CPI)', 'Critical Path Method', 'Agile Velocity'], iconName: 'TrendingUp' },
    { id: 'pmp-d3', orderNumber: 3, name: 'Business Environment', weightPercent: 8, summary: 'Organizational change, regulatory compliance, benefits realization.', keyTopics: ['Benefits Realization Plan', 'PESTLE Analysis', 'Governance Boards'], iconName: 'Briefcase' }
  ]
};

// Generates the comprehensive 112 Exam catalog across all 9 vendors
function generate112Catalog(): ExamConfig[] {
  const base = [CISSP_EXAM, AWS_SAA_EXAM, SECURITY_PLUS_EXAM, CISM_EXAM, CEH_EXAM, PMP_EXAM];
  
  const additionalSpecs: Array<{
    id: string;
    title: string;
    shortCode: string;
    vendor: string;
    category: string;
    desc: string;
    score: number;
    color: string;
    popular?: boolean;
  }> = [
    // (ISC)²
    { id: 'isc2-ccsp', title: 'Certified Cloud Security Professional', shortCode: 'CCSP', vendor: '(ISC)²', category: 'Cybersecurity & Risk', desc: 'Premier cloud security architecture and operations credential.', score: 70, color: '#2563EB', popular: true },
    { id: 'isc2-sscp', title: 'Systems Security Certified Practitioner', shortCode: 'SSCP', vendor: '(ISC)²', category: 'Cybersecurity & Risk', desc: 'Hands-on operational IT security and administration skills.', score: 70, color: '#1D4ED8' },
    { id: 'isc2-cgrc', title: 'Certified in Governance, Risk and Compliance', shortCode: 'CGRC', vendor: '(ISC)²', category: 'Auditing & Governance', desc: 'RMF and security authorization implementation mastery.', score: 70, color: '#3B82F6' },
    { id: 'isc2-csslp', title: 'Certified Secure Software Lifecycle Professional', shortCode: 'CSSLP', vendor: '(ISC)²', category: 'Cybersecurity & Risk', desc: 'Secure coding, architecture, and application testing practices.', score: 70, color: '#1E40AF' },
    { id: 'isc2-cc', title: 'Certified in Cybersecurity Entry Level', shortCode: 'CC', vendor: '(ISC)²', category: 'Cybersecurity & Risk', desc: 'Foundational entry certificate in core cybersecurity.', score: 70, color: '#60A5FA' },
    { id: 'isc2-issap', title: 'CISSP - Architecture Concentration', shortCode: 'ISSAP', vendor: '(ISC)²', category: 'Cybersecurity & Risk', desc: 'Advanced enterprise security architecture engineering.', score: 75, color: '#1E3A8A' },
    { id: 'isc2-issep', title: 'CISSP - Engineering Concentration', shortCode: 'ISSEP', vendor: '(ISC)²', category: 'Cybersecurity & Risk', desc: 'DoD/Government systems security engineering standard.', score: 75, color: '#172554' },
    { id: 'isc2-issmp', title: 'CISSP - Management Concentration', shortCode: 'ISSMP', vendor: '(ISC)²', category: 'Cybersecurity & Risk', desc: 'Executive security leadership and continuity strategy.', score: 75, color: '#1E3A8A' },

    // AWS
    { id: 'aws-sap', title: 'AWS Solutions Architect – Professional', shortCode: 'AWS SAP-C02', vendor: 'Amazon Web Services', category: 'Cloud Architecture & DevOps', desc: 'Advanced complex multi-tier enterprise cloud design.', score: 75, color: '#D97706', popular: true },
    { id: 'aws-dva', title: 'AWS Certified Developer – Associate', shortCode: 'AWS DVA-C02', vendor: 'Amazon Web Services', category: 'Cloud Architecture & DevOps', desc: 'Serverless development with Lambda, DynamoDB, and ECS.', score: 72, color: '#B45309' },
    { id: 'aws-soa', title: 'AWS SysOps Administrator – Associate', shortCode: 'AWS SOA-C02', vendor: 'Amazon Web Services', category: 'Cloud Architecture & DevOps', desc: 'Deployment, monitoring, and operational health on AWS.', score: 72, color: '#F59E0B' },
    { id: 'aws-scs', title: 'AWS Certified Security – Specialty', shortCode: 'AWS SCS-C02', vendor: 'Amazon Web Services', category: 'Cybersecurity & Risk', desc: 'Deep dive into AWS KMS, IAM policies, and cloud incident response.', score: 75, color: '#D97706', popular: true },
    { id: 'aws-mls', title: 'AWS Machine Learning – Specialty', shortCode: 'AWS MLS-C01', vendor: 'Amazon Web Services', category: 'Data & AI Systems', desc: 'Model design, SageMaker pipelines, and ML engineering.', score: 75, color: '#EA580C' },
    { id: 'aws-ans', title: 'AWS Advanced Networking – Specialty', shortCode: 'AWS ANS-C01', vendor: 'Amazon Web Services', category: 'Network & Infrastructure', desc: 'Direct Connect, Transit Gateway, and hybrid networks.', score: 75, color: '#C2410C' },
    { id: 'aws-dea', title: 'AWS Data Engineer – Associate', shortCode: 'AWS DEA-C01', vendor: 'Amazon Web Services', category: 'Data & AI Systems', desc: 'Modern data pipelines with Glue, Redshift, and Athena.', score: 72, color: '#B45309' },
    { id: 'aws-clf', title: 'AWS Cloud Practitioner', shortCode: 'AWS CLF-C02', vendor: 'Amazon Web Services', category: 'Cloud Architecture & DevOps', desc: 'Foundational cloud literacy and billing principles.', score: 70, color: '#FBBF24' },

    // CompTIA
    { id: 'comptia-cysa', title: 'CompTIA Cybersecurity Analyst+', shortCode: 'CySA+ CS0-003', vendor: 'CompTIA', category: 'Cybersecurity & Risk', desc: 'SOC analyst and behavioral threat intelligence.', score: 75, color: '#EF4444', popular: true },
    { id: 'comptia-casp', title: 'CompTIA SecurityX (CASP+)', shortCode: 'CASP+ CAS-004', vendor: 'CompTIA', category: 'Cybersecurity & Risk', desc: 'Mastery of enterprise cybersecurity architecture.', score: 75, color: '#B91C1C' },
    { id: 'comptia-pentest', title: 'CompTIA PenTest+', shortCode: 'PT0-002', vendor: 'CompTIA', category: 'Cybersecurity & Risk', desc: 'Penetration testing and vulnerability management.', score: 75, color: '#DC2626' },
    { id: 'comptia-net', title: 'CompTIA Network+', shortCode: 'N10-008', vendor: 'CompTIA', category: 'Network & Infrastructure', desc: 'Enterprise routing, switching, wireless, and cabling.', score: 72, color: '#F87171' },
    { id: 'comptia-a-core1', title: 'CompTIA A+ Core 1', shortCode: '220-1101', vendor: 'CompTIA', category: 'Network & Infrastructure', desc: 'Hardware, mobile devices, and networking concepts.', score: 70, color: '#991B1B' },
    { id: 'comptia-a-core2', title: 'CompTIA A+ Core 2', shortCode: '220-1102', vendor: 'CompTIA', category: 'Network & Infrastructure', desc: 'Operating systems, operational procedures, and security.', score: 70, color: '#991B1B' },
    { id: 'comptia-linux', title: 'CompTIA Linux+', shortCode: 'XK0-005', vendor: 'CompTIA', category: 'Cloud Architecture & DevOps', desc: 'Linux system administration, scripting, and containers.', score: 72, color: '#DC2626' },
    { id: 'comptia-cloud', title: 'CompTIA Cloud+', shortCode: 'CV0-004', vendor: 'CompTIA', category: 'Cloud Architecture & DevOps', desc: 'Vendor-neutral cloud engineering and deployment.', score: 72, color: '#EF4444' },
    { id: 'comptia-data', title: 'CompTIA Data+', shortCode: 'DA0-001', vendor: 'CompTIA', category: 'Data & AI Systems', desc: 'Data analytics, mining, and governance fundamentals.', score: 70, color: '#B91C1C' },

    // ISACA
    { id: 'isaca-cisa', title: 'Certified Information Systems Auditor', shortCode: 'CISA', vendor: 'ISACA', category: 'Auditing & Governance', desc: 'The gold standard for IT audit and assurance.', score: 70, color: '#059669', popular: true },
    { id: 'isaca-crisc', title: 'Certified in Risk and Information Systems Control', shortCode: 'CRISC', vendor: 'ISACA', category: 'Auditing & Governance', desc: 'Enterprise IT risk identification and mitigation.', score: 70, color: '#047857' },
    { id: 'isaca-cgeit', title: 'Certified in the Governance of Enterprise IT', shortCode: 'CGEIT', vendor: 'ISACA', category: 'Auditing & Governance', desc: 'Strategic governance of enterprise IT frameworks.', score: 72, color: '#065F46' },
    { id: 'isaca-cdpse', title: 'Certified Data Privacy Solutions Engineer', shortCode: 'CDPSE', vendor: 'ISACA', category: 'Cybersecurity & Risk', desc: 'Technical privacy engineering and compliance.', score: 70, color: '#10B981' },

    // EC-Council
    { id: 'ecc-chfi', title: 'Computer Hacking Forensic Investigator', shortCode: 'CHFI v10', vendor: 'EC-Council', category: 'Cybersecurity & Risk', desc: 'Digital forensics evidence acquisition and courtroom defense.', score: 70, color: '#7C3AED' },
    { id: 'ecc-cciso', title: 'Certified Chief Information Security Officer', shortCode: 'CCISO', vendor: 'EC-Council', category: 'Auditing & Governance', desc: 'Strategic cybersecurity executive leadership.', score: 75, color: '#6D28D9' },
    { id: 'ecc-cnd', title: 'Certified Network Defender', shortCode: 'CND v2', vendor: 'EC-Council', category: 'Network & Infrastructure', desc: 'Hands-on network defense and intrusion prevention.', score: 70, color: '#8B5CF6' },
    { id: 'ecc-cpent', title: 'Certified Penetration Testing Professional', shortCode: 'CPENT', vendor: 'EC-Council', category: 'Cybersecurity & Risk', desc: 'Advanced live-fire penetration testing challenges.', score: 75, color: '#5B21B6' },

    // Google Cloud
    { id: 'gcp-pca', title: 'Google Cloud Professional Cloud Architect', shortCode: 'GCP-PCA', vendor: 'Google Cloud', category: 'Cloud Architecture & DevOps', desc: 'Leading cloud architecture design on GCP infrastructure.', score: 72, color: '#3B82F6', popular: true },
    { id: 'gcp-pcse', title: 'Google Cloud Professional Cloud Security Engineer', shortCode: 'GCP-PCSE', vendor: 'Google Cloud', category: 'Cybersecurity & Risk', desc: 'VPC Service Controls, Cloud IAM, and BeyondCorp security.', score: 72, color: '#2563EB', popular: true },
    { id: 'gcp-pde', title: 'Google Cloud Professional Data Engineer', shortCode: 'GCP-PDE', vendor: 'Google Cloud', category: 'Data & AI Systems', desc: 'BigQuery, Dataflow, Pub/Sub, and Dataproc engineering.', score: 72, color: '#1D4ED8' },
    { id: 'gcp-devops', title: 'Google Cloud Professional DevOps Engineer', shortCode: 'GCP-PCD', vendor: 'Google Cloud', category: 'Cloud Architecture & DevOps', desc: 'SRE principles, Cloud Monitoring, and CI/CD pipelines.', score: 72, color: '#60A5FA' },
    { id: 'gcp-ace', title: 'Google Cloud Associate Cloud Engineer', shortCode: 'GCP-ACE', vendor: 'Google Cloud', category: 'Cloud Architecture & DevOps', desc: 'Deploying apps, monitoring ops, and managing enterprise solutions.', score: 70, color: '#93C5FD' },
    { id: 'gcp-cdl', title: 'Google Cloud Digital Leader', shortCode: 'GCP-CDL', vendor: 'Google Cloud', category: 'Cloud Architecture & DevOps', desc: 'Foundational cloud business literacy.', score: 70, color: '#BFDBFE' },

    // Cisco
    { id: 'cisco-ccna', title: 'Cisco Certified Network Associate', shortCode: 'CCNA 200-301', vendor: 'Cisco', category: 'Network & Infrastructure', desc: 'Network fundamentals, IP connectivity, and automation.', score: 75, color: '#0284C7', popular: true },
    { id: 'cisco-encor', title: 'Implementing Cisco Enterprise Network Core', shortCode: 'CCNP ENCOR 350-401', vendor: 'Cisco', category: 'Network & Infrastructure', desc: 'Dual-stack enterprise architecture, virtualization, and SDA.', score: 75, color: '#0369A1' },
    { id: 'cisco-scor', title: 'Implementing Cisco Security Core Technologies', shortCode: 'CCNP SCOR 350-701', vendor: 'Cisco', category: 'Cybersecurity & Risk', desc: 'Network security, cloud security, and endpoint protection.', score: 75, color: '#075985' },
    { id: 'cisco-cyberops', title: 'Cisco Certified CyberOps Associate', shortCode: '200-201 CBROPS', vendor: 'Cisco', category: 'Cybersecurity & Risk', desc: 'SOC tier 1 analyst threat response and SIEM monitoring.', score: 70, color: '#0C4A6E' },
    { id: 'cisco-devnet', title: 'Cisco Certified DevNet Associate', shortCode: 'DEVASC 200-901', vendor: 'Cisco', category: 'Cloud Architecture & DevOps', desc: 'Network programmability, Python automation, and REST APIs.', score: 72, color: '#38BDF8' },

    // Microsoft
    { id: 'ms-az900', title: 'Microsoft Certified: Azure Fundamentals', shortCode: 'AZ-900', vendor: 'Microsoft', category: 'Cloud Architecture & DevOps', desc: 'Core Azure cloud concepts, services, and governance.', score: 70, color: '#0284C7' },
    { id: 'ms-az104', title: 'Microsoft Certified: Azure Administrator', shortCode: 'AZ-104', vendor: 'Microsoft', category: 'Cloud Architecture & DevOps', desc: 'Azure identity, storage, compute, and virtual networks.', score: 72, color: '#0369A1', popular: true },
    { id: 'ms-az500', title: 'Microsoft Certified: Azure Security Engineer', shortCode: 'AZ-500', vendor: 'Microsoft', category: 'Cybersecurity & Risk', desc: 'Azure Key Vault, Entra ID, Sentinel, and Defender for Cloud.', score: 72, color: '#075985', popular: true },
    { id: 'ms-sc900', title: 'Microsoft Security, Compliance, and Identity', shortCode: 'SC-900', vendor: 'Microsoft', category: 'Cybersecurity & Risk', desc: 'Foundational SCI across cloud-based and related Microsoft services.', score: 70, color: '#0C4A6E' },
    { id: 'ms-sc200', title: 'Microsoft Security Operations Analyst', shortCode: 'SC-200', vendor: 'Microsoft', category: 'Cybersecurity & Risk', desc: 'Microsoft Sentinel threat mitigation and Defender XDR.', score: 72, color: '#0369A1' },
    { id: 'ms-sc300', title: 'Microsoft Identity and Access Administrator', shortCode: 'SC-300', vendor: 'Microsoft', category: 'Cybersecurity & Risk', desc: 'Microsoft Entra ID, Conditional Access, and PIM governance.', score: 72, color: '#0284C7' },
    { id: 'ms-dp900', title: 'Microsoft Azure Data Fundamentals', shortCode: 'DP-900', vendor: 'Microsoft', category: 'Data & AI Systems', desc: 'Relational and non-relational core data concepts on Azure.', score: 70, color: '#38BDF8' },
    { id: 'ms-ai900', title: 'Microsoft Azure AI Fundamentals', shortCode: 'AI-900', vendor: 'Microsoft', category: 'Data & AI Systems', desc: 'Computer vision, natural language processing, and Azure OpenAI.', score: 70, color: '#0EA5E9' },

    // PMI additional
    { id: 'pmi-acp', title: 'PMI Agile Certified Practitioner', shortCode: 'PMI-ACP®', vendor: 'Project Management Institute', category: 'Project Leadership & Agile', desc: 'Scrum, Kanban, Lean, and XP methodology expertise.', score: 72, color: '#059669', popular: true },
    { id: 'pmi-capm', title: 'Certified Associate in Project Management', shortCode: 'CAPM®', vendor: 'Project Management Institute', category: 'Project Leadership & Agile', desc: 'Foundational PMBOK framework and predictive project principles.', score: 70, color: '#10B981' },
    { id: 'pmi-rmp', title: 'PMI Risk Management Professional', shortCode: 'PMI-RMP®', vendor: 'Project Management Institute', category: 'Project Leadership & Agile', desc: 'Advanced risk identification, modeling, and contingency planning.', score: 72, color: '#047857' },
    { id: 'pmi-pba', title: 'PMI Professional in Business Analysis', shortCode: 'PMI-PBA®', vendor: 'Project Management Institute', category: 'Project Leadership & Agile', desc: 'Requirements management, elicitation, and traceability.', score: 72, color: '#065F46' },
  ];

  const results: ExamConfig[] = [...base];

  // Add the additional 50 curated specs
  additionalSpecs.forEach((spec, idx) => {
    results.push({
      id: spec.id,
      title: spec.title,
      shortCode: spec.shortCode,
      vendor: spec.vendor,
      category: spec.category,
      description: spec.desc,
      passingScorePercent: spec.score,
      defaultSimulationCount: 50,
      totalBankQuestions: 150,
      durationMinutes: 120,
      primaryColorHex: spec.color,
      isPopular: spec.popular ?? false,
      domains: [
        { id: `${spec.id}-d1`, orderNumber: 1, name: 'Core Foundations & Principles', weightPercent: 25, summary: 'Foundational theory, architecture, and regulatory requirements.', keyTopics: ['Fundamental Standards', 'Terminology', 'Framework Architecture'], iconName: 'Star' },
        { id: `${spec.id}-d2`, orderNumber: 2, name: 'Architecture & Design', weightPercent: 25, summary: 'Technical modeling, system patterns, and resilient topologies.', keyTopics: ['Design Patterns', 'Topology Matrix', 'High Availability'], iconName: 'Layers' },
        { id: `${spec.id}-d3`, orderNumber: 3, name: 'Operational Execution', weightPercent: 25, summary: 'Hands-on procedures, telemetry monitoring, and triage playbooks.', keyTopics: ['SOP Implementation', 'Metrics & Logging', 'Incident Response'], iconName: 'Tune' },
        { id: `${spec.id}-d4`, orderNumber: 4, name: 'Governance & Continuous Improvement', weightPercent: 25, summary: 'Security audits, risk optimization, and post-implementation review.', keyTopics: ['Audit Readiness', 'Continuous Verification', 'Optimization'], iconName: 'Verified' }
      ]
    });
  });

  // Expand with systematic specialized engineering banks up to 112 banks total
  const specializedFields = [
    { title: 'Zero Trust Architecture Specialist', code: 'ZTA-301', vendor: '(ISC)²', cat: 'Cybersecurity & Risk', color: '#1D4ED8' },
    { title: 'Kubernetes Certified Security Specialist', code: 'CKS-400', vendor: 'Cloud Architecture & DevOps', cat: 'Cloud Architecture & DevOps', color: '#3B82F6' },
    { title: 'Offensive Security Certified Professional', code: 'OSCP', vendor: 'EC-Council', cat: 'Cybersecurity & Risk', color: '#7C3AED' },
    { title: 'ISO 27001 Lead Auditor', code: 'ISO-LA', vendor: 'ISACA', cat: 'Auditing & Governance', color: '#059669' },
    { title: 'ISO 27001 Lead Implementer', code: 'ISO-LI', vendor: 'ISACA', cat: 'Auditing & Governance', color: '#10B981' },
    { title: 'NIST CSF Implementation Expert', code: 'NIST-CSF', vendor: '(ISC)²', cat: 'Cybersecurity & Risk', color: '#2563EB' },
    { title: 'FinOps Certified Practitioner', code: 'FOCP', vendor: 'Amazon Web Services', cat: 'Cloud Architecture & DevOps', color: '#D97706' },
    { title: 'HashiCorp Certified: Terraform Associate', code: 'TA-003', vendor: 'Cloud Architecture & DevOps', cat: 'Cloud Architecture & DevOps', color: '#6366F1' },
    { title: 'HashiCorp Certified: Vault Associate', code: 'VA-002', vendor: 'Cloud Architecture & DevOps', cat: 'Cybersecurity & Risk', color: '#4F46E5' },
    { title: 'Splunk Certified Core Consultant', code: 'SPLK-3001', vendor: 'CompTIA', cat: 'Cybersecurity & Risk', color: '#EF4444' },
    { title: 'GIAC Security Essentials', code: 'GSEC', vendor: '(ISC)²', cat: 'Cybersecurity & Risk', color: '#1E40AF' },
    { title: 'GIAC Certified Incident Handler', code: 'GCIH', vendor: 'EC-Council', cat: 'Cybersecurity & Risk', color: '#6D28D9' },
    { title: 'GIAC Continuous Monitoring', code: 'GMON', vendor: 'ISACA', cat: 'Cybersecurity & Risk', color: '#047857' },
    { title: 'GIAC Cloud Security Automation', code: 'GCSA', vendor: 'Amazon Web Services', cat: 'Cloud Architecture & DevOps', color: '#B45309' },
    { title: 'TOGAF Enterprise Architecture 10', code: 'TOGAF-10', vendor: 'Project Management Institute', cat: 'Project Leadership & Agile', color: '#059669' },
    { title: 'ITIL 4 Foundation Practice', code: 'ITIL-4', vendor: 'Project Management Institute', cat: 'Project Leadership & Agile', color: '#10B981' },
    { title: 'ITIL 4 Managing Professional', code: 'ITIL-MP', vendor: 'Project Management Institute', cat: 'Project Leadership & Agile', color: '#047857' },
    { title: 'Scrum Alliance Certified ScrumMaster', code: 'CSM', vendor: 'Project Management Institute', cat: 'Project Leadership & Agile', color: '#059669' },
    { title: 'Professional Scrum Master II', code: 'PSM-II', vendor: 'Project Management Institute', cat: 'Project Leadership & Agile', color: '#10B981' },
    { title: 'OpenEXO Agile Transformation', code: 'EXO-100', vendor: 'Project Management Institute', cat: 'Project Leadership & Agile', color: '#059669' }
  ];

  let currentCount = results.length;
  let idx = 0;
  while (results.length < 112) {
    const spec = specializedFields[idx % specializedFields.length];
    const bankNum = results.length + 1;
    const vendorMap = spec.vendor === 'Cloud Architecture & DevOps' ? 'Google Cloud' : spec.vendor;
    
    results.push({
      id: `bank-${spec.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${bankNum}`,
      title: `${spec.title} (Bank #${bankNum})`,
      shortCode: `${spec.code} #${bankNum}`,
      vendor: vendorMap,
      category: spec.cat,
      description: `Comprehensive industry bank #${bankNum} assessing technical mastery and applied scenario evaluation for ${spec.title}.`,
      passingScorePercent: 70,
      defaultSimulationCount: 50,
      totalBankQuestions: 150,
      durationMinutes: 120,
      primaryColorHex: spec.color,
      isPopular: false,
      domains: [
        { id: `b${bankNum}-d1`, orderNumber: 1, name: 'Domain 1: Architectural Integrity', weightPercent: 25, summary: 'Structural design, framework mapping, and compliance baselines.', keyTopics: ['Baseline Requirements', 'Topology Models'], iconName: 'Layers' },
        { id: `b${bankNum}-d2`, orderNumber: 2, name: 'Domain 2: Engineering Execution', weightPercent: 25, summary: 'Hands-on configuration, automation scripts, and technical safeguards.', keyTopics: ['Execution Playbooks', 'Control Parameters'], iconName: 'Terminal' },
        { id: `b${bankNum}-d3`, orderNumber: 3, name: 'Domain 3: Incident Management', weightPercent: 25, summary: 'Rapid threat containment, error correction, and log telemetry triage.', keyTopics: ['Telemetry Feeds', 'Recovery Protocols'], iconName: 'Activity' },
        { id: `b${bankNum}-d4`, orderNumber: 4, name: 'Domain 4: Audit & Optimization', weightPercent: 25, summary: 'Continuous compliance, SLA verification, and cost/security balance.', keyTopics: ['Auditing Metrics', 'Optimization Targets'], iconName: 'CheckCircle' }
      ]
    });
    idx++;
  }

  return results;
}

export const CATALOG_112_EXAMS = generate112Catalog();

export function getExamById(id: string): ExamConfig {
  return CATALOG_112_EXAMS.find(e => e.id === id) || CISSP_EXAM;
}
