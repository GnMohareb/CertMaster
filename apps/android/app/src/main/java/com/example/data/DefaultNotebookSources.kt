package com.example.data

import com.example.model.AudioOverview
import com.example.model.DialogueTurn
import com.example.model.Flashcard
import com.example.model.SourceDoc
import com.example.model.SourceType

object DefaultNotebookSources {

    val CISSP_SOURCES = listOf(
        SourceDoc(
            id = "src_nist_rmf",
            examId = "cissp",
            domainId = "d1",
            domainName = "Security and Risk Management",
            title = "NIST SP 800-37 Rev. 2: Risk Management Framework (RMF)",
            authorOrStandard = "National Institute of Standards and Technology",
            type = SourceType.OFFICIAL_GUIDE,
            summary = "Comprehensive 7-step lifecycle for system risk management: Prepare, Categorize, Select, Implement, Assess, Authorize, and Monitor.",
            keyTakeaways = listOf(
                "Prepare step establishes organizational risk context and assigns roles before system authorization.",
                "Categorize utilizes FIPS 199 based on impact to Confidentiality, Integrity, and Availability (Low, Moderate, High).",
                "Assess determines whether controls are implemented correctly and operating as intended.",
                "Authorize requires the Authorizing Official (AO) to accept residual risk formally.",
                "Continuous Monitoring maintains ongoing situational awareness."
            ),
            fullContent = """
                # NIST SP 800-37 Rev. 2: Risk Management Framework
                The Risk Management Framework (RMF) provides a disciplined, structured, and flexible process for managing security and privacy risk in organizational information systems.
                
                ## The 7 RMF Steps:
                1. **PREPARE**: Essential activities to prepare all levels of the organization to manage risk.
                2. **CATEGORIZE**: Categorize the system and the information processed based on impact analysis (FIPS 199).
                3. **SELECT**: Select an initial set of baseline security controls (NIST SP 800-53) and tailor as needed.
                4. **IMPLEMENT**: Implement the controls and describe how they are employed within the system.
                5. **ASSESS**: Assess the controls to determine if they produce desired results with respect to meeting security requirements.
                6. **AUTHORIZE**: Senior leadership authorizes system operation based on determination of acceptable risk to organizational operations.
                7. **MONITOR**: Continuously monitor control implementation and the security/privacy state of the system.
            """.trimIndent()
        ),
        SourceDoc(
            id = "src_access_models",
            examId = "cissp",
            domainId = "d3",
            domainName = "Security Architecture and Engineering",
            title = "Formal Access Control Models: Bell-LaPadula vs. Biba",
            authorOrStandard = "DoD Directive 5200.28-STD & Computer Security Foundations",
            type = SourceType.STANDARD_SPEC,
            summary = "Mathematical state machine security models governing confidentiality (Bell-LaPadula) vs integrity (Biba) in multi-level secure architectures.",
            keyTakeaways = listOf(
                "Bell-LaPadula is strictly for CONFIDENTIALITY. Rule 1: Simple Security (No Read-Up). Rule 2: *-Property (No Write-Down).",
                "Biba is strictly for INTEGRITY. Rule 1: Simple Integrity (No Read-Down). Rule 2: *-Integrity (No Write-Up).",
                "Remember: 'Biba prevents dirty data from floating up to clean systems'.",
                "Clark-Wilson enforces integrity for commercial transactions via Well-Formed Transactions and Separation of Duties."
            ),
            fullContent = """
                # Formal Access Control Models
                
                ### 1. Bell-LaPadula (Confidentiality Model)
                - Developed in 1973 for government multi-level security.
                - **Simple Security Property (ss-property)**: Subject cannot read higher classification (No Read Up).
                - ***-Property (star-property)**: Subject cannot write lower classification (No Write Down), preventing exfiltration of secrets.
                - Tranquility Principle: Security labels do not change dynamically during execution.
                
                ### 2. Biba Integrity Model
                - Developed in 1977 as the mathematical mirror of Bell-LaPadula.
                - **Simple Integrity Axiom**: Subject cannot read lower integrity objects (No Read Down).
                - ***-Integrity Axiom**: Subject cannot write to higher integrity objects (No Write Up), preventing contamination of trusted code.
            """.trimIndent()
        ),
        SourceDoc(
            id = "src_incident_resp",
            examId = "cissp",
            domainId = "d7",
            domainName = "Security Operations",
            title = "NIST SP 800-61 Rev. 2: Computer Security Incident Handling Guide",
            authorOrStandard = "NIST Special Publication",
            type = SourceType.OFFICIAL_GUIDE,
            summary = "The standard 4-phase incident response lifecycle: Preparation, Detection & Analysis, Containment Eradication & Recovery, Post-Incident Activity.",
            keyTakeaways = listOf(
                "Phase 1: Preparation includes establishing policy, CSIRT team, toolkits, and contact lists.",
                "Phase 2: Detection and Analysis involves correlation of precursors, indicators, and baseline deviation.",
                "Phase 3: Containment, Eradication, and Recovery. Containment must happen before eradication to prevent adversary reaction.",
                "Phase 4: Post-Incident Activity (Lessons Learned). Must conduct meetings within 2 weeks of incident close."
            ),
            fullContent = """
                # NIST SP 800-61 Rev. 2 Incident Response Lifecycle
                
                Organized incident response consists of four interdependent steps:
                
                1. **Preparation**: Equipping the Computer Security Incident Response Team (CSIRT) with jump-bags, forensics tools, authorized communication channels, and clear escalation protocols.
                2. **Detection & Analysis**: Distinguishing between harmless anomaly and security event. Determining attack vectors and scope.
                3. **Containment, Eradication & Recovery**:
                   - Short-term and long-term containment (network isolation, blackholing).
                   - Eradication of malicious artifacts (reimaging disks, resetting credentials).
                   - Controlled restoration to production with enhanced telemetry.
                4. **Post-Incident Activity**: Documenting lessons learned, updating standard operating procedures (SOPs), and feeding findings back into the Preparation phase.
            """.trimIndent()
        )
    )

