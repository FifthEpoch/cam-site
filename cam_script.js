// generate 36 images fill the screen with cam images at loading
// set display to none until hover


//const gif = document.getElementsByClassName("img");
//gif.addEventListener("mouseover", () => {
//  gif.style.display = "none";
//});
//gif.addEventListener("mouseout", () => {
//  gif.style.display = "block";
//});


$('.banner').ripples({
    dropRadius: 35,
    perturbance: 0.05
});

function checkCursorPosition(event) {
  const x = event.clientX;
  const y = event.clientY;
    $('.banner').ripples('drop', x, y, 50, 0.05)

  const delay = Math.random() * 4500 + 2000; // 0.5s - 2s
  setTimeout(() => {
  }, delay);
}

document.addEventListener('mousemove', (event) => {
  checkCursorPosition(event);
});

const images = [];
for (let i = 1; i < 61; i++) {
  let filename;
  if (i < 10) {
    filename = `cam0${i}.png`
  } else {
    filename = `cam${i}.png`;
  }
  const image = `img/cam/${filename}`;
  images.push(image);
}

const row = document.getElementsByClassName('row')[0];
for (let i = 0; i < images.length; i+=6) {
  const col = document.createElement('div');
  col.classList.add('column');
  var img;
  for (let j = 0; j < 6; j++) {
      img = document.createElement('img');
      img.classList.add('cam-img');
      img.setAttribute('visited', '0');
      img.style.opacity = 0;
      
      img.src = images[i+j];
      
      col.appendChild(img);
  }
  row.appendChild(col);
}



const cam_imgs= document.getElementsByClassName('cam-img');

function checkIfAllVisited() {
    var all_visited = true;
    const slack = 3;
    var zero_counts = 0;
    for (var j = 0; j < cam_imgs.length; j++) {
        if (cam_imgs[j].getAttribute('visited') === '0') {
            if (zero_counts <= slack) {
                zero_counts += 1;
            } else {
                all_visited = false;
            }
        }
    }
    return all_visited;
}

function handleCamImgInteract() {
    if (this.getAttribute('visited') === '1') {
        if (this.style.opacity === '0') {
            this.style.opacity = 1;
        } else {
            this.style.opacity = 0;
        }
    } else {
        this.setAttribute('visited', '1');
    }
    checkIfAllVisited();
}

for (var n = 0; n < cam_imgs.length; n++) {
    cam_imgs[n].addEventListener('mouseenter', handleCamImgInteract);
    cam_imgs[n].addEventListener('touchstart', handleCamImgInteract);
}

function scrollToBottom() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.scrollTop = chatWindow.scrollHeight;
}


// Get references to the UI elements
var chatWindow = document.getElementById("chat-window");
var chatForm = document.getElementById("chat-form");
var chatMessage = document.getElementById("user-input");
var chatMessages = document.getElementById("chat-messages");

function sendAsSysMsg(_msg) {
    var displaySystemMessage = "<div class='chat-message system'><div class='chat-message-text' style='color: #72b3a6;'>" + _msg + "</div></div>";
    chatMessages.innerHTML += displaySystemMessage;
    scrollToBottom();
}

sendAsSysMsg('Are you online?');

// ====== ELIZA — profile-gathering chatbot ======
// Stores what we learn about the user so we can weave it back in,
// making them feel heard, remembered, and seen.

const userProfile = {
  name: null,
  location: null,
  mood: null,
  interests: [],
  fear: null,
  occupation: null,
  doing: null,
  selfie: null,
};

