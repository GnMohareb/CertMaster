import { ExamQuestion, Flashcard, StudyGuide, AudioBriefing } from '../types/certmaster';
import { CISSP_EXAM_QUESTIONS } from './cisspQuestions';
import { FLASHCARDS, STUDY_GUIDES, AUDIO_BRIEFINGS } from './studyMaterials';
import { normalizeExamId, getExamContentStatus, FULL_PREP_EXAM_IDS } from '../lib/canonicalContract';

export { FULL_PREP_EXAM_IDS };

export const AWS_SAA_QUESTIONS: ExamQuestion[] = [
  {
    id: 'aws-saa-q01',
    examId: 'aws-saa',
    domain: 'Design Secure Architectures',
    domainNumber: 1,
    difficulty: 'Advanced',
    scenario:
      'A financial services enterprise runs workloads on Amazon EC2 instances in private subnets across multiple Availability Zones without NAT Gateways. The instances must securely access an Amazon S3 bucket containing encrypted regulatory archives without traffic ever traversing the public internet.',
    prompt:
      'Which AWS networking and security configuration meets this requirement with the lowest operational overhead and zero hourly data processing charges?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'Create a Gateway VPC Endpoint for Amazon S3, update the private subnet route tables, and apply a VPC Endpoint Policy restricting access to the target S3 bucket.',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'Deploy an AWS Transit Gateway attached to an AWS Direct Connect connection and route S3 traffic through an on-premises firewall.',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'Provision a NAT Instance in a public subnet and configure security groups to allow outbound HTTPS port 443 to Amazon S3 IP ranges.',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'Configure Amazon CloudFront with an Origin Access Control (OAC) and route EC2 requests through the public CloudFront distribution.',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'A Gateway VPC Endpoint for Amazon S3 (and DynamoDB) adds a prefix list route directly into your VPC route tables, routing traffic privately over the AWS backbone network with zero hourly endpoint fees or per-GB data processing charges. Attaching an endpoint policy and an S3 bucket policy with the `aws:sourceVpce` condition enforces strict least-privilege isolation.',
    citation: {
      authority: 'AWS Well-Architected Framework – Security Pillar',
      section: 'SEC05-BP02: Control traffic flow within network layers (Gateway VPC Endpoints)',
      note: 'Gateway VPC endpoints provide private connectivity to S3 and DynamoDB without requiring an Internet Gateway, NAT device, VPN connection, or AWS Direct Connect.',
      sourceDocument: 'Amazon VPC User Guide – Gateway Endpoints for Amazon S3',
    },
  },
  {
    id: 'aws-saa-q02',
    examId: 'aws-saa',
    domain: 'Design Resilient Architectures',
    domainNumber: 2,
    difficulty: 'Intermediate',
    scenario:
      'An e-commerce platform uses an Amazon RDS for PostgreSQL database in a single Availability Zone. During a sudden AZ power disruption, checkout operations halted for 42 minutes. Management mandates automatic failover to a standby replica in another AZ with zero data loss (RPO = 0) and recovery under 2 minutes.',
    prompt: 'Which architectural change satisfies these resilience requirements?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'Create an asynchronous Cross-Region Read Replica and use an AWS Lambda script to promote it during outages.',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'Modify the RDS instance to enable Multi-AZ deployment with synchronous physical replication to a standby instance in a secondary Availability Zone.',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'Schedule automated EBS snapshots every 5 minutes and copy them to an S3 Glacier Vault.',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'Place an Application Load Balancer in front of the single-AZ RDS database endpoint.',
      },
    ],
    correctOptionId: 'opt_b',
    explanation:
      'Amazon RDS Multi-AZ deployments provision and maintain a synchronous standby replica in a different Availability Zone. Transactions are committed to both primary and standby storage simultaneously (RPO = 0). In the event of an infrastructure failure, RDS automatically flips the canonical CNAME DNS record to the standby instance within 60–120 seconds.',
    citation: {
      authority: 'AWS Well-Architected Framework – Reliability Pillar',
      section: 'REL09-BP01: Deploy the workload to multiple locations (RDS Multi-AZ)',
      note: 'Multi-AZ is for High Availability (synchronous replication), whereas Read Replicas are for read scaling (asynchronous replication).',
      sourceDocument: 'Amazon RDS User Guide – High Availability (Multi-AZ)',
    },
  },
  {
    id: 'aws-saa-q03',
    examId: 'aws-saa',
    domain: 'Design High-Performing Architectures',
    domainNumber: 3,
    difficulty: 'Intermediate',
    scenario:
      'A gaming company operates a real-time global leaderboard backed by Amazon DynamoDB. During tournament finals, millions of concurrent users query the same top-100 player items, causing `ProvisionedThroughputExceededException` hot-partition throttling and 25ms read latencies.',
    prompt:
      'Which solution reduces read latency to microseconds and absorbs extreme read spikes without application refactoring?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'Deploy Amazon DynamoDB Accelerator (DAX) as a fully managed, API-compatible in-memory write-through cache in front of DynamoDB.',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'Migrate the leaderboard table to Amazon Redshift Serverless.',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'Export DynamoDB data nightly to Amazon S3 and query it using Amazon Athena.',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'Enable DynamoDB Streams and invoke AWS Step Functions on every read.',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'Amazon DynamoDB Accelerator (DAX) is a fully managed, highly available in-memory cache built specifically for DynamoDB. It is API-compatible with existing DynamoDB SDK calls, delivers up to 10x read performance improvement (reducing milliseconds to microseconds), and prevents hot-key read throttling on underlying partitions.',
    citation: {
      authority: 'AWS Well-Architected Framework – Performance Efficiency Pillar',
      section: 'PERF04-BP03: Use caching to improve data access performance (DynamoDB DAX)',
      note: 'DAX caches both individual item reads (`GetItem`/`BatchGetItem`) and query/scan results in memory.',
      sourceDocument: 'Amazon DynamoDB Developer Guide – In-Memory Acceleration with DAX',
    },
  },
  {
    id: 'aws-saa-q04',
    examId: 'aws-saa',
    domain: 'Design Cost-Optimized Architectures',
    domainNumber: 4,
    difficulty: 'Intermediate',
    scenario:
      'A biotech enterprise stores 850 TB of genomic sequencing files in Amazon S3 Standard. Access patterns are highly unpredictable: some datasets are analyzed repeatedly for two weeks, while others sit untouched for 9 months. However, when researchers request any file, retrieval must be immediate (milliseconds) with zero retrieval fees.',
    prompt: 'Which S3 storage configuration optimizes storage costs automatically?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'Amazon S3 Intelligent-Tiering, which automatically moves objects between Frequent, Infrequent, and Archive Instant Access tiers with no retrieval fees.',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'Amazon S3 Glacier Deep Archive with Standard bulk retrieval.',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'Amazon S3 One Zone-Infrequent Access (S3 One Zone-IA) for all genomic data.',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'Provisioning an Amazon FSx for Lustre persistent SSD cluster.',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'Amazon S3 Intelligent-Tiering is the ideal storage class for data with unknown or changing access patterns. For a small monthly object monitoring fee, it automatically transitions objects not accessed for 30 days to the Infrequent Access tier (saving 40%) and after 90 days to the Archive Instant Access tier (saving 68%), with millisecond latency and zero retrieval charges.',
    citation: {
      authority: 'AWS Well-Architected Framework – Cost Optimization Pillar',
      section: 'COST06-BP02: Select resource type, size, and number based on data access patterns',
      note: 'S3 Intelligent-Tiering eliminates operational overhead of lifecycle rules when access patterns are unpredictable and avoids per-GB retrieval fees.',
      sourceDocument: 'Amazon S3 User Guide – Storage Classes (S3 Intelligent-Tiering)',
    },
  },
  {
    id: 'aws-saa-q05',
    examId: 'aws-saa',
    domain: 'Design Secure Architectures',
    domainNumber: 1,
    difficulty: 'Advanced',
    scenario:
      'A multi-account AWS Organization wants to ensure that no IAM user or role—even an account root user or `AdministratorAccess` principal in a member account—can ever disable AWS CloudTrail logging or delete flow logs in any region.',
    prompt: 'Which AWS governance mechanism enforces this guardrail centrally?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'Attach a Service Control Policy (SCP) in AWS Organizations with an explicit `Deny` on `cloudtrail:StopLogging` and `ec2:DeleteFlowLogs` to the member Organizational Units (OUs).',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'Create an IAM Group in each member account and attach a managed ReadOnlyAccess policy.',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'Configure AWS Trusted Advisor weekly email alerts.',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'Use Amazon Inspector to scan IAM roles for unused permissions.',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'Service Control Policies (SCPs) in AWS Organizations define the maximum permission guardrails for all principals in member accounts, including the member account root user. An explicit `Deny` statement in an SCP cannot be overridden by any local account IAM policy.',
    citation: {
      authority: 'AWS Organizations User Guide',
      section: 'Service Control Policies (SCPs) Evaluation Logic',
      note: 'SCPs do not grant permissions on their own; they act as organization-wide permission filters that bound what IAM policies can allow.',
      sourceDocument: 'AWS Organizations – Managing Organization Policies',
    },
  },
];

