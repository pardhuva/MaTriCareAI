// components/ASHAScreen.js
import { useState } from 'react';

function ASHAScreen({ language, setRole, ashaWorker, setSelectedASHA, setHospitalAlerts }) {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingPatients, setPendingPatients] = useState([
    { id: 101, name: "Priya Sharma", age: 24, region: "Region A", phone: "9876543210", riskLevel: "High", symptoms: "Severe headache, swelling in hands, bleeding", lastUpdated: "10 min ago" }
  ]);
  const [completedPatients, setCompletedPatients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: "", age: "", region: "Region A", riskLevel: "Medium", symptoms: "", phone: "" });

  const t = {
    en: { pending: "Pending Visits", completed: "Completed Visits", search: "Search patients...", call: "Call Patient", visit: "Mark Visit Done", alertHospital: "Alert Hospital", high: "High Risk", medium: "Medium Risk", low: "Low Risk", add: "Add New Patient", noPending: "No pending patients", noCompleted: "No completed visits yet" },
    hi: { pending: "लंबित विज़िट", completed: "पूर्ण विज़िट", search: "मरीज़ खोजें...", call: "कॉल करें", visit: "विज़िट पूर्ण करें", alertHospital: "अस्पताल को अलर्ट करें", high: "उच्च जोखिम", medium: "मध्यम जोखिम", low: "निम्न जोखिम", add: "नया मरीज़ जोड़ें", noPending: "कोई लंबित मरीज़ नहीं", noCompleted: "अभी तक कोई पूर्ण विज़िट नहीं" },
    te: { pending: "పెండింగ్ విజిట్స్", completed: "పూర్తి చేసిన విజిట్స్", search: "రోగులను వెతకండి...", call: "కాల్ చేయండి", visit: "విజిట్ పూర్తి చేయండి", alertHospital: "హాస్పిటల్‌కి అలర్ట్ చేయండి", high: "హై రిస్క్", medium: "మీడియం రిస్క్", low: "లో రిస్క్", add: "కొత్త రోగిని జోడించండి", noPending: "పెండింగ్ రోగులు లేరు", noCompleted: "ఇంకా పూర్తి విజిట్స్ లేవు" }
  }[language];

  const getRiskColor = (risk) => risk === "High" ? "bg-red-600 text-white" : risk === "Medium" ? "bg-orange-600 text-white" : "bg-green-600 text-white";

  const filteredPending = pendingPatients.filter(p => p.region === ashaWorker.region);

  const markVisitDone = (id) => {
    const patient = pendingPatients.find(p => p.id === id);
    if (!patient) return;
    setPendingPatients(pendingPatients.filter(p => p.id !== id));
    setCompletedPatients([...completedPatients, { ...patient, completedAt: new Date().toLocaleString() }]);
    speak(language === 'te' ? "విజిట్ పూర్తి చేయబడింది" : "Visit marked as completed", language);
  };

  const alertHospital = (patient) => {
    setHospitalAlerts(prev => [...prev, {
      id: Date.now(),
      patient: { name: patient.name, age: patient.age, phone: patient.phone, region: patient.region },
      symptoms: patient.symptoms,
      riskLevel: patient.riskLevel,
      referredBy: ashaWorker.name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    speak("Hospital has been alerted", language);
  };

  const makeCall = (phone, name) => {
    speak(`Calling ${name}`, language);
    window.open(`tel:${phone}`, '_self');
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

  const addNewPatient = () => {
    if (!newPatient.name.trim()) return;
    const patient = { id: Date.now(), ...newPatient, lastUpdated: "Just now" };
    setPendingPatients([...pendingPatients, patient]);
    setShowAddModal(false);
    setNewPatient({ name: "", age: "", region: "Region A", riskLevel: "Medium", symptoms: "", phone: "" });
    speak("New patient added", language);
  };

  const patientsToShow = activeTab === 'pending' ? filteredPending : completedPatients;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-teal-700 text-white p-6 sticky top-0 z-20 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">ASHA Worker Dashboard</h1>
            <p className="text-teal-100 text-sm mt-1">{ashaWorker.name} • {ashaWorker.region}</p>
          </div>
          <button onClick={() => { setSelectedASHA(null); setRole(null); }} className="bg-white/20 hover:bg-white/30 px-5 py-2 rounded-2xl text-sm font-medium">← Home</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white sticky top-[88px] z-10">
        <button onClick={() => setActiveTab('pending')} className={`flex-1 py-4 font-medium text-lg ${activeTab === 'pending' ? 'border-b-4 border-teal-600 text-teal-700' : 'text-gray-500'}`}>
          {t.pending} ({filteredPending.length})
        </button>
        <button onClick={() => setActiveTab('completed')} className={`flex-1 py-4 font-medium text-lg ${activeTab === 'completed' ? 'border-b-4 border-teal-600 text-teal-700' : 'text-gray-500'}`}>
          {t.completed} ({completedPatients.length})
        </button>
      </div>

      {/* Search */}
      <div className="p-4 bg-white border-b">
        <input type="text" placeholder={t.search} className="w-full p-4 border-2 border-gray-200 rounded-2xl text-lg focus:outline-none focus:border-teal-600" />
      </div>

      {/* Patient List */}
      <div className="p-4 space-y-4">
        {patientsToShow.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-lg">
            {activeTab === 'pending' ? t.noPending : t.noCompleted}
          </div>
        ) : (
          patientsToShow.map((patient) => (
            <div key={patient.id} className="bg-white rounded-3xl shadow-sm border overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-xl">{patient.name}</h3>
                    <p className="text-gray-600">{patient.age} years • {patient.region} • {patient.phone}</p>
                  </div>
                  <div className={`px-5 py-1.5 rounded-2xl text-sm font-bold ${getRiskColor(patient.riskLevel)}`}>
                    {t[patient.riskLevel.toLowerCase()]}
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-700 bg-gray-50 p-4 rounded-2xl">{patient.symptoms}</div>
                {activeTab === 'completed' && <p className="text-xs text-emerald-600 mt-3">✅ Completed on {patient.completedAt}</p>}
                {activeTab === 'pending' && <p className="text-xs text-gray-500 mt-3">Updated {patient.lastUpdated}</p>}
              </div>

              {activeTab === 'pending' && (
                <div className="border-t grid grid-cols-3 text-sm">
                  <button onClick={() => makeCall(patient.phone, patient.name)} className="py-4 flex items-center justify-center gap-1 hover:bg-teal-50 border-r">📞 Call</button>
                  <button onClick={() => markVisitDone(patient.id)} className="py-4 flex items-center justify-center gap-1 hover:bg-emerald-50 border-r">✅ Done</button>
                  {patient.riskLevel === "High" && (
                    <button onClick={() => alertHospital(patient)} className="py-4 flex items-center justify-center gap-1 hover:bg-red-50 text-red-600 font-medium">🚨 Alert Hospital</button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-2xl flex items-center justify-center text-4xl active:scale-90 transition-all"
      >
        +
      </button>

      {/* Add New Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-6">{t.add}</h2>
            <input type="text" placeholder="Patient Name" value={newPatient.name} onChange={(e) => setNewPatient({...newPatient, name: e.target.value})} className="w-full p-4 border-2 rounded-2xl mb-4" />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input type="number" placeholder="Age" value={newPatient.age} onChange={(e) => setNewPatient({...newPatient, age: e.target.value})} className="w-full p-4 border-2 rounded-2xl" />
              <select value={newPatient.region} onChange={(e) => setNewPatient({...newPatient, region: e.target.value})} className="w-full p-4 border-2 rounded-2xl">
                <option>Region A</option><option>Region B</option><option>Region C</option><option>Region D</option>
              </select>
            </div>
            <input type="tel" placeholder="Phone Number" value={newPatient.phone} onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})} className="w-full p-4 border-2 rounded-2xl mb-4" />
            <select value={newPatient.riskLevel} onChange={(e) => setNewPatient({...newPatient, riskLevel: e.target.value})} className="w-full p-4 border-2 rounded-2xl mb-4">
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
            <textarea placeholder="Symptoms" value={newPatient.symptoms} onChange={(e) => setNewPatient({...newPatient, symptoms: e.target.value})} className="w-full p-4 border-2 rounded-2xl h-28 mb-6" />

            <div className="flex gap-4">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 border-2 border-gray-300 rounded-2xl font-medium">Cancel</button>
              <button onClick={addNewPatient} className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-medium">Add Patient</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ASHAScreen;