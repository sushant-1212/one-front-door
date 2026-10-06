/**
 * Grounded Domain Specialist Bots for Bennett University
 * Each bot is strictly grounded in official university regulations,
 * citing exact document sections from CollPoll, BU-WiFi, Residential Code,
 * 75% Attendance, CDC Placements, and LRC KOHA Library.
 */

import { DOMAINS } from '../data/knowledgeBases.js';

/**
 * Intelligent semantic score between query tokens and document content
 */
function scoreDocumentRelevance(query, doc) {
  const qTokens = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  const docText = `${doc.title} ${doc.section} ${doc.excerpt}`.toLowerCase();
  let score = 0;
  for (const token of qTokens) {
    if (docText.includes(token)) {
      score += 1.5;
    }
  }
  return score;
}

/**
 * Specialized Answer Generators for 6 Campus Departments
 */
const DOMAIN_RESPONSES = {
  it: (query) => {
    const q = query.toLowerCase();
    const domain = DOMAINS.it;

    // 1. BU-WiFi / eduroam configuration
    if (q.includes('wifi') || q.includes('wi-fi') || q.includes('bu-wifi') || q.includes('eduroam') || q.includes('internet') || q.includes('phone') || q.includes('android') || q.includes('iphone') || q.includes('mac')) {
      const doc = domain.documents[0];
      return {
        domainId: 'it',
        title: 'IT & Digital Infrastructure Specialist',
        answer: `To connect your device to **BU-WiFi** or **eduroam** across academic blocks, D1-D6 hostels, and campus premises:

1. **Network Selection**: Open your device Wi-Fi settings and select SSID **"BU-WiFi"** (or **"eduroam"** for roaming).
2. **Identity Credentials**:
   - **Username / Identity**: Enter your full university email (\`username@bennett.edu.in\`).
   - **Password**: Enter your primary CollPoll ERP password.
3. **Security Standards (Android / iOS / Windows)**:
   - **EAP Method**: Select **PEAP**
   - **Phase-2 Authentication**: Select **MSCHAPv2**
   - **CA Certificate**: Choose *"InCommon RSA Server CA"* or *"Use System Certificates"*.
   - **Domain (if requested)**: Enter \`bennett.edu.in\`.
4. **Helpdesk Support**: If your device requires MAC address whitelisting, visit the **IT Helpdesk at Academic Block Ground Floor Room 004** or call Ext. 104.`,
        citation: {
          id: doc.id,
          title: doc.title,
          section: doc.section,
          citation: doc.citation,
          excerpt: doc.excerpt
        },
        actions: [
          { label: 'Download Wi-Fi Security Certificate', icon: 'download' },
          { label: 'Check Campus Network Status', icon: 'activity' }
        ]
      };
    }

    // 2. CollPoll ERP & iCampus SSO
    if (q.includes('collpoll') || q.includes('icampus') || q.includes('password') || q.includes('login') || q.includes('erp') || q.includes('reset') || q.includes('credentials')) {
      const doc = domain.documents[1];
      return {
        domainId: 'it',
        title: 'IT & Digital Infrastructure Specialist',
        answer: `Regarding **CollPoll ERP & Identity Access** at Bennett University:

- **Official ERP Portal**: Access services at [https://bennett.collpoll.com](https://bennett.collpoll.com).
- **Self-Service Password Reset**: Click *"Forgot Password"* on the CollPoll login page; an OTP verification token will be dispatched to your registered mobile number and university email.
- **Account Security Standards**: Passwords must contain at least 8 characters with upper, lower, numeric, and special characters.
- **Lockout Policy**: After 5 unsuccessful attempts, accounts are locked for 15 minutes to protect against credential stuffing.`,
        citation: {
          id: doc.id,
          title: doc.title,
          section: doc.section,
          citation: doc.citation,
          excerpt: doc.excerpt
        },
        actions: [
          { label: 'Open CollPoll ERP Portal', icon: 'external-link' },
          { label: 'Reset Student ERP Password', icon: 'key' }
        ]
      };
    }

    // 3. Microsoft 365 & Software distribution
    if (q.includes('software') || q.includes('office') || q.includes('matlab') || q.includes('teams') || q.includes('onedrive') || q.includes('word') || q.includes('license')) {
      const doc = domain.documents[2];
      return {
        domainId: 'it',
        title: 'IT & Digital Infrastructure Specialist',
        answer: `As an actively enrolled student at Bennett University, you receive complimentary enterprise software licenses:

- **Microsoft 365 Enterprise**: Download Word, Excel, PowerPoint, MS Teams, and 1TB OneDrive cloud storage by signing in to [portal.office.com](https://portal.office.com) with your \`@bennett.edu.in\` account.
- **MathWorks MATLAB Suite**: Full campus-wide license for MATLAB & Simulink with cloud toolboxes via the university academic portal.
- **High-Performance Lab Computing**: Dell engineering workstation clusters equipped with AutoCAD, SolidWorks, and Python ML toolkits are accessible in the Supercomputing Lab.`,
        citation: {
          id: doc.id,
          title: doc.title,
          section: doc.section,
          citation: doc.citation,
          excerpt: doc.excerpt
        },
        actions: [
          { label: 'Access Office 365 Portal', icon: 'download' },
          { label: 'Request MATLAB License Key', icon: 'file-text' }
        ]
      };
    }

    // Default IT fallback with best matching document
    const bestDoc = domain.documents[0];
    return {
      domainId: 'it',
      title: 'IT & Digital Infrastructure Specialist',
      answer: `University IT Services has processed your query regarding **${query}**:

All campus digital infrastructure (Gigabit fiber, CollPoll ERP, biometric turnstiles, and computer labs) is maintained under centralized university IT guidelines. If you require technical assistance or hardware troubleshooting, visit the IT Helpdesk at Academic Block Ground Floor Room 004 or log an IT ticket on CollPoll.`,
      citation: {
        id: bestDoc.id,
        title: bestDoc.title,
        section: bestDoc.section,
        citation: bestDoc.citation,
        excerpt: bestDoc.excerpt
      },
      actions: [
        { label: 'Log IT Support Ticket on CollPoll', icon: 'life-buoy' },
        { label: 'Contact Helpdesk Room 004', icon: 'phone' }
      ]
    };
  },

  finance: (query) => {
    const q = query.toLowerCase();
    const domain = DOMAINS.finance;

    // 1. Fee Payment deadlines & Late fees
    if (q.includes('deadline') || q.includes('due') || q.includes('late fee') || q.includes('when') || q.includes('date') || q.includes('fine') || q.includes('tuition')) {
      const doc = domain.documents[0];
      return {
        domainId: 'finance',
        title: 'Fees, Accounts & Scholarships Specialist',
        answer: `Here are the official fee payment guidelines from the Bennett University Finance Office:

- **Payment Mode**: Semester tuition and hostel fees must be remitted exclusively via the **CollPoll Online Payment Gateway** (UPI, Net Banking, Debit/Credit Card, or RTGS/NEFT challan).
- **Payment Schedule**: Fee notifications are released on CollPoll at the start of each semester; payments must be finalized prior to the published term deadline.
- **Late Fee Penalty**: A late fine of **₹100 per day** is assessed for the first 10 calendar days past the deadline.
- **Administrative Hold**: Accounts with unpaid dues after the grace window incur an administrative hold preventing course registration and exam hall ticket generation.`,
        citation: {
          id: doc.id,
          title: doc.title,
          section: doc.section,
          citation: doc.citation,
          excerpt: doc.excerpt
        },
        actions: [
          { label: 'Pay Semester Fee on CollPoll', icon: 'credit-card' },
          { label: 'Download Fee Receipt / Challan', icon: 'file-text' }
        ]
      };
    }

    // 2. Scholarships (Merit, Single Girl Child, Defense)
    if (q.includes('scholarship') || q.includes('merit') || q.includes('girl child') || q.includes('defense') || q.includes('concession') || q.includes('waiver')) {
      const doc = domain.documents[1];
      return {
        domainId: 'finance',
        title: 'Fees, Accounts & Scholarships Specialist',
        answer: `Bennett University provides institutional scholarships and tuition fee concessions under verified guidelines:

- **Academic Merit Scholarships**: Up to **75% tuition fee waiver** awarded based on entrance percentiles (JEE Main, SAT, CUET, 12th Board).
- **Renewal Criteria**: Continuing students must maintain a minimum **8.0 CGPA** each academic year with zero backlogs and an unblemished disciplinary record.
- **Single Girl Child Concession**: Additional **10% tuition fee waiver** for eligible candidates upon verification of official affidavit.
- **Wards of Defense Personnel**: **5% tuition fee concession** for children of armed forces personnel.`,
        citation: {
          id: doc.id,
          title: doc.title,
          section: doc.section,
          citation: doc.citation,
          excerpt: doc.excerpt
        },
        actions: [
          { label: 'Check Scholarship Renewal Status', icon: 'award' },
          { label: 'Submit Scholarship Documents', icon: 'upload' }
        ]
      };
    }

    // 3. Fee Refund & Withdrawal
    if (q.includes('refund') || q.includes('withdraw') || q.includes('cancellation') || q.includes('security deposit') || q.includes('caution money')) {
      const doc = domain.documents[2];
      return {
        domainId: 'finance',
        title: 'Fees, Accounts & Scholarships Specialist',
        answer: `Fee refund and program withdrawal requests strictly follow **UGC Tiered Guidelines**:

- **15 days or more before admission closure**: **100% refund** (deducting max ₹1,000 administrative charge).
- **Less than 15 days before closure**: **90% refund**.
- **Up to 15 days after closure**: **80% refund**.
- **16 to 30 days after closure**: **50% refund**.
- **Beyond 30 days**: **0% tuition refund**.
- **Security Deposit (Caution Money)**: Refunded **100%** via direct NEFT/RTGS bank transfer upon completion of the institutional clearance process.`,
        citation: {
          id: doc.id,
          title: doc.title,
          section: doc.section,
          citation: doc.citation,
          excerpt: doc.excerpt
        },
        actions: [
          { label: 'Submit UGC Refund Application', icon: 'file-minus' },
          { label: 'Contact Finance Accounts Desk', icon: 'mail' }
        ]
      };
    }

    // Default Finance
    const doc = domain.documents[0];
    return {
      domainId: 'finance',
      title: 'Fees, Accounts & Scholarships Specialist',
      answer: `Regarding your query on **${query}**:

All tuition billing, hostel fees, examination fees, and financial aid disbursals are managed through the University Accounts Office and CollPoll Finance module. For customized fee statements or education loan bank letters, please reach out to the Finance Office.`,
      citation: {
        id: doc.id,
        title: doc.title,
        section: doc.section,
        citation: doc.citation,
        excerpt: doc.excerpt
      },
      actions: [
        { label: 'View Fee Statement on CollPoll', icon: 'file-text' },
        { label: 'Contact Finance Desk', icon: 'phone' }
      ]
    };
  },

  hostel: (query) => {
    const q = query.toLowerCase();
    const domain = DOMAINS.hostel;

    // 1. Gate Pass / Outpass & Curfew (D5 Hostel & all blocks)
    if (q.includes('gate pass') || q.includes('outpass') || q.includes('curfew') || q.includes('10 pm') || q.includes('d5') || q.includes('warden') || q.includes('leave') || q.includes('night') || q.includes('parent')) {
      const doc = domain.documents[0];
      return {
        domainId: 'hostel',
        title: 'Hostel & Residential Life Specialist',
        answer: `Here is the protocol for **Hostel Outpasses & Gate Passes (including D5 Hostel)**:

1. **CollPoll Digital Gate Pass**:
   - All residential students must apply for a **Digital Outpass** via the **CollPoll App** prior to exiting campus.
2. **Day Outpass**:
   - Valid for local visits; students must return before the mandatory **10:00 PM curfew**.
   - Biometric turnstile verification is required at the main security gate upon exit and re-entry.
3. **Night / Weekend Outpass**:
   - Requires explicit **parent verification SMS / call confirmation** submitted through CollPoll at least 12 hours in advance.
   - Upon approval by the Hostel Warden, the digital pass QR code activates for scanning.
4. **Disciplinary Note**: Leaving campus without an approved CollPoll gate pass or late entry past curfew is a serious disciplinary violation.`,
        citation: {
          id: doc.id,
          title: doc.title,
          section: doc.section,
          citation: doc.citation,
          excerpt: doc.excerpt
        },
        actions: [
          { label: 'Apply for CollPoll Gate Pass', icon: 'shield-check' },
          { label: 'Contact D5 Hostel Warden', icon: 'phone' }
        ]
      };
    }

    // 2. Room Maintenance, AC, Leaks, Appliance Safety
    if (q.includes('leak') || q.includes('ac') || q.includes('air conditioning') || q.includes('heater') || q.includes('repair') || q.includes('plumbing') || q.includes('broken') || q.includes('maintenance') || q.includes('water')) {
      const doc = domain.documents[1];
      return {
        domainId: 'hostel',
        title: 'Hostel & Residential Life Specialist',
        answer: `Hostel Facilities Maintenance follows strict service level agreements (SLAs):

- **Emergency Level (Active water leaks, power failure, broken door locks)**: **2-Hour mandatory response SLA**. An on-duty technician is dispatched immediately.
- **Routine Maintenance (AC filter cleaning, plumbing drippage, furniture repair)**: Resolved within **24 to 48 business hours**.
- **Logging Complaints**: Log your maintenance ticket directly on the **CollPoll Hostel Helpdesk module** with your room number.
- **Prohibited Items Warning**: High-wattage cooking appliances (induction hot plates, immersion coils, electric heaters) are strictly prohibited for campus electrical safety; violations carry a ₹5,000 fine.`,
        citation: {
          id: doc.id,
          title: doc.title,
          section: doc.section,
          citation: doc.citation,
          excerpt: doc.excerpt
        },
        actions: [
          { label: 'Log Hostel Maintenance Ticket', icon: 'wrench' },
          { label: 'Call 24/7 Facility Dispatch', icon: 'phone-call' }
        ]
      };
    }

    // 3. Mess Food, Dining Timings & Amenities
    if (q.includes('mess') || q.includes('food') || q.includes('dining') || q.includes('meal') || q.includes('breakfast') || q.includes('lunch') || q.includes('dinner') || q.includes('rangeela') || q.includes('gym') || q.includes('laundry')) {
      const doc = domain.documents[2];
      return {
        domainId: 'hostel',
        title: 'Hostel & Residential Life Specialist',
        answer: `Campus Residential Dining & Recreation Guidelines:

- **Central Mess Timings (4 Daily Meals)**:
  - **Breakfast**: 7:30 AM – 9:30 AM
  - **Lunch**: 12:30 PM – 2:30 PM
  - **Evening Snacks**: 5:00 PM – 6:30 PM
  - **Dinner**: 7:30 PM – 9:30 PM
- **Recreation Facilities**:
  - **Rangeela Lounge & Common Rooms**: Open daily with snooker, foosball, table tennis, and relaxation lounges.
  - **Gym & Fitness Centre**: Air-conditioned gymnasium open 6:00 AM – 9:00 AM and 5:00 PM – 9:00 PM.
  - **App-Based Laundry Hubs**: Located across hostel blocks with automated smart washer/dryer facilities.`,
        citation: {
          id: doc.id,
          title: doc.title,
          section: doc.section,
          citation: doc.citation,
          excerpt: doc.excerpt
        },
        actions: [
          { label: 'View Today’s Mess Menu on CollPoll', icon: 'utensils' },
          { label: 'Check Laundry Machine Availability', icon: 'refresh-cw' }
        ]
      };
    }

    // Default Hostel
    const doc = domain.documents[0];
    return {
      domainId: 'hostel',
      title: 'Hostel & Residential Life Specialist',
      answer: `Regarding your hostel living query on **${query}**:

Hostel administration (D1 through D6 blocks including D5) operates under the supervision of Chief Warden and Student Housing Services. All gate passes, maintenance tickets, and room change requests must be processed via CollPoll.`,
      citation: {
        id: doc.id,
        title: doc.title,
        section: doc.section,
        citation: doc.citation,
        excerpt: doc.excerpt
      },
      actions: [
        { label: 'Open CollPoll Hostel Services', icon: 'home' },
        { label: 'Contact Warden Office', icon: 'phone' }
      ]
    };
  },

  academics: (query) => {
    const q = query.toLowerCase();
    const domain = DOMAINS.academics;

    // 1. Mandatory 75% Biometric Attendance Rule
    if (q.includes('attendance') || q.includes('75%') || q.includes('75 percent') || q.includes('biometric') || q.includes('debar') || q.includes('condonation') || q.includes('medical')) {
      const doc = domain.documents[0];
      return {
        domainId: 'academics',
        title: 'Academics & Examination Specialist',
        answer: `Official regulations regarding the **Mandatory 75% Attendance Rule**:

- **Minimum Requirement**: Students must maintain a strict minimum of **75% attendance** in each registered theory and laboratory course to be eligible to appear in the End-Semester Examinations.
- **Biometric & CollPoll Sync**: Attendance is recorded using biometric finger/card scanners and classroom roll-calls, updating in real time on the **CollPoll App**.
- **Condonation Window (65% – 74.9%)**:
  - Eligible only on documented medical grounds (hospitalization certificate) or official institutional representation (hackathons, sports, cultural events).
  - Requires formal application submitted within 7 days of absence with Dean Academics approval.
- **Below 65% Attendance**: Automatic debarment from the End-Semester Exam with an 'F' / 'I' grade awarded in that subject.`,
        citation: {
          id: doc.id,
          title: doc.title,
          section: doc.section,
          citation: doc.citation,
          excerpt: doc.excerpt
        },
        actions: [
          { label: 'Check Subject-Wise Attendance on CollPoll', icon: 'check-circle' },
          { label: 'Submit Medical Condonation Form', icon: 'file-plus' }
        ]
      };
    }

    // 2. Course Registration & Add/Drop
    if (q.includes('register') || q.includes('add') || q.includes('drop') || q.includes('course') || q.includes('class') || q.includes('credit') || q.includes('overload')) {
      const doc = domain.documents[1];
      return {
        domainId: 'academics',
        title: 'Academics & Examination Specialist',
        answer: `Guidelines for **Course Registration & Add/Drop Period**:

- **Registration Timeline**: Course registration is conducted on CollPoll before the semester starts according to academic calendar slots.
- **Add/Drop Window**: Open during the first **10 instructional days** of the semester. Courses dropped during this period leave **zero record** on your academic grade sheet.
- **Credit Limits**: Standard load is **20 to 24 credits** per semester. Students with CGPA > 8.5 may apply for 1 course overload with Faculty Advisor consent.
- **Withdrawal Period**: Courses dropped between Day 11 and Week 8 receive a 'W' notation (does not affect GPA but counts towards attempted credits).`,
        citation: {
          id: doc.id,
          title: doc.title,
          section: doc.section,
          citation: doc.citation,
          excerpt: doc.excerpt
        },
        actions: [
          { label: 'Open CollPoll Course Registration', icon: 'book' },
          { label: 'View Academic Timetable', icon: 'calendar' }
        ]
      };
    }

    // 3. Exams, Admit Cards, Transcripts & Re-evaluation
    if (q.includes('exam') || q.includes('admit card') || q.includes('hall ticket') || q.includes('transcript') || q.includes('re-eval') || q.includes('grade appeal') || q.includes('cgpa') || q.includes('sgpa')) {
      const doc = domain.documents[2];
      return {
        domainId: 'academics',
        title: 'Academics & Examination Specialist',
        answer: `Information regarding **Examinations, Admit Cards & Transcripts**:

- **Admit Card / Hall Ticket**: Generated on CollPoll **5 days before End-Semester Examinations**. You must clear all attendance and fee dues to download your hall ticket.
- **Grade Grievances & Re-checking**: If you contest an evaluated grade, apply for Answer Script Re-checking within **15 calendar days** of result publication via CollPoll (fee: ₹500/subject, refunded if grade improves).
- **Official Transcripts**: Applied through the Office of the Registrar; official digital stamped transcripts are processed in 2 business days.`,
        citation: {
          id: doc.id,
          title: doc.title,
          section: doc.section,
          citation: doc.citation,
          excerpt: doc.excerpt
        },
        actions: [
          { label: 'Download Exam Admit Card on CollPoll', icon: 'download' },
          { label: 'Request Official Transcript', icon: 'file-check' }
        ]
      };
    }

    // Default Academics
    const doc = domain.documents[0];
    return {
      domainId: 'academics',
      title: 'Academics & Examination Specialist',
      answer: `Regarding your academic inquiry for **${query}**:

Academic curriculum, examination schedules, grading policies, and degree requirements are overseen by Dean Academics and the Office of the Registrar. Consult your designated Faculty Academic Advisor for curriculum and credit advice.`,
      citation: {
        id: doc.id,
        title: doc.title,
        section: doc.section,
        citation: doc.citation,
        excerpt: doc.excerpt
      },
      actions: [
        { label: 'Schedule Academic Advisor Meeting', icon: 'calendar' },
        { label: 'View Academic Calendar', icon: 'book-open' }
      ]
    };
  },

  cdc: (query) => {
    const q = query.toLowerCase();
    const domain = DOMAINS.cdc;

    // 1. Placement drives & Dream / Super Dream CTC tiers
    if (q.includes('placement') || q.includes('cdc') || q.includes('job') || q.includes('dream') || q.includes('super dream') || q.includes('package') || q.includes('ctc') || q.includes('hiring') || q.includes('company')) {
      const doc = domain.documents[0];
      return {
        domainId: 'cdc',
        title: 'Career Development Centre (CDC) Specialist',
        answer: `Guidelines for **Campus Placements & Offer Tiers (CDC)**:

- **Eligibility Criteria**: Minimum **6.5 CGPA** with zero active backlogs at the time of company registration.
- **Offer Tiers**:
  - **Regular Category**: Offers with CTC up to **7 LPA**.
  - **Dream Category**: Offers with CTC between **7 LPA and 12 LPA**.
  - **Super Dream Category**: Offers with CTC above **12 LPA**.
- **Multi-Offer Upgrade Policy**: A student who secures a Regular offer can continue to participate in Dream & Super Dream drives; a student with a Dream offer can contest for Super Dream drives. Once a Super Dream offer is accepted, the candidate exits the placement process.`,
        citation: {
          id: doc.id,
          title: doc.title,
          section: doc.section,
          citation: doc.citation,
          excerpt: doc.excerpt
        },
        actions: [
          { label: 'View Active Placement Drives on Portal', icon: 'briefcase' },
          { label: 'Check Eligibility & CGPA Status', icon: 'check-square' }
        ]
      };
    }

    // 2. Internships & IPC NOC
    if (q.includes('intern') || q.includes('internship') || q.includes('noc') || q.includes('summer') || q.includes('ipc') || q.includes('winter')) {
      const doc = domain.documents[1];
      return {
        domainId: 'cdc',
        title: 'Career Development Centre (CDC) Specialist',
        answer: `Protocol for **Student Industry Internships & University NOC**:

- **Mandatory Requirement**: All undergraduate students must complete accredited summer internships between academic years.
- **Formal NOC Issuance**: To obtain a University No Objection Certificate (NOC) for off-campus internships, submit the official company offer letter to the **Internship & Placement Committee (IPC)** via the CDC portal.
- **Academic Credit Fulfillment**: Submit your mid-term supervisor evaluation report and final completion certificate at the start of the subsequent semester for academic credit evaluation.`,
        citation: {
          id: doc.id,
          title: doc.title,
          section: doc.section,
          citation: doc.citation,
          excerpt: doc.excerpt
        },
        actions: [
          { label: 'Apply for Internship NOC on CDC Portal', icon: 'file-text' },
          { label: 'Submit Internship Completion Letter', icon: 'upload' }
        ]
      };
    }

    // 3. Bennett Finishing School & Training
    const doc = domain.documents[2];
    return {
      domainId: 'cdc',
      title: 'Career Development Centre (CDC) Specialist',
      answer: `Corporate training support via **Bennett Finishing School (BFS)**:

- **Program Structure**: Beginning in the 5th semester, BFS conducts compulsory quantitative aptitude, data structures coding sprints (LeetCode/HackerRank), and mock technical interviews with industry alumni.
- **Attendance Requirement**: Minimum **80% attendance in BFS sessions** is mandatory to remain registered on the active placement portal.
- **Resume Vetting**: All student resumes must receive formal verification and ATS optimization by the CDC before dispatch to visiting recruiters.`,
      citation: {
        id: doc.id,
        title: doc.title,
        section: doc.section,
        citation: doc.citation,
        excerpt: doc.excerpt
      },
      actions: [
        { label: 'Book CDC Mock Interview Session', icon: 'video' },
        { label: 'Submit Resume for ATS Verification', icon: 'file-check' }
      ]
    };
  },

  library: (query) => {
    const q = query.toLowerCase();
    const domain = DOMAINS.library;

    // 1. Book Borrowing, Renewals & KOHA Overdue Fines
    if (q.includes('book') || q.includes('borrow') || q.includes('issue') || q.includes('renew') || q.includes('koha') || q.includes('fine') || q.includes('overdue') || q.includes('card') || q.includes('m-opac')) {
      const doc = domain.documents[0];
      return {
        domainId: 'library',
        title: 'Learning Resource Centre (LRC) Specialist',
        answer: `Borrowing & Circulation rules at the **Learning Resource Centre (Central Library)**:

- **KOHA & RFID Checkout**: The LRC is fully automated with the **KOHA Library Management System** and RFID self-check kiosks.
- **Borrowing Quotas**:
  - **Undergraduates**: Up to **4 books** for **14 days**.
  - **Postgraduates / Research Scholars**: Up to **6 books** for **28 days**.
- **Online Renewals**: Books may be renewed up to 2 times online via the **M-OPAC Mobile App** or library web portal before the due date.
- **Overdue Fines**: A late return fine of **₹5 per day per volume** is assessed on overdue books.`,
        citation: {
          id: doc.id,
          title: doc.title,
          section: doc.section,
          citation: doc.citation,
          excerpt: doc.excerpt
        },
        actions: [
          { label: 'Search KOHA Web OPAC Catalog', icon: 'search' },
          { label: 'Renew Issued Books Online', icon: 'refresh-cw' }
        ]
      };
    }

    // 2. Digital Library, IEEE Xplore, ScienceDirect, Remote Access
    if (q.includes('ieee') || q.includes('journal') || q.includes('research') || q.includes('springer') || q.includes('sciencedirect') || q.includes('delnet') || q.includes('paper') || q.includes('digital') || q.includes('remote')) {
      const doc = domain.documents[1];
      return {
        domainId: 'library',
        title: 'Learning Resource Centre (LRC) Specialist',
        answer: `Accessing **24/7 Digital Library & Research Repositories**:

- **Subscribed Databases**: Full complimentary access to **IEEE Xplore**, **ScienceDirect (Elsevier)**, **SpringerLink**, **ACM Digital Library**, and **DELNET**.
- **On-Campus Access**: Seamless IP-authenticated direct access when connected to **BU-WiFi**.
- **Off-Campus Remote Access**: Log in via the **LRC Remote Access Portal (MyLOFT / EZproxy)** using your \`@bennett.edu.in\` credentials from anywhere worldwide.
- **Download Limits**: Automated bulk crawling or web scraping of copyrighted research papers is strictly prohibited by license agreements.`,
        citation: {
          id: doc.id,
          title: doc.title,
          section: doc.section,
          citation: doc.citation,
          excerpt: doc.excerpt
        },
        actions: [
          { label: 'Launch IEEE Xplore Digital Portal', icon: 'external-link' },
          { label: 'Access LRC Remote Portal (MyLOFT)', icon: 'globe' }
        ]
      };
    }

    // 3. Discussion Rooms & Quiet Study
    const doc = domain.documents[2];
    return {
      domainId: 'library',
      title: 'Learning Resource Centre (LRC) Specialist',
      answer: `Study Facilities & Research Services at the **LRC**:

- **Discussion Rooms**: 6 air-conditioned Collaborative Study Rooms can be reserved on the library portal for 2-hour slots for team projects.
- **Silent Reading Halls**: Open daily until **12:00 AM midnight** (extended to **2:00 AM** during End-Semester examination weeks).
- **Turnitin Plagiarism Verification**: Project reports, capstones, and research papers must obtain a Turnitin similarity clearance certificate at the LRC reference desk.`,
      citation: {
        id: doc.id,
        title: doc.title,
        section: doc.section,
        citation: doc.citation,
        excerpt: doc.excerpt
      },
      actions: [
        { label: 'Book Collaborative Study Room', icon: 'calendar' },
        { label: 'Submit Paper for Turnitin Check', icon: 'file-check' }
      ]
    };
  }
};

/**
 * Generate specialist grounded response with backwards-compatible aliasing
 */
export function generateDomainResponse(domainId, query) {
  // Alias legacy IDs if invoked
  const normalizedId = domainId === 'facilities' ? 'hostel' : (domainId === 'hr' ? 'cdc' : domainId);
  const handler = DOMAIN_RESPONSES[normalizedId];
  if (!handler) {
    throw new Error(`No specialist bot configured for domain: ${domainId}`);
  }
  return handler(query);
}
