# Fines and Payments Design (UC014–UC015)

## Scope

Implement a deliberately small `billing` bounded context for library fines and payments. The module calculates overdue, damaged, and lost-book fines, records cash payments immediately, and models online payments through a deterministic simulation adapter. Advanced adjustment, refund, cancellation, and real payment-provider integration are outside this iteration.

## Architecture

The module follows the repository's four layers:

- Domain owns `Fine`, `PaymentTransaction`, their state transitions, and monetary rules.
- Application owns UC014/UC015 orchestration and depends only on ports.
- Infrastructure provides TypeORM persistence, policy storage, audit writes, and the simulated payment adapter.
- Presentation exposes authenticated REST endpoints and maps application errors to HTTP responses.

Circulation does not import billing infrastructure. `ReturnBooksUseCase` invokes a fine-assessment application port, implemented by a billing adapter, so returned overdue, damaged, or lost items can create fines without reversing the dependency direction.

## Domain Model

All money is stored as integer VND.

`Fine` contains reader, loan, loan item, reason, amount, status, an optional pending-payment ID, and timestamps. Reasons are `OVERDUE`, `DAMAGED`, and `LOST`; states are `UNPAID`, `PAID`, and `WAIVED`. A unique business key of loan item plus reason prevents duplicate assessment.

`PaymentTransaction` contains reader, selected fine IDs, total amount, method, status, provider reference, and timestamps. Methods are `CASH` and `ONLINE`; states in this scope are `PENDING`, `SUCCEEDED`, and `FAILED`.

The versioned default policy is:

- Overdue: 5,000 VND per overdue day.
- Damaged: 50,000 VND.
- Lost: 200,000 VND.

## UC014: Calculate and Record Fine

The application loads the returned loan item and active fine policy, determines applicable reasons, and creates only missing fines. An overdue item creates `overdueDays * 5,000`; damaged and lost conditions create their fixed amounts. A normal on-time return creates no fine. Each created fine and its audit event are committed atomically.

The public calculate endpoint is staff-only. Circulation integration invokes the same idempotent assessment behavior after a return, so retries cannot duplicate debt.

## UC015: Pay Fines

Payment creation locks every selected fine, verifies they belong to one reader and are `UNPAID`, rejects duplicate IDs, and derives the total from persisted fines rather than trusting the request.

- Cash payments are staff-only and become `SUCCEEDED` in the creation transaction; selected fines become `PAID` atomically.
- Online payments begin as `PENDING`. The simulation endpoint accepts `SUCCEEDED` or `FAILED`. Success locks the payment and fines, verifies the amount, and marks the fines `PAID`; failure leaves fines `UNPAID`.
- Repeating the same simulation result is idempotent. A conflicting second terminal result is rejected.
- A fine cannot be included in another pending payment.

## API

- `POST /api/fines/calculate` — staff calculates a fine for a returned loan item.
- `GET /api/fines/readers/:readerId` — reader ownership enforced; staff may query any reader.
- `POST /api/payments` — create a cash or online payment for one or more fines.
- `POST /api/payments/:id/simulate` — staff simulates online success or failure.
- `GET /api/payments/readers/:readerId` — reader ownership enforced; staff may query any reader.

## Persistence and Consistency

PostgreSQL stores versioned fine policies, fines, payment transactions, and payment-to-fine rows. A unique index prevents duplicate assessment by loan item and reason. While an online payment is pending, each selected fine records that payment ID; this makes a fine unavailable to another payment without relying on a cross-table index. TypeORM unit-of-work adapters use pessimistic locks for payment state changes. All billing mutations append to the existing audit log in the same database transaction. Return-triggered assessment runs immediately after the circulation transaction and remains safe to retry because assessment is idempotent.

## Error Handling

Not-found conditions map to HTTP 404. Invalid states, ownership failures, duplicate fine selection, mixed readers, and unsupported payment transitions map to HTTP 400. Database uniqueness violations are translated into stable application errors. A simulated online failure is a persisted business result, not an HTTP infrastructure failure.

## Testing

Tests cover fine calculations, idempotent assessment, payment totals, cash success, online pending/success/failure, duplicate callbacks, ownership, controller error mapping, TypeORM transaction boundaries, circulation integration, and the repository-wide layer dependency rules. Full Jest and Nest build verification remain the completion gate.
