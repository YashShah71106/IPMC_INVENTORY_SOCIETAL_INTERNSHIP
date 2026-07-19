import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  LayoutGrid, Boxes, Factory, ShieldCheck, FileBarChart2,
  AlertTriangle, TrendingUp, TrendingDown, Search, Bell,
  ChevronRight, CircleCheck, CircleX, Clock, Radio
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

/* ---------------- Design tokens ----------------
   Ink        #16233A   deep navy-charcoal (primary text / rail bg)
   Steel      #1E3A5F   primary brand (headers, active states)
   Copper     #C2670E   accent (copper conductor — the material itself)
   Success    #1E7A4C   pass / healthy stock
   Danger     #B3261E   fail / stockout
   Warn       #B7791F   low-stock amber
   Surface    #FFFFFF   cards
   Canvas     #F4F5F8   page background
   Border     #E2E5EA
   Batch tags: Pink #C2447A · Yellow #D9A404 · Green #3F7D4F  (mirrors
   the colour-coded cable reels observed on the shop floor)
---------------------------------------------------- */

const COLORS = {
  ink: "#16233A", steel: "#1E3A5F", copper: "#C2670E",
  success: "#1E7A4C", danger: "#B3261E", warn: "#B7791F",
  surface: "#FFFFFF", canvas: "#F4F5F8", border: "#E2E5EA",
};

const NAV = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "inventory", label: "Inventory", icon: Boxes },
  { key: "production", label: "Production", icon: Factory },
  { key: "quality", label: "Quality", icon: ShieldCheck },
  { key: "reports", label: "Reports", icon: FileBarChart2 },
];

const inventoryData = [
  { material: "PVC Compound (Grade A)", stock: 4200, unit: "kg", threshold: 1500, status: "ok" },
  { material: "Copper Conductor 2.5mm", stock: 980, unit: "kg", threshold: 1200, status: "low" },
  { material: "Aluminium Rod", stock: 3100, unit: "kg", threshold: 1000, status: "ok" },
  { material: "Armouring Wire", stock: 410, unit: "kg", threshold: 600, status: "low" },
  { material: "Outer Sheath Compound", stock: 2650, unit: "kg", threshold: 900, status: "ok" },
  { material: "Packing Reels (Std.)", stock: 88, unit: "nos", threshold: 100, status: "low" },
];

const stockChartData = inventoryData.map(d => ({ name: d.material.split(" ")[0], Stock: d.stock, Threshold: d.threshold }));

const productionBatches = [
  { batch: "JC-2607-114", product: "1.5mm² PVC Cable", machine: "Extruder 2", shift: "A", qty: "1,240 m", tag: "pink", status: "running" },
  { batch: "JC-2607-113", product: "2.5mm² PVC Cable", machine: "Extruder 1", shift: "A", qty: "980 m", tag: "green", status: "complete" },
  { batch: "JC-2607-112", product: "4.0mm² Armoured", machine: "Extruder 3", shift: "B", qty: "610 m", tag: "yellow", status: "complete" },
  { batch: "JC-2607-111", product: "1.5mm² PVC Cable", machine: "Extruder 2", shift: "B", qty: "1,105 m", tag: "pink", status: "hold" },
  { batch: "JC-2607-110", product: "6.0mm² Armoured", machine: "Extruder 3", shift: "A", qty: "740 m", tag: "green", status: "complete" },
];

const outputTrend = [
  { day: "Mon", meters: 5400 }, { day: "Tue", meters: 5900 }, { day: "Wed", meters: 4800 },
  { day: "Thu", meters: 6200 }, { day: "Fri", meters: 6600 }, { day: "Sat", meters: 5100 },
];

const qcRecords = [
  { batch: "JC-2607-113", test: "Insulation Resistance", result: "Pass", inspector: "R. Chauhan", time: "09:12" },
  { batch: "JC-2607-112", test: "Conductor Resistance", result: "Pass", inspector: "R. Chauhan", time: "10:04" },
  { batch: "JC-2607-110", test: "Dimensional Check", result: "Fail", inspector: "M. Solanki", time: "11:47" },
  { batch: "JC-2607-109", test: "Insulation Resistance", result: "Pass", inspector: "M. Solanki", time: "13:20" },
];

const satisfactionData = [
  { name: "Satisfied (4–5)", value: 3, color: COLORS.success },
  { name: "Neutral (3)", value: 4, color: COLORS.warn },
  { name: "Dissatisfied (1–2)", value: 8, color: COLORS.danger },
];

