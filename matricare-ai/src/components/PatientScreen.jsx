// components/PatientScreen.js
import { useState } from 'react';

function PatientScreen({ language, setRole, setHospitalAlerts, setPendingPatients }) {
  const [step, setStep] = useState(0);                    // 0 = Profile, 1-5 = Questions
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    phone: "",
    region: "Region A"
  });
  const [symptoms, setSymptoms] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const questions = {
    en: [
      "Do you have any bleeding or spotting?",
      "Are you experiencing severe stomach pain?",
      "Do you have swelling in your hands or face?",
      "Any severe headache or blurred vision?",
      "Are you feeling very tired or dizzy?"
    ],
    hi: [
      "क्या आपको कोई ब्लीडिंग या स्पॉटिंग हो रही है?",
      "क्या आपको तेज पेट दर्द हो रहा है?",
      "क्या आपके हाथों या चेहरे पर सूजन है?",
      "क्या आपको तेज सिरदर्द या धुंधली नजर आ रही है?",
      "क्या आप बहुत थकान या चक्कर महसूस कर रही हैं?"
    ],
    te: [
      "మీకు ఏమైనా రక్తస్రావం లేదా స్పాటింగ్ వస్తుందా?",
      "మీకు తీవ్రమైన కడుపు నొప్పి ఉందా?",
      "మీ చేతులు లేదా ముఖంపై వాపు ఉందా?",
      "మీకు తీవ్రమైన తలనొప్పి లేదా మసకబారిన చూపు ఉందా?",
      "మీరు చాలా అలసట లేదా తల తిరగడం అనిపిస్తుందా?"
    ]
  };

  const currentQuestion = questions[language][step - 1];

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    if (language === 'hi') utterance.lang = 'hi-IN';
    else if (language === 'te') utterance.lang = 'te-IN';
    else utterance.lang = 'en-IN';
    utterance.rate = language === 'te' ? 0.88 : 0.94;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  const speakQuestion = () => speak(currentQuestion);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported. Please use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      setCurrentAnswer(event.results[0][0].transcript.trim());
    };
    recognition.start();
  };

  // ====================== REALISTIC RISK CALCULATION ======================
  const calculateRisk = (patientProfile, symptomList) => {
    let score = 0;

    const age = parseInt(patientProfile.age) || 25;
    if (age < 18 || age > 35) score += 30;           // Very high risk
    else if (age < 20 || age > 32) score += 15;      // Moderate risk

    const regionRisk = {
      "Region A": 10,
      "Region B": 15,
      "Region C": 20,
      "Region D": 25
    };
    score += regionRisk[patientProfile.region] || 10;

    // 🔥 FIXED LOGIC
    symptomList.forEach((symptom, index) => {
      const answer = symptom.answer.toLowerCase();

      // YES detection
      if (answer.includes("yes") || answer.includes("ha") || answer.includes("yes i have")) {
        
        // Assign weight based on question
        if (index === 0) score += 40; // bleeding
        else if (index === 1) score += 30; // stomach pain
        else if (index === 2) score += 25; // swelling
        else if (index === 3) score += 35; // headache/vision
        else if (index === 4) score += 20; // fatigue
      }

      // Extra keyword detection
      if (answer.includes("bleeding") || answer.includes("blood")) score += 40;
      if (answer.includes("severe") || answer.includes("extreme")) score += 30;
      if (answer.includes("dizzy") || answer.includes("faint")) score += 25;
    });

    let riskLevel = "Low";
    let riskColor = "bg-green-600";

    if (score >= 80) {
      riskLevel = "High";
      riskColor = "bg-red-600";
    } else if (score >= 50) {
      riskLevel = "Medium";
      riskColor = "bg-orange-600";
    }

    return { riskLevel, riskColor, score };
  };

  // 🔥 Convert symptoms → ML features
  const mapSymptomsToFeatures = (symptomsText) => {
    let bp = 120, dbp = 80, bs = 7, temp = 98, hr = 75;

    const text = symptomsText.toLowerCase().trim();

    // 🔥 NEGATIVE WORDS (simple check)
    const negativeWords = ["no", "not", "dont", "don't", "nothing", "fine", "doesn't", "doesnt"];

    // 👉 If ONLY negative response → return normal
    if (negativeWords.includes(text)) {
      return { bp, dbp, bs, temp, hr };
    }

    // 🚨 BLEEDING (highest priority)
    if (text.includes("bleeding")) {
      bp += 30;
      hr += 10;
    }

    // Severe pain
    if (text.includes("pain")) {
      bp += 20;
    }

    // Swelling
    if (text.includes("swelling")) {
      bp += 15;
    }

    // Headache / vision
    if (text.includes("headache") || text.includes("vision")) {
      bp += 20;
    }

    // Dizziness
    if (text.includes("dizzy")) {
      bp -= 10;
      hr += 10;
    }

    // Fatigue
    if (text.includes("fatigue")) {
      hr += 10;
    }

    // Fever
    if (text.includes("fever")) {
      temp += 2;
    }

    return { bp, dbp, bs, temp, hr };
  };

  // 🔥 Call ML API
  const getMLRisk = async (profile, symptomsList) => {
    const text = symptomsList.map(s => s.answer).join(" ");

    const features = mapSymptomsToFeatures(text);

    const res = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        age: parseInt(profile.age),
        ...features
      })
    });

    const data = await res.json();
    const risk = data.risk;
    const confidence = data.confidence;
    return { risk, confidence };
  };

  const finishAssessment = async (allSymptoms) => {
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // simulate delay

      let mlRisk = "Medium";
      let confidence = 0.75;

      try {
        const text = allSymptoms.map(s => s.answer).join(" ");
        const features = mapSymptomsToFeatures(text);

        const res = await fetch("http://127.0.0.1:5000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            age: parseInt(profile.age) || 25,
            ...features
          })
        });

        if (!res.ok) throw new Error("ML server error");

        const data = await res.json();
        mlRisk = data.risk || "Medium";
        confidence = data.confidence || 0.7;
      } catch (mlError) {
        console.warn("ML backend not available, using rule-based risk:", mlError);
        const ruleResult = calculateRisk(profile, allSymptoms.map(s => ({ answer: s.answer })));
        mlRisk = ruleResult.riskLevel;
      }

      const text = allSymptoms.map(s => s.answer).join(" ").toLowerCase();
      const negativeWords = ["no", "nothing", "fine", "dont", "not"];
      const isMostlyNegative = negativeWords.some(word => text.includes(word));

      let finalRisk = (isMostlyNegative && confidence < 0.7) ? "Low" : mlRisk;

      const riskColor = finalRisk === "High" ? "bg-red-600" 
                    : finalRisk === "Medium" ? "bg-orange-600" 
                    : "bg-green-600";

      const finalResult = {
        riskLevel: finalRisk,
        riskColor,
        message: finalRisk === "High"
          ? "High Risk detected. Hospital has been alerted immediately."
          : finalRisk === "Medium"
          ? "Medium Risk. ASHA worker will contact you soon."
          : "Low risk. Regular check-up is recommended.",
        hospitalAlert: finalRisk === "High",
        patientProfile: profile,
        symptoms: allSymptoms.map(s => s.answer).join(", "),
      };

      setResult(finalResult);

      if (finalResult.hospitalAlert) {
        setHospitalAlerts(prev => [...prev, {
          id: Date.now(),
          patient: profile,
          symptoms: allSymptoms.map(s => s.answer).join(", "),
          riskLevel: finalRisk,
          priority: "URGENT 🚨",   // 🔥 NEW
          referredBy: "Patient Self-Assessment",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }

      setPendingPatients(prev => [...prev, {
        id: Date.now(),
        name: profile.name || "Unknown",
        age: profile.age,
        phone: profile.phone,
        region: profile.region,
        riskLevel: finalRisk,
        symptoms: allSymptoms.map(s => s.answer).join(", "),
        lastUpdated: "Just now"
      }]);

    } catch (error) {
      console.error("Error in finishAssessment:", error);
      setResult({
        riskLevel: "Medium",
        riskColor: "bg-orange-600",
        message: "Something went wrong during analysis. Please contact your ASHA worker.",
        hospitalAlert: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const playBackAnswer = (answer) => {
    const utterance = new SpeechSynthesisUtterance(answer);
    window.speechSynthesis.cancel();
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const resetToHome = () => setRole(null);

  // Save Answer Handler
  const saveAnswer = async () => {
    if (!currentAnswer.trim()) return;

    const newSymptom = { question: currentQuestion, answer: currentAnswer };
    const updatedSymptoms = [...symptoms, newSymptom];

    setSymptoms(updatedSymptoms);
    setCurrentAnswer('');

    if (step < 5) {
      setStep(step + 1);
      setTimeout(() => speak(questions[language][step]), 800);
    } else {
      await finishAssessment(updatedSymptoms);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto p-6 pt-10 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xl font-medium">AI is analyzing your symptoms...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 pt-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">{step === 0 ? "Patient Profile" : "Speak Your Symptoms"}</h2>
        <button onClick={resetToHome} className="text-teal-600 font-medium hover:underline">← Back</button>
      </div>

      {/* Step 0: Profile */}
      {step === 0 ? (
        <div className="bg-white rounded-3xl shadow p-8 space-y-6">
          <input 
            type="text" 
            placeholder="Full Name" 
            value={profile.name} 
            onChange={(e) => updateProfile('name', e.target.value)} 
            className="w-full p-4 border-2 border-gray-300 rounded-2xl text-lg" 
          />
          <input 
            type="number" 
            placeholder="Age" 
            value={profile.age} 
            onChange={(e) => updateProfile('age', e.target.value)} 
            className="w-full p-4 border-2 border-gray-300 rounded-2xl text-lg" 
          />
          <input 
            type="tel" 
            placeholder="Phone Number" 
            value={profile.phone} 
            onChange={(e) => updateProfile('phone', e.target.value)} 
            className="w-full p-4 border-2 border-gray-300 rounded-2xl text-lg" 
          />
          <div>
            <label className="block text-sm font-medium mb-2">Select Your Region</label>
            <select 
              value={profile.region} 
              onChange={(e) => updateProfile('region', e.target.value)} 
              className="w-full p-4 border-2 border-gray-300 rounded-2xl text-lg"
            >
              <option>Region A</option>
              <option>Region B</option>
              <option>Region C</option>
              <option>Region D</option>
            </select>
          </div>

          <button 
            onClick={() => setStep(1)} 
            disabled={!profile.name || !profile.age || !profile.phone}
            className="w-full bg-teal-600 disabled:bg-gray-400 text-white py-4 rounded-2xl font-bold text-lg"
          >
            Continue to Symptoms →
          </button>
        </div>
      ) : !result ? (
        /* Symptom Questions */
        <div className="bg-white rounded-3xl shadow p-8">
          <div className="flex justify-between items-start mb-6">
            <p className="text-lg font-medium text-center flex-1 min-h-[70px] flex items-center justify-center">
              {currentQuestion}
            </p>
            <button onClick={speakQuestion} className="text-teal-600 hover:text-teal-700 text-3xl p-2">🔊</button>
          </div>

          <button
            onClick={startListening}
            disabled={isListening}
            className={`w-full py-14 rounded-3xl text-2xl font-bold flex items-center justify-center gap-3 shadow-xl mb-8 transition-all 
              ${isListening ? 'bg-red-600 animate-pulse' : 'bg-teal-600 hover:bg-teal-700'} text-white`}
          >
            🎤 {isListening ? 'Listening... Speak now' : 'Tap to Record Answer'}
          </button>

          {currentAnswer && (
            <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
              <p className="text-sm text-gray-600 mb-3">You said:</p>
              <p className="font-medium text-gray-800 text-lg">{currentAnswer}</p>
              <button 
                onClick={() => playBackAnswer(currentAnswer)} 
                className="mt-4 text-teal-600 hover:text-teal-700 flex items-center gap-2 text-sm font-medium"
              >
                🔊 Play back what I said
              </button>
            </div>
          )}

          <button 
            onClick={saveAnswer} 
            disabled={!currentAnswer} 
            className="w-full bg-teal-600 disabled:bg-gray-400 text-white py-4 rounded-2xl font-bold text-lg"
          >
            Save & Next
          </button>

          <p className="text-center text-xs text-gray-500 mt-8">
            Question {step} of 5
          </p>
        </div>
      ) : (
        /* Final Result */
        <div className="bg-white border-4 border-teal-600 rounded-3xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold mb-6">Risk Assessment Result</h3>
          <div className={`inline-block px-10 py-4 rounded-full text-white text-2xl font-bold mb-6 ${result.riskColor}`}>
            {result.riskLevel} Risk
          </div>
          <p className="text-lg mb-8">{result.message}</p>
          <button onClick={resetToHome} className="mt-10 w-full bg-gray-800 hover:bg-black text-white py-4 rounded-2xl font-bold">
            ← Back to Home
          </button>
        </div>
      )}
    </div>
  );
}

export default PatientScreen;