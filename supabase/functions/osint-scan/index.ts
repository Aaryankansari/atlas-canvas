import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, entityType } = await req.json();

    if (!query || !entityType) {
      return new Response(
        JSON.stringify({ error: "query and entityType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert OSINT (Open Source Intelligence) analyst. Given a query entity, produce a structured intelligence report.

RULES:
- Analyze the entity type and provide relevant intelligence findings
- Each finding must have: type, label, value, confidence (high/medium/low)
- For emails: extract domain, possible usernames, check common breach patterns, social media associations
- For IPs: identify likely ISP, geolocation region, reputation indicators
- For usernames: identify platforms where handle is commonly found, associated personas
- For BTC addresses: identify wallet type, transaction pattern indicators
- For general queries: extract entities, relationships, key intelligence

IMPORTANT: Return ONLY valid JSON. No markdown. No explanation outside JSON.

Return a JSON object with this exact structure:
{
  "entityType": "email|ip|username|btc|general",
  "summary": "One-line intelligence summary",
  "aiBio": "A 2-sentence investigator's brief summarizing who/what this entity is and why it matters.",
  "results": [
    {
      "type": "category_name",
      "label": "Human-readable label",
      "value": "The finding detail",
      "confidence": "high|medium|low"
    }
  ],
  "riskLevel": "low|medium|high|critical",
  "recommendations": ["actionable step 1", "actionable step 2"],
  "categories": {
    "aliases": ["known aliases or alternate names"],
    "locations": ["associated geographic locations"],
    "financials": ["financial indicators, wallets, transactions"],
    "socials": ["social media profiles, handles, platforms"]
  },
  "metadata": {
    "emails": ["any email addresses found"],
    "ips": ["any IP addresses found"],
    "btcWallets": ["any BTC wallet addresses found"],
    "usernames": ["any usernames/handles found"],
    "domains": ["any domains found"]
  },
  "evidenceLinks": ["https://example.com/source1"]
}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Analyze this ${entityType} entity for OSINT intelligence: "${query}"`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      parsed = {
        entityType,
        summary: "Analysis complete",
        aiBio: "",
        results: [
          { type: "raw", label: "AI Analysis", value: content.slice(0, 500), confidence: "medium" },
        ],
        riskLevel: "low",
        recommendations: [],
        categories: { aliases: [], locations: [], financials: [], socials: [] },
        metadata: { emails: [], ips: [], btcWallets: [], usernames: [], domains: [] },
        evidenceLinks: [],
      };
    }

    // Ensure all fields exist
    parsed.aiBio = parsed.aiBio || "";
    parsed.categories = parsed.categories || { aliases: [], locations: [], financials: [], socials: [] };
    parsed.metadata = parsed.metadata || { emails: [], ips: [], btcWallets: [], usernames: [], domains: [] };
    parsed.evidenceLinks = parsed.evidenceLinks || [];

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("osint-scan error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
