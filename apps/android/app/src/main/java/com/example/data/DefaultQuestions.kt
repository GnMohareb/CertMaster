package com.example.data

import com.example.model.Question
import com.example.model.QuestionDifficulty
import com.example.model.SourceCitation

object DefaultQuestions {

    val CISSP_QUESTIONS = listOf(
        Question(
            id = "cissp_q1",
            examId = "cissp",
            domainId = "d1",
            domainName = "Security and Risk Management",
            questionText = "An organization has suffered a ransomware breach that rendered all patient billing records inaccessible. The Chief Information Security Officer (CISO) is evaluating business impact. Which metric specifies the maximum acceptable period of data loss measured in time prior to the disruption?",
            options = listOf(
                "Maximum Tolerable Downtime (MTD)",
                "Recovery Point Objective (RPO)",
                "Recovery Time Objective (RTO)",
                "Work Recovery Time (WRT)"
            ),
            correctIndex = 1,
            explanation = "Recovery Point Objective (RPO) dictates the acceptable amount of data loss expressed in time (e.g., 4 hours of transaction logs). It determines how frequently backups and replications must occur.",
            optionAnalysis = mapOf(
                0 to "MTD is the maximum overarching time the business can survive without the system before irreparable harm occurs.",
                1 to "CORRECT. RPO measures data loss tolerance prior to the incident, dictating backup intervals.",
                2 to "RTO is the target duration of time within which a business process must be restored after a disaster.",
                3 to "WRT is the time needed after systems are brought online to test data integrity, replay logs, and verify operations."
            ),
            citation = SourceCitation(
                title = "NIST SP 800-34 Rev. 1: Contingency Planning Guide for Federal Information Systems",
                sectionOrPage = "Section 3.2: Business Impact Analysis (BIA) Metrics",
                standardOrFramework = "NIST BIA Framework"
            ),
            difficulty = QuestionDifficulty.MEDIUM
        ),
        Question(
            id = "cissp_q2",
            examId = "cissp",
            domainId = "d3",
            domainName = "Security Architecture and Engineering",
            questionText = "In a multi-level secure operating system designed according to formal access control models, which mathematical model enforces the *no write-down* (*-property) and *no read-up* (Simple Security Property) to guarantee confidentiality?",
            options = listOf(
                "Biba Integrity Model",
                "Clark-Wilson Model",
                "Bell-LaPadula Model",
                "Brewer-Nash (Chinese Wall) Model"
            ),
            correctIndex = 2,
            explanation = "The Bell-LaPadula model is a state machine confidentiality model. It enforces the Simple Security Property (no read-up: a subject at a lower classification cannot read higher classification objects) and the *-Property (no write-down: a subject at a higher classification cannot write to lower classification objects).",
            optionAnalysis = mapOf(
                0 to "Biba enforces data integrity, using the inverse rules: no read-down and no write-up.",
                1 to "Clark-Wilson focuses on commercial integrity through well-formed transactions and separation of duty.",
                2 to "CORRECT. Bell-LaPadula strictly prevents unauthorized confidentiality leaks using *-property and simple security.",
                3 to "Brewer-Nash dynamically mitigates conflicts of interest in consulting/financial services."
            ),
            citation = SourceCitation(
                title = "(ISC)² CISSP Official Study Guide 9th Edition",
                sectionOrPage = "Chapter 7: Formal Security Models & Cryptography",
                standardOrFramework = "Bell-LaPadula Confidentiality Model"
            ),
            difficulty = QuestionDifficulty.HARD
        ),
        Question(
            id = "cissp_q3",
            examId = "cissp",
            domainId = "d4",
            domainName = "Communication and Network Security",
            questionText = "When configuring an IPsec tunnel between a corporate datacenter and an AWS VPC in Tunnel Mode, which protocol header should be selected if both confidentiality (payload encryption) and integrity/authentication of the payload are required?",
            options = listOf(
                "Authentication Header (AH)",
                "Encapsulating Security Payload (ESP)",
                "Generic Routing Encapsulation (GRE)",
                "Layer 2 Tunneling Protocol (L2TP)"
            ),
            correctIndex = 1,
            explanation = "Encapsulating Security Payload (ESP, IP protocol 50) provides confidentiality through encryption as well as message integrity, data origin authentication, and anti-replay protection. AH (protocol 51) provides integrity and authentication but NO encryption.",
            optionAnalysis = mapOf(
                0 to "AH provides integrity and non-repudiation across the entire packet, but zero confidentiality/encryption.",
                1 to "CORRECT. ESP provides both strong symmetric encryption (confidentiality) and HMAC authentication.",
                2 to "GRE encapsulates multiprotocol packets but provides no inherent cryptographic protection.",
                3 to "L2TP creates virtual circuits at Layer 2 but relies on IPsec underneath for security."
            ),
            citation = SourceCitation(
                title = "IETF RFC 4303: IP Encapsulating Security Payload (ESP)",
                sectionOrPage = "Section 2: Packet Format and Security Services",
                standardOrFramework = "IPsec Protocol Suite"
            ),
            difficulty = QuestionDifficulty.MEDIUM
        ),
        Question(
            id = "cissp_q4",
            examId = "cissp",
            domainId = "d5",
            domainName = "Identity and Access Management (IAM)",
            questionText = "A SaaS enterprise provides a web portal where end-users delegate access to their cloud storage files to a third-party analytics app without sharing their master password. Which open standard should be implemented to issue scoped access tokens?",
            options = listOf(
                "SAML 2.0 Web Browser SSO",
                "OAuth 2.0 Authorization Framework",
                "Kerberos v5 Cross-Realm Protocol",
                "LDAP v3 over TLS (LDAPS)"
            ),
            correctIndex = 1,
            explanation = "OAuth 2.0 (RFC 6749) is designed specifically for delegated authorization, allowing a third-party client to obtain limited access to an HTTP service on behalf of a resource owner by issuing bearer tokens.",
            optionAnalysis = mapOf(
                0 to "SAML 2.0 is an XML-based federated authentication assertion standard, typically used for enterprise Web SSO, not token-based delegated authorization.",
                1 to "CORRECT. OAuth 2.0 is the international gold standard for delegated access tokens.",
                2 to "Kerberos is an internal ticket-granting service relying on symmetric key cryptography and a central KDC.",
                3 to "LDAP is an enterprise directory query protocol for accessing user attribute trees."
            ),
            citation = SourceCitation(
                title = "IETF RFC 6749: The OAuth 2.0 Authorization Framework",
                sectionOrPage = "Section 1.1: Roles and Token Issuance",
                standardOrFramework = "OAuth 2.0 Standard"
            ),
            difficulty = QuestionDifficulty.EASY
        ),
        Question(
            id = "cissp_q5",
            examId = "cissp",
            domainId = "d7",
            domainName = "Security Operations",
            questionText = "A forensic investigator arrives at the scene of an active Advanced Persistent Threat (APT) compromise where an attacker has injected malware into memory. According to the standard forensic Order of Volatility, which artifact must be captured first?",
            options = listOf(
                "Hard drive partition bitstream image",
                "CPU registers, cache, and physical RAM",
                "Network switch ARP tables and routing cache",
                "Archival optical backup tapes"
            ),
            correctIndex = 1,
            explanation = "The Order of Volatility (RFC 3227) dictates that forensic investigators preserve evidence starting with the most volatile items that vanish upon power loss. CPU cache, registers, and volatile RAM disappear immediately when system power cycles.",
            optionAnalysis = mapOf(
                0 to "Hard drive disks are non-volatile storage and remain intact across reboots.",
                1 to "CORRECT. Registers and RAM are the most ephemeral and must be acquired first to preserve injected memory code and encryption keys.",
                2 to "Network tables are volatile, but CPU registers and local physical RAM precede external routing buffers.",
                3 to "Optical media is permanent static media and has the lowest volatility priority."
            ),
            citation = SourceCitation(
                title = "IETF RFC 3227: Guidelines for Evidence Collection and Archiving",
                sectionOrPage = "Section 2.1: Order of Volatility",
                standardOrFramework = "NIST SP 800-86 Digital Forensics"
            ),
            difficulty = QuestionDifficulty.MEDIUM
        ),
        Question(
            id = "cissp_q6",
            examId = "cissp",
            domainId = "d8",
            domainName = "Software Development Security",
            questionText = "During a DevSecOps code review, a security engineer detects that user input passed into an SQL database query is directly concatenated into the statement string. Which remediation technique most effectively neutralizes SQL Injection vulnerabilities?",
            options = listOf(
                "Client-side JavaScript input sanitation",
                "Parameterized queries (Prepared Statements)",
                "Installing a Web Application Firewall (WAF) regex filter",
                "Encoding output in Base64 before rendering"
            ),
            correctIndex = 1,
            explanation = "Parameterized queries (prepared statements) ensure the database engine compiles the SQL code structure first, treating any user input strictly as literal parameter data rather than executable SQL syntax.",
            optionAnalysis = mapOf(
                0 to "Client-side validation can be effortlessly bypassed using curl, Postman, or proxy tools like Burp Suite.",
                1 to "CORRECT. Prepared statements ensure input is never interpreted as command instructions by the SQL parser.",
                2 to "A WAF is a detective/protective defense-in-depth layer but does not fix the root software defect.",
                3 to "Output encoding protects against Cross-Site Scripting (XSS), not server-side SQL injection."
            ),
            citation = SourceCitation(
                title = "OWASP Top 10 Web Application Vulnerabilities",
                sectionOrPage = "A03:2021 - Injection Prevention Cheat Sheet",
                standardOrFramework = "OWASP Secure Coding Guide"
            ),
            difficulty = QuestionDifficulty.EASY
        ),
        Question(
            id = "cissp_q7",
            examId = "cissp",
            domainId = "d2",
            domainName = "Asset Security",
            questionText = "An enterprise is decommissioning high-security magnetic disk drives containing sensitive PII and trade secrets. According to NIST SP 800-88 Rev. 1, which method guarantees that data cannot be recovered using advanced laboratory techniques?",
            options = listOf(
                "Clearing the drive using OS standard formatting",
                "Purging the drive via Cryptographic Erase (CE) or Degaussing followed by Physical Disintegration",
                "Overwriting all sectors with zeroes in a single pass",
                "Renaming the file system partition table"
            ),
            correctIndex = 1,
            explanation = "NIST SP 800-88 defines three sanitization levels: Clear, Purge, and Destroy. Purging and Physical Destruction (e.g., degaussing magnetic drives, incineration, shredding) renders target data recovery infeasible even using advanced state laboratory forensic recovery tools.",
            optionAnalysis = mapOf(
                0 to "Clear only protects against simple non-invasive recovery through normal system utilities.",
                1 to "CORRECT. Purge / Destroy ensures data is permanently unrecoverable even against laboratory attacks.",
                2 to "Single pass zeroing is a basic Clear operation, not a certified Purge for magnetic media.",
                3 to "Partition table modification leaves raw sector data completely intact on the platter."
            ),
            citation = SourceCitation(
                title = "NIST SP 800-88 Rev. 1: Guidelines for Media Sanitization",
                sectionOrPage = "Table A-1: Sanitization Methods for Magnetic Media",
                standardOrFramework = "NIST Media Sanitization"
            ),
            difficulty = QuestionDifficulty.HARD
        ),
        Question(
            id = "cissp_q8",
            examId = "cissp",
            domainId = "d6",
            domainName = "Security Assessment and Testing",
            questionText = "A SaaS provider must demonstrate to enterprise customers and external auditors that their security controls governing customer confidentiality and system availability are operating effectively over a continuous 12-month evaluation window. Which report should be provided?",
            options = listOf(
                "SOC 1 Type I Report",
                "SOC 2 Type I Report",
                "SOC 2 Type II Report",
                "ISO 9001 Certificate"
            ),
            correctIndex = 2,
            explanation = "A SOC 2 Type II report evaluates the operational effectiveness of security controls over an extended historical period (typically 6 to 12 months), whereas a Type I report is merely a snapshot at a single point in time.",
            optionAnalysis = mapOf(
                0 to "SOC 1 reports focus strictly on Internal Controls over Financial Reporting (ICFR).",
                1 to "SOC 2 Type I evaluates control design at a single point in time, not ongoing operational effectiveness.",
                2 to "CORRECT. SOC 2 Type II tests both control design and operational effectiveness over a continuous duration.",
                3 to "ISO 9001 is a general quality management standard, not a cybersecurity Trust Services audit."
            ),
            citation = SourceCitation(
                title = "AICPA Trust Services Criteria for Security, Availability, and Confidentiality",
                sectionOrPage = "Section TSP 100: Type 1 vs Type 2 Attestation Standards",
                standardOrFramework = "AICPA SOC Reporting"
            ),
            difficulty = QuestionDifficulty.MEDIUM
        )
    )

