import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Banknote,
  ExternalLink,
  Landmark,
  MessageSquare,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

type BudgetRow = {
  label: string;
  amount: number;
  note?: string;
};

const ESSENTIALS: BudgetRow[] = [
  { label: "Rent or shared housing", amount: 650, note: "Aim for under 40% of take-home" },
  { label: "Groceries", amount: 220 },
  { label: "Phone", amount: 35, note: "Lifeline or prepaid keeps this low" },
  { label: "Transportation", amount: 90, note: "MARTA pass, gas, or rideshare" },
  { label: "Utilities + wifi", amount: 80 },
];

const FLEX: BudgetRow[] = [
  { label: "Food out + coffee", amount: 90 },
  { label: "Clothes, personal care", amount: 60 },
  { label: "Fun + entertainment", amount: 50 },
];

const SAVINGS: BudgetRow[] = [
  { label: "Emergency fund", amount: 120, note: "Target: one month of rent" },
  { label: "Longer-term goal", amount: 55, note: "License, laptop, deposit" },
];

const sum = (rows: BudgetRow[]) => rows.reduce((t, r) => t + r.amount, 0);

const formatDollars = (n: number) => `$${n.toLocaleString("en-US")}`;

const AskChip = ({
  prompt,
  label,
}: {
  prompt: string;
  label: string;
}) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() =>
        navigate("/navigator", { state: { askPrompt: prompt } })
      }
      className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
    >
      <MessageSquare className="h-3 w-3" />
      {label}
      <ArrowUpRight className="h-3 w-3 opacity-60 transition group-hover:opacity-100" />
    </button>
  );
};

const BudgetTable = ({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: BudgetRow[];
  tone: "sage" | "amber" | "primary";
}) => {
  const toneClass =
    tone === "sage"
      ? "text-[#2E7D5B]"
      : tone === "amber"
        ? "text-nest-amber"
        : "text-primary";
  const total = sum(rows);
  return (
    <div className="nest-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg text-foreground">{title}</h3>
        <span className={cn("font-display text-xl", toneClass)}>
          {formatDollars(total)}
        </span>
      </div>
      <ul className="mt-3 divide-y divide-border">
        {rows.map((r) => (
          <li
            key={r.label}
            className="flex items-start justify-between gap-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-sm text-foreground">{r.label}</p>
              {r.note && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {r.note}
                </p>
              )}
            </div>
            <span className="shrink-0 text-sm font-semibold text-foreground tabular-nums">
              {formatDollars(r.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Money = () => {
  const totalNeed =
    sum(ESSENTIALS) + sum(FLEX) + sum(SAVINGS);

  return (
    <div className="px-5 pt-5 pb-4">
      <p className="text-sm text-muted-foreground">Zone 05</p>
      <h1 className="font-display text-3xl text-primary">
        Money & independence
      </h1>
      <p className="mt-2 text-muted-foreground">
        A starting template — not a fixed plan. Adjust the numbers to your real
        paycheck and stipend.
      </p>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="mt-6 nest-card p-5 border-primary/25 bg-primary/[0.04]"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Wallet className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h2 className="font-display text-lg text-foreground leading-tight">
              Start with a checking account you control
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A checking account holds money you spend each month. A savings
              account holds money you don't touch. Most banks let you open both
              at the same time — you'll need a state ID and either a Social
              Security card or ITIN.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <Banknote className="h-5 w-5 text-primary" />
            <p className="mt-2 font-semibold text-sm text-foreground">
              Checking
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Daily spending, bills, debit card, direct deposit.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <PiggyBank className="h-5 w-5 text-[#2E7D5B]" />
            <p className="mt-2 font-semibold text-sm text-foreground">
              Savings
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Emergency fund, deposit for a place, bigger goals.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <AskChip
            prompt="How do I open a checking and savings account in Georgia with no credit history?"
            label="How to open one"
          />
          <AskChip
            prompt="What documents do I need to open a bank account as a foster youth in Georgia?"
            label="Documents I need"
          />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.05, ease: "easeOut" }}
        className="mt-6"
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl text-primary">
            Sample monthly budget
          </h2>
          <span className="text-xs font-semibold text-muted-foreground">
            Target need · {formatDollars(totalNeed)}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Three buckets — essentials, savings, flexible. Swap numbers for yours.
        </p>

        <div className="mt-4 space-y-3">
          <BudgetTable title="Essentials" rows={ESSENTIALS} tone="primary" />
          <BudgetTable title="Savings" rows={SAVINGS} tone="sage" />
          <BudgetTable title="Flexible" rows={FLEX} tone="amber" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Swap these numbers for your own. For tracking and budgeting step-by-step, the FDIC curriculum below walks through it.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.1, ease: "easeOut" }}
        className="mt-6 nest-card p-5"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nest-amber/15 text-nest-amber">
            <Landmark className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h2 className="font-display text-lg text-foreground leading-tight">
              EYSS monthly stipend
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Georgia's Education and Training Voucher and related stipends can
              help cover rent, school costs, and living expenses while you're
              eligible. Ask Navigator for the current amount and how to apply —
              the rules shift year to year.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <AskChip
                prompt="How do I claim the EYSS monthly stipend in Georgia?"
                label="How to claim EYSS"
              />
              <AskChip
                prompt="What's the difference between EYSS, Chafee ETV, and the tuition waiver?"
                label="Compare stipends"
              />
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.15, ease: "easeOut" }}
        className="mt-6"
      >
        <h2 className="font-display text-xl text-primary">Learn the basics</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Free, trusted curriculum for youth — no account required.
        </p>
        <a
          href="https://www.fdic.gov/resources/consumers/money-smart/money-smart-for-young-people/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 nest-card block p-5 transition-shadow duration-200 hover:shadow-lg"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <Landmark className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                FDIC · Federal
              </p>
              <p className="mt-1 font-display text-lg text-foreground leading-tight">
                Money Smart for Young People
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Modules on earning, spending, saving, borrowing, and protecting
                your money.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Open FDIC curriculum
                <ExternalLink className="h-4 w-4" />
              </span>
            </div>
          </div>
        </a>
      </motion.section>
    </div>
  );
};

export default Money;
