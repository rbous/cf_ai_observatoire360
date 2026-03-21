# Observatoire 360 — TODO

## Priority 1: Wire frontend to real API (mock data removal)

- [ ] **Alert detail page** — replace `getMockAlert()` with `GET /api/alerts/:id`
- [ ] **Alert list sidebar** — replace hardcoded mock alerts with `useAlerts()` hook
- [ ] **Reports page** — wire KPI cards and charts to `GET /api/reports/stats`
- [ ] **Planning page** — wire calendar to `GET /api/inspections`
- [ ] **Notification panel** — update component to use `useNotifications()` hook
- [ ] **Topbar unread badge** — wire to `useNotifications().unreadCount`
- [ ] **Contact form** — wire frontend form to `POST /api/contact`

## Priority 2: Missing features

- [ ] **Password reset emails** — send actual email via Resend when `POST /api/auth/forgot-password` is called
- [ ] **User management UI** — dashboard page for managers to add/edit/deactivate users (API exists, no frontend)
- [ ] **Scan history UI** — dashboard page to view scan jobs, trigger manual scans (API exists, no frontend)
- [ ] **Profile page** — UI for users to update their name and change password (`PUT /api/me`, `PUT /api/me/password`)

## Priority 3: Polish

- [ ] **Mobile responsiveness** — test and fix dashboard layout on mobile/tablet
- [ ] **Error handling** — ensure all pages show user-friendly error states on API failures
- [ ] **Loading states** — ensure all pages show spinners while fetching data
- [ ] **Empty states** — show helpful messages when no alerts/inspections/notifications exist
- [ ] **3D Globe textures** — verify globe renders correctly on all browsers, add fallback

## Priority 4: Nice-to-have

- [ ] **Daily digest email** — summary of all detections in the last 24h (instead of per-detection emails)
- [ ] **Export reports** — PDF/CSV download of reports and alert data
- [ ] **Inspection photo upload** — allow inspectors to attach photos from site visits (R2 storage)
- [ ] **Audit log** — track all status changes and who made them
- [ ] **Multi-language toggle** — switch between French and English in the dashboard
- [ ] **Dark mode** — optional dark theme for the dashboard
- [ ] **PWA / mobile app** — progressive web app for offline inspection support

## Infrastructure

- [ ] **Verify Resend domain** — add SPF/DKIM/DMARC records for `example.com` in Resend dashboard
- [ ] **Set up staging environment** — separate Workers + D1 for testing before production
- [ ] **Add automated tests** — unit tests for auth, pipeline, and API routes
- [ ] **Monitoring/alerting** — set up Cloudflare analytics or external monitoring for uptime
- [ ] **Database backups** — scheduled D1 exports via cron or GitHub Actions