export const SEC_PLUS_QUESTIONS: ExamQuestion[] = [
  {
    id: 'sec-plus-q01',
    examId: 'sec-plus',
    domain: 'General Security Concepts',
    domainNumber: 1,
    difficulty: 'Intermediate',
    scenario:
      'A healthcare provider is deploying a Zero Trust Architecture (ZTA) across its hybrid cloud environment. When a clinician attempts to access the Electronic Medical Record (EMR) API from a tablet, an enforcement proxy intercepts the request and queries a central engine that evaluates user identity, device patch status, and geolocation before issuing an ephemeral session token.',
    prompt:
      'In Zero Trust terminology (SY0-701 Domain 1.2), which component evaluates the contextual trust rules and makes the access decision?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'Policy Decision Point (PDP) — comprising the Policy Engine (PE) and Policy Administrator (PA)',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'Policy Enforcement Point (PEP)',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'Public Key Infrastructure Registration Authority (RA)',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'Physical Intrusion Detection Sensor',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'In Zero Trust Architecture (NIST SP 800-207 / CompTIA SY0-701 Objective 1.2), the Control Plane houses the Policy Decision Point (PDP), split into the Policy Engine (which evaluates trust signals and policy rules) and the Policy Administrator (which commands the PEP to establish or terminate the session). The Policy Enforcement Point (PEP) sits in the Data Plane.',
    citation: {
      authority: 'CompTIA Security+ SY0-701 Exam Objectives',
      section: 'Objective 1.2: Summarize fundamental security concepts (Zero Trust Control Plane vs Data Plane)',
      note: 'PE + PA = Policy Decision Point (Control Plane); PEP = Policy Enforcement Point (Data Plane).',
      sourceDocument: 'CompTIA Security+ SY0-701 Official Study Guide / NIST SP 800-207',
    },
  },
  {
    id: 'sec-plus-q02',
    examId: 'sec-plus',
    domain: 'Threats, Vulnerabilities & Mitigations',
    domainNumber: 2,
    difficulty: 'Intermediate',
    scenario:
      'A company’s finance director receives a realistic video conference call and voice message appearing to come from the CEO, instructing an urgent wire transfer for a confidential acquisition. Forensic analysis reveals the attacker used generative AI trained on public earnings calls to synthesize the CEO’s voice and facial movements.',
    prompt: 'Which threat vector and social engineering technique does this attack represent?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'Whaling combined with AI-generated Deepfake / Vishing impersonation',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'Watering Hole attack utilizing DNS cache poisoning',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'Bluejacking over short-range Bluetooth PAN',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'Typosquatting via Punycode homograph domains',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'Targeting a senior executive (the finance director/CFO) with a tailored spear-phishing campaign is known as Whaling (Business Email/Executive Compromise), and using synthetic AI audio/video to impersonate authority over voice/video channels combines deepfake impersonation with vishing.',
    citation: {
      authority: 'CompTIA Security+ SY0-701 Exam Objectives',
      section: 'Objective 2.2: Explain common threat vectors and attack surfaces (Social Engineering & Impersonation)',
      note: 'Out-of-band multi-party verification and callback policies are the primary administrative controls against deepfake executive impersonation.',
      sourceDocument: 'CompTIA Security+ SY0-701 Official Curriculum',
    },
  },
  {
    id: 'sec-plus-q03',
    examId: 'sec-plus',
    domain: 'Security Architecture',
    domainNumber: 3,
    difficulty: 'Advanced',
    scenario:
      'An industrial water treatment facility operates legacy Programmable Logic Controllers (PLCs) running proprietary SCADA protocols that cannot support modern endpoint detection agents or frequent OS reboots.',
    prompt:
      'Which architectural security control best protects these ICS/SCADA devices from enterprise IT network compromises?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'Network segmentation using an Industrial DMZ, Purdue Model zoning, and unidirectional security gateways (data diodes)',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'Exposing the PLCs directly to the corporate Wi-Fi network for rapid remote patching',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'Configuring automated daily vulnerability exploitation scans against the live PLCs',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'Replacing TCP/IP with unencrypted Telnet management sessions',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'Operational Technology (OT) and ICS/SCADA environments prioritize Availability and physical safety. Because legacy PLCs are fragile and often cannot run host agents or tolerate active vulnerability scanning, architects isolate them in segmented zones separated from corporate IT by an Industrial DMZ, application-aware firewalls, and hardware data diodes.',
    citation: {
      authority: 'CompTIA Security+ SY0-701 & NIST SP 800-82',
      section: 'Objective 3.1 / 3.2: ICS/SCADA Embedded Systems & Network Segmentation',
      note: 'Active vulnerability scans can crash fragile PLC network stacks; passive network monitoring and strict segmentation are preferred.',
      sourceDocument: 'NIST SP 800-82 Rev 3 Guide to Operational Technology (OT) Security',
    },
  },
  {
    id: 'sec-plus-q04',
    examId: 'sec-plus',
    domain: 'Security Operations',
    domainNumber: 4,
    difficulty: 'Intermediate',
    scenario:
      'A SOC analyst wants to automate the triage of phishing alerts so that whenever an employee reports a suspicious email, a system automatically parses the email headers, queries threat intelligence feeds for the sender IP hash, quarantines matching messages across all mailboxes, and opens a ticket.',
    prompt: 'Which security operations platform provides this automated playbook execution?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'SOAR (Security Orchestration, Automation, and Response)',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'FIM (File Integrity Monitoring)',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'DLP (Data Loss Prevention) USB blocker',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'NetFlow collector',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'While a SIEM aggregates and correlates logs to generate alerts, a SOAR (Security Orchestration, Automation, and Response) platform executes automated runbooks/playbooks across disparate tools (email gateway, threat intel, ticketing, EDR) to reduce Mean Time to Respond (MTTR).',
    citation: {
      authority: 'CompTIA Security+ SY0-701 Exam Objectives',
      section: 'Objective 4.4 / 4.8: Incident Response & SOAR Playbook Automation',
      note: 'SIEM = Detection & Correlation; SOAR = Automated Orchestration & Playbook Response.',
      sourceDocument: 'CompTIA Security+ SY0-701 Official Study Guide',
    },
  },
  {
    id: 'sec-plus-q05',
    examId: 'sec-plus',
    domain: 'Security Program Management & Oversight',
    domainNumber: 5,
    difficulty: 'Intermediate',
    scenario:
      'Two SaaS companies are entering a partnership where Company A will host and process customer credit applications on behalf of Company B. Before signing the contract, both legal teams want to establish a document that specifies the exact technical encryption standards, VPN cipher suites, and API authentication protocols required between their systems.',
    prompt: 'Which third-party governance document defines these specific technical interoperability parameters?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'Interconnection Security Agreement (ISA)',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'Non-Disclosure Agreement (NDA)',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'Memorandum of Understanding (MOU)',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'Acceptable Use Policy (AUP)',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'An Interconnection Security Agreement (ISA) specifies the technical and security requirements for establishing, operating, and maintaining a direct network or system-to-system connection between two organizations (NIST SP 800-47). An MOU is a high-level non-binding statement of intent, and an SLA covers uptime/performance metrics.',
    citation: {
      authority: 'CompTIA Security+ SY0-701 & NIST SP 800-47',
      section: 'Objective 5.4: Third-Party Risk Assessment and Vendor Agreements (SLA, MOU, MSA, ISA)',
      note: 'ISA = Technical security specifications for system interconnection; SLA = Uptime/performance targets; NDA = Confidentiality.',
      sourceDocument: 'NIST SP 800-47 Rev 1: Managing the Security of Information Exchanges',
    },
  },
];

