// Center on Wisconsin
const map = L.map("map").setView([44.5, -89.5], 7);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Fetch WI teams from Vercel API
async function fetchTeams() {
  const res = await fetch("/api/teams");
  const data = await res.json();

  if (!Array.isArray(data)) {
    console.error("Expected array, got:", data);
    return [];
  }

  return data;
}


// Geocode using OpenStreetMap
async function geocode(location) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon)
  };
}

async function plotTeams() {
  const teams = await fetchTeams();

  for (const team of teams) {
    if (!team.city) continue;

    const location = `${team.city}, WI, USA`;
    const cacheKey = `coords-${team.teamNumber}`;

    let coords = localStorage.getItem(cacheKey);

    if (coords) {
      coords = JSON.parse(coords);
    } else {
      coords = await geocode(location);
      if (!coords) continue;
      localStorage.setItem(cacheKey, JSON.stringify(coords));
    }

    L.marker([coords.lat, coords.lon])
      .addTo(map)
      .bindPopup(`
        <strong>Team ${team.teamNumber}</strong><br>
        ${team.nickname || ""}
      `);
  }
}

plotTeams();
