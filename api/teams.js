export default async function handler(req, res) {
  try {
    const season = req.query.season || 2025;
    const username = process.env.FTC_API_USERNAME;
    const key = process.env.FTC_API_KEY;

    const auth = Buffer.from(`${username}:${key}`).toString("base64");

    let page = 1;
    let totalPages = 1;
    let allTeams = [];

    while (page <= totalPages) {
      const url = `https://ftc-api.firstinspires.org/v2.0/${season}/teams?page=${page}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${auth}`
        }
      });

      if (!response.ok) {
        const text = await response.text();
        return res.status(500).json({
          error: "FTC API failed",
          page,
          details: text
        });
      }

      const data = await response.json();

      totalPages = data.pageTotal;
      allTeams = allTeams.concat(data.teams);

      page++;
    }

    // ✅ Filter Wisconsin teams
    const wiTeams = allTeams.filter(
      t => t.stateProv === "WI" && t.country === "USA" && t.city
    );

    res.status(200).json({
      totalTeamsFetched: allTeams.length,
      wiTeamsCount: wiTeams.length,
      wiTeams
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
