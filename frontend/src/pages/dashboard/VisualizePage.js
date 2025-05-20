import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, LineChart, Line, ResponsiveContainer
} from "recharts";
import html2canvas from "html2canvas";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];
const API_ENDPOINT = "https://8w7s679qsi.execute-api.us-east-1.amazonaws.com/userexpense";

const VisualizePage = () => {
  const chartRef = useRef();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  // For tag comparison
  const [compareTags, setCompareTags] = useState([]);

  const [compareMonths, setCompareMonths] = useState([]);
  const [compareYears, setCompareYears] = useState([]);
  const [showLineChart, setShowLineChart] = useState(false);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [amountRange, setAmountRange] = useState([0, 10000]);

  // Toggle for Category-wise Expenses chart type
  const [categoryChartType, setCategoryChartType] = useState("pie");

  // Toggle for Comparison chart type
  const [comparisonChartType, setComparisonChartType] = useState("bar"); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const email = sessionStorage.getItem("email");
        const res = await axios.get(`${API_ENDPOINT}?email=${email}`);
        setEntries(res.data);
      } catch (err) {
        console.error("Error fetching data for visualization", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const months = [
    { name: "January", value: "01" }, { name: "February", value: "02" },
    { name: "March", value: "03" }, { name: "April", value: "04" },
    { name: "May", value: "05" }, { name: "June", value: "06" },
    { name: "July", value: "07" }, { name: "August", value: "08" },
    { name: "September", value: "09" }, { name: "October", value: "10" },
    { name: "November", value: "11" }, { name: "December", value: "12" },
  ];

  const tags = [...new Set(entries.map(e => e.tag))].filter(Boolean);
  const years = [...new Set(entries.map(e => e.date?.split("/")[2]))].filter(Boolean);

  const numericEntries = entries.map(e => ({
    ...e,
    amount: parseFloat(e.amount),
    parsedDate: (() => {
      const dateParts = e.date?.split(", ")[1]?.split("/");
      return dateParts && dateParts.length === 3
        ? new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`)
        : null;
    })(),
  }));

  // Filtered entries based on all filters
  const filteredEntries = numericEntries.filter(e => {
    const [day, month, year] = e.date?.split(", ")[1]?.split("/") || [];
    const matchMonth = selectedMonth ? month === selectedMonth : true;
    const matchYear = selectedYear ? year === selectedYear : true;
    const matchTag = selectedTag ? e.tag === selectedTag : true;
    const matchFrom = fromDate ? e.parsedDate && e.parsedDate >= fromDate : true;
    const matchTo = toDate ? e.parsedDate && e.parsedDate <= toDate : true;
    const matchAmount = e.amount >= amountRange[0] && e.amount <= amountRange[1];
    return matchMonth && matchYear && matchTag && matchFrom && matchTo && matchAmount;
  });

  // Helper to get YYYY-MM string from date string in your format "Day, DD/MM/YYYY"
const getYearMonth = (dateStr) => {
  const [, ddmmyyyy] = dateStr?.split(", ") || [];
  if (!ddmmyyyy) return null;
  const [d, m, y] = ddmmyyyy.split("/");
  return `${y}-${m}`;
};

// Group filtered entries by month-year
const monthlyTotals = Object.values(
  filteredEntries.reduce((acc, curr) => {
    const ym = getYearMonth(curr.date);
    if (!ym) return acc;
    acc[ym] = acc[ym] || { period: ym, amount: 0 };
    acc[ym].amount += curr.amount;
    return acc;
  }, {})
).sort((a, b) => a.period.localeCompare(b.period));

// Calculate percentage change month over month
  const monthlyWithChange = monthlyTotals.map((entry, i, arr) => {
    if (i === 0) return { ...entry, pctChange: 0 };
    const prev = arr[i - 1].amount;
    const pctChange = prev === 0 ? 0 : ((entry.amount - prev) / prev) * 100;
    return { ...entry, pctChange };
  });



  // Category-wise expenses aggregation for selected year or all years
  const tagData = Object.values(
    numericEntries
      .filter(e => (selectedYear ? e.date?.includes(selectedYear) : true))
      .reduce((acc, curr) => {
        acc[curr.tag] = acc[curr.tag] || { tag: curr.tag, amount: 0 };
        acc[curr.tag].amount += curr.amount;
        return acc;
      }, {})
  );

  // Data for comparison of selected tags
  const comparisonTagData = Object.values(
    numericEntries
      .filter(e => compareTags.length === 0 ? false : compareTags.includes(e.tag))
      .reduce((acc, curr) => {
        acc[curr.tag] = acc[curr.tag] || { tag: curr.tag, amount: 0 };
        acc[curr.tag].amount += curr.amount;
        return acc;
      }, {})
  );

  // Date-wise aggregation for filtered entries
  const dateData = filteredEntries.reduce((acc, curr) => {
    const key = curr.date;
    acc[key] = acc[key] || { date: key, amount: 0 };
    acc[key].amount += curr.amount;
    return acc;
  }, {});

  const sortedDateData = Object.values(dateData).sort(
    (a, b) => new Date(a.date.split(", ")[1].split("/").reverse().join("-")) -
              new Date(b.date.split(", ")[1].split("/").reverse().join("-"))
  );

  // Cumulative total calculation
  let total = 0;
  const dateDataWithCumulative = sortedDateData.map((d) => {
    total += d.amount;
    return { ...d, cumulative: total };
  });

  // Max and min amount for highlights
  const maxAmount = Math.max(...dateDataWithCumulative.map(e => e.amount), 0);
  const minAmount = Math.min(...dateDataWithCumulative.map(e => e.amount), 0);

  const totalAmount = dateDataWithCumulative.length > 0
  ? dateDataWithCumulative[dateDataWithCumulative.length - 1].cumulative
  : 0;

  const dateDataWithCumPct = dateDataWithCumulative.map(d => ({
    ...d,
    cumulativePct: totalAmount > 0 ? (d.cumulative / totalAmount) * 100 : 0,
  }));

  // Weekend checker function
  const isWeekend = (dateStr) => {
    const [_, ddmmyyyy] = dateStr?.split(", ") || [];
    if (!ddmmyyyy) return false;
    const [d, m, y] = ddmmyyyy.split("/");
    const day = new Date(`${y}-${m}-${d}`).getDay();
    return day === 0 || day === 6;
  };

  // Amount slider boundaries
  const allAmounts = numericEntries.map(e => e.amount);
  const globalMax = Math.max(...allAmounts, 10000);
  const globalMin = Math.min(...allAmounts, 0);
  useEffect(() => {
    if (allAmounts.length) setAmountRange([globalMin, globalMax]);
  }, [entries]);

  // Export chart image function
  const exportChart = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current);
    const link = document.createElement("a");
    link.download = "expense-visualization.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedMonth("");
    setSelectedYear("");
    setSelectedTag("");
    setFromDate(null);
    setToDate(null);
    setAmountRange([globalMin, globalMax]);
    setCompareMonths([]);
    setCompareYears([]);
    setCompareTags([]);
  };

  // Comparison by months and years
  const comparisonData = numericEntries.filter(e => {
    const [, dateStr] = e.date?.split(", ") || [];
    const [day, month, year] = dateStr?.split("/") || [];
    return compareMonths.includes(month) || compareYears.includes(year);
  });

  const comparisonGrouped = Object.values(
    comparisonData.reduce((acc, curr) => {
      const [, dateStr] = curr.date?.split(", ") || [];
      const [d, m, y] = dateStr?.split("/") || [];
      const key = `${months.find(mth => mth.value === m)?.name} ${y}`;
      acc[key] = acc[key] || { period: key, amount: 0 };
      acc[key].amount += curr.amount;
      return acc;
    }, {})
  );

  if (loading) return <div className="p-6 font-sans">Loading data...</div>;

  return (
    <div className="p-6 font-sans text-sm">
      <h2 className="text-3xl font-semibold mb-6">📊 Expense Visualization</h2>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
        <div>
          <label className="block mb-1 font-medium">Month:</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full border px-2 py-1 rounded">
            <option value="">All</option>
            {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Year:</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full border px-2 py-1 rounded">
            <option value="">All</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Tag:</label>
          <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="w-full border px-2 py-1 rounded">
            <option value="">All</option>
            {tags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">From:</label>
          <DatePicker selected={fromDate} onChange={setFromDate} className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">To:</label>
          <DatePicker selected={toDate} onChange={setToDate} className="w-full border px-2 py-1 rounded" />
        </div>
        <div className="flex items-end gap-2">
          <button onClick={clearFilters} className="px-3 py-1 bg -red-500 text-white rounded">Clear Filters</button>
        </div>
      </div>
        {/* Amount Range slider + input */}
  <div className="mb-6">
    <label className="block font-medium mb-1">Amount Range:</label>
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center">
        <input
          type="number"
          className="border px-2 py-1 rounded w-20"
          value={amountRange[0]}
          min={globalMin}
          max={amountRange[1]}
          onChange={e => {
            const val = Number(e.target.value);
            if (!isNaN(val) && val <= amountRange[1]) setAmountRange([val, amountRange[1]]);
          }}
        />
        <small>Min</small>
      </div>
      <Slider
        range
        min={globalMin}
        max={globalMax}
        value={amountRange}
        onChange={setAmountRange}
        style={{ flexGrow: 1 }}
      />
      <div className="flex flex-col items-center">
        <input
          type="number"
          className="border px-2 py-1 rounded w-20"
          value={amountRange[1]}
          min={amountRange[0]}
          max={globalMax}
          onChange={e => {
            const val = Number(e.target.value);
            if (!isNaN(val) && val >= amountRange[0]) setAmountRange([amountRange[0], val]);
          }}
        />
        <small>Max</small>
      </div>
    </div>
  </div>

  {/* Date-wise filtered expenses */}
  <div className="mb-12">
    <h3 className="text-xl font-semibold mb-2">Filtered Expenses Over Time</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={dateDataWithCumulative}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#8884d8"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke="#82ca9d"
          strokeWidth={2}
          dot={false}
          strokeDasharray="3 3"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="cumulativePct"
          stroke="#ff7300"
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5"
          name="Cumulative %"
        />

      </LineChart>
    </ResponsiveContainer>
  </div>


  {/* Category-wise Expenses Section */}
  <div ref={chartRef} className="mb-12">
    <h3 className="text-xl font-semibold mb-2">Category-wise Expenses ({categoryChartType.toUpperCase()})</h3>
    <button
      onClick={() => setCategoryChartType(prev => prev === "pie" ? "bar" : "pie")}
      className="mb-3 px-3 py-1 rounded bg-blue-600 text-white"
    >
      Switch to {categoryChartType === "pie" ? "Bar" : "Pie"} Chart
    </button>
    {categoryChartType === "pie" ? (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={tagData}
            dataKey="amount"
            nameKey="tag"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={(entry) => `${entry.tag} (${((entry.amount / tagData.reduce((a,b) => a+b.amount, 0)) * 100).toFixed(1)}%)`}
          >
            {tagData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ) : (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={tagData}>
          <XAxis dataKey="tag" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>

  {/* Tag Comparison Section */}
  <div className="mb-12">
    <h3 className="text-xl font-semibold mb-2">Compare Tags</h3>
    <label className="block mb-1 font-medium">Select Tags to Compare (Ctrl/Cmd + click to select multiple):</label>
    <select
      multiple
      size={5}
      value={compareTags}
      onChange={e => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(opt => opt.value);
        setCompareTags(selectedOptions);
      }}
      className="w-full border px-2 py-1 rounded mb-3"
    >
      {tags.map(tag => (
        <option key={tag} value={tag}>{tag}</option>
      ))}
    </select>

    <div className="mb-3">
      <label className="mr-3 font-medium">Chart Type:</label>
      <button
        onClick={() => setComparisonChartType(prev => prev === "bar" ? "pie" : "bar")}
        className="px-3 py-1 rounded bg-green-600 text-white"
      >
        Switch to {comparisonChartType === "bar" ? "Pie" : "Bar"} Chart
      </button>
    </div>

    {compareTags.length === 0 ? (
      <p>No tags selected for comparison.</p>
    ) : comparisonChartType === "pie" ? (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={comparisonTagData}
            dataKey="amount"
            nameKey="tag"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={(entry) => `${entry.tag} (${((entry.amount / comparisonTagData.reduce((a,b) => a+b.amount, 0)) * 100).toFixed(1)}%)`}
          >
            {comparisonTagData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    ) : (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={comparisonTagData}>
          <XAxis dataKey="tag" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>

<div className="mb-6 flex items-center space-x-2 text-center">
    <h3 className="text-lg font-semibold">Monthly Percentage Change</h3>
    <div className="relative group">
      <span
        className="cursor-pointer rounded-full border border-gray-400 text-gray-600 font-bold w-5 h-5 flex items-center justify-center text-sm"
        aria-label="Info"
        tabIndex={0}
      >
        i
      </span>
        <div
          className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2
                     w-48 p-2 text-xs text-white bg-gray-700 rounded opacity-0
                     group-hover:opacity-100 group-focus:opacity-100 pointer-events-none
                     transition-opacity duration-200 z-10"
          role="tooltip"
        >
          This shows the percentage increase or decrease in total expenses compared to the previous month.
        </div>
    </div>
    <table className="w-full text-sm border-collapse border border-gray-300">
    <thead>
      <tr>
        <th className="border border-gray-300 px-2 py-1">Month</th>
        <th className="border border-gray-300 px-2 py-1">% Change</th>
      </tr>
    </thead>
    <tbody>
      {monthlyWithChange.map(({ period, pctChange }) => (
        <tr key={period}>
          <td className="border border-gray-300 px-2 py-1">{period}</td>
          <td
            className={`border border-gray-300 px-2 py-1 ${
              pctChange > 0 ? "text-green-600" : pctChange < 0 ? "text-red-600" : ""
            }`}
          >
            {pctChange.toFixed(2)}%
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  </div>
  <button
    onClick={exportChart}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  >
    Export Visualization as Image
  </button>
  </div>
  );
};

export default VisualizePage;