import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Wallet,
  Target,
  Settings,
  Trash2,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Search,
  BarChart3,
  Home,
  CreditCard,
  Download,
  Upload,
  Trophy,
  Smartphone,
  Landmark,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Activity,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";


const categories = [
    "Essen",
    "Freizeit",
    "Abos",
    "Transport",
    "Shopping",
    "Fixkosten",
    "Handy",
    "Gaming",
    "Sparen",
    "Sonstiges",
];



const STORAGE_KEY = "sigma-finance-app-cra-v2";
const chartColors = ["#22c55e", "#f59e0b", "#ef4444", "#0ea5e9", "#8b5cf6", "#14b8a6"];

const seedData = {
  transactions: [
    { id: 1, type: "income", category: "Lohn", amount: 880, note: "Monatslohn", date: "2026-04-01", bucket: "income" },
    { id: 2, type: "expense", category: "Handy", amount: 39, note: "Abo", date: "2026-04-02", bucket: "fixed" },
    { id: 3, type: "expense", category: "Freizeit", amount: 24, note: "Mit Freunden trinken", date: "2026-04-03", bucket: "flex" },
    { id: 4, type: "expense", category: "Sparen", amount: 120, note: "Auf Sparkonto", date: "2026-04-03", bucket: "saving" },
    { id: 5, type: "income", category: "Sparkonto Rückzahlung", amount: 60, note: "Vom Sparkonto zurück aufs Hauptkonto", date: "2026-04-08", bucket: "income" },
    { id: 6, type: "expense", category: "Freizeit", amount: 42, note: "Wochenende", date: "2026-04-11", bucket: "flex" },
    { id: 7, type: "expense", category: "Essen unterwegs", amount: 14.5, note: "Snack und Drink", date: "2026-04-15", bucket: "flex" },
  ],
  budgets: [
    { id: 1, name: "Freizeit", limit: 180, resetMode: "monthly" },
    { id: 2, name: "Essen unterwegs", limit: 80, resetMode: "monthly" },
    { id: 3, name: "Gaming", limit: 50, resetMode: "monthly" },
    { id: 4, name: "Sparen", limit: 150, resetMode: "monthly" },
  ],
  recurring: [
    { id: 1, title: "Handy-Abo", amount: 39, category: "Handy", bucket: "fixed", type: "expense", dayOfMonth: 2, note: "Monatlich automatisch", active: true, lastAppliedMonth: "2026-04" },
  ],
  goals: [
    { id: 1, name: "Notgroschen", target: 500, current: 120 },
    { id: 2, name: "Neue Kopfhörer", target: 250, current: 40 },
  ],
  mainAccount: { balance: 220 },
  savingsAccount: { balance: 400, plannedMonthlyDeposit: 150, borrowedOut: 80, expectedInterest: 2 },
  settings: { currency: "CHF", weeklyMode: true, monthOffset: 0 },
};

function money(value, currency = "CHF") {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getShiftedMonthDate(offset = 0) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + offset, 1);
}

function getMonthBounds(offset = 0) {
  const start = getShiftedMonthDate(offset);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function inSelectedMonth(dateString, offset) {
  const date = new Date(dateString);
  const { start, end } = getMonthBounds(offset);
  return date >= start && date <= end;
}

function clampDay(day) {
  return Math.max(1, Math.min(28, Number(day) || 1));
}

function getRecurringDateForMonth(monthDate, dayOfMonth) {
  return new Date(monthDate.getFullYear(), monthDate.getMonth(), clampDay(dayOfMonth)).toISOString().slice(0, 10);
}

function getBudgetSpentForRange(transactions, budget, monthOffset) {
  const base = transactions.filter((t) => t.type === "expense" && t.category.toLowerCase() === budget.name.toLowerCase());
  if (budget.resetMode === "manual") return base.reduce((sum, t) => sum + Number(t.amount), 0);
  return base.filter((t) => inSelectedMonth(t.date, monthOffset)).reduce((sum, t) => sum + Number(t.amount), 0);
}

function getGoalProgress(goal) {
  if (!goal.target || goal.target <= 0) return 0;
  return Math.min((goal.current / goal.target) * 100, 100);
}

function getBudgetStatus(progress) {
  if (progress >= 100) return { label: "Überschritten", color: "#be123c", bg: "#fff1f2", border: "#fecdd3" };
  if (progress >= 90) return { label: "Fast leer", color: "#be123c", bg: "#fff1f2", border: "#fecdd3" };
  if (progress >= 75) return { label: "Achtung", color: "#b45309", bg: "#fffbeb", border: "#fde68a" };
  return { label: "Stabil", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" };
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildCalendar(monthDate, transactions) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const cells = [];

  for (let i = 0; i < startWeekday; i++) cells.push(null);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day).toISOString().slice(0, 10);
    const dayTransactions = transactions.filter((t) => t.date === date);
    const income = dayTransactions.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expenses = dayTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const net = income - expenses;
    cells.push({ day, date, income, expenses, net, transactions: dayTransactions });
  }

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function styles() {
  const mobile = typeof window !== "undefined" && window.innerWidth < 640;
  return {
    app: {
      minHeight: "100vh",
      background: "#f4f4f5",
      color: "#18181b",
      fontFamily: "Inter, system-ui, sans-serif",
    },
    container: {
      maxWidth: 1400,
      margin: "0 auto",
      padding: mobile ? "12px 12px 96px" : "16px 16px 96px",
    },
    hero: {
      background: "linear-gradient(135deg, #09090b, #18181b 55%, #27272a)",
      color: "white",
      borderRadius: 28,
      padding: 24,
      boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
    },
    card: {
      background: "white",
      borderRadius: 24,
      boxShadow: "0 8px 28px rgba(0,0,0,0.06)",
      border: "1px solid rgba(0,0,0,0.04)",
    },
    softCard: {
      background: "#fafafa",
      borderRadius: 20,
      border: "1px solid #e4e4e7",
      padding: mobile ? 12 : 16,
      minWidth: 0,
      overflowWrap: "anywhere",
    },
    input: {
      width: "100%",
      height: 44,
      borderRadius: 16,
      border: "1px solid #d4d4d8",
      padding: "0 14px",
      background: "white",
      fontSize: 14,
      boxSizing: "border-box",
      minWidth: 0,
    },
    button: {
      height: 44,
      borderRadius: 16,
      border: "none",
      padding: mobile ? "0 12px" : "0 16px",
      background: "#18181b",
      color: "white",
      fontWeight: 600,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minWidth: 0,
      whiteSpace: "nowrap",
    },
    buttonSecondary: {
      height: 44,
      borderRadius: 16,
      border: "1px solid #d4d4d8",
      padding: mobile ? "0 12px" : "0 16px",
      background: "white",
      color: "#18181b",
      fontWeight: 600,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      minWidth: 0,
      whiteSpace: "nowrap",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "6px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      border: "1px solid #e4e4e7",
      background: "white",
    },
    tabs: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
      gap: 8,
      background: "white",
      padding: 8,
      borderRadius: 24,
      boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
      marginTop: 20,
      marginBottom: 20,
    },
    tabButton: {
      minHeight: 48,
      borderRadius: 16,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "0 10px",
    },
    bottomNav: {
      position: "fixed",
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(12px)",
      borderTop: "1px solid #e4e4e7",
      padding: 10,
      zIndex: 50,
    },
    grid2: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
      gap: 16,
      minWidth: 0,
    },
    gridCards: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fit, minmax(230px, 1fr))",
      gap: 16,
      minWidth: 0,
    },
    progressWrap: {
      width: "100%",
      height: 10,
      background: "#e4e4e7",
      borderRadius: 999,
      overflow: "hidden",
      marginTop: 10,
    },
  };
}

