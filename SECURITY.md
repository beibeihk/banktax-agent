# Security policy

This independent prototype uses only fictional enterprise records and public policy metadata. Do not upload real bank, taxpayer, customer or personal financial data. No real lending or tax decision is made.

## Credentials and optional live mode

- Server credentials belong in environment variables or local `.env`, never in frontend code, JSON artifacts, Git, screenshots or logs.
- `NEXT_PUBLIC_*` values are visible to visitors. Only the optional public API URL belongs there.
- The public static demo has no live-model endpoint. Its complete primary journeys work without credentials.
- The local LLM adapter has a request timeout, two-request concurrency limit, process-local rate limits, an HTTPS/local-only provider URL check, bounded output schema and evidence-ID validation. Provider bodies are not returned in errors.
- Schema and ID validation do not establish semantic correctness. Live outputs require human review.
- These controls do not constitute production authentication, distributed abuse protection or a compliance programme. Put a real authentication and cost-control gateway in front of any externally exposed paid-model API.

## Input and deployment boundaries

FastAPI validates identifier formats, query lengths, nonnegative tax-calculation inputs and finite values. CORS is restricted to configured origins. Synthetic artifacts are read-only; the API does not accept arbitrary source URLs, enterprise uploads or shell execution. The API container runs as a non-root user and Compose binds its port to localhost.

`requirements.lock.txt` and `package-lock.json` fix dependency versions. Review dependency advisories before extending or deploying the API in production. The hosted demo serves static assets and no Next.js application server. During the initial audit, `npm audit --omit=dev` reports no production advisories; development dependency findings (if any) are kept visible rather than hidden by forcing incompatible downgrades.

## Reporting

Please report a security issue through the repository's private vulnerability reporting mechanism if available, or contact the author using the public academic contact on the research blog. Do not post credentials or real financial data in public issues.

## Data and decision integrity

Tax alerts are reconciliation signals, not allegations. Policy matches are candidate opportunities, not eligibility certifications. Scores use explicit designer-defined weights. Research metrics are generated from synthetic labels and cannot establish empirical or causal evidence. No affiliation with any bank is claimed.
