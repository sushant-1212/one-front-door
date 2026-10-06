/**
 * Grounded Knowledge Bases for 6 Bennett University Campus Domains
 * Grounded strictly in authentic campus systems: CollPoll ERP, D1-D6 Hostels,
 * 75% Biometric Attendance, CDC Placements, KOHA LRC Library, and BU-WiFi.
 */

export const DOMAINS = {
  it: {
    id: 'it',
    name: 'IT & Digital Infrastructure',
    shortName: 'IT Services',
    role: 'BU-WiFi, CollPoll ERP, Software & Network Specialist',
    color: '#0078D4', // Microsoft Azure Blue
    bgLight: 'rgba(0, 120, 212, 0.12)',
    border: 'rgba(0, 120, 212, 0.3)',
    icon: 'laptop',
    description: 'Handles campus Wi-Fi (BU-WiFi), CollPoll ERP login, Microsoft 365, MATLAB licenses, computer lab workstations, and @bennett.edu.in accounts.',
    keywords: [
      'wifi', 'wi-fi', 'bu-wifi', 'internet', 'network', 'vpn', 'sso', 'password', 'login', 'credentials',
      'collpoll login', 'icampus', 'software', 'license', 'matlab', 'office 365', 'microsoft 365', 'outlook', 'email',
      'teams', 'printer', 'printing', 'laptop', 'desktop', 'lab computer', 'mac', 'windows', 'portal',
      'it ticket', 'helpdesk', 'server', 'ip address', 'dns', 'fiber'
    ],
    documents: [
      {
        id: 'DOC-IT-01',
        title: 'Campus Wi-Fi Network & Onboarding Configuration Standard',
        version: 'v4.4 (Academic Year 2024-2025)',
        section: 'Sec. 2.1 - BU-WiFi Network Access Settings',
        citation: 'BU IT Infrastructure & Network Directive §2.1',
        excerpt: 'Students and faculty connect to SSID "BU-WiFi" across academic blocks, D1-D6 hostels, library, and cafeteria using full university email (username@bennett.edu.in) and primary ERP password. For Android and iOS mobile devices, select EAP Method PEAP, Phase-2 Authentication MSCHAPv2, and set CA certificate to InCommon RSA Server CA or Use System Certificates. Over 10,000 high-speed access points maintain campus-wide gigabit coverage. For manual MAC address whitelisting, visit IT Helpdesk in Academic Block Ground Floor Room 004.'
      },
      {
        id: 'DOC-IT-02',
        title: 'CollPoll ERP & Student Identity Access Management',
        version: 'v3.2 (Official Standard)',
        section: 'Sec. 3.4 - CollPoll & iCampus Account Management',
        citation: 'Student Portal & Identity Standard §3.4',
        excerpt: 'All official student life functions (biometric attendance, timetable, fee challans, hostel gate pass, and exam hall tickets) are accessed via CollPoll ERP (https://bennett.collpoll.com). Passwords must contain minimum 8 characters with alphanumeric and special symbols. Self-service password recovery is enabled via linked registered mobile SMS or university email. Maximum 5 invalid login attempts trigger a temporary 15-minute security lockout.'
      },
      {
        id: 'DOC-IT-03',
        title: 'Microsoft 365 Enterprise & Academic Software Distribution',
        version: 'v2024-B',
        section: 'Sec. 1.5 - Academic Software Licenses & Lab Workstations',
        citation: 'University Academic Computing Handbook §1.5',
        excerpt: 'Enrolled students receive complimentary licenses for Microsoft 365 Enterprise (Word, Excel, PowerPoint, MS Teams, 1TB OneDrive cloud storage) using their @bennett.edu.in credentials via portal.office.com. MathWorks MATLAB Campus-Wide Suite, AutoCAD, and specialized engineering software are pre-configured on Dell workstation clusters in the Supercomputing Lab and Engineering Computing Labs.'
      }
    ]
  },

  finance: {
    id: 'finance',
    name: 'Fees, Accounts & Scholarships',
    shortName: 'Accounts & Fees',
    role: 'Tuition Fees, CollPoll Payment, Scholarships & Refunds Specialist',
    color: '#107C41', // Emerald Green
    bgLight: 'rgba(16, 124, 65, 0.12)',
    border: 'rgba(16, 124, 65, 0.3)',
    icon: 'credit-card',
    description: 'Handles semester tuition and hostel fee schedules, CollPoll fee payment gateway, late fees, UGC-compliant refund guidelines, and merit scholarships.',
    keywords: [
      'tuition', 'fee', 'fees', 'hostel fee', 'mess fee', 'bursar', 'finance', 'payment', 'collpoll payment',
      'due date', 'deadline', 'late fee', 'scholarship', 'merit scholarship', 'single girl child', 'defense scholarship',
      'concession', 'invoice', 'receipt', 'challan', 'refund', 'ugc refund', 'direct deposit', 'neft', 'rtgs', 'account hold', 'billing'
    ],
    documents: [
      {
        id: 'DOC-FIN-01',
        title: 'Semester Tuition & Hostel Fee Payment Regulations',
        version: 'Academic Year 2024-2025',
        section: 'Sec. 4.2 - Payment Windows, Online CollPoll Gateway & Fines',
        citation: 'BU Finance Office Regulations §4.2',
        excerpt: 'Semester tuition and residential hostel fees must be remitted prior to the notified term due date exclusively through the CollPoll Online Payment Gateway via Net Banking, UPI, Debit/Credit Card, or RTGS/NEFT challan. Payments delayed beyond the due date incur a late fee of ₹100 per day for the initial 10 calendar days, after which an administrative registration hold is applied.'
      },
      {
        id: 'DOC-FIN-02',
        title: 'Academic Merit, Single Girl Child & Wards Scholarships',
        version: 'Policy Rev. 5.1',
        section: 'Sec. 2.3 - Institutional Scholarship Renewal & Criteria',
        citation: 'BU Scholarship & Financial Assistance Code §2.3',
        excerpt: 'Bennett University awards up to 75% tuition fee waiver scholarships based on entrance percentile (JEE Main / SAT / CUET / 12th Board). Continuing students must maintain minimum 8.0 CGPA without any backlog and zero disciplinary sanctions to renew merit scholarships. Special concessions exist for Single Girl Child (10% waiver) and Wards of Defense Personnel (5% waiver).'
      },
      {
        id: 'DOC-FIN-03',
        title: 'University Fee Refund & Program Withdrawal Policy',
        version: 'v4.4 (UGC Aligned)',
        section: 'Sec. 5.1 - UGC Tiered Refund Schedule',
        citation: 'Student Accounts & UGC Refund Policy §5.1',
        excerpt: 'Program withdrawal refund requests are governed by mandatory UGC guidelines: 100% refund (less ₹1,000 processing deduction) if formally withdrawn 15 days or more before the formally notified last admission date; 90% if less than 15 days before; 80% if within 15 days after; 50% between 16 and 30 days after; and 0% beyond 30 days. Security deposits are refunded 100% via direct bank transfer.'
      },
      {
        id: 'DOC-FIN-04',
        title: 'Scholarship Continuation, UFM Review & Irreversibility Clause',
        version: 'Scholarship Policy Rev. 2024',
        section: 'Sec. 3.2 - Retention Evaluation & Irreversible Withdrawal Clause',
        citation: 'BU Scholarship Policy & Regulations §3.2',
        excerpt: 'Merit scholarship continuation is formally evaluated after the declaration of even-semester end-term results. Students must maintain a minimum 8.0 CGPA with zero backlogs and zero Unfair Means (UFM) or disciplinary actions. Under the official irreversibility clause, if a scholarship is withdrawn due to GPA shortfall or backlogs, it cannot be restored in subsequent academic years, and full tuition fees must be remitted. Grade improvement exam results are not admissible for scholarship retention.'
      }
    ]
  },

  hostel: {
    id: 'hostel',
    name: 'Hostels & Residential Living',
    shortName: 'Hostel & Living',
    role: 'Hostels D1-D6, CollPoll Gate Pass, Mess, Curfew & Maintenance Specialist',
    color: '#D83B01', // Warm Amber/Orange
    bgLight: 'rgba(216, 59, 1, 0.12)',
    border: 'rgba(216, 59, 1, 0.3)',
    icon: 'building-2',
    description: 'Handles hostels D1 to D6 (including D5), CollPoll digital gate passes, 10:00 PM curfew, mess dining timings, Rangeela lounge, laundry, and AC repairs.',
    keywords: [
      'hostel', 'dorm', 'residence', 'room', 'd5', 'd5 hostel', 'd1', 'd2', 'd3', 'd4', 'd6',
      'gate pass', 'outpass', 'curfew', '10 pm', 'warden', 'leave', 'night pass', 'parent approval',
      'mess', 'food', 'dining', 'cafeteria', 'breakfast', 'lunch', 'dinner', 'rangeela lounge',
      'ac', 'air conditioning', 'heater', 'leak', 'plumbing', 'tap', 'water', 'electricity', 'light',
      'repair', 'maintenance', 'laundry', 'washer', 'gym', 'sports complex', 'cleaning'
    ],
    documents: [
      {
        id: 'DOC-HST-01',
        title: 'Residential Code, D5 Hostel Operations & CollPoll Digital Gate Pass',
        version: 'Hostel Code 2024-2025',
        section: 'Sec. 7.1 - Mandatory Digital Outpass & Curfew Rules',
        citation: 'BU Residential Living & Hostel Regulations §7.1',
        excerpt: 'All residential students in D1 through D6 hostels (including D5) must secure an approved Digital Gate Pass on the CollPoll app before leaving campus. Day outpasses require automated biometric verification at the security turnstiles and return by 10:00 PM curfew. Night/weekend leave outpasses require explicit parent approval SMS/call verification on CollPoll. Unapproved absence or scaling boundary walls constitutes a Level-2 disciplinary offense.'
      },
      {
        id: 'DOC-HST-02',
        title: 'Hostel Maintenance SLA, AC Upkeep & Appliance Safety',
        version: 'Rev. 2024.2',
        section: 'Sec. 3.2 - Room Upkeep & Prohibited Electrical Items',
        citation: 'Hostel Facilities Maintenance Manual §3.2',
        excerpt: 'Residential rooms are fully air-conditioned with centralized power backup. Maintenance complaints (water leakage, AC cooling, plumbing, light fixtures) must be registered on CollPoll with a mandatory 2-hour response SLA for emergency leaks and 24 hours for general repairs. High-wattage cooking appliances (induction plates, electric heaters, immersion rods) are strictly prohibited for fire safety; violation incurs a ₹5,000 penalty.'
      },
      {
        id: 'DOC-HST-03',
        title: 'Campus Mess, Rangeela Lounge & Recreation Facilities',
        version: 'v3.5',
        section: 'Sec. 6.4 - Student Dining, Lounge & Sports Amenities',
        citation: 'Student Welfare & Campus Amenities Handbook §6.4',
        excerpt: 'The central mess serves 4 nutritious meals daily: Breakfast (7:30-9:30 AM), Lunch (12:30-2:30 PM), Evening Snacks (5:00-6:30 PM), and Dinner (7:30-9:30 PM). Students have access to the Rangeela Lounge, snooker, foosball, table tennis, fully equipped gym, basketball & badminton courts, and automated app-based laundry hubs.'
      },
      {
        id: 'DOC-HST-04',
        title: 'Standing Orders for Hostels, Nalanda Living & In-Hostel Curfew',
        version: 'Standing Orders 2024-2025',
        section: 'Sec. 4.1 - In-Hostel Timings, Opposite-Gender Visiting & Off-Campus Housing',
        citation: 'BU Standing Orders for Hostels §4.1',
        excerpt: 'Residents must be inside their respective hostel blocks by 11:30 PM (campus main gate curfew is 10:00 PM). Entering rooms of the opposite gender is strictly prohibited. Once allocated, unapproved room changes are forbidden without written approval from the Chief Warden. For students who cannot be accommodated on-campus due to seat limits, verified housing is coordinated via Nalanda Living.'
      }
    ]
  },

  academics: {
    id: 'academics',
    name: 'Academics & Examination',
    shortName: 'Academics & Exams',
    role: '75% Attendance, Exams, Admit Cards, Transcripts & Grading Specialist',
    color: '#8764B8', // Purple
    bgLight: 'rgba(135, 100, 184, 0.12)',
    border: 'rgba(135, 100, 184, 0.3)',
    icon: 'graduation-cap',
    description: 'Handles the mandatory 75% biometric attendance rule, CollPoll exam schedules, admit cards / hall tickets, Add/Drop courses, CGPA, and grade appeals.',
    keywords: [
      'attendance', '75%', '75 percent', 'biometric attendance', 'debar', 'debarment', 'condonation',
      'course', 'class', 'register', 'registration', 'add drop', 'drop', 'withdraw', 'credit',
      'exam', 'examination', 'midterm', 'end sem', 'admit card', 'hall ticket', 'date sheet', 'timetable',
      'grade', 'gpa', 'cgpa', 'sgpa', 'grade appeal', 're-evaluation', 'transcript', 'degree', 'dean academics', 'registrar'
    ],
    documents: [
      {
        id: 'DOC-ACAD-01',
        title: 'Mandatory 75% Biometric Attendance & Exam Eligibility',
        version: 'Academic Regulations 2024-2025',
        section: 'Sec. 8.2 - Minimum Attendance Threshold & Debarment',
        citation: 'BU Academic Regulations Code §8.2',
        excerpt: 'A minimum of 75% attendance in each registered theory and laboratory course is strictly required to be eligible to appear in End-Semester Examinations. Attendance is marked via biometric scanners and lecture roll-calls synchronized directly with CollPoll ERP. Students with attendance between 65% and 74.9% may apply for medical/institutional duty condonation with Dean Academics approval. Below 65% results in automatic debarment (Grade "F"/"I").'
      },
      {
        id: 'DOC-ACAD-02',
        title: 'Course Registration, Add/Drop Period & Academic Advising',
        version: 'Office of the Registrar v5.2',
        section: 'Sec. 4.1 - Semester Course Enrollment & Credit Caps',
        citation: 'Registry Enrollment Handbook §4.1',
        excerpt: 'Course registration takes place on CollPoll before the start of each semester. The Add/Drop period remains open during the first 10 instructional days. Standard undergraduate course load is 20-24 credits per semester. Students with CGPA > 8.5 may take 1 additional course overload. Dropping a course within the add/drop window leaves zero notation on the grade sheet.'
      },
      {
        id: 'DOC-ACAD-03',
        title: 'End-Semester Examinations, Hall Tickets & Grade Grievances',
        version: 'v4.1',
        section: 'Sec. 11.3 - CollPoll Admit Card Issuance & Re-evaluation',
        citation: 'Office of the Controller of Examinations §11.3',
        excerpt: 'Digital Hall Tickets / Admit Cards are released on CollPoll 5 days before exams for all eligible students cleared of financial and attendance holds. A student contesting an evaluated grade may apply for Answer Script Re-checking within 15 calendar days of result publication via the ERP examination module with a ₹500 fee per subject (refunded if grade changes).'
      },
      {
        id: 'DOC-ACAD-04',
        title: 'X-Grade Award, Debarment & Supplementary Examination Restrictions',
        version: 'Academic Ordinances 2024-2025',
        section: 'Sec. 9.3 - Debarment Consequences & Course Re-registration',
        citation: 'BU Academic Regulations & Examination Ordinances §9.3',
        excerpt: 'Students debarred due to attendance shortage (<75% without approved medical condonation) receive an official "X" Grade on their grade report. Crucially, students awarded an "X" Grade are strictly barred from appearing in Supplementary Examinations and must re-register for the course during the regular semester or Summer Semester. Outstanding academic performance across course components is recognized with an "O" Grade.'
      }
    ]
  },

  cdc: {
    id: 'cdc',
    name: 'Career Development Centre (CDC)',
    shortName: 'Placements & CDC',
    role: 'Campus Placements, Dream Offers, Internships & Finishing School Specialist',
    color: '#E3008C', // Deep Rose / Magenta
    bgLight: 'rgba(227, 0, 140, 0.12)',
    border: 'rgba(227, 0, 140, 0.3)',
    icon: 'briefcase',
    description: 'Handles campus placement drives, Bennett Finishing School, Dream & Super Dream offers, Internship & Placement Committee (IPC), and interview prep.',
    keywords: [
      'placement', 'placements', 'cdc', 'career', 'job', 'dream offer', 'super dream', 'ctc', 'package',
      'internship', 'intern', 'ipc', 'noc', 'summer internship', 'winter internship', 'company', 'interview',
      'resume', 'bennett finishing school', 'bfs', 'aptitude', 'coding test', 'ta', 'teaching assistant', 'ra'
    ],
    documents: [
      {
        id: 'DOC-CDC-01',
        title: 'Campus Placement Policy & Dream/Super Dream CTC Tiering',
        version: 'Placement Year 2024-2025',
        section: 'Sec. 3.1 - Eligibility Criteria & Multi-Offer Tiers',
        citation: 'Career Development Centre Placement Code §3.1',
        excerpt: 'To register for campus placement drives, students must maintain minimum 6.5 CGPA with zero active backlogs at the time of recruitment. The CDC categorizes job opportunities into Regular (up to 7 LPA), Dream (7 to 12 LPA), and Super Dream (above 12 LPA). A candidate securing a Dream offer remains eligible to appear for Super Dream recruitment drives until a final selection is accepted.'
      },
      {
        id: 'DOC-CDC-02',
        title: 'Mandatory Industry Internships & Formal NOC Clearance',
        version: 'Policy Rev. 4.0',
        section: 'Sec. 5.2 - Summer/Winter Internship Protocol',
        citation: 'Internship & Placement Committee (IPC) Manual §5.2',
        excerpt: 'All undergraduate students must complete mandatory summer internships between semesters. Off-campus internship offers must be submitted to the IPC for academic credit evaluation and issuance of the formal University No Objection Certificate (NOC). Maximum permissible duration during instructional terms is approved only in 8th semester for capstone projects.'
      },
      {
        id: 'DOC-CDC-03',
        title: 'Bennett Finishing School & Corporate Training Programs',
        version: 'v2.8',
        section: 'Sec. 2.4 - Soft Skills, Mock Interviews & Coding Bootcamps',
        citation: 'Bennett Finishing School Directive §2.4',
        excerpt: 'The Bennett Finishing School conducts mandatory aptitude training, mock technical coding assessments on platforms like LeetCode/HackerRank, and corporate communication workshops beginning in the 5th semester. Attendance in BFS training sessions is compulsory to maintain active placement registration.'
      }
    ]
  },

  library: {
    id: 'library',
    name: 'Learning Resource Centre (LRC)',
    shortName: 'LRC Library',
    role: 'KOHA System, RFID Cards, Book Borrowing & E-Journals Specialist',
    color: '#008272', // Teal / Green-Blue
    bgLight: 'rgba(0, 130, 114, 0.12)',
    border: 'rgba(0, 130, 114, 0.3)',
    icon: 'book-open',
    description: 'Handles the automated KOHA library system, RFID smart cards, book borrowing & renewals, M-OPAC mobile app, 24/7 IEEE/Springer digital access, and study carrels.',
    keywords: [
      'library', 'lrc', 'book', 'books', 'borrow', 'issue', 'return', 'renew', 'renewal', 'koha', 'm-opac', 'opac',
      'fine', 'overdue', 'rfid', 'smart card', 'e-journal', 'ieee', 'ieee xplore', 'sciencedirect', 'springer',
      'delnet', 'research paper', 'study room', 'quiet room', 'plagiarism', 'turnitin', 'reading hall'
    ],
    documents: [
      {
        id: 'DOC-LIB-01',
        title: 'KOHA Integrated Library System & Book Circulation Norms',
        version: 'Library Guide 2024-2025',
        section: 'Sec. 2.3 - Book Borrowing Quotas & Overdue Fines',
        citation: 'Learning Resource Centre (LRC) Handbook §2.3',
        excerpt: 'The LRC operates on the open-source KOHA Library Management System with RFID smart card check-in/out. Undergraduates may borrow up to 4 books for a 14-day loan period; postgraduates/research scholars may borrow 6 books for 28 days. Renewals can be executed online twice via the M-OPAC mobile app before the due date. Overdue books incur a fine of ₹5 per day per volume.'
      },
      {
        id: 'DOC-LIB-02',
        title: '24/7 Digital Library & Remote E-Resource Access',
        version: 'v4.0 (Digital Library Standard)',
        section: 'Sec. 4.1 - Research Database Subscriptions & Remote Proxy',
        citation: 'Digital Library E-Resource Policy §4.1',
        excerpt: 'The university subscribes to premier international digital repositories: IEEE Xplore, ScienceDirect (Elsevier), SpringerLink, ACM Digital Library, and DELNET. Students can access full-text research articles, journals, and conference proceedings on-campus via IP authentication, or remotely from anywhere via the LRC Remote Access Portal with university credentials.'
      },
      {
        id: 'DOC-LIB-03',
        title: 'Discussion Rooms, Quiet Study Zones & Thesis Submission',
        version: 'v3.1',
        section: 'Sec. 1.8 - Library Facilities & Plagiarism Clearance',
        citation: 'LRC Code of Conduct & Research Services §1.8',
        excerpt: 'The LRC features 6 air-conditioned Collaborative Discussion Rooms bookable on the library portal for 2-hour group study slots, as well as Silent Reading Halls open until 12:00 AM midnight (extended to 2:00 AM during End-Semester exams). Final year project reports and research dissertations must undergo mandatory Turnitin anti-plagiarism verification at the LRC reference desk.'
      },
      {
        id: 'DOC-LIB-04',
        title: '24/7 LRC Access, Circulation Desk Hours & Smart RFID Drop Box',
        version: 'LRC Operational Guidelines 2024-2025',
        section: 'Sec. 1.4 - 24/7 Reading Facilities, RFID Book Drop & Mobile App',
        citation: 'Learning Resource Centre Circulation Policy §1.4',
        excerpt: 'Central Library and Law Library reading facilities are accessible 24/7 with university smart ID cards. Active circulation desk transactions (issuing and manual renewals) run daily from 9:00 AM to 9:00 PM. Book returns can be completed 24/7 using the automated RFID Book Drop Box. Online catalog reservations, renewal tracking, and account holds are managed via the Web OPAC (libraryopac.bennett.edu.in) and the official "Bennett University LRC" mobile app. For inquiries: libraryhelpdesk@bennett.edu.in.'
      }
    ]
  }
};

