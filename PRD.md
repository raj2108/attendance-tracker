# Product Requirements Document (PRD)

## Product Name
Smart Attendance Tracker (Mobile-First Web App)

## Product Vision
A lightweight mobile-first web application that helps college students track attendance per subject, predict how many classes they can safely miss before dropping below 75%, and receive timely alerts when attendance becomes risky.

The goal is to remove uncertainty, prevent last-minute panic, and help students make smarter decisions about when they can skip or must attend classes.

## Problem Statement
Students often do not know:
- their exact attendance percentage per subject
- how many more classes they can miss safely
- when they are approaching the 75% threshold
- which class they should prioritize attending

Most universities do not provide real-time attendance analytics. This app solves that gap.

## Target Users
### Primary Users
- Undergraduate college students
- Engineering students with strict attendance rules
- Students managing multiple theory + lab subjects

### Secondary Users
- Students preparing attendance strategies before exams

## Success Metrics
### Primary Metrics
- Daily active usage during semester
- Number of subjects tracked per student
- Notification engagement rate

### Secondary Metrics
- Reduced attendance shortage cases
- Weekly return usage

## Core Features (MVP)
### 1) Subject Setup
User can:
- Add subject name
- Add total classes conducted
- Add classes attended
- Set attendance requirement (default = 75%)

Optional:
- Mark subject as theory or lab

### 2) Attendance Dashboard
Main mobile screen shows:
- Subject list
- Attendance percentage per subject
- Color indicators:
  - Green (>75%)
  - Yellow (70–75%)
  - Red (<70%)

Tap subject → opens detailed analytics.

### 3) Safe Bunk Calculator
System automatically calculates:
- If attendance >75%: how many classes can be missed safely
- If attendance <75%: how many classes must be attended continuously to recover

Formula:
- Current Attendance % = (Classes Attended / Total Classes) × 100

Safe bunk prediction logic updates dynamically after each entry.

### 4) Smart Alerts / Push Notifications
Notifications triggered when:
1. Attendance drops below 80%
2. Attendance drops below 75%
3. Only 1 safe bunk remains
4. Attendance recovery is required urgently

Example notifications:
- "Only 2 safe bunks left in DBMS"
- "Attend next 3 OS classes to reach 75%"
- "Warning: CN attendance below required threshold"

### 5) Add Class Quickly (One-Tap Mode)
User taps:
- Present
- Absent
- Cancelled

System updates analytics instantly.

### 6) Daily Reminder Notification
Optional reminder:
- "Update today’s attendance"

Customizable reminder time (e.g., 9 PM daily).

### 7) Recovery Mode
When attendance drops below threshold, app shows:
- "Attend next X consecutive classes"

Example:
- "Attend next 5 classes to reach 75%"

## Future Features (Phase 2)
- Timetable integration (auto-detect today’s class)
- Predictive attendance simulation
- Multi-device sync (Google login)
- Cloud backup
- Semester summary report

## User Flow
1. User opens app
2. Adds subjects
3. Inputs current attendance values
4. Dashboard displays safe bunk insights
5. User updates attendance daily with one tap
6. User receives alerts before shortage risk

## UI/UX Design Principles
- Mobile-first layout
- Thumb-friendly buttons
- Minimal typing
- Large percentage display
- Color-coded warnings
- Offline-first functionality
- Fast loading (<1 second)

## Screens Required
1. Onboarding
2. Dashboard
3. Subject Detail Screen
4. Quick Update Screen
5. Settings

## Notification Strategy
Push notifications triggered by:
- Below 85%
- Below 80%
- Below 75%
- Critical shortage
- Recovery milestones reached

Use smart batching to avoid spam.

## Data Model
### Subject Object
- subject_name
- classes_attended
- classes_total
- attendance_threshold
- subject_type
- last_updated_date

### Derived Fields
- attendance_percentage
- safe_bunks_remaining
- classes_needed_for_recovery

## Recommended Tech Stack
- Frontend: React + Vite (PWA support)
- Mobile optimization: installable PWA
- Backend (Phase 2): Firebase
- Notifications: Firebase Cloud Messaging
- Storage (MVP): LocalStorage / IndexedDB

## Edge Cases
- Holiday classes
- Cancelled lectures
- Extra classes added suddenly
- Manual correction support
- Attendance policy change mid-semester

## Risks and Mitigation
- User forgets to update attendance → daily reminders
- Policy differences across subjects → flexible threshold settings
- Labs vs theory mismatch → manual override support
- Notification fatigue → batched and priority-aware alerts

## Monetization (Optional Future)
### Free
- Core tracking features

### Premium
- Cloud sync
- Advanced prediction engine
- Timetable auto-detection
- Semester analytics dashboard

## Launch Strategy
- Phase 1: Single-user offline PWA
- Phase 2: Login + sync
- Phase 3: Campus-wide adoption

## Expected Outcome
Students can always answer:
- Can I bunk tomorrow?
- Which subject is risky?
- How many classes must I attend next?

Result: zero surprise attendance shortages before exams.
