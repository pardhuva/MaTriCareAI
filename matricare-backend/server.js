const express = require('express');
const cors = require('cors');
require('dotenv').config();

const OpenAI = require("openai");
const voiceRoutes = require("./routes/voice");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use("/api/voice", voiceRoutes);

let patients = [];
let highRiskAlerts = [];

const ashaWorkers = [
  { id: 1, name: "ASHA Worker 1", region: "Region A" },
  { id: 2, name: "ASHA Worker 2", region: "Region B" }
];

// ==================== IMPROVED AI RISK ASSESSMENT ====================
app.post('/api/submit-symptoms', async (req, res) => {
  const { symptoms, region, voiceTranscript } = req.body;

  const inputText = voiceTranscript || JSON.stringify(symptoms);

  console.log("Received symptoms:", inputText);   // ← Helpful for debugging

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert maternal health risk assessor for pregnant women.
                    Classify the risk as ONLY one of these exact words: Low, Medium, High, or Critical.

                    Danger signs that indicate High or Critical risk:
                    - Any bleeding or spotting
                    - Severe abdominal pain
                    - Swelling in hands/face
                    - Severe headache or blurred vision
                    - Extreme fatigue or dizziness
                    - High blood pressure symptoms

                    Respond with **ONLY** one word: Low, Medium, High, or Critical.
                    Do not add any explanation.`
        },
        { 
          role: "user", 
          content: `Patient symptoms: ${inputText}` 
        }
      ],
      temperature: 0.1,
      max_tokens: 10,
    });

    let risk = completion.choices[0].message.content.trim();

    // Clean up any extra text
    if (risk.includes("High")) risk = "High";
    else if (risk.includes("Critical")) risk = "Critical";
    else if (risk.includes("Medium")) risk = "Medium";
    else risk = "Low";

    console.log("AI Risk Decision:", risk);

    const patient = {
      id: Date.now(),
      symptoms: inputText,
      region,
      risk,
      timestamp: new Date().toLocaleString(),
      status: "Pending"
    };

    patients.push(patient);

    if (risk === "High" || risk === "Critical") {
      highRiskAlerts.push(patient);
    }

    const assignedASHA = ashaWorkers.find(w => w.region === region)?.name || "ASHA Worker";

    res.json({
      patient,
      assignedASHA,
      hospitalAlert: risk === "High" || risk === "Critical"
    });

  } catch (err) {
    console.error("OpenAI Error:", err.message);
    
    // Safe fallback
    res.json({
      patient: {
        id: Date.now(),
        symptoms: inputText,
        region,
        risk: "Medium"
      },
      assignedASHA: "ASHA Worker",
      hospitalAlert: false
    });
  }
});

app.get('/api/asha-queue', (req, res) => res.json(patients));
app.get('/api/hospital-alerts', (req, res) => res.json(highRiskAlerts));

app.listen(5000, () => {
  console.log('✅ MaTriCare Backend running on http://localhost:5000');
});