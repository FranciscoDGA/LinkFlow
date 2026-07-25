"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", trafego: 4000 },
  { name: "Fev", trafego: 3000 },
  { name: "Mar", trafego: 2000 },
  { name: "Abr", trafego: 2780 },
  { name: "Mai", trafego: 1890 },
  { name: "Jun", trafego: 2390 },
  { name: "Jul", trafego: 3490 },
];

export default function DashboardChart() {
  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Evolução de Tráfego Orgânico (Estimado)
          </h2>
          <p className="text-sm text-slate-500">
            Crescimento da sua rede PBN nos últimos meses.
          </p>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="trafego"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ r: 4, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "#4f46e5", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
