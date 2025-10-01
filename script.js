/* ===== Dados ===== */
const animais = [
    {nome: "Gato", img: "imagens/gato.png"},
    {nome: "Vaca", img: "imagens/vaca.png"},
    {nome: "Cavalo", img: "imagens/cavalo.png"},
    {nome: "Pato", img: "imagens/pato.png"},
    {nome: "Coelho", img: "imagens/coelho.png"},
    {nome: "Elefante", img: "imagens/elefante.png"},
    {nome: "Leão", img: "imagens/leao.png"},
    {nome: "Macaco", img: "imagens/macaco.png"},
    {nome: "Urso", img: "imagens/urso.png"},
    {nome: "Cachorro", img: "imagens/cachorro.png"},
    {nome: "Zebra", img: "imagens/zebra.png"},
    {nome: "Girafa", img: "imagens/girafa.png"},
    {nome: "Porco", img: "imagens/porco.png"},
    {nome: "Galinha", img: "imagens/galinha.png"},
    {nome: "Jacaré", img: "imagens/jacare.png"},
    {nome: "Tigre", img: "imagens/tigre.png"},
    {nome: "Raposa", img: "imagens/raposa.png"},
    {nome: "Pinguim", img: "imagens/pinguim.png"},
    {nome: "Peixe", img: "imagens/peixe.png"},
    {nome: "Cobra", img: "imagens/cobra.png"},
];

/* ===== Sílabas ===== */
function dividirEmSilabas(palavra){
    palavra = palavra.toUpperCase();
    const silabasMap = {
        "CACHORRO": ["CA","CHOR","RO"],
        "GATO": ["GA","TO"],
        "VACA": ["VA","CA"],
        "CAVALO": ["CA","VA","LO"],
        "PATO": ["PA","TO"],
        "COELHO": ["CO","E","LHO"],
        "ELEFANTE": ["E","LE","FAN","TE"],
        "LEÃO": ["LE","ÃO"],
        "MACACO": ["MA","CA","CO"],
        "URSO": ["UR","SO"],
        "ZEBRA": ["ZE","BRA"],
        "GIRAFA": ["GI","RA","FA"],
        "PORCO": ["POR","CO"],
        "GALINHA": ["GA","LI","NHA"],
        "JACARÉ": ["JA","CA","RÉ"],
        "TIGRE": ["TI","GRE"],
        "RAPOSA": ["RA","PO","SA"],
        "PINGUIM": ["PIN","GUIM"],
        "PEIXE": ["PEI","XE"],
        "COBRA": ["CO","BRA"]
    };
    return silabasMap[palavra] || palavra.split('');
}

const silabas = animais.map(a=>{
    const palavra = a.nome.toUpperCase();
    let texto = dividirEmSilabas(palavra).join(' - ');
    return {texto, img: a.img, palavra: a.nome};
});

/* ===== Variáveis ===== */
let indexAnimal = 0;
let indexSilaba = 0;
let cameraStream = null;
let recognition = null;
let speechTimeout = null;

/* ===== Utilitários ===== */
function normalizeText(s){ 
    if(!s) return ""; 
    s = s.toLowerCase().trim(); 
    s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); 
    s = s.replace(/[^a-z0-9]/g, ''); 
    return s; 
}

function levenshtein(a, b) {
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const matrix = [];
    for (let i=0; i<=b.length; i++) matrix[i]=[i];
    for (let j=0; j<=a.length; j++) matrix[0][j]=j;
    for (let i=1;i<=b.length;i++){
        for (let j=1;j<=a.length;j++){
            matrix[i][j] = b[i-1]===a[j-1]?matrix[i-1][j-1]:Math.min(
                matrix[i-1][j]+1,
                matrix[i][j-1]+1,
                matrix[i-1][j-1]+1
            );
        }
    }
    return matrix[b.length][a.length];
}

function similarity(a,b){ return 1 - (levenshtein(a,b)/Math.max(a.length,b.length)); }

/* ===== Fala ===== */
function falar(texto, rate=0.9, callback=null){
    if(!window.speechSynthesis) return;
    const msg = new SpeechSynthesisUtterance(texto);
    msg.lang="pt-BR";
    msg.rate=rate;
    msg.onend = ()=>{ if(callback) callback(); }
    window.speechSynthesis.speak(msg);
}

/* ===== Som de acerto ===== */
const plim = new Audio('sons/plim.mp3');

/* ===== Confete ===== */
function confete(){
    for(let i=0;i<30;i++){
        const div=document.createElement('div');
        div.className='confete';
        div.style.left=Math.random()*100+'vw';
        div.style.background=`hsl(${Math.random()*360},70%,60%)`;
        div.style.width = div.style.height = (Math.random()*10+5)+'px';
        document.body.appendChild(div);
        setTimeout(()=>div.remove(),2500);
    }
}

/* ===== Feedback ===== */
function showFeedback(element, ok, texto){
    element.classList.remove('hidden','success','fail');
    element.classList.add(ok?'success':'fail');
    element.innerText=(ok?"✅ Muito bem!":"⚡ Tente de novo!") + (texto? ` (${texto})`:"");
    element.classList.remove('hidden');

    // Esconde rápido
    setTimeout(()=>element.classList.add('hidden'), 700);

    // Som, confete e fala rápida
    if(ok){ 
        plim.play();
        confete(); 
        falar("Muito bem!", 1.8); 
    } else {
        falar("Tente de novo!", 1.8);
    }
}