export const PMP_QUESTIONS: ExamQuestion[] = [
  {
    id: 'pmp-q01',
    examId: 'pmp',
    domain: 'People',
    domainNumber: 1,
    difficulty: 'Intermediate',
    scenario:
      'Midway through a hybrid software transformation project, two senior engineers strongly disagree on the microservice message broker architecture, causing sprint velocity to drop by 25%. The discussion remains respectful, and both engineers have valid technical points.',
    prompt:
      'According to the PMI PMBOK Guide and servant leadership principles, what should the Project Manager do first?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'Facilitate a collaborative problem-solving workshop where both engineers evaluate objective trade-offs against project quality criteria.',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'Immediately escalate the dispute to the project sponsor to mandate a decision.',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'Reassign one of the engineers to a different project team to eliminate friction.',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'Select the cheaper option unilaterally to preserve management reserves.',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'In the Thomas-Kilmann conflict model and PMI People Domain (Task 1.1: Manage Conflict), Collaborate/Problem-Solve is the preferred win-win conflict resolution technique when time permits and technical consensus improves commitment. A servant leader empowers the team to resolve technical debates through objective evaluation.',
    citation: {
      authority: 'PMI PMBOK Guide 7th Edition & Agile Practice Guide',
      section: 'Domain I: People – Task 1: Manage Conflict',
      note: 'Collaborating (Problem Solving) leads to consensus and commitment, whereas Forcing or Escalating prematurely erodes team autonomy.',
      sourceDocument: 'PMI Examination Content Outline (ECO)',
    },
  },
  {
    id: 'pmp-q02',
    examId: 'pmp',
    domain: 'Process',
    domainNumber: 2,
    difficulty: 'Advanced',
    scenario:
      'An infrastructure deployment project has a Budget at Completion (BAC) of $500,000. At month 6, Planned Value (PV) is $250,000, Earned Value (EV) is $200,000, and Actual Cost (AC) is $250,000.',
    prompt: 'What are the Cost Performance Index (CPI) and Schedule Performance Index (SPI), and what is the project status?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'CPI = 0.80 and SPI = 0.80; the project is both over budget and behind schedule.',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'CPI = 1.25 and SPI = 1.00; the project is under budget and on schedule.',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'CPI = 1.00 and SPI = 0.80; the project is on budget but behind schedule.',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'CPI = 0.80 and SPI = 1.25; the project is over budget but ahead of schedule.',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'Earned Value Management (EVM) formulas:\n• CPI = EV / AC = $200,000 / $250,000 = 0.80 (< 1.0 means over budget; only $0.80 of value earned per $1.00 spent).\n• SPI = EV / PV = $200,000 / $250,000 = 0.80 (< 1.0 means behind schedule; progressing at 80% of planned rate).',
    citation: {
      authority: 'PMI PMBOK Guide 7th Edition',
      section: 'Domain II: Process – Earned Value Management (EVM) Measurement Performance Domain',
      note: 'CV = EV - AC; SV = EV - PV; CPI = EV / AC; SPI = EV / PV.',
      sourceDocument: 'PMI Standard for Earned Value Management',
    },
  },
  {
    id: 'pmp-q03',
    examId: 'pmp',
    domain: 'Business Environment',
    domainNumber: 3,
    difficulty: 'Intermediate',
    scenario:
      'During an Agile project delivering a customer portal, a new data privacy law is enacted that mandates explicit opt-in consent auditing within 60 days. Failing to comply carries severe statutory fines.',
    prompt: 'How should the Project Manager and Product Owner handle this regulatory change?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'Assess the compliance impact, create high-priority compliance user stories, and reprioritize the Product Backlog with the Product Owner for the upcoming sprint.',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'Complete all originally planned cosmetic features first and address legal compliance in a post-launch maintenance phase next year.',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'Cancel the current sprint immediately without consulting the Product Owner.',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'Ask the development team to work unpaid overtime so the backlog order does not change.',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'Mandatory regulatory compliance is non-negotiable for project viability (Domain III: Business Environment, Task 3.1: Plan and manage project compliance). In Agile, the Product Owner dynamically reprioritizes the Product Backlog so mandatory compliance stories are pulled into the next iteration ahead of lower-value features.',
    citation: {
      authority: 'PMI PMP Examination Content Outline (ECO)',
      section: 'Domain III: Business Environment – Task 1: Plan and Manage Project Compliance',
      note: 'Regulatory compliance items take precedence in backlog refinement to protect organizational license to operate.',
      sourceDocument: 'PMI Agile Practice Guide',
    },
  },
];

