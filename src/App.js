import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
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
    "Haushalt",
    "Elektronik",
    "Alkohol",
    "Gesundheit",
    "Kleidung",
    "Versicherung",
    "Sonstiges",
];

const incomeCategories = [
    "Lohn",
    "Bonus",
    "Nebeneinkommen",
    "Zinsen",
    "Rückzahlung",
    "Geschenk",
    "Sonstiges",
];



const STORAGE_KEY = "sigma-finance-app-cra-v2";
const chartColors = ["#22c55e", "#f59e0b", "#ef4444", "#0ea5e9", "#8b5cf6", "#14b8a6"];



// VERSION
  const mobileOnly = typeof window !== "undefined" && window.innerWidth < 640;
  const versionHistory = [
    {
      version: "v4.3",
      name: "Animationen & Micro-Interactions",
      date: "2026-08-21",
      notes: [
        {
          title: "Animationen",
          items: [
            "Tab-Wechsel: Inhalte gleiten mit einem weichen Slide-In rein.",
            "Dashboard-Karten erscheinen gestaffelt nacheinander.",
            "Buttons reagieren mit leichtem Heben und Scale beim Klicken.",
            "Cards heben sich beim Hover leicht ab.",
            "Inputs und Selects haben einen smooth Focus-Glow.",
            "Navigation-Tabs wechseln Farbe und Hintergrund flüssig.",
          ],
        },
      ],
    },
    {
      version: "v4.2",
      name: "Tab-Neustrukturierung",
      date: "2026-08-21",
      notes: [
        {
          title: "Navigation",
          items: [
            "Neuer Tab «Konten»: Hauptkonto, Sparkonto und Ausleihen übersichtlich gebündelt.",
            "Neuer Tab «Sparen»: Sparplan und Sparziele an einem Ort.",
            "«Budgets» zeigt jetzt nur noch die Budgets – klar und fokussiert.",
            "Der frühere «Ziele»-Tab wurde aufgeteilt: Konten → Konten-Tab, Ziele → Sparen-Tab.",
          ],
        },
      ],
    },
    {
      version: "v4.1",
      name: "Persönlicher Hero",
      date: "2026-08-21",
      notes: [
        {
          title: "Personalisierung",
          items: [
            "Benutzername kann bei der Registrierung und in den Einstellungen festgelegt werden.",
            "Hero-Bereich begrüsst dich persönlich: Guten Morgen/Tag/Abend, [Name].",
            "Name wird mit dem Account gespeichert und auf allen Geräten synchronisiert.",
          ],
        },
        {
          title: "Design",
          items: [
            "Login-Animation: Elemente gleiten beim Anmelden sanft rein.",
          ],
        },
      ],
    },
    {
      version: "v4.0",
      name: "Cloud-Sync & Accounts",
      date: "2026-08-21",
      notes: [
        {
          title: "Konten & Synchronisation",
          items: [
            "Neues Login-System mit E-Mail und Passwort.",
            "Daten werden sicher in der Cloud gespeichert (Firebase).",
            "Geräteübergreifende Echtzeit-Synchronisation — Änderungen erscheinen sofort überall.",
            "Registrierung und Anmeldung direkt in der App.",
          ],
        },
      ],
    },
    {
      version: "v3.4",
      name: "Dark Mode & Redesign",
      date: "2026-08-20",
      notes: [
        {
          title: "Design",
          items: [
            "Komplettes Redesign: cleaner, moderner Look mit klarem Farb-System.",
            "Dark Mode: In den Einstellungen zwischen Hell und Dunkel wechseln.",
            "Neue Top-Navigation auf Desktop — übersichtlicher als Tab-Leiste.",
            "Farben, Abstände und Typografie komplett überarbeitet.",
          ],
        },
      ],
    },
    {
      version: "v3.3",
      name: "Jährliche Fixkosten",
      date: "2026-06-09",
      notes: [
        {
          title: "Wiederkehrende Ausgaben",
          items: [
            "Fixkosten können jetzt als jährlich oder monatlich angelegt werden.",
            "Bei jährlichen Ausgaben wählt man zusätzlich den Monat.",
            "Die Buchung wird automatisch im richtigen Monat erstellt.",
          ],
        },
      ],
    },
    {
      version: "v3.2",
      name: "Header überarbeitet",
      date: "2026-06-09",
      notes: [
        {
          title: "Design",
          items: [
            "Slogan wurde auf 'Secure. Smart. Simple.' aktualisiert.",
            "Haupttitel lautet neu 'Dein Geld. Deine Kontrolle.'",
            "Untertitel wurde vereinfacht und auf den Punkt gebracht.",
          ],
        },
      ],
    },
    {
      version: "v3.1",
      name: "Mobile Fixes",
      date: "2026-06-09",
      notes: [
        {
          title: "Mobile Layout",
          items: [
            "Navbar bleibt jetzt zuverlässig unten — iOS Safari Bug behoben.",
            "Das schwarze Header-Feld geht jetzt über die ganze Breite.",
            "Version History hat nun korrekten Abstand und läuft nicht mehr rechts raus.",
            "Der 'Monatsanfang ausgleichen'-Button bricht jetzt sauber auf zwei Zeilen um.",
          ],
        },
      ],
    },
    {
      version: "v2.9",
      name: "App-Updates",
      date: "2026-06-07",
      notes: [
        {
          title: "PWA / Homescreen",
          items: [
            "Die App erkennt automatisch wenn eine neue Version verfügbar ist.",
            "Ein Banner erscheint mit dem Button 'Jetzt aktualisieren'.",
            "Daten bleiben beim Update vollständig erhalten.",
          ],
        },
      ],
    },
    {
      version: "v2.8",
      name: "Fixkosten Bearbeitung verbessert",
      date: "2026-06-09",
      notes: [
        {
          title: "Wiederkehrende Ausgaben",
          items: [
            "Beim Bearbeiten werden jetzt Kategorie- und Zahlungstag-Dropdowns angezeigt.",
            "Doppelte Anzeige beim Bearbeiten wurde behoben.",
            "Speichern- und Abbrechen-Buttons sind jetzt korrekt gestylt.",
          ],
        },
      ],
    },
    {
      version: "v2.7",
      name: "Sparplan",
      date: "2026-06-07",
      notes: [
        {
          title: "Budgets",
          items: [
            "Sparen wird nicht mehr als normales Budget angezeigt.",
            "Neuer Sparplan-Bereich oben im Budget-Tab mit positivem Fortschritt.",
            "Status: 'Auf Kurs', 'Fast erreicht', 'Ziel erreicht' statt Warnung.",
          ],
        },
      ],
    },
    {
      version: "v2.6",
      name: "Restbudget aufs Sparkonto",
      date: "2026-06-07",
      notes: [
        {
          title: "Dashboard",
          items: [
            "Am Ende des Finanzmonats erscheint ein Banner, wenn Budget übrig ist.",
            "Mit einem Klick wird das Restbudget direkt aufs Sparkonto gebucht.",
            "Hauptkonto wird reduziert, Sparkonto erhöht und eine Transaktion erstellt.",
          ],
        },
      ],
    },
    {
      version: "v2.5",
      name: "Flexibler Finanzmonat",
      date: "2026-06-07",
      notes: [
        {
          title: "Einstellungen",
          items: [
            "Der Finanzmonat kann jetzt individuell festgelegt werden.",
            "In den Einstellungen lässt sich der Starttag des Monats (z.B. Lohntag) auswählen.",
            "Alle Auswertungen, Budgets und das Dashboard berücksichtigen den gewählten Starttag.",
          ],
        },
      ],
    },
    {
      version: "v2.4",
      name: "Versions-Übersicht",
      date: "2026-05-01",
      notes: [
        {
          title: "Versionen",
          items: [
            "Alle Updates sind einsehbar, damit man einsehen kann, was bei welchem Update gemacht wurde.",
            "Die Updates sind ein- & ausklappbar für eine bessere Übersicht.",
          ],
        },
      ],
    },
    {
      version: "v2.3",
      name: "Fixkosten Bearbeitung",
      date: "2026-04-29",
      notes: [
        {
          title: "Wiederkehrende Ausgaben",
          items: [
            "Bereits erstellte Fixkosten können jetzt bearbeitet werden.",
            "Betrag, Kategorie und Zahlungstag können angepasst werden.",
          ],
        },
        {
          title: "Navigation",
          items: [
            "Demo-Button wurde entfernt.",
            "App ist dadurch sicherer gegen versehentliches Zurücksetzen.",
          ],
        },
      ],
    },
    {
      version: "v2.2",
      name: "Neuer Titel | Budget Überarbeitung",
      date: "2026-04-28",
      notes: [
        {
          title: "Design",
          items: [
            "Neuer Titel zur FKB wurde hinzugefügt.",
            "Zusätzlich wurde ein vielversprechender Slogan ergänzt.",
          ],
        },
        {
          title: "Budget Überarbeitung",
          items: [
            "Kategorien sind jetzt in einem Dropdown-Menü auswählbar.",
            "Es ist ein Zeitpunkt wählbar, an welchem die Zahlung ausgeführt wird.",
          ],
        },
      ],
    },
    {
      version: "v2.1",
      name: "Mobile-Polish",
      date: "2026-04-23",
      notes: [
        {
          title: "Mobile-Version Überarbeitung",
          items: [
            "Mobile Layout bei mehreren Bereichen verbessert",
            "Keine Überlappungen mehr",
            "Übersichtlichere Tabs",
          ],
        },
        {
          title: "Features verbessert",
          items: [
            "Hauptkonto und Sparkonto sauber getrennt",
            "Sparkonto-Ausleihen besser integriert",
            "Update-Bereich in den Einstellungen hinzugefügt",
          ],
        },
      ],
    },
    {
      version: "v1.1",
      name: "Logo Überarbeitung",
      date: "2026-04-22",
      notes: [
        {
          title: "Logo",
          items: [
            "Neues Logo wurde hinzugefügt",
          ],
        },
      ],
    },
    {
      version: "v1.0",
      name: "Grundapp",
      date: "2026-04-22",
      notes: [
        {
          title: "Funktionen",
          items: [
            "Dashboard",
            "Buchungen",
            "Budgets",
            "Ziele",
            "Kalender",
            "Analyse",
            "Settings",
          ],
        },
      ],
    },

    /*
    {
      version: "v2.5",
      name: "Sparsystem Update",
      date: "2026-04-30",
      notes: [
        {
          title: "Sparen",
          items: [
            "Sparen wird nicht mehr als negatives Budget angezeigt." "Fynn Tschäppät hohmadstrass 39c Thun 3600",
            "Neuer Sparplan-Bereich wurde hinzugefügt.",
          ],
        },
        {
          title: "Design",
          items: [
            "Budget-Anzeigen wurden verständlicher gemacht.",
          ],
        },
      ],
    },
    */

  ];





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
  settings: { currency: "CHF", weeklyMode: true, monthOffset: 0, payday: 25, darkMode: false, username: "" },
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

