export default async function handler(req, res) {
  try {
    res.status(200).json({
      message: "API route is running",
      env: {
        hasUsername: !!process.env.FTC_API_USERNAME,
        hasKey: !!process.env.FTC_API_KEY
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
