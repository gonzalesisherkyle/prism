export type HealthGrade = "A" | "B" | "C" | "D" | "F";
export type HealthTrend = "up" | "down" | "stable";

export interface HealthScore {
  grade: HealthGrade;
  average: number;
  trend: HealthTrend;
}

function averageScore(scores: number[]): number {
  if (scores.length === 0) {
    return 0;
  }

  return scores.reduce((total, score) => total + score, 0) / scores.length;
}

function gradeForAverage(average: number): HealthGrade {
  if (average >= 8.5) {
    return "A";
  }

  if (average >= 7) {
    return "B";
  }

  if (average >= 5.5) {
    return "C";
  }

  if (average >= 4) {
    return "D";
  }

  return "F";
}

export function computeHealthScore(scores: number[]): HealthScore {
  const recentScores = scores.slice(0, 10).filter(Number.isFinite);
  const average = averageScore(recentScores);
  const recentAverage = averageScore(recentScores.slice(0, 5));
  const previousScores = recentScores.slice(5, 10);
  const previousAverage = averageScore(previousScores);

  let trend: HealthTrend = "stable";

  if (previousScores.length > 0) {
    const change = recentAverage - previousAverage;

    if (change > 0.5) {
      trend = "up";
    } else if (change < -0.5) {
      trend = "down";
    }
  }

  return {
    grade: gradeForAverage(average),
    average,
    trend,
  };
}
