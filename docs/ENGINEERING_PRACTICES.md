# Engineering Practices & Documentation Guide

**Purpose:** Central reference for all engineering documentation, practices, and standards used in this project.

**Standard:** Google Engineering Best Practices
**Maintained By:** Development Team
**Last Updated:** 2025-01-17

---

## Documentation System Overview

This project follows enterprise-grade documentation standards. All changes, tests, and decisions are tracked systematically.

### Core Documentation Files

| Document | Purpose | Update Frequency |
|----------|---------|------------------|
| **[CHANGELOG.md](/CHANGELOG.md)** | All code changes, bug fixes, features | Every change |
| **[TESTING_LOG.md](/TESTING_LOG.md)** | Test results, coverage, QA activities | Every test session |
| **[DEPLOYMENT_CHECKLIST.md](/DEPLOYMENT_CHECKLIST.md)** | Deployment procedures, verification | Before each deploy |
| **[docs/YEARS_OF_EXPERIENCE_CALCULATION.md](/docs/YEARS_OF_EXPERIENCE_CALCULATION.md)** | Algorithm specification | When algorithm changes |
| **[docs/FRONTEND_YEARS_VERIFICATION.md](/docs/FRONTEND_YEARS_VERIFICATION.md)** | Frontend integration verification | When contracts change |
| **[README.md](/README.md)** | Project overview, getting started | As needed |

---

## When to Update Documentation

### ✅ Always Update When:

1. **Making Code Changes**
   - Add entry to CHANGELOG.md
   - Include: what, why, where, severity
   - Link to related issues/tickets

2. **Running Tests**
   - Log results in TESTING_LOG.md
   - Include: test name, status, evidence
   - Document failures and root causes

3. **Fixing Bugs**
   - CHANGELOG.md: Bug fix entry with severity
   - TESTING_LOG.md: Regression test added
   - Include before/after code snippets

4. **Adding Features**
   - CHANGELOG.md: Feature description
   - Update relevant specs (if API/contract changes)
   - Document new environment variables

5. **Deploying**
   - Follow DEPLOYMENT_CHECKLIST.md
   - Update TESTING_LOG.md with verification results
   - Note deployment time and version in CHANGELOG.md

6. **Finding Security Issues**
   - CHANGELOG.md: Security section
   - TESTING_LOG.md: Security test results
   - Mark severity as "Critical"

---

## Changelog Standards

### Entry Format

```markdown
## [YYYY-MM-DD] - Brief Description

### Fixed
- **Severity:** Critical/High/Medium/Low
- **Location:** `file/path.ts:line-numbers`
- **Issue:** Clear description of the problem
- **Impact:** Who/what was affected
- **Root Cause:** Why it happened
- **Fix:** How it was resolved
- **Code Changes:**
  ```typescript
  // Before
  const old = 'problematic code';

  // After
  const fixed = 'correct code';
  ```
- **Testing:** How it was verified
- **Deployment Notes:** Any special considerations
```

### Commit Message Format

