// components/PatientScreen.js
import { useState } from 'react';

function PatientScreen({ language, setRole, setHospitalAlerts }) {
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

    // 1. Age Factor
    const age = parseInt(patientProfile.age) || 25;
    if (age < 18 || age > 35) score += 30;           // Very high risk
    else if (age < 20 || age > 32) score += 15;      // Moderate risk

    // 2. Region Factor
    const regionRisk = {
      "Region A": 10,
      "Region B": 15,
      "Region C": 20,
      "Region D": 25
    };
    score += regionRisk[patientProfile.region] || 10;

    // 3. Symptom Keyword Analysis (Simulated NLP)
    const allText = symptomList.map(s => s.answer.toLowerCase()).join(" ");

    const criticalKeywords = ['bleeding', 'blood', 'severe', 'unbearable', 'heavy bleeding', 'fainting', 'unconscious', 'blurred vision', 'convulsion', 'extreme'];
    const seriousKeywords = ['pain', 'swelling', 'dizzy', 'dizziness', 'headache', 'fatigue', 'spotting', 'vomiting', 'tired'];

    criticalKeywords.forEach(word => {
      if (allText.includes(word)) score += 35;
    });

    seriousKeywords.forEach(word => {
      if (allText.includes(word)) score += 18;
    });

    // 4. Number of symptoms reported
    if (symptomList.length >= 4) score += 20;

    // Final Risk Level
    let riskLevel = "Low";
    let riskColor = "bg-green-600";

    if (score >= 85) {
      riskLevel = "High";
      riskColor = "bg-red-600";
    } else if (score >= 55) {
      riskLevel = "Medium";
      riskColor = "bg-orange-600";
    }

    return { riskLevel, riskColor, score };
  };

  const finishAssessment = async (allSymptoms) => {
    setLoading(true);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1400));

    const { riskLevel, riskColor } = calculateRisk(profile, allSymptoms);

    const finalResult = {
      riskLevel,
      riskColor,
      message: riskLevel === "High" 
        ? "High Risk detected. Hospital has been alerted immediately." 
        : riskLevel === "Medium" 
        ? "Medium Risk. ASHA worker will contact you soon." 
        : "Low risk. Regular check-up is recommended.",
      hospitalAlert: riskLevel === "High",
      patientProfile: profile,
      symptoms: allSymptoms,
      calculatedScore: calculateRisk(profile, allSymptoms).score
    };

    setResult(finalResult);

    // Send High Risk alert to Hospital
    if (finalResult.hospitalAlert) {
      setHospitalAlerts(prev => [...prev, {
        id: Date.now(),
        patient: profile,
        symptoms: allSymptoms,
        riskLevel,
        referredBy: "Patient Self-Assessment",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }

    setLoading(false);
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