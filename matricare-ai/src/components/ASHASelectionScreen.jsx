function ASHASelectionScreen({ language, setSelectedASHA, setRole }) {
  const ashaWorkers = [
    { id: 1, name: "Lakshmi Devi", region: "Region A" },
    { id: 2, name: "Priya Reddy", region: "Region B" },
    { id: 3, name: "Sunita Rao", region: "Region C" },
    { id: 4, name: "Padma Naik", region: "Region D" }
  ];

  const t = {
    en: { title: "Select Your Name", back: "Back" },
    hi: { title: "अपना नाम चुनें", back: "वापस" },
    te: { title: "మీ పేరు ఎంచుకోండి", back: "వెనక్కి" }
  }[language];

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <button onClick={() => setRole(null)} className="mb-8 text-teal-600 font-medium">← {t.back}</button>
        <h2 className="text-3xl font-bold text-center mb-8">{t.title}</h2>
        <div className="space-y-4">
          {ashaWorkers.map((asha) => (
            <button
              key={asha.id}
              onClick={() => setSelectedASHA(asha)}
              onMouseEnter={() => speak(asha.name)}
              className="w-full bg-white border-2 border-teal-600 hover:bg-teal-50 rounded-3xl p-6 text-left transition-all active:scale-[0.98]"
            >
              <div className="font-semibold text-xl">{asha.name}</div>
              <div className="text-gray-600 mt-1">{asha.region}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ASHASelectionScreen;