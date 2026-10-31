package com.example.data

import com.example.model.ExamConfig
import com.example.model.ExamDomain

object ExamCatalog {

    val CISSP = ExamConfig(
        id = "cissp",
        title = "Certified Information Systems Security Professional",
        shortCode = "CISSP",
        issuer = "(ISC)² Cybersecurity Leadership",
        description = "The gold standard certification for information security leaders, covering governance, architecture, risk, and operations.",
        passingScorePercent = 70,
        defaultSimulationCount = 8,
        totalBankQuestions = 8,
        durationMinutes = 180,
        primaryColorHex = 0xFF1D4ED8, // Sapphire Navy
        iconName = "Security",
        domains = listOf(
            ExamDomain("d1", 1, "Security and Risk Management", 15, "Governance, compliance, threat modeling, business continuity, and ethics.", listOf("NIST SP 800-37 RMF", "ISO/IEC 27001", "OECD Privacy Guidelines"), "Gavel"),
            ExamDomain("d2", 2, "Asset Security", 10, "Information classification, data privacy, retention, and secure data destruction.", listOf("Data Lifecycle Management", "NIST SP 800-88 Sanitization", "GDPR"), "FolderSpecial"),
            ExamDomain("d3", 3, "Security Architecture and Engineering", 13, "Cryptographic models, security architectures, Bell-LaPadula, Biba, physical security.", listOf("Bell-LaPadula & Biba", "Common Criteria ISO 15408", "Zero Trust Architecture"), "Memory"),
            ExamDomain("d4", 4, "Communication and Network Security", 13, "OSI/TCP layers, IPsec, firewalls, TLS 1.3, SD-WAN, and zero-trust networks.", listOf("IPsec ESP/AH", "802.1AE MACsec", "TLS 1.3 Suite"), "Router"),
            ExamDomain("d5", 5, "Identity and Access Management (IAM)", 13, "Authentication, SSO, SAML 2.0, OAuth 2.0, RBAC, ABAC, and privilege management.", listOf("OIDC & OAuth 2.0", "Kerberos Tickets", "SAML 2.0 Assertions"), "Badge"),
            ExamDomain("d6", 6, "Security Assessment and Testing", 12, "Vulnerability scanning, penetration testing, log analysis, code audits, and SOC reports.", listOf("SOC 2 Type II", "CVSS v3.1 Scoring", "SAST vs DAST"), "Rule"),
            ExamDomain("d7", 7, "Security Operations", 13, "Incident response, digital forensics, SIEM/SOAR, disaster recovery, and operational hygiene.", listOf("NIST SP 800-61 Incident Handling", "Order of Volatility", "MTD & RTO & RPO"), "Shield"),
            ExamDomain("d8", 8, "Software Development Security", 11, "SDLC security, OWASP Top 10, secure code review, and supply chain security.", listOf("OWASP Top 10", "DevSecOps Pipeline", "NIST SSDF"), "Code")
        )
    )

    val AWS_SAA = ExamConfig(
        id = "aws-saa",
        title = "AWS Certified Solutions Architect – Associate",
        shortCode = "AWS SAA-C03",
        issuer = "Amazon Web Services",
        description = "Validates the ability to design high-performing, cost-optimized, secure, and resilient cloud architectures.",
        passingScorePercent = 72,
        defaultSimulationCount = 5,
        totalBankQuestions = 5,
        durationMinutes = 130,
        primaryColorHex = 0xFFD97706, // Cloud Amber
        iconName = "Cloud",
        domains = listOf(
            ExamDomain("aws-d1", 1, "Design Secure Architectures", 30, "IAM policies, KMS encryption, VPC security groups, Secrets Manager.", listOf("AWS KMS Multi-Region Keys", "IAM Identity Center", "AWS WAF & Shield"), "Lock"),
            ExamDomain("aws-d2", 2, "Design Resilient Architectures", 26, "Multi-AZ, Auto Scaling, Route 53 failover, SQS/SNS decoupling.", listOf("Route 53 Routing Policies", "Multi-AZ RDS & Aurora", "S3 Cross-Region Replication"), "Autorenew"),
            ExamDomain("aws-d3", 3, "Design High-Performing Architectures", 24, "ElastiCache Redis, CloudFront edge caching, DynamoDB DAX, EFS burst performance.", listOf("CloudFront Origin Shield", "DynamoDB On-Demand vs Provisioned", "Global Accelerator"), "Speed"),
            ExamDomain("aws-d4", 4, "Design Cost-Optimized Architectures", 20, "S3 Intelligent Tiering, Savings Plans, Spot Instances, lifecycle management.", listOf("AWS Compute Optimizer", "S3 Glacier Instant Retrieval", "AWS Cost Explorer"), "Savings")
        )
    )

