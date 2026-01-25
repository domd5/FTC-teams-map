// ⚡ Initialize map
const map = L.map("map").setView([20, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

const apiToken = "49728AA8-36AE-40E4-9EDC-2B4A4DE5293B";
const ftcAPIBase = "https://ftc-api.firstinspires.org";

// ✨ Fetch all teams
async function fetchTeams() {
  const url = `${ftcAPIBase}/teams?season=2025`; // adjust season as needed
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });
  const data = await resp.json();
  return data.teams || [];
}

// 🔍 Geocode a location string (city, state, country)
async function geocodeLocation(location) {
  const q = encodeURIComponent(location);
  const geocodeURL = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`;
  try {
    const r = await fetch(geocodeURL);
    const results = await r.json();
    if (results && results.length) {
      return {
        lat: parseFloat(results[0].lat),
        lon: parseFloat(results[0].lon),
      };
    }
  } catch (err) {
    console.error("Geocode error:", err);
  }
  return null;
}

// 📍 Add markers for each team
async function plotTeams() {
  const teams = await fetchTeams();

  for (const team of teams) {
    const locParts = [];
    if (team.city) locParts.push(team.city);
    if (team.stateProvince) locParts.push(team.stateProvince);
    if (team.country) locParts.push(team.country);

    const fullLoc = locParts.join(", ");
    if (!fullLoc) continue;

    const coords = await geocodeLocation(fullLoc);
    if (!coords) continue;

    L.marker([coords.lat, coords.lon])
      .addTo(map)
      .bindPopup(`<strong>${team.nickname || team.teamNumber}</strong><br>${fullLoc}`);
  }
}

// 🏁 Run
plotTeams();
