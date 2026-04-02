# SRS Validator (Rule-Based)

This module provides a smart, rule-based post-generation validation layer for SRS JSON.

## File

- `src/lib/srsValidator.ts`

## What It Checks

- Missing required fields (FR/NFR)
- Duplicate IDs
- Broken trace links (stakeholders/use cases)
- Missing source links
- Vague wording and weak modal verbs
- Multi-action requirements in one statement
- Near-duplicate requirement statements (Jaccard similarity)

## Main API

- `validateSRS(document)`
- `calculateQualityScore(issues)`
- Individual checks:
  - `checkMissingFields`
  - `checkDuplicateIds`
  - `checkBrokenTraceLinks`
  - `checkMissingSourceLinks`
  - `checkVagueWording`
  - `checkMultiActionRequirements`
  - `checkNearDuplicateRequirements`

## Quick Try

Run the example harness:

```bash
npx tsx src/lib/srsValidator.example.ts
```

Direct one-liner:

```bash
npx tsx -e "import { runValidatorExample } from './src/lib/srsValidator.ts'; console.log(runValidatorExample())"
```

