const STORAGE_KEY = "threatIntelCases";

export function getCases() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCase(caseRecord) {
  const cases = getCases();
  const next = [caseRecord, ...cases].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function buildCaseFromAnalysis(data) {
  return {
    id: `CASE-${Date.now()}`,
    title: `Threat Case ${new Date().toLocaleDateString('en-GB')}`,
    analyst: localStorage.getItem("threatIntelUser") || "analyst",
    createdAt: new Date().toISOString(),
    source: "Email Intake",
    status: "Open",
    score: data.threatScore || 0,
    level: data.threatLevel || "LOW RISK",
    classification: data.classification || "BENIGN",
    summary: data.summary || "Suspicious email review completed.",
  };
}
