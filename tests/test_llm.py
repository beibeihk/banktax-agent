"""Exercise the provider boundary without paid calls or real credentials."""

import asyncio
import json

import httpx
import pytest

from backend import llm
from backend.store import enterprise


@pytest.fixture
def configured(monkeypatch):
    monkeypatch.setenv("ENABLE_LIVE_AI", "true")
    monkeypatch.setenv("OPENAI_API_KEY", "mock-provider-key")
    monkeypatch.setenv("OPENAI_MODEL", "mock-model")
    monkeypatch.setenv("OPENAI_BASE_URL", "https://mock.invalid/v1")
    return enterprise("P-001")


def provider(monkeypatch, handler):
    client_type = httpx.AsyncClient
    transport = httpx.MockTransport(handler)
    monkeypatch.setattr(llm.httpx, "AsyncClient", lambda **kwargs: client_type(transport=transport, **kwargs))


def valid_output():
    return {
        "whats_happening": "Synthetic enterprise with sustained R&D investment.",
        "opportunities": "Review the supplied policy conditions with a human specialist.",
        "signals_to_verify": "Reconcile the supplied accounting figures.",
        "next_actions": ["Review the R&D ledger."],
        "evidence_ids": ["P-001"],
    }


def test_valid_provider_response(configured, monkeypatch):
    requests = []

    def handler(request):
        requests.append(request)
        return httpx.Response(200, json={"choices": [{"message": {"content": json.dumps(valid_output())}}]})

    provider(monkeypatch, handler)
    result = asyncio.run(llm.live_brief(configured))
    body = json.loads(requests[0].content)
    assert str(requests[0].url) == "https://mock.invalid/v1/chat/completions"
    assert body["model"] == "mock-model"
    assert body["response_format"] == {"type": "json_object"}
    assert "Simplified Chinese" in body["messages"][0]["content"]
    facts = json.loads(body["messages"][1]["content"])
    assert facts["synthetic"] is True
    assert "next_year_risk_label" not in facts
    assert result["mode"] == "live_ai"
    assert result["human_review_required"] is True
    assert result["output"]["evidence_ids"] == ["P-001"]


@pytest.mark.parametrize("failure", ["unsupported_evidence", "invalid_json", "upstream", "timeout"])
def test_provider_failures_are_sanitized(configured, monkeypatch, failure):
    def handler(request):
        if failure == "timeout":
            raise httpx.ReadTimeout("private-upstream-detail", request=request)
        if failure == "upstream":
            return httpx.Response(503, text="private-upstream-detail")
        output = valid_output()
        output["evidence_ids"] = ["invented-policy"]
        content = "invalid JSON" if failure == "invalid_json" else json.dumps(output)
        return httpx.Response(200, json={"choices": [{"message": {"content": content}}]})

    provider(monkeypatch, handler)
    with pytest.raises(llm.AIUnavailable) as error:
        asyncio.run(llm.live_brief(configured))
    assert "请使用已计算的证据简报" in str(error.value)
    assert "private-upstream-detail" not in str(error.value)
    assert "mock-provider-key" not in str(error.value)


def test_insecure_remote_endpoint_is_rejected(configured, monkeypatch):
    monkeypatch.setenv("OPENAI_BASE_URL", "http://untrusted.invalid/v1")

    def unexpected_request(request):
        pytest.fail("Insecure endpoint must be rejected before any provider call")

    provider(monkeypatch, unexpected_request)
    with pytest.raises(llm.AIUnavailable, match="HTTPS 或本机 HTTP"):
        asyncio.run(llm.live_brief(configured))
