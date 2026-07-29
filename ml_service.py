from pathlib import Path
import re

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

print("========== USING ML_SERVICE ==========")
print(__file__)
print("======================================")

# ==========================================================
# Paths
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent

#MODEL_PATH = BASE_DIR / "ML" / "linear_regression_model.pkl"
RULES_PATH = BASE_DIR / "ML" / "association_rules.csv"
MODEL_PATH = BASE_DIR / "ML" / "linear_forecasting_model.pkl"

# ==========================================================
# FastAPI App
# ==========================================================

app = FastAPI(
    title="ML Service",
    description="Revenue Prediction and Product Recommendation API",
    version="1.0"
)

model = None


# ==========================================================
# Load Model
# ==========================================================

def get_model():
    global model

    if model is None:

        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model file not found: {MODEL_PATH}"
            )

        try:
            model = joblib.load(MODEL_PATH)

        except Exception as exc:

            try:
                import sklearn
                sk_ver = sklearn.__version__
            except Exception:
                sk_ver = "unknown"

            raise RuntimeError(
                f"Failed to load model ({MODEL_PATH}): {exc}. "
                f"Installed scikit-learn={sk_ver}"
            )

    return model


# ==========================================================
# Request Models
# ==========================================================

#class PredictionRequest(BaseModel):
    #data: dict
class ForecastRequest(BaseModel):
    Year: int
    Month: int
    Quarter: str
    MonthName: str
    IsQ1: int
    IsNewYear: int
    IsSeasonal: int


class RecommendRequest(BaseModel):
    products: list[str]
    top_n: int = 5


class TrendRecord(BaseModel):
    date: str
    revenue: float


class RevenueTrendRequest(BaseModel):
    records: list[TrendRecord]


class AnalyticsRequest(BaseModel):
    records: list[TrendRecord]


# ==========================================================
# Root
# ==========================================================

@app.get("/")
def root():
    return {
        "message": "ML service running"
    }


# ==========================================================
# Revenue Prediction
# ==========================================================

# @app.post("/predict")
# def predict(request: PredictionRequest):

#     try:
#         df = pd.DataFrame([request.data])

#         prediction = get_model().predict(df)[0]

#         return {
#             "predicted_revenue": float(prediction)
#         }

#     except Exception as exc:
#         raise HTTPException(
#             status_code=500,
#             detail=str(exc)
#         )


@app.post("/predict")
def predict(request: ForecastRequest):

    try:

        input_df = pd.DataFrame([{
            "Year": request.Year,
            "Month": request.Month,
            "Quarter": request.Quarter,
            "MonthName": request.MonthName,
            "IsQ1": request.IsQ1,
            "IsNewYear": request.IsNewYear,
            "IsSeasonal": request.IsSeasonal
        }])

        prediction = get_model().predict(input_df)[0]

        return {
            "predicted_monthly_revenue": round(float(prediction), 2)
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc)
        )

# @app.post("/revenue_prediction")
# def revenue_prediction(request: PredictionRequest):
#     return predict(request)


@app.post("/revenue_prediction")
def revenue_prediction(request: ForecastRequest):
    return predict(request)

# ==========================================================
# Revenue Trends
# ==========================================================

@app.post("/revenue_trends")
def revenue_trends(request: RevenueTrendRequest):

    if len(request.records) == 0:
        raise HTTPException(
            status_code=400,
            detail="At least one revenue record is required"
        )

    df = pd.DataFrame([r.model_dump() for r in request.records])

    df["date"] = pd.to_datetime(df["date"], errors="coerce")

    if df["date"].isna().any():
        raise HTTPException(
            status_code=400,
            detail="Invalid date format"
        )

    df["month"] = df["date"].dt.strftime("%Y-%m")

    monthly = (
        df.groupby("month")["revenue"]
        .sum()
        .reset_index()
    )

    monthly_revenue = monthly.to_dict(orient="records")

    total_revenue = float(monthly["revenue"].sum())

    average_revenue = (
        float(monthly["revenue"].mean())
        if len(monthly) > 0
        else 0
    )

    if len(monthly) > 1:
        first_revenue = monthly.iloc[0]["revenue"]
        last_revenue = monthly.iloc[-1]["revenue"]

        if last_revenue > first_revenue:
            trend_direction = "increasing"
        elif last_revenue < first_revenue:
            trend_direction = "decreasing"
        else:
            trend_direction = "stable"
    else:
        trend_direction = "stable"

    return {
        "monthly_revenue": monthly_revenue,
        "total_revenue": total_revenue,
        "average_revenue": average_revenue,
        "record_count": len(monthly),
        "trend_direction": trend_direction
    }

