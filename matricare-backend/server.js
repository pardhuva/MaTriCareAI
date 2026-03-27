const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let patients = [];
let highRiskAlerts = [];

// Pre-seeded data
const hospitals = [
  { id: 1, name: "Government Maternity Hospital", regions: ["Region A", "Region B"] }
];

const ashaWorkers = [
  { id: 1, name: "ASHA Worker 1", region: "Region A" },
  { id: 2, name: "ASHA Worker 2", region: "Region B" }
];

const regions = ["Region A", "Region B"];

// POST /api/submit-symptoms
app.post('/api/submit-symptoms', async (req, res) => {
  const { symptoms, region, voiceTranscript } = req.body;

  // Simulate Grok API call (replace with real Grok API later)
  const riskLevels = ["Low", "Medium", "High", "Critical"];
  const risk = riskLevels[Math.floor(Math.random() * 4)]; // Replace with Grok call

  const patient = {
    id: Date.now(),
    symptoms: voiceTranscript || symptoms,
    region,
    risk,
    timestamp: new Date().toLocaleTimeString(),
    status: "Pending"
  };

  patients.push(patient);

  if (risk === "High" || risk === "Critical") {
    highRiskAlerts.push(patient);
  }

  // Auto-assign ASHA
  const assignedASHA = ashaWorkers.find(w => w.region === region);

  res.json({
    patient,
    assignedASHA: assignedASHA ? assignedASHA.name : "No ASHA found",
    hospitalAlert: (risk === "High" || risk === "Critical")
  });
});

// GET /api/asha-queue
app.get('/api/asha-queue', (req, res) => {
  res.json(patients);
});

// GET /api/hospital-alerts
app.get('/api/hospital-alerts', (req, res) => {
  res.json(highRiskAlerts);
});

app.listen(5000, () => console.log('✅ MaTriCare Backend running on http://localhost:5000'));