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

function handleImageSwap() {
  var oldSrc = this.getAttribute('src');
  var newSrc = pickRandomImage();
  activeImages.delete(oldSrc);
  activeImages.add(newSrc);
  this.setAttribute('src', newSrc);
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