    val AWS_SAA_QUESTIONS = listOf(
        Question(
            id = "aws-saa-q01",
            examId = "aws-saa",
            domainId = "aws-d1",
            domainName = "Design Secure Architectures",
            questionText = "A financial services enterprise runs workloads on Amazon EC2 instances in private subnets across multiple Availability Zones without NAT Gateways. The instances must securely access an Amazon S3 bucket containing encrypted regulatory archives without traffic ever traversing the public internet. Which AWS configuration meets this requirement with zero hourly data processing charges?",
            options = listOf(
                "Create a Gateway VPC Endpoint for Amazon S3, update the private subnet route tables, and apply a VPC Endpoint Policy",
                "Deploy an AWS Transit Gateway attached to an AWS Direct Connect connection",
                "Provision a NAT Instance in a public subnet and allow outbound HTTPS port 443",
                "Configure Amazon CloudFront with an Origin Access Control (OAC)"
            ),
            correctIndex = 0,
            explanation = "A Gateway VPC Endpoint for Amazon S3 adds a prefix list route directly into your VPC route tables, routing traffic privately over the AWS backbone network with zero hourly endpoint fees or per-GB data processing charges.",
            optionAnalysis = mapOf(
                0 to "CORRECT. Gateway VPC Endpoints for S3 and DynamoDB are free and route traffic privately via VPC route tables.",
                1 to "Transit Gateway and Direct Connect add unnecessary cost and complexity for intra-region S3 access.",
                2 to "NAT Instances route traffic over the public Internet Gateway and incur EC2 instance costs.",
                3 to "CloudFront is a public edge CDN and requires internet egress."
            ),
            citation = SourceCitation(
                title = "AWS Well-Architected Framework – Security Pillar",
                sectionOrPage = "SEC05-BP02: Gateway VPC Endpoints",
                standardOrFramework = "Amazon VPC User Guide"
            ),
            difficulty = QuestionDifficulty.HARD
        ),
        Question(
            id = "aws-saa-q02",
            examId = "aws-saa",
            domainId = "aws-d2",
            domainName = "Design Resilient Architectures",
            questionText = "An e-commerce platform uses an Amazon RDS for PostgreSQL database in a single Availability Zone. Management mandates automatic failover to a standby replica in another AZ with zero data loss (RPO = 0) and recovery under 2 minutes. Which architectural change satisfies these resilience requirements?",
            options = listOf(
                "Create an asynchronous Cross-Region Read Replica",
                "Modify the RDS instance to enable Multi-AZ deployment with synchronous physical replication",
                "Schedule automated EBS snapshots every 5 minutes",
                "Place an Application Load Balancer in front of the single-AZ RDS endpoint"
            ),
            correctIndex = 1,
            explanation = "Amazon RDS Multi-AZ deployments provision and maintain a synchronous standby replica in a different Availability Zone (RPO = 0) and automatically fail over DNS within 60-120 seconds.",
            optionAnalysis = mapOf(
                0 to "Read Replicas use asynchronous replication (non-zero RPO) and require manual promotion.",
                1 to "CORRECT. RDS Multi-AZ provides synchronous replication and automated failover across Availability Zones.",
                2 to "Snapshots have a minimum 5-minute RPO and require full instance restoration (high RTO).",
                3 to "Application Load Balancers operate at Layer 7 HTTP/HTTPS and cannot load-balance PostgreSQL single-AZ storage."
            ),
            citation = SourceCitation(
                title = "AWS Well-Architected Framework – Reliability Pillar",
                sectionOrPage = "REL09-BP01: Amazon RDS Multi-AZ High Availability",
                standardOrFramework = "Amazon RDS User Guide"
            ),
            difficulty = QuestionDifficulty.MEDIUM
        ),
        Question(
            id = "aws-saa-q03",
            examId = "aws-saa",
            domainId = "aws-d3",
            domainName = "Design High-Performing Architectures",
            questionText = "A real-time global leaderboard backed by Amazon DynamoDB experiences hot-partition read throttling and 25ms read latencies during tournament finals. Which solution reduces read latency to microseconds without application refactoring?",
            options = listOf(
                "Deploy Amazon DynamoDB Accelerator (DAX) as a managed in-memory write-through cache",
                "Migrate the leaderboard table to Amazon Redshift Serverless",
                "Export DynamoDB data nightly to Amazon S3 and query with Amazon Athena",
                "Enable DynamoDB Streams and invoke AWS Step Functions on every read"
            ),
            correctIndex = 0,
            explanation = "Amazon DynamoDB Accelerator (DAX) is a fully managed, API-compatible in-memory cache for DynamoDB that delivers microsecond read latency and absorbs extreme read spikes.",
            optionAnalysis = mapOf(
                0 to "CORRECT. DAX is API-compatible with DynamoDB and reduces read latency from milliseconds to microseconds.",
                1 to "Redshift is an analytical data warehouse, not a microsecond key-value store.",
                2 to "Athena is for ad-hoc S3 SQL analytics with multi-second query latency.",
                3 to "DynamoDB Streams capture write modifications, not cached read queries."
            ),
            citation = SourceCitation(
                title = "AWS Well-Architected Framework – Performance Efficiency Pillar",
                sectionOrPage = "PERF04-BP03: In-Memory Acceleration with DAX",
                standardOrFramework = "Amazon DynamoDB Developer Guide"
            ),
            difficulty = QuestionDifficulty.MEDIUM
        ),
        Question(
            id = "aws-saa-q04",
            examId = "aws-saa",
            domainId = "aws-d4",
            domainName = "Design Cost-Optimized Architectures",
            questionText = "A biotech enterprise stores 850 TB of genomic files in Amazon S3 with unpredictable access patterns. When researchers request any file, retrieval must be immediate (milliseconds) with zero retrieval fees. Which S3 storage class optimizes costs automatically?",
            options = listOf(
                "Amazon S3 Intelligent-Tiering",
                "Amazon S3 Glacier Deep Archive",
                "Amazon S3 One Zone-Infrequent Access (S3 One Zone-IA)",
                "Amazon FSx for Lustre persistent SSD"
            ),
            correctIndex = 0,
            explanation = "Amazon S3 Intelligent-Tiering automatically moves objects between Frequent, Infrequent, and Archive Instant Access tiers based on access patterns with millisecond latency and zero retrieval fees.",
            optionAnalysis = mapOf(
                0 to "CORRECT. S3 Intelligent-Tiering automatically transitions objects across access tiers with no retrieval charges.",
                1 to "Glacier Deep Archive requires 12-48 hours for restoration and charges retrieval fees.",
                2 to "One Zone-IA charges per-GB retrieval fees and lacks Multi-AZ resilience.",
                3 to "FSx for Lustre is high-cost HPC scratch storage."
            ),
            citation = SourceCitation(
                title = "AWS Well-Architected Framework – Cost Optimization Pillar",
                sectionOrPage = "COST06-BP02: Amazon S3 Intelligent-Tiering",
                standardOrFramework = "Amazon S3 User Guide"
            ),
            difficulty = QuestionDifficulty.EASY
        ),
        Question(
            id = "aws-saa-q05",
            examId = "aws-saa",
            domainId = "aws-d1",
            domainName = "Design Secure Architectures",
            questionText = "A multi-account AWS Organization wants to ensure that no IAM user or role—even an account root user or AdministratorAccess principal in a member account—can ever disable AWS CloudTrail logging or delete flow logs in any region. Which AWS governance mechanism enforces this guardrail centrally?",
            options = listOf(
                "Attach a Service Control Policy (SCP) in AWS Organizations with an explicit Deny on cloudtrail:StopLogging and ec2:DeleteFlowLogs",
                "Create an IAM Group in each member account and attach ReadOnlyAccess",
                "Configure AWS Trusted Advisor weekly email alerts",
                "Use Amazon Inspector to scan IAM roles for unused permissions"
            ),
            correctIndex = 0,
            explanation = "Service Control Policies (SCPs) in AWS Organizations define maximum permission guardrails for all principals in member accounts, including the member account root user.",
            optionAnalysis = mapOf(
                0 to "CORRECT. An explicit Deny in an AWS Organizations SCP cannot be overridden by any local IAM policy.",
                1 to "IAM groups do not restrict root users or existing AdministratorAccess roles.",
                2 to "Trusted Advisor is detective/advisory, not a preventive guardrail.",
                3 to "Amazon Inspector scans workloads for CVEs and network exposure."
            ),
            citation = SourceCitation(
                title = "AWS Organizations User Guide",
                sectionOrPage = "Service Control Policies (SCPs) Evaluation Logic",
                standardOrFramework = "AWS Governance & Guardrails"
            ),
            difficulty = QuestionDifficulty.HARD
        )
    )

