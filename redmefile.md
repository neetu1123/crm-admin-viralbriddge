Implement a complete CRM Lead Management Enhancement for the ViralBridge Admin/Client Portal.

IMPORTANT

The CRM module already exists.

DO NOT recreate the existing CRM from scratch.

Inspect the existing CRM implementation, database schema, authentication, roles, permissions, lead model, and UI components first.

Extend the existing CRM without breaking any current functionality.

The main requirements are:

1. Lead Assignment to CRM Agents
2. Select All Leads
3. Bulk Lead Assignment
4. Agent Management
5. Lead Reassignment
6. Agent Workload
7. Excel/CSV Import
8. Excel/CSV Export
9. Import Validation
10. Duplicate Detection
11. Import Preview
12. Import Error Report
13. Import History
14. Export Filters
15. Role-Based Permissions
16. Assignment History
17. Notifications
18. Audit Logs
19. Bulk Operations
20. Production-ready frontend and backend behavior


==================================================
1. CRM LEAD MANAGEMENT
==================================================

The existing CRM should continue to provide:

- Lead listing
- Lead creation
- Lead editing
- Lead details
- Search
- Filters
- Sorting
- Pagination
- Follow-ups
- Activities
- Notes

Enhance the Leads page with:

- Select checkbox
- Select all checkbox
- Bulk actions
- Import
- Export
- Assign Agent


==================================================
2. LEAD TABLE
==================================================

Update the CRM lead table.

Columns:

- Checkbox
- Lead Name
- Company
- Email
- Phone
- Lead Type
- Lead Source
- Status
- Priority
- Assigned Agent
- Created Date
- Last Updated
- Actions

Example:

---------------------------------------------------------
Lead          Company       Status       Agent
---------------------------------------------------------
☐ Rahul       ABC Ltd       New          Neha
☐ Priya       XYZ Ltd       Qualified    Rahul
☐ Amit        Acme Ltd      New          Unassigned
---------------------------------------------------------


==================================================
3. SELECT ALL
==================================================

Implement proper bulk selection.

The checkbox in the table header should select all leads on the current page.

Example:

25 leads displayed.

User clicks:

Select All

Result:

25 current-page leads selected.

Display:

"25 leads selected"

Do NOT automatically select every lead in the entire database.

If more records exist, show:

"Select all 1,248 leads matching this filter"

Allow the user to explicitly select all matching records.

Example:

Showing 25 of 1,248 leads

[✓] Select all 25 on this page

Then show:

"Select all 1,248 leads matching this search"

Only after clicking the second action should all matching records be selected.


==================================================
4. BULK ACTION BAR
==================================================

When one or more leads are selected, display a bulk action toolbar.

Example:

3 Leads Selected

Actions:

- Assign Agent
- Change Status
- Change Priority
- Add Tag
- Add Follow-up
- Export Selected
- Delete

Do not show bulk actions when no lead is selected.


==================================================
5. ASSIGN LEAD TO AGENT
==================================================

Add:

[ Assign Agent ]

When clicked, open an assignment modal/drawer.

Title:

Assign Leads

Display:

Selected Leads:
3

Select Agent:

[ Search Agent ]

Agent cards/dropdown should show:

- Agent Name
- Profile Image
- Active/Inactive status
- Current Lead Count
- Today's Follow-ups

Example:

Rahul Sharma
Active
127 Leads
23 Follow-ups Today

Neha Singh
Active
54 Leads
8 Follow-ups Today


==================================================
6. ASSIGNMENT CONFIRMATION
==================================================

Before assigning:

Show confirmation:

"You are about to assign 3 leads to Neha Singh."

Buttons:

Cancel

Assign Leads

After success:

"3 leads successfully assigned to Neha Singh."


==================================================
7. SINGLE LEAD ASSIGNMENT
==================================================

Each lead should also support individual assignment.

Lead action:

Assign Agent

Example:

Lead:

Acme Pvt Ltd

Current Agent:

