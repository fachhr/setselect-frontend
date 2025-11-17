# Years of Experience Calculation Algorithm

**Version:** 1.0
**Last Updated:** 2025-01-17
**Owner:** Parser Service Team
**Status:** Specification Approved

---

## Overview

This document specifies the algorithm for automatically calculating total years of professional experience from CV data. The parser service extracts `professional_experience` items from CVs and calculates the total career duration, storing it in the `years_of_experience` database field.

---

## Business Rules

### 1. Overlapping Employment Periods
**Rule:** Merge overlapping periods and count once (not twice)

**Rationale:** If a candidate worked two part-time jobs simultaneously, we count the calendar time once, not the sum of both jobs. This represents actual career duration, not accumulated work hours.

**Example:**
```
Job A: 2020-01 to 2022-06 (Software Engineer at Company A)
Job B: 2021-06 to 2023-01 (Consultant at Company B)

Overlapping period: 2021-06 to 2022-06 (12 months)

Calculation:
- Naive approach: 30 months + 19 months = 49 months = 4.08 years → 4 years
- Correct approach: Merge to 2020-01 to 2023-01 = 36 months = 3 years ✓
```

### 2. Gaps Between Jobs
**Rule:** Subtract unemployment gaps from total career length

**Rationale:** We want to measure actual working experience, not just elapsed time since first job. Gaps (unemployment, sabbaticals, etc.) should not count as experience.

**Example:**
```
Job A: 2018-01 to 2020-06 (30 months)
Gap:   2020-07 to 2020-12 (6 months unemployment)
Job B: 2021-01 to 2023-01 (24 months)

Calculation:
- Total span: 2018-01 to 2023-01 = 60 months
- Gap duration: 6 months
- Working experience: 60 - 6 = 54 months = 4.5 years → 5 years ✓
```

### 3. Academic Experience
**Rule:** Include academic positions (PhD, postdoc, research assistant, etc.)

**Rationale:** Academic research experience is valuable professional experience, especially in technical and research-oriented roles. Both `industrial` and `academic` experience types count.

**Example:**
```
Academic: PhD Research (2015-09 to 2019-06) = 45 months
Industrial: Software Engineer (2019-07 to 2023-01) = 42 months
Total: 87 months = 7.25 years → 7 years ✓
```

### 4. Precision
**Rule:** Round to nearest whole year (integer)

**Rationale:** Whole numbers are more readable and professional. The difference between 5.3 and 5.8 years is not significant enough to warrant decimal precision.

**Rounding Examples:**
```
4.4 years → 4 years
4.5 years → 5 years (round half up)
4.6 years → 5 years
9.9 years → 10 years
```

---

## Algorithm Specification

### Input Format

**Source:** `user_profiles.professional_experience` (JSONB array)

**Schema:** Each experience item must have:
```typescript
interface ExperienceItem {
  positionName: string;
  companyName: string;
  startDate: string;        // Required, format: "YYYY-MM"
  endDate?: string;         // Optional if isCurrent=true, format: "YYYY-MM"
  isCurrent?: boolean;      // True if currently employed in this role
  experienceType: 'industrial' | 'academic';
  // ... other fields (not used in calculation)
}
```

**Example Input:**
```json
[
  {
    "positionName": "Software Engineer",
    "companyName": "Tech Corp",
    "startDate": "2020-01",
    "endDate": "2022-06",
    "isCurrent": false,
    "experienceType": "industrial"
  },
  {
    "positionName": "Senior Engineer",
    "companyName": "Startup Inc",
    "startDate": "2022-07",
    "isCurrent": true,
    "experienceType": "industrial"
  }
]
```

### Output Format

**Destination:** `user_profiles.years_of_experience` (TEXT field)

**Format:** String representation of whole number
- Valid examples: `"5"`, `"10"`, `"15"`
- Invalid examples: `"5.5"`, `5` (number), `null` (if no data)

**Special case:** If no valid experience items exist, return `null` (not `"0"`)

---

## Algorithm Steps

### Pseudocode