    val SECURITY_PLUS = ExamConfig(
        id = "sec-plus",
        title = "CompTIA Security+ Certification",
        shortCode = "SY0-701",
        issuer = "CompTIA",
        description = "Baseline cybersecurity certification assessing core technical skills across baseline enterprise security.",
        passingScorePercent = 75,
        defaultSimulationCount = 5,
        totalBankQuestions = 5,
        durationMinutes = 90,
        primaryColorHex = 0xFFDC2626, // Crimson Alert
        iconName = "AdminPanelSettings",
        domains = listOf(
            ExamDomain("sec-d1", 1, "General Security Concepts", 12, "Security controls, CIA triad, AAA, change management, and governance.", listOf("CIA Triad", "Control Types", "Zero Trust"), "Gavel"),
            ExamDomain("sec-d2", 2, "Threats, Vulnerabilities & Mitigations", 22, "Malware, social engineering, attack indicators, CVE analysis.", listOf("MITRE ATT&CK Matrix", "CVE / CVSS", "Phishing Indicators"), "BugReport"),
            ExamDomain("sec-d3", 3, "Security Architecture", 18, "Cloud infrastructure, network topology, cryptographic algorithms.", listOf("Hybrid Cloud", "Segmentation", "Post-Quantum Cryptography"), "Hub"),
            ExamDomain("sec-d4", 4, "Security Operations", 28, "Log auditing, SIEM monitoring, threat hunting, vulnerability management.", listOf("SIEM Rule Tuning", "Packet Capture Analysis", "Forensics Acquisition"), "Sensors"),
            ExamDomain("sec-d5", 5, "Security Program Management & Oversight", 20, "Audits, vendor risk, compliance regulations (HIPAA, PCI-DSS), BCP.", listOf("Third-party Risk", "Incident Playbooks", "Privacy Regulations"), "Assignment")
        )
    )

    val PMP = ExamConfig(
        id = "pmp",
        title = "Project Management Professional",
        shortCode = "PMP®",
        issuer = "Project Management Institute (PMI)",
        description = "Gold-standard project leadership certification encompassing predictive, agile, and hybrid methodologies.",
        passingScorePercent = 72,
        defaultSimulationCount = 3,
        totalBankQuestions = 3,
        durationMinutes = 180,
        primaryColorHex = 0xFF059669, // Emerald Leadership
        iconName = "AccountTree",
        domains = listOf(
            ExamDomain("pmp-d1", 1, "People", 42, "Conflict management, servant leadership, team coaching, emotional intelligence.", listOf("Servant Leadership", "Tuckman's Model", "Conflict Resolution Modes"), "Group"),
            ExamDomain("pmp-d2", 2, "Process", 50, "Earned value analysis, critical path, risk registers, sprint retrospectives.", listOf("Earned Value (EV, PV, AC, CPI)", "Critical Path Method", "Agile Velocity"), "TrendingUp"),
            ExamDomain("pmp-d3", 3, "Business Environment", 8, "Organizational change, regulatory compliance, benefits realization.", listOf("Benefits Realization Plan", "PESTLE Analysis", "Governance Boards"), "Business")
        )
    )