    val SEC_PLUS_QUESTIONS = listOf(
        Question(
            id = "sec-plus-q01",
            examId = "sec-plus",
            domainId = "sec-d1",
            domainName = "General Security Concepts",
            questionText = "In a Zero Trust Architecture (SY0-701 Domain 1.2), when a clinician requests access to an EMR API, which Control Plane component evaluates contextual trust signals (identity, device posture, geolocation) and makes the access decision?",
            options = listOf(
                "Policy Decision Point (PDP) — comprising the Policy Engine (PE) and Policy Administrator (PA)",
                "Policy Enforcement Point (PEP)",
                "PKI Registration Authority (RA)",
                "Physical Intrusion Detection Sensor"
            ),
            correctIndex = 0,
            explanation = "In Zero Trust Architecture (NIST SP 800-207), the Control Plane houses the Policy Decision Point (PDP), consisting of the Policy Engine (PE) and Policy Administrator (PA), while the Policy Enforcement Point (PEP) sits in the Data Plane.",
            optionAnalysis = mapOf(
                0 to "CORRECT. The PDP (PE + PA) evaluates trust rules and issues session tokens in the Control Plane.",
                1 to "The PEP sits in the Data Plane and enforces the decision made by the PDP.",
                2 to "An RA verifies identity for digital certificates, not per-session Zero Trust telemetry.",
                3 to "Physical sensors detect facility intrusion."
            ),
            citation = SourceCitation(
                title = "CompTIA Security+ SY0-701 Exam Objectives",
                sectionOrPage = "Objective 1.2: Zero Trust Control Plane vs Data Plane",
                standardOrFramework = "NIST SP 800-207 Zero Trust Architecture"
            ),
            difficulty = QuestionDifficulty.MEDIUM
        ),
        Question(
            id = "sec-plus-q02",
            examId = "sec-plus",
            domainId = "sec-d2",
            domainName = "Threats, Vulnerabilities, and Mitigations",
            questionText = "A company's CFO receives a synthetic AI video call and voice message impersonating the CEO, instructing an urgent wire transfer. Which threat vector and social engineering technique does this represent?",
            options = listOf(
                "Whaling combined with AI-generated Deepfake / Vishing impersonation",
                "Watering Hole attack utilizing DNS cache poisoning",
                "Bluejacking over Bluetooth PAN",
                "Typosquatting via Punycode domains"
            ),
            correctIndex = 0,
            explanation = "Targeting a C-level executive (CFO) is Whaling, and using synthetic audio/video to impersonate authority over voice/video channels combines deepfake impersonation with vishing.",
            optionAnalysis = mapOf(
                0 to "CORRECT. Executive targeting is Whaling, executed via AI deepfake vishing.",
                1 to "Watering hole attacks compromise third-party websites frequented by a target group.",
                2 to "Bluejacking sends unsolicited messages over Bluetooth.",
                3 to "Typosquatting registers look-alike domain names."
            ),
            citation = SourceCitation(
                title = "CompTIA Security+ SY0-701 Exam Objectives",
                sectionOrPage = "Objective 2.2: Social Engineering & Impersonation",
                standardOrFramework = "CompTIA SY0-701 Curriculum"
            ),
            difficulty = QuestionDifficulty.EASY
        ),
        Question(
            id = "sec-plus-q03",
            examId = "sec-plus",
            domainId = "sec-d4",
            domainName = "Security Operations",
            questionText = "A SOC analyst wants a platform that automatically parses reported phishing emails, queries threat intel feeds, quarantines matching messages across all mailboxes, and opens a ticket via automated playbooks. Which platform provides this?",
            options = listOf(
                "SOAR (Security Orchestration, Automation, and Response)",
                "FIM (File Integrity Monitoring)",
                "DLP USB Blocker",
                "NetFlow Collector"
            ),
            correctIndex = 0,
            explanation = "SOAR executes automated playbooks and orchestrates response actions across third-party tools to reduce Mean Time to Respond (MTTR).",
            optionAnalysis = mapOf(
                0 to "CORRECT. SOAR automates incident response runbooks across email, EDR, and ticketing tools.",
                1 to "FIM monitors critical OS files for unauthorized hash changes.",
                2 to "DLP blocks unauthorized data exfiltration.",
                3 to "NetFlow captures network flow metadata."
            ),
            citation = SourceCitation(
                title = "CompTIA Security+ SY0-701 Exam Objectives",
                sectionOrPage = "Objective 4.4 / 4.8: SOAR Playbook Automation",
                standardOrFramework = "CompTIA SY0-701 Official Study Guide"
            ),
            difficulty = QuestionDifficulty.MEDIUM
        ),
        Question(
            id = "sec-plus-q04",
            examId = "sec-plus",
            domainId = "sec-d3",
            domainName = "Security Architecture",
            questionText = "An industrial water treatment facility operates legacy Programmable Logic Controllers (PLCs) running proprietary SCADA protocols that cannot support modern endpoint detection agents or frequent OS reboots. Which architectural security control best protects these ICS/SCADA devices?",
            options = listOf(
                "Network segmentation using an Industrial DMZ, Purdue Model zoning, and unidirectional security gateways (data diodes)",
                "Exposing the PLCs directly to the corporate Wi-Fi network for rapid remote patching",
                "Configuring automated daily vulnerability exploitation scans against the live PLCs",
                "Replacing TCP/IP with unencrypted Telnet management sessions"
            ),
            correctIndex = 0,
            explanation = "Operational Technology (OT) and ICS/SCADA environments isolate fragile PLCs in segmented zones separated from corporate IT by an Industrial DMZ and hardware data diodes.",
            optionAnalysis = mapOf(
                0 to "CORRECT. Purdue Model zoning, Industrial DMZs, and data diodes isolate fragile OT/SCADA assets.",
                1 to "Bridging IT Wi-Fi directly to OT exposes PLCs to lateral movement.",
                2 to "Active exploitation scans can crash legacy PLC network stacks.",
                3 to "Telnet transmits credentials and commands in cleartext."
            ),
            citation = SourceCitation(
                title = "CompTIA Security+ SY0-701 & NIST SP 800-82",
                sectionOrPage = "Objective 3.1 / 3.2: ICS/SCADA Segmentation",
                standardOrFramework = "NIST SP 800-82 Rev 3 OT Security"
            ),
            difficulty = QuestionDifficulty.HARD
        ),
        Question(
            id = "sec-plus-q05",
            examId = "sec-plus",
            domainId = "sec-d5",
            domainName = "Security Program Management & Oversight",
            questionText = "Two SaaS companies are entering a partnership where Company A will host and process credit applications for Company B. Which third-party governance document defines the exact technical encryption standards, VPN cipher suites, and API authentication protocols required between their systems?",
            options = listOf(
                "Interconnection Security Agreement (ISA)",
                "Non-Disclosure Agreement (NDA)",
                "Memorandum of Understanding (MOU)",
                "Acceptable Use Policy (AUP)"
            ),
            correctIndex = 0,
            explanation = "An Interconnection Security Agreement (ISA) specifies the technical and security requirements for establishing, operating, and maintaining a direct system-to-system connection between two organizations (NIST SP 800-47).",
            optionAnalysis = mapOf(
                0 to "CORRECT. An ISA defines technical security parameters for system interconnections.",
                1 to "An NDA governs confidential information handling, not technical VPN/API specs.",
                2 to "An MOU expresses high-level intent between parties.",
                3 to "An AUP defines acceptable employee workstation/network behavior."
            ),
            citation = SourceCitation(
                title = "CompTIA Security+ SY0-701 & NIST SP 800-47",
                sectionOrPage = "Objective 5.4: Third-Party Risk Assessment and Vendor Agreements",
                standardOrFramework = "NIST SP 800-47 Rev 1"
            ),
            difficulty = QuestionDifficulty.MEDIUM
        )
    )

