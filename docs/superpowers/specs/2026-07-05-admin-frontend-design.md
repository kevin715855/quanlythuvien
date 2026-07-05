# Minimal Admin Frontend Design

## Goal

Remove role-related 403 errors after admin login and provide a small, usable administration workspace without expanding backend scope.

## Design

- Frontend roles use the backend values `admin`, `staff`, and `reader` consistently.
- Navigation is role-aware: staff sees operational pages; admin sees dashboard and administration; reader sees no staff console navigation.
- The dashboard loads operational reports only for staff or admin and presents a simple welcome state for unsupported roles.
- `/admin` contains four compact tabs backed by existing endpoints: create staff, upsert role permissions, update policy values, and query audit logs.
- Presentation depends on application use cases; HTTP access remains behind an administration gateway adapter.
- Unauthorized routes redirect to the first route available to the current role instead of issuing a request that will predictably return 403.

## API Contract

- `POST /api/admin/staff`
- `PUT /api/admin/roles/:code`
- `PUT /api/admin/policies/:group`
- `GET /api/admin/audit-logs`

## Testing

- Auth and navigation tests use lowercase roles returned by the backend.
- Admin use-case and HTTP-adapter tests cover validation and route mapping.
- Page tests cover each admin action and audit lookup.
- Route tests prove staff cannot enter `/admin` and admin does not see staff-only navigation.
- Full frontend/backend test and build commands plus browser smoke verification are required.