    val AUDIO_OVERVIEWS = listOf(
        AudioOverview(
            id = "audio_deepdive_1",
            examId = "cissp",
            domainId = "d3",
            title = "Mastering the Security Models: Bell-LaPadula, Biba & Clark-Wilson",
            subtitle = "NotebookLM Deep Dive Conversation (12 min summary)",
            durationSeconds = 720,
            host1 = "Alex (Host)",
            host2 = "Dr. Maya (CISSP Architect)",
            keyConceptsCovered = listOf("Simple Security vs *-Property", "Integrity vs Confidentiality", "Commercial Clark-Wilson", "Common Exam Traps"),
            turns = listOf(
                DialogueTurn("Alex (Host)", "Welcome to the Deep Dive audio overview! Today we're tackling one of the most notoriously tested areas on the CISSP exam: formal security models. Maya, why do candidates struggle so much with Bell-LaPadula versus Biba?", 0),
                DialogueTurn("Dr. Maya (Exam Expert)", "Great to be here, Alex! The classic pitfall is that candidates try to memorize the mathematical axioms without understanding the underlying business intent. Bell-LaPadula was commissioned for military confidentiality—think Top Secret versus Secret. It has one prime directive: prevent leaks.", 8),
                DialogueTurn("Alex (Host)", "Right, so that's where the famous 'No Read-Up' and 'No Write-Down' rules come from. Can you unpack the star-property?", 18),
                DialogueTurn("Dr. Maya (Exam Expert)", "Exactly. If an officer with Top Secret clearance is logged in, the star-property prevents them from accidentally or maliciously writing that Top Secret intel into an Unclassified document. No write-down protects confidentiality.", 26),
                DialogueTurn("Alex (Host)", "And Biba is essentially the exact inverse because it protects integrity rather than secrecy, right?", 38),
                DialogueTurn("Dr. Maya (Exam Expert)", "Spot on! In Biba, you don't want untrusted data corrupting trusted systems. So an integrity subject cannot read down from an untrusted source, and cannot write up to dirty a clean dataset. On the exam, when you see 'prevent unauthorized modification', think Biba or Clark-Wilson immediately!", 46),
                DialogueTurn("Alex (Host)", "What about Clark-Wilson? When does the exam favor that over Biba?", 60),
                DialogueTurn("Dr. Maya (Exam Expert)", "Remember the two keywords for Clark-Wilson: 'Well-Formed Transactions' and 'Separation of Duties'. Biba is mathematical; Clark-Wilson is designed for commercial accounting systems to prevent internal fraud.", 68),
                DialogueTurn("Alex (Host)", "Brilliant distinction! That's going to save at least three questions on exam day. Let's move to our next review topic: Cryptography and PKI.", 80)
            )
        ),
        AudioOverview(
            id = "audio_deepdive_2",
            examId = "cissp",
            domainId = "d1",
            title = "BIA Metrics Unpacked: MTD, RTO, RPO, and WRT",
            subtitle = "Executive briefing on disaster recovery and contingency planning",
            durationSeconds = 540,
            host1 = "Alex (Host)",
            host2 = "Dr. Maya (CISSP Architect)",
            keyConceptsCovered = listOf("RPO vs RTO timeline", "Maximum Tolerable Downtime (MTD)", "Work Recovery Time testing"),
            turns = listOf(
                DialogueTurn("Alex (Host)", "In this audio briefing, we're dissecting Business Impact Analysis metrics. RTO and RPO are always tested, but questions love to mix in WRT and MTD. How do we draw this timeline in our minds?", 0),
                DialogueTurn("Dr. Maya (Exam Expert)", "Picture a timeline of a disaster. The disaster happens at 12:00 PM. RPO looks BACKWARD: how many hours of transactions are lost since the last backup? That's data loss.", 10),
                DialogueTurn("Alex (Host)", "So RPO is about data loss, not system downtime.", 22),
                DialogueTurn("Dr. Maya (Exam Expert)", "Exactly! Now, looking forward from the disaster: RTO is the time to restore the server hardware and OS. But you can't open for business yet until you test the database and replay transactions—that second phase is WRT, Work Recovery Time.", 28),
                DialogueTurn("Dr. Maya (Exam Expert)", "And RTO plus WRT equals MTD, Maximum Tolerable Downtime. If your recovery exceeds MTD, the organization fails permanently.", 42),
                DialogueTurn("Alex (Host)", "That simple formula: RTO + WRT = MTD is pure exam gold. Thanks Maya!", 52)
            )
        )
    )