    val CISM = ExamConfig(
        id = "cism",
        title = "Certified Information Security Manager",
        shortCode = "CISM",
        issuer = "ISACA",
        description = "Management-focused certification validating information security governance, risk management, program development, and incident management.",
        passingScorePercent = 70,
        defaultSimulationCount = 3,
        totalBankQuestions = 3,
        durationMinutes = 240,
        primaryColorHex = 0xFF0284C7,
        iconName = "Security",
        domains = listOf(
            ExamDomain("cism-d1", 1, "Information Security Governance", 17, "Enterprise governance alignment, strategy, and metrics.", listOf("COBIT 2019", "ISO/IEC 27014"), "Gavel"),
            ExamDomain("cism-d2", 2, "Information Security Risk Management", 20, "Risk assessment, asset classification, and control baselines.", listOf("FAIR Risk Model", "NIST SP 800-39"), "Rule"),
            ExamDomain("cism-d3", 3, "Information Security Program", 33, "Security program architecture, resource management, and assurance.", listOf("Security Architecture Roadmap", "KRI/KPI Metrics"), "Layers"),
            ExamDomain("cism-d4", 4, "Incident Management", 30, "Incident response readiness, forensic triage, DRP, and BCP testing.", listOf("NIST SP 800-61", "BIA & RTO/RPO"), "Shield")
        )
    )

    val CEH = ExamConfig(
        id = "ceh",
        title = "Certified Ethical Hacker v12",
        shortCode = "CEH v12",
        issuer = "EC-Council",
        description = "Comprehensive ethical hacking and penetration testing methodology covering reconnaissance, exploitation, web apps, and cloud security.",
        passingScorePercent = 70,
        defaultSimulationCount = 3,
        totalBankQuestions = 3,
        durationMinutes = 240,
        primaryColorHex = 0xFF7C3AED,
        iconName = "BugReport",
        domains = listOf(
            ExamDomain("ceh-d1", 1, "Reconnaissance & Footprinting", 21, "OSINT, DNS enumeration, Nmap scanning, and target profiling.", listOf("Nmap Scripting Engine", "OSINT Framework"), "Sensors"),
            ExamDomain("ceh-d2", 2, "System Hacking & Privilege Escalation", 25, "Vulnerability exploitation, credential dumping, and persistence.", listOf("MITRE ATT&CK", "CVE Exploitation"), "Memory"),
            ExamDomain("ceh-d3", 3, "Web, Wireless & Cloud Exploitation", 30, "SQLi, XSS, SSRF, WPA3 analysis, and cloud IAM misconfigurations.", listOf("OWASP Top 10", "Cloud Goat Scenarios"), "Code"),
            ExamDomain("ceh-d4", 4, "Cryptography & Evasion Techniques", 24, "IDS/WAF evasion, PKI attacks, cipher suites, and honeypots.", listOf("TLS Downgrade Analysis", "IDS Signature Bypass"), "Lock")
        )
    )

    val GENERIC_TEMPLATE = ExamConfig(
        id = "custom-112",
        title = "Catalog Preview Blueprint (106 Additional Certifications)",
        shortCode = "CATALOG-PREVIEW",
        issuer = "CertMaster Cloud Blueprint Registry",
        description = "Domain blueprint preview synchronized with the 112-exam catalog on the CertMaster Web Platform (0 bundled practice questions).",
        passingScorePercent = 70,
        defaultSimulationCount = 0,
        totalBankQuestions = 0,
        durationMinutes = 120,
        primaryColorHex = 0xFF7C3AED, // Royal Violet
        iconName = "AutoAwesome",
        domains = listOf(
            ExamDomain("gen-d1", 1, "Core Domain 1: Foundational Principles", 25, "Fundamental theories, industry definitions, and standards.", listOf("Standard Spec ISO/IEC", "Glossary"), "Star"),
            ExamDomain("gen-d2", 2, "Core Domain 2: Systems Architecture & Design", 25, "Framework engineering, models, and technical topologies.", listOf("Topology Matrix", "Design Patterns"), "Layers"),
            ExamDomain("gen-d3", 3, "Core Domain 3: Operations & Execution", 25, "Real-world incident management, triage, and workflows.", listOf("Standard Operating Procedures", "Metrics"), "Tune"),
            ExamDomain("gen-d4", 4, "Core Domain 4: Compliance & Ethics", 25, "Governance, legal considerations, and strategic management.", listOf("Audit Protocol", "Ethics Code"), "Verified")
        )
    )

    val ALL_PRESETS = listOf(CISSP, AWS_SAA, SECURITY_PLUS, PMP, CISM, CEH, GENERIC_TEMPLATE)

