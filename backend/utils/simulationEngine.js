const { INSTRUMENT_CATALOG } = require("../config/instrumentCatalog");

const DEFAULT_INFLATION_RATE = 6; // % per year, used for inflation-adjusted value only

// Future value of a lumpsum compounded annually.
const lumpsumFV = (principal, annualRatePct, years) => {
  const r = annualRatePct / 100;
  return principal * Math.pow(1 + r, years);
};

// Future value of a monthly SIP, compounded monthly, contributions at month start.
const sipFV = (monthlyAmount, annualRatePct, years) => {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return monthlyAmount * n;
  return monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
};

const runScenario = ({ amount, monthlySIP, years, annualRatePct }) => {
  const futureValue = lumpsumFV(amount, annualRatePct, years) + sipFV(monthlySIP, annualRatePct, years);
  const totalInvested = amount + monthlySIP * years * 12;
  const gain = futureValue - totalInvested;
  const inflationAdjusted = futureValue / Math.pow(1 + DEFAULT_INFLATION_RATE / 100, years);
  const cagr = totalInvested > 0 && years > 0 ? (Math.pow(futureValue / totalInvested, 1 / years) - 1) * 100 : 0;

  return {
    annualReturnPercent: Number(annualRatePct.toFixed(2)),
    futureValue: Math.round(futureValue),
    totalInvested: Math.round(totalInvested),
    gain: Math.round(gain),
    cagrPercent: Number(cagr.toFixed(2)),
    inflationAdjustedValue: Math.round(inflationAdjusted),
  };
};

// @desc  Runs best/average/worst case projections for one or more instruments,
// plus a year-by-year growth curve (average case) for charting.
const simulateInvestment = ({ amount = 0, monthlySIP = 0, durationYears = 5, instrumentIds = [] }) => {
  const instruments = instrumentIds.length > 0
    ? INSTRUMENT_CATALOG.filter((i) => instrumentIds.includes(i.id))
    : INSTRUMENT_CATALOG;

  const results = instruments.map((inst) => {
    const best = runScenario({ amount, monthlySIP, years: durationYears, annualRatePct: inst.cagrRange.high });
    const average = runScenario({ amount, monthlySIP, years: durationYears, annualRatePct: inst.historicalCAGR });
    const worst = runScenario({ amount, monthlySIP, years: durationYears, annualRatePct: inst.cagrRange.low });

    const curveFor = (rate) =>
      Array.from({ length: durationYears + 1 }, (_, year) => ({
        year,
        value: Math.round(lumpsumFV(amount, rate, year) + sipFV(monthlySIP, rate, year)),
      }));

    // Combined year-by-year curve with all three scenarios for the comparison chart.
    const growthCurve = curveFor(inst.historicalCAGR).map((point, idx) => ({
      year: point.year,
      average: point.value,
      best: curveFor(inst.cagrRange.high)[idx].value,
      worst: curveFor(inst.cagrRange.low)[idx].value,
    }));

    return {
      instrumentId: inst.id,
      instrumentName: inst.name,
      best,
      average,
      worst,
      growthCurve,
    };
  });

  return results;
};

module.exports = { simulateInvestment, DEFAULT_INFLATION_RATE };