    val CISSP_FLASHCARDS = listOf(
        Flashcard(
            id = "fc_1",
            examId = "cissp",
            domainId = "d1",
            domainName = "Security & Risk Management",
            frontPrompt = "What is the mathematical relationship between MTD, RTO, and WRT?",
            backAnswer = "MTD = RTO + WRT\n\nMaximum Tolerable Downtime is the sum of Recovery Time Objective (bringing systems back online) and Work Recovery Time (verifying integrity and replaying data).",
            keyFormulaOrRule = "MTD = RTO + WRT",
            sourceCitation = "NIST SP 800-34 Contingency Planning §3.2",
            sourceDocId = "src_nist_rmf",
            boxLevel = 1
        ),
        Flashcard(
            id = "fc_2",
            examId = "cissp",
            domainId = "d3",
            domainName = "Security Architecture",
            frontPrompt = "What does the *-Property (Star Property) enforce in the Bell-LaPadula Model?",
            backAnswer = "NO WRITE-DOWN (Confinement Property).\n\nA subject at a higher security classification level cannot write information to an object at a lower classification level, preventing confidential leaks.",
            keyFormulaOrRule = "Bell-LaPadula: * = No Write-Down",
            sourceCitation = "Bell-LaPadula Formal Model Technical Report",
            sourceDocId = "src_access_models",
            boxLevel = 1
        ),
        Flashcard(
            id = "fc_3",
            examId = "cissp",
            domainId = "d7",
            domainName = "Security Operations",
            frontPrompt = "List the Order of Volatility for digital forensics from highest to lowest priority.",
            backAnswer = "1. CPU registers & cache\n2. Routing tables, ARP cache, process table, kernel stats, RAM\n3. Temporary file systems\n4. Disk & non-volatile media\n5. Remote logging data\n6. Physical topology & archival media",
            keyFormulaOrRule = "RFC 3227 Volatility Order",
            sourceCitation = "RFC 3227 Guidelines for Evidence Collection §2.1",
            sourceDocId = "src_incident_resp",
            boxLevel = 2
        ),
        Flashcard(
            id = "fc_4",
            examId = "cissp",
            domainId = "d5",
            domainName = "Identity and Access Management",
            frontPrompt = "What is the difference between OAuth 2.0 and OpenID Connect (OIDC)?",
            backAnswer = "OAuth 2.0 is strictly for AUTHORIZATION (issuing access tokens to resources).\n\nOpenID Connect (OIDC) is an identity layer built ON TOP of OAuth 2.0 that provides AUTHENTICATION (issuing ID tokens in JWT format).",
            keyFormulaOrRule = "OIDC = AuthN (Who you are) | OAuth 2.0 = AuthZ (What you can access)",
            sourceCitation = "OpenID Connect Core 1.0 Spec",
            sourceDocId = "src_access_models",
            boxLevel = 1
        ),
        Flashcard(
            id = "fc_5",
            examId = "cissp",
            domainId = "d4",
            domainName = "Communication & Network Security",
            frontPrompt = "Does IPsec Authentication Header (AH) provide encryption?",
            backAnswer = "NO. AH provides data origin authentication, data integrity, and anti-replay protection, but NO CONFIDENTIALITY (no payload encryption). Use ESP for encryption.",
            keyFormulaOrRule = "AH = Integrity Only | ESP = Integrity + Encryption",
            sourceCitation = "RFC 4302 (AH) & RFC 4303 (ESP)",
            sourceDocId = "src_nist_rmf",
            boxLevel = 2
        ),
        Flashcard(
            id = "fc_6",
            examId = "cissp",
            domainId = "d3",
            domainName = "Security Architecture",
            frontPrompt = "What are the two core integrity axioms of the Biba Model?",
            backAnswer = "1. Simple Integrity Axiom: No Read-Down (subject cannot read lower integrity data).\n2. *-Integrity Axiom: No Write-Up (subject cannot write to higher integrity objects).",
            keyFormulaOrRule = "Biba: Simple = No Read-Down | * = No Write-Up",
            sourceCitation = "Biba Integrity Architecture Technical Spec",
            sourceDocId = "src_access_models",
            boxLevel = 1
        ),
        Flashcard(
            id = "fc_7",
            examId = "cissp",
            domainId = "d7",
            domainName = "Security Operations",
            frontPrompt = "What are the 4 main phases of the NIST SP 800-61 Incident Handling Lifecycle?",
            backAnswer = "1. Preparation\n2. Detection & Analysis\n3. Containment, Eradication, and Recovery\n4. Post-Incident Activity (Lessons Learned within 2 weeks)",
            keyFormulaOrRule = "Prep -> Detect -> Contain/Eradicate/Recover -> Post-Incident",
            sourceCitation = "NIST SP 800-61 Rev. 2 §2.3",
            sourceDocId = "src_incident_resp",
            boxLevel = 3
        )
    )
}
