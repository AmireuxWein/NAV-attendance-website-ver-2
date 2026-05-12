# Security Spec

## Data Invariants
1. Students: `name`, `group`, and `qr_link` are required.
2. AttendanceLogs: `studentId`, `studentName`, `date`, `timestamp`, `type` are required. `createdAt` must match server time.
3. Announcements: `type`, `title`, `content`, `date_posted` are required.
4. Only authenticated users with verified emails can read/write data by default.

## The "Dirty Dozen" Payloads
1. Create student with missing `name`.
2. Create student without a valid `qr_link`.
3. Create attendance log with spoofed `createdAt`.
4. Update student modifying locked fields.
5. Update attendance log (which should be immutable or strictly controlled).
6. Create announcement without `title`.
7. Update student `createdAt`.
8. Inject massive string into `id` or payload field.
9. Unauthenticated read/write.
10. Blanket read without appropriate access.
... (others standard invariants)
