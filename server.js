import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import fetch from "node-fetch";
import { v7 as uuidv7 } from "uuid";
import Profile from "./models/profileModel.js";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONG_URI)
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log("Server running and connected to DB");
    });
  })
  .catch((err) => console.error("DB connection error:", err));

// Helper to fetch JSON
async function fetch_json(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}


// POST /api/profiles

app.post("/api/profiles", async (req, res) => {
  const name = req.body?.name?.trim();

  // 400 - Missing or empty name
  if (!name || typeof name !== "string" || name === "") {
    return res.status(400).json({
      status: "error",
      message: "Invalid or missing name"
    });
  }

  try {
    const [gender_data, age_data, country_data] = await Promise.all([
      fetch_json(`https://api.genderize.io/?name=${encodeURIComponent(name)}`),
      fetch_json(`https://api.agify.io/?name=${encodeURIComponent(name)}`),
      fetch_json(`https://api.nationalize.io/?name=${encodeURIComponent(name)}`)
    ]);

    // === Edge Case Handling ===
    // Genderize: gender null or count 0 → 502
    if (!gender_data.gender || gender_data.count === 0) {
      return res.status(502).json({
        status: "error",
        message: "Genderize returned an invalid response"
      });
    }

    // Agify: age null → 502
    if (age_data.age === null || age_data.age === undefined) {
      return res.status(502).json({
        status: "error",
        message: "Agify returned an invalid response"
      });
    }

    // Nationalize: no country data → 502
    const top_country = country_data.country?.[0];
    if (!top_country || !top_country.country_id) {
      return res.status(502).json({
        status: "error",
        message: "Nationalize returned an invalid response"
      });
    }

    // Age group logic
    const age = age_data.age;
    let age_group;
    if (age <= 12) age_group = "child";
    else if (age <= 19) age_group = "teenager";
    else if (age <= 50) age_group = "adult";
    else age_group = "senior";

    // Final profile object
    const result = {
      id: uuidv7(),
      name,
      gender: gender_data.gender,
      gender_probability: gender_data.probability,
      sample_size: gender_data.count,
      age,
      age_group,
      country_id: top_country.country_id,
      country_probability: top_country.probability,
      processed_at: new Date().toISOString()
    };

    await Profile.create(result);

    return res.status(201).json({
      status: "success",
      data: result
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
});


// GET /api/profiles

app.get("/api/profiles", async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ processed_at: -1 });
    res.json({
      status: "success",
      data: profiles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
});


// GET /api/profiles/:id

app.get("/api/profiles/:id", async (req, res) => {
  try {
    const profile = await Profile.findOne({ id: req.params.id });

    if (!profile) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found"
      });
    }

    res.json({
      status: "success",
      data: profile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
});


// DELETE /api/profiles/:id

app.delete("/api/profiles/:id", async (req, res) => {
  try {
    const deleted = await Profile.findOneAndDelete({ id: req.params.id });

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found"
      });
    }

    res.json({
      status: "success",
      message: "Profile deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
});