const beforeAfter = [
  { metric: "Stock-level visibility", before: "1–2 manual updates/day", after: "Real-time, every transaction" },
  { metric: "Production summary time", before: "1–3 hours", after: "< 1 minute (automated)" },
  { metric: "Quality → batch traceability", before: "~45 minutes", after: "< 2 minutes" },
  { metric: "Low-stock detection delay", before: "2–3 days late", after: "Instant threshold alert" },
];

function CountUp({ to, decimals = 0, prefix = "", suffix = "", duration = 900 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

function Badge({ tone, children }) {
  const map = {
    ok: { bg: "#E9F5EE", fg: COLORS.success },
    low: { bg: "#FBEDE9", fg: COLORS.danger },
    running: { bg: "#EAF0F7", fg: COLORS.steel },
    complete: { bg: "#E9F5EE", fg: COLORS.success },
    hold: { bg: "#FCF3E3", fg: COLORS.warn },
    pass: { bg: "#E9F5EE", fg: COLORS.success },
    fail: { bg: "#FBEDE9", fg: COLORS.danger },
  };
  const s = map[tone] || map.ok;
  return (
    <span style={{ background: s.bg, color: s.fg }} className="px-2.5 py-1 rounded text-xs font-semibold font-[Inter] tracking-wide uppercase">
      {children}
    </span>
  );
}

const BATCH_TAG_COLORS = { pink: "#C2447A", yellow: "#D9A404", green: "#3F7D4F" };
function BatchTag({ tag }) {
  return <span style={{ background: BATCH_TAG_COLORS[tag] || "#3F7D4F" }} className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle" />;
}

function KpiCard({ label, value, sub, trend, icon: Icon, delay = 0, numeric, prefix = "", suffix = "" }) {
  return (
    <div style={{ borderColor: COLORS.border, animationDelay: `${delay}ms` }}
      className="bg-white rounded-xl border p-5 flex flex-col gap-3 anim-fade-up hover-lift">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase text-slate-500 font-[Inter]">{label}</span>
        <Icon size={18} color={COLORS.copper} />
      </div>
      <div className="text-3xl font-bold font-[Space_Grotesk]" style={{ color: COLORS.ink }}>
        {numeric !== undefined ? <CountUp to={numeric} prefix={prefix} suffix={suffix} /> : value}
      </div>
      <div className="flex items-center gap-1.5 text-xs font-[Inter]">
        {trend === "up" && <TrendingUp size={14} color={COLORS.success} />}
        {trend === "down" && <TrendingDown size={14} color={COLORS.danger} />}
        <span style={{ color: trend === "down" ? COLORS.danger : trend === "up" ? COLORS.success : "#64748B" }}>{sub}</span>
      </div>
    </div>
  );
}

function SectionCard({ title, action, children, className = "", delay = 0 }) {
  return (
    <div style={{ borderColor: COLORS.border, animationDelay: `${delay}ms` }} className={`bg-white rounded-xl border p-5 anim-fade-up ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-[Space_Grotesk] font-bold text-[15px] tracking-tight" style={{ color: COLORS.ink }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function BatchStrip() {
  return (
    <div style={{ borderColor: COLORS.border }} className="bg-white rounded-xl border px-5 py-4 flex items-center gap-4 overflow-x-auto anim-fade-up">
      <div className="flex items-center gap-2 shrink-0 pr-4 border-r" style={{ borderColor: COLORS.border }}>
        <span className="relative flex h-2.5 w-2.5">
          <span className="pulse-ring absolute inline-flex h-full w-full rounded-full" style={{ background: COLORS.copper }} />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: COLORS.copper }} />
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 font-[Inter]">Live batches</span>
      </div>
      {productionBatches.slice(0, 5).map((b, i) => (
        <div key={b.batch} style={{ background: COLORS.canvas, animationDelay: `${i * 70}ms` }}
          className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-lg anim-fade-in hover-lift">
          <BatchTag tag={b.tag} />
          <span className="font-[IBM_Plex_Mono] text-xs font-semibold" style={{ color: COLORS.ink }}>{b.batch}</span>
          <ChevronRight size={12} color="#94A3B8" />
          <span className="text-xs text-slate-500 font-[Inter]">{b.machine}</span>
        </div>
      ))}
    </div>
  );
}

function Overview() {
  return (
    <div className="flex flex-col gap-5">
      <BatchStrip />
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Stock Value" numeric={18.4} prefix="₹" suffix="L" sub="+3.2% vs last week" trend="up" icon={Boxes} delay={0} />
        <KpiCard label="Active Batches" numeric={5} sub="1 on hold — QC fail" trend="down" icon={Factory} delay={80} />
        <KpiCard label="QC Pass Rate" numeric={94} suffix="%" sub="last 30 days" trend="up" icon={ShieldCheck} delay={160} />
        <KpiCard label="Low-Stock Alerts" numeric={3} sub="Copper, Armouring, Reels" trend="down" icon={AlertTriangle} delay={240} />
      </div>
      <div className="grid grid-cols-3 gap-5">
        <SectionCard title="Raw Material Stock vs Reorder Threshold" className="col-span-2">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={stockChartData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: "Inter" }} stroke="#94A3B8" />
              <YAxis tick={{ fontSize: 11, fontFamily: "Inter" }} stroke="#94A3B8" />
              <Tooltip contentStyle={{ fontFamily: "Inter", fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.border}` }} />
              <Bar dataKey="Stock" fill={COLORS.steel} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Threshold" fill={COLORS.copper} radius={[4, 4, 0, 0]} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
        <SectionCard title="Weekly Output (metres)">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={outputTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: "Inter" }} stroke="#94A3B8" />
              <YAxis tick={{ fontSize: 11, fontFamily: "Inter" }} stroke="#94A3B8" hide />
              <Tooltip contentStyle={{ fontFamily: "Inter", fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.border}` }} />
              <Line type="monotone" dataKey="meters" stroke={COLORS.copper} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </div>
  );
}

function Inventory() {
  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Raw Material Ledger" action={<span className="text-xs font-[Inter] text-slate-400">Updated live on every transaction</span>}>
        <table className="w-full text-sm font-[Inter]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b" style={{ borderColor: COLORS.border }}>
              <th className="py-2 font-semibold">Material</th>
              <th className="py-2 font-semibold">Stock</th>
              <th className="py-2 font-semibold">Reorder Threshold</th>
              <th className="py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map(row => (
              <tr key={row.material} className="border-b last:border-0 row-hover" style={{ borderColor: COLORS.border }}>
                <td className="py-3 font-medium" style={{ color: COLORS.ink }}>{row.material}</td>
                <td className="py-3 font-[IBM_Plex_Mono]">{row.stock.toLocaleString()} {row.unit}</td>
                <td className="py-3 font-[IBM_Plex_Mono] text-slate-500">{row.threshold.toLocaleString()} {row.unit}</td>
                <td className="py-3"><Badge tone={row.status}>{row.status === "ok" ? "Healthy" : "Reorder"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
      <div className="grid grid-cols-3 gap-5">
        <SectionCard title="Inward Entry (Today)">
          <div className="flex flex-col gap-3 font-[Inter] text-sm">
            <Row l="PVC Compound (Grade A)" r="600 kg" />
            <Row l="Copper Conductor 2.5mm" r="250 kg" />
            <Row l="Supplier" r="Reliance Polymers" />
          </div>
        </SectionCard>
        <SectionCard title="Outward Entry (Today)">
          <div className="flex flex-col gap-3 font-[Inter] text-sm">
            <Row l="Armouring Wire" r="180 kg" />
            <Row l="Packing Reels" r="42 nos" />
            <Row l="Issued to" r="Extruder 2 line" />
          </div>
        </SectionCard>
        <SectionCard title="Auto Alert Sent">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} color={COLORS.warn} className="mt-0.5 shrink-0" />
            <p className="text-sm font-[Inter] text-slate-600 leading-relaxed">
              Armouring Wire fell below the 600 kg threshold — purchase team notified automatically at 08:42.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function Production() {
  return (
    <div className="flex flex-col gap-5">
      <BatchStrip />
      <SectionCard title="Shift Batch Log">
        <table className="w-full text-sm font-[Inter]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b" style={{ borderColor: COLORS.border }}>
              <th className="py-2 font-semibold">Batch No.</th>
              <th className="py-2 font-semibold">Product</th>
              <th className="py-2 font-semibold">Machine</th>
              <th className="py-2 font-semibold">Shift</th>
              <th className="py-2 font-semibold">Output</th>
              <th className="py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {productionBatches.map(b => (
              <tr key={b.batch} className="border-b last:border-0 row-hover" style={{ borderColor: COLORS.border }}>
                <td className="py-3 font-[IBM_Plex_Mono] font-semibold" style={{ color: COLORS.ink }}><BatchTag tag={b.tag} />{b.batch}</td>
                <td className="py-3">{b.product}</td>
                <td className="py-3 text-slate-500">{b.machine}</td>
                <td className="py-3 text-slate-500">{b.shift}</td>
                <td className="py-3 font-[IBM_Plex_Mono]">{b.qty}</td>
                <td className="py-3"><Badge tone={b.status}>{b.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
}

function Quality() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => qcRecords.filter(r => r.batch.toLowerCase().includes(q.toLowerCase())), [q]);
  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Batch Traceability Search" action={
        <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 border" style={{ borderColor: COLORS.border }}>
          <Search size={14} color="#94A3B8" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search batch no."
            className="bg-transparent outline-none text-xs font-[IBM_Plex_Mono] w-40" />
        </div>
      }>
        <table className="w-full text-sm font-[Inter]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b" style={{ borderColor: COLORS.border }}>
              <th className="py-2 font-semibold">Batch No.</th>
              <th className="py-2 font-semibold">Test</th>
              <th className="py-2 font-semibold">Result</th>
              <th className="py-2 font-semibold">Inspector</th>
              <th className="py-2 font-semibold">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} className="border-b last:border-0 row-hover" style={{ borderColor: COLORS.border }}>
                <td className="py-3 font-[IBM_Plex_Mono] font-semibold" style={{ color: COLORS.ink }}>{r.batch}</td>
                <td className="py-3">{r.test}</td>
                <td className="py-3">
                  <span className="flex items-center gap-1.5">
                    {r.result === "Pass" ? <CircleCheck size={15} color={COLORS.success} /> : <CircleX size={15} color={COLORS.danger} />}
                    <Badge tone={r.result.toLowerCase()}>{r.result}</Badge>
                  </span>
                </td>
                <td className="py-3 text-slate-500">{r.inspector}</td>
                <td className="py-3 font-[IBM_Plex_Mono] text-slate-500 flex items-center gap-1"><Clock size={12} />{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
      <div className="grid grid-cols-3 gap-5">
        <SectionCard title="Traceability Speed" className="col-span-1">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-4xl font-bold font-[Space_Grotesk]" style={{ color: COLORS.success }}>1m 48s</div>
            <div className="text-xs font-[Inter] text-slate-500 mt-2 text-center">avg. time to trace a quality result to its production batch — down from 45 minutes on paper</div>
          </div>
        </SectionCard>
        <SectionCard title="Employee Satisfaction — Current System (Survey, n=15)" className="col-span-2">
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={satisfactionData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                {satisfactionData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Legend wrapperStyle={{ fontFamily: "Inter", fontSize: 12 }} />
              <Tooltip contentStyle={{ fontFamily: "Inter", fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </div>
  );
}

function Row({ l, r }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{l}</span>
      <span className="font-[IBM_Plex_Mono] font-semibold" style={{ color: COLORS.ink }}>{r}</span>
    </div>
  );
}

function Reports() {
  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Before vs After — IPMS Implementation">
        <table className="w-full text-sm font-[Inter]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b" style={{ borderColor: COLORS.border }}>
              <th className="py-2 font-semibold">Metric</th>
              <th className="py-2 font-semibold">Before (manual)</th>
              <th className="py-2 font-semibold">After (IPMS)</th>
            </tr>
          </thead>
          <tbody>
            {beforeAfter.map(row => (
              <tr key={row.metric} className="border-b last:border-0 row-hover" style={{ borderColor: COLORS.border }}>
                <td className="py-3 font-medium" style={{ color: COLORS.ink }}>{row.metric}</td>
                <td className="py-3 text-slate-500">{row.before}</td>
                <td className="py-3 font-semibold" style={{ color: COLORS.success }}>{row.after}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
      <div className="grid grid-cols-2 gap-5">
        <SectionCard title="Export">
          <div className="flex flex-col gap-3">
            {["Daily Production Report — PDF", "Stock Ledger — Excel", "QC Traceability Log — PDF"].map(t => (
              <div key={t} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: COLORS.canvas }}>
                <span className="text-sm font-[Inter]" style={{ color: COLORS.ink }}>{t}</span>
                <span className="text-xs font-[Inter] font-semibold" style={{ color: COLORS.copper }}>Download</span>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Report Generation Time">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="text-4xl font-bold font-[Space_Grotesk]" style={{ color: COLORS.steel }}>&lt; 1 min</div>
            <div className="text-xs font-[Inter] text-slate-500 mt-2">vs. 2–3 hours of manual compilation previously</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export default function IPMSPrototype() {
  const [active, setActive] = useState("overview");
  const view = { overview: Overview, inventory: Inventory, production: Production, quality: Quality, reports: Reports }[active];
  const View = view;

  return (
    <div style={{ background: COLORS.canvas, minHeight: "100vh" }} className="flex font-[Inter]">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-4px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes tabIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1); opacity: 0.7; }
          75%  { transform: scale(2.4); opacity: 0; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes railIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .anim-fade-up { opacity: 0; animation: fadeUp 0.5s cubic-bezier(.2,.7,.3,1) forwards; }
        .anim-fade-in { opacity: 0; animation: fadeIn 0.4s ease forwards; }
        .anim-tab-in { animation: tabIn 0.35s cubic-bezier(.2,.7,.3,1); }

        .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -8px rgba(22,35,58,0.18); border-color: rgba(194,103,14,0.35); }

        .row-hover { transition: background-color 0.15s ease; }
        .row-hover:hover { background-color: #F7F8FB; }

        .nav-btn { position: relative; transition: background-color 0.2s ease, color 0.2s ease, padding-left 0.2s ease; }
        .nav-btn:hover { background: rgba(255,255,255,0.06) !important; padding-left: 16px; }
        .nav-icon { transition: transform 0.2s ease; }
        .nav-btn:hover .nav-icon { transform: scale(1.1); }
        .nav-dot { margin-left: auto; width: 5px; height: 5px; border-radius: 999px; animation: fadeIn 0.3s ease; }

        .pulse-ring { animation: pulseRing 1.8s cubic-bezier(0,0,0.2,1) infinite; }

        .rail-anim { animation: railIn 0.5s cubic-bezier(.2,.7,.3,1); }

        @media (prefers-reduced-motion: reduce) {
          .anim-fade-up, .anim-fade-in, .anim-tab-in, .rail-anim { animation: none !important; opacity: 1 !important; }
          .pulse-ring { animation: none !important; }
          .hover-lift:hover { transform: none; }
        }
      `}</style>

      {/* Rail */}
      <div style={{ background: COLORS.ink }} className="w-60 shrink-0 flex flex-col py-6 px-4 rail-anim">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div style={{ background: COLORS.copper }} className="w-8 h-8 rounded-lg flex items-center justify-center font-[Space_Grotesk] font-bold text-white text-sm">JC</div>
          <div>
            <div className="text-white font-[Space_Grotesk] font-bold text-sm tracking-tight">IPMS</div>
            <div className="text-[10px] text-slate-400 font-[Inter] tracking-wide">Johnson Cables Pvt. Ltd.</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map(n => {
            const Icon = n.icon;
            const isActive = active === n.key;
            return (
              <button key={n.key} onClick={() => setActive(n.key)}
                style={{ background: isActive ? "rgba(194,103,14,0.18)" : "transparent", color: isActive ? "#fff" : "#94A3B8" }}
                className="nav-btn flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium font-[Inter] text-left">
                <Icon size={17} color={isActive ? COLORS.copper : "#94A3B8"} className="nav-icon" />
                {n.label}
                {isActive && <span className="nav-dot" style={{ background: COLORS.copper }} />}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto px-2 pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="text-[10px] text-slate-500 font-[Inter] uppercase tracking-widest mb-1">Role</div>
          <div className="text-sm text-white font-[Inter] font-medium">Production Supervisor</div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <div style={{ borderColor: COLORS.border, background: COLORS.surface }} className="h-16 border-b flex items-center justify-between px-8 shrink-0">
          <div>
            <div className="font-[Space_Grotesk] font-bold text-lg capitalize" style={{ color: COLORS.ink }}>{active}</div>
            <div className="text-xs text-slate-400 font-[Inter]">Inventory & Production Management System</div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-xs font-[IBM_Plex_Mono] text-slate-500">Shift A · 09:41 IST</div>
            <Bell size={18} color="#64748B" />
            <div style={{ background: COLORS.steel }} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold font-[Inter]">PS</div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-8">
          <div key={active} className="anim-tab-in">
            <View />
          </div>
        </div>
      </div>
    </div>
  );
}
