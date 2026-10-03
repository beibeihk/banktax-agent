import Link from "next/link";

export default function NotFound() {
  return (
    <main className="empty">
      <div className="eyebrow accent">BankTax-Agent · 404</div>
      <h1>未找到页面</h1>
      <p>请检查网址，或返回首页继续查看企业与政策分析。</p>
      <Link className="button" href="/">
        返回首页
      </Link>
    </main>
  );
}
