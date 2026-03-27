const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

router.post("/speak", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Text is required" });
    }

    console.log(`🎤 Voice request received: "${text.substring(0, 60)}..."`);

    // Try ElevenLabs first (in case you upgrade later)
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`,
      {
        text: text.trim(),
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.9,
          style: 0.6,
          use_speaker_boost: true
        }
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    console.log("✅ ElevenLabs voice generated");
    res.set({ "Content-Type": "audio/mpeg" });
    return res.send(response.data);

  } catch (error) {
    const errorMsg = error.response?.data 
      ? JSON.stringify(error.response.data) 
      : error.message;

    console.error("❌ ElevenLabs failed:", errorMsg);

    // Return error so frontend can fallback cleanly
    res.status(500).json({ 
      error: "Voice generation failed", 
      detail: errorMsg 
    });
  }
});

module.exports = router;