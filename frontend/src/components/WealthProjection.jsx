import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const BLENDED_ANNUAL_RATE = 10; // illustrative moderate-risk blended assumption, not a guarantee
const HORIZONS = [0, 5, 10, 20];

const formatINR = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", notation: "compact", maximumFractionDigits: 1 }).format(n);

const projectValue = (current, monthlyContribution, years) => {
  const r = BLENDED_ANNUAL_RATE / 100;
  const lumpsum = current * Math.pow(1 + r, years);
  const monthlyRate = r / 12;
  const n = years * 12;
  const sip = monthlyRate === 0 ? monthlyContribution * n : monthlyContribution * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);
  return Math.round(lumpsum + sip);
};

const WealthProjection = ({ netWorth = 0, monthlyDisposableIncome = 0, totalSavings = 0, totalInvestmentValue = 0, cashOnHand = 0 }) => {
  const chartData = HORIZONS.map((years) => ({
    label: years === 0 ? "Today" : `${years} yr`,
    value: projectValue(netWorth, monthlyDisposableIncome, years),
  }));

  const allocation = [
    { name: "Savings", value: Math.max(totalSavings, 0) },
    { name: "Investments", value: Math.max(totalInvestmentValue, 0) },
    { name: "Cash on hand", value: Math.max(cashOnHand, 0) },
  ].filter((a) => a.value > 0);

  const COLORS = ["#B98B3E", "#3F6C51", "#8CB89B"];

  return (
    <div className="ledger-card rounded-lg p-5 shadow-ledger">
      <h2 className="font-display text-lg text-ink mb-1">Wealth Projection</h2>
      <p className="text-xs text-slate-500 mb-4">
        Assumes your current net worth plus monthly disposable income, growing at an illustrative {BLENDED_ANNUAL_RATE}% blended annual rate
      </p>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,43,34,0.08)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5C6670" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#5C6670" }} axisLine={false} tickLine={false} width={55} tickFormatter={formatINR} />
              <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ background: "#1B2B22", border: "none", borderRadius: 8, color: "#EFEDE3", fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="#3F6C51" strokeWidth={2.5} dot={{ r: 4, fill: "#B98B3E" }} animationDuration={900} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Current allocation</p>
          {allocation.length === 0 ? (
            <p className="text-sm text-slate-500">Add savings or investments to see your allocation.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={allocation} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2} animationDuration={800}>
                  {allocation.map((entry, idx) => (
                    <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatINR(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default WealthProjection;
