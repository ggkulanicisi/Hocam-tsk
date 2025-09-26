const introScreen = document.getElementById('intro-screen');
const mainStage = document.getElementById('main-stage');
const envelopeWrap = document.getElementById('envelopeWrap');
const envelope = document.getElementById('envelope');
const shadow = document.getElementById('shadow');
const flap = document.getElementById('flap');
const cardInner = document.getElementById('cardInner');
const bigMsg = document.getElementById('bigMsg');
const confetti = document.getElementById('confetti');
const ctx = confetti.getContext('2d');
const music = document.getElementById('music');

let opened = false;

// --- INTRO YÖNETİMİ ---
function hideIntro() {
    introScreen.classList.add('hidden');
    mainStage.classList.add('visible');
}

// 3.5 saniye sonra introyu gizle (CSS geçişiyle birlikte)
setTimeout(hideIntro, 3500);

// --- YENİ FONKSİYON: DIŞARIDAN METİNİ ÇEKME ---
async function loadMessage() {
    try {
        // message.html dosyasını asenkron olarak oku (Bu, mektup metnini tuttuğunuz dosya olmalıdır)
        const response = await fetch('message.html');
        if (!response.ok) {
            throw new Error(`HTTP Hata kodu: ${response.status}`);
        }
        const text = await response.text();
        
        // Okunan metni bigMsg elementine yerleştir (Yeni satırları <br> ile değiştir)
        bigMsg.innerHTML = text.replace(/\n/g, '<br>'); 
    } catch (error) {
        console.error("Mesaj yüklenirken hata oluştu:", error);
        bigMsg.textContent = "Mesaj yüklenemedi. Lütfen 'message.html' dosyasını kontrol edin ve sunucuda çalıştığınızdan emin olun.";
    }
}

// --- ZARF VE KONFETİ İŞLEMLERİ ---
let parts = [];
function launchConfetti(){
    parts = [];
    const colors = ['#ffd166','#06d6a0','#118ab2','#ef476f','#8338ec'];
    const rect = envelope.getBoundingClientRect();
    
    confetti.style.left = rect.left + 'px';
    confetti.style.top = rect.top + 'px';
    confetti.width = rect.width * devicePixelRatio;
    confetti.height = rect.height * devicePixelRatio;

    for(let i=0;i<120;i++){
        parts.push({
            x: confetti.width/2 + (Math.random()-0.5)*200,
            y: 120 + (Math.random()-0.5)*60,
            vx: (Math.random()-0.5)*6,
            vy: (-6 - Math.random()*6),
            r: 6+Math.random()*8,
            col: colors[Math.floor(Math.random()*colors.length)],
            rot: Math.random()*Math.PI
        });
    }
    requestAnimationFrame(confLoop);
}

function confLoop(){
    ctx.clearRect(0,0,confetti.width,confetti.height);
    for(const p of parts){
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.rot += 0.08;
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.col;
        ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6);
        ctx.restore();
    }
    parts = parts.filter(p=>p.y < confetti.height + 40);
    if(parts.length) requestAnimationFrame(confLoop);
}

// --- openEnvelope() Fonksiyonu (Mesaj yükleme eklendi) ---
async function openEnvelope(){
  if(opened) return;
  opened = true;
  
  // 1. Mesajı yüklemeden önce bekle
  await loadMessage();

  // 2. Zarfı aç
  envelope.classList.add('open');

  // 3. Büyük mesajı göster
  setTimeout(() => {
      bigMsg.classList.add('show-message');
  }, 50);

  launchConfetti();

  // ZARFIN KAYBOLMASI
  setTimeout(() => {
      envelope.classList.add('fade-out');
      shadow.classList.add('fade-out');
  }, 2000); 

  // Müzik varsa çal
  try{ if(music.src) music.play().catch(()=>{}); }catch(e){}

  // Fare imleci animasyonunu kaldır
  envelope.removeEventListener('mousemove', handleMouseMove);
  envelope.removeEventListener('mouseleave', handleMouseLeave);
}

// Fare hareket olayları 
const handleMouseMove = (e) => {
  if(opened) return;
  const r = envelope.getBoundingClientRect();
  const mx = (e.clientX - r.left) / r.width - 0.5;
  flap.style.transform = `translateY(0px) rotateX(${mx*6}deg)`;
};

const handleMouseLeave = () => {
  if(!opened) flap.style.transform='rotateX(0deg)';
};

// Olay dinleyicilerini DOM yüklendiğinde ekle 
document.addEventListener('DOMContentLoaded', () => {
    envelope.addEventListener('click', openEnvelope);
    envelope.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') openEnvelope(); });
    envelope.addEventListener('mousemove', handleMouseMove);
    envelope.addEventListener('mouseleave', handleMouseLeave);
    
    if (envelope) {
        const rect = envelope.getBoundingClientRect();
        confetti.style.left = rect.left + 'px';
        confetti.style.top = rect.top + 'px';
    }
});
