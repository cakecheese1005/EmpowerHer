# Changelog

All notable changes to the EmpowerHer project will be documented in this file.

## [1.0.0] - 2024-01-XX

### Added
- Firebase Functions with ML prediction endpoint
- Mobile app (React Native/Expo) with Firebase Auth integration
- Admin web panel (Vite + React) with Dashboard, Users, Assessments, Articles, ML Monitor
- Firestore Security Rules with role-based access control
- Storage Rules for user uploads
- Rate limiting on prediction endpoint
- User data export and deletion endpoints
- Health check endpoint
- Comprehensive test suite (Jest)
- GitHub Actions CI/CD workflows
- Seed data script for Firestore
- Privacy policy and compliance features
- Postman API collection
- Comprehensive README with setup instructions

### Security
- Input validation with Zod schemas
- Rate limiting (per-user and per-IP)
- Firestore rules enforcing least privilege
- No PII in logs
- HTTPS-only communication

### Infrastructure
- Firebase Emulator Suite configuration
- TypeScript throughout
- ESLint configuration
- Firestore indexes for performance

### Documentation
- README with local dev and deployment steps
- PRIVACY.md with privacy policy
- API documentation in Postman collection
- Inline code documentation

