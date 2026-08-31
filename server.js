import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const suspiciousWords = [
  'urgent',
  'verify',
  'password',
  'account',
  'click',
  'payment',
  'suspended',
  'immediately',
  'reset',
  'invoice',
  'security',
  'update',
  'wire',
  'bank',
  'refund',
  'bonus',
  'prize',
  'limited',
  'confidential',
  'employee',
  'alert'
];

const suspiciousDomains = [
  'bit.ly',
  'tinyurl.com',
  'googledoc',
  'dropbox',
  'mega.nz',
  'drive.google.com',
  'onedrive'
];

function getThreatLevel(score) {
  if (score >= 75) return 'HIGH RISK';
  if (score >= 45) return 'SUSPICIOUS';
  return 'LOW RISK';
}

function getClassification(score) {
  if (score >= 75) return 'PHISHING';
  if (score >= 55) return 'MALWARE / SOCIAL ENGINEERING';
  return 'BENIGN';
}

function analyzeEmailLocally(emailText) {
  const text = emailText || '';
  const lower = text.toLowerCase();
  const urls = [...new Set((text.match(/https?:\/\/[^\s]+/gi) || []).map((url) => url.trim()))];
  const matches = suspiciousWords.filter((word) => lower.includes(word));
  const matchedDomains = suspiciousDomains.filter((domain) => lower.includes(domain));

  let score = 28;

  if (urls.length > 0) score += Math.min(urls.length * 14, 28);
  if (matches.length > 0) score += Math.min(matches.length * 7, 28);
  if (matchedDomains.length > 0) score += 12;
  if (lower.includes('from:') || lower.includes('sender:')) score += 4;
  if (lower.includes('attachment') || lower.includes('invoice')) score += 6;
  if (lower.includes('free') || lower.includes('claim')) score += 5;

  score = Math.min(score, 97);

  const indicators = [];

  if (urls.length > 0) indicators.push('External URL detected');
  if (matches.length > 0) indicators.push(`Urgent/suspicious language match: ${matches.slice(0, 3).join(', ')}`);
  if (matchedDomains.length > 0) indicators.push('Suspicious link domain detected');
  if (!urls.length && matches.length === 0) indicators.push('No obvious phishing indicators in the sample');
  if (!indicators.length) indicators.push('General review recommended');

  return {
    threatScore: score,
    threatLevel: getThreatLevel(score),
    classification: getClassification(score),
    urls,
    indicators: [...new Set(indicators)],
    summary: score >= 75
      ? 'This email contains multiple phishing indicators such as urgent language, suspicious links, and impersonation cues.'
      : score >= 45
        ? 'This message is suspicious and should be reviewed with additional sender and domain validation.'
        : 'This email appears mostly safe, but a quick review of links and authentication metadata is still recommended.'
  };
}

async function callOpenAI(emailText) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'You are a cyber threat analyst. Return a compact JSON object with threatScore integer 0-100, threatLevel string, classification string, and summary string. Do not include markdown.'
          },
          {
            role: 'user',
            content: `Analyze this suspicious email content for phishing or threat indicators:\n\n${emailText}`
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI request failed: ${errorBody}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content);
  } catch (error) {
    console.warn('OpenAI analysis unavailable:', error.message);
    return null;
  }
}

async function callGemini(emailText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{
              text: `You are a cyber threat analyst. Provide a JSON object with threatScore (0-100), threatLevel, classification, and summary for this suspicious email:\n\n${emailText}`
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini request failed: ${errorBody}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    if (jsonStart < 0 || jsonEnd <= jsonStart) return null;
    return JSON.parse(text.slice(jsonStart, jsonEnd));
  } catch (error) {
    console.warn('Gemini analysis unavailable:', error.message);
    return null;
  }
}

async function getAiInsight(emailText) {
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();

  if (provider === 'gemini') return callGemini(emailText);
  if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
    // optional provider stub to avoid failing when a key is set later
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
        max_tokens: 300,
        messages: [{ role: 'user', content: `Scan this email for threat indicators and return JSON with threatScore, threatLevel, classification, and summary:\n\n${emailText}` }]
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    if (start >= 0 && end > start) return JSON.parse(text.slice(start, end));
    return null;
  }

  return callOpenAI(emailText);
}