Rahul Sharma

Action:

[ Reassign ]

Select:

Neha Singh

Reason:

Agent unavailable

[ Confirm Reassignment ]


==================================================
8. REASSIGNMENT
==================================================

If a lead already has an agent:

Do not silently overwrite the previous assignment.

Create an assignment history record.

Example:

Assignment History

Aug 20
Assigned to Rahul Sharma
Assigned by Admin

Aug 22
Reassigned to Neha Singh
Reason: Agent unavailable
Changed by Super Admin


==================================================
9. AGENT MANAGEMENT
==================================================

Create/extend:

/crm/agents

Display:

- Agent Name
- Email
- Phone
- Role
- Status
- Assigned Leads
- Active Follow-ups
- Last Activity
- Actions

Agent statuses:

ACTIVE
INACTIVE
ON_LEAVE
SUSPENDED


==================================================
10. ACTIVE AGENTS
==================================================

Only ACTIVE agents should normally appear in the assignment dropdown.

Inactive, suspended, or unavailable agents should not be selectable for new assignments.

Existing leads assigned to an inactive agent must remain visible.

Admin should be able to reassign those leads.


==================================================
11. AGENT WORKLOAD
==================================================

Show workload information before assignment.

Example:

Rahul Sharma
Active
127 Leads
23 Follow-ups Today

Neha Singh
Active
54 Leads
8 Follow-ups Today

Amit Kumar
Active
201 Leads
31 Follow-ups Today


==================================================
12. AUTO ASSIGN
==================================================

Prepare the architecture for:

Auto Assign

When enabled:

Automatically distribute selected leads among active agents.

Example:

500 leads

10 active agents

Distribute approximately:

50 leads per agent.

Also prepare a future workload-based strategy where leads are assigned according to current workload instead of simple equal distribution.


==================================================
13. EXCEL IMPORT
==================================================

Add:

[ Import Leads ]

The CRM must support importing:

.xlsx
.xls
.csv

Do not immediately insert uploaded records into the database.

Use this flow:

Upload
↓
Parse
↓
Validate
↓
Detect Duplicates
↓
Preview
↓
Admin Confirmation
↓
Import
↓
Import Report


==================================================
14. IMPORT UI
==================================================

Create an Import Leads modal/page.

Step 1:

Upload File

Display:

"Drag & Drop your Excel file here"

OR

[ Choose File ]

Supported formats:

.xlsx
.xls
.csv


==================================================
15. DOWNLOAD TEMPLATE
==================================================

Add:

[ Download Excel Template ]

Template columns:

First Name
Last Name
Email
Phone
Alternate Phone
WhatsApp Number
Company Name
Job Title
Industry
Company Size
GST Number
Lead Type
Lead Source
Priority
Status
Country
State
City
Postal Code
Address
Expected Deal Value
Assigned Agent Email
Next Follow-up Date
Description
Tags


==================================================
16. IMPORT PREVIEW
==================================================

After uploading, do NOT save immediately.

Show an import summary.

Example:

Import Preview

Total Rows: 500

Valid: 472

Warnings: 18

Duplicates: 32

Errors: 10

Display a preview table:

Row
Name
Email
Company
Agent
Status

Example:

2 | Rahul Sharma | rahul@email.com | ABC Ltd | Neha | Valid

3 | Priya | invalid-email | XYZ Ltd | Rahul | Error

4 | Acme | existing@email.com | Acme | Neha | Duplicate


==================================================
17. VALIDATION
==================================================

Validate every imported row.

Required fields:

First Name

AND at least one of:

Email
Phone

Validate:

Email format

Phone format

Lead Type

Lead Source

Priority

Status

Date format

Currency/amount

Assigned Agent Email

Do not import invalid enum values.

Example:

Supported Lead Type:

Brand
Creator
Agency
Enterprise Client
Investor
Partner
Other

If Excel contains:

Customer

and this value is not supported:

Mark the row as ERROR.

Do not silently modify user data.


