const geoCache = new Map();

async function geocodeCity(city) {
  if (geoCache.has(city)) return geoCache.get(city);

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    city + ", WI, USA"
  )}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "FTC-WI-Teams-Map"
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

    const ftcURL = `https://ftc-api.firstinspires.org/v2.0/${season}/teams`;
    const ftcRes = await fetch(ftcURL, {
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

    const ftcData = await ftcRes.json();

    const wiTeams = ftcData.teams.filter(
      t => t.stateProv === "WI" && t.city
    );

    const results = [];

    for (const team of wiTeams) {
      const coords = await geocodeCity(team.city);
      if (!coords) continue;

      results.push({
        teamNumber: team.teamNumber,
        nickname: team.nickname,
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