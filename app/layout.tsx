import type { Metadata } from "next";
import "./globals.css";
import "./workspace.css";
export const metadata: Metadata = {
  title: "BankTax-Agent | Enterprise Tax Intelligence",
  description:
    "Explainable tax, financial and innovation intelligence for commercial banking. An independent research and engineering portfolio by Kun Huang. All enterprise records are synthetic.",
  icons: { icon: "/favicon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
