# JobLign PH API

All mutating endpoints require an authenticated session cookie from Auth.js unless noted.

Passwords are never returned.

## Public

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/register` | Job seeker or employer signup |
| GET/POST | `/api/auth/[...nextauth]` | Login/session |
| GET | `/api/jobs` | Search/filter active jobs |
| GET | `/api/jobs/:id` | Job detail + optional match |
| GET | `/api/skills` | Skill catalog |

## Job seeker

| Method | Path |
| --- | --- |
| GET/PATCH | `/api/profile/seeker` |
| GET/POST | `/api/resumes` |
| DELETE | `/api/resumes/:id` |
| GET | `/api/resumes/:id/file` |
| POST | `/api/applications` |
| GET | `/api/applications` |
| GET | `/api/recommendations` |
| GET | `/api/interviews` |
| GET/PATCH | `/api/notifications` |
| GET/POST | `/api/messages/conversations` |
| GET/POST | `/api/messages/conversations/:id` |

## Employer

| Method | Path |
| --- | --- |
| GET/PATCH | `/api/profile/employer` |
| POST | `/api/jobs` |
| PATCH | `/api/jobs/:id` |
| GET | `/api/applications?job_id=` |
| PATCH | `/api/applications/:id` |
| POST | `/api/interviews` |
| PATCH | `/api/interviews/:id` |

## Administrator

| Method | Path |
| --- | --- |
| GET/PATCH | `/api/admin/users` |
| POST | `/api/admin/employers/:id/verify` |
| GET | `/api/admin/reports` |
| GET/PATCH | `/api/admin/settings` |

Unauthorized ID tampering is rejected in handlers: seekers only see their applications, employers only their jobs, and resume downloads are limited to the owner, the hiring employer, or an admin.
