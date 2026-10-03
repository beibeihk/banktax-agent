import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import data from "../../public/data/demo.json";
import { PolicyCard } from "../../components/policies";
afterEach(cleanup);
it("renders source, eligibility conditions and evidence as separate inspectable facts", () => {
  const p = data.policies[0];
  render(
    <PolicyCard p={p} status="Candidate" evidence="Ledger review required" />,
  );
  expect(screen.getByRole("link", { name: "Original source" })).toHaveAttribute(
    "href",
    p.original_source,
  );
  expect(screen.getByText("Ledger review required")).toBeInTheDocument();
  expect(screen.getByText("Candidate")).toBeInTheDocument();
  expect(screen.getByText(p.conditions[0])).toBeInTheDocument();
});
