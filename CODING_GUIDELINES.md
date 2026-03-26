# SetSelect Coding Guidelines

> Practical principles drawn from the most respected software engineering books and authors, tailored to our Next.js / React / TypeScript / Supabase stack.

---

## Table of Contents

1. [General Principles](#1-general-principles)
2. [TypeScript](#2-typescript)
3. [React & Components](#3-react--components)
4. [Architecture & Project Structure](#4-architecture--project-structure)
5. [Data Fetching & Server Patterns](#5-data-fetching--server-patterns)
6. [API Design](#6-api-design)
7. [Form Handling & Validation](#7-form-handling--validation)
8. [Styling & UI](#8-styling--ui)
9. [Testing](#9-testing)
10. [Sources](#10-sources)

---

## 1. General Principles

> *"Managing complexity is the most important technical topic in software development."*
> — Steve McConnell, **Code Complete**

### Functions do one thing
A function that fetches data, transforms it, and renders UI is doing three things. Separate data fetching (server actions / route handlers), transformation (pure utilities), and presentation (components).

*— Robert C. Martin, Clean Code*

### Meaningful names over comments
A variable named `filteredActiveCandidates` eliminates the need for a comment. Reserve comments for **why** — business context that code cannot express. If you need a comment to explain *what* code does, rename things instead.

*— Robert C. Martin, Clean Code*

### The Boy Scout Rule
Leave code cleaner than you found it. When touching a file to fix a bug, improve one nearby thing — rename an unclear variable, extract a helper, add a missing type. Small, continuous improvements prevent rot.

*— Robert C. Martin, Clean Code*

### Make the change easy, then make the easy change
Before adding a feature to tangled code, refactor it into a shape that makes the new feature a simple addition. Commit the refactor separately from the feature.

*— Martin Fowler, Refactoring*

### DRY applies to knowledge, not just code
Two functions that look similar but represent different business concepts should *not* be merged. Conversely, a business rule expressed in both a Supabase trigger and frontend validation **is** a DRY violation — single-source it.

*— Hunt & Thomas, The Pragmatic Programmer*

### Strategic over tactical programming
Spending 15 extra minutes to define proper types today saves hours of debugging next month. Invest a little extra time so the next change is easy — the compounding returns are enormous.

*— John Ousterhout, A Philosophy of Software Design*

---

## 2. TypeScript

> *"Think of types as sets of values."*
> — Dan Vanderkam, **Effective TypeScript**

### Make illegal states unrepresentable
Instead of:
```ts
{ status: string; error: string | null; data: any | null }
```
Use a discriminated union:
```ts
type Result =
  | { status: 'success'; data: Profile }
  | { status: 'error'; error: string }
  | { status: 'loading' }
```
This eliminates an entire class of bugs where `data` is `null` but `status` is `'success'`.

*— Dan Vanderkam, Effective TypeScript*

### Prefer `unknown` over `any`
When you genuinely do not know a type (e.g., external API response), use `unknown` and narrow with type guards. `any` disables the compiler; `unknown` forces you to validate.

*— Dan Vanderkam, Effective TypeScript*

### Push null checks to the boundaries
Validate and narrow types at the edges (API route handlers, data fetching functions) so that inner functions receive guaranteed non-null types. This eliminates defensive null checks scattered through business logic.

*— Dan Vanderkam, Effective TypeScript*

### Use branded types for domain identifiers
A `talent_id` (formatted `REF-NNN`) and a generic `string` should not be interchangeable:
```ts
type TalentId = string & { readonly __brand: 'TalentId' }
```
Branded types catch misuse at compile time — you cannot accidentally pass an email where a talent ID is expected.

*— Dan Vanderkam, Effective TypeScript; Eric Evans, Domain-Driven Design*

### Default to `const`, avoid `var`
Use `let` only when mutation is genuinely needed. Immutability reduces cognitive load and prevents accidental state bugs.

*— Douglas Crockford, JavaScript: The Good Parts*

---

## 3. React & Components

> *"The more your tests resemble the way your software is used, the more confidence they give you."*
> — Kent C. Dodds

### Composition over configuration
Instead of:
```tsx
<Card variant="profile" showAvatar showBio showSkills />
```
Compose:
```tsx
<Card>
  <Avatar />
  <Bio />
  <Skills />
</Card>
```
This is more flexible, more readable, and avoids boolean prop explosion.

*— Kent C. Dodds*

### Avoid boolean flag props
`renderProfile(candidate, true)` is unreadable. Prefer named options or split into separate functions/components.

*— Robert C. Martin, Clean Code*

### Derive state, do not synchronize state
If you can compute a value from existing state or props, do **not** store it in a separate `useState`. Two pieces of state that must stay in sync will eventually diverge:
```tsx
// Bad: synchronized state
const [candidates, setCandidates] = useState([])
const [filteredCandidates, setFilteredCandidates] = useState([])

// Good: derived state
const filteredCandidates = useMemo(
  () => candidates.filter(c => matchesFilter(c, filter)),
  [candidates, filter]
)
```

*— Dan Abramov*

### Colocation: keep things close to where they are used
State, types, and utility functions should live in or next to the component that uses them. Move things up only when sharing becomes necessary.

*— Kent C. Dodds*

### Custom hooks encapsulate a single concern
`useDebounce`, `usePagination`, `useSupabaseQuery` — each owns one piece of logic. A hook that manages form state AND submission AND validation is doing too much.

*— Kent C. Dodds*

### Lift content up, push state down
If a parent re-renders and causes expensive child re-renders, consider passing children as props (composition) or moving state into the smallest component that needs it.

*— Kent C. Dodds, Dan Abramov*

### Understand closures for hooks
Stale closure bugs are the #1 source of subtle React hook errors. When a `useEffect` callback references state, it captures the value at render time. Use the dependency array correctly, or use functional state updates (`setCount(prev => prev + 1)`).

*— Kyle Simpson, You Don't Know JS*

### Do not prematurely optimize renders
Do not scatter `useMemo` and `useCallback` everywhere. Profile first, optimize where measured. The bigger cost is usually managing redundant state that creates bugs.

*— Dan Abramov*

---

## 4. Architecture & Project Structure

> *"A good module provides a simple interface that hides a lot of complexity."*
> — John Ousterhout, **A Philosophy of Software Design**

### Dependency Rule: business logic does not import from UI
Candidate scoring, filtering, and matching functions should be pure TypeScript — they should work without React or Next.js. This makes them testable, portable, and reusable.

*— Robert C. Martin, Clean Architecture*

### Separate business rules from I/O
A function that calculates whether a candidate matches a job should not also call Supabase. Fetch data, then pass it to a pure function:
```ts
// Data fetching (I/O)
const candidates = await candidateRepository.findActive()

// Business logic (pure)
const matches = rankCandidates(candidates, jobRequirements)
```

*— Robert C. Martin, Clean Architecture*

### Deep modules: simple interface, complex implementation
`useCandidateSearch(filters)` that returns `{ candidates, isLoading, error }` is a deep module — simple to use, complex inside. Exposing 15 configuration options makes it shallow and harder to use correctly.

*— John Ousterhout, A Philosophy of Software Design*

### Define errors out of existence
Design APIs so that error conditions cannot occur. Return an empty array instead of throwing when a list is empty. Ignore invalid filters instead of erroring. Fewer error paths means simpler, more reliable code.

*— John Ousterhout, A Philosophy of Software Design*

### Ubiquitous Language
Use the same terms in code that the business uses. If the business says "candidates" not "users," the code says `Candidate`, not `User`. If a "talent profile" differs from a "user profile," maintain that distinction in types and variable names.

*— Eric Evans, Domain-Driven Design*

### Repository pattern for data access
Centralize Supabase queries behind a repository layer (e.g., `candidateRepository.findById(id)`) instead of scattering `.from('talent_profiles').select(...)` throughout components and server actions. One place to update when the schema changes.

*— Martin Fowler, Patterns of Enterprise Application Architecture*

### Data Transfer Objects at boundaries
The shape of data in the database, the shape sent to the client, and the shape a component expects may all differ. Explicit mapping functions between layers prevent leaking database schema details into the UI.

*— Martin Fowler, Patterns of Enterprise Application Architecture*

---

## 5. Data Fetching & Server Patterns

> *"Build end-to-end thin slices first."*
> — Hunt & Thomas, **The Pragmatic Programmer** (Tracer Bullets)

### Server Components for data fetching
Fetch data in Server Components and pass it down as props. This eliminates client-side loading states, reduces bundle size, and keeps secrets on the server.

### Server Actions for mutations, Route Handlers for external APIs
Server Actions are for form submissions and user-initiated mutations. Route Handlers (`route.ts`) are for webhooks, third-party integrations, and endpoints consumed by external services.

### Parallel data fetching
Never `await` sequentially when requests are independent:
```ts
// Bad: sequential (slow)
const candidate = await getCandidate(id)
const jobs = await getJobs()

// Good: parallel (fast)
const [candidate, jobs] = await Promise.all([
  getCandidate(id),
  getJobs()
])
```

*— Kyle Simpson, You Don't Know JS*

### Tracer bullets
When adding a new feature, wire up the full path (database -> API -> UI) with minimal functionality before polishing any layer. This finds integration issues early.

*— Hunt & Thomas, The Pragmatic Programmer*

---

## 6. API Design

### Use appropriate HTTP methods and status codes
- `GET` for reads, `POST` for creation, `PATCH` for partial updates, `DELETE` for removal
- `201` for creation, `204` for deletion, `400` for client errors, `404` for not found, `500` for server errors

### Validate inputs at the edge
Use Zod in every Server Action and Route Handler. Never trust client data. **Parse, do not validate** — transform raw input into typed, validated data in one step:
```ts
const result = talentProfileSchema.safeParse(body)
if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })
// result.data is now fully typed and validated
```

### Return consistent response shapes
Every API route should return the same envelope structure. Inconsistent shapes force every consumer to handle special cases.

---

## 7. Form Handling & Validation

### Single source of truth for validation
Define Zod schemas once and use them for both client-side (React Hook Form resolver) and server-side validation. The schema **is** the specification — do not duplicate validation logic.

### Error handling is one thing
Functions that handle errors should not also contain business logic. In Next.js, use `error.tsx` boundaries for error presentation, and keep try/catch in data-fetching layers separate from rendering logic.

*— Robert C. Martin, Clean Code*

---

## 8. Styling & UI

### Accessibility is not optional
Semantic HTML (`<button>` not `<div onClick>`), proper heading hierarchy, keyboard navigation, and ARIA labels are baseline requirements. This is especially important for a professional recruitment platform.

*— Josh Comeau*

### Extract repeated Tailwind patterns
When the same combination of 10+ utility classes appears in multiple places, extract it into a component. The component **is** the abstraction — avoid `@apply` in CSS when a React component does the job better.

*— Josh Comeau*

### Stabilize object references
React uses `Object.is` comparison for hooks. Passing a new object literal `{}` or array `[]` as a prop or dependency triggers re-renders every time. Stabilize references with `useMemo`, `useCallback`, or by hoisting constants outside the component.

*— Kyle Simpson, You Don't Know JS*

---

## 9. Testing

> *"Test behavior, not implementation."*
> — Kent C. Dodds

### The Testing Trophy: prioritize integration tests
From bottom to top: static analysis (TypeScript + ESLint) → unit tests → **integration tests** → E2E tests. Integration tests give the best confidence-to-cost ratio. Test components with their hooks and data wired together, not in isolation.

*— Kent C. Dodds*

### Test behavior, not implementation
Do not test that `useState` was called with a specific value. Test that when a user clicks "Filter," the list updates. Use queries that mirror how users interact: `getByRole`, `getByText`, not `getByTestId`.

*— Kent C. Dodds*

### Red-Green-Refactor
Write a failing test, make it pass with the simplest code, then refactor. Even without strict TDD, writing the test first for complex business logic (candidate matching, filtering, scoring) clarifies requirements before implementation.

*— Kent Beck, Test-Driven Development*

### Tests should break only when behavior breaks
If a test fails because you renamed an internal function but the UI works identically, the test was testing implementation details.

*— Kent C. Dodds*

---

## 10. Sources

| Book / Author | Key Contribution |
|---|---|
| **Clean Code** — Robert C. Martin | Functions, naming, error handling, the Boy Scout Rule |
| **The Pragmatic Programmer** — Hunt & Thomas | DRY (knowledge not code), orthogonality, tracer bullets |
| **Code Complete** — Steve McConnell | Complexity management, variable scoping, function length |
| **Refactoring** — Martin Fowler | Code smells, safe refactoring, separate refactor from feature |
| **Effective TypeScript** — Dan Vanderkam | Discriminated unions, branded types, `unknown` over `any` |
| **JavaScript: The Good Parts** — Douglas Crockford | `const` defaults, avoiding coercion traps |
| **You Don't Know JS** — Kyle Simpson | Closures in hooks, event loop, object reference stability |
| **Clean Architecture** — Robert C. Martin | Dependency rule, separating business logic from I/O |
| **A Philosophy of Software Design** — John Ousterhout | Deep modules, defining errors out of existence, strategic programming |
| **Domain-Driven Design** — Eric Evans | Ubiquitous language, bounded contexts, value objects |
| **Patterns of Enterprise Application Architecture** — Martin Fowler | Repository pattern, DTOs at boundaries |
| **Kent C. Dodds** | Composition, colocation, testing trophy, custom hook patterns |
| **Dan Abramov** | Derived state, components as pure functions, render optimization |
| **Josh Comeau** | Accessibility, CSS craft, frontend quality |
| **Kent Beck** | TDD, Red-Green-Refactor |
