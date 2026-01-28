const geoCache = new Map();
const cityGeoCache = {};

  
async function geocodeCity(city) {
  if (geoCache.has(city)) return geoCache.get(city);

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    city + ", China"
  )}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "FTC-CN-Teams-Map"
    }
  });

  const data = await res.json();
  if (!data.length) return null;

  const coords = {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon)
  };

  geoCache.set(city, coords);
  return coords;
}

export default async function handler(req, res) {
  try {
    const season = req.query.season || 2025;

    const username = process.env.FTC_API_USERNAME;
    const key = process.env.FTC_API_KEY;

    const auth = Buffer.from(`${username}:${key}`).toString("base64");

    let page = 1;
    let totalPages = 1;
    let results = [];

    let cnTeams = [];

    while (page <= totalPages) {
      const url = `https://ftc-api.firstinspires.org/v2.0/${season}/teams?page=${page}`;
    
      //const ftcURL = `https://ftc-api.firstinspires.org/v2.0/${season}/teams`;
      const ftcRes = await fetch(url, {
        headers: {
          Authorization: `Basic ${auth}`
        }
      });

      if (!ftcRes.ok) {
        const text = await ftcRes.text();
        return res.status(500).json({
          error: "FTC API failed",
          details: text
        });
      }

      const data = await ftcRes.json();

      const newCnTeams = data.teams.filter(
        t => t.stateProv === "CN" && t.city 
      );

      totalPages = data.pageTotal;
      cnTeams = cnTeams.concat(newCnTeams);

      page++;
    }

    for (const team of cnTeams) {
      //const coords = await geocodeCity(team.city);
      //if (!coords) continue;
        if (!team.city) continue;

        // ✅ LEVEL 2 CACHE
        if (!cityGeoCache[team.city]) {
        cityGeoCache[team.city] = await geocodeCity(team.city);
            }

        const coords = cityGeoCache[team.city];
        if (!coords) continue;


      results.push({
        teamNumber: team.teamNumber,
        nameShort: team.nameShort,
        city: team.city,
        lat: coords.lat,
        lon: coords.lon
      });
    }

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  }