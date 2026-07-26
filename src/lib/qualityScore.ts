export type QualityGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export type QualityBand = {
  grade: QualityGrade;
  min: number;
  max: number;
  interpretation: string;
};

export const QUALITY_GRADE_TABLE: readonly QualityBand[] = [
  {
    grade: 'A',
    min: 90,
    max: 100,
    interpretation: 'Very good quality; few or no significant issues detected'
  },
  {
    grade: 'B',
    min: 80,
    max: 89,
    interpretation: 'Good quality; minor issues require review'
  },
  {
    grade: 'C',
    min: 70,
    max: 79,
    interpretation: 'Acceptable quality; several issues require revision'
  },
  {
    grade: 'D',
    min: 60,
    max: 69,
    interpretation: 'Weak quality; substantial revision is required'
  },
  {
    grade: 'F',
    min: 0,
    max: 59,
    interpretation: 'Poor quality; major revision is required'
  }
] as const;

export function getQualityGrade(score: number | null | undefined): QualityGrade | null {
  if (score === null || score === undefined || Number.isNaN(score)) return null;
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}


