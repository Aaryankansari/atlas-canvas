const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Free public OSINT data sources ──────────────────────────────────

async function fetchJSON(url: string, timeout = 6000): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// IP intelligence via ip-api.com (free, no key)
async function gatherIPIntel(ip: string) {
  const data = await fetchJSON(
    `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query`
  );
  if (!data || data.status === "fail") return null;
  return data;
}

// Email validation via emailrep.io (free tier) and disify
async function gatherEmailIntel(email: string) {
  const [disify, mailcheck] = await Promise.all([
    fetchJSON(`https://disify.com/api/email/${email}`),
    fetchJSON(`https://api.eva.pingutil.com/email?email=${email}`),
  ]);
  return { disify, mailcheck };
}

// Domain/DNS intel via free APIs
async function gatherDomainIntel(domain: string) {
  const [rdap, dns] = await Promise.all([
    fetchJSON(`https://rdap.org/domain/${domain}`),
    fetchJSON(`https://dns.google/resolve?name=${domain}&type=A`),
  ]);
  return { rdap, dns };
}

// Username search via public profile checks
async function gatherUsernameIntel(username: string) {
  const platforms = [
    { name: "GitHub", url: `https://api.github.com/users/${username}`, key: "login" },
  ];
  
  const results: Array<{ platform: string; found: boolean; data?: any }> = [];
  
  await Promise.all(
    platforms.map(async (p) => {
      try {
        const res = await fetch(p.url, { 
          signal: AbortSignal.timeout(5000),
          headers: { 'User-Agent': 'ICARUS-OSINT/1.0' }
        });
        if (res.ok) {
          const data = await res.json();
          results.push({ platform: p.name, found: true, data });
        } else {
          results.push({ platform: p.name, found: false });
        }
      } catch {
        results.push({ platform: p.name, found: false });
      }
    })
  );
  
  return results;
}

// ── AI analysis with enriched context ────────────────────────────────

