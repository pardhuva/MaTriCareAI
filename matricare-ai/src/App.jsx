import { useState } from 'react';

function App() {
  const [role, setRole] = useState(null);
  const [language, setLanguage] = useState('en');

  const texts = {
    en: {
      title: "MaTriCare AI",
      subtitle: "AI Maternal Risk Triage System",
      welcome: "Welcome to MaTriCare AI",
      chooseRole: "Choose your role to continue",
      pregnant: "I am Pregnant",
      asha: "I am an ASHA Worker",
      hospital: "I am Hospital Staff",
      tap: "Tap to continue",
      hoverHint: "Hover on buttons to hear voice guidance"
    },
    hi: {
      title: "मैट्रिकेयर AI",
      subtitle: "एआई मातृत्व जोखिम ट्राइएज सिस्टम",
      welcome: "मैट्रికेयर AI में आपका स्वागत है",
      chooseRole: "अपनी भूमिका चुनें",
      pregnant: "मैं गर्भवती हूँ",
      asha: "मैं एक आशा कार्यकर्ता हूँ",
      hospital: "मैं अस्पताल स्टाफ हूँ",
      tap: "जारी रखने के लिए टैप करें",
      hoverHint: "बटन पर होवर करें आवाज सुनने के लिए"
    },
    te: {
      title: "మాట్రికేర్ AI",
      subtitle: "AI మాతృత్వ రిస్క్ ట్రయేజ్ సిస్టమ్",
      welcome: "మాట్రికేర్ AIకి స్వాగతం",
      chooseRole: "మీ రోల్ ఎంచుకోండి",
      pregnant: "నేను గర్భవతి",
      asha: "నేను ఒక ఆశా వర్కర్",
      hospital: "నేను హాస్పిటల్ స్టాఫ్",
      tap: "కొనసాగించడానికి ట్యాప్ చేయండి",
      hoverHint: "బటన్ మీద హోవర్ చేస్తే ఇంగ్లీష్ వాయిస్ వస్తుంది"
    }
  };

  const currentText = texts[language];

  // Telugu Voice Map - Romanized for better voice pronunciation
  const teluguVoiceMap = {
    // Homepage Role Buttons
    "నేను గర్భవతి": "Nenu oka gharbhavathi",
    "నేను ఒక ఆశా వర్కర్": "Nenu oka ASHA worker",
    "నేను హాస్పిటల్ స్టాఫ్": "Nenu hospital staff",

    // Language Selector
    "English": "English",
    "हिंदी": "Hindi",
    "తెలుగు": "Telugu",

    // Symptoms Questions
    "మీకు ఏమైనా రక్తస్రావం లేదా స్పాటింగ్ వస్తుందా?": "Miku emaina rakthasravam leda spotting vastunda?",
    "మీకు తీవ్రమైన కడుపు నొప్పి ఉందా?": "Miku teevramaina kadupu noppi unda?",
    "మీ చేతులు లేదా ముఖంపై వాపు ఉందా?": "Mi chetulu leda mukham pai vaapu unda?",
    "మీకు తీవ్రమైన తలనొప్పి లేదా మసకబారిన చూపు ఉందా?": "Miku teevramaina talanoppi leda masakabarina choopu unda?",
    "మీరు చాలా అలసట లేదా తల తిరగడం అనిపిస్తుందా?": "Meeru chaala alasata leda tala tiragadam anipistunda?"
  };

  const speak = (text, langCode) => {
    if (!('speechSynthesis' in window)) return;

    let speakText = text;

    if (langCode === 'te') {
      speakText = teluguVoiceMap[text] || text;
    }

    const utterance = new SpeechSynthesisUtterance(speakText);
    window.speechSynthesis.cancel();

    if (langCode === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (langCode === 'te') {
      utterance.lang = 'en-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-teal-700 text-white py-6 text-center shadow-md">
        <h1 className="text-4xl font-bold tracking-tight">{currentText.title}</h1>
        <p className="text-lg mt-1 opacity-90">{currentText.subtitle}</p>
      </header>

      {!role ? (
        <WelcomeScreen 
          language={language} 
          setLanguage={setLanguage} 
          currentText={currentText} 
          speak={speak} 
          setRole={setRole} 
        />
      ) : role === 'patient' ? (
        <PatientScreen language={language} speak={speak} setRole={setRole} />
      ) : role === 'asha' ? (
        <ASHAScreen language={language} />
      ) : (
        <HospitalScreen language={language} />
      )}
    </div>
  );
}

// Welcome Screen
function WelcomeScreen({ language, setLanguage, currentText, speak, setRole }) {
  const langOptions = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'te', label: 'తెలుగు' }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-6 py-12">
      <div className="flex gap-4 mb-12">
        {langOptions.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            onMouseEnter={() => speak(lang.label, language)}
            className={`px-8 py-3.5 rounded-2xl font-medium text-lg transition-all shadow-sm ${
              language === lang.code ? 'bg-teal-700 text-white scale-105 shadow-md' : 'bg-white border-2 border-teal-700 text-teal-700 hover:bg-teal-50'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <div className="text-center mb-12">
        <h2 className="text-4xl font-semibold text-gray-800 mb-4">{currentText.welcome}</h2>
        <p className="text-xl text-gray-600">{currentText.chooseRole}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 w-full max-w-md">
        <RoleButton 
          title={currentText.pregnant} 
          color="bg-orange-600" 
          onClick={() => setRole('patient')} 
          speak={() => speak(currentText.pregnant, language)} 
        />
        <RoleButton 
          title={currentText.asha} 
          color="bg-teal-600" 
          onClick={() => setRole('asha')} 
          speak={() => speak(currentText.asha, language)} 
        />
        <RoleButton 
          title={currentText.hospital} 
          color="bg-emerald-700" 
          onClick={() => setRole('hospital')} 
          speak={() => speak(currentText.hospital, language)} 
        />
      </div>
    </div>
  );
}

function RoleButton({ title, color, onClick, speak }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={speak}
      className={`${color} text-white py-8 px-10 rounded-3xl text-2xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all w-full text-center`}
    >
      {title}
    </button>
  );
}

// ==================== FINAL PATIENT SCREEN ====================
function PatientScreen({ language, speak, setRole }) {
  const [region, setRegion] = useState('Region A');
  const [step, setStep] = useState(0);
  const [symptoms, setSymptoms] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState(null);

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

  const currentQuestion = questions[language][step];

  const speakQuestion = () => {
    speak(currentQuestion, language);
  };

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
      const transcript = event.results[0][0].transcript.trim();
      setCurrentAnswer(transcript);
    };

    recognition.start();
  };

  const saveAnswer = () => {
    if (!currentAnswer.trim()) return;

    const newSymptom = { question: currentQuestion, answer: currentAnswer };
    const updatedSymptoms = [...symptoms, newSymptom];
    setSymptoms(updatedSymptoms);
    setCurrentAnswer('');

    if (step < questions[language].length - 1) {
      setStep(step + 1);
      setTimeout(() => speak(questions[language][step + 1], language), 800);
    } else {
      finishAssessment(updatedSymptoms);
    }
  };

  const finishAssessment = (allSymptoms) => {
    const symptomText = allSymptoms.map(s => s.answer).join(". ");

    let riskLevel = "Low";
    let riskColor = "bg-green-600";
    let message = "Low risk. Regular check-up is recommended.";
    let hospitalAlert = false;

    const lowerText = symptomText.toLowerCase();

    if (lowerText.includes("bleed") || lowerText.includes("pain") || lowerText.includes("severe")) {
      riskLevel = "High";
      riskColor = "bg-red-600";
      message = "High Risk detected. Hospital has been alerted.";
      hospitalAlert = true;
    } else if (lowerText.includes("swelling") || lowerText.includes("headache") || lowerText.includes("dizzy")) {
      riskLevel = "Medium";
      riskColor = "bg-orange-600";
      message = "Medium Risk. ASHA worker will contact you soon.";
    }

    const assignedASHA = region === "Region A" ? "ASHA Worker 1" : "ASHA Worker 2";

    setResult({
      riskLevel,
      riskColor,
      message,
      assignedASHA,
      hospitalAlert,
      symptoms: allSymptoms
    });
  };

  // Fixed Playback - Now works properly for Telugu too
  const playBackAnswer = (answer) => {
    const utterance = new SpeechSynthesisUtterance(answer);
    window.speechSynthesis.cancel();

    if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (language === 'te') {
      // Use the same clear voice style for playback in Telugu mode
      utterance.lang = 'en-IN';
      // Optional: You can add mapping here later if you want to romanize user speech too
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const resetToHome = () => setRole(null);

  return (
    <div className="max-w-lg mx-auto p-6 pt-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Speak Your Symptoms</h2>
        <button onClick={resetToHome} className="text-teal-600 font-medium hover:underline">← Back</button>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">Select Your Region</label>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full p-4 border-2 border-gray-300 rounded-2xl text-lg">
          <option>Region A</option>
          <option>Region B</option>
        </select>
      </div>

      {!result ? (
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
            Question {step + 1} of {questions[language].length}
          </p>
        </div>
      ) : (
        <div className="bg-white border-4 border-teal-600 rounded-3xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold mb-6">Risk Assessment Result</h3>
          <div className={`inline-block px-10 py-4 rounded-full text-white text-2xl font-bold mb-6 ${result.riskColor}`}>
            {result.riskLevel} Risk
          </div>
          <p className="text-lg mb-8">{result.message}</p>
          <div className="space-y-4 text-sm border-t pt-6">
            <p><strong>Assigned to:</strong> {result.assignedASHA}</p>
            {result.hospitalAlert && <p className="text-red-600 font-bold">🚨 Hospital has been alerted</p>}
          </div>
          <button onClick={resetToHome} className="mt-10 w-full bg-gray-800 hover:bg-black text-white py-4 rounded-2xl font-bold">
            ← Back to Home
          </button>
        </div>
      )}
    </div>
  );
}

// Placeholder screens
function ASHAScreen() {
  return <div className="p-12 text-center text-3xl font-bold">ASHA Worker Dashboard</div>;
}

function HospitalScreen() {
  return <div className="p-12 text-center text-3xl font-bold">Hospital Dashboard</div>;
}

export default App;