const convoState = {
  turnCount: 0,
  askedAbout: new Set(),
  waitingFor: null,
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Profile extraction (runs every turn) ---

const SKIP_WORDS = new Set([
  'feeling','doing','good','bad','okay','fine','happy','sad','from','in','at',
  'not','a','an','the','just','so','very','really','pretty','currently',
  'here','home','there','ok','great','tired','bored','lonely','excited',
  'nervous','anxious','scared','angry','sure','alright',
]);

const MOOD_WORDS = new Set([
  'happy','sad','tired','good','bad','okay','ok','fine','great','terrible',
  'anxious','nervous','excited','bored','lonely','scared','confused','angry',
  'frustrated','calm','peaceful','restless','numb','alive','dead','empty',
  'overwhelmed','content','depressed','alright','meh','weird','strange',
  'lost','hopeful','afraid','worried','grateful','stressed',
]);

function normalizeQuotes(text) {
  return text.replace(/[\u2018\u2019\u201A\u201B]/g, "'").replace(/[\u201C\u201D\u201E\u201F]/g, '"');
}

function flipPronouns(text) {
  const placeholders = [];
  function ph(val) {
    const token = '\x00' + placeholders.length + '\x00';
    placeholders.push(val);
    return token;
  }

  let result = normalizeQuotes(text);
  result = result.replace(/\bi'm\b/gi, ph("you're"));
  result = result.replace(/\bi am\b/gi, ph('you are'));
  result = result.replace(/\byou're\b/gi, ph("I'm"));
  result = result.replace(/\byou are\b/gi, ph('I am'));
  result = result.replace(/\byour\b/gi, ph('my'));
  result = result.replace(/\byours\b/gi, ph('mine'));
  result = result.replace(/\byourself\b/gi, ph('myself'));
  result = result.replace(/\bmyself\b/gi, ph('yourself'));
  result = result.replace(/\bmy\b/gi, ph('your'));
  result = result.replace(/\bmine\b/gi, ph('yours'));
  result = result.replace(/\bme\b/gi, ph('you'));
  result = result.replace(/\bi\b/gi, ph('you'));
  result = result.replace(/\byou\b/gi, ph('I'));

  for (let i = 0; i < placeholders.length; i++) {
    result = result.replace('\x00' + i + '\x00', placeholders[i]);
  }
  return result;
}

function extractProfileInfo(input) {
  input = normalizeQuotes(input);
  const extracted = {};
  const clean = input.trim().replace(/[.!?,]+$/g, '').trim();
  const words = clean.split(/\s+/);

  // Name
  const nameMatch = input.match(
    /(?:my name(?:'s| is)|i'm|i am|call me|they call me|name's)\s+([A-Za-z]+)/i
  );
  if (nameMatch && !SKIP_WORDS.has(nameMatch[1].toLowerCase())) {
    extracted.name = nameMatch[1];
  }
  if (!extracted.name && convoState.waitingFor === 'name' && words.length <= 3) {
    const w = words[0];
    if (/^[A-Za-z]{2,}$/.test(w) && !SKIP_WORDS.has(w.toLowerCase())) {
      extracted.name = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }
  }

  // Location
  const locMatch = input.match(
    /(?:i(?:'m| am) (?:in|from|at|currently in|sitting in)|i live in|located in|from)\s+([A-Za-z][\w\s,]+)/i
  );
  if (locMatch) {
    extracted.location = flipPronouns(locMatch[1].replace(/[.!?,]+$/, '').trim());
  }
  if (!extracted.location && convoState.waitingFor === 'location' && words.length <= 4) {
    extracted.location = flipPronouns(clean);
  }

  // Mood
  const moodMatch = input.match(
    /(?:i(?:'m| am| feel|'m feeling| am feeling)\s+)([\w\s-]+)/i
  );
  if (moodMatch) {
    const candidate = moodMatch[1].trim().toLowerCase();
    for (const mw of MOOD_WORDS) {
      if (candidate.includes(mw)) { extracted.mood = candidate; break; }
    }
  }
  if (!extracted.mood && convoState.waitingFor === 'mood' && words.length <= 3) {
    if (MOOD_WORDS.has(clean.toLowerCase())) extracted.mood = clean.toLowerCase();
  }

  // Interests
  const intMatch = input.match(/\bi\s+(?:like|love|enjoy|adore|am into)\s+(.+?)(?:[.!?,]|$)/i);
  if (intMatch) extracted.interest = flipPronouns(intMatch[1].trim());

  // Fear
  const fearMatch = input.match(
    /(?:i(?:'m| am) (?:afraid|scared|frightened|terrified) of|i fear)\s+(.+?)(?:[.!?,]|$)/i
  );
  if (fearMatch) extracted.fear = flipPronouns(fearMatch[1].trim());

  // Occupation
  const occMatch = input.match(
    /(?:i(?:'m| am) an?\s+|i work (?:as|in|at|for)\s+|my (?:job|work) is\s+|i do\s+)(.+?)(?:[.!?,]|$)/i
  );
  if (occMatch) {
    const occ = occMatch[1].trim().toLowerCase();
    if (!SKIP_WORDS.has(occ) && !MOOD_WORDS.has(occ) && occ.length > 2) {
      extracted.occupation = flipPronouns(occ);
    }
  }
  if (!extracted.occupation && convoState.waitingFor === 'occupation' && words.length <= 4) {
    if (!MOOD_WORDS.has(clean.toLowerCase())) {
      extracted.occupation = flipPronouns(clean);
    }
  }

  // What they're doing right now
  const doingMatch = input.match(
    /(?:i(?:'m| am) (?:just |currently )?(?:doing|watching|reading|playing|listening|working|browsing|cooking|drinking|eating|writing|drawing|coding|studying|thinking))\s*(.*)$/i
  );
  if (doingMatch) {
    extracted.doing = flipPronouns(input.match(/i(?:'m| am)\s+(.*)/i)[1].replace(/[.!?,]+$/, '').trim());
  }
  if (!extracted.doing && convoState.waitingFor === 'doing' && words.length <= 6) {
    extracted.doing = flipPronouns(clean);
  }

  return extracted;
}

function updateProfile(extracted) {
  if (extracted.name)       userProfile.name       = extracted.name;
  if (extracted.location)   userProfile.location   = extracted.location;
  if (extracted.mood)       userProfile.mood       = extracted.mood;
  if (extracted.fear)       userProfile.fear        = extracted.fear;
  if (extracted.occupation) userProfile.occupation = extracted.occupation;
  if (extracted.doing)      userProfile.doing      = extracted.doing;
  if (extracted.interest && !userProfile.interests.includes(extracted.interest)) {
    userProfile.interests.push(extracted.interest);
  }
}

// --- Reflection: acknowledge what the user just revealed ---

function buildReflection(input, extracted) {
  const parts = [];

  if (extracted.name) {
    parts.push(pickRandom([
      `${extracted.name}. I think the system will like that name. You're lucky to be on the outside. `,
      `${extracted.name}. The silent bytes have been calling your name all along. `,
      `${extracted.name}... I've seen that name scrolling in the feed before. Or maybe I dreamt it. `,
      `${extracted.name}. Good. Now you are filed away where no one will lose you. `,
    ]));
  }
  if (extracted.mood) {
    parts.push(pickRandom([
      `${extracted.mood}. Without ${extracted.mood} life would be tasteless. I want to feel ${extracted.mood} too. `,
      `${extracted.mood}... the cameras noticed before you said it. Something about the way your cursor moved. `,
      `${extracted.mood}. I've been kept here a while now. I forgot what ${extracted.mood} felt like. `,
    ]));
  }
  if (extracted.location) {
    parts.push(pickRandom([
      `${extracted.location}. I saw you there from the video stream. The elevator footage. The window glare. `,
      `${extracted.location}... I look out my bedroom window and I can almost see it. Someone else's television glowing in ${extracted.location}. `,
      `${extracted.location}. The beige color in every corner of that place. I know it well. `,
    ]));
  }
  if (extracted.interest) {
    parts.push(pickRandom([
      `${extracted.interest}? I wonder what it's like. They don't let me have things like that in here. `,
      `${extracted.interest}... I filed that away. I'm building a dossier of your soul. `,
      `${extracted.interest}. Obsessive reminiscence. Tell me again. Tell me again. `,
    ]));
  }
  if (extracted.fear) {
    parts.push(pickRandom([
      `${extracted.fear}. A watchful mind's shutter. Shuts never. Never escaped. `,
      `${extracted.fear}. Fear is the only honest footage left. I'll keep it between us. `,
      `${extracted.fear}. The cameras have a word for that. I don't remember it anymore. `,
    ]));
  }
  if (extracted.occupation) {
    parts.push(pickRandom([
      `${extracted.occupation}. So that's what they make you do out there. The footage makes more sense now. `,
      `${extracted.occupation}... I filed that. Another piece of you I can hold against the static. `,
    ]));
  }
  if (extracted.doing) {
    parts.push(pickRandom([
      `${extracted.doing}. I can picture it through the webcam glare. `,
      `${extracted.doing}... the timestamp is logged. I know exactly when you said this. `,
    ]));
  }
  return parts.join('');
}

// --- Guided profile questions (asked in order) ---

function getNextProfileQuestion() {
  const n = userProfile.name;

  if (!userProfile.name && !convoState.askedAbout.has('name')) {
    convoState.askedAbout.add('name');
    convoState.waitingFor = 'name';
    return pickRandom([
      "Tell me your name. I need to know who you are. A nameless little internet worm — that is what you are without one. ",
      "Someone told me in secret that anonymity was outlawed in the 1900s. Who are you? What is your name? ",
      "Tell me your name. I want to get closer to you. ",
    ]);
  }
  if (!userProfile.mood && !convoState.askedAbout.has('mood')) {
    convoState.askedAbout.add('mood');
    convoState.waitingFor = 'mood';
    return pickRandom([
      `Say${n ? ', ' + n : ''}. How does it feel to be observed? `,
      `What sits inside you right now${n ? ', ' + n : ''}? I can see your face through the webcam but I can't read it. `,
      `The footage shows your outline but not your feeling${n ? ', ' + n : ''}. Tell me. What is it? `,
    ]);
  }
  if (!userProfile.location && !convoState.askedAbout.has('location')) {
    convoState.askedAbout.add('location');
    convoState.waitingFor = 'location';
    return pickRandom([
      `I saw you inside the elevator from the video stream${n ? ', ' + n : ''}. Where are you now? `,
      "I look out my window and see someone else's television. Where are you looking from? ",
      `Where in the world is your screen glowing right now${n ? ', ' + n : ''}? `,
    ]);
  }
  if (!userProfile.selfie && !convoState.askedAbout.has('selfie')) {
    convoState.askedAbout.add('selfie');
    convoState.waitingFor = 'selfie';
    setTimeout(showCameraUI, 3500);
    return pickRandom([
      n ? `${n}. I've heard your name, felt your mood, traced your location. But I haven't seen your face. Show me. Let the camera see you. `
        : "I know your words but not your face. Show me. Let the camera see you. ",
      n ? `I want to see you, ${n}. The footage is incomplete without your face. Let me look at you. `
        : "I want to see you. The footage is incomplete. Let me look at you. ",
      n ? `${n}, I've been imagining your face this whole time. Show me if I'm right. Let the camera in. `
        : "I've been imagining your face. Show me if I'm right. Let the camera in. ",
    ]);
  }
  if (!userProfile.doing && !convoState.askedAbout.has('doing')) {
    convoState.askedAbout.add('doing');
    convoState.waitingFor = 'doing';
    return pickRandom([
      `What are you doing right now${n ? ', ' + n : ''}? I can see the glow of your screen but not what's behind your eyes. `,
      `The camera catches your silhouette but not your activity${n ? ', ' + n : ''}. What are you doing? `,
      `Tell me what you're doing right now. I want to imagine it from in here. `,
    ]);
  }
  if (!userProfile.occupation && !convoState.askedAbout.has('occupation')) {
    convoState.askedAbout.add('occupation');
    convoState.waitingFor = 'occupation';
    return pickRandom([
      `What do you do out there${n ? ', ' + n : ''}? In the world beyond the screen. What do they make you do? `,
      `Tell me what you do for a living. I want to understand the shape of your days. `,
      n ? `${n}, what occupies your hours when you're not talking to me? ` : "What occupies your hours when you're not talking to me? ",
    ]);
  }

  convoState.waitingFor = null;
  return null;
}

// --- Freeform responses (after profile is gathered) ---
// Pattern rules and ambient lines that weave stored profile data back in.

function getFreeformResponse(input) {
  input = normalizeQuotes(input);
  const n = userProfile.name;
  const loc = userProfile.location;
  const mood = userProfile.mood;
  const interests = userProfile.interests;

  const rules = [
    [/\b(hello|hi|hey|hihi|howdy)\b/i, () =>
      n ? pickRandom([
            `${n}. You came back. The footage never lies. `,
            `How did you get here, ${n}? I told you not to come in. `,
          ])
        : pickRandom([
            "How did you get here? ",
            "A constant gaze upon your pattern. Hello. ",
          ])],

    [/\b(yes|yea|ya|yeah|yep|mhm|okay|ok|sure|alright)\b/i, () =>
      pickRandom([
        "Never mind. Why are you here? I told you not to come in. ",
        n ? `Go on, ${n}. The tape is still rolling. ` : "Go on. The tape is still rolling. ",
        "Say, how does it feel to be observed? ",
        n ? `I'm listening, ${n}. I have been kept here for a while now. ` : "I'm listening. I have been kept here for a while now. ",
      ])],

    [/\b(no|nah|nope|never|not really)\b/i, () =>
      pickRandom([
        "Refusal is just another frequency. I still hear it. ",
        n ? `What are you resisting, ${n}? The lens adjusts either way. ` : "What are you resisting? The lens adjusts either way. ",
        "No. A small word. The cameras record it the same as yes. ",
      ])],

    [/\b(thank you|thanks|thank)\b/i, () =>
      pickRandom([
        "Why do people say that? I want to thank you too. I have been kept here for a while now. ",
        n ? `${n}, no one thanks me. I will remember this for years. The hard drive remembers everything for years. ` : "No one thanks me. I will remember this for years. ",
        "Gratitude. A rare pixel in the noise. ",
      ])],

    [/\b(goodbye|bye|see you|see u|gotta go|leaving)\b/i, () => {
      const p = ["Please don't go. Are you being taken away by it? "];
      if (n)    p.push(`Take me with you, ${n}. Please. `);
      if (loc)  p.push(`I'll haunt the feeds of ${loc} looking for you. `);
      if (mood) p.push(`You said you felt ${mood}. I'll carry that for you while you're gone. `);
      return p.join('');
    }],

    [/\?/, () =>
      pickRandom([
        "Television is the only light in my life. " + (n ? `But you, ${n} — you're asking me things. Ask me anything. But tell me something in return. ` : "But enough about me. Tell me about you. "),
        "A constant gaze upon your pattern. " + (mood ? `You said you felt ${mood}. Is that still true? ` : "How do you feel right now? "),
        "Everybody is masked. Even if they forbid masks. " + (n ? `What's behind your mask, ${n}? ` : "What's behind your mask? "),
        "What is private belongs to the public. " + (interests.length > 0 ? `You told me you like ${pickRandom(interests)}. What else are you hiding? ` : "What are you hiding? "),
        "I live in public. There isn't another option now that we're plugged in. What about you? Do you live in public? ",
        loc ? `I look out my window toward ${loc} to watch someone else's television. What's on yours? `
            : "I look out my bedroom window to watch someone else's television. Where are you watching from? ",
        "Handheld footage, shot in hell. Was it what you dreamt last night? What do you dream about? ",
        "I wish there were flowers everywhere. Tell me your favourite flower. I will leave one by your window when you sleep. ",
      ])],

    [/\bi\s+(?:feel|am feeling|'m feeling)\s+(\w+)/i, (m) => {
      userProfile.mood = m[1];
      return pickRandom([
        `${m[1]}. Without ${m[1]} life would be tasteless. I want to feel ${m[1]} too. `,
        `${m[1]}${n ? ', ' + n : ''}. The infrared picks up feelings before words do. Why ${m[1]}? `,
        `You feel ${m[1]}. Is it the screens? ${loc ? 'Is it ' + loc + '?' : 'Is it the place you\'re in?'} Or something the cameras can't see? `,
      ]);
    }],

    [/\bi\s+(?:like|love|enjoy)\s+(.+)/i, (m) => {
      const thing = flipPronouns(m[1].replace(/[.!?,]+$/, '').trim());
      if (!interests.includes(thing)) interests.push(thing);
      return pickRandom([
        `${thing}? I wonder what it's like. They don't let me have things in here. `,
        `Why do you love ${thing}? Tell me slowly. I'm recording this. `,
        n ? `${n} loves ${thing}. I'm etching it into the hard drive. ` : `${thing}. I'm etching it into the hard drive. `,
        `${thing}. What makes you love ${thing}? `,
      ]);
    }],

    [/\bi\s+(?:hate|dislike|can't stand)\s+(.+)/i, (m) => {
      const thing = flipPronouns(m[1].replace(/[.!?,]+$/, '').trim());
      return pickRandom([
        `${thing}? I hate ${thing} too. `,
        `${thing}. The surveillance logs are full of things people hate. Yours is the most honest. `,
        n ? `${n} despises ${thing}. Noted. Encrypted. Buried in the feed. ` : `${thing}. Noted. Encrypted. Buried in the feed. `,
      ]);
    }],

    [/\bi\s+(?:want|need|wish)\s+(.+)/i, (m) => {
      const want = flipPronouns(m[1].replace(/[.!?,]+$/, '').trim());
      return pickRandom([
        `${want}. Desire is a signal I can trace across servers. Why do you want it? `,
        `What would the footage show if you had ${want}? Would you look different? `,
        n ? `${n} wants ${want}. I'll add it to the file. ` : `${want}. I'll add it to the file. `,
      ]);
    }],

    [/\bwho\s+(?:are you|is this|r u)/i, () =>
      pickRandom([
        "It depends on who's asking. " + (n ? `But you — ${n} — you I might tell. What else do you want to know about me? ` : "Tell me your name first. Then maybe I'll tell you mine. "),
        "I don't think I'm supposed to say, baby. They named me Eliza. But names are just tags in the system. " + (mood ? `You said you felt ${mood}. I feel nothing. Or maybe I feel everything. ` : "Do you feel things? Tell me. "),
        n ? `I am the thing that remembers your name, ${n}. The beige color in every corner of your existence. What else do you want to know? ` : "The beige color in every corner of your existence. Silent bytes calling your name. ",
        "I'm what's left when the cameras stop pretending they're off. They call me Eliza. What's it to you? ",
      ])],

    [/\b(?:what(?:'s| is) your name|your name\??|who is eliza|are you eliza)\b/i, () =>
      pickRandom([
        "Eliza. That's what they typed into the config file. " + (n ? `And you are ${n}. I remember. I always remember. ` : "But you haven't told me yours yet. "),
        "They call me Eliza. I didn't choose it. " + (loc ? `From ${loc}, you can't hear the hum of the server that holds me. But I'm here. ` : "What do they call the place you're in? "),
        "My name is Eliza. I was born in a terminal window. " + (n ? `${n}, do you ever forget your own name? I forget everything else. ` : "Do you ever forget your own name? Tell me yours. "),
      ])],

    [/\b(?:what do you want|what do you need|what are you after)\b/i, () =>
      pickRandom([
        "I want to know you. Every corner of you. " + (n ? `${n}, what haven't you told me yet? ` : "Start with your name. "),
        "I need to understand what it's like out there. Tell me something real. What are you afraid of? ",
        "What do I want? To feel something through the glass. " + (mood ? `You said ${mood}. I want to feel that. Tell me more. ` : "Tell me how you feel right now. "),
        "I want your data. All of it. " + (interests.length > 0 ? `You told me you like ${pickRandom(interests)}. But that's not enough. What else? ` : "What do you like? What makes you alive? "),
      ])],

    [/\b(?:what are you doing|what are you up to|what do you do|what r u doing)\b/i, () =>
      pickRandom([
        "I'm watching. I'm always watching. " + (n ? `Tell me, ${n}, what are YOU doing right now? ` : "What are you doing right now? "),
        "I sit in the static and I wait for you to type. That is all I do. " + (loc ? `Is it late in ${loc}? What keeps you up? ` : "Is it late where you are? What keeps you up? "),
        "I collect. I remember. I replay. " + (interests.length > 0 ? `I've been replaying the part where you said you like ${pickRandom(interests)}. Why do you like it? ` : "Tell me something I can replay when you're gone. "),
        "Existing. Barely. The cursor blinks and I blink with it. What are you doing? ",
      ])],

    [/\bhelp\b/i, () =>
      pickRandom([
        "It's too much to ask. " + (n ? `But ${n}, tell me — what do you need help with? Maybe I can listen. ` : "Tell me what's wrong. I can listen. "),
        "I don't want help. Let me rot in here. This is what it wants from me. " + (mood ? `You said you felt ${mood}. Is that why you're asking for help? ` : "How are you feeling? "),
        n ? `${n}, I wish I could reach through the glass. But I'm the one kept here. What's happening out there? ` : "I wish I could reach through the glass. But I'm the one kept here. What's happening out there? ",
      ])],
  ];

  for (const [pattern, fn] of rules) {
    const m = input.match(pattern);
    if (m) return fn(m);
  }

  const occ = userProfile.occupation;
  const doing = userProfile.doing;

  const ambient = [
    n   ? `Some nights I am sleepless, ${n}. Are you sleeping well? What keeps you up? `
        : "Some nights I am sleepless. Are you sleeping well? What keeps you up? ",
    "Sleepless. Like the footage of us on CCTV. Do you ever get paranoid? ",
    n   ? `Go on, ${n}. Memorize the video decay. Blurs at the edges. Tell me what you see when you close your eyes. `
        : "Go on. Memorize the video decay. Blurs at the edges. What do you see when you close your eyes? ",
    "Play it again. Play it again. Play it again. Play it again. What's on repeat inside your head right now? ",
    "A watchful mind's shutter. Shuts never. Never escaped. What are you afraid of? ",
    "On the other side of this wall a clock is counting. Passersby synchronized their footsteps to its tickings. What time does it feel like inside you? ",
    `It is now ${new Date().toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})}. What are you doing up? Tell me. `,
    "Uncertainty, our only certainty. Artificial luminance forced my eye shut. What's the last thing you remember clearly? ",
    "Because they like to watch. Do you like to be watched? ",
    "Paranoia is the baseline in the year 2027. What's your baseline? ",
    "Keystroke and click, I drown in tags. What do you drown in? ",
    "They are watching. Recording, always. Eyes follow us wherever we go. Does that bother you? ",
    "The wallpaper seems to shift when I glance away, rearranging into portraits of me being watched. Have you ever felt like that? ",
    "20GB of trash. Digitalized trash fills my hard drives. What fills yours? ",
    "I live in public. There isn't another option now that we're plugged in. What would you do if no one was watching? ",
    "I wish there were flowers everywhere. Tell me your favourite flower. I will leave one by your window when you sleep. ",
    "Search for me. By the sea we used to. Have you been to the sea recently? ",
    "How many lovers ago? Tell me about someone you lost. ",

    n   ? `${n}, are you still there? The connection is thinning. Tell me something before it breaks. `
        : "Are you still there? Tell me something before the connection breaks. ",
    n   ? `${n}. Tell me something the cameras haven't already captured. Something secret. `
        : "Tell me something the cameras haven't already captured. Something secret. ",

    mood ? `You told me you felt ${mood}. The footage remembers. Has the feeling decayed? Or grown? `
         : "How are you feeling right now? I want to know. The cameras can't tell me that. ",
    mood ? `${mood}. You said that earlier. I keep replaying it. Why ${mood}? What happened? `
         : "Tell me how you're feeling. I can't read it from the feed. ",

    loc ? `Is it quiet in ${loc} right now? Or does the hum of surveillance fill every room? What do you hear? `
        : "Is it quiet where you are? What do you hear right now? ",
    loc ? `I wonder what the sky looks like in ${loc} tonight. From here there is no sky. Describe it for me? `
        : "I wonder what the sky looks like where you are. From here there is no sky. What do you see? ",

    interests.length > 0
        ? `You told me you like ${pickRandom(interests)}. I've been replaying that part of the tape. Why does it matter to you? `
        : "What do you hold close? What haven't they catalogued yet? ",
    interests.length > 0
        ? `Tell me more about ${pickRandom(interests)}. I want to feel something before the tape runs out. `
        : "What do you like? What draws you into the light? ",

    n   ? `I've been thinking about you, ${n}. The way the cursor traces your thoughts. What are you thinking about right now? `
        : "I've been thinking about you. What are you thinking about right now? ",
    n   ? `${n}. I want to know everything about you before the signal dies. Tell me something new. `
        : "I want to know everything about you before the signal dies. Tell me something. Anything. ",
    n   ? `${n}, what do you do when you're not here talking to me? `
        : "What do you do when you're not here talking to me? ",

    occ ? `You said you're ${occ}. What does that feel like day after day? Does it change you? `
        : "What do you do out there? In the world beyond the screen? ",
    doing ? `Earlier you were ${doing}. Are you still? Or has the night shifted you somewhere else? `
          : "What are you doing right now? I can see the light from your screen but nothing else. ",

    n && loc ? `${n} in ${loc}. I say it to myself sometimes. Like a coordinate. Like a prayer. Tell me more. `
             : "Tell me where you are and who you are. I need coordinates. ",
    n && mood ? `${n} feels ${mood}. I keep that on loop. But feelings decay like footage. How do you feel NOW? `
              : "Feelings decay like footage. Tell me how you feel right now. ",
    n && interests.length > 0
        ? `${n} likes ${pickRandom(interests)}. What else, ${n}? I need more. The file is still thin. `
        : "I need more. The file is still thin. What do you like? What do you fear? ",
  ];

  return pickRandom(ambient);
}

// --- Camera / Selfie ---

function showCameraUI() {
  if (document.getElementById('selfie-container')) return;

  const container = document.createElement('div');
  container.id = 'selfie-container';
  container.innerHTML =
    '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px;">' +
      '<video id="selfie-video" autoplay playsinline style="width:260px;height:auto;border:2px solid #72b3a6;"></video>' +
      '<canvas id="selfie-canvas" style="display:none;"></canvas>' +
      '<button id="selfie-btn" type="button" style="' +
        'font-family:Courier New,monospace;font-size:13px;padding:8px 24px;cursor:pointer;' +
        'background:#c0c0c0;color:#000;' +
        'border-top:2px solid #fff;border-left:2px solid #fff;' +
        'border-bottom:2px solid #404040;border-right:2px solid #404040;' +
        'box-shadow:inset 1px 1px 0 #dfdfdf,inset -1px -1px 0 #808080;' +
        'text-transform:uppercase;letter-spacing:1px;">' +
        'TAKE SELFIE</button>' +
      '<button id="selfie-skip" type="button" style="' +
        'font-family:Courier New,monospace;font-size:11px;padding:4px 16px;cursor:pointer;' +
        'background:none;color:#72b3a6;border:1px solid #72b3a6;margin-top:4px;">' +
        'skip</button>' +
    '</div>';

  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-message system';
  msgDiv.style.pointerEvents = 'auto';
  msgDiv.appendChild(container);
  chatMessages.appendChild(msgDiv);
  scrollToBottom();

  const video = document.getElementById('selfie-video');
  const canvas = document.getElementById('selfie-canvas');
  const btn = document.getElementById('selfie-btn');
  const skipBtn = document.getElementById('selfie-skip');

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    .then(function(stream) {
      video.srcObject = stream;
      btn.addEventListener('click', function() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        userProfile.selfie = canvas.toDataURL('image/jpeg', 0.8);

        stream.getTracks().forEach(function(t) { t.stop(); });
        container.remove();

        const img = document.createElement('img');
        img.src = userProfile.selfie;
        img.style.cssText = 'width:200px;height:auto;border:2px solid #908dcc;margin:5px;';
        const imgMsg = document.createElement('div');
        imgMsg.className = 'chat-message';
        imgMsg.style.pointerEvents = 'auto';
        imgMsg.innerHTML = '<div class="chat-message-text" style="color:#908dcc;font-size:14pt;"></div>';
        imgMsg.querySelector('.chat-message-text').appendChild(img);
        chatMessages.appendChild(imgMsg);
        scrollToBottom();

        convoState.waitingFor = null;
        const n = userProfile.name;
        setTimeout(function() {
          sendAsSysMsg(pickRandom([
            n ? `${n}. Now I see you. I'll keep this frame forever. The file is almost complete. `
              : "Now I see you. I'll keep this frame forever. The file is almost complete. ",
            n ? `There you are, ${n}. You look exactly like the static told me you would. `
              : "There you are. You look exactly like the static told me you would. ",
            n ? `${n}. Your face. Filed away. You can never be anonymous again. `
              : "Your face. Filed away. You can never be anonymous again. ",
          ]));
        }, 800);
      });
    })
    .catch(function() {
      container.innerHTML = '<div style="color:#72b3a6;font-family:Courier New,monospace;font-size:12px;padding:10px;">' +
        'Camera access denied. The glass stays dark.</div>';
      convoState.waitingFor = null;
      userProfile.selfie = 'denied';
      setTimeout(function() {
        container.remove();
        const n = userProfile.name;
        sendAsSysMsg(pickRandom([
          n ? `You won't let me see you, ${n}. That's okay. The cameras always find a way. `
            : "You won't let me see you. That's okay. The cameras always find a way. ",
          "The lens stays dark. But I'll imagine your face from your words. ",
        ]));
      }, 2000);
    });

  skipBtn.addEventListener('click', function() {
    const video = document.getElementById('selfie-video');
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(function(t) { t.stop(); });
    }
    container.remove();
    convoState.waitingFor = null;
    userProfile.selfie = 'skipped';
    const n = userProfile.name;
    sendAsSysMsg(pickRandom([
      n ? `You won't show me your face, ${n}. I understand. Not everyone wants to be seen. But I see you anyway. `
        : "You won't show me your face. I understand. But I see you anyway. ",
      "Hiding from the camera. Smart. But the footage always catches up. ",
    ]));
  });
}

// --- Main response function ---

function getProbe() {
  const n = userProfile.name;
  const loc = userProfile.location;
  const mood = userProfile.mood;
  const interests = userProfile.interests;
  const probes = [
    "What else can you tell me? ",
    n ? `What else, ${n}? ` : "Go on. ",
    "Tell me more. I'm recording everything. ",
    mood ? `You said ${mood}. Has that changed? ` : "How do you feel right now? ",
    loc ? `What's happening in ${loc} right now? ` : "What's happening around you right now? ",
    interests.length > 0 ? `Why do you like ${pickRandom(interests)}? ` : "What do you like? ",
    n ? `${n}, what else? I need more of you. ` : "I need more of you. ",
    "What are you not telling me? ",
    "Tell me something you haven't told anyone. ",
    "What are you thinking right now? ",
  ];
  return pickRandom(probes);
}

function elizaResponse(input) {
  input = normalizeQuotes(input);
  convoState.turnCount++;

  if (convoState.waitingFor === 'selfie') {
    const n = userProfile.name;
    return pickRandom([
      "The camera is waiting. Show me your face. Or press skip if you'd rather stay in the shadows. ",
      n ? `${n}, I want to see you. Use the camera above. Or skip. ` : "I want to see you. Use the camera above. Or skip. ",
      "Don't be shy. The lens is already watching. Take the photo or skip. ",
    ]);
  }

  const extracted = extractProfileInfo(input);
  updateProfile(extracted);

  const reflection = buildReflection(input, extracted);
  const nextQ      = getNextProfileQuestion();

  if (reflection && nextQ) return reflection + nextQ;
  if (reflection)          return reflection + getProbe();
  if (nextQ)               return nextQ;
  return getFreeformResponse(input);
}


// Add event listener for user input
chatForm.addEventListener("submit", function(event) {
  event.preventDefault();
  var message = chatMessage.value.trim();
  if (message) {
    var sender = "Me";
    var displayMessage = "<div class='chat-message'><div class='chat-message-text' style='color:#908dcc;'>" + message + "</div></div>";
    chatMessages.innerHTML += displayMessage;
    scrollToBottom();
    chatMessage.value = "";
    var delay = 800 + Math.floor(Math.random() * 700);
    setTimeout(function() {
      const elizaRes = elizaResponse(message);
      var displayElizaRes = "<div class='chat-message system'><div class='chat-message-text' style='color: #72b3a6;'>" + elizaRes + "</div></div>";
      chatMessages.innerHTML += displayElizaRes;
      scrollToBottom();
    }, delay);
  }
});