async function runAIAnalysis(
  query: string,
  entityType: string,
  realIntel: any,
  apiKey: string
) {
  const intelContext = JSON.stringify(realIntel, null, 2);

  const systemPrompt = `You are an expert OSINT (Open Source Intelligence) analyst with deep expertise in cyber threat intelligence, digital forensics, and investigative research.

You have been given REAL intelligence data gathered from multiple sources. Use this data to produce an accurate, actionable intelligence report.

CRITICAL RULES:
- Base your analysis on the REAL DATA provided — do not fabricate findings
- Clearly distinguish between confirmed facts (from real data) and analytical assessments
- Each finding must have: type, label, value, confidence (high/medium/low)
- Provide specific, actionable recommendations
- Assess risk based on actual indicators found
- For emails: analyze domain reputation, disposability, breach exposure, linked accounts
- For IPs: analyze geolocation, hosting provider, proxy/VPN detection, threat reputation
- For usernames: analyze platform presence, account age, activity patterns, linked identities
- For BTC wallets: analyze wallet type, transaction patterns, known associations
- For domains: analyze registration, DNS, hosting, SSL, reputation

REAL INTELLIGENCE DATA:
${intelContext}

Return ONLY valid JSON. No markdown fences. Exact structure:
{
  "entityType": "${entityType}",
  "summary": "Concise intelligence summary based on real findings",
  "aiBio": "2-3 sentence investigator's brief — who/what is this entity and threat assessment",
  "results": [
    { "type": "category", "label": "Finding Name", "value": "Detail from real data", "confidence": "high|medium|low" }
  ],
  "riskLevel": "low|medium|high|critical",
  "recommendations": ["specific actionable step 1", "step 2"],
  "categories": {
    "aliases": ["confirmed alternate identities"],
    "locations": ["geo locations from real data"],
    "financials": ["financial indicators found"],
    "socials": ["confirmed social profiles"]
  },
  "metadata": {
    "emails": ["email addresses found"],
    "ips": ["IP addresses found"],
    "btcWallets": ["wallet addresses found"],
    "usernames": ["usernames/handles found"],
    "domains": ["domains found"]
  },
  "evidenceLinks": ["real source URLs"],
  "rawIntel": {
    "sourcesQueried": ["list of data sources checked"],
    "dataQuality": "assessment of data completeness"
  }
}`;

  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Produce a structured OSINT intelligence report for this ${entityType} entity: "${query}"`,
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const status = response.status;
    if (status === 429) throw new Error("Rate limit exceeded. Please try again in a moment.");
    if (status === 402) throw new Error("AI credits depleted. Please add credits in Settings.");
    throw new Error(`AI analysis failed (${status})`);
  }

  const aiData = await response.json();
  const content = aiData.choices?.[0]?.message?.content || "";

  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse AI response:", content.slice(0, 200));
    return null;
  }
}

// ── Main handler ─────────────────────────────────────────────────────

Deno.serve(async (req) => {
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

    console.log(`[osint-scan] Scanning ${entityType}: ${query}`);

    // ── Step 1: Gather real intelligence from public APIs ──
    const realIntel: Record<string, any> = { sourcesQueried: [] };

    if (entityType === "ip") {
      const ipData = await gatherIPIntel(query);
      if (ipData) {
        realIntel.ipGeolocation = ipData;
        realIntel.sourcesQueried.push("ip-api.com");
      }
    }

    if (entityType === "email") {
      const emailData = await gatherEmailIntel(query);
      if (emailData.disify) {
        realIntel.emailValidation = emailData.disify;
        realIntel.sourcesQueried.push("disify.com");
      }
      if (emailData.mailcheck) {
        realIntel.emailDeliverability = emailData.mailcheck;
        realIntel.sourcesQueried.push("eva.pingutil.com");
      }
      // Also check the domain part
      const domain = query.split("@")[1];
      if (domain) {
        const domainData = await gatherDomainIntel(domain);
        if (domainData.dns) {
          realIntel.emailDomainDNS = domainData.dns;
          realIntel.sourcesQueried.push("dns.google");
        }
      }
    }

    if (entityType === "domain" || entityType === "general") {
      // Try to extract domain from query
      const domainMatch = query.match(/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}/i);
      if (domainMatch) {
        const domain = domainMatch[0];
        const domainData = await gatherDomainIntel(domain);
        if (domainData.rdap) {
          realIntel.rdap = domainData.rdap;
          realIntel.sourcesQueried.push("rdap.org");
        }
        if (domainData.dns) {
          realIntel.dns = domainData.dns;
          realIntel.sourcesQueried.push("dns.google");
        }
      }
    }

    if (entityType === "general") {
      // For general queries (e.g. names), also try username-style lookups
      const sanitized = query.trim().replace(/\s+/g, "").toLowerCase();
      if (sanitized.length >= 3) {
        const usernameData = await gatherUsernameIntel(sanitized);
        const found = usernameData.filter(p => p.found);
        if (found.length > 0) {
          realIntel.platformChecks = usernameData;
          realIntel.sourcesQueried.push("github.com");
        }
      }
      // Also try email extraction
      const emailMatch = query.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
      if (emailMatch) {
        const emailData = await gatherEmailIntel(emailMatch[0]);
        if (emailData.disify) { realIntel.emailValidation = emailData.disify; realIntel.sourcesQueried.push("disify.com"); }
        if (emailData.mailcheck) { realIntel.emailDeliverability = emailData.mailcheck; realIntel.sourcesQueried.push("eva.pingutil.com"); }
      }
      // Also try IP extraction
      const ipMatch = query.match(/\b(\d{1,3}\.){3}\d{1,3}\b/);
      if (ipMatch) {
        const ipData = await gatherIPIntel(ipMatch[0]);
        if (ipData) { realIntel.ipGeolocation = ipData; realIntel.sourcesQueried.push("ip-api.com"); }
      }
    }

    if (entityType === "username") {
      const usernameData = await gatherUsernameIntel(query);
      realIntel.platformChecks = usernameData;
      realIntel.sourcesQueried.push("github.com");
    }

    console.log(`[osint-scan] Real intel sources: ${realIntel.sourcesQueried.join(", ") || "none"}`);

    // ── Step 2: AI-powered analysis with real data context ──
    const parsed = await runAIAnalysis(query, entityType, realIntel, LOVABLE_API_KEY);

    if (!parsed) {
      return new Response(
        JSON.stringify({
          entityType,
          summary: "Partial analysis — real data gathered but AI parsing failed",
          aiBio: "",
          results: Object.entries(realIntel)
            .filter(([k]) => k !== "sourcesQueried")
            .map(([k, v]) => ({
              type: "raw",
              label: k,
              value: typeof v === "string" ? v : JSON.stringify(v).slice(0, 300),
              confidence: "high",
            })),
          riskLevel: "low",
          categories: { aliases: [], locations: [], financials: [], socials: [] },
          metadata: { emails: [], ips: [], btcWallets: [], usernames: [], domains: [] },
          evidenceLinks: [],
          rawIntel: realIntel,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure all fields
    parsed.aiBio = parsed.aiBio || "";
    parsed.categories = parsed.categories || { aliases: [], locations: [], financials: [], socials: [] };
    parsed.metadata = parsed.metadata || { emails: [], ips: [], btcWallets: [], usernames: [], domains: [] };
    parsed.evidenceLinks = parsed.evidenceLinks || [];
    parsed.rawIntel = { ...realIntel, ...parsed.rawIntel };

    console.log(`[osint-scan] Analysis complete. Risk: ${parsed.riskLevel}, Findings: ${parsed.results?.length || 0}`);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[osint-scan] error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    const status = msg.includes("Rate limit") ? 429 : msg.includes("credits") ? 402 : 500;
    return new Response(
      JSON.stringify({ error: msg }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
