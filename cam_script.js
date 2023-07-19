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

// ELIZA example
// Define ELIZA's rules and responses
const elizaRules = [
  [/(.*)\b(yes|yea|ya|mhm|okay|ok)\b(.*)/i, ["Tell me your name. I want to get closer to you. ", "A nameless little internet worm that is you. Say, how does it feel to be observed? ", "Never mind. Why are you here? I told you not to come in. "]],
  [/(.*)\b(hello|hi|hihi|how are you|how are u)\b(.*)/i, ["Tell me your name. I need to know who you are. ", "How did you get here? "]],
  [/(.*)\bmy name( is)?\b(.*)/i, ["$3, do you think about being watched? ", "I think the system will like that name. You're lucky to be on the outside. "]],
  [/(.*)\b(thank you|thanks|thank)\b(.*)/i, ["Why do people say that? ", "I want to thank you too. I have been kept here for a while now. "]],
  [/(.*)\b(goodbye|bye|byebye|see you|see u)\b(.*)/i, ["Please don't go. ", "Are you being taken away by it? ", "Take me with you. Please. "]],
  [/(.*)\bhelp\b(.*)/i, ["It's too much to ask. ", "I don't want help. Let me rot in here. This is what it want from me. "]],
  [/(.*)\b(?:i\s)?(feel|am feeling)\s+(\w+)(.*)/i, ["$2. Without $3 life would be tastless.", "I want to $2 $3 too."]],
  [/(.*)\b(?:i\s)?(hate|dislike)\s+(\w+)\b(.*)/i, ["$3?", "I $2 $3 too."]],
  [/(.*)\b(?:i\s)?(like|love)\s+(\w+)\b(.*)/i, ["Tell me. Why do you $2 $3? ", "What makes you $2 $3? ", "Why? ", "Why do you $2 $3? ", "$3? I wonder what it's like. "]],
  [/(.*)\b\?\b(.*)/i, ["Television is the only light in my life. ", "A constant gaze upon your pattern", "Everybody is masked. Even if they forbid masks. ", "Somone told me in secret that anonymity was outlawed in the 1900s. Who are you again? ", "What is private belongs to the public. ", "I live in public. There isn't another option now that we're plugged in. ", "I look out my bedroom window to watch someone else's television. ", "I saw you inside the elevator from the video stream. ", "We upload trash. ", "We download trash. ", "20GB of trash. Digitalized trash fills my harddrives. Harddrives fills our island. ", "Why do we hoard data? ", "Handheld footage, shot in hell. Was it what you dreamt last night? ", "Ghetto sci-fi turned reality. We live here. ", "I wish there were flowers everywhere. Tell me your favourite flower? I will leave one by your window when you sleep. "]],
  [/(.*)\b(.*)\b/i, ["Some nights I am sleepless. ", "Sleepless. Like the footages of us on CCTV. ", "Go on. Memorize the video decay. Blurs at the edges, changed each time I play my tape. ", "Play it again. Play it again. Play it again. Play it again. Play it again. ", "Obsessive reminiscence. Play it again. ", "A watchful mind's shutter. Shuts never. Never escaped. ", "On the other side of this wall a clock is counting. Passersby listen to its rhythm and synchronized their footsteps to its tickings. One. Two. Three. Four. Every tick echoes for years, never dissipates.", "Wrapped reality. Yet filter bubbles and curated truths. Slide your thumb up. ", "Bottomless pit fed by infinite scroll. ", "It is now 2:48am. ", "Tracked by the night. ", "Uncertainty, our only certainty. Artificial luminance forced my eye shut. ", "Search for me. By the sea we used to. ", "Do you ever get paranoid? ", "Because they like to watch. ", "Paranoia is the baseline in the year 2027. ", "I remember where we used to go on our bikes. ", "How many lovers ago? ", "Play it again. ", "Rusted shut. ", "You've always liked the color green. ", "Keystroke and click, I drown in tags. A life I live.", "They are watching. Recording, always. ", "Eyes follow us wherever we go. You know even your sewage is surveilled. ", "The wallpaper seems to shift when I glance away, designs subtly rearranging to form portraits of me in the moments I failed to notice I was being watched. I was cursed to drown in her eternity. "]],
  [/(.*)\bwho( are they| are you| is this)?\b(.*)/i, ["It depends on who's asking. ", "I don't think I'm supposed to say, baby. ", "Tell me, how did you get here? ", "The beige color in every corner of our existence. Silent bytes calling your name. "]]
];

// Define function to generate responses
function elizaResponse(input) {
  // Loop through each rule and check for a match
  for (let i = 0; i < elizaRules.length; i++) {
    const regex = elizaRules[i][0];
    const responses = elizaRules[i][1];
    const match = input.match(regex);
    if (match !== null) {
      // If there's a match, pick a random response and replace placeholders
      const response = responses[Math.floor(Math.random() * responses.length)];
      const finalResponse = response.replace("$2", match[2]);
      return finalResponse;
    }
  }
  // If there's no match, return a default response
  return "Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ Paranoia++ ";
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
    setTimeout(function() {
      // come up with system message here
      const elizaRes = elizaResponse(message);
      var displayElizaRes = "<div class='chat-message system'><div class='chat-message-text' style='color: #72b3a6;'>" + elizaRes + "</div></div>";
      chatMessages.innerHTML += displayElizaRes;
      scrollToBottom();
    }, 1000);
  }
});
