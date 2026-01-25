export default async function handler(req, res) {
  try {
    const season = req.query.season || 2025;
    const username = process.env.FTC_API_USERNAME;
    const authKey = process.env.FTC_API_KEY;

    const auth = Buffer.from(`${username}:${authKey}`).toString("base64");
    const url = `https://ftc-api.firstinspires.org/v2.0/${season}/teams`;

    const response = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({
        error: "FTC API request failed",
        status: response.status,
        statusText: response.statusText,
        body: text
      });
    }

    const data = await response.json();

    const wiTeams = data.teams.filter(
      t => t.stateProvince === "WI" && t.country === "USA"
    );

    res.status(200).json(wiTeams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
