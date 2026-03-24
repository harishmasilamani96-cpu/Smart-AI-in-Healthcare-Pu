export interface Symptoms {
  fever: boolean;
  cough: boolean;
  headache: boolean;
  fatigue: boolean;
  bodyAche: boolean;
  soreThroat: boolean;
  runnyNose: boolean;
  chestPain: boolean;
  breathingDifficulty: boolean;
  nausea: boolean;
}

export interface HealthData {
  temperature: number;
  mentalHealth: 'normal' | 'stress' | 'anxiety';
  age: number;
  gender: string;
  faceAnalysis: {
    tiredness: boolean;
    stress: boolean;
    redness: boolean;
    dehydration: boolean;
    heartFeelings: boolean;
    confusion: boolean;
  };
}

export interface PredictionResult {
  disease: string;
  confidence: number;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  medicines: string[];
  foods: string[];
  precautions: string[];
}

export function predictDisease(symptoms: Symptoms, healthData: HealthData): PredictionResult {
  let disease = "General Malaise";
  let baseConfidence = 60;
  let severity: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';

  // Rule-based Decision Tree Logic
  if (symptoms.chestPain || symptoms.breathingDifficulty) {
    disease = "Potential Cardiac Issue";
    severity = "Critical";
    baseConfidence = 85;
  } else if (symptoms.fever && symptoms.cough && symptoms.breathingDifficulty) {
    disease = "COVID-19 Suspected";
    severity = "High";
    baseConfidence = 80;
  } else if (symptoms.fever && symptoms.cough && symptoms.soreThroat) {
    disease = "Influenza (Flu)";
    severity = "Moderate";
    baseConfidence = 75;
  } else if (symptoms.headache && symptoms.nausea) {
    disease = "Migraine";
    severity = "Moderate";
    baseConfidence = 70;
  } else if (symptoms.runnyNose && symptoms.soreThroat && !symptoms.fever) {
    disease = "Common Cold";
    severity = "Low";
    baseConfidence = 85;
  } else if (symptoms.fever && symptoms.bodyAche) {
    disease = "Viral Fever";
    severity = "Moderate";
    baseConfidence = 70;
  } else if (symptoms.nausea && symptoms.bodyAche) {
    disease = "Gastroenteritis";
    severity = "Moderate";
    baseConfidence = 65;
  } else if (symptoms.headache && healthData.mentalHealth !== 'normal') {
    disease = "Tension Headache";
    severity = "Low";
    baseConfidence = 75;
  } else if (symptoms.fatigue && healthData.mentalHealth === 'stress') {
    disease = "Stress-Related Fatigue";
    severity = "Low";
    baseConfidence = 80;
  } else if (symptoms.cough && symptoms.soreThroat) {
    disease = "Upper Respiratory Infection";
    severity = "Moderate";
    baseConfidence = 70;
  } else if (symptoms.cough && symptoms.breathingDifficulty) {
    disease = "Bronchitis / Asthma";
    severity = "High";
    baseConfidence = 75;
  }

  // Confidence Adjustments
  let confidence = baseConfidence;
  if (healthData.temperature > 38.5) confidence += 5;
  if (healthData.mentalHealth !== 'normal') confidence += 3;
  if (healthData.faceAnalysis.tiredness) confidence += 2;
  if (healthData.faceAnalysis.stress) confidence += 2;
  if (healthData.faceAnalysis.redness) confidence += 2;
  if (healthData.faceAnalysis.dehydration) confidence += 3;
  if (healthData.faceAnalysis.heartFeelings) confidence += 4;
  if (healthData.faceAnalysis.confusion) confidence += 5;

  // Specific Dehydration Rule
  if (healthData.faceAnalysis.dehydration && symptoms.fatigue) {
    disease = "Dehydration / Heat Exhaustion";
    severity = "Moderate";
    baseConfidence = 85;
  }

  // Heart Feelings / Confusion Rules
  if (healthData.faceAnalysis.heartFeelings && symptoms.chestPain) {
    disease = "Acute Cardiac Distress";
    severity = "Critical";
    baseConfidence = 90;
  } else if (healthData.faceAnalysis.confusion && symptoms.fever) {
    disease = "Severe Infection / Meningitis Risk";
    severity = "Critical";
    baseConfidence = 88;
  } else if (healthData.faceAnalysis.confusion && healthData.mentalHealth !== 'normal') {
    disease = "Acute Anxiety / Panic Attack";
    severity = "Moderate";
    baseConfidence = 80;
  }

  confidence = Math.min(confidence, 95);

  // Recommendations based on disease
  const recommendations: Record<string, { medicines: string[], foods: string[], precautions: string[] }> = {
    "Potential Cardiac Issue": {
      medicines: ["Aspirin (if advised)", "Nitroglycerin"],
      foods: ["Low sodium foods", "Leafy greens"],
      precautions: ["Avoid physical exertion", "Sit upright", "Seek emergency help immediately"]
    },
    "COVID-19 Suspected": {
      medicines: ["Paracetamol", "Vitamin C", "Zinc"],
      foods: ["Warm fluids", "Protein-rich diet"],
      precautions: ["Isolate yourself", "Wear a mask", "Monitor oxygen levels"]
    },
    "Influenza (Flu)": {
      medicines: ["Antivirals (Oseltamivir)", "Ibuprofen"],
      foods: ["Chicken soup", "Citrus fruits"],
      precautions: ["Rest", "Hydrate", "Avoid public places"]
    },
    "Migraine": {
      medicines: ["Sumatriptan", "Naproxen"],
      foods: ["Magnesium-rich foods", "Ginger tea"],
      precautions: ["Rest in a dark room", "Avoid loud noises", "Stay hydrated"]
    },
    "Common Cold": {
      medicines: ["Decongestants", "Cough syrup"],
      foods: ["Honey and lemon", "Warm broth"],
      precautions: ["Wash hands frequently", "Get plenty of sleep", "Gargle with salt water"]
    },
    "Viral Fever": {
      medicines: ["Paracetamol", "Electrolytes"],
      foods: ["Light porridge", "Coconut water"],
      precautions: ["Cold compress", "Complete bed rest", "Drink lots of water"]
    },
    "Gastroenteritis": {
      medicines: ["ORS", "Probiotics"],
      foods: ["BRAT diet (Bananas, Rice, Applesauce, Toast)"],
      precautions: ["Avoid dairy and spicy food", "Frequent small sips of water"]
    },
    "Tension Headache": {
      medicines: ["Acetaminophen", "Muscle relaxants"],
      foods: ["Almonds", "Watermelon"],
      precautions: ["Manage stress", "Improve posture", "Scalp massage"]
    },
    "Stress-Related Fatigue": {
      medicines: ["Multivitamins", "Ashwagandha"],
      foods: ["Dark chocolate", "Oatmeal"],
      precautions: ["Meditation", "Regular exercise", "Prioritize sleep"]
    },
    "Upper Respiratory Infection": {
      medicines: ["Antihistamines", "Saline spray"],
      foods: ["Garlic", "Turmeric milk"],
      precautions: ["Steam inhalation", "Avoid cold drinks"]
    },
    "Bronchitis / Asthma": {
      medicines: ["Inhalers (Salbutamol)", "Corticosteroids"],
      foods: ["Omega-3 rich foods", "Apples"],
      precautions: ["Avoid triggers (dust, smoke)", "Keep inhaler handy"]
    },
    "Dehydration / Heat Exhaustion": {
      medicines: ["ORS (Oral Rehydration Salts)", "Electrolytes"],
      foods: ["Watermelon", "Cucumber", "Coconut water"],
      precautions: ["Drink 3-4 liters of water", "Avoid direct sun", "Cool down with a damp cloth"]
    },
    "Acute Cardiac Distress": {
      medicines: ["Nitroglycerin (if prescribed)", "Aspirin"],
      foods: ["None - seek immediate help"],
      precautions: ["Call emergency services", "Stop all physical activity", "Loosen tight clothing"]
    },
    "Severe Infection / Meningitis Risk": {
      medicines: ["Antibiotics (Hospital only)", "Antipyretics"],
      foods: ["None - seek immediate help"],
      precautions: ["Seek emergency medical attention", "Monitor for stiff neck or light sensitivity"]
    },
    "Acute Anxiety / Panic Attack": {
      medicines: ["Anxiolytics (if prescribed)", "Magnesium"],
      foods: ["Herbal tea", "Complex carbohydrates"],
      precautions: ["Practice deep breathing", "Find a quiet space", "Grounding exercises"]
    },
    "General Malaise": {
      medicines: ["General tonics"],
      foods: ["Balanced diet"],
      precautions: ["Regular checkup", "Healthy lifestyle"]
    }
  };

  const rec = recommendations[disease] || recommendations["General Malaise"];

  return {
    disease,
    confidence,
    severity,
    ...rec
  };
}