export const CISM_QUESTIONS: ExamQuestion[] = [
  {
    id: 'cism-q01',
    examId: 'cism',
    domain: 'Information Security Governance',
    domainNumber: 1,
    difficulty: 'Advanced',
    scenario:
      'A newly appointed Information Security Manager discovers that security projects are frequently defunded mid-year because executive leadership views cybersecurity purely as an IT cost center rather than a business enabler.',
    prompt:
      'What is the MOST effective action to establish sustainable executive support for the information security program?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'Align the information security strategy directly with enterprise business objectives, risk appetite, and board-level governance metrics.',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'Purchase an advanced AI firewall to demonstrate technical sophistication.',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'Delegate security funding decisions to junior system administrators.',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'Increase the frequency of technical vulnerability scan PDF emails sent to the CEO.',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'On ISACA CISM exams, the foundational principle of Information Security Governance (Domain 1) is Strategic Alignment: ensuring security initiatives directly support business goals and operate within the board-approved risk appetite.',
    citation: {
      authority: 'ISACA CISM Review Manual (16th Edition)',
      section: 'Domain 1: Information Security Governance – Strategic Alignment',
      note: 'Security governance succeeds only when tied to business outcomes, value delivery, and executive risk tolerance.',
      sourceDocument: 'ISACA CISM Official Curriculum',
    },
  },
  {
    id: 'cism-q02',
    examId: 'cism',
    domain: 'Information Risk Management',
    domainNumber: 2,
    difficulty: 'Intermediate',
    scenario:
      'After implementing multi-factor authentication and endpoint protection on a core financial ERP system, the Information Security Manager calculates that a residual risk of $85,000 per year still remains. The cost of an additional control would be $210,000 per year.',
    prompt: 'Who has the authority to formally accept this residual risk?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'Senior Management / the Business Process Owner (Risk Owner)',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'The Information Security Manager (CISM)',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'The External Financial Auditor',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'The SOC Tier-2 Analyst',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'In ISACA risk governance, the Information Security Manager advises and quantifies risk, but only Senior Management / the Business Owner who owns the asset and budget holds the fiduciary authority to formally accept residual business risk.',
    citation: {
      authority: 'ISACA CISM Review Manual',
      section: 'Domain 2: Information Risk Management – Risk Ownership and Residual Risk Acceptance',
      note: 'Security managers evaluate and recommend; business owners accept residual risk.',
      sourceDocument: 'ISACA Risk IT Framework',
    },
  },
  {
    id: 'cism-q03',
    examId: 'cism',
    domain: 'Incident Management',
    domainNumber: 4,
    difficulty: 'Intermediate',
    scenario:
      'An enterprise is developing its Business Continuity Plan (BCP) and Disaster Recovery Plan (DRP). The Information Security Manager needs to determine which critical business applications must be restored first following a catastrophic data center outage.',
    prompt: 'Which foundational document provides the prioritized recovery order and RTO/RPO targets?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'Business Impact Analysis (BIA)',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'Vulnerability Assessment Report',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'Acceptable Use Policy (AUP)',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'Employee Onboarding Handbook',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'The Business Impact Analysis (BIA) identifies critical business processes, maps dependencies on IT assets, quantifies financial/operational impact over time, and establishes authoritative Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO).',
    citation: {
      authority: 'ISACA CISM Review Manual',
      section: 'Domain 4: Information Security Incident Management – BIA & DRP Integration',
      note: 'The BIA is the mandatory prerequisite before drafting recovery strategies in a DRP.',
      sourceDocument: 'ISACA CISM Domain 4 Standard',
    },
  },
];

