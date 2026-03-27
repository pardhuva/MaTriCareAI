// src/App.js
import { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import PatientScreen from './components/PatientScreen';
import ASHASelectionScreen from './components/ASHASelectionScreen';
import ASHAScreen from './components/ASHAScreen';
import HospitalScreen from './components/HospitalScreen';

function App() {
  const [role, setRole] = useState(null);
  const [language, setLanguage] = useState('en');
  const [selectedASHA, setSelectedASHA] = useState(null);
  const [hospitalAlerts, setHospitalAlerts] = useState([]);

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
        />
      ) : role === 'asha' ? (
        selectedASHA ? (
          <ASHAScreen 
            language={language} 
            setRole={setRole} 
            ashaWorker={selectedASHA} 
            setSelectedASHA={setSelectedASHA} 
            setHospitalAlerts={setHospitalAlerts} 
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