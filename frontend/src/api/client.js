async function request(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    // Network failure: backend down, no connection, etc.
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  if (!res.ok) {
    // Try to read the error message our backend sends: { error: "..." }
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
      if (body.details) message += ": " + body.details.join(", ");
    } catch (e) {
      // response wasn't JSON; keep the default message
    }
    throw new Error(message);
  }

  return res.json();
}

export function fetchProperties(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  const qs = query.toString();
  return request(`/api/properties${qs ? `?${qs}` : ""}`);
}

export function fetchPropertyDetail(id) {
  return request(`/api/properties/${encodeURIComponent(id)}`);
}
