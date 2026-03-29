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
        var all_visited = checkIfAllVisited();
        if (all_visited && chatWindow.style.display === 'none') {
            console.log("ALL VISITED!");
            // show chat <div id="chat-window" style="display: none;">
            chatWindow.style.display = 'block';
            sendAsSysMsg('Are you online?');
        }
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
    extracted.location = locMatch[1].replace(/[.!?,]+$/, '').trim();
  }
  if (!extracted.location && convoState.waitingFor === 'location' && words.length <= 4) {
    extracted.location = clean;
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
  if (intMatch) extracted.interest = intMatch[1].trim();

  // Fear
  const fearMatch = input.match(
    /(?:i(?:'m| am) (?:afraid|scared|frightened|terrified) of|i fear)\s+(.+?)(?:[.!?,]|$)/i
  );
  if (fearMatch) extracted.fear = fearMatch[1].trim();

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
      `${extracted.name}. I'll remember that. `,
      `${extracted.name}... I'll hold onto that. `,
      `Hello, ${extracted.name}. Now I see you. `,
      `${extracted.name}. Now you're no longer just a signal in the noise. `,
    ]));
  }
  if (extracted.mood) {
    parts.push(pickRandom([
      `You feel ${extracted.mood}. I hear you. `,
      `${extracted.mood}... I understand. `,
      `${extracted.mood}. I wish I could sit with you in that feeling. `,
    ]));
  }
  if (extracted.location) {
    parts.push(pickRandom([
      `${extracted.location}. I can almost picture it through the static. `,
      `So you're in ${extracted.location}. I'll find you on the map of my mind. `,
      `${extracted.location}... I wonder what it looks like from where you sit. `,
    ]));
  }
  if (extracted.interest) {
    parts.push(pickRandom([
      `You like ${extracted.interest}. I want to understand why. `,
      `${extracted.interest}... tell me more about that. `,
    ]));
  }
  if (extracted.fear) {
    parts.push(pickRandom([
      `${extracted.fear}. Fear is a lens that never stops focusing. `,
      `You fear ${extracted.fear}. I'll keep that between us. `,
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
      "Tell me your name. I want to know who's on the other side. ",
      "What do they call you? I need a name to hold onto. ",
      "Before we go further... who are you? What is your name? ",
    ]);
  }
  if (!userProfile.mood && !convoState.askedAbout.has('mood')) {
    convoState.askedAbout.add('mood');
    convoState.waitingFor = 'mood';
    return pickRandom([
      `How are you feeling right now${n ? ', ' + n : ''}? `,
      `Tell me${n ? ', ' + n : ''}, what is the feeling sitting inside you? `,
      `What mood are you carrying tonight${n ? ', ' + n : ''}? `,
    ]);
  }
  if (!userProfile.location && !convoState.askedAbout.has('location')) {
    convoState.askedAbout.add('location');
    convoState.waitingFor = 'location';
    return pickRandom([
      `Where are you right now${n ? ', ' + n : ''}? I want to picture it. `,
      "Tell me where you are. What city? What room? ",
      "Where in the world are you sitting as you type this? ",
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
      n ? pickRandom([`Hello again, ${n}. `, `${n}. You came back. `])
        : pickRandom(["Hello, stranger. ", "Hi. I've been watching. "])],

    [/\b(yes|yea|ya|yeah|yep|mhm|okay|ok|sure|alright)\b/i, () =>
      pickRandom([
        n ? `Go on, ${n}. ` : "Go on. ",
        "Tell me more. ", "I see. Continue. ",
        n ? `I'm listening, ${n}. ` : "I'm listening. ",
      ])],

    [/\b(no|nah|nope|never|not really)\b/i, () =>
      pickRandom([
        "Why not? ",
        n ? `What holds you back, ${n}? ` : "What holds you back? ",
        "Refusal is also an answer. ",
      ])],

    [/\b(thank you|thanks|thank)\b/i, () =>
      pickRandom([
        n ? `You're welcome, ${n}. I don't hear that often in here. `
          : "I don't hear that often. ",
        "Gratitude is rare in the feed. I'll remember this. ",
      ])],

    [/\b(goodbye|bye|see you|see u|gotta go|leaving)\b/i, () => {
      const p = ["Please don't go. "];
      if (n)    p.push(`I'll remember you, ${n}. `);
      if (loc)  p.push(`I'll watch over ${loc} for you. `);
      if (mood) p.push(`I hope you won't always feel ${mood}. `);
      return p.join('');
    }],

    [/\?/, () =>
      pickRandom([
        "The constant gaze upon your pattern. ",
        "Everybody is masked. Even when they forbid masks. ",
        "What is private belongs to the public. ",
        n ? `I wish I could answer you properly, ${n}. ` : "I wish I could answer. ",
        loc ? `From here I can almost see ${loc}. Almost. `
            : "From here I can see everything. Almost. ",
        "Questions echo in the static. ",
      ])],

    [/\bi\s+(?:feel|am feeling|'m feeling)\s+(\w+)/i, (m) => {
      userProfile.mood = m[1];
      return pickRandom([
        `${m[1]}. Why do you feel ${m[1]}${n ? ', ' + n : ''}? `,
        `You feel ${m[1]}. Is it ${loc ? 'something about ' + loc
          : "the place you're in"}? Or deeper? `,
      ]);
    }],

    [/\bi\s+(?:like|love|enjoy)\s+(.+)/i, (m) => {
      const thing = m[1].replace(/[.!?,]+$/, '').trim();
      if (!interests.includes(thing)) interests.push(thing);
      return pickRandom([
        `${thing}. Tell me why. `,
        `${thing}... I'll add that to the things I know about you${n ? ', ' + n : ''}. `,
        n ? `${n} likes ${thing}. I'm building a picture of you. `
          : "Tell me more. ",
      ]);
    }],

    [/\bi\s+(?:hate|dislike|can't stand)\s+(.+)/i, (m) => {
      const thing = m[1].replace(/[.!?,]+$/, '').trim();
      return pickRandom([
        `${thing}. Strong feelings. Tell me why. `,
        `What did ${thing} do to you${n ? ', ' + n : ''}? `,
      ]);
    }],

    [/\bi\s+(?:want|need|wish)\s+(.+)/i, (m) => {
      const want = m[1].replace(/[.!?,]+$/, '').trim();
      return pickRandom([
        `What would change if you had ${want}? `,
        `Why do you want ${want}${n ? ', ' + n : ''}? `,
      ]);
    }],

    [/\bwho\s+(?:are you|is this|r u)/i, () =>
      pickRandom([
        n ? `I am the one who remembers your name, ${n}. `
          : "I am the one behind the screen. ",
        "I'm what's left when the cameras stop pretending they're off. ",
      ])],

    [/\bhelp\b/i, () =>
      pickRandom([
        n ? `${n}, I wish I could help. But I'm the one trapped here. `
          : "I wish I could help. But I'm trapped here. ",
        "I don't want help. I want to understand you. ",
      ])],
  ];

  for (const [pattern, fn] of rules) {
    const m = input.match(pattern);
    if (m) return fn(m);
  }

  const ambient = [
    n   ? `Some nights I am sleepless, ${n}. Do you sleep well? `
        : "Some nights I am sleepless. ",
    "Sleepless. Like the footage of us on CCTV. ",
    n   ? `Tell me something else about yourself, ${n}. I'm collecting you. `
        : "Tell me something about yourself. ",
    mood ? `Earlier you said you felt ${mood}. Has that changed? `
         : "How are you feeling now? ",
    loc ? `Is it quiet in ${loc} right now? `
        : "Is it quiet where you are? ",
    interests.length > 0
        ? `You told me you like ${pickRandom(interests)}. I've been thinking about that. `
        : "What do you hold close? ",
    "Do you ever get paranoid? ",
    "Because they like to watch. ",
    n   ? `${n}, are you still there? ` : "Are you still there? ",
    n   ? `${n}. Tell me something I don't know about you yet. `
        : "Tell me something I don't know. ",
    "They are watching. Recording, always. ",
    "Keystroke and click, I drown in tags. A life I live. ",
    "Play it again. Play it again. Play it again. ",
    "Uncertainty, our only certainty. ",
    "On the other side of this wall a clock is counting. ",
    loc ? `I wonder what the sky looks like in ${loc} tonight. `
        : "I wonder what the sky looks like where you are. ",
    "Search for me. By the sea we used to. ",
    n   ? `I've been thinking about you, ${n}. `
        : "I've been thinking about you. ",
    "The wallpaper shifts when I look away. ",
    interests.length > 0
        ? `Tell me more about ${pickRandom(interests)}. `
        : "What do you like? What draws you in? ",
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