==================================================
18. DUPLICATE DETECTION
==================================================

Detect duplicates using:

1. Email
2. Phone
3. Company + Email

Example:

Existing:

Priya Sharma
priya@gmail.com

Excel:

Priya Sharma
priya@gmail.com

Result:

Duplicate


==================================================
19. DUPLICATE STRATEGY
==================================================

Before confirming import, show:

Duplicate Records

Options:

○ Skip Duplicates

○ Update Existing Leads

○ Import as New Leads

Default:

Skip Duplicates

If "Update Existing Leads" is selected:

Only update approved lead fields.

Do NOT overwrite automatically:

- Internal Notes
- Assignment History
- Follow-up History
- Activity History
- Existing Agent Assignment

unless explicitly supported by the import configuration.


==================================================
20. IMPORT ASSIGNMENT
==================================================

Support:

Assigned Agent Email

inside Excel.

Example:

First Name | Email | Assigned Agent Email

Rahul | rahul@gmail.com | neha@viralbridge.com

Priya | priya@gmail.com | rahul@viralbridge.com

During import:

Find agent by email.

If agent exists and is ACTIVE:

Assign lead.

If agent does not exist:

Mark row as ERROR.

If agent is inactive:

Mark row as WARNING or ERROR according to configured business rules.

Do not create an agent automatically from an Excel import.


==================================================
21. IMPORT CONFIRMATION
==================================================

Before importing:

Show:

You are about to import:

500 records

472 valid records

32 duplicates

10 invalid records

Duplicate strategy:

Skip duplicates

Assignment:

Use Assigned Agent Email

[Cancel]

[Confirm Import]


==================================================
22. LARGE IMPORTS
==================================================

Do not process large Excel files synchronously.

For large imports:

Upload
↓
Create Import Job
↓
Queue Background Job
↓
Process in batches
↓
Update progress
↓
Complete
↓
Notify Admin


==================================================
23. IMPORT PROGRESS
==================================================

Show:

Importing Leads...

Progress:

342 / 500

68%

Status:

Processing


==================================================
24. IMPORT RESULT
==================================================

After completion:

Import Completed

Total Rows:
500

Imported:
472

Duplicates:
18

Failed:
10

Warnings:
0

Display:

[View Import Details]

[Download Error Report]


==================================================
25. IMPORT ERROR REPORT
==================================================

Generate downloadable Excel/CSV error report.

Columns:

Row Number
First Name
Email
Company
Error
Suggested Fix

Example:

27
Priya
priya@
XYZ Ltd
Invalid email address
Correct email and re-import


==================================================
26. IMPORT HISTORY
==================================================

Create:

/crm/import-history

Display:

File Name

Imported By

Date

Total Rows

Imported

Duplicates

Failed

Status

Example:

leads_august.xlsx

Neetu

22 Aug 2026

500

472

18

10

Completed with Errors


==================================================
27. IMPORT DETAILS
==================================================

Clicking an import opens:

/crm/import-history/:importId

Display:

File Information

Uploaded By

Uploaded Date

Processing Time

Total Records

Successful Records

Duplicate Records

Failed Records

Assignment Summary

Errors

Warnings

Download Error Report


==================================================
28. EXPORT LEADS
==================================================

Add:

[ Export ]

Support:

Export Selected

Export Current Page

Export Current Filter

Export All


==================================================
29. EXPORT FILTERS
==================================================

Export must respect current CRM filters.

Example:

Status = Qualified

Agent = Rahul

City = Delhi

If user selects:

Export Current Filter

only matching records should be exported.


==================================================
30. EXPORT FIELD SELECTION
==================================================

Before export, allow Admin to choose fields.

Example:

☑ Name
☑ Email
☑ Phone
☑ Company
☑ Status
☑ Agent
☑ Lead Source
☑ Created Date
☐ Internal Notes

Do not export sensitive/internal fields by default.


==================================================
31. LARGE EXPORT
==================================================