function getMonthBounds(offset = 0, payday = 1) {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);

  let start = new Date(base.getFullYear(), base.getMonth(), payday);
  const todayLike = new Date(now.getFullYear(), now.getMonth(), payday);

  if (offset === 0 && now < todayLike) {
    start = new Date(base.getFullYear(), base.getMonth() - 1, payday);
  }

  if (offset !== 0) {
    start = new Date(base.getFullYear(), base.getMonth(), payday);
  }

  const end = new Date(start.getFullYear(), start.getMonth() + 1, payday);
  end.setMilliseconds(end.getMilliseconds() - 1);

  return { start, end };
}

function inSelectedMonth(dateString, offset, payday = 1) {
  const date = new Date(dateString);
  const { start, end } = getMonthBounds(offset, payday);
  return date >= start && date <= end;
}

function clampDay(day) {
  return Math.max(1, Math.min(28, Number(day) || 1));
}

function getRecurringDateForMonth(monthDate, dayOfMonth) {
  return new Date(monthDate.getFullYear(), monthDate.getMonth(), clampDay(dayOfMonth)).toISOString().slice(0, 10);
}

function getBudgetSpentForRange(transactions, budget, monthOffset, payday) {
  const base = transactions.filter(
    (t) => t.type === "expense" && t.category.toLowerCase() === budget.name.toLowerCase()
  );

  if (budget.resetMode === "manual") {
    return base.reduce((sum, t) => sum + Number(t.amount), 0);
  }

  return base
    .filter((t) => inSelectedMonth(t.date, monthOffset, payday))
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

function getGoalProgress(goal) {
  if (!goal.target || goal.target <= 0) return 0;
  return Math.min((goal.current / goal.target) * 100, 100);
}

function getBudgetStatus(progress, dark = false) {
  if (progress >= 100) return { label: "Überschritten", color: dark ? "#fca5a5" : "#be123c", bg: dark ? "rgba(220,38,38,0.12)" : "#fff1f2", border: dark ? "rgba(220,38,38,0.25)" : "#fecdd3" };
  if (progress >= 90)  return { label: "Fast leer",     color: dark ? "#fca5a5" : "#be123c", bg: dark ? "rgba(220,38,38,0.12)" : "#fff1f2", border: dark ? "rgba(220,38,38,0.25)" : "#fecdd3" };
  if (progress >= 75)  return { label: "Achtung",       color: dark ? "#fcd34d" : "#b45309", bg: dark ? "rgba(202,138,4,0.12)"  : "#fffbeb", border: dark ? "rgba(202,138,4,0.25)"  : "#fde68a" };
  return                      { label: "Stabil",        color: dark ? "#86efac" : "#15803d", bg: dark ? "rgba(22,163,74,0.12)"  : "#f0fdf4", border: dark ? "rgba(22,163,74,0.25)"  : "#bbf7d0" };
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

function styles(dark = false, mobile = false) {
  const c = {
    bg:           dark ? "#111113"                    : "#f4f4f5",
    surface:      dark ? "#1c1c1f"                    : "#ffffff",
    surfaceAlt:   dark ? "#242428"                    : "#f9f9fb",
    border:       dark ? "rgba(255,255,255,0.09)"     : "#e4e4e7",
    borderSubtle: dark ? "rgba(255,255,255,0.05)"     : "rgba(0,0,0,0.04)",
    text:         dark ? "#f4f4f5"                    : "#18181b",
    textMuted:    dark ? "#a1a1aa"                    : "#71717a",
    textSubtle:   dark ? "#71717a"                    : "#52525b",
    inputBg:      dark ? "#2a2a2e"                    : "#ffffff",
    inputBorder:  dark ? "rgba(255,255,255,0.12)"     : "#d4d4d8",
    btnSecBg:     dark ? "#2a2a2e"                    : "#ffffff",
    btnSecBorder: dark ? "rgba(255,255,255,0.12)"     : "#d4d4d8",
    shadow:       dark ? "0 8px 28px rgba(0,0,0,0.5)": "0 4px 16px rgba(0,0,0,0.06)",
    navBg:        dark ? "#1c1c1f"                    : "#ffffff",
    navBorder:    dark ? "rgba(255,255,255,0.07)"     : "#e4e4e7",
    progressBg:   dark ? "rgba(255,255,255,0.1)"      : "#e4e4e7",
  };
  return {
    // Color tokens exposed for inline styles
    bg: c.bg, surface: c.surface, surfaceAlt: c.surfaceAlt,
    border: c.border, text: c.text, textMuted: c.textMuted, textSubtle: c.textSubtle, btnSecBg: c.btnSecBg,
    app: {
      minHeight: "100vh",
      background: c.bg,
      color: c.text,
      fontFamily: "Inter, system-ui, sans-serif",
    },
    container: {
      maxWidth: 1400,
      margin: "0 auto",
      padding: mobile ? "12px 12px 96px" : "16px 16px 96px",
    },
    topNav: {
      background: c.navBg,
      borderBottom: `1px solid ${c.navBorder}`,
      position: "sticky",
      top: 0,
      zIndex: 40,
      boxShadow: dark ? "0 1px 12px rgba(0,0,0,0.4)" : "0 1px 8px rgba(0,0,0,0.05)",
    },
    topNavInner: {
      maxWidth: 1400,
      margin: "0 auto",
      padding: mobile ? "0 12px" : "0 16px",
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: 56,
    },
    topNavLogo: {
      fontSize: 13,
      fontWeight: 800,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: c.text,
      marginRight: 16,
      whiteSpace: "nowrap",
    },
    hero: {
      background: "linear-gradient(135deg, #09090b, #18181b 55%, #27272a)",
      color: "white",
      borderRadius: 20,
      padding: mobile ? 20 : 28,
      overflow: "hidden",
    },
    card: {
      background: c.surface,
      borderRadius: 18,
      boxShadow: c.shadow,
      border: `1px solid ${c.borderSubtle}`,
      transition: "box-shadow 0.2s ease",
    },
    softCard: {
      background: c.surfaceAlt,
      borderRadius: 14,
      border: `1px solid ${c.border}`,
      padding: mobile ? 12 : 16,
      minWidth: 0,
      overflowWrap: "anywhere",
      transition: "background 0.15s ease",
    },
    input: {
      width: "100%",
      height: 44,
      borderRadius: 12,
      border: `1px solid ${c.inputBorder}`,
      padding: "0 14px",
      background: c.inputBg,
      color: c.text,
      fontSize: 14,
      boxSizing: "border-box",
      minWidth: 0,
    },
    button: {
      height: 44,
      borderRadius: 12,
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
      borderRadius: 12,
      border: `1px solid ${c.btnSecBorder}`,
      padding: mobile ? "0 12px" : "0 16px",
      background: c.btnSecBg,
      color: c.text,
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
      border: `1px solid ${c.border}`,
      background: c.surfaceAlt,
      color: c.text,
    },
    tabButton: {
      minHeight: 44,
      borderRadius: 10,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 13,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      padding: "0 12px",
      color: c.textMuted,
      whiteSpace: "nowrap",
      transition: "background 0.15s ease, color 0.15s ease, transform 0.13s ease",
    },
    bottomNav: {
      position: "fixed",
      left: 0,
      right: 0,
      bottom: 0,
      background: c.navBg,
      borderTop: `1px solid ${c.navBorder}`,
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
      height: 8,
      background: c.progressBg,
      borderRadius: 999,
      overflow: "hidden",
      marginTop: 10,
    },
  };
}

function ProgressBar({ value, color = "#18181b", dark = false }) {
  return (
    <div style={styles(dark).progressWrap}>
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

function StatCard({ title, value, subValue, hint, icon: Icon, gradient, className }) {
  return (
    <div style={{ ...styles().card, overflow: "hidden" }} className={`fkb-card-hover${className ? " " + className : ""}`}>
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
  const fileInputRef = useRef(null);

  // Auth
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

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
  const [restbudgetDismissed, setRestbudgetDismissed] = useState(false);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);

  const [payday, setPayday] = useState(seedData.settings.payday);
  const [darkMode, setDarkMode] = useState(seedData.settings.darkMode);
  const [username, setUsername] = useState(seedData.settings.username);
  const [authStep, setAuthStep] = useState(1);
  const [authUsername, setAuthUsername] = useState("");
  const s = styles(darkMode, mobileOnly);

  const [newTransaction, setNewTransaction] = useState({ type: "expense", category: "Essen", amount: "", note: "", date: new Date().toISOString().slice(0, 10), bucket: "flex", targetAccount: "main" });
  const [newBudget, setNewBudget] = useState({ name: "", limit: "", resetMode: "monthly" });
  const [newRecurring, setNewRecurring] = useState({ title: "", amount: "", category: "", bucket: "fixed", type: "expense", dayOfMonth: "1", frequency: "monthly", monthOfYear: 1, note: "" });
  const [newGoal, setNewGoal] = useState({ name: "", target: "", current: "0" });
  const [goalContribution, setGoalContribution] = useState({});
  const [savingsTransfer, setSavingsTransfer] = useState({ type: "deposit", amount: "", note: "" });
  const [borrowForm, setBorrowForm] = useState({ amount: "", interest: "", note: "" });

  const selectedMonthDate = useMemo(() => getShiftedMonthDate(monthOffset), [monthOffset]);
  const selectedMonthKey = useMemo(() => getMonthKey(selectedMonthDate), [selectedMonthDate]);
  const selectedMonthLabel = useMemo(() => new Intl.DateTimeFormat("de-CH", { month: "long", year: "numeric" }).format(selectedMonthDate), [selectedMonthDate]);

const selectedPeriodLabel = useMemo(() => {
  const { start, end } = getMonthBounds(monthOffset, payday);

  const format = (date) =>
    new Intl.DateTimeFormat("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);

  return `${format(start)} – ${format(end)}`;
}, [monthOffset, payday]);

const [editingRecurringId, setEditingRecurringId] = useState(null);
const [editRecurring, setEditRecurring] = useState({
  title: "",
  amount: "",
  category: "",
  dayOfMonth: 1,
  frequency: "monthly",
  monthOfYear: 1,
});



const [openVersions, setOpenVersions] = useState({
  __block: false,
  [versionHistory[0].version]: true,
});

  useEffect(() => {
    const handler = () => setSwUpdateAvailable(true);
    window.addEventListener('swUpdateAvailable', handler);
    return () => window.removeEventListener('swUpdateAvailable', handler);
  }, []);

  const loadFromParsed = useCallback((parsed, fromRemote = false) => {
    if (fromRemote) skipNextWrite.current = true;
    if (parsed.transactions) setTransactions(parsed.transactions);
    if (parsed.budgets) setBudgets(parsed.budgets);
    if (parsed.recurring) setRecurring(parsed.recurring);
    if (parsed.goals) setGoals(parsed.goals);
    if (parsed.mainAccount) setMainAccount(parsed.mainAccount);
    if (parsed.savingsAccount) setSavingsAccount(parsed.savingsAccount);
    if (parsed.settings?.currency) setCurrency(parsed.settings.currency);
    if (typeof parsed.settings?.weeklyMode === "boolean") setWeeklyMode(parsed.settings.weeklyMode);
    if (typeof parsed.settings?.monthOffset === "number") setMonthOffset(parsed.settings.monthOffset);
    if (typeof parsed.settings?.payday === "number") setPayday(parsed.settings.payday);
    if (typeof parsed.settings?.darkMode === "boolean") setDarkMode(parsed.settings.darkMode);
    if (parsed.settings?.username) setUsername(parsed.settings.username);
  }, []);

  // Auth state listener — Echtzeit-Sync via onSnapshot
  useEffect(() => {
    let unsubSnapshot = null;
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (unsubSnapshot) { unsubSnapshot(); unsubSnapshot = null; }
      if (u) {
        unsubSnapshot = onSnapshot(doc(db, "users", u.uid), (snap) => {
          if (snap.exists()) {
            loadFromParsed(snap.data(), true);
          } else {
            try {
              const raw = localStorage.getItem(STORAGE_KEY);
              if (raw) loadFromParsed(JSON.parse(raw));
            } catch {}
          }
          setAuthLoading(false);
          setDataLoaded(true);
        }, (e) => { console.error(e); setAuthLoading(false); setDataLoaded(true); });
      } else {
        setAuthLoading(false);
        setDataLoaded(false);
      }
    });
    return () => { unsubAuth(); if (unsubSnapshot) unsubSnapshot(); };
  }, [loadFromParsed]);

  const skipNextWrite = useRef(false);

  // Firestore-Sync bei jeder Datenänderung (nur wenn eingeloggt, nicht beim Empfangen)
  useEffect(() => {
    if (!user || !dataLoaded) return;
    if (skipNextWrite.current) { skipNextWrite.current = false; return; }
    const data = {
      transactions, budgets, recurring, goals, mainAccount, savingsAccount,
      settings: { currency, weeklyMode, monthOffset, payday, darkMode, username },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setDoc(doc(db, "users", user.uid), data).catch(console.error);
  }, [user, dataLoaded, transactions, budgets, recurring, goals, mainAccount, savingsAccount, currency, weeklyMode, monthOffset, payday, darkMode, username]);

  useEffect(() => {
    // Nur Einträge die wirklich dran sind (jährliche nur im richtigen Monat)
    const recurringToApply = recurring.filter((r) => {
      if (!r.active || r.lastAppliedMonth === selectedMonthKey) return false;
      if (r.frequency === "yearly") return (r.monthOfYear || 1) === selectedMonthDate.getMonth() + 1;
      return true;
    });
    if (recurringToApply.length === 0) return;

    // Berechnung komplett vor den State-Updates
    const newTransactions = [];
    const updatedItems = new Map();
    for (const r of recurringToApply) {
      const autoDate = getRecurringDateForMonth(selectedMonthDate, r.dayOfMonth);
      const transactionExists = transactions.some((t) => t.note === `[AUTO] ${r.title}` && t.date === autoDate && t.amount === Number(r.amount) && t.category === r.category && t.bucket === r.bucket);
      if (!transactionExists) {
        newTransactions.push({ id: Date.now() + Math.random(), type: r.type, category: r.category, amount: Number(r.amount), note: `[AUTO] ${r.title}`, date: autoDate, bucket: r.bucket });
      }
      updatedItems.set(r.id, { ...r, lastAppliedMonth: selectedMonthKey });
    }

    // Functional updater: arbeitet immer mit dem aktuellsten Stand
    setRecurring((prev) => prev.map((r) => updatedItems.has(r.id) ? updatedItems.get(r.id) : r));
    if (newTransactions.length > 0) setTransactions((prev) => [...newTransactions, ...prev]);
  }, [selectedMonthKey, selectedMonthDate, recurring, transactions]);

  const monthTransactions = useMemo(
    () => transactions.filter((t) => inSelectedMonth(t.date, monthOffset, payday)),
    [transactions, monthOffset, payday]
  );

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
    const spent = getBudgetSpentForRange(transactions, b, monthOffset, payday);
    const progress = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;
    return { ...b, spent, remaining: b.limit - spent, progress, status: getBudgetStatus(progress, darkMode) };
  }), [budgets, transactions, monthOffset, payday, darkMode]);

  const dangerBudgets = useMemo(() => budgetsWithSpent.filter((b) => b.progress >= 75), [budgetsWithSpent]);

  const totalBudgetRemaining = useMemo(() => budgetsWithSpent.reduce((sum, b) => sum + Math.max(b.remaining, 0), 0), [budgetsWithSpent]);

  const daysUntilMonthEnd = useMemo(() => {
    const { end } = getMonthBounds(0, payday);
    return Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
  }, [payday]);

  const savingPlanStatus = useMemo(() => {
    const goal = Number(savingsAccount.plannedMonthlyDeposit || 0);
    const actual = totals.saving;
    const progress = goal > 0 ? Math.min((actual / goal) * 100, 999) : 0;
    let label, color, bg, border;
    if (progress >= 100) { label = "Ziel erreicht 🎉"; color = darkMode ? "#fcd34d" : "#b45309"; bg = darkMode ? "rgba(202,138,4,0.12)" : "#fffbeb"; border = darkMode ? "rgba(202,138,4,0.25)" : "#fde68a"; }
    else if (progress >= 75) { label = "Fast erreicht"; color = darkMode ? "#93c5fd" : "#1d4ed8"; bg = darkMode ? "rgba(29,78,216,0.12)" : "#eff6ff"; border = darkMode ? "rgba(29,78,216,0.25)" : "#bfdbfe"; }
    else if (progress >= 25) { label = "Auf Kurs"; color = darkMode ? "#86efac" : "#15803d"; bg = darkMode ? "rgba(22,163,74,0.12)" : "#f0fdf4"; border = darkMode ? "rgba(22,163,74,0.25)" : "#bbf7d0"; }
    else { label = "Noch am Start"; color = darkMode ? "#a1a1aa" : "#71717a"; bg = darkMode ? "rgba(255,255,255,0.05)" : "#fafafa"; border = darkMode ? "rgba(255,255,255,0.09)" : "#e4e4e7"; }
    return { goal, actual, progress, label, color, bg, border };
  }, [savingsAccount.plannedMonthlyDeposit, totals.saving, darkMode]);

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
    const txn = { id: Date.now(), ...newTransaction, amount, affectsAccount: true };
    setTransactions((prev) => [txn, ...prev]);
    if (newTransaction.type === "income") {
      if (newTransaction.targetAccount === "savings") {
        setSavingsAccount((p) => ({ ...p, balance: p.balance + amount }));
      } else {
        setMainAccount((p) => ({ ...p, balance: p.balance + amount }));
      }
    } else {
      setMainAccount((p) => ({ ...p, balance: p.balance - amount }));
    }
    setNewTransaction({ type: "expense", category: "Essen", amount: "", note: "", date: new Date().toISOString().slice(0, 10), bucket: "flex", targetAccount: "main" });
  }

  function deleteTransaction(id) {
    const txn = transactions.find((t) => t.id === id);
    if (txn && txn.affectsAccount) {
      const amount = Number(txn.amount);
      if (txn.type === "income") {
        if (txn.targetAccount === "savings") {
          setSavingsAccount((p) => ({ ...p, balance: p.balance - amount }));
        } else {
          setMainAccount((p) => ({ ...p, balance: p.balance - amount }));
        }
      } else {
        setMainAccount((p) => ({ ...p, balance: p.balance + amount }));
      }
    }
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
    setNewRecurring({ title: "", amount: "", category: "", bucket: "fixed", type: "expense", dayOfMonth: "1", frequency: "monthly", monthOfYear: 1, note: "" });
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

  function handleAppUpdate() {
    if (window.__swWaiting) {
      window.__swWaiting.postMessage({ type: 'SKIP_WAITING' });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }

  function handleBookRestbudget() {
    if (totalBudgetRemaining <= 0) return;
    const today = new Date().toISOString().slice(0, 10);

    setMainAccount((prev) => ({ ...prev, balance: Math.max(Number(prev.balance || 0) - totalBudgetRemaining, 0) }));
    setSavingsAccount((prev) => ({ ...prev, balance: Number(prev.balance || 0) + totalBudgetRemaining }));
    setTransactions((prev) => [{ id: Date.now() + Math.random(), type: "expense", category: "Restbudget gespart", amount: totalBudgetRemaining, note: "Restbudget vom Monat aufs Sparkonto", date: today, bucket: "saving" }, ...prev]);
    setRestbudgetDismissed(true);
  }

  function exportData() {
    downloadJson(`sigma-finance-${selectedMonthKey}.json`, { exportedAt: new Date().toISOString(), version: 2, transactions, budgets, recurring, goals, mainAccount, savingsAccount, settings: { currency, weeklyMode, monthOffset, payday, darkMode } });
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
        // Direkt in Firestore schreiben damit andere Geräte sofort sync bekommen
        if (user) {
          const data = {
            transactions: parsed.transactions ?? [],
            budgets: parsed.budgets ?? [],
            recurring: parsed.recurring ?? [],
            goals: parsed.goals ?? [],
            mainAccount: parsed.mainAccount ?? seedData.mainAccount,
            savingsAccount: parsed.savingsAccount ?? seedData.savingsAccount,
            settings: { ...seedData.settings, ...parsed.settings },
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          setDoc(doc(db, "users", user.uid), data).catch(console.error);
        }
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

function toggleVersion(version) {
  setOpenVersions((prev) => ({
    ...prev,
    [version]: !prev[version],
  }));
}



  const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

  async function handleAuth() {
    if (authMode === "register" && authStep === 1) {
      if (!authEmail || !authPassword) { setAuthError("Bitte E-Mail und Passwort eingeben."); return; }
      setAuthStep(2);
      setAuthError("");
      return;
    }
    setAuthBusy(true);
    setAuthError("");
    try {
      if (authMode === "login") {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        if (authUsername.trim()) setUsername(authUsername.trim());
      }
    } catch (e) {
      const msgs = { "auth/invalid-email": "Ungültige E-Mail-Adresse.", "auth/user-not-found": "Kein Konto mit dieser E-Mail.", "auth/wrong-password": "Falsches Passwort.", "auth/email-already-in-use": "E-Mail wird bereits verwendet.", "auth/weak-password": "Passwort muss mindestens 6 Zeichen haben.", "auth/invalid-credential": "E-Mail oder Passwort falsch." };
      setAuthError(msgs[e.code] || e.message);
      setAuthStep(1);
    }
    setAuthBusy(false);
  }




  // Auth laden
  if (authLoading) {
    return <div style={{ minHeight: "100vh", background: "#111113", display: "grid", placeItems: "center" }}><div style={{ color: "#a1a1aa", fontSize: 14 }}>Laden…</div></div>;
  }

  // Login / Register Screen
  if (!user) {
    const inputStyle = { width: "100%", height: 44, borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", padding: "0 14px", background: "#2a2a2e", color: "#f4f4f5", fontSize: 14, boxSizing: "border-box" };
    return (
      <div style={{ minHeight: "100vh", background: "#111113", display: "grid", placeItems: "center", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ width: "100%", maxWidth: 400, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#f4f4f5", marginBottom: 8 }}>FKB</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#f4f4f5", marginBottom: 4 }}>{authMode === "login" ? "Anmelden" : "Registrieren"}</div>
          <div style={{ fontSize: 14, color: "#71717a", marginBottom: 28 }}>Deine Daten werden sicher in der Cloud gespeichert.</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "#1c1c1f", borderRadius: 14, padding: 4 }}>
            {["login", "register"].map((m) => (
              <button key={m} onClick={() => { setAuthMode(m); setAuthError(""); setAuthStep(1); }} style={{ flex: 1, height: 38, borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: authMode === m ? "#f4f4f5" : "transparent", color: authMode === m ? "#18181b" : "#71717a" }}>
                {m === "login" ? "Anmelden" : "Registrieren"}
              </button>
            ))}
          </div>
          {authMode === "register" && authStep === 2 ? (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ fontSize: 14, color: "#a1a1aa", marginBottom: 4 }}>Fast geschafft! Wie sollen wir dich nennen?</div>
              <div><div style={{ fontSize: 12, fontWeight: 600, color: "#71717a", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Dein Name</div><input style={inputStyle} type="text" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} placeholder="z.B. Jeffrey" onKeyDown={(e) => e.key === "Enter" && handleAuth()} autoFocus /></div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              <div><div style={{ fontSize: 12, fontWeight: 600, color: "#71717a", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>E-Mail</div><input style={inputStyle} type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="deine@email.ch" /></div>
              <div><div style={{ fontSize: 12, fontWeight: 600, color: "#71717a", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Passwort</div><input style={inputStyle} type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === "Enter" && handleAuth()} /></div>
            </div>
          )}
          {authError && <div style={{ marginTop: 12, fontSize: 13, color: "#fca5a5", background: "rgba(220,38,38,0.1)", borderRadius: 10, padding: "10px 14px" }}>{authError}</div>}
          <button onClick={handleAuth} disabled={authBusy} style={{ marginTop: 20, width: "100%", height: 48, borderRadius: 12, border: "none", background: "#f4f4f5", color: "#18181b", fontWeight: 700, fontSize: 15, cursor: authBusy ? "not-allowed" : "pointer", opacity: authBusy ? 0.7 : 1 }}>
            {authBusy ? "Bitte warten…" : authMode === "login" ? "Anmelden" : authStep === 1 ? "Weiter" : "Konto erstellen"}
          </button>
          <div style={{ marginTop: 16, fontSize: 12, color: "#52525b", textAlign: "center", lineHeight: 1.6 }}>Deine Daten werden geräteübergreifend synchronisiert.</div>
        </div>
      </div>
    );
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Guten Morgen";
    if (h < 18) return "Guten Tag";
    return "Guten Abend";
  })();

  return (
    <div style={s.app}>
      <style>{`
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tabIn { from { opacity: 0; transform: translateY(18px) scale(0.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        .fkb-nav { animation: slideInUp 0.4s ease both; }
        .fkb-hero { animation: fadeIn 0.5s ease 0.1s both; }
        .fkb-hero-text { animation: slideInLeft 0.5s ease 0.2s both; }
        .fkb-hero-actions { animation: slideInRight 0.5s ease 0.2s both; }
        .fkb-content { animation: slideInUp 0.5s ease 0.3s both; }

        /* Tab-Wechsel Animation */
        .fkb-tab-page { animation: tabIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* Button Transitions */
        button {
          transition: transform 0.13s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.13s ease,
                      opacity 0.13s ease,
                      background 0.15s ease;
        }
        button:hover { transform: translateY(-1px); opacity: 0.9; }
        button:active { transform: scale(0.96) translateY(0) !important; opacity: 1 !important; }

        /* Nav-Tab Buttons */
        .fkb-tab-btn:hover { opacity: 0.7 !important; transform: translateY(-1px) !important; }
        .fkb-tab-btn-active:hover { opacity: 1 !important; transform: none !important; }

        /* Primary Button Glow */
        .fkb-btn-primary:hover { opacity: 1 !important; transform: translateY(-2px) !important; box-shadow: 0 8px 20px rgba(24,24,27,0.35) !important; }

        /* Card Hover Lift */
        .fkb-card-hover {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
          cursor: default;
        }
        .fkb-card-hover:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.13); }

        /* Input / Select Focus */
        input, select, textarea {
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        input:focus, select:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(24,24,27,0.1);
        }

        /* Stat cards pop-in stagger */
        .fkb-stat-0 { animation: popIn 0.3s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
        .fkb-stat-1 { animation: popIn 0.3s cubic-bezier(0.16,1,0.3,1) 0.12s both; }
        .fkb-stat-2 { animation: popIn 0.3s cubic-bezier(0.16,1,0.3,1) 0.19s both; }
        .fkb-stat-3 { animation: popIn 0.3s cubic-bezier(0.16,1,0.3,1) 0.26s both; }
        .fkb-stat-4 { animation: popIn 0.3s cubic-bezier(0.16,1,0.3,1) 0.33s both; }

        /* Bottom nav buttons no hover shift */
        .fkb-bottom-nav button:hover { transform: none; opacity: 0.75; }
        .fkb-bottom-nav button:active { transform: scale(0.9) !important; }

        /* Soft card subtle hover */
        .fkb-soft-hover {
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .fkb-soft-hover:hover { transform: translateY(-1px); }
      `}</style>
      {!mobileOnly && (
        <div style={s.topNav} className="fkb-nav">
          <div style={s.topNavInner}>
            <div style={s.topNavLogo}>FKB</div>
            {[
              ["dashboard", Home, "Dashboard"],
              ["transactions", CreditCard, "Buchungen"],
              ["konten", Wallet, "Konten"],
              ["budgets", Target, "Budgets"],
              ["sparen", TrendingUp, "Sparen"],
              ["calendar", Calendar, "Kalender"],
              ["analysis", BarChart3, "Analyse"],
              ["settings", Settings, "Settings"],
            ].map(([id, Icon, label]) => (
              <button key={id} onClick={() => setTab(id)} className={tab === id ? "fkb-tab-btn-active" : "fkb-tab-btn"} style={{ ...s.tabButton, background: tab === id ? (darkMode ? "rgba(255,255,255,0.1)" : "#f4f4f5") : "transparent", color: tab === id ? s.text : s.textMuted, fontWeight: tab === id ? 700 : 500 }}>
                <Icon size={15} /> {label}
              </button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: s.textMuted, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</span>
              <button onClick={() => signOut(auth)} style={{ ...s.buttonSecondary, height: 34, padding: "0 12px", fontSize: 12 }}>Abmelden</button>
            </div>
          </div>
        </div>
      )}

      <div style={s.container}>
        <div style={s.hero} className="fkb-hero">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <div className="fkb-hero-text">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", opacity: 0.65 }}>Fynn Kantonal Bank</div>
                <span style={{ ...s.badge, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}>Secure. Smart. Simple.</span>
              </div>
              <div style={{ fontSize: 38, fontWeight: 900, marginTop: 10, lineHeight: 1.05 }}>
                {username ? `${greeting}, ${username}.` : "Dein Geld. Deine Kontrolle."}
              </div>
              <div style={{ marginTop: 10, maxWidth: 760, color: "rgba(255,255,255,0.78)", fontSize: 15 }}>
                {username ? "Dein Geld. Deine Kontrolle." : "Einnahmen, Ausgaben und Sparziele — alles auf einen Blick."}
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} className="fkb-hero-actions">
              <button style={s.buttonSecondary} onClick={() => setMonthOffset((m) => m - 1)}><ChevronLeft size={16} /> Voriger</button>
              <button style={s.buttonSecondary} onClick={() => setMonthOffset((m) => m + 1)}>Nächster <ChevronRight size={16} /></button>
              <button style={s.buttonSecondary} onClick={() => setMonthOffset(0)}>Heute</button>
              <button style={{ ...s.button, background: "white", color: "#18181b" }} className="fkb-btn-primary" onClick={() => setTab("transactions")}><Plus size={16} /> Neue Buchung</button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <div style={{ color: "#71717a", fontSize: 14 }}>Aktiver Monat</div>
            <div style={{ fontSize: 28, fontWeight: 900, textTransform: "capitalize" }}>{selectedMonthLabel}</div>
            <div style={{ color: "#71717a", fontSize: 14, marginTop: 4 }}>
              Zeitraum: {selectedPeriodLabel}
            </div>
          </div>
        </div>


        {swUpdateAvailable && (
          <div style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius: 20, padding: "14px 18px", marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>🆕 Neue Version verfügbar</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...s.button, background: "white", color: "#312e81", fontWeight: 800 }} onClick={handleAppUpdate}>Jetzt aktualisieren</button>
              <button style={{ ...s.button, background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.3)" }} onClick={() => setSwUpdateAvailable(false)}>Später</button>
            </div>
          </div>
        )}


        <div className="fkb-content">
        <div key={tab} className="fkb-tab-page">
        {tab === "dashboard" && (
          <>
            {dangerBudgets.length > 0 && (
              <div style={{ ...s.card, background: darkMode ? "rgba(202,138,4,0.12)" : "#fffbeb", border: `1px solid ${darkMode ? "rgba(202,138,4,0.25)" : "#fde68a"}`, padding: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <AlertTriangle size={18} color={darkMode ? "#fcd34d" : "#b45309"} style={{ marginTop: 2 }} />
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

            {monthOffset === 0 && daysUntilMonthEnd <= 1 && totalBudgetRemaining > 0 && !restbudgetDismissed && (
              <div style={{ ...s.card, background: "linear-gradient(135deg,#ecfdf5,#d1fae5)", border: "2px solid #6ee7b7", padding: 20, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ fontSize: 32 }}>💰</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 18, color: "#065f46" }}>Budget-Restgeld verfügbar</div>
                    <div style={{ fontSize: 14, color: "#047857", marginTop: 6 }}>
                      Du hast diesen Monat <strong>{money(totalBudgetRemaining, currency)}</strong> Budget übrig. Willst du es aufs Sparkonto verschieben?
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                      <button style={{ ...s.button, background: "#059669", color: "#fff", fontWeight: 800, padding: "10px 20px", fontSize: 15, height: "auto" }} onClick={handleBookRestbudget}>
                        Als Sparbetrag buchen
                      </button>
                      <button style={{ ...s.buttonSecondary, padding: "10px 16px", height: "auto" }} onClick={() => setRestbudgetDismissed(true)}>
                        Jetzt nicht
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={s.gridCards}>
              <StatCard title="Verfügbar" value={money(totals.remaining, currency)} subValue={`${percentages.remainingPct.toFixed(0)}% vom Einkommen`} hint="Was nach allen Buchungen übrig bleibt" icon={Wallet} gradient="linear-gradient(135deg,#09090b,#3f3f46)" className="fkb-stat-0" />
              <StatCard title="Einkommen" value={money(totals.income, currency)} hint="Alle Einnahmen im gewählten Monat" icon={TrendingUp} gradient="linear-gradient(135deg,#166534,#22c55e)" className="fkb-stat-1" />
              <StatCard title="Ausgaben" value={money(totals.expenses, currency)} subValue={`${((totals.expenses / (totals.income || 1)) * 100).toFixed(0)}% vom Einkommen`} hint="Fix + variabel + sparen" icon={TrendingDown} gradient="linear-gradient(135deg,#9f1239,#ef4444)" className="fkb-stat-2" />
              <StatCard title="Hauptkonto" value={money(mainAccount.balance, currency)} hint="Geld für Alltag und spontane Ausgaben" icon={CreditCard} gradient="linear-gradient(135deg,#312e81,#6366f1)" className="fkb-stat-3" />
              <StatCard title="Sparkonto" value={money(savingsAccount.balance, currency)} subValue={`Gesamt: ${money(accountSummary.totalCash, currency)}`} hint="Stand auf dem Sparkonto" icon={Activity} gradient="linear-gradient(135deg,#b45309,#f59e0b)" className="fkb-stat-4" />
            </div>

            <div style={{ ...s.grid2, marginTop: 16, gridTemplateColumns: mobileOnly ? "1fr" : "minmax(0,2fr) minmax(280px,1fr)" }}>
              <div style={{ ...s.card, padding: 18 }}>
                <SectionTitle title="Besseres Dashboard" description="Direkte Prozentanzeige auf einen Blick" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  <div style={s.softCard}><div style={{ color: "#71717a", fontSize: 14 }}>Fixkosten</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{money(totals.fixed, currency)}</div><div style={{ fontSize: 12, color: "#71717a", marginTop: 4 }}>{percentages.fixedPct.toFixed(0)}% vom Einkommen</div><ProgressBar value={percentages.fixedPct} color="#18181b" dark={darkMode} /></div>
                  <div style={s.softCard}><div style={{ color: "#71717a", fontSize: 14 }}>Variabel</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{money(totals.flex, currency)}</div><div style={{ fontSize: 12, color: "#71717a", marginTop: 4 }}>{percentages.flexPct.toFixed(0)}% vom Einkommen</div><ProgressBar value={percentages.flexPct} color="#f59e0b" dark={darkMode} /></div>
                  <div style={s.softCard}><div style={{ color: "#71717a", fontSize: 14 }}>Sparquote</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{money(totals.saving, currency)}</div><div style={{ fontSize: 12, color: "#71717a", marginTop: 4 }}>{percentages.savingPct.toFixed(0)}% vom Einkommen</div><ProgressBar value={percentages.savingPct} color="#0ea5e9" dark={darkMode} /></div>
                  <div style={s.softCard}><div style={{ color: "#71717a", fontSize: 14 }}>Restquote</div><div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{money(totals.remaining, currency)}</div><div style={{ fontSize: 12, color: "#71717a", marginTop: 4 }}>{percentages.remainingPct.toFixed(0)}% frei</div><ProgressBar value={percentages.remainingPct} color="#22c55e" dark={darkMode} /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 12, marginTop: 16 }}>
                  <div style={{ ...s.softCard, background: darkMode ? "rgba(22,163,74,0.12)" : "#ecfdf5", borderColor: darkMode ? "rgba(22,163,74,0.25)" : "#bbf7d0" }}><div style={{ color: darkMode ? "#86efac" : "#15803d", fontSize: 14 }}>Monatlich frei verfügbar</div><div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>{money(monthlyPlan.monthlyFlex, currency)}</div></div>
                  <div style={{ ...s.softCard, background: darkMode ? "rgba(29,78,216,0.12)" : "#eff6ff", borderColor: darkMode ? "rgba(29,78,216,0.25)" : "#bfdbfe" }}><div style={{ color: darkMode ? "#93c5fd" : "#1d4ed8", fontSize: 14 }}>Empfohlenes {weeklyMode ? "Wochen" : "Tages"}budget</div><div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>{money(weeklyMode ? monthlyPlan.weeklyFlex : monthlyPlan.dailyFlex, currency)}</div></div>
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
                      <ProgressBar value={budget.progress} color={budget.status.color} dark={darkMode} />
                      <div style={{ fontSize: 12, marginTop: 8, color: budget.status.color }}>Noch übrig: {money(budget.remaining, currency)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "transactions" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ ...s.card, padding: 18 }}>
              <SectionTitle title="Zahlung erfassen" description="Einnahme oder Ausgabe hinzufügen" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <select style={s.input} value={newTransaction.type} onChange={(e) => { const isIncome = e.target.value === "income"; setNewTransaction((p) => ({ ...p, type: e.target.value, bucket: isIncome ? "income" : "flex", targetAccount: "main", category: isIncome ? "Lohn" : "Essen" })); }}>
                  <option value="income">Einnahme</option>
                  <option value="expense">Ausgabe</option>
                </select>
                {newTransaction.type === "income" ? (
                  <select style={s.input} value={newTransaction.targetAccount} onChange={(e) => setNewTransaction((p) => ({ ...p, targetAccount: e.target.value }))}>
                    <option value="main">→ Hauptkonto</option>
                    <option value="savings">→ Sparkonto</option>
                  </select>
                ) : (
                  <select style={s.input} value={newTransaction.bucket} onChange={(e) => setNewTransaction((p) => ({ ...p, bucket: e.target.value }))}>
                    <option value="fixed">Fixkosten</option>
                    <option value="flex">Variable Ausgaben</option>
                    <option value="saving">Sparen</option>
                  </select>
                )}
                <select style={s.input} value={newTransaction.category} onChange={(e) => setNewTransaction((p) => ({ ...p, category: e.target.value }))}>
                  {(newTransaction.type === "income" ? incomeCategories : categories).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input style={s.input} type="number" placeholder="Betrag" value={newTransaction.amount} onChange={(e) => setNewTransaction((p) => ({ ...p, amount: e.target.value }))} />
                <input style={s.input} type="date" value={newTransaction.date} onChange={(e) => setNewTransaction((p) => ({ ...p, date: e.target.value }))} />
                <input style={s.input} placeholder="Notiz" value={newTransaction.note} onChange={(e) => setNewTransaction((p) => ({ ...p, note: e.target.value }))} />
              </div>
              <div style={{ marginTop: 12 }}>
                <button style={s.button} onClick={addTransaction}>Speichern</button>
              </div>
            </div>

            <div style={{ ...s.card, padding: 18 }}>
              <SectionTitle title="Buchungen" description="Alles im gewählten Monat" />
              <div style={{ display: "grid", gridTemplateColumns: mobileOnly ? "1fr" : "1fr minmax(180px, 220px)", gap: 12, minWidth: 0 }}>
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
              </div>

            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              {filteredTransactions.map((t) => (
                <div key={t.id} style={{ ...s.softCard, background: s.surface }}>
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
                  value={newRecurring.frequency}
                  onChange={(e) => setNewRecurring((p) => ({ ...p, frequency: e.target.value }))}
                >
                  <option value="monthly">Monatlich</option>
                  <option value="yearly">Jährlich</option>
                </select>
                {newRecurring.frequency === "yearly" && (
                  <select
                    style={s.input}
                    value={newRecurring.monthOfYear}
                    onChange={(e) => setNewRecurring((p) => ({ ...p, monthOfYear: Number(e.target.value) }))}
                  >
                    {monthNames.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                )}
                <select
                  style={s.input}
                  value={newRecurring.dayOfMonth}
                  onChange={(e) => setNewRecurring((p) => ({ ...p, dayOfMonth: Number(e.target.value) }))}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>am {day}.</option>
                  ))}
                </select>
                <button style={s.button} onClick={addRecurring}>Hinzufügen</button>
              </div>

              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                {recurring.map((r) => (
                  <div key={r.id} style={s.softCard}>
                    {editingRecurringId === r.id ? (
                      <div style={{ display: "grid", gap: 10 }}>
                        <input
                          style={s.input}
                          placeholder="Titel"
                          value={editRecurring.title}
                          onChange={(e) => setEditRecurring((p) => ({ ...p, title: e.target.value }))}
                        />
                        <input
                          style={s.input}
                          type="number"
                          placeholder="Betrag"
                          value={editRecurring.amount}
                          onChange={(e) => setEditRecurring((p) => ({ ...p, amount: e.target.value }))}
                        />
                        <select
                          style={s.input}
                          value={editRecurring.category}
                          onChange={(e) => setEditRecurring((p) => ({ ...p, category: e.target.value }))}
                        >
                          <option value="">Kategorie wählen</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <select
                          style={s.input}
                          value={editRecurring.frequency || "monthly"}
                          onChange={(e) => setEditRecurring((p) => ({ ...p, frequency: e.target.value }))}
                        >
                          <option value="monthly">Monatlich</option>
                          <option value="yearly">Jährlich</option>
                        </select>
                        {(editRecurring.frequency || "monthly") === "yearly" && (
                          <select
                            style={s.input}
                            value={editRecurring.monthOfYear || 1}
                            onChange={(e) => setEditRecurring((p) => ({ ...p, monthOfYear: Number(e.target.value) }))}
                          >
                            {monthNames.map((m, i) => (
                              <option key={i} value={i + 1}>{m}</option>
                            ))}
                          </select>
                        )}
                        <select
                          style={s.input}
                          value={editRecurring.dayOfMonth}
                          onChange={(e) => setEditRecurring((p) => ({ ...p, dayOfMonth: Number(e.target.value) }))}
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <option key={day} value={day}>am {day}.</option>
                          ))}
                        </select>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button style={s.button} onClick={() => saveEditRecurring(r.id)}>Speichern</button>
                          <button style={s.buttonSecondary} onClick={cancelEditRecurring}>Abbrechen</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: 800 }}>{r.title}</div>
                          <div style={{ color: "#71717a", fontSize: 14, marginTop: 4 }}>{money(r.amount, currency)} · {r.category} · {r.frequency === "yearly" ? `Jährlich im ${monthNames[(r.monthOfYear || 1) - 1]}, Tag ${r.dayOfMonth}` : `Monatlich, Tag ${r.dayOfMonth}`}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span style={s.badge}>{r.active ? "Aktiv" : "Pausiert"}</span>
                          <button style={s.buttonSecondary} onClick={() => startEditRecurring(r)}>Bearbeiten</button>
                          <button style={s.buttonSecondary} onClick={() => toggleRecurring(r.id)}>{r.active ? "Pausieren" : "Aktivieren"}</button>
                          <button style={{ ...s.buttonSecondary, width: 44, padding: 0 }} onClick={() => deleteRecurring(r.id)}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px,1fr))", gap: 16 }}>
              {budgetsWithSpent.filter((b) => b.name.toLowerCase() !== "sparen").map((budget) => (
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
                  <ProgressBar value={budget.progress} color={budget.status.color} dark={darkMode} />
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

        {tab === "konten" && (
          <div style={{ display: "grid", gap: 16 }}>

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
                    <div style={{ ...s.softCard, background: s.surface }}><div style={{ fontSize: 13, color: s.textMuted }}>Hauptkonto</div><div style={{ fontWeight: 800, marginTop: 5 }}>{money(mainAccount.balance, currency)}</div></div>
                    <div style={{ ...s.softCard, background: s.surface }}><div style={{ fontSize: 13, color: s.textMuted }}>Frei auf Sparkonto</div><div style={{ fontWeight: 800, marginTop: 5 }}>{money(savingsSummary.availableOnSavings, currency)}</div></div>
                    <div style={{ ...s.softCard, background: s.surface }}><div style={{ fontSize: 13, color: s.textMuted }}>Kommt zurück</div><div style={{ fontWeight: 800, marginTop: 5 }}>{money(savingsSummary.expectedBackNextMonth, currency)}</div></div>
                    <div style={{ ...s.softCard, background: s.surface }}><div style={{ fontSize: 13, color: s.textMuted }}>Total beide Konten</div><div style={{ fontWeight: 800, marginTop: 5 }}>{money(accountSummary.totalCash, currency)}</div></div>
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

                  <button style={{ ...s.buttonSecondary, width: "100%", marginTop: 14, whiteSpace: "normal", height: "auto", padding: "12px 16px", lineHeight: 1.4, textAlign: "center" }} onClick={settleBorrowedSavings}>Monatsanfang ausgleichen + Zins zurücklegen</button>
                </div>
              </div>
            </div>

          </div>
        )}

        {tab === "sparen" && (
          <div style={{ display: "grid", gap: 16 }}>

            <div style={{ ...s.card, background: savingPlanStatus.bg, border: `2px solid ${savingPlanStatus.border}`, padding: 18 }}>
              <SectionTitle title="Sparplan" description="Dein monatliches Sparziel auf einen Blick" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: savingPlanStatus.color }}>{money(savingPlanStatus.actual, currency)}</div>
                  <div style={{ fontSize: 14, color: s.textMuted, marginTop: 4 }}>von {money(savingPlanStatus.goal, currency)} Sparziel diesen Monat</div>
                </div>
                <span style={{ ...s.badge, color: savingPlanStatus.color, borderColor: savingPlanStatus.border, background: savingPlanStatus.bg, fontSize: 14, padding: "8px 14px" }}>{savingPlanStatus.label}</span>
              </div>
              <ProgressBar value={savingPlanStatus.progress} color={savingPlanStatus.color} dark={darkMode} />
              {savingPlanStatus.goal === 0 && (
                <div style={{ fontSize: 13, color: "#71717a", marginTop: 10 }}>Kein monatliches Sparziel gesetzt. Trag es im Konten-Tab ein.</div>
              )}
            </div>

            <div style={{ ...s.card, padding: 18 }}>
              <SectionTitle title="Sparziel hinzufügen" description="So siehst du, worauf du sparst und wie weit du bist" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12 }}>
                <input style={s.input} placeholder="z. B. Notgroschen" value={newGoal.name} onChange={(e) => setNewGoal((p) => ({ ...p, name: e.target.value }))} />
                <input style={s.input} type="number" placeholder="Zielbetrag" value={newGoal.target} onChange={(e) => setNewGoal((p) => ({ ...p, target: e.target.value }))} />
                <input style={s.input} type="number" placeholder="Aktuell" value={newGoal.current} onChange={(e) => setNewGoal((p) => ({ ...p, current: e.target.value }))} />
                <button style={s.button} onClick={addGoal}>Erstellen</button>
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
                    <ProgressBar value={progress} color="#16a34a" dark={darkMode} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                      <input style={s.input} type="number" value={goal.current} onChange={(e) => updateGoalCurrent(goal.id, e.target.value)} />
                      <div style={{ ...s.softCard, background: darkMode ? "rgba(22,163,74,0.12)" : "#ecfdf5", borderColor: darkMode ? "rgba(22,163,74,0.25)" : "#bbf7d0" }}><div style={{ color: darkMode ? "#86efac" : "#15803d", fontSize: 13 }}>Noch nötig</div><div style={{ fontWeight: 800, marginTop: 5 }}>{money(Math.max(goal.target - goal.current, 0), currency)}</div></div>
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
            <div style={{ ...s.card, padding: 18, overflow: "hidden" }}>
              <SectionTitle title="Kalenderansicht pro Monat" description="Sieh auf einen Blick, an welchen Tagen du Geld bekommen oder ausgegeben hast" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8, fontSize: 12, color: "#71717a", fontWeight: 800, marginBottom: 10 }}>
                {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => <div key={d} style={{ textAlign: "center" }}>{d}</div>)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
                {calendarCells.map((cell, index) => {
                  if (!cell) return <div key={index} style={{ minHeight: 92, borderRadius: 18, background: darkMode ? "rgba(255,255,255,0.08)" : "#e4e4e7" }} />;
                  const tone = cell.net < 0
                    ? { border: `1px solid ${darkMode ? "rgba(220,38,38,0.3)" : "#fecdd3"}`, background: darkMode ? "rgba(220,38,38,0.1)" : "#fff1f2" }
                    : cell.income > 0
                    ? { border: `1px solid ${darkMode ? "rgba(22,163,74,0.3)" : "#bbf7d0"}`, background: darkMode ? "rgba(22,163,74,0.1)" : "#f0fdf4" }
                    : { border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "#e4e4e7"}`, background: darkMode ? "rgba(255,255,255,0.07)" : "white" };
                  return (
                    <button key={cell.date} onClick={() => setSelectedCalendarDay(cell)} style={{ minHeight: 92, borderRadius: 18, padding: 10, border: tone.border, background: tone.background, textAlign: "left", cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><div style={{ fontWeight: 800, color: s.text }}>{cell.day}</div>{cell.transactions.length > 0 ? <span style={{ ...s.badge, fontSize: 10, padding: "4px 8px" }}>{cell.transactions.length}</span> : null}</div>
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
                  <div style={{ ...s.softCard, background: darkMode ? "rgba(22,163,74,0.12)" : "#ecfdf5", borderColor: darkMode ? "rgba(22,163,74,0.25)" : "#bbf7d0" }}><div style={{ color: darkMode ? "#86efac" : "#15803d", fontSize: 13 }}>Einnahmen</div><div style={{ fontWeight: 900, marginTop: 6 }}>{money(selectedCalendarDay.income, currency)}</div></div>
                  <div style={{ ...s.softCard, background: darkMode ? "rgba(220,38,38,0.12)" : "#fff1f2", borderColor: darkMode ? "rgba(220,38,38,0.25)" : "#fecdd3" }}><div style={{ color: darkMode ? "#fca5a5" : "#be123c", fontSize: 13 }}>Ausgaben</div><div style={{ fontWeight: 900, marginTop: 6 }}>{money(selectedCalendarDay.expenses, currency)}</div></div>
                  <div style={s.softCard}><div style={{ color: s.textMuted, fontSize: 13 }}>Saldo</div><div style={{ fontWeight: 900, marginTop: 6 }}>{money(selectedCalendarDay.net, currency)}</div></div>
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
                <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 180px", minWidth: 160 }}>
                    {spendingByCategory.length === 0
                      ? <div style={{ color: s.textMuted, fontSize: 14 }}>Keine Ausgaben</div>
                      : spendingByCategory.map((entry, index) => (
                        <div key={entry.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "7px 0", borderBottom: `1px solid ${s.border}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: chartColors[index % chartColors.length], flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: s.text }}>{entry.name}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: s.text }}>{money(entry.value, currency)}</span>
                        </div>
                      ))
                    }
                  </div>
                  <div style={{ flex: "0 0 220px", height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={spendingByCategory} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} paddingAngle={3}>
                          {spendingByCategory.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value) => money(value, currency)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
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
                <div style={{ ...s.softCard, background: darkMode ? "rgba(202,138,4,0.12)" : "#fffbeb", borderColor: darkMode ? "rgba(202,138,4,0.25)" : "#fde68a" }}><div style={{ fontWeight: 800 }}>Variable Ausgaben im Blick behalten</div><div style={{ fontSize: 14, color: s.textMuted, marginTop: 6 }}>Du hast im gewählten Monat {money(totals.flex, currency)} flexibel ausgegeben.</div></div>
                <div style={{ ...s.softCard, background: darkMode ? "rgba(29,78,216,0.12)" : "#eff6ff", borderColor: darkMode ? "rgba(29,78,216,0.25)" : "#bfdbfe" }}><div style={{ fontWeight: 800 }}>Monatswechsel aktiv</div><div style={{ fontSize: 14, color: s.textMuted, marginTop: 6 }}>Budgets und Zahlen werden pro Monat getrennt angezeigt.</div></div>
                <div style={{ ...s.softCard, background: darkMode ? "rgba(22,163,74,0.12)" : "#ecfdf5", borderColor: darkMode ? "rgba(22,163,74,0.25)" : "#bbf7d0" }}><div style={{ fontWeight: 800 }}>Sparkonto-Prognose</div><div style={{ fontSize: 14, color: s.textMuted, marginTop: 6 }}>Wenn alles zurückkommt, liegst du bei {money(savingsSummary.projectedNextMonth, currency)}.</div></div>
                <div style={{ ...s.softCard, background: darkMode ? "rgba(124,58,237,0.12)" : "#f5f3ff", borderColor: darkMode ? "rgba(124,58,237,0.25)" : "#ddd6fe" }}><div style={{ fontWeight: 800 }}>{weeklyMode ? "Wochenbudget" : "Tagesbudget"}</div><div style={{ fontSize: 14, color: s.textMuted, marginTop: 6 }}>Empfohlen: {money(weeklyMode ? monthlyPlan.weeklyFlex : monthlyPlan.dailyFlex, currency)}.</div></div>
              </div>
            </div>
          </div>
        )}

        {tab === "settings" && (
        <div style={{ display: "grid", gap: 16, marginTop: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: mobileOnly ? "1fr" : "repeat(auto-fit, minmax(250px,1fr))", gap: 16, minWidth: 0 }}>
            <div style={s.softCard}>
              <div style={{ fontWeight: 800, color: s.text }}>Dein Name</div>
              <div style={{ fontSize: 14, color: s.textMuted, marginTop: 4, marginBottom: 10 }}>Wird im Hero zur Begrüssung verwendet.</div>
              <input style={s.input} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="z.B. Jeffrey" />
            </div>
            <div style={s.softCard}>
              <div style={{ fontWeight: 800, color: s.text }}>Finanzmonat startet am</div>
              <div style={{ fontSize: 14, color: s.textMuted, marginTop: 4, marginBottom: 10 }}>
                Wähle den Tag, an dem dein Lohn kommt.
              </div>
              <select style={s.input} value={payday} onChange={(e) => setPayday(Number(e.target.value))}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>{day}.</option>
                ))}
              </select>
            </div>
            <div style={s.softCard}>
              <div style={{ fontWeight: 800, color: s.text }}>Erscheinungsbild</div>
              <div style={{ fontSize: 14, color: s.textMuted, marginTop: 4, marginBottom: 14 }}>
                Wechsle zwischen hellem und dunklem Design.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setDarkMode(false)} style={{ ...s.buttonSecondary, flex: 1, justifyContent: "center", background: !darkMode ? "#18181b" : s.btnSecBg, color: !darkMode ? "white" : s.text, border: !darkMode ? "none" : `1px solid ${s.border}` }}>
                  ☀️ Hell
                </button>
                <button onClick={() => setDarkMode(true)} style={{ ...s.buttonSecondary, flex: 1, justifyContent: "center", background: darkMode ? "#18181b" : s.btnSecBg, color: darkMode ? "white" : s.text, border: darkMode ? "none" : `1px solid ${s.border}` }}>
                  🌙 Dunkel
                </button>
              </div>
            </div>
          </div>

          <div style={s.softCard}>
            <div style={{ fontWeight: 800, color: s.text }}>Daten</div>
            <div style={{ fontSize: 14, color: s.textMuted, marginTop: 4, marginBottom: 14 }}>Exportiere deine Daten als JSON oder importiere eine Sicherung.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...s.buttonSecondary, flex: 1, justifyContent: "center" }} onClick={exportData}><Download size={16} /> Export</button>
              <button style={{ ...s.buttonSecondary, flex: 1, justifyContent: "center" }} onClick={() => fileInputRef.current?.click()}><Upload size={16} /> Import</button>
              <input ref={fileInputRef} type="file" accept="application/json" style={{ display: "none" }} onChange={handleImport} />
            </div>
          </div>

          {/* Version History — aufklappbarer Block am Ende */}
          <div style={{ ...s.softCard, overflow: "hidden" }}>
            <button style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", padding: 0 }} onClick={() => setOpenVersions((v) => ({ ...v, __block: !v.__block }))}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: s.text, textAlign: "left" }}>Version History</div>
                <div style={{ fontSize: 13, color: s.textMuted, marginTop: 2, textAlign: "left" }}>Alle Updates der App auf einen Blick</div>
              </div>
              <span style={{ fontSize: 12, color: s.textMuted, marginLeft: 16 }}>{openVersions.__block ? "▲" : "▼"}</span>
            </button>

            {openVersions.__block && (
              <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
                {versionHistory.map((entry, index) => (
                  <div key={entry.version} style={{ background: s.surfaceAlt, border: `1px solid ${s.border}`, borderRadius: 14, overflow: "hidden" }}>
                    <button style={{ ...s.buttonSecondary, width: "100%", justifyContent: "space-between", whiteSpace: "normal", height: "auto", padding: "10px 14px", textAlign: "left", borderRadius: 0, border: "none" }} onClick={() => toggleVersion(entry.version)}>
                      <span style={{ fontWeight: 700 }}>{entry.version} – {entry.name}</span>
                      <span style={{ fontSize: 11, color: s.textMuted }}>{openVersions[entry.version] ? "▲" : "▼"}</span>
                    </button>
                    {openVersions[entry.version] && (
                      <div style={{ padding: "0 14px 14px" }}>
                        <div style={{ fontSize: 12, color: s.textMuted, marginBottom: 8 }}>
                          {entry.date}{index === 0 ? " · Neustes Update" : ""}
                        </div>
                        {entry.notes.map((note) => (
                          <div key={note.title} style={{ marginTop: 8 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: s.text }}>● {note.title}</div>
                            <div style={{ marginLeft: 16, marginTop: 4 }}>
                              {note.items.map((item) => (
                                <div key={item} style={{ fontSize: 13, color: s.textMuted, marginTop: 3 }}>- {item}</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      </div>{/* fkb-tab-page */}
      </div>{/* fkb-content */}
      </div>

      {mobileOnly && (
        <div style={s.bottomNav} className="fkb-bottom-nav">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
            {[
              ["dashboard", Home],
              ["transactions", CreditCard],
              ["konten", Wallet],
              ["budgets", Target],
              ["sparen", TrendingUp],
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