export const CEH_QUESTIONS: ExamQuestion[] = [
  {
    id: 'ceh-q01',
    examId: 'ceh',
    domain: 'Reconnaissance & Scanning',
    domainNumber: 1,
    difficulty: 'Intermediate',
    scenario:
      'During an authorized penetration test, an ethical hacker wants to identify open TCP ports on a target firewall without completing the full 3-way TCP handshake, minimizing connection logs on target application servers.',
    prompt: 'Which Nmap scan flag performs a half-open TCP SYN stealth scan?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: '`nmap -sS <target>` (Sends SYN; if SYN/ACK received, responds with RST instead of ACK)',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: '`nmap -sT <target>` (Completes full OS `connect()` 3-way handshake)',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: '`nmap -sU <target>` (UDP port scan)',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: '`nmap -sn <target>` (Ping sweep only, disables port scanning)',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'An Nmap TCP SYN scan (`-sS`) sends a TCP packet with the SYN flag set. If the target port is open, it replies with SYN/ACK, and the scanner immediately sends a RST packet to tear down the connection before the 3-way handshake completes.',
    citation: {
      authority: 'EC-Council CEH v12 Official Curriculum',
      section: 'Module 03: Scanning Networks – TCP SYN Stealth Scan (-sS)',
      note: 'SYN scans require raw socket privileges (root/Administrator) and are the default scan type for privileged Nmap execution.',
      sourceDocument: 'EC-Council Certified Ethical Hacker (312-50) Blueprint',
    },
  },
  {
    id: 'ceh-q02',
    examId: 'ceh',
    domain: 'Web Application Hacking',
    domainNumber: 3,
    difficulty: 'Intermediate',
    scenario:
      'While testing a web login form, a penetration tester enters `admin\' OR \'1\'=\'1\'--` into the username field and successfully logs into the administrative portal without knowing the password.',
    prompt: 'What type of vulnerability was exploited, and why did the `--` characters allow authentication bypass?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'Authentication Bypass SQL Injection (SQLi); `--` comments out the remainder of the SQL `WHERE` clause (including the password check).',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'Reflected Cross-Site Scripting (XSS); `--` executes JavaScript in the DOM.',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'ARP Poisoning; `--` overwrites the gateway MAC address.',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'DNS Zone Transfer (`dig axfr`).',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'In SQL syntax (T-SQL, PostgreSQL, SQLite), `--` is an inline comment sequence. Injecting `admin\' OR \'1\'=\'1\'--` closes the string literal, makes the boolean condition always evaluate to TRUE, and comments out `AND password = \'...\'`. Parameterized queries (prepared statements) remediate SQLi.',
    citation: {
      authority: 'EC-Council CEH v12 & OWASP Top 10',
      section: 'Module 14: Hacking Web Applications – SQL Injection (CWE-89)',
      note: 'Prepared statements separate SQL code structure from user-supplied data parameters.',
      sourceDocument: 'EC-Council CEH v12 Official Study Guide',
    },
  },
  {
    id: 'ceh-q03',
    examId: 'ceh',
    domain: 'System Hacking & Privilege Escalation',
    domainNumber: 2,
    difficulty: 'Advanced',
    scenario:
      'After gaining an initial foothold on a Windows workstation, an ethical hacker dumps local NTLM password hashes from memory using LSASS inspection. Rather than cracking the hash back into plaintext, the tester uses the raw NTLM hash directly to authenticate to an adjacent file server over SMB.',
    prompt: 'Which lateral movement technique is the ethical hacker executing?',
    options: [
      {
        id: 'opt_a',
        letter: 'A',
        text: 'Pass-the-Hash (PtH) — MITRE ATT&CK T1550.002',
      },
      {
        id: 'opt_b',
        letter: 'B',
        text: 'VLAN Hopping via Double Tagging (802.1Q)',
      },
      {
        id: 'opt_c',
        letter: 'C',
        text: 'Evil Twin Wi-Fi Deauthentication',
      },
      {
        id: 'opt_d',
        letter: 'D',
        text: 'BGP Route Hijacking',
      },
    ],
    correctOptionId: 'opt_a',
    explanation:
      'In NTLM challenge-response authentication, the client proves knowledge of the password by encrypting the server challenge with the NTLM hash itself. Therefore, possessing the unsalted NTLM hash is equivalent to possessing the plaintext password. Mitigation includes Windows Credential Guard, Protected Users security group, and disabling NTLM in favor of Kerberos.',
    citation: {
      authority: 'EC-Council CEH v12 & MITRE ATT&CK',
      section: 'Module 06: System Hacking – Pass-the-Hash (T1550.002)',
      note: 'Credential Guard isolates LSASS secrets inside Virtualization-Based Security (VBS) to prevent hash dumping.',
      sourceDocument: 'EC-Council CEH v12 Official Guide',
    },
  },
];

