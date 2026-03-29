const images = document.getElementsByClassName('image');

const imgPool = [];
const pngOverrides = new Set([70,80,81,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98]);
for (let i = 0; i <= 98; i++) {
  if (i === 82) continue;
  const num = i.toString().padStart(2, '0');
  const ext = pngOverrides.has(i) ? '.png' : '.jpg';
  imgPool.push('img/main/img' + num + ext);
}

const preferred = new Set();
for (let i = 65; i <= 98; i++) preferred.add(i);

const activeImages = new Set();
for (var k = 0; k < images.length; k++) {
  activeImages.add(images[k].getAttribute('src'));
}

function pickRandomImage() {
  var usePreferred = Math.random() < 0.7;
  var pool = usePreferred
    ? imgPool.filter(function(p) {
        var num = parseInt(p.match(/img(\d+)/)[1], 10);
        return preferred.has(num) && !activeImages.has(p);
      })
    : imgPool.filter(function(p) { return !activeImages.has(p); });
  if (pool.length === 0) {
    pool = imgPool.filter(function(p) { return !activeImages.has(p); });
  }
  if (pool.length === 0) pool = imgPool;
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomizePosition(el) {
  var x = Math.floor(Math.random() * 110) - 15;
  var y = Math.floor(Math.random() * 100) - 10;
  var z = Math.floor(Math.random() * 20) + 1;
  el.style.transform = 'translate(' + x + 'vw, ' + y + 'vh)';
  el.style.zIndex = z;
}

function handleImageSwap() {
  var oldSrc = this.getAttribute('src');
  var newSrc = pickRandomImage();
  activeImages.delete(oldSrc);
  activeImages.add(newSrc);
  this.setAttribute('src', newSrc);
  randomizePosition(this);
}

for (var i = 0; i < images.length; i++) {
  images[i].addEventListener('mouseover', handleImageSwap);
  images[i].addEventListener('touchstart', handleImageSwap);
}

const gif = document.getElementsByClassName("gifimage")[0];
const overlay = document.getElementsByClassName("overlay")[0];
const p = document.getElementById("overlay_p");

const p_content = ["唔好", "Go back to safety", "回頭是安", "Do Not Enter", "千祈唔好", "Please", "唔好入去", "求吓你", "I'm begging you", "仲可以返轉頭", "快啲走", "趁佢未發現你", "Before they see you", "hurry", "leave now", "唔好撳入去"]
                   
const p_colors = ["#bbd9fa", "#7d3e7c", "#5a569c", "#647571", "#a7d1b2", "#4f354c", "#a5d9a9", "#293752"]
                   
function handleGifOver() {
    var rand = Math.floor(Math.random() * p_content.length);
    p.textContent = p_content[rand];
    
    rand = Math.floor(Math.random() * p_colors.length);
    p.style.color = p_colors[rand];
    
    var rand_w = Math.floor(Math.random() * 70);
    var rand_h = Math.floor(Math.random() * 60);
    p.style.transform = 'translate(' + rand_w + 'vw, ' + rand_h + 'vh)';

    overlay.style.display = "flex";
}
function handleGifOut() {
    overlay.style.display = "none";
}

gif.addEventListener("mouseover", handleGifOver);
gif.addEventListener("touchstart", handleGifOver);
gif.addEventListener("mouseout", handleGifOut);
gif.addEventListener("touchend", handleGifOut);

// --- Gyroscope marble (mobile only) ---

if ('ontouchstart' in window) {
  var marble = document.createElement('div');
  marble.style.cssText = 'position:fixed;width:30px;height:30px;border-radius:50%;' +
    'background:radial-gradient(circle at 40% 35%, rgba(255,255,255,0.9), rgba(180,160,255,0.6), rgba(100,80,200,0.3));' +
    'box-shadow:0 0 12px 4px rgba(160,140,255,0.5);pointer-events:none;z-index:99999;' +
    'top:0;left:0;will-change:transform;';
  document.body.appendChild(marble);

  var mx = window.innerWidth / 2;
  var my = window.innerHeight / 2;
  var vx = 0;
  var vy = 0;
  var friction = 0.92;
  var sensitivity = 0.4;
  var gyroActive = false;
  var lastTriggered = new Map();
  var DEBOUNCE_MS = 500;

  function onOrientation(e) {
    if (e.gamma === null || e.beta === null) return;
    gyroActive = true;
    vx += e.gamma * sensitivity;
    vy += (e.beta - 30) * sensitivity;
  }

  function startGyro() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(function(state) {
        if (state === 'granted') {
          window.addEventListener('deviceorientation', onOrientation);
        }
      }).catch(function() {});
    } else {
      window.addEventListener('deviceorientation', onOrientation);
    }
  }

  document.addEventListener('touchstart', function initGyro() {
    startGyro();
    document.removeEventListener('touchstart', initGyro);
  }, { once: true });

  function marbleTick() {
    vx *= friction;
    vy *= friction;
    mx += vx;
    my += vy;

    var w = window.innerWidth;
    var h = window.innerHeight;
    if (mx < 0)  { mx = 0;  vx = Math.abs(vx) * 0.5; }
    if (mx > w)  { mx = w;  vx = -Math.abs(vx) * 0.5; }
    if (my < 0)  { my = 0;  vy = Math.abs(vy) * 0.5; }
    if (my > h)  { my = h;  vy = -Math.abs(vy) * 0.5; }

    marble.style.transform = 'translate(' + (mx - 15) + 'px, ' + (my - 15) + 'px)';

    if (gyroActive) {
      marble.style.display = 'block';
      var hit = document.elementFromPoint(mx, my);
      if (hit && hit.classList && hit.classList.contains('image')) {
        var now = Date.now();
        var last = lastTriggered.get(hit) || 0;
        if (now - last > DEBOUNCE_MS) {
          lastTriggered.set(hit, now);
          handleImageSwap.call(hit);
        }
      }
    }

    requestAnimationFrame(marbleTick);
  }

  requestAnimationFrame(marbleTick);
}
