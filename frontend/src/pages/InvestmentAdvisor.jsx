import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, PiggyBank, ShieldCheck, TrendingUp } from "lucide-react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import DisclaimerBanner from "../components/DisclaimerBanner";
import RiskMeter from "../components/RiskMeter";
import HealthScoreRing from "../components/HealthScoreRing";
import RecommendationCard from "../components/RecommendationCard";
import WhatIfSimulator from "../components/WhatIfSimulator";
import LiveMarketOverview from "../components/LiveMarketOverview";
import WealthProjection from "../components/WealthProjection";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const InvestmentAdvisor = () => {
  const { user, login } = useAuth();
  const [advisorData, setAdvisorData] = useState(null);
  const [wealthSummary, setWealthSummary] = useState(null);
  const [savedPlanIds, setSavedPlanIds] = useState([]);
  const [riskPreference, setRiskPreference] = useState(user?.riskPreference || "Moderate");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [advisorRes, wealthRes, historyRes] = await Promise.all([
      api.get("/investments/recommendations"),
      api.get("/investments/wealth-summary"),
      api.get("/investments/history"),
    ]);
    setAdvisorData(advisorRes.data.data);
    setWealthSummary(wealthRes.data.data);
    setSavedPlanIds(historyRes.data.data.savedPlans.map((p) => p.instrumentId));
    setRiskPreference(advisorRes.data.data.snapshot.riskPreference);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRiskChange = async (level) => {
    setRiskPreference(level);
    await api.put("/auth/me", { riskPreference: level });
    const advisorRes = await api.get("/investments/recommendations");
    setAdvisorData(advisorRes.data.data);
  };

  const handleSavePlan = async (rec) => {
    await api.post("/investments/save-plan", {
      instrumentId: rec.id,
      instrumentName: rec.name,
      suitabilityScore: rec.suitabilityScore,
    });
    setSavedPlanIds((prev) => [...prev, rec.id]);
  };

  return (
    <Layout title="Smart Investment Advisor" subtitle="Personalized, education-first guidance based on your own numbers">
      <DisclaimerBanner />

      {loading ? (
        <p className="text-slate-500">Analyzing your financial profile…</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Monthly Disposable Income" value={advisorData.snapshot.monthlyDisposableIncome} isCurrency accent="moss" index={0} Icon={Wallet} />
            <StatCard label="Total Savings" value={advisorData.snapshot.totalSavings} isCurrency accent="gold" index={1} Icon={PiggyBank} />
            <StatCard label="Emergency Fund (months)" value={advisorData.snapshot.emergencyFundMonths} accent="moss" index={2} Icon={ShieldCheck} />
            <StatCard label="Savings Rate %" value={advisorData.snapshot.savingsRatePercent} accent="gold" index={3} Icon={TrendingUp} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <RiskMeter riskPreference={riskPreference} onChange={handleRiskChange} />
            <HealthScoreRing score={advisorData.portfolioHealthScore} />
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="ledger-card rounded-lg p-5 shadow-ledger">
            <h2 className="font-display text-lg text-ink mb-1">Personalized Financial Insights</h2>
            <p className="text-xs text-slate-500 mb-4">Generated from your income, expenses, goals and habit consistency</p>
            <ul className="space-y-2">
              {advisorData.insights.map((insight, idx) => (
                <motion.li
                  key={insight}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="text-sm text-ink/80 flex gap-2 items-start"
                >
                  <span className="text-gold-500 mt-0.5">•</span>
                  <span>{insight}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <div>
            <h2 className="font-display text-lg text-ink mb-3">Recommended Investments</h2>
            <div className="space-y-3">
              {advisorData.recommendations.map((rec, idx) => (
                <RecommendationCard
                  key={rec.id}
                  rec={rec}
                  index={idx}
                  onSave={handleSavePlan}
                  saved={savedPlanIds.includes(rec.id)}
                />
              ))}
            </div>
          </div>

          <WhatIfSimulator />

          <LiveMarketOverview />

          {wealthSummary && (
            <WealthProjection
              netWorth={wealthSummary.netWorth}
              monthlyDisposableIncome={advisorData.snapshot.monthlyDisposableIncome}
              totalSavings={wealthSummary.totalSavings}
              totalInvestmentValue={wealthSummary.totalInvestmentValue}
              cashOnHand={wealthSummary.cashOnHand}
            />
          )}
        </div>
      )}
    </Layout>
  );
};

export default InvestmentAdvisor;