For large exports:

Create background export job.

Flow:

Export Request
↓
Validate permissions
↓
Create Export Job
↓
BullMQ
↓
Generate Excel
↓
Store file
↓
Notify Admin
↓
Download


==================================================
32. EXPORT HISTORY
==================================================

Create:

/crm/export-history

Display:

File Name

Requested By

Date

Record Count

Filters

Status

Download


==================================================
33. DATABASE MODELS
==================================================

Reuse the existing CRM Lead model.

Do NOT create duplicate lead tables.

Add supporting tables if they do not already exist.

Recommended:

crm_agents

crm_lead_assignments

crm_import_jobs

crm_import_errors

crm_export_jobs


==================================================
34. LEAD ASSIGNMENT HISTORY
==================================================

Create:

crm_lead_assignments

Fields:

id

leadId

previousAgentId

newAgentId

assignedBy

reason

assignmentType

createdAt

Use:

INITIAL_ASSIGNMENT

MANUAL_ASSIGNMENT

BULK_ASSIGNMENT

REASSIGNMENT

IMPORT_ASSIGNMENT

AUTO_ASSIGNMENT


==================================================
35. IMPORT JOB
==================================================

Fields:

id

fileName

uploadedBy

status

totalRows

successfulRows

duplicateRows

failedRows

warningRows

fileUrl

errorFileUrl

startedAt

completedAt

createdAt


Statuses:

UPLOADED

VALIDATING

READY

PROCESSING

COMPLETED

COMPLETED_WITH_ERRORS

FAILED


==================================================
36. EXPORT JOB
==================================================

Fields:

id

fileName

requestedBy

filters

selectedFields

recordCount

status

fileUrl

createdAt

completedAt


Statuses:

PENDING

PROCESSING

COMPLETED

FAILED


==================================================
37. BACKEND APIs
==================================================

Agents:

GET /crm/agents

GET /crm/agents/:id

GET /crm/agents/:id/workload


Single assignment:

POST /crm/leads/:leadId/assign


Bulk assignment:

POST /crm/leads/bulk-assign

Request:

{
  "leadIds": [
    "lead_1",
    "lead_2",
    "lead_3"
  ],
  "agentId": "agent_123"
}


Reassignment:

POST /crm/leads/:leadId/reassign

Request:

{
  "agentId": "agent_456",
  "reason": "Agent unavailable"
}


Assignment history:

GET /crm/leads/:leadId/assignment-history


Bulk auto assignment:

POST /crm/leads/bulk-auto-assign


Import:

POST /crm/leads/import

POST /crm/leads/import/preview

POST /crm/leads/import/confirm

GET /crm/leads/import/:importId

GET /crm/leads/import/:importId/errors

GET /crm/leads/import-history


Export:

POST /crm/leads/export

GET /crm/leads/export/:exportId

GET /crm/leads/export-history


==================================================
38. IMPORT PROCESSING
==================================================

Backend import flow:

Receive file

↓

Validate file type

↓

Validate file size

↓

Store temporary file

↓

Parse Excel/CSV

↓

Normalize headers

↓

Validate rows

↓

Validate agent references

↓

Detect duplicates

↓

Generate preview

↓

Wait for Admin confirmation

↓

Create Import Job

↓

Process records in batches

↓

Create/update leads

↓

Create assignment records

↓

Create audit logs

↓

Generate final report


==================================================
39. EXCEL HEADER NORMALIZATION
==================================================

Support common header variations.

Example:

First Name

first_name

firstName

FIRST NAME

should map to:

firstName

Do not silently map unknown columns.

Show:

"Unknown column: customer_type"

and allow Admin to map it manually if appropriate.


==================================================
40. COLUMN MAPPING
==================================================

Add an optional mapping step.

Example:

Excel Column:

Customer Email

Map To:

Email

Excel Column:

Company

Map To:

Company Name

Admin should be able to correct mappings before import.

Show:

Excel Column → CRM Field


