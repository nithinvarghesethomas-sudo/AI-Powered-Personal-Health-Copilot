import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const sampleData = [
  { month: "May", score: 65 },
  { month: "Jun", score: 72 },
  { month: "Jul", score: 68 },
  { month: "Aug", score: 80 },
  { month: "Sep", score: 76 },
  { month: "Oct", score: 86 },
];

export default function HealthChart({ data = sampleData }) {
  return (
    <div className="health-chart">
      <div className="health-chart-heading">
        <div>
          <h3>Health overview</h3>
          <p>Illustrative wellness trend</p>
        </div>
        <span className="chart-period">6 months</span>
      </div>

      <div className="health-chart-area">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d9488" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8efef" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#0d9488"
              strokeWidth={3}
              fill="url(#healthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="chart-disclaimer">
        Sample visualization only—not a medical measurement or diagnosis.
      </p>
    </div>
  );
}