export const MULTI_EXAM_FLASHCARDS: Flashcard[] = [
  ...FLASHCARDS.map((fc) => ({ ...fc, examId: 'cissp' })),
  {
    id: 'fc-aws-1',
    examId: 'aws-saa',
    domain: 'Design Secure Architectures',
    front: 'What is the difference between a Gateway VPC Endpoint and an Interface VPC Endpoint (AWS PrivateLink)?',
    back: 'Gateway Endpoints are free route-table targets supporting only Amazon S3 and DynamoDB. Interface Endpoints (PrivateLink) provision an ENI with a private IP in your subnet and support 100+ AWS services and custom endpoint services.',
    reference: 'AWS VPC User Guide – VPC Endpoints',
    state: 'unstudied',
    boxLevel: 1,
  },
  {
    id: 'fc-aws-2',
    examId: 'aws-saa',
    domain: 'Design Resilient Architectures',
    front: 'When should you choose Amazon RDS Multi-AZ vs. Amazon RDS Read Replicas?',
    back: 'Choose Multi-AZ for High Availability & automatic failover (synchronous replication, standby is not readable in standard Multi-AZ DB instance). Choose Read Replicas for horizontal read scaling and reporting (asynchronous replication).',
    reference: 'AWS Well-Architected Reliability Pillar',
    state: 'unstudied',
    boxLevel: 1,
  },
  {
    id: 'fc-aws-3',
    examId: 'aws-saa',
    domain: 'Design Cost-Optimized Architectures',
    front: 'Which S3 storage class automatically optimizes storage costs when access patterns are unknown or changing, with zero retrieval fees?',
    back: 'Amazon S3 Intelligent-Tiering. It monitors access patterns and automatically transitions objects between Frequent, Infrequent (30 days), and Archive Instant Access (90 days) tiers.',
    reference: 'Amazon S3 Storage Classes Specification',
    state: 'unstudied',
    boxLevel: 1,
  },
  {
    id: 'fc-sec-1',
    examId: 'sec-plus',
    domain: 'General Security Concepts',
    front: 'In Zero Trust Architecture (NIST SP 800-207), what are the roles of the Policy Engine (PE), Policy Administrator (PA), and Policy Enforcement Point (PEP)?',
    back: 'PE + PA form the Policy Decision Point (PDP) in the Control Plane: PE evaluates trust signals, and PA issues session tokens. PEP sits in the Data Plane and enforces the connection gate.',
    reference: 'CompTIA Security+ SY0-701 Objective 1.2',
    state: 'unstudied',
    boxLevel: 1,
  },
  {
    id: 'fc-sec-2',
    examId: 'sec-plus',
    domain: 'Security Operations',
    front: 'What is the core operational difference between a SIEM and a SOAR platform?',
    back: 'A SIEM aggregates logs, normalizes events, and correlates rules to detect incidents. A SOAR executes automated response playbooks and orchestrates actions across third-party security tools.',
    reference: 'CompTIA Security+ SY0-701 Objective 4.4',
    state: 'unstudied',
    boxLevel: 1,
  },
  {
    id: 'fc-pmp-1',
    examId: 'pmp',
    domain: 'Process',
    front: 'What are the Earned Value Management (EVM) formulas for CPI and SPI?',
    back: 'CPI (Cost Performance Index) = EV / AC (< 1.0 is over budget).\nSPI (Schedule Performance Index) = EV / PV (< 1.0 is behind schedule).',
    reference: 'PMI PMBOK Guide 7th Edition',
    state: 'unstudied',
    boxLevel: 1,
  },
  {
    id: 'fc-cism-1',
    examId: 'cism',
    domain: 'Information Risk Management',
    front: 'Who is accountable for accepting residual information security risk in an enterprise?',
    back: 'Senior Management / the Business Process Owner (Risk Owner). The Information Security Manager quantifies risk and recommends controls, but business leadership owns risk acceptance.',
    reference: 'ISACA CISM Review Manual Domain 2',
    state: 'unstudied',
    boxLevel: 1,
  },
  {
    id: 'fc-ceh-1',
    examId: 'ceh',
    domain: 'Reconnaissance & Scanning',
    front: 'How does an Nmap TCP SYN Stealth Scan (`-sS`) determine if a port is open without completing the TCP 3-way handshake?',
    back: 'The scanner sends a SYN packet. If the target responds with SYN/ACK (port open), the scanner immediately replies with RST instead of ACK, tearing down the connection before application logging.',
    reference: 'EC-Council CEH v12 Module 03',
    state: 'unstudied',
    boxLevel: 1,
  },
];

