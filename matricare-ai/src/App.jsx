// src/App.js
import { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import PatientScreen from './components/PatientScreen';
import ASHASelectionScreen from './components/ASHASelectionScreen';
import ASHAScreen from './components/ASHAScreen';
import HospitalScreen from './components/HospitalScreen';

function App() {
  const [role, setRole] = useState(null);
  const [language, setLanguage] = useState('en');
  const [selectedASHA, setSelectedASHA] = useState(null);

  // ✅ GLOBAL STATES (IMPORTANT)
  const [hospitalAlerts, setHospitalAlerts] = useState(() => {
    const saved = localStorage.getItem("hospitalAlerts");
    return saved ? JSON.parse(saved) : [];
  });

  // Persist hospitalAlerts to localStorage
  useEffect(() => {
    localStorage.setItem("hospitalAlerts", JSON.stringify(hospitalAlerts));
    console.log("Hospital Alerts Updated:", hospitalAlerts);
  }, [hospitalAlerts]);

  // Initialize pendingPatients with localStorage
  const [pendingPatients, setPendingPatients] = useState(() => {
    const saved = localStorage.getItem("pendingPatients");
    return saved ? JSON.parse(saved) : [
      {
        id: 101,
        name: "Priya Sharma",
        age: 24,
        region: "Region A",
        phone: "9876543210",
        riskLevel: "High",
        symptoms: "Severe headache, swelling in hands, bleeding",
        lastUpdated: "10 min ago"
      }
    ];
  });

  // Save pendingPatients to localStorage
  useEffect(() => {
    localStorage.setItem("pendingPatients", JSON.stringify(pendingPatients));
    console.log("Pending Patients Updated:", pendingPatients);
  }, [pendingPatients]);

  // Initialize completedPatients with localStorage
  const [completedPatients, setCompletedPatients] = useState(() => {
    const saved = localStorage.getItem("completedPatients");
    return saved ? JSON.parse(saved) : [];
  });

  // Save completedPatients to localStorage
  useEffect(() => {
    localStorage.setItem("completedPatients", JSON.stringify(completedPatients));
  }, [completedPatients]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-teal-700 text-white py-6 text-center shadow-md">
        <h1 className="text-4xl font-bold tracking-tight">MaTriCare AI</h1>
        <p className="text-lg mt-1 opacity-90">AI Maternal Risk Triage System</p>
      </header>

      {!role ? (
        <WelcomeScreen language={language} setLanguage={setLanguage} setRole={setRole} />
      ) : role === 'patient' ? (
        <PatientScreen 
          language={language} 
          setRole={setRole} 
          setHospitalAlerts={setHospitalAlerts} 
          setPendingPatients={setPendingPatients} // ✅ Added this line
        />
      ) : role === 'asha' ? (
        selectedASHA ? (
          <ASHAScreen 
            language={language} 
            setRole={setRole} 
            ashaWorker={selectedASHA} 
            setSelectedASHA={setSelectedASHA} 
            setHospitalAlerts={setHospitalAlerts} 
            pendingPatients={pendingPatients}
            setPendingPatients={setPendingPatients}
          />
        ) : (
          <ASHASelectionScreen 
            language={language} 
            setSelectedASHA={setSelectedASHA} 
            setRole={setRole} 
          />
        )
      ) : (
        <HospitalScreen 
          language={language} 
          setRole={setRole} 
          hospitalAlerts={hospitalAlerts} 
          setHospitalAlerts={setHospitalAlerts} 
        />
      )}
    </div>
  );
}

export default App;