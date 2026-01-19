# College Scorecard Data Import

This script fetches university data from the College Scorecard API and populates the database.

## Setup

The API key is already configured in `apps/web/.env.local`:
```
COLLEGE_SCORECARD_API_KEY="fuXqkt9Fre7Q8ZnkRBokfTZfnIKmzegOlbRj4yCQ"
```

The script automatically loads this environment variable.

## Usage

Run from the root of the monorepo:

```bash
# Using pnpm
pnpm --filter @student/db fetch:scorecard

# Or cd into packages/db
cd packages/db
pnpm fetch:scorecard
```

## What it does

- Fetches **600 US universities** from the College Scorecard API
- Filters for:
  - 4-year degree-granting institutions
  - Currently operating schools
  - At least 100 students enrolled
- Maps College Scorecard data to our database schema
- Includes data for:
  - Basic info (name, location, website)
  - Admissions (acceptance rate, SAT scores)
  - Costs (tuition, median debt)
  - Student demographics (enrollment, gender, race/ethnicity)
  - Outcomes (graduation rate, post-grad earnings)
  - Campus setting (city, suburban, town, rural)

## Rate Limiting

The script includes a 1-second delay between API calls to respect rate limits.

## Data Mapping

The script maps College Scorecard fields to our schema:

| College Scorecard Field | Our Schema Field |
|------------------------|------------------|
| `school.name` | `schoolName` |
| `school.city` | `schoolCity` |
| `school.state` | `schoolState` |
| `latest.admissions.admission_rate.overall` | `admissionRate` |
| `latest.cost.tuition.out_of_state` | `tuitionOutOfState` |
| `latest.admissions.sat_scores.average.overall` | `satScoreAverage` |
| `latest.student.size` | `studentSize` |
| And many more... | See script for full mapping |

## Notes

- Some fields in our schema are not available from College Scorecard (e.g., `imageUrl`, `essayPrompts`, `usNewsNationalRanking`)
- These fields are set to `null` and can be populated from other sources later
- The script uses `onConflictDoUpdate` to update existing records