    val PMP_QUESTIONS = listOf(
        Question(
            id = "pmp-q01",
            examId = "pmp",
            domainId = "pmp-d2",
            domainName = "Process",
            questionText = "An infrastructure project has a Budget at Completion (BAC) of $500,000. At month 6, Planned Value (PV) is $250,000, Earned Value (EV) is $200,000, and Actual Cost (AC) is $250,000. What are the CPI and SPI, and what is the project status?",
            options = listOf(
                "CPI = 0.80 and SPI = 0.80; the project is both over budget and behind schedule",
                "CPI = 1.25 and SPI = 1.00; the project is under budget and on schedule",
                "CPI = 1.00 and SPI = 0.80; the project is on budget but behind schedule",
                "CPI = 0.80 and SPI = 1.25; the project is over budget but ahead of schedule"
            ),
            correctIndex = 0,
            explanation = "CPI = EV / AC = 200,000 / 250,000 = 0.80 (< 1.0 is over budget). SPI = EV / PV = 200,000 / 250,000 = 0.80 (< 1.0 is behind schedule).",
            optionAnalysis = mapOf(
                0 to "CORRECT. Both CPI and SPI are 0.80, indicating the project is over budget and behind schedule.",
                1 to "Inverts EV and AC.",
                2 to "Incorrectly calculates CPI as 1.00.",
                3 to "Inverts EV and PV."
            ),
            citation = SourceCitation(
                title = "PMI PMBOK Guide 7th Edition",
                sectionOrPage = "Domain II: Process – Earned Value Management (EVM)",
                standardOrFramework = "PMI Standard for Earned Value Management"
            ),
            difficulty = QuestionDifficulty.MEDIUM
        ),
        Question(
            id = "pmp-q02",
            examId = "pmp",
            domainId = "pmp-d1",
            domainName = "People",
            questionText = "Midway through a hybrid transformation project, two senior engineers disagree on the microservice message broker architecture, causing sprint velocity to drop by 25%. Both engineers have valid technical points. What should the Project Manager do first?",
            options = listOf(
                "Facilitate a collaborative problem-solving workshop where both engineers evaluate objective trade-offs against project quality criteria",
                "Immediately escalate the dispute to the project sponsor to mandate a decision",
                "Reassign one of the engineers to a different project team",
                "Select the cheaper option unilaterally"
            ),
            correctIndex = 0,
            explanation = "In PMI People Domain (Task 1.1: Manage Conflict), Collaborate/Problem-Solve is the preferred win-win conflict resolution technique when technical consensus improves commitment.",
            optionAnalysis = mapOf(
                0 to "CORRECT. Collaborating/Problem-Solving builds consensus and objective technical alignment.",
                1 to "Premature escalation bypasses team autonomy.",
                2 to "Avoidance/withdrawal disrupts team cohesion.",
                3 to "Forcing erodes psychological safety and buy-in."
            ),
            citation = SourceCitation(
                title = "PMI PMBOK Guide 7th Edition & Agile Practice Guide",
                sectionOrPage = "Domain I: People – Task 1: Manage Conflict",
                standardOrFramework = "PMI Examination Content Outline"
            ),
            difficulty = QuestionDifficulty.MEDIUM
        ),
        Question(
            id = "pmp-q03",
            examId = "pmp",
            domainId = "pmp-d3",
            domainName = "Business Environment",
            questionText = "During an Agile project delivering a customer portal, a new data privacy law is enacted mandating explicit opt-in consent auditing within 60 days. How should the Project Manager and Product Owner handle this regulatory change?",
            options = listOf(
                "Assess the compliance impact, create high-priority compliance user stories, and reprioritize the Product Backlog with the Product Owner for the upcoming sprint",
                "Complete all originally planned cosmetic features first and address legal compliance next year",
                "Cancel the current sprint immediately without consulting the Product Owner",
                "Ask the development team to work unpaid overtime"
            ),
            correctIndex = 0,
            explanation = "Mandatory regulatory compliance takes precedence in backlog refinement (Domain III: Business Environment, Task 3.1: Plan and manage project compliance).",
            optionAnalysis = mapOf(
                0 to "CORRECT. Reprioritizing the Product Backlog with the Product Owner ensures timely statutory compliance.",
                1 to "Deferring mandatory legal compliance exposes the enterprise to statutory fines.",
                2 to "Only the Product Owner cancels a sprint when the Sprint Goal becomes obsolete.",
                3 to "Unsustainable pace violates Agile sustainable delivery principles."
            ),
            citation = SourceCitation(
                title = "PMI PMP Examination Content Outline (ECO)",
                sectionOrPage = "Domain III: Business Environment – Plan and Manage Compliance",
                standardOrFramework = "PMI Agile Practice Guide"
            ),
            difficulty = QuestionDifficulty.MEDIUM
        )
    )