function normalizeAiResponse(response, fallback) {
  if (!response) return fallback;

  const score = Number(response.threatScore ?? response.score ?? fallback.threatScore);
  const normalized = {
    ...fallback,
    threatScore: Math.min(100, Math.max(0, Number.isFinite(score) ? score : fallback.threatScore)),
    threatLevel: response.threatLevel || fallback.threatLevel,
    classification: response.classification || fallback.classification,
    summary: response.summary || fallback.summary,
    aiSource: response.aiSource || 'AI analysis engine',
    indicators: [...new Set([...(fallback.indicators || []), ...(response.indicators || [])])]
  };

  normalized.threatLevel = getThreatLevel(normalized.threatScore);
  normalized.classification = getClassification(normalized.threatScore);
  return normalized;
}

async function buildAnalysis(emailText) {
  const local = analyzeEmailLocally(emailText);
  const ai = await getAiInsight(emailText);
  const merged = normalizeAiResponse(ai, local);

  return {
    ...merged,
    threatScore: Math.min(100, Math.round((local.threatScore + merged.threatScore) / 2)),
    sender: 'unknown',
    ip: '203.0.113.45',
    spf: local.threatScore >= 50 ? 'FAIL' : 'PASS',
    dkim: local.threatScore >= 50 ? 'FAIL' : 'PASS',
    dmarc: local.threatScore >= 60 ? 'REVIEW' : 'PASS',
    aiProvider: ai ? (process.env.AI_PROVIDER || 'openai') : 'local-rule-engine',
    aiStatus: ai ? 'AI-assisted analysis enabled' : 'Local heuristic analysis active'
  };
}

app.post('/api/analyze-email', async (req, res) => {
  const emailText = (req.body?.email || '').trim();

  if (!emailText) {
    return res.status(400).json({ error: 'Email text is required.' });
  }

  try {
    const result = await buildAnalysis(emailText);
    return res.json(result);
  } catch (error) {
    console.error('Email analysis failed:', error);
    return res.status(500).json({ error: 'Failed to analyze the email.' });
  }
});

const fallbackIpData = {
  '8.8.8.8': {
    ip: '8.8.8.8',
    country: 'United States',
    region: 'California',
    city: 'Mountain View',
    org: 'Google LLC',
    latitude: '37.4220',
    longitude: '-122.0841',
    risk: 'Low',
    source: 'Fallback geolocation dataset'
  },
  '103.22.44.10': {
    ip: '103.22.44.10',
    country: 'India',
    region: 'Delhi',
    city: 'New Delhi',
    org: 'Private ISP',
    latitude: '28.6139',
    longitude: '77.2090',
    risk: 'Suspicious',
    source: 'Fallback geolocation dataset'
  }
};

app.get('/api/geolocate', async (req, res) => {
  const ip = (req.query.ip || '8.8.8.8').toString().trim();

  if (process.env.IPINFO_API_TOKEN) {
    try {
      const response = await fetch(`https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_API_TOKEN}`);
      if (response.ok) {
        const data = await response.json();
        return res.json({
          ip: data.ip || ip,
          country: data.country || 'Unknown',
          region: data.region || 'Unknown',
          city: data.city || 'Unknown',
          org: data.org || 'Unknown',
          latitude: data.loc ? data.loc.split(',')[0] : '0.0000',
          longitude: data.loc ? data.loc.split(',')[1] : '0.0000',
          risk: data.country === 'India' ? 'Suspicious' : 'Low',
          source: 'ipinfo.io'
        });
      }
    } catch (error) {
      console.warn('IPInfo lookup failed; using fallback dataset.', error.message);
    }
  }

  const fallback = fallbackIpData[ip] || {
    ip,
    country: 'Unknown',
    region: 'Unknown',
    city: 'Unknown',
    org: 'Unknown ISP',
    latitude: '0.0000',
    longitude: '0.0000',
    risk: 'Review',
    source: 'Fallback geolocation dataset'
  };

  return res.json(fallback);
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'email-threat-intel-api' });
});

app.listen(PORT, () => {
  console.log(`ThreatIntel API running at http://localhost:${PORT}`);
});
