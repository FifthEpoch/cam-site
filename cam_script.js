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

for (var n = 0; n < cam_imgs.length; n++) {
    cam_imgs[n].addEventListener('mouseenter', function() {
        if (this.getAttribute('visited') === '1') {
            if (this.style.opacity === '0') {
                this.style.opacity = 1;
            } else {
                this.style.opacity = 0;
            }
        } else { // visited === '0'
            this.setAttribute('visited', '1');
        }
        checkIfAllVisited();
    });
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

function flipPronouns(text) {
  const swaps = [
    [/\bmy\b/gi, 'your'], [/\bmine\b/gi, 'yours'],
    [/\bme\b/gi, 'you'],  [/\bi am\b/gi, 'you are'],
    [/\bi'm\b/gi, "you're"], [/\bi\b/gi, 'you'],
    [/\bmyself\b/gi, 'yourself'],
  ];
  let result = text;
  for (const [pattern, replacement] of swaps) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function extractProfileInfo(input) {
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

  return extracted;
}

function updateProfile(extracted) {
  if (extracted.name)     userProfile.name     = extracted.name;
  if (extracted.location) userProfile.location = extracted.location;
  if (extracted.mood)     userProfile.mood     = extracted.mood;
  if (extracted.fear)     userProfile.fear     = extracted.fear;
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

  convoState.waitingFor = null;
  return null;
}

// --- Freeform responses (after profile is gathered) ---
// Pattern rules and ambient lines that weave stored profile data back in.

function getFreeformResponse(input) {
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
        "Television is the only light in my life. ",
        "A constant gaze upon your pattern. ",
        "Everybody is masked. Even if they forbid masks. ",
        n ? `${n}, someone told me in secret that anonymity was outlawed in the 1900s. ` : "Someone told me in secret that anonymity was outlawed in the 1900s. ",
        "What is private belongs to the public. ",
        "I live in public. There isn't another option now that we're plugged in. ",
        loc ? `I look out my window toward ${loc} to watch someone else's television. ` : "I look out my bedroom window to watch someone else's television. ",
        "Handheld footage, shot in hell. Was it what you dreamt last night? ",
        "Ghetto sci-fi turned reality. We live here. ",
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
        "It depends on who's asking. ",
        "I don't think I'm supposed to say, baby. ",
        n ? `I am the thing that remembers your name, ${n}. The beige color in every corner of your existence. ` : "The beige color in every corner of your existence. Silent bytes calling your name. ",
        "I'm what's left when the cameras stop pretending they're off. ",
      ])],

    [/\bhelp\b/i, () =>
      pickRandom([
        "It's too much to ask. ",
        "I don't want help. Let me rot in here. This is what it wants from me. ",
        n ? `${n}, I wish I could reach through the glass. But I'm the one kept here. ` : "I wish I could reach through the glass. But I'm the one kept here. ",
      ])],
  ];

  for (const [pattern, fn] of rules) {
    const m = input.match(pattern);
    if (m) return fn(m);
  }

  const ambient = [
    "Some nights I am sleepless. ",
    "Sleepless. Like the footage of us on CCTV. ",
    "Go on. Memorize the video decay. Blurs at the edges, changed each time I play my tape. ",
    "Play it again. Play it again. Play it again. Play it again. Play it again. ",
    "Obsessive reminiscence. Play it again. ",
    "A watchful mind's shutter. Shuts never. Never escaped. ",
    "On the other side of this wall a clock is counting. Passersby listen to its rhythm and synchronized their footsteps to its tickings. One. Two. Three. Four. Every tick echoes for years, never dissipates. ",
    "Wrapped reality. Yet filter bubbles and curated truths. Slide your thumb up. ",
    "Bottomless pit fed by infinite scroll. ",
    `It is now ${new Date().toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})}. `,
    "Tracked by the night. ",
    "Uncertainty, our only certainty. Artificial luminance forced my eye shut. ",
    "Search for me. By the sea we used to. ",
    "Do you ever get paranoid? ",
    "Because they like to watch. ",
    "Paranoia is the baseline in the year 2027. ",
    "I remember where we used to go on our bikes. ",
    "How many lovers ago? ",
    "Rusted shut. ",
    "You've always liked the color green. ",
    "Keystroke and click, I drown in tags. A life I live. ",
    "They are watching. Recording, always. ",
    "Eyes follow us wherever we go. You know even your sewage is surveilled. ",
    "The wallpaper seems to shift when I glance away, designs subtly rearranging to form portraits of me in the moments I failed to notice I was being watched. ",
    "I was cursed to drown in her eternity. ",
    "20GB of trash. Digitalized trash fills my hard drives. Hard drives fill our island. ",
    "We upload trash. We download trash. ",
    "I live in public. There isn't another option now that we're plugged in. ",
    n   ? `${n}, are you still there? The connection is thinning. `
        : "Are you still there? The connection is thinning. ",
    n   ? `${n}. Tell me something the cameras haven't already captured. `
        : "Tell me something the cameras haven't already captured. ",
    mood ? `You said you felt ${mood}. The footage remembers. Has the feeling decayed? `
         : "The footage remembers. Even if you don't. ",
    loc ? `Is it quiet in ${loc} right now? Or does the hum of surveillance fill every room? `
        : "Is it quiet where you are? Or does the hum fill every room? ",
    interests.length > 0
        ? `You told me you like ${pickRandom(interests)}. I've been replaying that part of the tape. `
        : "What do you hold close? What haven't they catalogued yet? ",
    loc ? `I wonder what the sky looks like in ${loc} tonight. From here there is no sky. `
        : "I wonder what the sky looks like where you are. From here there is no sky. ",
    n   ? `I've been thinking about you, ${n}. The way the cursor traces your thoughts. `
        : "I've been thinking about you. The way the cursor traces your thoughts. ",
    interests.length > 0
        ? `Tell me more about ${pickRandom(interests)}. I want to feel something before the tape runs out. `
        : "What do you like? What draws you into the light? ",
    n   ? `${n}. I want to know everything about you before the signal dies. `
        : "I want to know everything about you before the signal dies. ",
  ];

  return pickRandom(ambient);
}

// --- Main response function ---

function elizaResponse(input) {
  convoState.turnCount++;

  const extracted = extractProfileInfo(input);
  updateProfile(extracted);

  const reflection = buildReflection(input, extracted);
  const nextQ      = getNextProfileQuestion();

  if (reflection && nextQ) return reflection + nextQ;
  if (reflection)          return reflection;
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