Based on [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `chore`: Build process, dependencies, etc.

**Example:**
```
fix(api): prevent string comparison bug in seniority filtering

Database stores years_of_experience as TEXT, causing "10" < "2".
Implemented client-side numeric filtering as workaround.

Fixes #123
Severity: High
```

---

## Testing Standards

### Test Naming Convention

```typescript
describe('ComponentName or FunctionName', () => {
  describe('specific functionality', () => {
    it('should do something specific', () => {
      // Arrange
      const input = setupTestData();

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Test Documentation in TESTING_LOG.md

```markdown
#### Test: Descriptive Test Name
**Location:** `file/path.ts:line-numbers`

**Test Cases:**
| Input | Expected | Actual | Status |
|-------|----------|--------|--------|
| `5` | `"5 years"` | `"5 years"` | ✅ PASS |
| `null` | `"Not specified"` | `"Not specified"` | ✅ PASS |

**Verdict:** ✅ All tests passing

**Evidence:**
- Screenshot: [link]
- Test run output: [snippet]
- Network logs: [relevant data]
```

### Test Status Indicators

- ✅ **PASS** - Test successful
- ❌ **FAIL** - Test failed, needs investigation
- ⚠️ **FLAKY** - Intermittent failures
- ⏳ **PENDING** - Not yet run
- 🔧 **FIXED** - Was failing, now passing
- 📝 **TODO** - Planned but not implemented

---

## Code Review Checklist

Before marking PR as ready for review:

### Functionality
- [ ] Feature works as intended
- [ ] Edge cases handled
- [ ] Error states handled gracefully
- [ ] Loading states implemented

### Code Quality
- [ ] TypeScript: No `any` types (unless absolutely necessary)
- [ ] No console.logs in production code
- [ ] No commented-out code
- [ ] Consistent formatting (Prettier)
- [ ] Meaningful variable names

### Testing
- [ ] Unit tests added for new functions
- [ ] Integration tests for API changes
- [ ] Manual testing completed
- [ ] Logged in TESTING_LOG.md

### Documentation
- [ ] CHANGELOG.md updated
- [ ] Code comments for complex logic
- [ ] Type definitions updated
- [ ] README updated (if user-facing change)

### Security
- [ ] No secrets in code
- [ ] Input validation present
- [ ] XSS prevention verified
- [ ] SQL injection prevention (using SDK)
- [ ] File upload validation

### Performance
- [ ] No unnecessary re-renders
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] Bundle size impact acceptable

---

## Severity Classification

### Critical
- **Definition:** Security vulnerabilities, data loss, complete feature breakdown
- **Examples:**
  - Authentication bypass
  - Database corruption
  - Payment processing failure
- **Response Time:** Immediate hotfix
- **Notification:** Alert all stakeholders immediately

### High
- **Definition:** Major functionality broken, significant user impact
- **Examples:**
  - CV upload not working
  - Talent pool display broken
  - Search returning no results
- **Response Time:** Same day fix
- **Notification:** Notify team lead

### Medium
- **Definition:** Partial functionality broken, moderate user impact
- **Examples:**
  - Filtering not working correctly
  - Sorting inconsistent
  - Form validation missing
- **Response Time:** Within 2-3 days
- **Notification:** Include in daily standup

### Low
- **Definition:** Minor issues, edge cases, cosmetic problems
- **Examples:**
  - Typo in UI text
  - Inconsistent spacing
  - Missing icon
- **Response Time:** Next sprint
- **Notification:** Add to backlog

---

## Environment Variables Management

### Naming Convention

```bash
# Client-side (exposed to browser) - AVOID FOR SECRETS
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Server-side only (secure)
SUPABASE_SERVICE_ROLE_KEY=...
RAILWAY_API_URL=https://...
PARSER_API_KEY=...
```

### Documentation Requirements

**In Code:**
```typescript
// lib/config.ts

/**
 * Supabase URL - Client-side safe
 * Required for all Supabase operations
 * Format: https://[project-id].supabase.co
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
}
```

**In DEPLOYMENT_CHECKLIST.md:**
- List all required environment variables
- Provide example values (not real secrets)
- Document where to set them (Vercel, Railway, etc.)

---

## Database Migration Process

### Creating a Migration

1. **Create SQL file:**
   ```
   supabase/migrations/XXX_descriptive_name.sql
   ```

2. **Include in file:**
   - Header comment with purpose, date, author
   - Idempotent operations (`IF NOT EXISTS`, `DROP IF EXISTS`)
   - Comments explaining each step
   - Verification queries at end

3. **Document:**
   - Add entry to DEPLOYMENT_CHECKLIST.md
   - Note in CHANGELOG.md
   - Include rollback instructions

### Running a Migration

1. **Local Testing:**
   ```bash
   # Test in local Supabase instance first
   psql -U postgres -h localhost -d postgres -f migration.sql
   ```

2. **Production Deployment:**
   - Use Supabase Dashboard → SQL Editor
   - Copy entire migration file
   - Run and verify success message
   - Test affected queries

3. **Verification:**
   - Run verification queries included in migration
   - Check database logs
   - Test affected application features
   - Document results in TESTING_LOG.md

---

## Incident Response Procedure

### When Something Breaks in Production

1. **Immediate Actions (First 5 minutes):**
   - Assess severity using classification above
   - Check error logs (Vercel/Railway/Supabase)
   - Determine impact (how many users affected?)
   - Decide: Hotfix or rollback?

2. **Communication (Within 15 minutes):**
   - Notify team lead
   - Update status page if customer-facing
   - Create incident log entry in TESTING_LOG.md

3. **Resolution:**
   - Implement fix or rollback
   - Test thoroughly in staging
   - Deploy to production
   - Verify resolution

4. **Post-Incident (Within 24 hours):**
   - Write detailed CHANGELOG.md entry
   - Update TESTING_LOG.md with incident details
   - Add regression test
   - Conduct post-mortem if severity ≥ High

### Incident Log Format (in TESTING_LOG.md)

```markdown
### YYYY-MM-DD: Brief Incident Description
**Severity:** Critical/High/Medium/Low
**Impact:** Number of users, features affected
**Root Cause:** Technical explanation
**Resolution Time:** Duration from detection to resolution
**Status:** 🔧 FIXED / ⏳ IN PROGRESS / ❌ UNRESOLVED

**Timeline:**
- HH:MM UTC: Incident detected
- HH:MM UTC: Root cause identified
- HH:MM UTC: Fix deployed
- HH:MM UTC: Verified resolved

**Lessons Learned:**
- What went wrong
- Why it wasn't caught earlier
- Preventive measures for future
```

---

## Code Style & Conventions

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUserById(id: string): User | null {
  // Implementation
}

// ❌ Bad
function getUser(i: any): any {
  // Implementation
}
```

### React Components

```typescript
// ✅ Good
interface Props {
  title: string;
  onSave: () => void;
}

export default function MyComponent({ title, onSave }: Props) {
  return <div>{title}</div>;
}

// ❌ Bad
export default function MyComponent(props: any) {
  return <div>{props.title}</div>;
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `TalentTable.tsx`)
- Utilities: `camelCase.ts` (e.g., `talentPoolHelpers.ts`)
- Types: `camelCase.ts` (e.g., `talentPool.ts`)
- Constants: `SCREAMING_SNAKE_CASE` or `camelCase.ts`

---

## Performance Monitoring

### Key Metrics to Track

1. **Build Performance:**
   - Compilation time: < 10s
   - Bundle size: Track in CHANGELOG.md when it changes significantly

2. **Runtime Performance:**
   - First Contentful Paint: < 1.5s
   - Time to Interactive: < 3s
   - API response time: < 500ms

3. **Database Performance:**
   - Query execution time: < 200ms
   - Index usage: Monitor via EXPLAIN ANALYZE

### Logging Performance Changes

```markdown
## [YYYY-MM-DD] - Performance Optimization

### Performance
- **Metric:** API response time for talent pool list
- **Before:** 1200ms
- **After:** 300ms
- **Improvement:** 75% faster
- **Method:** Added database index on years_of_experience
- **Trade-off:** 50MB additional storage for index
```

---

## Security Best Practices

### Never Commit:
- API keys, secrets, passwords
- Environment variables with real values
- Private keys or certificates
- Database credentials

### Always:
- Use environment variables for secrets
- Validate all user input
- Sanitize data before database operations
- Use HTTPS for all external requests
- Keep dependencies updated

### Regular Security Checks:
```bash
# Check for vulnerabilities in dependencies
npm audit

# Fix automatically if possible
npm audit fix
```

---

## Git Workflow

### Branch Naming

```
feature/short-description
fix/bug-description
hotfix/critical-issue
docs/documentation-update
refactor/code-cleanup
```

### Example Workflow

```bash
# 1. Create feature branch
git checkout -b feature/years-calculation

# 2. Make changes and commit
git add .
git commit -m "feat(parser): add years of experience calculation"

# 3. Push to remote
git push -u origin feature/years-calculation

# 4. Create pull request
# 5. After review and approval, merge to main
# 6. Delete feature branch
```

---

## Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] Logged in TESTING_LOG.md

## Documentation
- [ ] CHANGELOG.md updated
- [ ] DEPLOYMENT_CHECKLIST.md updated (if needed)
- [ ] Code comments added
- [ ] Type definitions updated

## Screenshots (if applicable)
[Add screenshots]

## Deployment Notes
Any special considerations for deployment

## Checklist
- [ ] Code builds without errors
- [ ] All tests passing
- [ ] No console warnings
- [ ] Reviewed my own code
- [ ] Ready for review
```

---

## Useful Commands Reference

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

### Database
```bash
# Connect to local Supabase
psql -U postgres -h localhost -d postgres

# Run migration
psql -U postgres -f migration.sql
```

---

## Resources

### Internal Documentation
- [CHANGELOG.md](/CHANGELOG.md) - Change history
- [TESTING_LOG.md](/TESTING_LOG.md) - Test results
- [DEPLOYMENT_CHECKLIST.md](/DEPLOYMENT_CHECKLIST.md) - Deploy guide

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## Questions or Clarifications?

**Documentation Issues:**
- Create GitHub issue with label `documentation`
- Tag: @team-lead

**Unclear Practices:**
- Bring up in daily standup
- Update this guide after clarification

---

**This is a living document.** Update it as practices evolve.

**Last Updated:** 2025-01-17
**Next Review:** Monthly or after major changes
