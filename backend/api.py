"""Local/Docker API. Public hosted demo serves static deterministic artifacts."""

import os
import time
from collections import defaultdict, deque
from typing import Annotated

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Path, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.agents import orchestrate
from backend.llm import AIUnavailable, live_brief
from backend.policy import AS_OF, POLICIES, calculate_rd, retrieve
from backend.store import enterprise, snapshot

load_dotenv()
app = FastAPI(title="BankTax-Agent", version="1.0.0", description="独立开发的合成数据决策支持 API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "CORS_ORIGINS", "http://127.0.0.1:3000,http://localhost:3000,http://localhost:8080"
    ).split(","),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
EnterpriseId = Annotated[str, Path(pattern=r"^P-\d{3}$")]
_rates: dict[str, deque] = defaultdict(deque)


class Query(BaseModel):
    question: str = Field(min_length=2, max_length=1000)
    enterprise_id: str | None = Field(default=None, pattern=r"^P-\d{3}$")


class RDCalculation(BaseModel):
    eligible_expensed_rd: float = Field(ge=0, le=1e9, allow_inf_nan=False)
    marginal_rate: float = Field(ge=0, le=0.25, allow_inf_nan=False)


def get_enterprise(eid):
    e = enterprise(eid)
    if e is None:
        raise HTTPException(404, "未找到合成企业")
    return e


@app.middleware("http")
async def headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Cache-Control"] = "no-store"
    return response


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "synthetic": True,
        "policy_as_of": AS_OF,
        "live_ai_configured": os.getenv("ENABLE_LIVE_AI", "false").lower() == "true"
        and bool(os.getenv("OPENAI_API_KEY"))
        and bool(os.getenv("OPENAI_MODEL")),
    }


@app.get("/api/enterprises")
def enterprises():
    return snapshot()["enterprises"]


@app.get("/api/enterprises/{enterprise_id}")
def profile(enterprise_id: EnterpriseId):
    return get_enterprise(enterprise_id)


@app.get("/api/policies")
def policies():
    return {"as_of": AS_OF, "policies": POLICIES}


@app.post("/api/policies/query")
def policy_query(query: Query):
    return retrieve(query.question)


@app.post("/api/orchestrate")
def agent_query(query: Query):
    return orchestrate(query.question, get_enterprise(query.enterprise_id) if query.enterprise_id else None)


@app.post("/api/tax/rd")
def tax_calc(body: RDCalculation):
    try:
        return calculate_rd(body.eligible_expensed_rd, body.marginal_rate)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc


@app.post("/api/enterprises/{enterprise_id}/live-brief")
async def live(enterprise_id: EnterpriseId, request: Request):
    e = get_enterprise(enterprise_id)
    now = time.monotonic()
    # Local prototype protection only; not a distributed production rate limiter.
    queue = _rates[request.client.host if request.client else "local"]
    while queue and now - queue[0] > 60:
        queue.popleft()
    if len(queue) >= 6:
        raise HTTPException(429, "实时 AI 请求已达限额，请使用已保存的证据简报。")
    queue.append(now)
    try:
        return await live_brief(e)
    except AIUnavailable as exc:
        raise HTTPException(503, str(exc)) from exc
