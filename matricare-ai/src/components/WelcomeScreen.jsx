import RoleButton from './RoleButton';

function WelcomeScreen({ language, setLanguage, setRole }) {
  const texts = {
    en: { welcome: "Welcome to MaTriCare AI", chooseRole: "Choose your role to continue", pregnant: "I am Pregnant", asha: "I am an ASHA Worker", hospital: "I am Hospital Staff" },
    hi: { welcome: "मैट्रिकेयर AI में आपका स्वागत है", chooseRole: "अपनी भूमिका चुनें", pregnant: "मैं गर्भवती हूँ", asha: "मैं एक आशा कार्यकर्ता हूँ", hospital: "मैं अस्पताल स्टाफ हूँ" },
    te: { welcome: "మాట్రికేర్ AIకి స్వాగతం", chooseRole: "మీ రోల్ ఎంచుకోండి", pregnant: "నేను గర్భవతి", asha: "నేను ఒక ఆశా వర్కర్", hospital: "నేను హాస్పిటల్ స్టాఫ్" }
  };

  const currentText = texts[language];

  const langOptions = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'te', label: 'తెలుగు' }
  ];

  const speak = (text, langCode) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    if (langCode === 'hi') utterance.lang = 'hi-IN';
    else if (langCode === 'te') utterance.lang = 'te-IN';
    else utterance.lang = 'en-IN';
    utterance.rate = langCode === 'te' ? 0.88 : 0.94;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  };

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
        <RoleButton title={currentText.pregnant} color="bg-orange-600" onClick={() => setRole('patient')} speak={() => speak(currentText.pregnant, language)} />
        <RoleButton title={currentText.asha} color="bg-teal-600" onClick={() => setRole('asha')} speak={() => speak(currentText.asha, language)} />
        <RoleButton title={currentText.hospital} color="bg-emerald-700" onClick={() => setRole('hospital')} speak={() => speak(currentText.hospital, language)} />
      </div>
    </div>
  );
}

export default WelcomeScreen;