```typescript
function calculateYearsOfExperience(experiences: ExperienceItem[]): string | null {
  // Step 0: Validation
  if (!experiences || experiences.length === 0) {
    return null;
  }

  // Step 1: Parse and validate all periods
  const periods: Period[] = [];
  for (const exp of experiences) {
    try {
      const start = parseYYYYMM(exp.startDate);
      const end = exp.isCurrent
        ? new Date()
        : parseYYYYMM(exp.endDate);

      // Validate dates
      if (!start || !end) continue;
      if (end < start) {
        console.warn(`Invalid period: end before start`, exp);
        continue;
      }
      if (start > new Date()) {
        console.warn(`Future start date, skipping`, exp);
        continue;
      }

      periods.push({ start, end });
    } catch (error) {
      console.error(`Failed to parse experience item`, exp, error);
      continue;
    }
  }

  if (periods.length === 0) {
    return null; // No valid periods
  }

  // Step 2: Sort periods by start date
  periods.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Step 3: Merge overlapping periods
  const mergedPeriods: Period[] = [];
  let currentPeriod = periods[0];

  for (let i = 1; i < periods.length; i++) {
    const nextPeriod = periods[i];

    if (nextPeriod.start <= currentPeriod.end) {
      // Periods overlap - extend current period to cover both
      currentPeriod.end = new Date(
        Math.max(currentPeriod.end.getTime(), nextPeriod.end.getTime())
      );
    } else {
      // No overlap - save current and start new
      mergedPeriods.push(currentPeriod);
      currentPeriod = nextPeriod;
    }
  }
  mergedPeriods.push(currentPeriod); // Don't forget last period

  // Step 4: Calculate total months across all merged periods
  let totalMonths = 0;
  for (const period of mergedPeriods) {
    const months = monthsBetween(period.start, period.end);
    totalMonths += months;
  }

  // Step 5: Convert to years and round
  const years = Math.round(totalMonths / 12);

  // Step 6: Return as string
  return years.toString();
}
```

### Helper Function: monthsBetween

```typescript
function monthsBetween(start: Date, end: Date): number {
  const yearsDiff = end.getFullYear() - start.getFullYear();
  const monthsDiff = end.getMonth() - start.getMonth();
  return yearsDiff * 12 + monthsDiff;
}
```

**Note:** This counts partial months. For example:
- 2020-01 to 2020-03 = 2 months (January and February, not including March)
- 2020-01-15 to 2020-02-20 = 1 month (only complete month is January)

### Helper Function: parseYYYYMM

```typescript
function parseYYYYMM(dateString: string): Date | null {
  if (!dateString) return null;

  const match = dateString.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    console.warn(`Invalid date format: ${dateString}, expected YYYY-MM`);
    return null;
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed

  if (month < 0 || month > 11) {
    console.warn(`Invalid month: ${match[2]}`);
    return null;
  }

  return new Date(year, month, 1);
}
```

---

## Test Cases

### Test Case 1: Single Job, No Gaps
```json
Input: [
  {
    "startDate": "2020-01",
    "endDate": "2023-01",
    "isCurrent": false
  }
]

Calculation:
- 2020-01 to 2023-01 = 36 months = 3 years

Expected Output: "3"
```

### Test Case 2: Two Sequential Jobs with Gap
```json
Input: [
  {
    "startDate": "2018-01",
    "endDate": "2020-06",
    "isCurrent": false
  },
  {
    "startDate": "2021-01",
    "endDate": "2023-01",
    "isCurrent": false
  }
]

Calculation:
- Period 1: 2018-01 to 2020-06 = 30 months
- Gap: 2020-07 to 2020-12 = 6 months
- Period 2: 2021-01 to 2023-01 = 24 months
- Total working: 30 + 24 = 54 months = 4.5 years → 5 years

Expected Output: "5"
```

### Test Case 3: Overlapping Jobs
```json
Input: [
  {
    "startDate": "2020-01",
    "endDate": "2022-06",
    "isCurrent": false
  },
  {
    "startDate": "2021-06",
    "endDate": "2023-01",
    "isCurrent": false
  }
]

Calculation:
- Before merge: Job1 = 30 months, Job2 = 19 months
- After merge: 2020-01 to 2023-01 = 36 months = 3 years

Expected Output: "3"
```

### Test Case 4: Current Job (No End Date)
```json
Input: [
  {
    "startDate": "2020-01",
    "isCurrent": true
  }
]

Assuming current date: 2025-01

Calculation:
- 2020-01 to 2025-01 = 60 months = 5 years

Expected Output: "5"
```

### Test Case 5: Mixed Academic and Industrial
```json
Input: [
  {
    "startDate": "2015-09",
    "endDate": "2019-06",
    "experienceType": "academic"
  },
  {
    "startDate": "2019-07",
    "endDate": "2023-01",
    "experienceType": "industrial"
  }
]

Calculation:
- Academic: 2015-09 to 2019-06 = 45 months
- Industrial: 2019-07 to 2023-01 = 42 months
- Total: 45 + 42 = 87 months = 7.25 years → 7 years

Expected Output: "7"
```

### Test Case 6: Empty Array
```json
Input: []

Expected Output: null
```

