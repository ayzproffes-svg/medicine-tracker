import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({ name: "", dose: "", time: "" });

  useEffect(() => {
    const saved = localStorage.getItem("meds");
    if (saved) setMedicines(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("meds", JSON.stringify(medicines));
  }, [medicines]);

  const addMedicine = () => {
    if (!form.name || !form.dose || !form.time) return;
    setMedicines([
      ...medicines,
      { ...form, id: Date.now(), status: "pending", date: new Date().toLocaleDateString() }
    ]);
    setForm({ name: "", dose: "", time: "" });
    setPage("medicines");
  };

  const updateStatus = (id, status) => {
    setMedicines(medicines.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const deleteMedicine = (id) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const exportCSV = () => {
    const rows = [
      ["Name", "Dose", "Time", "Status", "Date"],
      ...medicines.map(m => [m.name, m.dose, m.time, m.status, m.date])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "medtrack_export.csv";
    a.click();
  };

  const stats = () => {
    const scheduled = medicines.length;
    const taken = medicines.filter((m) => m.status === "taken").length;
    const missed = medicines.filter((m) => m.status === "missed").length;
    const adherence = scheduled ? ((taken / scheduled) * 100).toFixed(0) : 0;
    return { scheduled, taken, missed, adherence };
  };

  const s = stats();

  const chartData = medicines.map((m, i) => ({
    name: m.date || i,
    taken: m.status === "taken" ? 1 : 0
  }));

  const pieData = [
    { name: "Taken", value: s.taken },
    { name: "Missed", value: s.missed }
  ];

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Futuristic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-indigo-900 to-black" />
      <div className="absolute w-[700px] h-[700px] bg-blue-500 rounded-full blur-[200px] opacity-20 animate-pulse top-[-200px] left-[-200px]" />
      <div className="absolute w-[600px] h-[600px] bg-purple-500 rounded-full blur-[200px] opacity-20 animate-pulse bottom-[-200px] right-[-200px]" />

      <div className="relative z-10 p-6">
        {/* Navbar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-400">MedTrack</h1>
          <div className="flex gap-6 text-gray-300">
            {["dashboard", "today", "medicines", "log"].map((p) => (
              <span key={p} onClick={() => setPage(p)} className={`cursor-pointer capitalize ${page === p ? "text-blue-400 border-b-2 border-blue-400" : "hover:text-white"}`}>
                {p}
              </span>
            ))}
            <button onClick={exportCSV} className="bg-blue-600 px-3 py-1 rounded">Export</button>
          </div>
        </div>

        {/* DASHBOARD */}
        {page === "dashboard" && (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Scheduled", value: s.scheduled },
                { label: "Taken", value: s.taken },
                { label: "Missed", value: s.missed },
                { label: "Adherence", value: s.adherence + "%" }
              ].map((card, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05 }} className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
                  <p className="text-gray-400 text-sm">{card.label}</p>
                  <h2 className="text-3xl font-bold">{card.value}</h2>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 h-[300px]">
                <h2 className="mb-2">Adherence Over Time</h2>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="taken" stroke="#4ade80" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 h-[300px]">
                <h2 className="mb-2">Status Breakdown</h2>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" outerRadius={80}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? "#4ade80" : "#f87171"} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* TODAY */}
        {page === "today" && (
          <div className="grid gap-4">
            {medicines.map((m) => (
              <motion.div key={m.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between">
                <div>
                  <h3>{m.name}</h3>
                  <p className="text-gray-400">{m.dose} • {m.time}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(m.id, "taken")} className="bg-green-500 px-3 rounded">Taken</button>
                  <button onClick={() => updateStatus(m.id, "missed")} className="bg-red-500 px-3 rounded">Missed</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* MEDICINES */}
        {page === "medicines" && (
          <>
            <div className="mb-6 bg-white/5 p-4 rounded-2xl border border-white/10">
              <h2 className="mb-2">Add Medicine</h2>
              <div className="flex flex-wrap gap-2">
                <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="p-2 bg-black/40 rounded" />
                <input placeholder="Dose" value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} className="p-2 bg-black/40 rounded" />
                <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="p-2 bg-black/40 rounded" />
                <button onClick={addMedicine} className="bg-blue-500 px-4 rounded">Add</button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {medicines.map((m) => (
                <motion.div key={m.id} className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <h3 className="font-semibold">{m.name}</h3>
                  <p className="text-gray-400">{m.dose} • {m.time}</p>
                  <p>Status: {m.status}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => updateStatus(m.id, "taken")} className="bg-green-500 px-2 rounded">✓</button>
                    <button onClick={() => updateStatus(m.id, "missed")} className="bg-red-500 px-2 rounded">✕</button>
                    <button onClick={() => deleteMedicine(m.id)} className="bg-gray-600 px-2 rounded">Delete</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* LOG */}
        {page === "log" && (
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <h2 className="mb-4">Log History</h2>
            {medicines.map((m) => (
              <div key={m.id} className="border-b border-white/10 py-2 flex justify-between">
                <span>{m.name}</span>
                <span className="text-gray-400">{m.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