# ==========================================================
# Analytics
# ==========================================================


@app.post("/analytics")
def analytics(request: AnalyticsRequest):

    if len(request.records) == 0:
        raise HTTPException(
            status_code=400,
            detail="At least one record is required"
        )

    df = pd.DataFrame([r.dict() for r in request.records])

    df["date"] = pd.to_datetime(df["date"], errors="coerce")

    if df["date"].isna().any():
        raise HTTPException(
            status_code=400,
            detail="Invalid date format"
        )

    df["month"] = df["date"].dt.strftime("%Y-%m")

    monthly = (
        df.groupby("month")["revenue"]
        .sum()
        .reset_index()
    )

    average_revenue = float(df["revenue"].mean())

    direction = "stable"

    if len(monthly) > 1:

        last_month = monthly["revenue"].iloc[-1]
        previous_month = monthly["revenue"].iloc[-2]

        if last_month > previous_month:
            direction = "up"

        elif last_month < previous_month:
            direction = "down"

    return {
        "monthly_revenue": monthly.to_dict(orient="records"),
        "total_revenue": float(df["revenue"].sum()),
        "average_revenue": average_revenue,
        "record_count": len(df),
        "trend_direction": direction
    }


# ==========================================================
# Parse frozensets
# ==========================================================

def parse_rule_value(value):

    if pd.isna(value):
        return []

    matches = re.findall(r"'([^']*)'", str(value))

    return matches


# ==========================================================
# Association Rules
# ==========================================================

@app.get("/association_rules")
def association_rules(
        top: int = Query(10, ge=1, le=50)
):

    if not RULES_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Association rule file not found: {RULES_PATH}"
        )

    df = pd.read_csv(RULES_PATH)

    rules = []

    for _, row in df.head(top).iterrows():

        rules.append({
            "antecedents": parse_rule_value(row["antecedents"]),
            "consequents": parse_rule_value(row["consequents"]),
            "support": float(row["support"]),
            "confidence": float(row["confidence"]),
            "lift": float(row["lift"])
        })

    return {
        "count": len(rules),
        "rules": rules
    }


# ==========================================================
# Product Recommendation
# ==========================================================

@app.post("/recommend")
def recommend(request: RecommendRequest):

    if len(request.products) == 0:
        raise HTTPException(
            status_code=400,
            detail="At least one product is required"
        )

    if not RULES_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Association rule file not found: {RULES_PATH}"
        )

    df = pd.read_csv(RULES_PATH)

    selected_products = {
        product.lower().strip()
        for product in request.products
    }

    matched_rules = []

    for _, row in df.iterrows():

        antecedents = parse_rule_value(row["antecedents"])
        consequents = parse_rule_value(row["consequents"])

        antecedent_set = {
            item.lower().strip()
            for item in antecedents
        }

        if antecedent_set and antecedent_set.issubset(selected_products):

            matched_rules.append({
                "antecedents": antecedents,
                "consequents": consequents,
                "support": float(row["support"]),
                "confidence": float(row["confidence"]),
                "lift": float(row["lift"])
            })

    matched_rules = sorted(
        matched_rules,
        key=lambda x: x["confidence"],
        reverse=True
    )

    recommendations = []

    for rule in matched_rules:

        for item in rule["consequents"]:

            if (
                item not in recommendations
                and item.lower() not in selected_products
            ):
                recommendations.append(item)

            if len(recommendations) >= request.top_n:
                break

    return {
        "recommendations": recommendations[:request.top_n],
        "rules": matched_rules[:request.top_n]
    }


# ==========================================================
# Health Check
# ==========================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model_exists": MODEL_PATH.exists(),
        "rules_exist": RULES_PATH.exists()
    }


# ==========================================================
# Run
# ==========================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "ml_service:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
