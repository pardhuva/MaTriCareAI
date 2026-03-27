// components/HospitalScreen.js
function HospitalScreen({ language, setRole, hospitalAlerts = [], setHospitalAlerts }) {

  const t = {
    en: {
      title: "Hospital Dashboard",
      highRiskAlerts: "High Risk Alerts",
      noAlerts: "No high-risk alerts yet",
      accept: "Accept & Prepare",
      callPatient: "Call Patient",
      hospitalName: "Government Maternity Hospital • Telangana",
      highRisk: "HIGH RISK",
      symptoms: "Symptoms:",
      referredBy: "Referred by:"
    },
    hi: {
      title: "अस्पताल डैशबोर्ड",
      highRiskAlerts: "उच्च जोखिम अलर्ट",
      noAlerts: "कोई उच्च जोखिम अलर्ट नहीं",
      accept: "स्वीकार करें और तैयार करें",
      callPatient: "मरीज को कॉल करें",
      hospitalName: "सरकारी मातृत्व अस्पताल • तेलंगाना",
      highRisk: "उच्च जोखिम",
      symptoms: "लक्षण:",
      referredBy: "द्वारा भेजा गया:"
    },
    te: {
      title: "హాస్పిటల్ డ్యాష్‌బోర్డ్",
      highRiskAlerts: "హై రిస్క్ అలర్ట్స్",
      noAlerts: "హై రిస్క్ అలర్ట్స్ లేవు",
      accept: "అంగీకరించి సిద్ధం చేయండి",
      callPatient: "రోగికి కాల్ చేయండి",
      hospitalName: "ప్రభుత్వ ప్రసూతి ఆసుపత్రి • తెలంగాణ",
      highRisk: "హై రిస్క్",
      symptoms: "లక్షణాలు:",
      referredBy: "సూచించిన వారు:"
    }
  }[language];

  const acceptPatient = (id) => {
    const confirmAccept = window.confirm("Are you sure you want to accept this patient?");
    if (!confirmAccept) return;

    setHospitalAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Helper to safely display symptoms
  const getSymptomsText = (symptoms) => {
    if (!symptoms) return "No symptoms provided";
    if (typeof symptoms === "string") return symptoms;
    if (Array.isArray(symptoms)) {
      return symptoms.map(s => 
        typeof s === "object" && s.answer ? s.answer : s
      ).join(", ");
    }
    return String(symptoms);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Header */}
      <div className="bg-emerald-700 text-white p-6 sticky top-0 z-20 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-emerald-100 text-sm mt-1">{t.hospitalName}</p>
          </div>

          <button
            onClick={() => setRole(null)}
            className="bg-white/20 hover:bg-white/30 px-5 py-2 rounded-2xl text-sm font-medium"
          >
            ← Home
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-red-600 flex items-center gap-2">
          🚨 {t.highRiskAlerts} ({hospitalAlerts.length})
        </h2>

        {hospitalAlerts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-500 text-lg">
            {t.noAlerts}
          </div>
        ) : (
          hospitalAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-3xl shadow-sm border border-red-200 overflow-hidden mb-6"
            >
              {/* Patient Info */}
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-xl">
                      {alert.patient?.name || "Unknown Patient"}
                    </h3>
                    <p className="text-gray-600">
                      {alert.patient?.age ? `${alert.patient.age} years` : ""} 
                      {alert.patient?.phone ? ` • ${alert.patient.phone}` : ""}
                    </p>
                  </div>

                  <div className="bg-red-600 text-white px-5 py-1 rounded-2xl text-sm font-bold flex items-center gap-1">
                    🚨 {t.highRisk}
                  </div>
                </div>

                {/* Symptoms */}
                <div className="mt-5 bg-red-50 p-4 rounded-2xl text-sm">
                  <strong>{t.symptoms}</strong> {getSymptomsText(alert.symptoms)}
                </div>

                {/* Meta */}
                <p className="text-xs text-gray-500 mt-4">
                  {t.referredBy} {alert.referredBy || "Patient Self-Assessment"} • {alert.time || "Just now"}
                </p>
              </div>

              {/* Actions */}
              <div className="border-t grid grid-cols-2">
                <button
                  onClick={() => acceptPatient(alert.id)}
                  className="py-5 text-emerald-600 font-medium flex items-center justify-center gap-2 hover:bg-emerald-50"
                >
                  ✔ {t.accept}
                </button>

                <button
                  onClick={() => alert.patient?.phone && window.open(`tel:${alert.patient.phone}`, '_self')}
                  className="py-5 text-teal-600 font-medium flex items-center justify-center gap-2 hover:bg-teal-50 border-l"
                >
                  📞 {t.callPatient}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HospitalScreen;