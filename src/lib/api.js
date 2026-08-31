export async function analyzeEmailInput(emailText) {
  const response = await fetch('/api/analyze-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: emailText })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Unable to analyze email.');
  }

  return response.json();
}

export async function analyzeGeoIP(ip) {
  const response = await fetch(`/api/geolocate?ip=${encodeURIComponent(ip)}`);

  if (!response.ok) {
    throw new Error('Unable to analyze IP address.');
  }

  return response.json();
}
