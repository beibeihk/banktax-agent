import type { Metadata } from "next";
import "./globals.css";
import "./workspace.css";
export const metadata: Metadata = {
  title: "BankTax-Agent | 企业涉税智能与银行风险决策支持",
  description:
    "面向商业银行对公业务的企业财税画像、政策线索、科技金融识别与可解释风险决策支持。黄坤的独立科研与工程作品，全部企业记录均为虚构。",
  icons: { icon: "/favicon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
