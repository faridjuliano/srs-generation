import { runValidatorExample } from './srsValidator';

const result = runValidatorExample();

console.log('SRS Validation Example Result');
console.log('-----------------------------');
console.log(`Passed: ${result.passed}`);
console.log(`Errors: ${result.errorCount}`);
console.log(`Warnings: ${result.warningCount}`);
console.log(`Quality Score: ${result.qualityScore}`);

if (result.issues.length > 0) {
  console.log('\nIssues:');
  result.issues.forEach((issue, index) => {
    const related = issue.relatedRequirementId ? ` -> ${issue.relatedRequirementId}` : '';
    console.log(
      `${index + 1}. [${issue.severity.toUpperCase()}] ${issue.code} (${issue.requirementId ?? 'N/A'}${related}): ${issue.message}`
    );
  });
}

