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

    fun getQuestionsForExam(examId: String): List<Question> {
        return when (examId) {
            "cissp" -> CISSP_QUESTIONS
            "aws-saa" -> CISSP_QUESTIONS.mapIndexed { index, q ->
                q.copy(
                    id = "aws_$index",
                    examId = "aws-saa",
                    domainId = "aws-d${(index % 4) + 1}",
                    domainName = ExamCatalog.AWS_SAA.domains[index % 4].title
                )
            }
            "sec-plus" -> CISSP_QUESTIONS.mapIndexed { index, q ->
                q.copy(
                    id = "sec_$index",
                    examId = "sec-plus",
                    domainId = "sec-d${(index % 5) + 1}",
                    domainName = ExamCatalog.SECURITY_PLUS.domains[index % 5].title
                )
            }
            else -> CISSP_QUESTIONS.mapIndexed { index, q ->
                q.copy(
                    id = "gen_$index",
                    examId = examId,
                    domainId = "gen-d${(index % 4) + 1}",
                    domainName = "Domain ${(index % 4) + 1}: Core Competency"
                )
            }
        }
    }
}
