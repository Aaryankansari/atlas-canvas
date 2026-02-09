const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Deep search edge function — performs multi-pass intelligence analysis.
 * Pass 1: Gather OSINT from public APIs
 * Pass 2: AI-powered deep analysis with cross-referencing
 * Pass 3: Threat assessment and recommendation synthesis
 */

async function fetchSafe(url: string, options?: RequestInit, timeout = 8000): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ── Public intelligence sources ──

async function ipIntel(ip: string) {
  const [geoData, abuseData] = await Promise.all([
    fetchSafe(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting`),
    fetchSafe(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, {
      headers: { 'Key': Deno.env.get('ABUSEIPDB_API_KEY') || '', 'Accept': 'application/json' }
    }),
  ]);
  return { geolocation: geoData, abuseReport: abuseData?.data || null };
}

async function emailIntel(email: string) {
  const domain = email.split("@")[1];
  const [validation, dns, domainAge] = await Promise.all([
    fetchSafe(`https://api.eva.pingutil.com/email?email=${email}`),
    domain ? fetchSafe(`https://dns.google/resolve?name=${domain}&type=MX`) : null,
    domain ? fetchSafe(`https://dns.google/resolve?name=${domain}&type=SOA`) : null,
  ]);
  return { validation, domainMX: dns, domainSOA: domainAge };
}

async function domainIntel(domain: string) {
  const [dns_a, dns_mx, dns_ns, dns_txt, rdap] = await Promise.all([
    fetchSafe(`https://dns.google/resolve?name=${domain}&type=A`),
    fetchSafe(`https://dns.google/resolve?name=${domain}&type=MX`),
    fetchSafe(`https://dns.google/resolve?name=${domain}&type=NS`),
    fetchSafe(`https://dns.google/resolve?name=${domain}&type=TXT`),
    fetchSafe(`https://rdap.org/domain/${domain}`),
  ]);
  return { dns: { A: dns_a, MX: dns_mx, NS: dns_ns, TXT: dns_txt }, rdap };
}

async function usernameIntel(username: string) {
  const checks = [
    { platform: "GitHub", url: `https://api.github.com/users/${username}` },
    { platform: "GitLab", url: `https://gitlab.com/api/v4/users?username=${username}` },
  ];

  const results: Array<{ platform: string; exists: boolean; profile?: any }> = [];
  await Promise.all(
    checks.map(async (c) => {
      try {
        const res = await fetch(c.url, {
          signal: AbortSignal.timeout(5000),
          headers: { "User-Agent": "ICARUS-OSINT/1.0" },
        });
        if (res.ok) {
          const data = await res.json();
          const profile = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;
          results.push({
            platform: c.platform,
            exists: !!profile,
            profile: profile ? {
              name: profile.name || profile.login || profile.username,
              bio: profile.bio,
              avatar: profile.avatar_url,
              url: profile.html_url || profile.web_url,
              created: profile.created_at,
              followers: profile.followers,
              repos: profile.public_repos,
            } : undefined,
          });
        } else {
          results.push({ platform: c.platform, exists: false });
        }
      } catch {
        results.push({ platform: c.platform, exists: false });
      }
    })
  );
  return results;
}

// ── Deep AI Analysis (multi-pass) ──

async function deepAnalysis(
  query: string,
  entityType: string,
  realIntel: any,
  apiKey: string
) {
  const systemPrompt = `You are ICARUS, an elite OSINT intelligence analyst AI. You perform deep multi-source analysis comparable to tools like Maltego, SpiderFoot, and Shodan.

You have been provided with REAL intelligence data from automated collection. Your task is to:

1. ANALYZE the raw intelligence data thoroughly
2. CROSS-REFERENCE findings to identify patterns and connections
3. IDENTIFY potential risks, threats, and anomalies
4. GENERATE actionable intelligence recommendations
5. CREATE a comprehensive threat profile

INTELLIGENCE DATA COLLECTED:
${JSON.stringify(realIntel, null, 2)}

ANALYSIS FRAMEWORK:
- Attribution Analysis: Who owns/operates this entity?
- Network Analysis: What infrastructure is connected?
- Behavioral Analysis: What patterns are evident?
- Threat Assessment: What risks does this entity pose or face?
- OPSEC Analysis: What operational security indicators are present?

OUTPUT FORMAT — Return ONLY valid JSON:
{
  "entityType": "${entityType}",
  "classification": "benign|suspicious|malicious|unknown",
  "summary": "Executive summary of key intelligence findings",
  "aiBio": "Detailed 3-4 sentence investigator's brief with key threat indicators and attribution assessment",
  "threatProfile": {
    "overallRisk": "low|medium|high|critical",
    "confidenceLevel": "high|medium|low",
    "threatActorType": "none|individual|group|state|automated|unknown",
    "indicators": ["list of threat indicators found"]
  },
  "results": [
    {
      "type": "category",
      "label": "Finding Name", 
      "value": "Detailed finding with evidence",
      "confidence": "high|medium|low",
      "source": "data source name"
    }
  ],
  "riskLevel": "low|medium|high|critical",
  "networkMap": {
    "nodes": ["connected entities discovered"],
    "relationships": ["entity A -> relationship -> entity B"]
  },
  "timeline": [
    { "date": "YYYY-MM-DD or approximate", "event": "what happened" }
  ],
  "recommendations": [
    { "priority": "high|medium|low", "action": "specific actionable step", "rationale": "why this matters" }
  ],
  "categories": {
    "aliases": ["confirmed alternate identities"],
    "locations": ["geo locations from real data"],
    "financials": ["financial indicators found"],
    "socials": ["confirmed social profiles"],
    "infrastructure": ["servers, domains, IPs linked"],
    "associates": ["known associated entities"]
  },
  "metadata": {
    "emails": [],
    "ips": [],
    "btcWallets": [],
    "usernames": [],
    "domains": []
  },
  "evidenceLinks": ["real URLs"],
  "pivotSuggestions": [
    { "entity": "something to investigate next", "type": "email|ip|domain|username", "rationale": "why investigate this" }
  ]
}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Perform deep intelligence analysis on this ${entityType} entity: "${query}"` },
      ],
    }),
  });

  if (!res.ok) {
    const status = res.status;
    if (status === 429) throw new Error("Rate limit exceeded");
    if (status === 402) throw new Error("AI credits depleted");
    throw new Error(`AI failed (${status})`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";
  try {
    return JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
  } catch {
    console.error("[deep-search] AI parse failed:", content.slice(0, 200));
    return null;
  }
}

// ── Main ─────────────────────────────────────────────────────────────

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

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[deep-search] Deep scan: ${entityType} — ${query}`);

    // ── Gather real intelligence ──
    const intel: Record<string, any> = { sources: [], collectedAt: new Date().toISOString() };

    switch (entityType) {
      case "ip": {
        const data = await ipIntel(query);
        if (data.geolocation) { intel.geolocation = data.geolocation; intel.sources.push("ip-api.com"); }
        if (data.abuseReport) { intel.abuseReport = data.abuseReport; intel.sources.push("abuseipdb.com"); }
        break;
      }
      case "email": {
        const data = await emailIntel(query);
        if (data.validation) { intel.emailValidation = data.validation; intel.sources.push("eva.pingutil.com"); }
        if (data.domainMX) { intel.domainMX = data.domainMX; intel.sources.push("dns.google/MX"); }
        // Also check username part
        const username = query.split("@")[0];
        const usrData = await usernameIntel(username);
        intel.usernameChecks = usrData;
        intel.sources.push("github.com", "gitlab.com");
        break;
      }
      case "domain": {
        const data = await domainIntel(query);
        intel.dns = data.dns;
        intel.rdap = data.rdap;
        intel.sources.push("dns.google", "rdap.org");
        break;
      }
      case "username": {
        const data = await usernameIntel(query);
        intel.platformPresence = data;
        intel.sources.push("github.com", "gitlab.com");
        break;
      }
      default: {
        // General — try to extract entities
        const emailMatch = query.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
        const ipMatch = query.match(/\b(\d{1,3}\.){3}\d{1,3}\b/);
        const domainMatch = query.match(/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}/i);
        
        if (emailMatch) {
          const data = await emailIntel(emailMatch[0]);
          intel.emailIntel = data;
          intel.sources.push("eva.pingutil.com");
        }
        if (ipMatch) {
          const data = await ipIntel(ipMatch[0]);
          intel.ipIntel = data;
          intel.sources.push("ip-api.com");
        }
        if (domainMatch && !emailMatch) {
          const data = await domainIntel(domainMatch[0]);
          intel.domainIntel = data;
          intel.sources.push("dns.google");
        }
      }
    }

    console.log(`[deep-search] Sources queried: ${intel.sources.join(", ")}`);

    // ── Deep AI analysis ──
    const analysis = await deepAnalysis(query, entityType, intel, apiKey);

    if (!analysis) {
      return new Response(
        JSON.stringify({
          entityType,
          summary: "Deep scan collected raw intelligence — AI synthesis unavailable",
          aiBio: "",
          results: [],
          riskLevel: "unknown",
          categories: { aliases: [], locations: [], financials: [], socials: [], infrastructure: [], associates: [] },
          metadata: { emails: [], ips: [], btcWallets: [], usernames: [], domains: [] },
          evidenceLinks: [],
          rawIntel: intel,
          pivotSuggestions: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Ensure all fields
    analysis.aiBio = analysis.aiBio || "";
    analysis.categories = {
      aliases: [], locations: [], financials: [], socials: [], infrastructure: [], associates: [],
      ...analysis.categories,
    };
    analysis.metadata = analysis.metadata || { emails: [], ips: [], btcWallets: [], usernames: [], domains: [] };
    analysis.evidenceLinks = analysis.evidenceLinks || [];
    analysis.pivotSuggestions = analysis.pivotSuggestions || [];
    analysis.networkMap = analysis.networkMap || { nodes: [], relationships: [] };
    analysis.timeline = analysis.timeline || [];
    analysis.recommendations = analysis.recommendations || [];
    analysis.rawIntel = intel;

    console.log(`[deep-search] Complete. Classification: ${analysis.classification}, Risk: ${analysis.riskLevel}`);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[deep-search] error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