### Test Case 7: Complex Overlaps and Gaps
```json
Input: [
  {
    "startDate": "2018-01",
    "endDate": "2020-12",
    "isCurrent": false
  },
  {
    "startDate": "2019-06",
    "endDate": "2021-06",
    "isCurrent": false
  },
  {
    "startDate": "2022-01",
    "endDate": "2024-01",
    "isCurrent": false
  }
]

Calculation:
- Jobs 1 & 2 overlap: Merge to 2018-01 to 2021-06 = 42 months
- Gap: 2021-07 to 2021-12 = 6 months
- Job 3: 2022-01 to 2024-01 = 24 months
- Total working: 42 + 24 = 66 months = 5.5 years → 6 years

Expected Output: "6"
```

### Test Case 8: Invalid Data (Should Skip)
```json
Input: [
  {
    "startDate": "2020-01",
    "endDate": "2019-12",  // End before start
    "isCurrent": false
  },
  {
    "startDate": "2026-01",  // Future date
    "endDate": "2027-01",
    "isCurrent": false
  },
  {
    "startDate": "2020-01",
    "endDate": "2022-01",  // Valid
    "isCurrent": false
  }
]

Calculation:
- Skip first two (invalid)
- Valid: 2020-01 to 2022-01 = 24 months = 2 years

Expected Output: "2"
```

---

## Edge Cases & Error Handling

### Edge Case 1: Missing Dates
**Scenario:** `startDate` is null or empty
**Handling:** Skip that experience item, log warning, continue with others

### Edge Case 2: Invalid Date Format
**Scenario:** Date is "Jan 2020" instead of "2020-01"
**Handling:** Skip that experience item, log error, continue with others

### Edge Case 3: Future Start Date
**Scenario:** `startDate` is "2026-01" (in the future)
**Handling:** Skip that experience item (likely parsing error)

### Edge Case 4: End Date Before Start Date
**Scenario:** `startDate: "2022-01"`, `endDate: "2020-01"`
**Handling:** Skip that experience item, log warning

### Edge Case 5: Current Job with End Date
**Scenario:** `isCurrent: true` AND `endDate` is provided
**Handling:** Trust `isCurrent` flag, ignore `endDate`, use current date

### Edge Case 6: Multiple Current Jobs
**Scenario:** Two or more jobs have `isCurrent: true`
**Handling:** Valid scenario (multiple part-time jobs), calculate normally

### Edge Case 7: All Items Invalid
**Scenario:** Every experience item has invalid/missing dates
**Handling:** Return `null` (not "0")

### Edge Case 8: Very Long Career (50+ years)
**Scenario:** Career spans from 1970 to 2025
**Handling:** Calculate normally, return "55" or whatever the result is

### Edge Case 9: Very Short Career (<6 months)
**Scenario:** Single job from "2024-08" to "2024-12"
**Handling:** 4 months = 0.33 years → rounds to 0 → return "0"

---

## Integration Points

### Database Update

After calculating `years_of_experience`, the parser service should update the user profile:

```typescript
const years_of_experience = calculateYearsOfExperience(
  extractedData.professional_experience
);

await supabaseAdmin
  .from('user_profiles')
  .update({
    professional_experience: extractedData.professional_experience,
    years_of_experience: years_of_experience,
    education_history: extractedData.education_history,
    technical_skills: extractedData.technical_skills,
    // ... other extracted fields
    parsing_completed_at: new Date().toISOString()
  })
  .eq('id', profileId);
```

### Error Logging

Log these events for monitoring and debugging:

1. **Warning:** Invalid date format encountered
2. **Warning:** End date before start date
3. **Warning:** Future start date (likely parsing error)
4. **Error:** Failed to parse experience item
5. **Info:** Calculated X years from Y experience items

### Frontend Display

The frontend already handles the output correctly:

**Type Conversion:**
```typescript
// File: app/api/talent-pool/list/route.ts
const years = profile.years_of_experience ?
  parseFloat(profile.years_of_experience) : null;
```

**Display Formatting:**
```typescript
// File: lib/utils/talentPoolHelpers.ts
formatYearsExperience("5")  → "5 years"
formatYearsExperience("1")  → "1 year"
formatYearsExperience(null) → "Not specified"
```

**Seniority Badge:**
```typescript
// File: lib/utils/talentPoolHelpers.ts
getSeniorityLevel(5)  → "mid" → Badge: "Mid-level"
getSeniorityLevel(10) → "senior" → Badge: "Senior"
```

---

## Performance Considerations

### Complexity Analysis
- **Time Complexity:** O(n log n) where n = number of experience items
  - Sorting: O(n log n)
  - Merging: O(n)
  - Calculation: O(n)
- **Space Complexity:** O(n) for storing periods and merged periods

### Expected Data Size
- Typical CV: 3-8 experience items
- Edge case: 20+ experience items (long career with many jobs)
- Performance impact: Negligible (< 1ms even for 100 items)

### Database Impact
- Single UPDATE query per profile
- Field type: TEXT (stores "5", "10", etc.)
- Index exists on years_of_experience for fast filtering

---

## Validation & Testing

### Unit Tests Required

