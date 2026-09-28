// Content basis: standard fire classification (IS 2190 / NFPA-equivalent classes),
// PASS extinguisher technique, and standard evacuation procedure. This is training
// content for a simulation prototype, not a substitute for official certification.
// Santali ("sat") strings are DRAFT machine-assisted translations pending review by
// a native Santali speaker — see docs/localization-review.md. Do not treat as
// authoritative safety guidance until reviewed.
module.exports = {
  moduleId: 'fire-explosion',
  name: {
    en: 'Fire & Explosion Response',
    hi: 'आग एवं विस्फोट प्रतिक्रिया',
    sat: 'Sengel ar Bomka Jawab (DRAFT)',
  },
  description: {
    en: 'Learn to recognise fire hazards, select the right extinguisher, and evacuate safely.',
    hi: 'आग के खतरों को पहचानना, सही अग्निशामक चुनना और सुरक्षित रूप से बाहर निकलना सीखें।',
    sat: 'Sengel bipod kem sahaj lagit, sari extinguisher bacha ar bhorosare bahar ocho (DRAFT).',
  },
  category: 'Fire Safety',
  sectors: ['Mining', 'Steel', 'Mica'],
  version: 1,
  active: true,
  passThreshold: 70,
  questions: [
    {
      questionId: 'fire-q1',
      questionType: 'mcq',
      question: {
        en: 'Which extinguishing agent should NEVER be used on a live electrical equipment fire?',
        hi: 'चालू विद्युत उपकरण में लगी आग पर किस अग्निशामक पदार्थ का उपयोग कभी नहीं करना चाहिए?',
        sat: 'Ok ge extinguisher agent electrical sengel re banuk lagao lekan (DRAFT)?',
      },
      options: [
        { en: 'Water', hi: 'पानी', sat: 'Da\' (Water)' },
        { en: 'CO2 (Carbon Dioxide)', hi: 'CO2 (कार्बन डाइऑक्साइड)', sat: 'CO2' },
        { en: 'DCP (Dry Chemical Powder)', hi: 'डीसीपी (ड्राई केमिकल पाउडर)', sat: 'DCP' },
        { en: 'Foam', hi: 'फोम', sat: 'Foam' },
      ],
      correctAnswer: 0,
      explanation: {
        en: 'Water conducts electricity and can cause electric shock or spread the fire. Use CO2 or DCP on electrical fires.',
        hi: 'पानी बिजली का संचालन करता है और इससे बिजली का झटका लग सकता है या आग फैल सकती है। विद्युत आग पर CO2 या DCP का उपयोग करें।',
        sat: 'Da\' bijli chalao ar shock/agun barhao dae. Electrical sengel re CO2 se DCP bebohar mana (DRAFT).',
      },
      points: 10,
    },
    {
      questionId: 'fire-q2',
      questionType: 'mcq',
      question: {
        en: 'You notice smoke and small flames near a machine. What should you do FIRST?',
        hi: 'आपने किसी मशीन के पास धुआं और छोटी लपटें देखीं। आपको सबसे पहले क्या करना चाहिए?',
        sat: 'Am machine tayom re dhuwa ar hudin sengel nel keda. Am chetan re chi kaam koa (DRAFT)?',
      },
      options: [
        { en: 'Raise the alarm and alert nearby workers', hi: 'अलार्म बजाएं और आस-पास के श्रमिकों को सचेत करें', sat: 'Alarm bajao ar sagai mena hormo re khabar om (DRAFT)' },
        { en: 'Try to put it out alone without telling anyone', hi: 'किसी को बताए बिना अकेले बुझाने की कोशिश करें', sat: 'Akela nijer chesta koa (DRAFT)' },
        { en: 'Take a photo for social media', hi: 'सोशल मीडिया के लिए फोटो लें', sat: 'Photo dhori (DRAFT)' },
        { en: 'Ignore it and continue working', hi: 'इसे नज़रअंदाज़ करें और काम जारी रखें', sat: 'Chhare rakhi kaam tehen (DRAFT)' },
      ],
      correctAnswer: 0,
      explanation: {
        en: 'Raising the alarm immediately ensures everyone nearby is aware and can respond or evacuate in time.',
        hi: 'तुरंत अलार्म बजाने से आस-पास के सभी लोग सतर्क हो जाते हैं और समय रहते प्रतिक्रिया या निकासी कर सकते हैं।',
        sat: 'Turant alarm te sagai hormo khabar pao ar samay re ocho dae (DRAFT).',
      },
      points: 10,
    },
    {
      questionId: 'fire-q3',
      questionType: 'mcq',
      question: {
        en: 'A fire is burning oil/grease near machinery (Class B fire). Which extinguisher type is appropriate?',
        hi: 'मशीनरी के पास तेल/ग्रीस जल रहा है (क्लास बी आग)। कौन सा अग्निशामक उपयुक्त है?',
        sat: 'Machinery tayom re oil/grease sengel (Class B). Chi extinguisher sari (DRAFT)?',
      },
      options: [
        { en: 'Foam, CO2, or DCP extinguisher', hi: 'फोम, CO2, या डीसीपी अग्निशामक', sat: 'Foam, CO2, ar DCP' },
        { en: 'Plain water jet', hi: 'सादा पानी की धार', sat: 'Sanam da\'' },
        { en: 'Sand only', hi: 'केवल रेत', sat: 'Baali hoy' },
        { en: 'No action needed', hi: 'कोई कार्रवाई आवश्यक नहीं', sat: 'Kono kaam lagit ban' },
      ],
      correctAnswer: 0,
      explanation: {
        en: 'Water can spread a burning-liquid fire by splashing it. Foam, CO2 or DCP smother the fire safely.',
        hi: 'पानी जलते हुए तरल को छिड़ककर आग को फैला सकता है। फोम, CO2 या डीसीपी आग को सुरक्षित रूप से बुझाते हैं।',
        sat: 'Da\' te sengel bar dae. Foam/CO2/DCP bhorosa te sengel bandh (DRAFT).',
      },
      points: 10,
    },
    {
      questionId: 'fire-q4',
      questionType: 'ordering',
      question: {
        en: 'Arrange the correct evacuation sequence after a fire is detected.',
        hi: 'आग का पता चलने के बाद सही निकासी क्रम व्यवस्थित करें।',
        sat: 'Sengel nel taben khon bhorosa te bahar ocho niyom sajao (DRAFT).',
      },
      options: [
        { en: 'Raise the fire alarm', hi: 'फायर अलार्म बजाएं', sat: 'Fire alarm bajao' },
        { en: 'Alert coworkers nearby', hi: 'आस-पास के सहकर्मियों को सचेत करें', sat: 'Sagai hormo khabar om' },
        { en: 'Move to the nearest marked exit', hi: 'निकटतम चिह्नित निकास की ओर बढ़ें', sat: 'Hedak exit re ocho' },
        { en: 'Report to the assembly point / safety officer', hi: 'असेंबली पॉइंट / सुरक्षा अधिकारी को रिपोर्ट करें', sat: 'Assembly point re report koa' },
      ],
      correctAnswer: [0, 1, 2, 3],
      explanation: {
        en: 'Alarm first so everyone is warned, then alert those nearby, move to the exit, and confirm your safety at the assembly point.',
        hi: 'पहले अलार्म ताकि सभी को चेतावनी मिले, फिर आस-पास वालों को सचेत करें, निकास की ओर बढ़ें और असेंबली पॉइंट पर अपनी सुरक्षा की पुष्टि करें।',
        sat: 'Chetan alarm, uni sagai khabar, hedak exit, ar assembly point re confirm (DRAFT).',
      },
      points: 15,
    },
    {
      questionId: 'fire-q5',
      questionType: 'mcq',
      question: {
        en: 'In the PASS extinguisher technique (Pull, Aim, Squeeze, Sweep), what does the second step "Aim" mean?',
        hi: 'PASS अग्निशामक तकनीक (Pull, Aim, Squeeze, Sweep) में दूसरा चरण "Aim" का क्या अर्थ है?',
        sat: 'PASS technique re "Aim" mana chi (DRAFT)?',
      },
      options: [
        { en: 'Aim the nozzle at the base of the fire', hi: 'नोजल को आग के आधार पर निशाना बनाएं', sat: 'Nozzle sengel talare aim koa' },
        { en: 'Aim the nozzle at the ceiling', hi: 'नोजल को छत की ओर निशाना बनाएं', sat: 'Chhat dishom aim koa' },
        { en: 'Point the nozzle at yourself', hi: 'नोजल को अपनी ओर करें', sat: 'Apnar dishom aim koa' },
        { en: 'It does not matter where you aim', hi: 'निशाना कहां है, इससे फर्क नहीं पड़ता', sat: 'Aim mattar bang' },
      ],
      correctAnswer: 0,
      explanation: {
        en: 'Aiming at the base of the fire (the fuel), not the flames, is what actually puts it out.',
        hi: 'लपटों पर नहीं बल्कि आग के आधार (ईंधन) पर निशाना लगाने से आग वास्तव में बुझती है।',
        sat: 'Sengel tala (fuel) re aim koa hoyoenae sengel band (DRAFT).',
      },
      points: 10,
    },
    {
      questionId: 'fire-q6',
      questionType: 'ar_task',
      question: {
        en: 'AR TASK: Look around using your camera and tap the marker showing the nearest emergency exit.',
        hi: 'एआर कार्य: अपने कैमरे से चारों ओर देखें और निकटतम आपातकालीन निकास दिखाने वाले मार्कर पर टैप करें।',
        sat: 'AR KAAM: Camera te lelo ar hedak emergency exit marker re tap koa (DRAFT).',
      },
      options: [
        { en: 'Exit A (marked, correct)', hi: 'निकास A (चिह्नित, सही)', sat: 'Exit A (Sari)' },
        { en: 'Exit B (dead end)', hi: 'निकास B (डेड एंड)', sat: 'Exit B (Bang lekan)' },
        { en: 'Storage room', hi: 'भंडारण कक्ष', sat: 'Storage room' },
      ],
      correctAnswer: 0,
      explanation: {
        en: 'Always evacuate via the marked, unobstructed emergency exit nearest to you.',
        hi: 'हमेशा अपने निकटतम चिह्नित, अवरोध-रहित आपातकालीन निकास से बाहर निकलें।',
        sat: 'Sadhaya hedak marked exit re ocho (DRAFT).',
      },
      points: 15,
    },
  ],
};