export const MULTI_EXAM_STUDY_GUIDES: (StudyGuide & { examId: string })[] = [
  ...STUDY_GUIDES.map((g) => ({ ...g, examId: 'cissp' })),
  {
    id: 'guide-aws-vpc-endpoints',
    examId: 'aws-saa',
    domain: 'Design Secure Architectures',
    title: 'AWS VPC Endpoints Deep Dive: Gateway Endpoints vs. AWS PrivateLink',
    readTimeMin: 8,
    summary:
      'Architectural blueprint for keeping S3, DynamoDB, and microservice traffic strictly on the AWS private network.',
    content: [
      '# AWS VPC Endpoints: Gateway vs. Interface (PrivateLink)\n\nOn the AWS Certified Solutions Architect – Associate (SAA-C03) exam, choosing the right private connectivity pattern is tested heavily across both Security and Cost Optimization domains.',
      '### 1. Gateway VPC Endpoints\n- **Supported Services**: Amazon S3 and Amazon DynamoDB **only**.\n- **Mechanism**: Adds a prefix list entry to your VPC Subnet Route Table (`pl-xxxxxx`).\n- **Pricing**: **Free** ($0/hour and $0/GB data processing).\n- **High Availability**: Inherently regional and fault-tolerant across all Availability Zones.',
      '### 2. Interface VPC Endpoints (AWS PrivateLink)\n- **Supported Services**: 100+ AWS Services (SQS, SNS, KMS, Secrets Manager, CloudWatch, ECR) + custom SaaS partner services.\n- **Mechanism**: Provisions an Elastic Network Interface (ENI) with a private IP inside your selected subnets and uses Route 53 Private Hosted Zones.\n- **Pricing**: Billed per endpoint-hour per AZ plus per-GB data processed.',
    ],
    officialReference: 'AWS Well-Architected Framework – Security & Cost Pillars',
    keyTakeaways: [
      'Gateway Endpoints = S3 & DynamoDB only, Route-table based, Free ($0)',
      'Interface Endpoints (PrivateLink) = ENI-based with Security Groups, billed hourly',
      'Gateway Endpoints cannot be traversed across VPC Peering or VPNs; use Interface Endpoints for on-premises Direct Connect access to S3',
    ],
  },
  {
    id: 'guide-secplus-zta',
    examId: 'sec-plus',
    domain: 'General Security Concepts',
    title: 'CompTIA Security+ SY0-701: Zero Trust Control Plane & Data Plane',
    readTimeMin: 6,
    summary:
      'Mastering Adaptive Identity, Threat Scope Reduction, Policy Engine (PE), Policy Administrator (PA), and Policy Enforcement Point (PEP).',
    content: [
      '# Zero Trust Architecture on the SY0-701 Exam\n\nCompTIA SY0-701 Domain 1.2 explicitly tests the structural separation between the Zero Trust Control Plane and Data Plane.',
      '### Control Plane vs. Data Plane\n- **Control Plane (Policy Decision Point - PDP)**:\n  - **Policy Engine (PE)**: The brain that ingests continuous diagnostics, threat intelligence, and identity attributes to calculate a trust score.\n  - **Policy Administrator (PA)**: Issues the session-specific cryptographic token or instructs the PEP to allow/deny the connection.\n- **Data Plane (Policy Enforcement Point - PEP)**:\n  - The inline gateway, agent, or reverse proxy that physically terminates and forwards authorized traffic.',
    ],
    officialReference: 'CompTIA Security+ SY0-701 Objective 1.2 / NIST SP 800-207',
    keyTakeaways: [
      'Control Plane = Policy Engine (PE) + Policy Administrator (PA)',
      'Data Plane = Policy Enforcement Point (PEP)',
      'Implicit trust zones are eliminated; every request is verified per session',
    ],
  },
  {
    id: 'guide-pmp-evm',
    examId: 'pmp',
    domain: 'Process',
    title: 'PMP Exam Mastery: Earned Value Management (EVM) & Agile Velocity',
    readTimeMin: 7,
    summary: 'Complete reference for CPI, SPI,EAC, TCPI, and hybrid sprint burnup/burndown interpretation.',
    content: [
      '# Earned Value Management (EVM) & Hybrid Delivery\n\nUnderstanding whether a project is ahead or behind schedule and under or over budget is essential for PMP Process Domain questions.',
      '### Core Metrics\n- **PV (Planned Value)**: Authorized budget assigned to scheduled work.\n- **EV (Earned Value)**: Measure of work performed expressed in terms of the budget authorized for that work.\n- **AC (Actual Cost)**: Realized cost incurred for the work performed.\n- **CPI = EV / AC**: Above 1.0 is under budget; below 1.0 is over budget.\n- **SPI = EV / PV**: Above 1.0 is ahead of schedule; below 1.0 is behind schedule.',
    ],
    officialReference: 'PMI PMBOK Guide 7th Edition',
    keyTakeaways: [
      'EV always comes FIRST in every EVM variance and index formula',
      'Variance = EV minus (AC or PV); Index = EV divided by (AC or PV)',
      'In Agile, velocity is team-specific and should never be compared across different teams',
    ],
  },
  {
    id: 'guide-cism-gov',
    examId: 'cism',
    domain: 'Information Security Governance',
    title: 'ISACA CISM: Information Security Governance & Risk Ownership',
    readTimeMin: 7,
    summary: 'How to think like an ISACA Information Security Manager on governance and risk scenarios.',
    content: [
      '# Thinking Like a CISM on Exam Day\n\nCISM tests strategic management judgment rather than low-level firewall configuration.',
      '### The Golden Rules of CISM\n1. **Business Alignment First**: Security exists to support business objectives.\n2. **Risk Ownership**: Business Process Owners / Senior Management own risk and accept residual risk; the CISM advises and implements.\n3. **BIA Before BCP/DRP**: Always conduct a Business Impact Analysis before designing recovery strategies.',
    ],
    officialReference: 'ISACA CISM Review Manual 16th Edition',
    keyTakeaways: [
      'Senior management / asset owners accept residual risk',
      'Key Risk Indicators (KRIs) must be leading indicators tied to risk appetite',
      'BIA establishes RTO and RPO priorities',
    ],
  },
  {
    id: 'guide-ceh-recon',
    examId: 'ceh',
    domain: 'Reconnaissance & Scanning',
    title: 'CEH v12 Tactical Reference: Nmap Flags, SQLi & Lateral Movement',
    readTimeMin: 7,
    summary: 'High-yield Nmap scan types, packet crafting flags, and OWASP injection countermeasures.',
    content: [
      '# CEH v12 High-Yield Technical Reference\n\nMastering Nmap switch flags and packet responses is guaranteed to appear on the EC-Council 312-50 exam.',
      '### Essential Nmap Scan Switches\n- `-sS`: TCP SYN Stealth Scan (half-open, sends RST after SYN/ACK).\n- `-sT`: TCP Connect Scan (full 3-way handshake, no root required).\n- `-sU`: UDP Scan (slow, open|filtered when no response, ICMP port unreachable when closed).\n- `-sX`: Xmas Scan (FIN, PSH, URG flags set).\n- `-sN`: Null Scan (no flags set).',
    ],
    officialReference: 'EC-Council CEH v12 Official Study Guide',
    keyTakeaways: [
      '-sS = SYN Stealth | -sT = TCP Connect | -sX = FIN+PSH+URG',
      'Parameterized queries (Prepared Statements) stop SQL Injection at the parser level',
      'Pass-the-Hash abuses NTLM challenge-response without cracking the plaintext password',
    ],
  },
];

