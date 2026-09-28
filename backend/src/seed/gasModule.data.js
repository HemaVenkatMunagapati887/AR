// Content basis: standard confined-space entry guidance (permit-to-work, atmospheric
// testing, buddy/attendant system) and general PPE/respiratory-protection principles.
// This is training content for a simulation prototype, not a substitute for official
// certification. Santali ("sat") strings are DRAFT machine-assisted translations
// pending review by a native Santali speaker — see docs/localization-review.md.
module.exports = {
  moduleId: 'gas-confined-space',
  name: {
    en: 'Gas Leak & Confined Space Protocol',
    hi: 'गैस रिसाव एवं संकुचित स्थान प्रोटोकॉल',
    sat: 'Gas Chuha ar Confined Space Niyom (DRAFT)',
  },
  description: {
    en: 'Learn to recognise gas hazards, select PPE, and follow the buddy system in confined spaces.',
    hi: 'गैस के खतरों को पहचानना, पीपीई चुनना और संकुचित स्थानों में बडी सिस्टम का पालन करना सीखें।',
    sat: 'Gas bipod sahaj, PPE bacha, ar confined space re buddy system tehen (DRAFT).',
  },
  category: 'Confined Space Safety',
  sectors: ['Mining', 'Steel', 'Mica'],
  version: 1,
  active: true,
  passThreshold: 70,
  questions: [
    {
      questionId: 'gas-q1',
      questionType: 'mcq',
      question: {
        en: 'Before anyone enters a confined space, what must be checked first?',
        hi: 'किसी के संकुचित स्थान में प्रवेश करने से पहले सबसे पहले क्या जांचा जाना चाहिए?',
        sat: 'Confined space re sen bage chetan chi check lagit (DRAFT)?',
      },
      options: [
        { en: 'The atmosphere/gas levels using a calibrated gas detector', hi: 'कैलिब्रेटेड गैस डिटेक्टर से वातावरण/गैस स्तर', sat: 'Gas detector te atmosphere check' },
        { en: 'Only the lighting inside', hi: 'केवल अंदर की रोशनी', sat: 'Hoyoenae light hoy' },
        { en: 'Nothing, entry can happen immediately', hi: 'कुछ नहीं, तुरंत प्रवेश किया जा सकता है', sat: 'Kisin bang, turant sen' },
        { en: 'Ask a coworker to enter first as a test', hi: 'एक सहकर्मी को पहले परीक्षण के रूप में प्रवेश करने को कहें', sat: 'Sagai hormo ke chetan sen om' },
      ],
      correctAnswer: 0,
      explanation: {
        en: 'A calibrated gas detector must confirm safe oxygen levels and absence of toxic/flammable gas before entry.',
        hi: 'प्रवेश से पहले कैलिब्रेटेड गैस डिटेक्टर से सुरक्षित ऑक्सीजन स्तर और विषाक्त/ज्वलनशील गैस की अनुपस्थिति की पुष्टि होनी चाहिए।',
        sat: 'Gas detector te oxygen ar toxic gas confirm chetan sen (DRAFT).',
      },
      points: 10,
    },
    {
      questionId: 'gas-q2',
      questionType: 'mcq',
      question: {
        en: 'What is the minimum safe staffing for confined space entry under the buddy system?',
        hi: 'बडी सिस्टम के तहत संकुचित स्थान में प्रवेश के लिए न्यूनतम सुरक्षित स्टाफिंग क्या है?',
        sat: 'Buddy system re minimum hormo kate lagit (DRAFT)?',
      },
      options: [
        { en: 'One entrant alone', hi: 'केवल एक व्यक्ति अकेले', sat: 'Miad hormo hoy' },
        { en: 'An entrant plus an attendant stationed outside', hi: 'एक प्रवेशकर्ता और बाहर तैनात एक सहायक', sat: 'Entrant + bahar re attendant' },
        { en: 'Five or more people', hi: 'पांच या अधिक लोग', sat: 'Mon se jastio hormo' },
        { en: 'There is no minimum requirement', hi: 'कोई न्यूनतम आवश्यकता नहीं है', sat: 'Minimum bang' },
      ],
      correctAnswer: 1,
      explanation: {
        en: 'The buddy system requires at least one entrant and one attendant outside who can raise the alarm and initiate rescue.',
        hi: 'बडी सिस्टम में कम से कम एक प्रवेशकर्ता और बाहर एक सहायक की आवश्यकता होती है जो अलार्म बजा सके और बचाव शुरू कर सके।',
        sat: 'Buddy system re entrant ar attendant lagao dorkar (DRAFT).',
      },
      points: 10,
    },
    {
      questionId: 'gas-q3',
      questionType: 'mcq',
      question: {
        en: 'Your gas detector alarms while you are inside a confined space. What should you do?',
        hi: 'जब आप संकुचित स्थान के अंदर हों तो आपका गैस डिटेक्टर अलार्म बजाता है। आपको क्या करना चाहिए?',
        sat: 'Confined space bhitor re gas detector alarm bajao le, chi koa (DRAFT)?',
      },
      options: [
        { en: 'Exit immediately and alert the attendant', hi: 'तुरंत बाहर निकलें और सहायक को सचेत करें', sat: 'Turant bahar ocho ar attendant khabar om' },
        { en: 'Continue working quickly to finish the task', hi: 'कार्य पूरा करने के लिए जल्दी से काम जारी रखें', sat: 'Kaam joldi seren tehen' },
        { en: 'Silence the alarm and continue', hi: 'अलार्म बंद करें और जारी रखें', sat: 'Alarm bandh koa ar tehen' },
        { en: 'Wait a few minutes to see if it stops', hi: 'यह देखने के लिए कुछ मिनट प्रतीक्षा करें कि यह रुकता है या नहीं', sat: 'Kisin minute rah koa' },
      ],
      correctAnswer: 0,
      explanation: {
        en: 'An alarm means dangerous atmospheric conditions may be present — exit immediately and never re-enter without clearance.',
        hi: 'अलार्म का मतलब है खतरनाक वायुमंडलीय स्थिति हो सकती है — तुरंत बाहर निकलें और मंजूरी के बिना फिर से प्रवेश न करें।',
        sat: 'Alarm mana bipod dae — turant bahar ocho (DRAFT).',
      },
      points: 10,
    },
    {
      questionId: 'gas-q4',
      questionType: 'mcq',
      question: {
        en: 'Which PPE is essential when there is a risk of toxic or oxygen-deficient atmosphere?',
        hi: 'जब विषाक्त या ऑक्सीजन-अपर्याप्त वातावरण का खतरा हो तो कौन सा पीपीई आवश्यक है?',
        sat: 'Toxic atmosphere risk re chi PPE dorkar (DRAFT)?',
      },
      options: [
        { en: 'Appropriate respiratory protection (e.g. SCBA)', hi: 'उपयुक्त श्वसन सुरक्षा (जैसे SCBA)', sat: 'SCBA respiratory protection' },
        { en: 'Sunglasses', hi: 'धूप का चश्मा', sat: 'Sunglasses' },
        { en: 'Sandals', hi: 'चप्पल', sat: 'Chappal' },
        { en: 'No PPE is needed', hi: 'किसी पीपीई की आवश्यकता नहीं है', sat: 'PPE dorkar bang' },
      ],
      correctAnswer: 0,
      explanation: {
        en: 'Respiratory protection appropriate to the hazard (assessed by the gas detector readings) is mandatory in toxic/oxygen-deficient atmospheres.',
        hi: 'गैस डिटेक्टर रीडिंग के आधार पर आकलन किए गए खतरे के अनुरूप श्वसन सुरक्षा विषाक्त/ऑक्सीजन-अपर्याप्त वातावरण में अनिवार्य है।',
        sat: 'Respiratory protection dorkar toxic atmosphere re (DRAFT).',
      },
      points: 10,
    },
    {
      questionId: 'gas-q5',
      questionType: 'ordering',
      question: {
        en: 'Arrange the correct confined space entry procedure in order.',
        hi: 'संकुचित स्थान प्रवेश प्रक्रिया को सही क्रम में व्यवस्थित करें।',
        sat: 'Confined space sen niyom sajao (DRAFT).',
      },
      options: [
        { en: 'Test the atmosphere with a gas detector', hi: 'गैस डिटेक्टर से वातावरण का परीक्षण करें', sat: 'Gas detector te atmosphere test' },
        { en: 'Obtain a signed entry permit', hi: 'हस्ताक्षरित प्रवेश परमिट प्राप्त करें', sat: 'Entry permit lagao' },
        { en: 'Position an attendant outside with communication', hi: 'संचार के साथ बाहर एक सहायक तैनात करें', sat: 'Bahar attendant rakhao' },
        { en: 'Enter with your buddy, maintaining communication', hi: 'अपने बडी के साथ प्रवेश करें, संचार बनाए रखें', sat: 'Buddy sathe sen, communication rakhao' },
      ],
      correctAnswer: [0, 1, 2, 3],
      explanation: {
        en: 'Always test the atmosphere, secure a permit, station an attendant, and only then enter with a buddy.',
        hi: 'हमेशा वातावरण का परीक्षण करें, परमिट सुरक्षित करें, एक सहायक तैनात करें, और उसके बाद ही बडी के साथ प्रवेश करें।',
        sat: 'Sadhaya atmosphere test, permit, attendant, tabe buddy sathe sen (DRAFT).',
      },
      points: 15,
    },
    {
      questionId: 'gas-q6',
      questionType: 'mcq',
      question: {
        en: 'Who should always remain outside during a confined space entry?',
        hi: 'संकुचित स्थान में प्रवेश के दौरान हमेशा बाहर कौन रहना चाहिए?',
        sat: 'Confined space sen bela chi hormo bahar tehen lagit (DRAFT)?',
      },
      options: [
        { en: 'An attendant monitoring and ready to raise the alarm', hi: 'एक सहायक जो निगरानी कर रहा हो और अलार्म बजाने के लिए तैयार हो', sat: 'Attendant monitor koa' },
        { en: 'No one — everyone should enter', hi: 'कोई नहीं — सभी को अंदर जाना चाहिए', sat: 'Kono bang — saban sen' },
        { en: 'Two entrants and no attendant', hi: 'दो प्रवेशकर्ता और कोई सहायक नहीं', sat: 'Baria entrant, attendant bang' },
        { en: 'The supervisor, only during lunch break', hi: 'केवल दोपहर के भोजन के समय पर्यवेक्षक', sat: 'Supervisor lunch bela hoy' },
      ],
      correctAnswer: 0,
      explanation: {
        en: 'The attendant must remain outside at all times, monitoring conditions and ready to alert rescue services immediately.',
        hi: 'सहायक को हर समय बाहर रहना चाहिए, स्थितियों की निगरानी करनी चाहिए और तुरंत बचाव सेवाओं को सचेत करने के लिए तैयार रहना चाहिए।',
        sat: 'Attendant sadhaya bahar tehen ar rescue khabar om ready (DRAFT).',
      },
      points: 10,
    },
    {
      questionId: 'gas-q7',
      questionType: 'ar_task',
      question: {
        en: 'AR TASK: Scan the area and tap the marker showing the correct hazard zone boundary.',
        hi: 'एआर कार्य: क्षेत्र को स्कैन करें और सही खतरा क्षेत्र सीमा दिखाने वाले मार्कर पर टैप करें।',
        sat: 'AR KAAM: Area scan koa ar sari hazard zone marker re tap koa (DRAFT).',
      },
      options: [
        { en: 'Marked hazard zone boundary (correct)', hi: 'चिह्नित खतरा क्षेत्र सीमा (सही)', sat: 'Marked hazard zone (Sari)' },
        { en: 'Open walkway (incorrect)', hi: 'खुला रास्ता (गलत)', sat: 'Open walkway (Bhul)' },
        { en: 'Break room (incorrect)', hi: 'विश्राम कक्ष (गलत)', sat: 'Break room (Bhul)' },
      ],
      correctAnswer: 0,
      explanation: {
        en: 'Recognising and respecting the marked hazard zone boundary prevents accidental exposure to unsafe atmosphere.',
        hi: 'चिह्नित खतरा क्षेत्र सीमा को पहचानना और उसका सम्मान करना असुरक्षित वातावरण के आकस्मिक संपर्क को रोकता है।',
        sat: 'Marked hazard zone sahaj hoyoenae bipod atkao (DRAFT).',
      },
      points: 15,
    },
  ],
};
