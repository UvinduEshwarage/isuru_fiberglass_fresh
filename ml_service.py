from datetime import datetime
from pathlib import Path
import ast

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "ML" / "rf_model.pkl"
RULES_PATH = BASE_DIR / "ML" / "association_rules.csv"

app = FastAPI()

model = None


def get_model():
    global model
    if model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
        model = joblib.load(MODEL_PATH)
    return model


class PredictionRequest(BaseModel):
    data: dict


class TrendRecord(BaseModel):
    date: str
    revenue: float


class RevenueTrendRequest(BaseModel):
    records: list[TrendRecord]


class RecommendRequest(BaseModel):
    products: list[str]
    top_n: int = 5


class AnalyticsRequest(BaseModel):
    records: list[TrendRecord]


@app.get("/")
def root():
    return {"message": "ML service running"}


@app.post("/predict")
def predict(request: PredictionRequest):
    df = pd.DataFrame([request.data])
    try:
        prediction = get_model().predict(df)[0]
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {"predicted_revenue": float(prediction)}


@app.post("/revenue_prediction")
def revenue_prediction(request: PredictionRequest):
    return predict(request)
    df = pd.DataFrame([request.data])
    try:
        prediction = get_model().predict(df)[0]
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    return {"predicted_revenue": float(prediction)}


@app.post("/revenue_trends")
def revenue_trends(request: RevenueTrendRequest):
    if len(request.records) == 0:
        raise HTTPException(
            status_code=400, detail="At least one revenue record is required")

    df = pd.DataFrame([r.dict() for r in request.records])
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    if df["date"].isna().any():
        raise HTTPException(
            status_code=400, detail="All records must include a valid date")

    df["month"] = df["date"].dt.strftime("%Y-%m")
    monthly = df.groupby("month")["revenue"].sum().reset_index()
    return {
        "monthly_revenue": monthly.to_dict(orient="records"),
        "total_revenue": float(df["revenue"].sum()),
        "record_count": len(df),
    }


@app.post("/analytics")
def analytics(request: AnalyticsRequest):
    if len(request.records) == 0:
        raise HTTPException(
            status_code=400, detail="At least one analytics record is required")

    df = pd.DataFrame([r.dict() for r in request.records])
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    if df["date"].isna().any():
        raise HTTPException(
            status_code=400, detail="All records must include a valid date")

    df["month"] = df["date"].dt.strftime("%Y-%m")
    monthly = df.groupby("month")["revenue"].sum().reset_index()
    average_revenue = float(df["revenue"].mean())
    direction = "stable"
    if len(monthly) > 1:
        direction = "up" if monthly["revenue"].iloc[-1] >= monthly["revenue"].iloc[-2] else "down"

    return {
        "monthly_revenue": monthly.to_dict(orient="records"),
        "total_revenue": float(df["revenue"].sum()),
        "average_revenue": average_revenue,
        "record_count": len(df),
        "trend_direction": direction,
    }


@app.post("/recommend")
def recommend(request: RecommendRequest):
    if len(request.products) == 0:
        raise HTTPException(
            status_code=400, detail="At least one product is required")

    if not RULES_PATH.exists():
        raise HTTPException(
            status_code=500, detail=f"Association rule file not found: {RULES_PATH}")

    available_products = {product.strip().lower()
                          for product in request.products}
    df = pd.read_csv(RULES_PATH)
    matches = []

    for row in df.to_dict(orient="records"):
        antecedents = parse_rule_value(row.get("antecedents", "[]"))
        consequents = parse_rule_value(row.get("consequents", "[]"))

        if not isinstance(antecedents, list) or not isinstance(consequents, list):
            continue

        normalized_antecedents = {str(item).strip().lower()
                                  for item in antecedents}
        if normalized_antecedents and normalized_antecedents.issubset(available_products):
            matches.append({
                "antecedents": antecedents,
                "consequents": consequents,
                "support": float(row.get("support", 0.0)),
                "confidence": float(row.get("confidence", 0.0)),
                "lift": float(row.get("lift", 0.0)),
            })

    matches = sorted(matches, key=lambda x: x["confidence"], reverse=True)[
        : request.top_n]
    recommendations = []
    for rule in matches:
        for item in rule["consequents"]:
            if item not in recommendations:
                recommendations.append(item)
                if len(recommendations) >= request.top_n:
                    break
        if len(recommendations) >= request.top_n:
            break

    return {"recommendations": recommendations, "rules": matches}


def parse_rule_value(raw_value: str):
    try:
        return ast.literal_eval(raw_value)
    except Exception:
        return raw_value


@app.get("/association_rules")
def association_rules(top: int = Query(10, ge=1, le=50)):
    if not RULES_PATH.exists():
        raise HTTPException(
            status_code=500, detail=f"Association rule file not found: {RULES_PATH}")

    df = pd.read_csv(RULES_PATH)
    rules = []
    for row in df.to_dict(orient="records")[:top]:
        rules.append({
            "antecedents": parse_rule_value(row.get("antecedents", "[]")),
            "consequents": parse_rule_value(row.get("consequents", "[]")),
            "support": float(row.get("support", 0.0)),
            "confidence": float(row.get("confidence", 0.0)),
            "lift": float(row.get("lift", 0.0)),
        })

    return {"rules": rules, "count": len(rules)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
