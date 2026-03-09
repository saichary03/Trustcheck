import express from "express";
import { createServer as createViteServer } from "vite";
import whois from "whois-json";
import sslChecker from "ssl-checker";
import axios from "axios";
import dns from "dns";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lookup = promisify(dns.lookup);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/analyze/domain", async (req, res) => {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: "Domain is required" });

    // Clean domain name
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];

    try {
      const results: any = { domain: cleanDomain };

      // 1. DNS Lookup
      try {
        const { address } = await lookup(cleanDomain);
        results.ip = address;
      } catch (e) {
        results.ip = "Unknown";
      }

      // 2. Whois
      try {
        const whoisData = await whois(cleanDomain);
        results.whois = {
          registrar: whoisData.registrar || "Unknown",
          creationDate: whoisData.creationDate || whoisData.created || "Unknown",
          expirationDate: whoisData.expirationDate || whoisData.expires || "Unknown",
        };
      } catch (e) {
        results.whois = { registrar: "Unknown", creationDate: "Unknown", expirationDate: "Unknown" };
      }

      // 3. SSL Check
      try {
        const ssl: any = await sslChecker(cleanDomain);
        results.ssl = {
          valid: ssl.valid,
          daysRemaining: ssl.daysRemaining,
          issuer: ssl.issuer || "Unknown",
        };
      } catch (e) {
        results.ssl = { valid: false, daysRemaining: 0, issuer: "None" };
      }

      // 4. IP Geolocation
      if (results.ip !== "Unknown") {
        try {
          const geo = await axios.get(`http://ip-api.com/json/${results.ip}`);
          results.geo = {
            country: geo.data.country,
            city: geo.data.city,
            isp: geo.data.isp,
          };
        } catch (e) {
          results.geo = { country: "Unknown", city: "Unknown", isp: "Unknown" };
        }
      } else {
        results.geo = { country: "Unknown", city: "Unknown", isp: "Unknown" };
      }

      // 5. Trust Score Calculation
      let score = 0;
      if (results.ssl.valid) score += 20;
      
      if (results.whois.creationDate !== "Unknown") {
        try {
          const created = new Date(results.whois.creationDate);
          const ageYears = (new Date().getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 365);
          if (ageYears > 3) score += 20;
          else if (ageYears > 1) score += 10;
        } catch (e) {}
      }
      
      // Mocking VirusTotal and Safe Browsing for now
      // In a real scenario, we'd use process.env.VIRUSTOTAL_API_KEY
      const isMalwareFree = true; 
      const isNotPhishing = true; 
      
      if (isMalwareFree) score += 30;
      if (isNotPhishing) score += 30;

      results.trustScore = score;
      results.riskLevel = score > 75 ? "Low" : score > 45 ? "Medium" : "High";

      // Technology Detection (Mock/Simple)
      results.technologies = ["React", "Node.js", "Nginx"];

      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Analysis failed" });
    }
  });

  // App Analysis Mock (Since there's no easy free API for this without keys)
  app.post("/api/analyze/app", async (req, res) => {
    const { appName } = req.body;
    if (!appName) return res.status(400).json({ error: "App name is required" });

    // We'll return a structured mock that the frontend can use, 
    // or the frontend can use Gemini to generate a more realistic report.
    res.json({
      name: appName,
      developer: "Example Dev Inc.",
      category: "Productivity",
      downloads: "1M+",
      rating: 4.5,
      permissions: ["Camera", "Location", "Storage"],
      securityRisk: "Low",
      privacyAnalysis: "Data is encrypted in transit. No third-party sharing detected."
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