/* ===== Bolhas aleatórias ===== */
function criarBolhas(){
    const oldBubbles = document.querySelectorAll('.bubbles');
    oldBubbles.forEach(b => b.remove());
    const bubbleContainer = document.createElement('div');
    bubbleContainer.className = 'bubbles';
    document.body.appendChild(bubbleContainer);
    for(let i=0;i<20;i++){
        const b=document.createElement('span');
        b.style.left = `${Math.random()*100}%`;
        const size = Math.random()*20+10;
        b.style.width = b.style.height = `${size}px`;
        b.style.animationDuration = `${Math.random()*12+8}s`;
        b.style.background = `hsl(${Math.random()*360},70%,70%)`;
        b.style.animationDelay = `${Math.random()*5}s`;
        bubbleContainer.appendChild(b);
    }
}

/* ===== Reconhecimento de voz ===== */
function iniciarReconhecimento(callback){
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognition) return;
    recognition = new SpeechRecognition();
    recognition.lang='pt-BR';
    recognition.interimResults=false;
    recognition.maxAlternatives=1;
    recognition.continuous=true;

    recognition.onresult=(ev)=>{
        const text = ev.results[ev.results.length-1][0].transcript;
        if(speechTimeout) clearTimeout(speechTimeout);
        speechTimeout=setTimeout(()=>callback(text),800);
    };

    recognition.onend=()=>{ recognition.start(); };
    recognition.start();
}

/* ===== Câmera ===== */
async function iniciarCamera(){
    const video=document.getElementById('camera');
    if(!video) return;
    if(cameraStream){ video.srcObject=cameraStream; return; }
    try{
        cameraStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"}, audio:false});
        video.srcObject=cameraStream;
    }catch(err){ console.error(err); }
}

/* ===== Animais (Modo Câmera) ===== */
function mostrarAnimal(){
    const img=document.getElementById('animal-img');
    const nome=document.getElementById('animal-nome');
    if(!img||!nome) return;
    const animal=animais[indexAnimal];
    img.src=animal.img;
    nome.innerText=animal.nome;

    setTimeout(()=>falar(animal.nome,0.9),300);

    const progress = Math.round(((indexAnimal+1)/animais.length)*100);
    document.getElementById('progress-text').innerText = `${indexAnimal+1} / ${animais.length}`;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function iniciarAnimaisPage(){
    criarBolhas();
    mostrarAnimal();
    document.getElementById('btn-repeat').onclick = ()=>falar(animais[indexAnimal].nome);
    document.getElementById('btn-skip').onclick = ()=>{
        indexAnimal++;
        if(indexAnimal >= animais.length){
            window.location.href = "parabens.html";
            return;
        }
        mostrarAnimal();
    };
    document.getElementById('btn-back-animal').onclick = ()=>{ if(indexAnimal>0){ indexAnimal--; mostrarAnimal(); } };
    document.getElementById('btn-back-menu').onclick = ()=> window.location.href='menu.html';

    iniciarReconhecimento(text=>{
        if(similarity(normalizeText(text), normalizeText(animais[indexAnimal].nome))>0.8){
            showFeedback(document.getElementById('feedback'), true);
            indexAnimal++;
            if(indexAnimal>=animais.length){
                window.location.href='parabens.html';
            }else{
                mostrarAnimal();
            }
        }else{
            showFeedback(document.getElementById('feedback'), false, text);
        }
    });
}

/* ===== Sílabas (Modo Sílabas) ===== */
function mostrarSilaba(){
    const img = document.getElementById('silaba-img');
    const txt = document.getElementById('silaba-texto');
    if(!img||!txt) return;
    const s = silabas[indexSilaba];
    img.src = s.img;
    txt.innerText = s.texto;

    const progress = Math.round(((indexSilaba+1)/silabas.length)*100);
    document.getElementById('progress-text-s').innerText = `${indexSilaba+1} / ${silabas.length}`;
    document.getElementById('progress-bar-s').style.width = `${progress}%`;

    falar(s.palavra);
}

function iniciarSilabasPage(){
    criarBolhas();
    mostrarSilaba();
    document.getElementById('btn-repeat-silaba').onclick = ()=>falar(silabas[indexSilaba].palavra);
    document.getElementById('btn-next-silaba').onclick = ()=>{
        indexSilaba++;
        if(indexSilaba >= silabas.length){
            window.location.href = "parabens.html";
            return;
        }
        mostrarSilaba();
    };
    document.getElementById('btn-back-silaba').onclick = ()=>{ if(indexSilaba>0){ indexSilaba--; mostrarSilaba(); } };
    document.getElementById('btn-back-menu-s').onclick = ()=> window.location.href='menu.html';

    iniciarReconhecimento(text=>{
        if(similarity(normalizeText(text), normalizeText(silabas[indexSilaba].palavra))>0.8){
            showFeedback(document.getElementById('feedback-s'), true);
            indexSilaba++;
            if(indexSilaba>=silabas.length){
                window.location.href='parabens.html';
            }else{
                mostrarSilaba();
            }
        }else{
            showFeedback(document.getElementById('feedback-s'), false, text);
        }
    });
}

/* ===== Inicialização automática ===== */
window.addEventListener("load", ()=>{
    criarBolhas();

    if(document.getElementById('camera')){
        iniciarCamera().then(()=>iniciarAnimaisPage());
    }

    if(document.getElementById('silaba-img')){
        iniciarSilabasPage();
    }
});