    val CISM_QUESTIONS = listOf(
        Question(
            id = "cism-q01",
            examId = "cism",
            domainId = "cism-d2",
            domainName = "Information Risk Management",
            questionText = "After implementing MFA and EDR on a financial ERP system, a residual risk of $85,000/year remains. Who holds the authority to formally accept this residual risk?",
            options = listOf(
                "Senior Management / the Business Process Owner (Risk Owner)",
                "The Information Security Manager (CISM)",
                "The External Financial Auditor",
                "The SOC Tier-2 Analyst"
            ),
            correctIndex = 0,
            explanation = "In ISACA risk governance, the Information Security Manager quantifies risk and recommends controls, but only Senior Management / the Business Process Owner holds fiduciary authority to accept residual business risk.",
            optionAnalysis = mapOf(
                0 to "CORRECT. Business owners/senior management own the business asset and accept residual risk.",
                1 to "The CISM advises and implements controls but does not own business risk.",
                2 to "Auditors provide independent assurance and cannot make management decisions.",
                3 to "SOC analysts monitor operational alerts."
            ),
            citation = SourceCitation(
                title = "ISACA CISM Review Manual (16th Edition)",
                sectionOrPage = "Domain 2: Information Risk Management – Residual Risk Acceptance",
                standardOrFramework = "ISACA Risk IT Framework"
            ),
            difficulty = QuestionDifficulty.MEDIUM
        ),
        Question(
            id = "cism-q02",
            examId = "cism",
            domainId = "cism-d1",
            domainName = "Information Security Governance",
            questionText = "A newly appointed Information Security Manager discovers that security projects are frequently defunded mid-year because executive leadership views cybersecurity purely as an IT cost center. What is the MOST effective action to establish sustainable executive support?",
            options = listOf(
                "Align the information security strategy directly with enterprise business objectives, risk appetite, and board-level governance metrics",
                "Purchase an advanced AI firewall to demonstrate technical sophistication",
                "Delegate security funding decisions to junior system administrators",
                "Increase the frequency of vulnerability scan PDF emails sent to the CEO"
            ),
            correctIndex = 0,
            explanation = "Strategic alignment between information security initiatives, enterprise business objectives, and board risk appetite is the cornerstone of ISACA CISM Domain 1.",
            optionAnalysis = mapOf(
                0 to "CORRECT. Aligning security governance with business goals and risk appetite secures executive sponsorship.",
                1 to "Tool purchases without business alignment reinforce the cost-center perception.",
                2 to "Governance cannot be delegated to junior operational staff.",
                3 to "Raw technical scan data does not communicate business risk value to executives."
            ),
            citation = SourceCitation(
                title = "ISACA CISM Review Manual (16th Edition)",
                sectionOrPage = "Domain 1: Information Security Governance – Strategic Alignment",
                standardOrFramework = "ISACA CISM Official Curriculum"
            ),
            difficulty = QuestionDifficulty.HARD
        ),
        Question(
            id = "cism-q03",
            examId = "cism",
            domainId = "cism-d4",
            domainName = "Incident Management",
            questionText = "An enterprise is developing its Business Continuity Plan (BCP) and Disaster Recovery Plan (DRP). Which foundational document provides the prioritized recovery order of critical business applications and establishes authoritative RTO/RPO targets?",
            options = listOf(
                "Business Impact Analysis (BIA)",
                "Vulnerability Assessment Report",
                "Acceptable Use Policy (AUP)",
                "Employee Onboarding Handbook"
            ),
            correctIndex = 0,
            explanation = "The Business Impact Analysis (BIA) identifies critical business processes, maps IT dependencies, quantifies downtime impact, and establishes RTO and RPO targets.",
            optionAnalysis = mapOf(
                0 to "CORRECT. The BIA is the mandatory foundation that establishes RTO, RPO, and recovery priorities.",
                1 to "Vulnerability assessments identify technical flaws, not business continuity priorities.",
                2 to "An AUP governs user behavior.",
                3 to "HR handbooks do not define disaster recovery objectives."
            ),
            citation = SourceCitation(
                title = "ISACA CISM Review Manual",
                sectionOrPage = "Domain 4: Incident Management – BIA & DRP Integration",
                standardOrFramework = "ISACA CISM Domain 4 Standard"
            ),
            difficulty = QuestionDifficulty.MEDIUM
        )
    )

