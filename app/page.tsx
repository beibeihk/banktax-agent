"use client";
import { useState, useEffect, useSyncExternalStore } from "react";
import {
  Layers3,
  ShieldCheck,
  BookOpen,
  Activity,
  Cpu,
  FlaskConical,
  ExternalLink,
  ChevronRight,
  LayoutDashboard,
  Building2,
  Lightbulb,
  GitBranch,
  Menu,
  X,
  CircleHelp,
} from "lucide-react";
import { DISCLAIMER, pct } from "@/lib/domain";
import type { Dataset } from "@/lib/domain";
import { Brand, Badge, Cases, SyntheticNotice, repo } from "@/components/ui";
import { HistoryChart } from "@/components/charts";
import { Dashboard, InnovationPortfolio } from "@/components/portfolio";
import { AllSignals } from "@/components/risks";
import { PolicyPage } from "@/components/policies";
import { Company } from "@/components/company";
import { Research } from "@/components/research";
import { Evaluation } from "@/components/evaluation";
function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}
function snapshot() {
  return window.location.hash.slice(1);
}
function Landing({ d }: { d: Dataset | null }) {
  return (
    <main className="landing">
      <nav>
        <Brand />
        <div className="landing-links">
          <a href={repo} target="_blank" rel="noreferrer">
            View source <ExternalLink size={14} />
          </a>
          <a className="button compact" href="#portfolio">
            Launch Demo
          </a>
        </div>
      </nav>
      <section className="hero landing-hero">
        <div className="hero-copy">
          <div className="eyebrow accent">
            TAX ECONOMICS × BANKING × AI AGENTS
          </div>
          <h1>
            A clearer view of
            <br />
            enterprise potential.
          </h1>
          <p>
            Transforming tax, financial and innovation signals into explainable
            intelligence for commercial banking.
          </p>
          <div className="hero-actions">
            <a className="button" href="#portfolio">
              Launch Demo
            </a>
            <a className="text-button" href="#research">
              Explore Research Mode
            </a>
          </div>
          <div className="hero-note">
            <ShieldCheck size={16} /> Synthetic data · No registration · No API
            key required
          </div>
        </div>
        <div className="hero-workspace">
          <div className="preview-top">
            <span>
              <Layers3 size={17} /> Enterprise 360
            </span>
            <Badge tone="teal">Demo</Badge>
          </div>
          <div className="hero-firm">
            <div className="firm-logo">XL</div>
            <div>
              <strong>Xinglan AI</strong>
              <span>Shenzhen · Artificial intelligence · Fictional</span>
            </div>
          </div>
          <div className="hero-stat-row">
            <div>
              <span>Revenue growth</span>
              <strong>{d ? pct(d.enterprises[0].revenue_growth) : "—"}</strong>
            </div>
            <div>
              <span>R&D intensity</span>
              <strong>{d ? pct(d.enterprises[0].rd_intensity) : "—"}</strong>
            </div>
          </div>
          {d ? (
            <HistoryChart e={d.enterprises[0]} />
          ) : (
            <div className="chart skeleton" />
          )}
          <div className="hero-insight">
            <Lightbulb size={20} />
            <span>
              Sustained R&D adds context to profitability.
              <small>Evidence first. Every decision remains human.</small>
            </span>
          </div>
        </div>
      </section>
      <div className="capability-strip">
        <span>
          <BookOpen size={17} /> Tax policy intelligence
        </span>
        <span>
          <Activity size={17} /> Explainable risk signals
        </span>
        <span>
          <Cpu size={17} /> Innovation profiles
        </span>
        <span>
          <FlaskConical size={17} /> Reproducible research
        </span>
      </div>
      <section className="landing-section">
        <div className="landing-section-head">
          <div>
            <div className="eyebrow accent">THREE BUSINESS CONVERSATIONS</div>
            <h2>Explore demo cases</h2>
          </div>
          <p>From enterprise data to questions worth asking.</p>
        </div>
        {d ? (
          <Cases d={d} />
        ) : (
          <p role="status">Loading the synthetic enterprise dataset…</p>
        )}
      </section>
      <section className="landing-method">
        <div>
          <div className="eyebrow accent">
            ENTERPRISE TAX INTELLIGENCE & BANK-TAX RISK AGENT
          </div>
          <h2>
            Built for a banking conversation.
            <br />
            Designed for scrutiny.
          </h2>
          <p>
            Six focused agents connect public policy sources, coherent
            enterprise data and auditable models. Explore the workspace, then
            inspect its assumptions in Research Mode.
          </p>
        </div>
        <div className="method-list">
          {[
            [
              "Grounded policy opportunities",
              "Original sources, effective dates and missing eligibility evidence.",
            ],
            [
              "Signals you can explain",
              "Rules, legitimate explanations and verification steps.",
            ],
            [
              "Engineering you can reproduce",
              "Seeded data, held-out comparisons and actual evaluations.",
            ],
          ].map(([title, text], i) => (
            <div key={title}>
              <span>0{i + 1}</span>
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <footer className="landing-footer">
        <div>
          <Brand />
          <p>
            An independent research & engineering portfolio by{" "}
            <a
              href="https://beibeihk.github.io/myblog/"
              target="_blank"
              rel="noreferrer"
            >
              Kun Huang · 黄坤
            </a>
            .
          </p>
        </div>
        <p>
          All company names and enterprise-level records are fictional and
          generated solely for demonstration. No affiliation with any bank.{" "}
          {DISCLAIMER}
        </p>
      </footer>
    </main>
  );
}
const navigation = [
  { id: "portfolio", name: "Portfolio overview", icon: LayoutDashboard },
  { id: "companies", name: "Enterprise 360", icon: Building2 },
  { id: "signals", name: "Tax risk signals", icon: ShieldCheck },
  { id: "innovation", name: "Tech finance", icon: Lightbulb },
  { id: "policies", name: "Policy intelligence", icon: BookOpen },
  { id: "research", name: "Credit risk research", icon: FlaskConical },
  { id: "evaluation", name: "Evaluation & methods", icon: GitBranch },
];
function Shell({
  route,
  children,
}: {
  route: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const active = ["company", "risks", "credit"].includes(route.split("/")[0])
    ? "companies"
    : route.split("/")[0];
  return (
    <div className="app-shell">
      <aside className={open ? "sidebar open" : "sidebar"}>
        <Brand />
        <button
          className="mobile-close"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
        <div className="sidebar-section">INTELLIGENCE WORKSPACE</div>
        <nav aria-label="Main navigation">
          {navigation.map((n) => (
            <a
              key={n.id}
              className={active === n.id ? "nav-item active" : "nav-item"}
              href={`#${n.id}`}
              onClick={() => setOpen(false)}
            >
              <n.icon size={18} />
              {n.name}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <ShieldCheck size={18} />
            <div>
              Independent prototype<span>Synthetic enterprise data</span>
            </div>
          </div>
          <a href={repo} target="_blank" rel="noreferrer">
            <GitBranch size={16} /> Source & documentation{" "}
            <ExternalLink size={14} />
          </a>
          <a href="#">
            <CircleHelp size={16} /> About this project
          </a>
          <div className="author">
            BUILT BY KUN HUANG <span>Tax Economics × AI</span>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu"
              aria-label="Open navigation"
              onClick={() => setOpen(!open)}
            >
              <Menu />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>
              {navigation.find((n) => n.id === active)?.name || "Company 360"}
            </strong>
          </div>
          <div className="topbar-right">
            <div className="mode-switch">
              <a
                className={route !== "research" ? "selected" : ""}
                href="#portfolio"
              >
                Business Mode
              </a>
              <a
                className={route === "research" ? "selected" : ""}
                href="#research"
              >
                Research Mode
              </a>
            </div>
            <Badge tone="teal">Demo mode</Badge>
            <span className="avatar">KH</span>
          </div>
        </header>
        <SyntheticNotice />
        <main className="workspace">{children}</main>
        <footer className="workspace-footer">{DISCLAIMER}</footer>
      </div>
    </div>
  );
}
export default function Page() {
  const route = useSyncExternalStore(subscribe, snapshot, () => "");
  const [d, setD] = useState<Dataset | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let mounted = true;
    fetch("/data/demo.json")
      .then((r) => {
        if (!r.ok) throw Error("Dataset unavailable");
        return r.json();
      })
      .then((data) => {
        if (mounted) setD(data);
      })
      .catch(() => {
        if (mounted) setError(true);
      });
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);
  useEffect(() => {
    if (!d) return;
    const doc = document as Document & {
      modelContext?: {
        registerTool: (tool: object, options: { signal: AbortSignal }) => void;
      };
    };
    if (!doc.modelContext) return;
    const controller = new AbortController();
    try {
      doc.modelContext.registerTool(
        {
          name: "get_enterprise_evidence",
          description:
            "Read computed evidence for a fictional enterprise without changing state.",
          annotations: { readOnlyHint: true },
          inputSchema: {
            type: "object",
            properties: { enterprise_id: { type: "string" } },
            required: ["enterprise_id"],
            additionalProperties: false,
          },
          execute: (input: unknown) => {
            if (
              !input ||
              typeof input !== "object" ||
              !("enterprise_id" in input) ||
              typeof input.enterprise_id !== "string"
            )
              throw Error("enterprise_id required");
            const e = d.enterprises.find(
              (e) => e.enterprise_id === input.enterprise_id,
            );
            if (!e) throw Error("Unknown enterprise");
            return {
              enterprise_id: e.enterprise_id,
              synthetic: true,
              risks: e.risks,
              innovation: e.innovation,
              brief: e.brief,
            };
          },
        },
        { signal: controller.signal },
      );
    } catch {
      /* Optional browser capability. */
    }
    return () => controller.abort();
  }, [d]);
  if (!route)
    return (
      <>
        <Landing d={d} />
        {error && (
          <div className="load-error" role="alert">
            The dataset could not be loaded.{" "}
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}
      </>
    );
  if (!d)
    return (
      <Shell route={route}>
        <div className="empty" role={error ? "alert" : "status"}>
          <Layers3 />
          <h1>
            {error ? "Dataset unavailable" : "Loading enterprise intelligence…"}
          </h1>
          <p>
            {error
              ? "Check the connection and retry."
              : "Preparing the synthetic portfolio and auditable results."}
          </p>
          {error && (
            <button className="button" onClick={() => window.location.reload()}>
              Retry
            </button>
          )}
        </div>
      </Shell>
    );
  const [view, id] = route.split("/");
  const e = d.enterprises.find((e) => e.enterprise_id === id);
  let content: React.ReactNode;
  if (id) {
    content =
      e && ["company", "risks", "innovation", "credit"].includes(view) ? (
        <Company key={`${view}/${id}`} d={d} e={e} view={view} />
      ) : (
        <div className="empty">
          <h1>Enterprise not found</h1>
          <a className="button" href="#companies">
            Return to portfolio
          </a>
        </div>
      );
  } else if (view === "portfolio") content = <Dashboard d={d} />;
  else if (view === "companies") content = <Dashboard d={d} onlyTable />;
  else if (view === "signals") content = <AllSignals d={d} />;
  else if (view === "policies") content = <PolicyPage d={d} />;
  else if (view === "research") content = <Research d={d} />;
  else if (view === "innovation") content = <InnovationPortfolio d={d} />;
  else if (view === "evaluation") content = <Evaluation d={d} />;
  else
    content = (
      <div className="empty">
        <h1>Page not found</h1>
        <a className="button" href="#portfolio">
          Return to workspace
        </a>
      </div>
    );
  return <Shell route={route}>{content}</Shell>;
}
