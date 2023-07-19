const images = document.getElementsByClassName('image');

for (var i = 0; i < images.length; i++) {
	images[i].addEventListener('mouseover', function() {
        var rand = Math.floor(Math.random() * 80);
        var paddednum = rand.toString().padStart(2, '0');
		this.setAttribute('src', 'img/main/img'+paddednum+'.jpg');
        console.log(paddednum)
        console.log('img' + paddednum + '.jpg')
	});
}

const gif = document.getElementsByClassName("gifimage")[0];
const overlay = document.getElementsByClassName("overlay")[0];
const p = document.getElementById("overlay_p");

const p_content = ["唔好", "Go back to safety", "回頭是安", "Do Not Enter", "千祈唔好", "Please", "唔好入去", "求吓你", "I'm begging you", "仲可以返轉頭", "快啲走", "趁佢未發現你", "Before they see you", "hurry", "leave now", "唔好撳入去"]
                   
const p_colors = ["#bbd9fa", "#7d3e7c", "#5a569c", "#647571", "#a7d1b2", "#4f354c", "#a5d9a9", "#293752"]
                   
gif.addEventListener("mouseover", () => {
    var rand = Math.floor(Math.random() * p_content.length);
    p.textContent = p_content[rand];
    
    rand = Math.floor(Math.random() * p_colors.length);
    p.style.color = p_colors[rand];
    
    var rand_w = Math.floor(Math.random() * 70);
    var rand_h = Math.floor(Math.random() * 60);
    p.style.transform = 'translate(' + rand_w + 'vw, ' + rand_h + 'vh)';

    overlay.style.display = "flex";
});
gif.addEventListener("mouseout", () => {
    overlay.style.display = "none";
});
