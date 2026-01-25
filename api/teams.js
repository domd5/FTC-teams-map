export default async function handler(req, res) {
  try {
    const season = req.query.season || 2025;
    const token = process.env.FTC_API_TOKEN;

    if (!token) {
      return res.status(500).json({ error: "Missing FTC API token" });
    }

    const url = `https://ftc-api.firstinspires.org/teams?season=${season}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return res.status(500).json({ error: "FTC API request failed" });
    }

    const data = await response.json();

    // ✅ Wisconsin-only filter
    const wiTeams = data.teams.filter(
      (team) => team.stateProvince === "WI" && team.country === "USA"
    );

    res.status(200).json(wiTeams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