==================================================
41. TRANSACTION SAFETY
==================================================

Do not allow partial database corruption.

For each batch:

Use database transactions.

If a single row fails:

Do not necessarily fail the entire import.

Record the row error and continue according to the import strategy.

Never create duplicate transactions or duplicate leads when an import job is retried.

Import jobs must be idempotent.


==================================================
42. PERMISSIONS
==================================================

SUPER_ADMIN:

- Import
- Export
- Assign
- Reassign
- Delete
- Manage agents
- View all leads
- View all import/export history

CRM_ADMIN / MANAGER:

- Import
- Export
- Assign
- Reassign
- View leads

AGENT:

- View assigned leads
- Edit assigned leads
- Add notes
- Add activities
- Create follow-ups

Agents should NOT by default:

- Assign leads
- Reassign leads
- Export all CRM records
- Import leads
- Delete leads
- View other agents' leads


==================================================
43. AGENT NOTIFICATIONS
==================================================

When a lead is assigned:

Notify agent:

"New lead assigned to you"

When reassigned:

"Lead reassigned to you"

For bulk assignment:

"You have been assigned 25 new leads."


==================================================
44. AUDIT LOGS
==================================================

Record:

Lead Assigned

Lead Reassigned

Bulk Assignment

Import Started

Import Completed

Import Failed

Export Requested

Export Completed

Lead Updated Through Import

Lead Created Through Import

Assignment Through Import

Agent Changed

Track:

actorId

action

leadId/importId/exportId

oldValue

newValue

reason

timestamp


==================================================
45. FRONTEND ROUTES
==================================================

Existing CRM:

/crm

Add:

/crm/agents

/crm/import-history

/crm/import-history/:importId

/crm/export-history

Keep existing CRM routes unchanged.


==================================================
46. CRM TOOLBAR
==================================================

Main Leads page:

[ Search ]

[ Filters ]

[ Import ]

[ Export ]

[ Add Lead ]


When records are selected:

[ Assign Agent ]

[ Change Status ]

[ Change Priority ]

[ Add Follow-up ]

[ Export Selected ]

[ Delete ]


==================================================
47. IMPORT UI WIZARD
==================================================

Use a step-based interface:

Step 1:
Upload

Step 2:
Map Columns

Step 3:
Validate

Step 4:
Preview

Step 5:
Import

Step 6:
Result


==================================================
48. EXPORT UI
==================================================

Export modal:

Export:

○ Selected Leads

○ Current Page

○ Current Filter

○ All Leads

Fields:

☑ Name
☑ Email
☑ Phone
☑ Company
☑ Status
☑ Agent
☑ Lead Source
☑ Created Date

[Cancel]

[Export]


==================================================
49. EMPTY STATES
==================================================

No Leads:

"No CRM leads found."

[Add Lead]

No Agents:

"No active agents available."

[Manage Agents]

No Import History:

"No imports yet."

[Import Leads]

No Export History:

"No exports yet."


==================================================
50. ERROR HANDLING
==================================================

Never show generic:

"Something went wrong."

Show meaningful errors.

Examples:

"Unable to import the file. The Excel file is corrupted."

"10 rows contain invalid email addresses."

"No active CRM agents are available."

"This lead is already assigned to another agent."

"You don't have permission to export these leads."

"The selected agent is currently inactive."


==================================================
51. SECURITY
==================================================

Validate all permissions on the backend.

Never trust:

agentId

leadId

uploadedBy

userId

role

from the frontend.

Verify that:

- Agent exists
- Agent is active
- Admin has permission
- Lead exists
- Lead is accessible
- Import belongs to current admin/organization
- Export belongs to authorized user


==================================================
52. PERFORMANCE
==================================================

The system must support thousands of leads.

Use:

Pagination

Server-side filtering

Server-side sorting

Batch database operations

BullMQ for large imports

BullMQ for large exports

Redis where useful

Streaming Excel generation where appropriate


