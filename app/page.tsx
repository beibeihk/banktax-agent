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
            查看源码 <ExternalLink size={14} />
          </a>
          <a className="button compact" href="#portfolio">
            进入演示
          </a>
        </div>
      </nav>
      <section className="hero landing-hero">
        <div className="hero-copy">
          <div className="eyebrow accent">
            税收经济学 × 商业银行 × AI 智能体
          </div>
          <h1>
            看清企业实力
            <br />
            发现成长潜力
          </h1>
          <p>汇集税务、财务与创新信号，为商业银行提供有据可查的企业分析。</p>
          <div className="hero-actions">
            <a className="button" href="#portfolio">
              进入演示
            </a>
            <a className="text-button" href="#research">
              查看研究模式
            </a>
          </div>
          <div className="hero-note">
            <ShieldCheck size={16} /> 合成数据 · 无需注册 · 无需配置 API 密钥
          </div>
        </div>
        <div className="hero-workspace">
          <div className="preview-top">
            <span>
              <Layers3 size={17} /> 企业全景
            </span>
            <Badge tone="teal">演示</Badge>
          </div>
          <div className="hero-firm">
            <div className="firm-logo">星澜</div>
            <div>
              <strong>星澜智能科技</strong>
              <span>深圳 · 人工智能 · 虚构企业</span>
            </div>
          </div>
          <div className="hero-stat-row">
            <div>
              <span>收入增长率</span>
              <strong>{d ? pct(d.enterprises[0].revenue_growth) : "—"}</strong>
            </div>
            <div>
              <span>研发强度</span>
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
              结合持续研发投入，理解企业盈利表现。
              <small>依据可追溯，决策由人作出。</small>
            </span>
          </div>
        </div>
      </section>
      <div className="capability-strip">
        <span>
          <BookOpen size={17} /> 税收政策智能
        </span>
        <span>
          <Activity size={17} /> 可解释风险信号
        </span>
        <span>
          <Cpu size={17} /> 创新画像
        </span>
        <span>
          <FlaskConical size={17} /> 可复现研究
        </span>
      </div>
      <section className="landing-section">
        <div className="landing-section-head">
          <div>
            <div className="eyebrow accent">三个银行业务场景</div>
            <h2>查看演示案例</h2>
          </div>
          <p>从企业数据出发，找到业务核验的切入点。</p>
        </div>
        {d ? <Cases d={d} /> : <p role="status">正在加载合成企业数据…</p>}
      </section>
      <section className="landing-method">
        <div>
          <div className="eyebrow accent">企业涉税智能与银行风险决策支持</div>
          <h2>
            服务银行业务沟通
            <br />
            接受证据与方法检验
          </h2>
          <p>
            六个业务智能体连接公开政策、企业数据与可审查模型。进入业务工作台，或在研究模式中查看方法与假设。
          </p>
        </div>
        <div className="method-list">
          {[
            [
              "政策机会有据可查",
              "展示政策原文、有效日期与尚待补齐的资格材料。",
            ],
            ["风险信号可以解释", "同时提供触发规则、合理成因和核验步骤。"],
            [
              "工程结果能够复现",
              "固定随机种子、独立测试集比较与真实执行的评估。",
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
            独立研究与工程作品，作者：{" "}
            <a
              href="https://beibeihk.github.io/myblog/"
              target="_blank"
              rel="noreferrer"
            >
              黄坤
            </a>
            .
          </p>
        </div>
        <p>
          所有企业名称及企业层面记录均为演示生成的虚构内容。本项目与任何银行均无隶属关系。{" "}
          {DISCLAIMER}
        </p>
      </footer>
    </main>
  );
}
const navigation = [
  { id: "portfolio", name: "客户组合概览", icon: LayoutDashboard },
  { id: "companies", name: "企业全景", icon: Building2 },
  { id: "signals", name: "税务风险信号", icon: ShieldCheck },
  { id: "innovation", name: "科技金融", icon: Lightbulb },
  { id: "policies", name: "税收政策智能", icon: BookOpen },
  { id: "research", name: "信贷风险研究", icon: FlaskConical },
  { id: "evaluation", name: "评估与方法", icon: GitBranch },
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
          aria-label="关闭导航"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
        <div className="sidebar-section">智能分析工作台</div>
        <nav aria-label="主导航">
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
              独立研究原型<span>合成企业数据</span>
            </div>
          </div>
          <a href={repo} target="_blank" rel="noreferrer">
            <GitBranch size={16} /> 源码与文档 <ExternalLink size={14} />
          </a>
          <a href="#">
            <CircleHelp size={16} /> 关于项目
          </a>
          <div className="author">
            作者：黄坤 <span>税收经济学 × AI</span>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu"
              aria-label="打开导航"
              onClick={() => setOpen(!open)}
            >
              <Menu />
            </button>
            <span>工作台</span>
            <ChevronRight size={14} />
            <strong>
              {navigation.find((n) => n.id === active)?.name || "企业全景"}
            </strong>
          </div>
          <div className="topbar-right">
            <div className="mode-switch">
              <a
                className={route !== "research" ? "selected" : ""}
                href="#portfolio"
              >
                业务模式
              </a>
              <a
                className={route === "research" ? "selected" : ""}
                href="#research"
              >
                研究模式
              </a>
            </div>
            <Badge tone="teal">演示模式</Badge>
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
        if (!r.ok) throw Error("数据暂不可用");
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
          description: "读取虚构企业的已计算证据，不改变系统状态。",
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
              throw Error("请提供企业编号 enterprise_id");
            const e = d.enterprises.find(
              (e) => e.enterprise_id === input.enterprise_id,
            );
            if (!e) throw Error("企业不存在");
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
            数据加载失败。{" "}
            <button onClick={() => window.location.reload()}>重新加载</button>
          </div>
        )}
      </>
    );
  if (!d)
    return (
      <Shell route={route}>
        <div className="empty" role={error ? "alert" : "status"}>
          <Layers3 />
          <h1>{error ? "数据暂不可用" : "正在加载企业分析…"}</h1>
          <p>
            {error
              ? "请检查网络连接后重试。"
              : "正在准备合成客户组合与可审查分析结果。"}
          </p>
          {error && (
            <button className="button" onClick={() => window.location.reload()}>
              重新加载
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
          <h1>未找到企业</h1>
          <a className="button" href="#companies">
            返回客户组合
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
        <h1>未找到页面</h1>
        <a className="button" href="#portfolio">
          返回工作台
        </a>
      </div>
    );
  return <Shell route={route}>{content}</Shell>;
}
