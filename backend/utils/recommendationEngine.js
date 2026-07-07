const { INSTRUMENT_CATALOG } = require("../config/instrumentCatalog");

const RISK_PROFILE_TARGET = {
  Conservative: 1.5,
  Moderate: 3,
  Aggressive: 4.5,
};

// Pure function: no I/O, easy to unit test. Produces a 0-100 suitability score
// and a short, plain-language reason for each instrument, given the user's
// current financial snapshot.
const computeRecommendations = ({
  monthlyDisposableIncome = 0,
  totalSavings = 0,
  totalExpenses = 0,
  emergencyFundMonths = 0,
  riskPreference = "Moderate",
  investmentHorizonYears = 5,
  activeGoalsCount = 0,
}) => {
  const targetRisk = RISK_PROFILE_TARGET[riskPreference] ?? 3;

  const recommendations = INSTRUMENT_CATALOG.map((inst) => {
    let score = 100;
    const reasons = [];

    // Risk alignment: closer instrument risk score is to target risk, better the fit.
    const riskGap = Math.abs(inst.riskScore - targetRisk);
    score -= riskGap * 12;

    // Horizon alignment: penalize instruments that need a longer commitment
    // than the user's stated horizon.
    if (inst.minHorizonYears > investmentHorizonYears) {
      score -= (inst.minHorizonYears - investmentHorizonYears) * 6;
    } else {
      reasons.push(`fits your ${investmentHorizonYears}-year horizon`);
    }

    // Emergency fund check: if the fund is thin, favor liquid/low-risk instruments.
    if (emergencyFundMonths < 3) {
      if (inst.riskScore <= 2) {
        score += 8;
        reasons.push("safer choice while you're still building your emergency fund");
      } else {
        score -= 10;
      }
    } else {
      reasons.push("your emergency fund is in good shape, so some market risk is reasonable");
    }

    // Disposable income check: very low monthly disposable income favors liquid,
    // low-minimum instruments over long lock-ins.
    if (monthlyDisposableIncome < 3000 && inst.minHorizonYears >= 8) {
      score -= 10;
    }

    // Reward instruments matching the declared risk preference band directly.
    if (
      (riskPreference === "Conservative" && inst.riskScore <= 2) ||
      (riskPreference === "Moderate" && inst.riskScore >= 2 && inst.riskScore <= 4) ||
      (riskPreference === "Aggressive" && inst.riskScore >= 3)
    ) {
      score += 6;
      reasons.push(`matches your ${riskPreference.toLowerCase()} risk profile`);
    }

    if (activeGoalsCount > 0 && inst.riskScore <= 3) {
      reasons.push("suitable for funding a defined savings goal");
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    const reasonText = reasons.length > 0
      ? `Recommended because it ${reasons.join(", and ")}.`
      : "Included for portfolio diversification given your current profile.";

    return {
      id: inst.id,
      name: inst.name,
      category: inst.category,
      historicalCAGR: inst.historicalCAGR,
      riskLevel: inst.riskLevel,
      minHorizonYears: inst.minHorizonYears,
      liquidity: inst.liquidity,
      taxBenefits: inst.taxBenefits,
      pros: inst.pros,
      cons: inst.cons,
      suitabilityScore: score,
      recommendationReason: reasonText,
    };
  });

  return recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
};

module.exports = { computeRecommendations };
