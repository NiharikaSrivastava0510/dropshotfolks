// The Thursday check list questions, shared by the form (index.html) and the results page (results.html).
// If you add or rename an option key here, change the matching list in the "surveys" rule in book/firestore.rules too.
window.DSF_SURVEY = {
  form: "thursday",
  questions: [
    { id: "often", one: true, required: true, q: "How often do you come on Thursdays?",
      opts: [["first", "First time"], ["monthly", "Once or twice a month"], ["most", "Most weeks"], ["every", "Every week"]] },
    { id: "likes", q: "What do you like about Thursday?", hint: "Tick all that apply",
      opts: [["level", "Games at my level"], ["friendly", "Friendly crowd"], ["organised", "Well organised courts"], ["value", "Good value"],
             ["time", "The time suits me"], ["location", "Easy to get to"], ["fitness", "Keeps me fit"], ["friends", "I've made friends here"]] },
    { id: "heard", q: "How did you hear about us?", hint: "Tick all that apply",
      opts: [["friend", "A friend"], ["social", "Instagram / TikTok"], ["whatsapp", "WhatsApp group"], ["google", "Google"],
             ["meetup", "Meetup"], ["other", "Somewhere else"]] },
    { id: "brought", one: true, q: "Have you brought a friend along?",
      opts: [["none", "Not yet"], ["one", "1 friend"], ["few", "2–3 friends"], ["many", "4 or more"]] },
    { id: "recommend", one: true, q: "Would you recommend Thursday to a friend?",
      opts: [["yes", "Yes, definitely"], ["maybe", "Maybe"], ["no", "No"]] },
    { id: "without", q: "If there was no Thursday session, you would…", hint: "Tick all that apply",
      opts: [["less", "Play less badminton"], ["stop", "Stop playing"], ["elsewhere", "Look for another club"], ["saturday", "Come on Saturdays instead"]] },
    { id: "better", q: "What would make it even better?", hint: "Tick all that apply",
      opts: [["courts", "More courts"], ["longer", "A longer session"], ["weekday", "A second weekday session"],
             ["coaching", "Some coaching"], ["great", "It's great as it is"]] },
    { id: "local", q: "Do you live, work or study in Tower Hamlets?", hint: "Optional · tick all that apply",
      opts: [["live", "I live here"], ["work", "I work here"], ["study", "I study here"]] },
    { id: "age", one: true, q: "Your age group", hint: "Optional",
      opts: [["u18", "Under 18"], ["18", "18–24"], ["25", "25–34"], ["35", "35–44"], ["45", "45–54"], ["55", "55+"]] }
  ]
};
