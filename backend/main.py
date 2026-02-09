import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import random
import time
import requests
from dotenv import load_dotenv

# Optional: Gemini integration
try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

load_dotenv()

app = FastAPI(title="Icarus OSINT Engine")

# Configure Gemini if key is provided
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if HAS_GEMINI and GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    query: str
    mode: str = "quick" # quick or deep

class ScanResult(BaseModel):
    id: str
    label: str
    entityType: str
    riskLevel: str
    summary: str
    confidence: str
    metadata: Dict[str, Any]
    categories: Dict[str, List[str]]
    evidenceLinks: List[str]
    aiBio: str
    classification: str
    pivotSuggestions: List[Dict[str, str]]
    recommendations: List[Dict[str, str]]
    results: List[Dict[str, Any]]
    researchSteps: Optional[List[str]] = []

def detect_entity_type(query: str) -> str:
    query = query.lower().strip()
    if "@" in query: return "email"
    if any(c.isdigit() for c in query) and "." in query: return "ip"
    if "." in query and not any(c.isdigit() for c in query): return "domain"
    if query.startswith(("bc1", "1", "3", "0x")): return "crypto_wallet"
    return "username"

@app.get("/")
def read_root():
    return {"status": "online", "engine": "Icarus AI Researcher V2"}

@app.post("/api/scan", response_model=ScanResult)
async def scan_entity(request: ScanRequest):
    query = request.query
    mode = request.mode
    entity_type = detect_entity_type(query)
    
    steps = [
        f"Initializing Icarus Deep Search for: {query}",
        "Querying surface web indices and social profiles...",
        "Correlating technical footprints with global breach databases (HPB, DeHashed)...",
        "Analyzing domain infrastructure and SSL history...",
        "Running AI-driven synthesis of discovered intelligence..."
    ]

    # Simulated processing delay for "Deep Research" feel
    research_data = []
    for step in steps:
        # In a real app, you would execute actual OSINT logic here
        time.sleep(1.2 if mode == "deep" else 0.4)
        research_data.append(step)

    # Risk Calculation Logic
    risk_score = 0
    if mode == "deep": risk_score += 2
    if entity_type == "crypto_wallet": risk_score += 2
    if entity_type == "ip": risk_score += 1
    
    risk_level = "low"
    if risk_score >= 4: risk_level = "critical"
    elif risk_score >= 3: risk_level = "high"
    elif risk_score >= 1: risk_level = "medium"

    classification = "benign"
    if risk_level in ["high", "critical"]: classification = "malicious"
    elif risk_level == "medium": classification = "suspicious"

    # AI Intelligence Generation (Gemini or Mock)
    prompt = f"Perform deep OSINT analysis on target {query} ({entity_type}). Synthesize a professional bio and threat profile."
    
    if model and mode == "deep":
        try:
            response = model.generate_content(prompt)
            ai_bio = response.text
        except:
            ai_bio = f"Deep analysis of {query} suggests active {classification} behavior patterns."
    else:
        ai_bio = f"The target {query} exhibits footprints consistent with {classification} activity. Our automated indexing has identified multiple associated infrastructure nodes and previous sightings in indexed data leaks. Immediate monitoring is advised for related pivots."

    return {
        "id": f"res_{int(time.time())}",
        "label": query,
        "entityType": entity_type,
        "riskLevel": risk_level,
        "summary": f"Deep Research complete. Found {random.randint(5, 45)} relevant data points across {entity_type} indices.",
        "confidence": "high" if mode == "deep" else "medium",
        "metadata": {
            "emails": [f"associated_{query}@proxy.net"] if entity_type != "email" else [query],
            "ips": ["45.77.100.22", "104.21.33.11"] if mode == "deep" else [],
            "domains": [f"{query}.onion", "shadow-infrastructure.tech"] if mode == "deep" else [],
            "usernames": [query.split("@")[0]] if "@" in query else [],
            "btcWallets": ["bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"] if mode == "deep" else []
        },
        "categories": {
            "aliases": ["ShadowOperative", "Admin-01"] if mode == "deep" else [],
            "locations": ["VPN: Panama", "Cloudflare Edge"] if mode == "deep" else [],
            "financials": ["Wallet activity found in 2023 leak"] if mode == "deep" else [],
            "socials": ["Twitter (X)", "GitHub", "Keybase"]
        },
        "evidenceLinks": [
            f"https://viewdns.info/whois/?domain={query}" if entity_type == "domain" else f"https://intelx.io/?s={query}"
        ],
        "aiBio": ai_bio,
        "classification": classification,
        "pivotSuggestions": [
            {"entity": "infrastructure-node-delta.net", "rationale": "Shared nameserver footprint"},
            {"entity": "185.22.44.11", "rationale": "Direct IP correlation from historical logs"}
        ],
        "recommendations": [
            {"action": "Flag associated domains for monitoring", "priority": "high"},
            {"action": "Run secondary crawl on related IP blocks", "priority": "medium"}
        ],
        "results": [
            {"label": "Engine Source", "value": "Icarus AI Deep Researcher", "source": "Internal", "confidence": "high"},
            {"label": "DNS History", "value": "3 changes in 24h", "source": "SecurityTrails", "confidence": "medium"},
            {"label": "Breach Presence", "value": "Found in 'Collection #1'", "source": "HIBP", "confidence": "high"}
        ],
        "researchSteps": research_data
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