    val CEH_QUESTIONS = listOf(
        Question(
            id = "ceh-q01",
            examId = "ceh",
            domainId = "ceh-d1",
            domainName = "Reconnaissance & Scanning",
            questionText = "During an authorized penetration test, an ethical hacker wants to identify open TCP ports without completing the full 3-way TCP handshake. Which Nmap scan flag performs a half-open TCP SYN stealth scan?",
            options = listOf(
                "nmap -sS <target> (Sends SYN; replies with RST upon receiving SYN/ACK)",
                "nmap -sT <target> (Completes full 3-way TCP connect handshake)",
                "nmap -sU <target> (UDP scan)",
                "nmap -sn <target> (Ping sweep only)"
            ),
            correctIndex = 0,
            explanation = "An Nmap TCP SYN scan (-sS) sends a SYN packet and immediately tears down the connection with a RST packet after receiving SYN/ACK, avoiding full 3-way handshake completion.",
            optionAnalysis = mapOf(
                0 to "CORRECT. -sS is the half-open TCP SYN stealth scan.",
                1 to "-sT completes the full OS connect() 3-way handshake.",
                2 to "-sU scans UDP ports.",
                3 to "-sn performs host discovery without port scanning."
            ),
            citation = SourceCitation(
                title = "EC-Council CEH v12 Official Curriculum",
                sectionOrPage = "Module 03: Scanning Networks – TCP SYN Stealth Scan (-sS)",
                standardOrFramework = "EC-Council 312-50 Blueprint"
            ),
            difficulty = QuestionDifficulty.EASY
        ),
        Question(
            id = "ceh-q02",
            examId = "ceh",
            domainId = "ceh-d3",
            domainName = "Web, Wireless & Cloud Exploitation",
            questionText = "While testing a web login form, a penetration tester enters admin' OR '1'='1'-- into the username field and logs in without knowing the password. What vulnerability was exploited, and why did -- allow authentication bypass?",
            options = listOf(
                "Authentication Bypass SQL Injection (SQLi); -- comments out the remainder of the SQL WHERE clause",
                "Reflected Cross-Site Scripting (XSS); -- executes JavaScript in the DOM",
                "ARP Poisoning; -- overwrites the gateway MAC address",
                "DNS Zone Transfer (dig axfr)"
            ),
            correctIndex = 0,
            explanation = "In SQL syntax, -- is an inline comment sequence. Injecting admin' OR '1'='1'-- makes the WHERE condition always evaluate to TRUE and comments out the password check.",
            optionAnalysis = mapOf(
                0 to "CORRECT. SQLi authentication bypass using -- to comment out the password verification clause.",
                1 to "XSS injects client-side script into web pages.",
                2 to "ARP poisoning spoofs Layer 2 MAC addresses.",
                3 to "DNS Zone Transfer replicates DNS records."
            ),
            citation = SourceCitation(
                title = "EC-Council CEH v12 & OWASP Top 10",
                sectionOrPage = "Module 14: Hacking Web Applications – SQL Injection (CWE-89)",
                standardOrFramework = "EC-Council CEH v12 Official Study Guide"
            ),
            difficulty = QuestionDifficulty.MEDIUM
        ),
        Question(
            id = "ceh-q03",
            examId = "ceh",
            domainId = "ceh-d2",
            domainName = "System Hacking & Privilege Escalation",
            questionText = "After gaining an initial foothold on a Windows workstation, an ethical hacker dumps local NTLM password hashes from LSASS memory and uses the raw NTLM hash directly to authenticate to an adjacent file server over SMB without cracking the hash. Which lateral movement technique is this?",
            options = listOf(
                "Pass-the-Hash (PtH) — MITRE ATT&CK T1550.002",
                "VLAN Hopping via Double Tagging (802.1Q)",
                "Evil Twin Wi-Fi Deauthentication",
                "BGP Route Hijacking"
            ),
            correctIndex = 0,
            explanation = "In NTLM challenge-response authentication, possessing the unsalted NTLM hash is sufficient to compute the challenge response without knowing the plaintext password (Pass-the-Hash).",
            optionAnalysis = mapOf(
                0 to "CORRECT. Pass-the-Hash authenticates directly using the NTLM hash over SMB/WMI.",
                1 to "VLAN hopping injects double 802.1Q tags on trunk ports.",
                2 to "Evil Twin spoofs wireless SSIDs.",
                3 to "BGP hijacking manipulates autonomous system routing tables."
            ),
            citation = SourceCitation(
                title = "EC-Council CEH v12 & MITRE ATT&CK",
                sectionOrPage = "Module 06: System Hacking – Pass-the-Hash (T1550.002)",
                standardOrFramework = "EC-Council CEH v12 Official Guide"
            ),
            difficulty = QuestionDifficulty.HARD
        )
    )

    /**
     * Authoritative question lookup enforcing Certification Content Integrity.
     * Never substitutes CISSP questions when another certification is selected.
     */
    fun getQuestionsForExam(examId: String): List<Question> {
        return when (ExamCatalog.normalizeExamId(examId)) {
            "cissp" -> CISSP_QUESTIONS
            "aws-saa" -> AWS_SAA_QUESTIONS
            "sec-plus" -> SEC_PLUS_QUESTIONS
            "pmp" -> PMP_QUESTIONS
            "cism" -> CISM_QUESTIONS
            "ceh" -> CEH_QUESTIONS
            else -> emptyList()
        }
    }
}
