"use client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import type { Dataset, Enterprise } from "@/lib/domain";
const teal = "#087b70",
  gray = "#8395a3";
const axis = { fontSize: 12, fill: "#64757c" };
export function HistoryChart({ e }: { e: Enterprise }) {
  return (
    <div
      className="chart"
      role="img"
      aria-label="Annual revenue and R&D expenditure in RMB millions"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={e.history}
          margin={{ left: 0, right: 12, top: 15, bottom: 0 }}
        >
          <CartesianGrid stroke="#e8edef" vertical={false} />
          <XAxis dataKey="year" tick={axis} axisLine={false} tickLine={false} />
          <YAxis tick={axis} axisLine={false} tickLine={false} width={40} />
          <Tooltip formatter={(v) => `${Number(v).toFixed(2)}m RMB`} />
          <Area
            isAnimationActive={false}
            dataKey="revenue"
            name="Revenue"
            stroke={teal}
            fill="#e4f3ef"
            strokeWidth={2}
          />
          <Area
            isAnimationActive={false}
            dataKey="rd_expense"
            name="R&D expenditure"
            stroke="#5e80a0"
            fill="#edf2f7"
            strokeWidth={2}
          />
          <Legend iconType="line" wrapperStyle={{ fontSize: 12 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function ResearchCharts({ r }: { r: Dataset["research"] }) {
  return (
    <div className="two-col">
      {["ROC curves", "Calibration"].map((title, i) => (
        <section className="panel" key={title}>
          <div className="panel-head">
            <h2>{title}</h2>
            <span className="micro">
              {i ? "6 quantile bins" : `Fixed holdout · n=${r.test_n}`}
            </span>
          </div>
          <div className="chart" role="img" aria-label={title}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ right: 15, left: 0, top: 10, bottom: 10 }}>
                <CartesianGrid stroke="#e8edef" />
                <XAxis
                  dataKey={i ? "predicted" : "fpr"}
                  type="number"
                  domain={[0, 1]}
                  tick={axis}
                />
                <YAxis type="number" domain={[0, 1]} tick={axis} width={40} />
                <Tooltip />
                {i && (
                  <Line
                  isAnimationActive={false}
                    data={[
                      { predicted: 0, observed: 0 },
                      { predicted: 1, observed: 1 },
                    ]}
                    dataKey="observed"
                    name="Perfect calibration"
                    dot={false}
                    stroke="#c4cdd0"
                    strokeDasharray="4 4"
                  />
                )}
                {r.models.map((m, j) => (
                  <Line
                  isAnimationActive={false}
                    key={m.name}
                    data={i ? m.calibration : m.roc}
                    dataKey={i ? "observed" : "tpr"}
                    name={j ? "Augmented" : "Financial only"}
                    dot={!!i}
                    stroke={j ? teal : gray}
                    strokeWidth={2}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      ))}
    </div>
  );
}
export function ImportanceChart({ r }: { r: Dataset["research"] }) {
  return (
    <div
      className="importance-chart"
      role="img"
      aria-label="Ten-repeat held-out permutation importance measured by ROC-AUC decrease"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={[...r.models[1].importance].sort(
            (a, b) => b.auc_drop - a.auc_drop,
          )}
          margin={{ left: 5, right: 25, top: 10, bottom: 10 }}
        >
          <CartesianGrid stroke="#e8edef" horizontal={false} />
          <XAxis type="number" tick={axis} />
          <YAxis
            type="category"
            dataKey="feature"
            width={142}
            tick={axis}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip formatter={(v) => Number(v).toFixed(4)} />
          <Bar
            isAnimationActive={false}
            dataKey="auc_drop"
            name="Mean AUC decrease"
            fill={teal}
            radius={[0, 3, 3, 0]}
            barSize={15}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