function ProgressBar({ value, color = "#18181b" }) {
  return (
    <div style={styles().progressWrap}>
      <div style={{ width: `${Math.min(value, 100)}%`, height: "100%", background: color, borderRadius: 999 }} />
    </div>
  );
}

function SectionTitle({ title, description, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 22 }}>{title}</div>
        {description ? <div style={{ color: "#71717a", fontSize: 14, marginTop: 4 }}>{description}</div> : null}
      </div>
      {action}
    </div>
  );
}

function StatCard({ title, value, subValue, hint, icon: Icon, gradient }) {
  return (
    <div style={{ ...styles().card, overflow: "hidden" }}>
      <div style={{ background: gradient, color: "white", padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, opacity: 0.82 }}>{title}</div>
            <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6, lineHeight: 1.1 }}>{value}</div>
            {subValue ? <div style={{ fontSize: 14, opacity: 0.82, marginTop: 6 }}>{subValue}</div> : null}
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 10 }}>{hint}</div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: 18, background: "rgba(255,255,255,0.15)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Icon size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const s = styles();
  const fileInputRef = useRef(null);
  const [transactions, setTransactions] = useState(seedData.transactions);
  const [budgets, setBudgets] = useState(seedData.budgets);
  const [recurring, setRecurring] = useState(seedData.recurring);
  const [goals, setGoals] = useState(seedData.goals);
  const [mainAccount, setMainAccount] = useState(seedData.mainAccount);
  const [savingsAccount, setSavingsAccount] = useState(seedData.savingsAccount);
  const [currency, setCurrency] = useState(seedData.settings.currency);
  const [weeklyMode, setWeeklyMode] = useState(seedData.settings.weeklyMode);
  const [monthOffset, setMonthOffset] = useState(seedData.settings.monthOffset);
  const [tab, setTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [filterBucket, setFilterBucket] = useState("all");
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const [newTransaction, setNewTransaction] = useState({ type: "expense", category: "Freizeit", amount: "", note: "", date: new Date().toISOString().slice(0, 10), bucket: "flex" });
  const [newBudget, setNewBudget] = useState({ name: "", limit: "", resetMode: "monthly" });
  const [newRecurring, setNewRecurring] = useState({ title: "", amount: "", category: "", bucket: "fixed", type: "expense", dayOfMonth: "1", note: "" });
  const [newGoal, setNewGoal] = useState({ name: "", target: "", current: "0" });
  const [goalContribution, setGoalContribution] = useState({});
  const [savingsTransfer, setSavingsTransfer] = useState({ type: "deposit", amount: "", note: "" });
  const [borrowForm, setBorrowForm] = useState({ amount: "", interest: "", note: "" });

  const selectedMonthDate = useMemo(() => getShiftedMonthDate(monthOffset), [monthOffset]);
  const selectedMonthKey = useMemo(() => getMonthKey(selectedMonthDate), [selectedMonthDate]);
  const selectedMonthLabel = useMemo(() => new Intl.DateTimeFormat("de-CH", { month: "long", year: "numeric" }).format(selectedMonthDate), [selectedMonthDate]);

const [editingRecurringId, setEditingRecurringId] = useState(null);
const [editRecurring, setEditRecurring] = useState({
  title: "",
  amount: "",
  category: "",
  dayOfMonth: 1,
});


  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.transactions) setTransactions(parsed.transactions);
      if (parsed.budgets) setBudgets(parsed.budgets);
      if (parsed.recurring) setRecurring(parsed.recurring);
      if (parsed.goals) setGoals(parsed.goals);
      if (parsed.mainAccount) setMainAccount(parsed.mainAccount);
      if (parsed.savingsAccount) setSavingsAccount(parsed.savingsAccount);
      if (parsed.settings?.currency) setCurrency(parsed.settings.currency);
      if (typeof parsed.settings?.weeklyMode === "boolean") setWeeklyMode(parsed.settings.weeklyMode);
      if (typeof parsed.settings?.monthOffset === "number") setMonthOffset(parsed.settings.monthOffset);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      transactions,
      budgets,
      recurring,
      goals,
      mainAccount,
      savingsAccount,
      settings: { currency, weeklyMode, monthOffset },
    }));
  }, [transactions, budgets, recurring, goals, mainAccount, savingsAccount, currency, weeklyMode, monthOffset]);

  useEffect(() => {
    const recurringToApply = recurring.filter((r) => r.active && r.lastAppliedMonth !== selectedMonthKey);
    if (recurringToApply.length === 0) return;

    const newTransactions = [];
    const updatedRecurring = recurring.map((r) => {
      if (!r.active || r.lastAppliedMonth === selectedMonthKey) return r;
      const autoDate = getRecurringDateForMonth(selectedMonthDate, r.dayOfMonth);
      const transactionExists = transactions.some((t) => t.note === `[AUTO] ${r.title}` && t.date === autoDate && t.amount === Number(r.amount) && t.category === r.category && t.bucket === r.bucket);
      if (!transactionExists) {
        newTransactions.push({ id: Date.now() + Math.random(), type: r.type, category: r.category, amount: Number(r.amount), note: `[AUTO] ${r.title}`, date: autoDate, bucket: r.bucket });
      }
      return { ...r, lastAppliedMonth: selectedMonthKey };
    });

    if (newTransactions.length > 0) setTransactions((prev) => [...newTransactions, ...prev]);
    setRecurring(updatedRecurring);
  }, [selectedMonthKey, selectedMonthDate, recurring, transactions]);

  const monthTransactions = useMemo(() => transactions.filter((t) => inSelectedMonth(t.date, monthOffset)), [transactions, monthOffset]);

  const totals = useMemo(() => {
    const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
    const fixed = monthTransactions.filter((t) => t.type === "expense" && t.bucket === "fixed").reduce((sum, t) => sum + Number(t.amount), 0);
    const flex = monthTransactions.filter((t) => t.type === "expense" && t.bucket === "flex").reduce((sum, t) => sum + Number(t.amount), 0);
    const saving = monthTransactions.filter((t) => t.bucket === "saving").reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, fixed, flex, saving, expenses, remaining: income - expenses };
  }, [monthTransactions]);

  const spendingByCategory = useMemo(() => {
    const grouped = {};
    monthTransactions.filter((t) => t.type === "expense").forEach((t) => {
      grouped[t.category] = (grouped[t.category] || 0) + Number(t.amount);
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [monthTransactions]);

  const budgetsWithSpent = useMemo(() => budgets.map((b) => {
    const spent = getBudgetSpentForRange(transactions, b, monthOffset);
    const progress = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;
    return { ...b, spent, remaining: b.limit - spent, progress, status: getBudgetStatus(progress) };
  }), [budgets, transactions, monthOffset]);

  const dangerBudgets = useMemo(() => budgetsWithSpent.filter((b) => b.progress >= 75), [budgetsWithSpent]);

  const filteredTransactions = useMemo(() => monthTransactions
    .filter((t) => (filterBucket === "all" ? true : t.bucket === filterBucket))
    .filter((t) => {
      const q = search.toLowerCase();
      return t.category.toLowerCase().includes(q) || t.note.toLowerCase().includes(q) || t.date.includes(q);
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)), [monthTransactions, search, filterBucket]);

  const monthlyPlan = useMemo(() => {
    const freeToUse = totals.income - totals.fixed - totals.saving;
    return { monthlyFlex: Math.max(freeToUse, 0), weeklyFlex: Math.max(freeToUse / 4, 0), dailyFlex: Math.max(freeToUse / 30, 0) };
  }, [totals]);

  const accountSummary = useMemo(() => ({
    totalCash: Number(mainAccount.balance || 0) + Number(savingsAccount.balance || 0),
  }), [mainAccount, savingsAccount]);

  const savingsSummary = useMemo(() => {
    const availableOnSavings = Math.max(Number(savingsAccount.balance || 0) - Number(savingsAccount.borrowedOut || 0), 0);
    const expectedBackNextMonth = Number(savingsAccount.borrowedOut || 0) + Number(savingsAccount.expectedInterest || 0);
    const projectedNextMonth = availableOnSavings + expectedBackNextMonth + Number(savingsAccount.plannedMonthlyDeposit || 0);
    return { availableOnSavings, expectedBackNextMonth, projectedNextMonth };
  }, [savingsAccount]);

  const percentages = useMemo(() => {
    const incomeBase = totals.income > 0 ? totals.income : 1;
    return {
      fixedPct: Math.min((totals.fixed / incomeBase) * 100, 999),
      flexPct: Math.min((totals.flex / incomeBase) * 100, 999),
      savingPct: Math.min((totals.saving / incomeBase) * 100, 999),
      remainingPct: Math.max((totals.remaining / incomeBase) * 100, 0),
    };
  }, [totals]);

  const calendarCells = useMemo(() => buildCalendar(selectedMonthDate, monthTransactions), [selectedMonthDate, monthTransactions]);

  function addTransaction() {
    const amount = Number(newTransaction.amount);
    if (!newTransaction.category || !amount || amount <= 0) return;
    setTransactions((prev) => [{ id: Date.now(), ...newTransaction, amount }, ...prev]);
    setNewTransaction({ type: "expense", category: "Freizeit", amount: "", note: "", date: new Date().toISOString().slice(0, 10), bucket: "flex" });
    setShowAddTransaction(false);
  }

  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  function addBudget() {
    const limit = Number(newBudget.limit);
    if (!newBudget.name || !limit || limit <= 0) return;
    setBudgets((prev) => [...prev, { id: Date.now(), name: newBudget.name, limit, resetMode: newBudget.resetMode }]);
    setNewBudget({ name: "", limit: "", resetMode: "monthly" });
  }

  function deleteBudget(id) {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }

  function addRecurring() {
    const amount = Number(newRecurring.amount);
    const dayOfMonth = Number(newRecurring.dayOfMonth);
    if (!newRecurring.title || !newRecurring.category || !amount || amount <= 0) return;
    setRecurring((prev) => [...prev, { id: Date.now(), ...newRecurring, amount, dayOfMonth, active: true, lastAppliedMonth: null }]);
    setNewRecurring({ title: "", amount: "", category: "", bucket: "fixed", type: "expense", dayOfMonth: "1", note: "" });
  }

  function toggleRecurring(id) {
    setRecurring((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  }

  function deleteRecurring(id) {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
  }

  function addGoal() {
    const target = Number(newGoal.target);
    const current = Number(newGoal.current);
    if (!newGoal.name || !target || target <= 0) return;
    setGoals((prev) => [...prev, { id: Date.now(), name: newGoal.name, target, current }]);
    setNewGoal({ name: "", target: "", current: "0" });
  }

  function deleteGoal(id) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  function updateGoalCurrent(id, value) {
    const amount = Number(value);
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, current: Number.isNaN(amount) ? g.current : amount } : g)));
  }

  function addGoalContribution(goalId) {
    const amount = Number(goalContribution[goalId] || 0);
    if (!amount || amount <= 0) return;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, current: g.current + amount } : g)));
    setTransactions((prev) => [{ id: Date.now() + Math.random(), type: "expense", category: "Sparziel", amount, note: `Zielbeitrag: ${goal.name}`, date: new Date().toISOString().slice(0, 10), bucket: "saving" }, ...prev]);
    setSavingsAccount((prev) => ({ ...prev, balance: Number(prev.balance || 0) + amount }));
    setGoalContribution((prev) => ({ ...prev, [goalId]: "" }));
  }

  function handleSavingsTransfer() {
    const amount = Number(savingsTransfer.amount);
    if (!amount || amount <= 0) return;
    const today = new Date().toISOString().slice(0, 10);

    if (savingsTransfer.type === "deposit") {
      setMainAccount((prev) => ({ ...prev, balance: Math.max(Number(prev.balance || 0) - amount, 0) }));
      setSavingsAccount((prev) => ({ ...prev, balance: Number(prev.balance || 0) + amount }));
      setTransactions((prev) => [{ id: Date.now() + Math.random(), type: "expense", category: "Sparen", amount, note: savingsTransfer.note || "Auf Sparkonto", date: today, bucket: "saving" }, ...prev]);
    } else {
      setMainAccount((prev) => ({ ...prev, balance: Number(prev.balance || 0) + amount }));
      setSavingsAccount((prev) => ({ ...prev, balance: Math.max(Number(prev.balance || 0) - amount, 0) }));
      setTransactions((prev) => [{ id: Date.now() + Math.random(), type: "income", category: "Sparkonto Rückzahlung", amount, note: savingsTransfer.note || "Vom Sparkonto zurück", date: today, bucket: "income" }, ...prev]);
    }

    setSavingsTransfer({ type: "deposit", amount: "", note: "" });
  }

  function handleBorrowFromSavings() {
    const amount = Number(borrowForm.amount);
    const interest = Number(borrowForm.interest || 0);
    if (!amount || amount <= 0) return;
    const today = new Date().toISOString().slice(0, 10);

    setMainAccount((prev) => ({ ...prev, balance: Number(prev.balance || 0) + amount }));
    setSavingsAccount((prev) => ({
      ...prev,
      balance: Math.max(Number(prev.balance || 0) - amount, 0),
      borrowedOut: Number(prev.borrowedOut || 0) + amount,
      expectedInterest: Number(prev.expectedInterest || 0) + interest,
    }));

    setTransactions((prev) => [{ id: Date.now() + Math.random(), type: "income", category: "Vom Sparkonto geliehen", amount, note: borrowForm.note || "Vom Sparkonto ausgeliehen", date: today, bucket: "income" }, ...prev]);
    setBorrowForm({ amount: "", interest: "", note: "" });
  }

  function settleBorrowedSavings() {
    const expected = Number(savingsAccount.borrowedOut || 0) + Number(savingsAccount.expectedInterest || 0);
    if (expected <= 0) return;
    const today = new Date().toISOString().slice(0, 10);

    setMainAccount((prev) => ({ ...prev, balance: Math.max(Number(prev.balance || 0) - expected, 0) }));
    setTransactions((prev) => [{ id: Date.now() + Math.random(), type: "expense", category: "Sparkonto Ausgleich", amount: expected, note: "Ausgeliehenen Betrag mit Zins zurückgelegt", date: today, bucket: "saving" }, ...prev]);
    setSavingsAccount((prev) => ({ ...prev, balance: Number(prev.balance || 0) + expected, borrowedOut: 0, expectedInterest: 0 }));
  }

  function exportData() {
    downloadJson(`sigma-finance-${selectedMonthKey}.json`, { exportedAt: new Date().toISOString(), version: 2, transactions, budgets, recurring, goals, mainAccount, savingsAccount, settings: { currency, weeklyMode, monthOffset } });
  }

  function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.budgets) setBudgets(parsed.budgets);
        if (parsed.recurring) setRecurring(parsed.recurring);
        if (parsed.goals) setGoals(parsed.goals);
        if (parsed.mainAccount) setMainAccount(parsed.mainAccount);
        if (parsed.savingsAccount) setSavingsAccount(parsed.savingsAccount);
        if (parsed.settings?.currency) setCurrency(parsed.settings.currency);
        if (typeof parsed.settings?.weeklyMode === "boolean") setWeeklyMode(parsed.settings.weeklyMode);
        if (typeof parsed.settings?.monthOffset === "number") setMonthOffset(parsed.settings.monthOffset);
      } catch (error) {
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }


function startEditRecurring(item) {
  setEditingRecurringId(item.id);
  setEditRecurring({ ...item });
}

function cancelEditRecurring() {
  setEditingRecurringId(null);
}

function saveEditRecurring(id) {
  setRecurring((prev) =>
    prev.map((r) =>
      r.id === id ? { ...r, ...editRecurring } : r
    )
  );
  setEditingRecurringId(null);
}



  const tabButtonStyle = (active) => ({
    ...s.tabButton,
    background: active ? "#18181b" : "transparent",
    color: active ? "white" : "#18181b",
  });


// VERSION
  const mobileOnly = typeof window !== "undefined" && window.innerWidth < 640;
  const appVersion = "v2.3 – Neuer Titel | Budget Überarbeitung ";
  // UPDATE NOTES
  const appUpdateNotes = [
      "Neuer Titel zur FKB wurde hinzugefügt.",
      "Zusätzlich wurde ein vielversprechender Slogan ergänzt.",
      "Budget Überarbeitung",
      "Kategorien sind jetzt in einem Dropdown-Menü auswählbar",
      "Es ist ein Zeitpunkt wählbar, an welchem die Zahlung ausgeführt wird",
];

  return (
    <div style={s.app}>
      <div style={s.container}>
        <div style={s.hero}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", opacity: 0.65 }}>Fynn Kantonal Bank</div>
                              <span style={{ ...s.badge, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}>A bank free of Jews</span>
              </div>
              <div style={{ fontSize: 38, fontWeight: 900, marginTop: 10, lineHeight: 1.05 }}>Dein Geld. Endlich unter Kontrolle.</div>
              <div style={{ marginTop: 10, maxWidth: 760, color: "rgba(255,255,255,0.78)", fontSize: 15 }}>
                Gleiche starke Finanz-App, aber mit besser integrierten Konten. Hauptkonto und Sparkonto sind jetzt sauber getrennt.
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button style={s.buttonSecondary} onClick={() => setMonthOffset((m) => m - 1)}><ChevronLeft size={16} /> Voriger</button>
              <button style={s.buttonSecondary} onClick={() => setMonthOffset((m) => m + 1)}>Nächster <ChevronRight size={16} /></button>
              <button style={s.buttonSecondary} onClick={() => setMonthOffset(0)}>Heute</button>
              <button style={{ ...s.button, background: "white", color: "#18181b" }} onClick={() => setShowAddTransaction((v) => !v)}><Plus size={16} /> Neue Buchung</button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ color: "#71717a", fontSize: 14 }}>Aktiver Monat</div>
            <div style={{ fontSize: 28, fontWeight: 900, textTransform: "capitalize" }}>{selectedMonthLabel}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={s.buttonSecondary} onClick={exportData}><Download size={16} /> Export</button>
            <button style={s.buttonSecondary} onClick={() => fileInputRef.current?.click()}><Upload size={16} /> Import</button>
            <input ref={fileInputRef} type="file" accept="application/json" style={{ display: "none" }} onChange={handleImport} />
          </div>
        </div>

        {showAddTransaction && (
          <div style={{ ...s.card, marginTop: 18, padding: 18 }}>
            <SectionTitle title="Neue Transaktion" description="Schnell etwas hinzufügen" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <select style={s.input} value={newTransaction.type} onChange={(e) => setNewTransaction((p) => ({ ...p, type: e.target.value, bucket: e.target.value === "income" ? "income" : p.bucket }))}>
                <option value="income">Einkommen</option>
                <option value="expense">Ausgabe</option>
              </select>
              <select style={s.input} value={newTransaction.bucket} onChange={(e) => setNewTransaction((p) => ({ ...p, bucket: e.target.value }))}>
                <option value="income">Einkommen</option>
                <option value="fixed">Fixkosten</option>
                <option value="flex">Variable Ausgaben</option>
                <option value="saving">Sparen</option>
              </select>
              <input style={s.input} placeholder="Kategorie" value={newTransaction.category} onChange={(e) => setNewTransaction((p) => ({ ...p, category: e.target.value }))} />
              <input style={s.input} type="number" placeholder="Betrag" value={newTransaction.amount} onChange={(e) => setNewTransaction((p) => ({ ...p, amount: e.target.value }))} />
              <input style={s.input} type="date" value={newTransaction.date} onChange={(e) => setNewTransaction((p) => ({ ...p, date: e.target.value }))} />
              <input style={s.input} placeholder="Notiz" value={newTransaction.note} onChange={(e) => setNewTransaction((p) => ({ ...p, note: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button style={s.button} onClick={addTransaction}>Speichern</button>
              <button style={s.buttonSecondary} onClick={() => setShowAddTransaction(false)}>Schliessen</button>
            </div>
          </div>
        )}

        {!mobileOnly && (
          <div style={s.tabs}>
            {[
              ["dashboard", Home, "Dashboard"],
              ["transactions", CreditCard, "Buchungen"],
              ["budgets", Target, "Budgets"],
              ["goals", Trophy, "Ziele"],
              ["calendar", Calendar, "Kalender"],
              ["analysis", BarChart3, "Analyse"],
              ["settings", Settings, "Settings"],
            ].map(([id, Icon, label]) => (
              <button key={id} style={tabButtonStyle(tab === id)} onClick={() => setTab(id)}><Icon size={16} /> {label}</button>
            ))}
          </div>
        )}

        {tab === "dashboard" && (
          <>
            {dangerBudgets.length > 0 && (
              <div style={{ ...s.card, background: "#fffbeb", border: "1px solid #fde68a", padding: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <AlertTriangle size={18} color="#b45309" style={{ marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 800, color: "#92400e" }}>Budget-Warnung</div>
                    <div style={{ fontSize: 14, color: "#92400e", marginTop: 4 }}>{dangerBudgets.length} Budget{dangerBudgets.length > 1 ? "s" : ""} sind fast leer oder überschritten.</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                      {dangerBudgets.map((b) => <span key={b.id} style={{ ...s.badge, color: "#92400e", borderColor: "#fcd34d" }}>{b.name}: {Math.round(b.progress)}%</span>)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={s.gridCards}>
              <StatCard title="Verfügbar" value={money(totals.remaining, currency)} subValue={`${percentages.remainingPct.toFixed(0)}% vom Einkommen`} hint="Was nach allen Buchungen übrig bleibt" icon={Wallet} gradient="linear-gradient(135deg,#09090b,#3f3f46)" />
              <StatCard title="Einkommen" value={money(totals.income, currency)} hint="Alle Einnahmen im gewählten Monat" icon={TrendingUp} gradient="linear-gradient(135deg,#166534,#22c55e)" />
              <StatCard title="Ausgaben" value={money(totals.expenses, currency)} subValue={`${((totals.expenses / (totals.income || 1)) * 100).toFixed(0)}% vom Einkommen`} hint="Fix + variabel + sparen" icon={TrendingDown} gradient="linear-gradient(135deg,#9f1239,#ef4444)" />
              <StatCard title="Hauptkonto" value={money(mainAccount.balance, currency)} hint="Geld für Alltag und spontane Ausgaben" icon={CreditCard} gradient="linear-gradient(135deg,#312e81,#6366f1)" />
              <StatCard title="Sparkonto" value={money(savingsAccount.balance, currency)} subValue={`Gesamt: ${money(accountSummary.totalCash, currency)}`} hint="Stand auf dem Sparkonto" icon={Activity} gradient="linear-gradient(135deg,#b45309,#f59e0b)" />
            </div>

            <div style={{ ...s.grid2, marginTop: 16, gridTemplateColumns: mobileOnly ? "1fr" : "minmax(0,2fr) minmax(280px,1fr)" }}>
              <div style={{ ...s.card, padding: 18 }}>
                <SectionTitle title="Besseres Dashboard" description="Direkte Prozentanzeige auf einen Blick" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  <div style={s.softCard}><div style={{ color: "#71717a", fontSize: 14 }}>Fixkosten</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{money(totals.fixed, currency)}</div><div style={{ fontSize: 12, color: "#71717a", marginTop: 4 }}>{percentages.fixedPct.toFixed(0)}% vom Einkommen</div><ProgressBar value={percentages.fixedPct} color="#18181b" /></div>
                  <div style={s.softCard}><div style={{ color: "#71717a", fontSize: 14 }}>Variabel</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{money(totals.flex, currency)}</div><div style={{ fontSize: 12, color: "#71717a", marginTop: 4 }}>{percentages.flexPct.toFixed(0)}% vom Einkommen</div><ProgressBar value={percentages.flexPct} color="#f59e0b" /></div>
                  <div style={s.softCard}><div style={{ color: "#71717a", fontSize: 14 }}>Sparquote</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{money(totals.saving, currency)}</div><div style={{ fontSize: 12, color: "#71717a", marginTop: 4 }}>{percentages.savingPct.toFixed(0)}% vom Einkommen</div><ProgressBar value={percentages.savingPct} color="#0ea5e9" /></div>
                  <div style={s.softCard}><div style={{ color: "#71717a", fontSize: 14 }}>Restquote</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{money(totals.remaining, currency)}</div><div style={{ fontSize: 12, color: "#71717a", marginTop: 4 }}>{percentages.remainingPct.toFixed(0)}% frei</div><ProgressBar value={percentages.remainingPct} color="#22c55e" /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 12, marginTop: 16 }}>
                  <div style={{ ...s.softCard, background: "#ecfdf5", borderColor: "#bbf7d0" }}><div style={{ color: "#15803d", fontSize: 14 }}>Monatlich frei verfügbar</div><div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>{money(monthlyPlan.monthlyFlex, currency)}</div></div>
                  <div style={{ ...s.softCard, background: "#eff6ff", borderColor: "#bfdbfe" }}><div style={{ color: "#1d4ed8", fontSize: 14 }}>Empfohlenes {weeklyMode ? "Wochen" : "Tages"}budget</div><div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>{money(weeklyMode ? monthlyPlan.weeklyFlex : monthlyPlan.dailyFlex, currency)}</div></div>
                </div>
              </div>

              <div style={{ ...s.card, padding: 18 }}>
                <SectionTitle title="Budget-Status" description="Sofort sehen, was knapp wird" />
                <div style={{ display: "grid", gap: 12 }}>
                  {budgetsWithSpent.map((budget) => (
                    <div key={budget.id} style={{ ...s.softCard, background: budget.status.bg, borderColor: budget.status.border }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
                        <div>
                          <div style={{ fontWeight: 800 }}>{budget.name}</div>
                          <div style={{ fontSize: 13, color: "#52525b", marginTop: 3 }}>{money(budget.spent, currency)} von {money(budget.limit, currency)}</div>
                        </div>
                        <span style={{ ...s.badge, color: budget.status.color, borderColor: budget.status.border }}>{budget.status.label}</span>
                      </div>
                      <ProgressBar value={budget.progress} color={budget.status.color} />
                      <div style={{ fontSize: 12, marginTop: 8, color: budget.status.color }}>Noch übrig: {money(budget.remaining, currency)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "transactions" && (
          <div style={{ ...s.card, padding: 18 }}>
            <SectionTitle title="Buchungen" description="Alles im gewählten Monat" />
            <div style={{ display: "grid", gridTemplateColumns: mobileOnly ? "1fr" : "1fr repeat(2, minmax(180px, 220px))", gap: 12, minWidth: 0 }}>
              <div style={{ position: "relative" }}>
                <Search size={16} color="#71717a" style={{ position: "absolute", left: 14, top: 14 }} />
                <input style={{ ...s.input, paddingLeft: 40 }} placeholder="Suche nach Kategorie, Notiz oder Datum" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select style={s.input} value={filterBucket} onChange={(e) => setFilterBucket(e.target.value)}>
                <option value="all">Alle Buchungen</option>
                <option value="income">Einkommen</option>
                <option value="fixed">Fixkosten</option>
                <option value="flex">Variable Ausgaben</option>
                <option value="saving">Sparen</option>
              </select>
              <button style={{ ...s.button, width: mobileOnly ? "100%" : "auto" }} onClick={() => setShowAddTransaction(true)}>Schnell hinzufügen</button>
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              {filteredTransactions.map((t) => (
                <div key={t.id} style={{ ...s.softCard, background: "white" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 800, fontSize: 18 }}>{t.category}</div>
                        <span style={s.badge}>{t.bucket}</span>
                      </div>
                      <div style={{ color: "#71717a", marginTop: 6, fontSize: 14 }}>{t.note || "Keine Notiz"}</div>
                      <div style={{ color: "#71717a", marginTop: 8, fontSize: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><CalendarDays size={12} /> {t.date}</span>
                        <span>{t.type === "income" ? "Einnahme" : "Ausgabe"}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ fontWeight: 900, fontSize: 22, color: t.type === "income" ? "#16a34a" : "#dc2626" }}>{t.type === "income" ? "+" : "-"}{money(t.amount, currency)}</div>
                      <button style={{ ...s.buttonSecondary, width: 44, padding: 0 }} onClick={() => deleteTransaction(t.id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "budgets" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ ...s.card, padding: 18 }}>
              <SectionTitle title="Budget hinzufügen" description="Lege Limits pro Kategorie fest" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12 }}>
                <input style={s.input} placeholder="z. B. Freizeit" value={newBudget.name} onChange={(e) => setNewBudget((p) => ({ ...p, name: e.target.value }))} />
                <input style={s.input} type="number" placeholder="Limit" value={newBudget.limit} onChange={(e) => setNewBudget((p) => ({ ...p, limit: e.target.value }))} />
                <select style={s.input} value={newBudget.resetMode} onChange={(e) => setNewBudget((p) => ({ ...p, resetMode: e.target.value }))}>
                  <option value="monthly">Monatlich</option>
                  <option value="manual">Manuell</option>
                </select>
                <button style={s.button} onClick={addBudget}>Erstellen</button>
              </div>
            </div>

            <div style={{ ...s.card, padding: 18 }}>
              <SectionTitle title="Wiederkehrende Ausgaben" description="Für Dinge wie Handy, Abo oder Sparrate" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12 }}>
                <input style={s.input} placeholder="Titel" value={newRecurring.title} onChange={(e) => setNewRecurring((p) => ({ ...p, title: e.target.value }))} />
                <input style={s.input} type="number" placeholder="Betrag" value={newRecurring.amount} onChange={(e) => setNewRecurring((p) => ({ ...p, amount: e.target.value }))} />
                <select
                    style={s.input}
                    value={newRecurring.category}
                    onChange={(e) =>
                        setNewRecurring((p) => ({ ...p, category: e.target.value }))
                    }
                >
                    <option value="">Kategorie wählen</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>

                <select
                  style={s.input}
                  value={newRecurring.dayOfMonth}
                  onChange={(e) =>
                    setNewRecurring((p) => ({ ...p, dayOfMonth: Number(e.target.value) }))
                  }
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      Monatlich am {day}.
                    </option>
                  ))}
                </select>
                <button style={s.button} onClick={addRecurring}>Hinzufügen</button>
              </div>

              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                {recurring.map((r) => (
                  <div key={r.id} style={s.softCard}>
                    {editingRecurringId === r.id ? (
                      <>
                        <input
                          style={s.input}
                          value={editRecurring.title}
                          onChange={(e) =>
                            setEditRecurring((p) => ({ ...p, title: e.target.value }))
                          }
                        />
                        <input
                          style={s.input}
                          type="number"
                          value={editRecurring.amount}
                          onChange={(e) =>
                            setEditRecurring((p) => ({ ...p, amount: e.target.value }))
                          }
                        />

                        <button onClick={() => saveEditRecurring(r.id)}>Speichern</button>
                        <button onClick={cancelEditRecurring}>Abbrechen</button>
                      </>
                    ) : (
                      <>
                        <div>{r.title}</div>
                        <div>{money(r.amount, currency)} · {r.category} · Tag {r.dayOfMonth}</div>
                      </>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{r.title}</div>
                        <div style={{ color: "#71717a", fontSize: 14, marginTop: 4 }}>{money(r.amount, currency)} · {r.category} · Tag {r.dayOfMonth}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span style={s.badge}>{r.active ? "Aktiv" : "Pausiert"}</span>
                        <button style={s.buttonSecondary} onClick={() => startEditRecurring(r)}>Bearbeiten</button>
                        <button style={s.buttonSecondary} onClick={() => toggleRecurring(r.id)}>{r.active ? "Pausieren" : "Aktivieren"}</button>
                        <button style={{ ...s.buttonSecondary, width: 44, padding: 0 }} onClick={() => deleteRecurring(r.id)}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px,1fr))", gap: 16 }}>
              {budgetsWithSpent.map((budget) => (
                <div key={budget.id} style={{ ...s.card, padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 20 }}>{budget.name}</div>
                      <div style={{ color: "#71717a", marginTop: 4, fontSize: 14 }}>Noch verfügbar: {money(budget.remaining, currency)} {budget.resetMode === "manual" ? "· manuell" : "· monatlich"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ ...s.badge, color: budget.status.color, borderColor: budget.status.border }}>{budget.status.label}</span>
                      <button style={{ ...s.buttonSecondary, width: 44, padding: 0 }} onClick={() => deleteBudget(budget.id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <ProgressBar value={budget.progress} color={budget.status.color} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px,1fr))", gap: 10, marginTop: 14 }}>
                    <div style={s.softCard}><div style={{ color: "#71717a", fontSize: 13 }}>Limit</div><div style={{ fontWeight: 800, marginTop: 5 }}>{money(budget.limit, currency)}</div></div>
                    <div style={s.softCard}><div style={{ color: "#71717a", fontSize: 13 }}>Ausgegeben</div><div style={{ fontWeight: 800, marginTop: 5 }}>{money(budget.spent, currency)}</div></div>
                    <div style={s.softCard}><div style={{ color: budget.remaining < 0 ? "#dc2626" : "#16a34a", fontSize: 13 }}>Rest</div><div style={{ fontWeight: 800, marginTop: 5 }}>{money(budget.remaining, currency)}</div></div>
                  </div>
                  {budget.progress >= 75 && (
                    <div style={{ ...s.softCard, marginTop: 12, background: budget.status.bg, borderColor: budget.status.border, color: budget.status.color, display: "flex", gap: 8, alignItems: "start" }}>
                      <AlertTriangle size={16} style={{ marginTop: 2 }} />
                      <div style={{ fontSize: 14 }}>Dieses Budget ist fast leer. Schau besser drauf, bevor es kippt.</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "goals" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ ...s.card, padding: 18 }}>
              <SectionTitle title="Sparziel hinzufügen" description="So siehst du, worauf du sparst und wie weit du bist" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12 }}>
                <input style={s.input} placeholder="z. B. Notgroschen" value={newGoal.name} onChange={(e) => setNewGoal((p) => ({ ...p, name: e.target.value }))} />
                <input style={s.input} type="number" placeholder="Zielbetrag" value={newGoal.target} onChange={(e) => setNewGoal((p) => ({ ...p, target: e.target.value }))} />
                <input style={s.input} type="number" placeholder="Aktuell" value={newGoal.current} onChange={(e) => setNewGoal((p) => ({ ...p, current: e.target.value }))} />
                <button style={s.button} onClick={addGoal}>Erstellen</button>
              </div>
            </div>

            <div style={{ ...s.card, padding: 18 }}>
              <SectionTitle title="Konten, Sparkonto & Ausleihen" description="Hier stellst du direkt ein, wie viel auf Hauptkonto und Sparkonto liegt" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px,1fr))", gap: 16 }}>
                <div style={s.softCard}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><div style={{ fontSize: 13, color: "#71717a", marginBottom: 6 }}>Stand Hauptkonto</div><input style={s.input} type="number" value={mainAccount.balance} onChange={(e) => setMainAccount((p) => ({ ...p, balance: Number(e.target.value || 0) }))} /></div>
                    <div><div style={{ fontSize: 13, color: "#71717a", marginBottom: 6 }}>Stand Sparkonto</div><input style={s.input} type="number" value={savingsAccount.balance} onChange={(e) => setSavingsAccount((p) => ({ ...p, balance: Number(e.target.value || 0) }))} /></div>
                    <div><div style={{ fontSize: 13, color: "#71717a", marginBottom: 6 }}>Geplant pro Monat</div><input style={s.input} type="number" value={savingsAccount.plannedMonthlyDeposit} onChange={(e) => setSavingsAccount((p) => ({ ...p, plannedMonthlyDeposit: Number(e.target.value || 0) }))} /></div>
                    <div><div style={{ fontSize: 13, color: "#71717a", marginBottom: 6 }}>Aktuell ausgeliehen</div><input style={s.input} type="number" value={savingsAccount.borrowedOut} onChange={(e) => setSavingsAccount((p) => ({ ...p, borrowedOut: Number(e.target.value || 0) }))} /></div>
                    <div><div style={{ fontSize: 13, color: "#71717a", marginBottom: 6 }}>Erwarteter Zins</div><input style={s.input} type="number" value={savingsAccount.expectedInterest} onChange={(e) => setSavingsAccount((p) => ({ ...p, expectedInterest: Number(e.target.value || 0) }))} /></div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: mobileOnly ? "1fr 1fr" : "repeat(4,1fr)", gap: 10, marginTop: 14, minWidth: 0 }}>
                    <div style={{ ...s.softCard, background: "white" }}><div style={{ fontSize: 13, color: "#71717a" }}>Hauptkonto</div><div style={{ fontWeight: 800, marginTop: 5 }}>{money(mainAccount.balance, currency)}</div></div>
                    <div style={{ ...s.softCard, background: "white" }}><div style={{ fontSize: 13, color: "#71717a" }}>Frei auf Sparkonto</div><div style={{ fontWeight: 800, marginTop: 5 }}>{money(savingsSummary.availableOnSavings, currency)}</div></div>
                    <div style={{ ...s.softCard, background: "white" }}><div style={{ fontSize: 13, color: "#71717a" }}>Kommt zurück</div><div style={{ fontWeight: 800, marginTop: 5 }}>{money(savingsSummary.expectedBackNextMonth, currency)}</div></div>
                    <div style={{ ...s.softCard, background: "white" }}><div style={{ fontSize: 13, color: "#71717a" }}>Total beide Konten</div><div style={{ fontWeight: 800, marginTop: 5 }}>{money(accountSummary.totalCash, currency)}</div></div>
                  </div>
                </div>

                <div style={s.softCard}>
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>Bewegung zwischen Hauptkonto und Sparkonto</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 12 }}>
                    <select style={s.input} value={savingsTransfer.type} onChange={(e) => setSavingsTransfer((p) => ({ ...p, type: e.target.value }))}>
                      <option value="deposit">Auf Sparkonto</option>
                      <option value="withdraw">Zurück aufs Hauptkonto</option>
                    </select>
                    <input style={s.input} type="number" placeholder="Betrag" value={savingsTransfer.amount} onChange={(e) => setSavingsTransfer((p) => ({ ...p, amount: e.target.value }))} />
                    <input style={s.input} placeholder="Notiz" value={savingsTransfer.note} onChange={(e) => setSavingsTransfer((p) => ({ ...p, note: e.target.value }))} />
                    <button style={s.button} onClick={handleSavingsTransfer}><ArrowRightLeft size={16} /> Buchen</button>
                  </div>

                  <div style={{ ...s.softCard, marginTop: 14, background: "#eff6ff", borderColor: "#bfdbfe" }}>
                    <div style={{ fontWeight: 800 }}>Wie das Ausleihen funktioniert</div>
                    <div style={{ fontSize: 14, color: "#52525b", marginTop: 6 }}>Beim Ausleihen wird Geld vom Sparkonto aufs Hauptkonto verschoben. Beim Ausgleich am Monatsanfang geht der geliehene Betrag plus Zins wieder zurück aufs Sparkonto.</div>
                  </div>

                  <div style={{ fontWeight: 800, marginTop: 20, marginBottom: 10 }}>Vom Sparkonto ausleihen</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 12 }}>
                    <input style={s.input} type="number" placeholder="Betrag" value={borrowForm.amount} onChange={(e) => setBorrowForm((p) => ({ ...p, amount: e.target.value }))} />
                    <input style={s.input} type="number" placeholder="Zins / Plus" value={borrowForm.interest} onChange={(e) => setBorrowForm((p) => ({ ...p, interest: e.target.value }))} />
                    <input style={s.input} placeholder="Notiz" value={borrowForm.note} onChange={(e) => setBorrowForm((p) => ({ ...p, note: e.target.value }))} />
                    <button style={s.button} onClick={handleBorrowFromSavings}>Ausleihen</button>
                  </div>

                  <button style={{ ...s.buttonSecondary, width: "100%", marginTop: 14 }} onClick={settleBorrowedSavings}>Monatsanfang ausgleichen + Zins zurücklegen</button>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px,1fr))", gap: 16 }}>
              {goals.map((goal) => {
                const progress = getGoalProgress(goal);
                return (
                  <div key={goal.id} style={{ ...s.card, padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 20 }}>{goal.name}</div>
                        <div style={{ fontSize: 14, color: "#71717a", marginTop: 4 }}>{money(goal.current, currency)} von {money(goal.target, currency)}</div>
                      </div>
                      <button style={{ ...s.buttonSecondary, width: 44, padding: 0 }} onClick={() => deleteGoal(goal.id)}><Trash2 size={16} /></button>
                    </div>
                    <ProgressBar value={progress} color="#16a34a" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                      <input style={s.input} type="number" value={goal.current} onChange={(e) => updateGoalCurrent(goal.id, e.target.value)} />
                      <div style={{ ...s.softCard, background: "#ecfdf5", borderColor: "#bbf7d0" }}><div style={{ color: "#15803d", fontSize: 13 }}>Noch nötig</div><div style={{ fontWeight: 800, marginTop: 5 }}>{money(Math.max(goal.target - goal.current, 0), currency)}</div></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginTop: 12 }}>
                      <input style={s.input} type="number" placeholder="Beitrag" value={goalContribution[goal.id] || ""} onChange={(e) => setGoalContribution((prev) => ({ ...prev, [goal.id]: e.target.value }))} />
                      <button style={s.button} onClick={() => addGoalContribution(goal.id)}>Beitragen</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "calendar" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ ...s.card, padding: 18 }}>
              <SectionTitle title="Kalenderansicht pro Monat" description="Sieh auf einen Blick, an welchen Tagen du Geld bekommen oder ausgegeben hast" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8, fontSize: 12, color: "#71717a", fontWeight: 800, marginBottom: 10 }}>
                {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => <div key={d} style={{ textAlign: "center" }}>{d}</div>)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
                {calendarCells.map((cell, index) => {
                  if (!cell) return <div key={index} style={{ minHeight: 92, borderRadius: 18, background: "#e4e4e7" }} />;
                  const tone = cell.net < 0 ? { border: "1px solid #fecdd3", background: "#fff1f2" } : cell.income > 0 ? { border: "1px solid #bbf7d0", background: "#f0fdf4" } : { border: "1px solid #e4e4e7", background: "white" };
                  return (
                    <button key={cell.date} onClick={() => setSelectedCalendarDay(cell)} style={{ minHeight: 92, borderRadius: 18, padding: 10, border: tone.border, background: tone.background, textAlign: "left", cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><div style={{ fontWeight: 800 }}>{cell.day}</div>{cell.transactions.length > 0 ? <span style={{ ...s.badge, fontSize: 10, padding: "4px 8px" }}>{cell.transactions.length}</span> : null}</div>
                      <div style={{ marginTop: 8, fontSize: 11, lineHeight: 1.4 }}>
                        <div style={{ color: cell.income > 0 ? "#15803d" : "#a1a1aa" }}>{cell.income > 0 ? `+ ${money(cell.income, currency)}` : "—"}</div>
                        <div style={{ color: cell.expenses > 0 ? "#be123c" : "#a1a1aa" }}>{cell.expenses > 0 ? `- ${money(cell.expenses, currency)}` : "—"}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedCalendarDay && (
              <div style={{ ...s.card, padding: 18 }}>
                <SectionTitle title={selectedCalendarDay.date} description={`${selectedCalendarDay.transactions.length} Buchung${selectedCalendarDay.transactions.length !== 1 ? "en" : ""} an diesem Tag`} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 12 }}>
                  <div style={{ ...s.softCard, background: "#ecfdf5", borderColor: "#bbf7d0" }}><div style={{ color: "#15803d", fontSize: 13 }}>Einnahmen</div><div style={{ fontWeight: 900, marginTop: 6 }}>{money(selectedCalendarDay.income, currency)}</div></div>
                  <div style={{ ...s.softCard, background: "#fff1f2", borderColor: "#fecdd3" }}><div style={{ color: "#be123c", fontSize: 13 }}>Ausgaben</div><div style={{ fontWeight: 900, marginTop: 6 }}>{money(selectedCalendarDay.expenses, currency)}</div></div>
                  <div style={s.softCard}><div style={{ color: "#3f3f46", fontSize: 13 }}>Saldo</div><div style={{ fontWeight: 900, marginTop: 6 }}>{money(selectedCalendarDay.net, currency)}</div></div>
                </div>
                <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
                  {selectedCalendarDay.transactions.map((t) => (
                    <div key={t.id} style={s.softCard}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div>
                          <div style={{ fontWeight: 800 }}>{t.category}</div>
                          <div style={{ color: "#71717a", fontSize: 14, marginTop: 4 }}>{t.note || "Keine Notiz"}</div>
                        </div>
                        <div style={{ fontWeight: 900, color: t.type === "income" ? "#16a34a" : "#dc2626" }}>{t.type === "income" ? "+" : "-"}{money(t.amount, currency)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "analysis" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px,1fr))", gap: 16 }}>
              <div style={{ ...s.card, padding: 18 }}>
                <SectionTitle title="Ausgaben nach Kategorie" description="Wohin dein Geld wirklich geht" />
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={spendingByCategory} dataKey="value" nameKey="name" outerRadius={100} innerRadius={58} paddingAngle={3}>
                        {spendingByCategory.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => money(value, currency)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ ...s.card, padding: 18 }}>
                <SectionTitle title="Monatsübersicht" description="Vergleich der Hauptbereiche" />
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ name: "Einkommen", value: totals.income }, { name: "Fix", value: totals.fixed }, { name: "Variabel", value: totals.flex }, { name: "Sparen", value: totals.saving }]}> 
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => money(value, currency)} />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div style={{ ...s.card, padding: 18 }}>
              <SectionTitle title="Smarte Hinweise" description="Kleine Analyse, damit du besser sparen kannst" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 12 }}>
                <div style={{ ...s.softCard, background: "#fffbeb", borderColor: "#fde68a" }}><div style={{ fontWeight: 800 }}>Variable Ausgaben im Blick behalten</div><div style={{ fontSize: 14, color: "#52525b", marginTop: 6 }}>Du hast im gewählten Monat {money(totals.flex, currency)} flexibel ausgegeben.</div></div>
                <div style={{ ...s.softCard, background: "#eff6ff", borderColor: "#bfdbfe" }}><div style={{ fontWeight: 800 }}>Monatswechsel aktiv</div><div style={{ fontSize: 14, color: "#52525b", marginTop: 6 }}>Budgets und Zahlen werden pro Monat getrennt angezeigt.</div></div>
                <div style={{ ...s.softCard, background: "#ecfdf5", borderColor: "#bbf7d0" }}><div style={{ fontWeight: 800 }}>Sparkonto-Prognose</div><div style={{ fontSize: 14, color: "#52525b", marginTop: 6 }}>Wenn alles zurückkommt, liegst du bei {money(savingsSummary.projectedNextMonth, currency)}.</div></div>
                <div style={{ ...s.softCard, background: "#f5f3ff", borderColor: "#ddd6fe" }}><div style={{ fontWeight: 800 }}>{weeklyMode ? "Wochenbudget" : "Tagesbudget"}</div><div style={{ fontSize: 14, color: "#52525b", marginTop: 6 }}>Empfohlen: {money(weeklyMode ? monthlyPlan.weeklyFlex : monthlyPlan.dailyFlex, currency)}.</div></div>
              </div>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div style={{ ...s.card, padding: 18 }}>
            <SectionTitle title="Einstellungen" description="Mehr Kontrolle und besseres Verhalten auf dem Handy" />
            <div style={{ ...s.softCard, marginBottom: 16, background: "#eff6ff", borderColor: "#bfdbfe" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 800 }}>Version</div>
                  <div style={{ fontSize: 14, color: "#52525b", marginTop: 4 }}>{appVersion}</div>
                </div>
                <span style={s.badge}>Letztes Update</span>
              </div>
              <div style={{ marginTop: 12 }}>
                {appUpdateNotes.map((note) => (
                  <div key={note} style={{ fontSize: 14, color: "#52525b", marginTop: 6 }}>• {note}</div>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: mobileOnly ? "1fr" : "repeat(auto-fit, minmax(250px,1fr))", gap: 16, minWidth: 0 }}>
              <div style={s.softCard}>
                <div style={{ fontSize: 14, color: "#71717a", marginBottom: 6 }}>Währung</div>
                <select style={s.input} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="CHF">CHF</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div style={s.softCard}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>Wochenbudget-Modus</div>
                    <div style={{ fontSize: 14, color: "#71717a", marginTop: 4 }}>Zeigt lieber pro Woche statt pro Tag</div>
                  </div>
                  <input type="checkbox" checked={weeklyMode} onChange={(e) => setWeeklyMode(e.target.checked)} />
                </div>
              </div>
              <div style={s.softCard}>
                <div style={{ display: "flex", gap: 10, alignItems: "start" }}>
                  <Smartphone size={18} color="#71717a" style={{ marginTop: 3 }} />
                  <div>
                    <div style={{ fontWeight: 800 }}>Handy-Layout verbessert</div>
                    <div style={{ fontSize: 14, color: "#71717a", marginTop: 4 }}>Mehr gestapelte Karten, grössere Touch-Flächen und eine fixe Bottom-Navigation auf kleinen Displays.</div>
                  </div>
                </div>
              </div>
              <div style={s.softCard}>
                <div style={{ display: "flex", gap: 10, alignItems: "start" }}>
                  <Landmark size={18} color="#71717a" style={{ marginTop: 3 }} />
                  <div>
                    <div style={{ fontWeight: 800 }}>Konten sauber getrennt</div>
                    <div style={{ fontSize: 14, color: "#71717a", marginTop: 4 }}>Hauptkonto und Sparkonto können jetzt unabhängig gesetzt und sauber verschoben werden.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {mobileOnly && (
        <div style={s.bottomNav}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
            {[
              ["dashboard", Home],
              ["transactions", CreditCard],
              ["budgets", Target],
              ["goals", Trophy],
              ["calendar", Calendar],
              ["settings", Settings],
            ].map(([id, Icon]) => (
              <button key={id} style={{ ...s.tabButton, background: tab === id ? "#18181b" : "transparent", color: tab === id ? "white" : "#18181b", minHeight: 44 }} onClick={() => setTab(id)}><Icon size={16} /></button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
