const map = L.map("map").setView([44.5, -89.5], 7);

let avgLat = 0
let avgLong = 0

var myIcon = L.icon({
    iconUrl: 'star.png',
    iconSize: [38, 95],
    //iconAnchor: [22, 94],
    //popupAnchor: [-3, -76],
    //shadowUrl: 'my-icon-shadow.png',
    //shadowSize: [68, 95],
    //shadowAnchor: [22, 94]
});


L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

async function loadTeams() {
  const res = await fetch("/api/teams");
  const teams = await res.json();
  //const teams = data.wiTeams;


  console.log("Teams received:", teams.length);

  for (const team of teams) {
    avgLat = avgLat + team.lat
    avgLong = avgLong + team.lon
    L.marker([team.lat, team.lon])
      .addTo(map)
      .bindPopup(`
        <strong>Team ${team.teamNumber}</strong><br>
        ${team.nameShort || ""}<br>
        ${team.city}, WI
      `);
  }

  avgLat = avgLat / teams.length
  avgLong = avgLong / teams.length

  L.marker([avgLat, avgLong], {icon: myIcon}).addTo(map)
}

loadTeams();
