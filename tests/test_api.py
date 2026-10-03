from fastapi.testclient import TestClient

from backend.api import app

client = TestClient(app)


def test_api_health_and_profiles():
    assert client.get("/api/health").json()["synthetic"] is True
    assert len(client.get("/api/enterprises").json()) == 80
    assert client.get("/api/enterprises/P-001").json()["synthetic"] is True
    assert client.get("/api/enterprises/P-999").status_code == 404
    assert client.get("/api/enterprises/invalid").status_code == 422


def test_input_validation_and_routing():
    assert client.post("/api/policies/query", json={"question": ""}).status_code == 422
    assert client.post("/api/policies/query", json={"question": "x" * 1001}).status_code == 422
    assert (
        client.post("/api/orchestrate", json={"question": "VAT anomaly", "enterprise_id": "P-002"}).json()[
            "agent"
        ]
        == "Tax Risk Agent"
    )
    assert (
        client.post("/api/tax/rd", json={"eligible_expensed_rd": -1, "marginal_rate": 0.15}).status_code
        == 422
    )
    assert (
        client.post("/api/tax/rd", json={"eligible_expensed_rd": 10, "marginal_rate": 0.2}).status_code == 422
    )
    assert (
        client.post("/api/tax/rd", json={"eligible_expensed_rd": 10, "marginal_rate": 0.15}).json()[
            "illustrative_tax_effect"
        ]
        == 1.5
    )


def test_live_mode_without_credentials(monkeypatch):
    monkeypatch.setenv("ENABLE_LIVE_AI", "false")
    r = client.post("/api/enterprises/P-001/live-brief")
    assert r.status_code == 503
    assert "尚未配置" in r.json()["detail"]
    assert client.get("/api/health").headers["X-Content-Type-Options"] == "nosniff"