/**
 * Pre-configured test scenarios specifically designed for Hackathon Judges
 * Highlighting Bennett University specific campus challenges and problem statement requirements!
 */
export const DEMO_PRESETS = [
  {
    id: 'single-it',
    label: 'Single Domain (IT & WiFi)',
    tag: 'Direct Routing 96%',
    query: 'How do I connect to campus BU-WiFi on my phone?',
    expectedType: 'DIRECT',
    description: 'Demonstrates clean single-domain classification to IT Services with official WPA2-Enterprise onboarding guidelines.'
  },
  {
    id: 'multi-hostel-finance',
    label: 'Multi-Topic (D5 Hostel + CollPoll Fees)',
    tag: 'Multi-Intent Splitter',
    query: 'How do I apply for a late gate pass from D5 hostel, and what is the last date to submit semester fees on CollPoll?',
    expectedType: 'MULTI',
    description: 'Demonstrates multi-intent decomposition: splits into Hostel Living (D5 outpass) + Accounts & Fees (CollPoll deadline).'
  },
  {
    id: 'ambiguous-clarify',
    label: 'Ambiguous Intent (Clarify)',
    tag: 'Clarify Fallback',
    query: 'I need to renew my student pass',
    expectedType: 'CLARIFY',
    description: 'Scores between 40-65% confidence; triggers interactive clarification chips across Hostel Gate Pass, Library Pass, and Gym Pass.'
  },
  {
    id: 'out-of-scope-handoff',
    label: 'Out-of-Scope (Proctorial Handoff)',
    tag: 'Ticket Fallback',
    query: 'Can I land a private helicopter on the campus sports ground for my presentation?',
    expectedType: 'HANDOFF',
    description: 'Confidence < 40%; triggers graceful human handoff ticket creation to Dean of Students & Proctorial Board.'
  },
  {
    id: 'cross-academics-cdc',
    label: 'Cross-Domain (75% Attendance + CDC)',
    tag: 'Complex Multi-Intent',
    query: 'What is the minimum attendance required for final exams, and what CGPA do I need for CDC campus placement drives?',
    expectedType: 'MULTI',
    description: 'Dual domain across Academic Regulations (75% Biometric rule) and Career Development Centre (Dream/Super Dream tiering).'
  },
  {
    id: 'single-library',
    label: 'Library & Research (LRC)',
    tag: 'LRC Specialist 98%',
    query: 'How many books can I issue from the LRC library and how do I access IEEE research papers?',
    expectedType: 'DIRECT',
    description: 'Demonstrates LRC Specialist with KOHA borrowing quotas and remote IEEE Xplore digital access.'
  }
];