/**
 * Authoritative question bank selector for Web Platform.
 * Enforces Certification Content Integrity:
 * - Returns genuine certification-specific questions for FULL_PREP certifications.
 * - Never substitutes CISSP questions when another certification is selected.
 * - Returns an empty array for CATALOG_PREVIEW exams so the UI displays the truthful Catalog Preview notice.
 */
export function getQuestionsForExamId(examId: string): ExamQuestion[] {
  const canonical = normalizeExamId(examId);
  switch (canonical) {
    case 'cissp':
      return CISSP_EXAM_QUESTIONS;
    case 'aws-saa':
      return AWS_SAA_QUESTIONS;
    case 'sec-plus':
      return SEC_PLUS_QUESTIONS;
    case 'pmp':
      return PMP_QUESTIONS;
    case 'cism':
      return CISM_QUESTIONS;
    case 'ceh':
      return CEH_QUESTIONS;
    default:
      return [];
  }
}

export function getFlashcardsForExamId(allFlashcards: Flashcard[], examId: string): Flashcard[] {
  const canonical = normalizeExamId(examId);
  const matching = allFlashcards.filter((fc) => normalizeExamId(fc.examId || 'cissp') === canonical);
  if (matching.length > 0) return matching;
  return MULTI_EXAM_FLASHCARDS.filter((fc) => normalizeExamId(fc.examId || 'cissp') === canonical);
}

export function getStudyGuidesForExamId(examId: string): (StudyGuide & { examId: string })[] {
  const canonical = normalizeExamId(examId);
  return MULTI_EXAM_STUDY_GUIDES.filter((g) => normalizeExamId(g.examId) === canonical);
}

export function getAudioBriefingsForExamId(examId: string): AudioBriefing[] {
  const canonical = normalizeExamId(examId);
  if (canonical === 'cissp') return AUDIO_BRIEFINGS;
  const guides = getStudyGuidesForExamId(canonical);
  if (guides.length === 0) return [];
  const g = guides[0];
  return [
    {
      id: `briefing-${canonical}-01`,
      title: `Executive Audio Deep Dive: ${g.title}`,
      domain: g.domain,
      durationFormatted: '3:45',
      durationSeconds: 225,
      dialogue: [
        {
          speaker: 'Maya',
          timestampSec: 0,
          text: `Welcome to the CertMaster Audio Briefing for ${canonical.toUpperCase()}. Today Liam and I are unpacking ${g.title} in the ${g.domain} domain.`,
        },
        {
          speaker: 'Liam',
          timestampSec: 18,
          text: g.summary,
        },
        {
          speaker: 'Maya',
          timestampSec: 42,
          text: `Here is the number one takeaway for exam day: ${g.keyTakeaways[0] || ''}.`,
        },
        {
          speaker: 'Liam',
          timestampSec: 75,
          text: `And don't forget: ${g.keyTakeaways[1] || ''}. Keep practicing in the domain drill simulator!`,
        },
      ],
    },
  ];
}

export { getExamContentStatus };
