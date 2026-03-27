// components/HospitalScreen.js
function HospitalScreen({ language, setRole, hospitalAlerts, setHospitalAlerts }) {
  const t = {
    en: { title: "Hospital Dashboard", highRiskAlerts: "High Risk Alerts", noAlerts: "No high-risk alerts yet", accept: "Accept & Prepare", callASHA: "Call ASHA" },
    hi: { title: "अस्पताल डैशबोर्ड", highRiskAlerts: "उच्च जोखिम अलर्ट", noAlerts: "कोई उच्च जोखिम अलर्ट नहीं", accept: "स्वीकार करें और तैयार करें", callASHA: "आशा को कॉल करें" },
    te: { title: "హాస్పిటల్ డ్యాష్‌బోర్డ్", highRiskAlerts: "హై రిస్క్ అలర్ట్స్", noAlerts: "హై రిస్క్ అలర్ట్స్ లేవు", accept: "అంగీకరించి సిద్ధం చేయండి", callASHA: "ఆశా కి కాల్ చేయండి" }
  }[language];

  const acceptPatient = (id) => {
    setHospitalAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-emerald-700 text-white p-6 sticky top-0 z-20 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-emerald-100 text-sm mt-1">Government Maternity Hospital • Telangana</p>
          </div>
          <button onClick={() => setRole(null)} className="bg-white/20 hover:bg-white/30 px-5 py-2 rounded-2xl text-sm font-medium">← Home</button>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-red-600 flex items-center gap-2">
          🚨 {t.highRiskAlerts} ({hospitalAlerts.length})
        </h2>

        {hospitalAlerts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-500 text-lg">{t.noAlerts}</div>
        ) : (
          hospitalAlerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-3xl shadow-sm border border-red-200 overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-xl">{alert.patient.name}</h3>
                    <p className="text-gray-600">{alert.patient.age} years • {alert.patient.region} • {alert.patient.phone}</p>
                  </div>
                  <div className="bg-red-600 text-white px-5 py-1 rounded-2xl text-sm font-bold flex items-center">HIGH RISK</div>
                </div>

                <div className="mt-5 bg-red-50 p-4 rounded-2xl text-sm">
                  <strong>Symptoms:</strong> {alert.symptoms}
                </div>

                <p className="text-xs text-gray-500 mt-4">Referred by: {alert.referredBy} at {alert.time}</p>
              </div>

              <div className="border-t grid grid-cols-2">
                <button onClick={() => acceptPatient(alert.id)} className="py-5 text-emerald-600 font-medium flex items-center justify-center gap-2 hover:bg-emerald-50">{t.accept}</button>
                <button onClick={() => window.open(`tel:${alert.patient.phone}`, '_self')} className="py-5 text-teal-600 font-medium flex items-center justify-center gap-2 hover:bg-teal-50 border-l">{t.callASHA}</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HospitalScreen;