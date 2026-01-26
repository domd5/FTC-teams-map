const map = L.map("map").setView([44.5, -89.5], 7);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

async function loadTeams() {
  const res = await fetch("/api/teams");
  const teams = await res.json();
  //const teams = data.wiTeams;


  console.log("Teams received:", teams.length);

  for (const team of teams) {
    L.marker([team.lat, team.lon])
      .addTo(map)
      .bindPopup(`
        <strong>Team ${team.teamNumber}</strong><br>
        ${team.nickname || ""}<br>
        ${team.city}, WI
      `);
  }
}

loadTeams();