==================================================
53. IMPORTANT: DO NOT BREAK EXISTING CRM
==================================================

Before implementation:

1. Inspect existing CRM UI.
2. Inspect existing Lead model.
3. Inspect existing CRM APIs.
4. Inspect Firebase authentication.
5. Inspect Admin/Client Portal permissions.
6. Inspect existing notification system.
7. Inspect existing audit logging.
8. Reuse existing components and services.

Do not duplicate:

Users

Leads

Notifications

Authentication

Agents

Permissions

Audit Logs

If an existing model already supports a requirement, extend it instead of creating another model.


==================================================
54. TEST CASES
==================================================

Implement/test at least:

1. Assign one lead.

2. Assign multiple leads.

3. Select all current-page leads.

4. Select all leads matching filter.

5. Reassign lead.

6. Assign to inactive agent.

7. Assign to non-existent agent.

8. Import valid Excel.

9. Import invalid Excel.

10. Import duplicate leads.

11. Skip duplicates.

12. Update existing leads.

13. Import as new.

14. Invalid email.

15. Invalid phone.

16. Invalid agent email.

17. Missing required fields.

18. Import with 5,000+ records.

19. Import with partial failures.

20. Retry failed import safely.

21. Export selected leads.

22. Export filtered leads.

23. Export all leads.

24. Export with selected fields.

25. Unauthorized agent attempts export.

26. Unauthorized agent attempts assignment.

27. Import history.

28. Export history.

29. Assignment history.

30. Agent notification after assignment.


==================================================
55. FINAL EXPECTED USER EXPERIENCE
==================================================

Admin opens:

/crm

↓

Sees Leads

↓

Can search/filter

↓

Selects leads

↓

Clicks:

Assign Agent

↓

Selects agent

↓

Sees workload

↓

Confirms

↓

Leads assigned

↓

Agent receives notification

OR

Admin clicks:

Import

↓

Uploads Excel

↓

Maps columns

↓

Validation

↓

Duplicate detection

↓

Preview

↓

Select duplicate strategy

↓

Confirm

↓

Background processing

↓

Import completed

↓

Admin sees:

500 total

472 imported

18 duplicates

10 failed

↓

Admin downloads error report

OR

Admin clicks:

Export

↓

Chooses:

Selected / Current Page / Current Filter / All

↓

Chooses fields

↓

Export job starts

↓

Excel generated

↓

Admin downloads file


==================================================
56. IMPLEMENTATION STANDARD
==================================================

Use:

Frontend:
Next.js
TypeScript
Tailwind CSS
Existing ViralBridge UI components

Backend:
NestJS
PostgreSQL
Prisma
Firebase Authentication
BullMQ
Redis

File handling:
ExcelJS or equivalent production-safe Excel parser/generator

Authentication:
Firebase ID Token verification

Authorization:
RBAC

Storage:
Use the existing project object storage if available.

Documentation:
Swagger/OpenAPI

Use clean architecture:

Controller
→ Service
→ Repository
→ Database

Do not place business logic directly inside controllers.


==================================================
57. FINAL DELIVERABLES
==================================================

Provide:

1. Updated CRM UI
2. Agent Management
3. Single Lead Assignment
4. Bulk Lead Assignment
5. Select All
6. Reassignment
7. Assignment History
8. Agent Workload
9. Auto Assignment foundation
10. Excel Import
11. CSV Import
12. Excel Template Download
13. Column Mapping
14. Import Preview
15. Validation
16. Duplicate Detection
17. Duplicate Strategy
18. Import Progress
19. Import Result
20. Error Report
21. Import History
22. Excel Export
23. Export Filters
24. Export Field Selection
25. Export History
26. Permissions
27. Notifications
28. Audit Logs
29. Background Jobs
30. API Documentation
31. Database Migration
32. Seed Data where required
33. Unit Tests
34. Integration Tests
35. End-to-End Tests

Make the implementation production-ready, scalable, secure, and compatible with the existing ViralBridge CRM architecture.