    /**
     * Normalizes exam IDs between Web ("aws-saa", "sec-plus") and Android ("aws_csa", "sec_plus")
     * so entitlements, scores, study plans, and question banks resolve to the exact same canonical key.
     */
    fun normalizeExamId(rawId: String): String {
        val cleaned = rawId.trim().lowercase()
        if (cleaned.isEmpty()) return "cissp"
        return when (cleaned) {
            "aws_csa", "aws-saa", "awssaa", "aws-saa-c03", "saa-c03" -> "aws-saa"
            "sec_plus", "sec-plus", "security_plus", "security-plus", "sy0-701", "sy0_701" -> "sec-plus"
            "n10-008", "n10_008", "net_plus", "net-plus" -> "net-plus"
            "cysa-003", "cy0-003", "cysa_plus", "cysa-plus" -> "cysa-plus"
            "pt0-002", "pentest_plus", "pentest-plus" -> "pentest-plus"
            "cas-004", "casp_plus", "casp-plus" -> "casp-plus"
            "rhcsa-ex200", "ex200", "rhcsa" -> "rhcsa"
            "rhce-ex294", "ex294", "rhce" -> "rhce"
            else -> cleaned.replace('_', '-')
        }
    }

    /**
     * Maps canonical ID back to Android subscription ID when needed.
     */
    fun matchesExamId(idA: String, idB: String): Boolean {
        return normalizeExamId(idA) == normalizeExamId(idB)
    }

    /**
     * Objective, evidence-based content classification criteria (Phase 7 Section 8):
     * - FULL_PREPARATION_AVAILABLE: >= 100 questions, >= 4 study guides, >= 20 flashcards, >= 1 audio briefing
     * - LIMITED_PREPARATION: >= 25 questions, >= 2 study guides, >= 8 flashcards
     * - SAMPLE_CONTENT_AVAILABLE: >= 3 questions, >= 1 study guide, >= 1 flashcard
     * - CATALOG_PREVIEW: < 3 questions, > 0 domain blueprint definitions
     * - CONTENT_COMING_SOON: 0 questions and 0 domain blueprint definitions
     */
    fun classifyExamContentAvailability(
        questionCount: Int,
        studyGuideCount: Int,
        flashcardCount: Int,
        audioBriefingCount: Int,
        domainCount: Int
    ): String {
        return when {
            questionCount >= 100 && studyGuideCount >= 4 && flashcardCount >= 20 && audioBriefingCount >= 1 ->
                "FULL_PREPARATION_AVAILABLE"
            questionCount >= 25 && studyGuideCount >= 2 && flashcardCount >= 8 ->
                "LIMITED_PREPARATION"
            questionCount >= 3 && studyGuideCount >= 1 && flashcardCount >= 1 ->
                "SAMPLE_CONTENT_AVAILABLE"
            domainCount > 0 ->
                "CATALOG_PREVIEW"
            else ->
                "CONTENT_COMING_SOON"
        }
    }

    /**
     * Returns evidence-based content availability status ("SAMPLE_CONTENT_AVAILABLE" vs "CATALOG_PREVIEW").
     */
    fun getExamContentStatus(examId: String): String {
        return when (normalizeExamId(examId)) {
            "cissp" -> classifyExamContentAvailability(8, 4, 8, 3, 8)
            "aws-saa" -> classifyExamContentAvailability(5, 1, 3, 1, 4)
            "sec-plus" -> classifyExamContentAvailability(5, 1, 2, 1, 5)
            "pmp" -> classifyExamContentAvailability(3, 1, 1, 1, 3)
            "cism" -> classifyExamContentAvailability(3, 1, 1, 1, 4)
            "ceh" -> classifyExamContentAvailability(3, 1, 1, 1, 4)
            else -> classifyExamContentAvailability(0, 0, 0, 0, 4)
        }
    }

    fun getExamById(id: String): ExamConfig {
        val canonical = normalizeExamId(id)
        return ALL_PRESETS.firstOrNull { normalizeExamId(it.id) == canonical } ?: CISSP
    }

    /**
     * Returns the full 112-certification catalog synchronized with CertMaster Web Platform.
     */
    fun getFullSynchronizedCatalogCount(): Int = 112
}
