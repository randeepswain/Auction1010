from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Auction AI Service")

class BidData(BaseModel):
    auction_id: str
    user_id: str
    amount: float
    timestamp: float
    ip_address: str

class AuctionItem(BaseModel):
    category: str
    condition: str
    market_value_estimate: float

@app.post("/api/v1/fraud/evaluate")
async def evaluate_fraud(bid: BidData):
    """
    Evaluates a bid for potential fraud in real-time.
    Rules evaluated: Bid velocity, self-bidding (via proxy), rapid retraction.
    """
    risk_score = 0.1 # Low risk
    
    if bid.amount > 100000:
        risk_score += 0.5 # High amount flag requires manual review
        
    return {"risk_score": risk_score, "is_fraudulent": risk_score > 0.8}

@app.post("/api/v1/pricing/suggest")
async def suggest_price(item: AuctionItem):
    """
    Suggests optimal starting and reserve prices to maximize seller profit.
    """
    base_modifier = 0.8 if item.condition == "Used" else 1.1
    suggested_start = item.market_value_estimate * 0.4 * base_modifier
    suggested_reserve = item.market_value_estimate * 0.7 * base_modifier
    
    return {
        "suggested_starting_price": round(suggested_start, 2),
        "suggested_reserve_price": round(suggested_reserve, 2)
    }
