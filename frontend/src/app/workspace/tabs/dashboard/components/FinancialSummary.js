"use client";

import React from "react";
import {
  FaDollarSign,
  FaPercentage,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import FinancialMetricCard from "./FinancialMetricCard";

const FinancialSummary = ({
  financialMetrics,
  revenueData,
  marketShareData,
  growthData,
  expenseBreakdown,
  COLORS,
}) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Financial Overview</h3>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Revenue */}
        <FinancialMetricCard
          title="Revenue"
          value={financialMetrics.revenue?.value}
          change={financialMetrics.revenue?.change}
          positive={financialMetrics.revenue?.positive}
          bgColor="from-blue-50 to-blue-100"
          icon={<FaDollarSign className="text-blue-600" />}
        />

        <FinancialMetricCard
          title="Expenses"
          value={financialMetrics.expenses?.value}
          change={financialMetrics.expenses?.change}
          positive={financialMetrics.expenses?.positive}
          bgColor="from-red-50 to-red-100"
          icon={<FaDollarSign className="text-red-600" />}
        />

        <FinancialMetricCard
          title="Net Profit"
          value={financialMetrics.profit?.value}
          change={financialMetrics.profit?.change}
          positive={financialMetrics.profit?.positive}
          bgColor="from-green-50 to-green-100"
          icon={<FaDollarSign className="text-green-600" />}
        />

        <FinancialMetricCard
          title="Profit Margin"
          value={financialMetrics.margin?.value}
          change={financialMetrics.margin?.change}
          positive={financialMetrics.margin?.positive}
          bgColor="from-purple-50 to-purple-100"
          icon={<FaPercentage className="text-purple-600" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue vs Expenses */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="text-lg font-medium mb-4">Revenue vs Expenses</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#0088FE" />
              <Bar dataKey="expenses" name="Expenses" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Market Share (Pie Chart) */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="text-lg font-medium mb-4">Market Share</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={marketShareData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius, index }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius * 1.1;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  
                  // Split text into lines with max 10 characters per line
                  const words = name.split(' ');
                  let lines = [];
                  let currentLine = '';
                  
                  words.forEach(word => {
                    if (currentLine.length + word.length + 1 <= 10) {
                      currentLine += (currentLine ? ' ' : '') + word;
                    } else {
                      if (currentLine) lines.push(currentLine);
                      currentLine = word;
                    }
                  });
                  
                  if (currentLine) lines.push(currentLine);
                  if (lines.length === 0) lines = [name];
                  
                  const percentValue = (percent * 100).toFixed(0);
                  
                  return (
                    <text 
                      x={x} 
                      y={y} 
                      fill={COLORS[index % COLORS.length]}
                      textAnchor={x > cx ? 'start' : 'end'} 
                      dominantBaseline="central"
                      style={{ fontSize: '12px', fontWeight: 'bold' }}
                    >
                      {lines.map((line, i) => (
                        <tspan 
                          key={i} 
                          x={x} 
                          dy={i === 0 ? 0 : '1.2em'}
                        >
                          {line} {i === lines.length - 1 ? `${percentValue}%` : ''}
                        </tspan>
                      ))}
                    </text>
                  );
                }}
              >
                {marketShareData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Growth Trends (Area Chart) */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="text-lg font-medium mb-4">Growth Trends</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="growth"
                name="Growth %"
                stroke="#8884d8"
                fill="#8884d8"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown (Pie Chart) */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="text-lg font-medium mb-4">Expense Breakdown</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseBreakdown}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius, index }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius * 1.1;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  
                  // Split text into lines with max 10 characters per line
                  const words = name.split(' ');
                  let lines = [];
                  let currentLine = '';
                  
                  words.forEach(word => {
                    if (currentLine.length + word.length + 1 <= 10) {
                      currentLine += (currentLine ? ' ' : '') + word;
                    } else {
                      if (currentLine) lines.push(currentLine);
                      currentLine = word;
                    }
                  });
                  
                  if (currentLine) lines.push(currentLine);
                  if (lines.length === 0) lines = [name];
                  
                  const percentValue = (percent * 100).toFixed(0);
                  
                  return (
                    <text 
                      x={x} 
                      y={y} 
                      fill={COLORS[index % COLORS.length]}
                      textAnchor={x > cx ? 'start' : 'end'} 
                      dominantBaseline="central"
                      style={{ fontSize: '12px', fontWeight: 'bold' }}
                    >
                      {lines.map((line, i) => (
                        <tspan 
                          key={i} 
                          x={x} 
                          dy={i === 0 ? 0 : '1.2em'}
                        >
                          {line} {i === lines.length - 1 ? `${percentValue}%` : ''}
                        </tspan>
                      ))}
                    </text>
                  );
                }}
              >
                {expenseBreakdown.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;