Implement all test cases listed in "Test Cases" section above.

### Integration Tests Required

1. **End-to-end test:**
   - Upload a real CV
   - Verify parser extracts professional_experience
   - Verify years_of_experience is calculated
   - Verify database is updated correctly
   - Verify frontend displays correctly

2. **Regression test:**
   - Upload same CV twice
   - Verify same years_of_experience result

3. **Error handling test:**
   - Upload CV with malformed dates
   - Verify parser doesn't crash
   - Verify partial results are saved

### Manual Verification

After deployment, manually check:
- New profiles show calculated years (not "Not specified")
- Seniority badges match years (5 years → "Mid-level")
- Sorting by experience works correctly
- Filtering by seniority works correctly

---

## Deployment Notes

### Pre-Deployment Checklist
- [ ] Unit tests pass (all 8+ test cases)
- [ ] Integration tests pass
- [ ] Code review completed
- [ ] Algorithm verified against business rules
- [ ] Error logging implemented
- [ ] Documentation updated

### Post-Deployment Verification
- [ ] Monitor parsing job success rate
- [ ] Check database for null vs calculated values
- [ ] Verify frontend displays correctly
- [ ] Check for any error logs
- [ ] Spot-check 5-10 profiles manually

### Rollback Plan
If issues occur:
1. Parser can be rolled back independently
2. Existing years_of_experience values remain unchanged
3. New submissions will have NULL until parser is fixed
4. Frontend handles NULL gracefully ("Not specified")

---

## Future Enhancements

### Potential Improvements (Not in Scope)

1. **Database Type Migration:**
   - Change years_of_experience from TEXT to NUMERIC
   - Would improve query performance and sorting
   - Requires data migration for existing records

2. **Decimal Precision Option:**
   - Store "5.5" instead of "6"
   - More precise but less readable
   - Would require frontend updates

3. **Overlapping Period Strategy Toggle:**
   - Allow choosing between "merge" and "sum" strategies
   - Business decision based on user feedback

4. **Gap Tolerance:**
   - Ignore gaps < 3 months (likely just between jobs)
   - Only subtract longer gaps (sabbaticals, etc.)

5. **Experience Type Filtering:**
   - Option to count only industrial experience
   - Separate fields for industrial vs academic years

---

## Appendix A: Date Calculation Examples

### Example 1: Simple Month Calculation
```
Start: 2020-01 (January 1, 2020)
End:   2020-03 (March 1, 2020)

Month difference:
- Year diff: 2020 - 2020 = 0
- Month diff: 3 - 1 = 2
- Total: 0 * 12 + 2 = 2 months
```

### Example 2: Year Boundary
```
Start: 2019-11 (November 1, 2019)
End:   2020-02 (February 1, 2020)

Month difference:
- Year diff: 2020 - 2019 = 1
- Month diff: 2 - 11 = -9
- Total: 1 * 12 + (-9) = 3 months
```

### Example 3: Multi-Year Span
```
Start: 2018-06 (June 1, 2018)
End:   2023-03 (March 1, 2023)

Month difference:
- Year diff: 2023 - 2018 = 5
- Month diff: 3 - 6 = -3
- Total: 5 * 12 + (-3) = 57 months = 4.75 years → 5 years
```

---

## Appendix B: Merging Algorithm Visual

### Visual Example: Merging Overlapping Periods

```
Timeline:
2018 -------- 2019 -------- 2020 -------- 2021 -------- 2022 -------- 2023

Job A: |----------------------|  (2018-01 to 2020-12)
Job B:              |----------------------|  (2019-06 to 2021-06)
Job C:                                         |-------------|  (2022-01 to 2024-01)

Step 1: Sort by start date
  Job A (2018-01)
  Job B (2019-06)
  Job C (2022-01)

Step 2: Merge overlapping
  Current = Job A (2018-01 to 2020-12)
  Job B starts at 2019-06 ≤ Current ends at 2020-12 → OVERLAP
  Merge: Current = (2018-01 to max(2020-12, 2021-06)) = (2018-01 to 2021-06)

  Job C starts at 2022-01 > Current ends at 2021-06 → NO OVERLAP
  Save: Period 1 = (2018-01 to 2021-06)
  New Current = Job C (2022-01 to 2024-01)

  End of list: Save Period 2 = (2022-01 to 2024-01)

Step 3: Calculate
  Period 1: 2018-01 to 2021-06 = 42 months
  Period 2: 2022-01 to 2024-01 = 24 months
  Total: 42 + 24 = 66 months = 5.5 years → 6 years
```

---

## Contact & Questions

For questions about this specification:
- **Technical Questions:** Contact parser service team
- **Business Rules:** Contact product team
- **Frontend Integration:** Contact frontend team

**Document History:**
- v1.0 (2025-01-17): Initial specification approved
