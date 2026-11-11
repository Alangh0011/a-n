/* =========================================================
   PERSONALIZA AQUÍ:
   1) PALABRAS  -> las de sus poemas / lo que quieras.
   2) FOTO_URL  -> sube la foto de ella con ese nombre junto al index.html.
   3) VIDEO_ID  -> el ID de YouTube de la canción (lo que va después de "v=").
                   Ahora está "Luna (MTV Unplugged)" de Zoé.
   ========================================================= */
const PALABRAS = [
  "Mi luna", "Mi mundo", "Mi universo", "Frijolito", "Mi preciosa",
  "Para siempre", "Tú y yo", "Vía Láctea", "Soñé", "Nuestra canción",
  "Mi Arrullo de estrellas", "Ves", "Mi dios plan", "Gruñón", "Tu que pedirás",
  "Corazón atómico", "Pedire al sol que te alumbre cuando no este yo", "Vámonos a marte", "Mi felicidad", "Mi momento favorito", "Mi amor", "Mi vida", "Mi todo", "Mi cielo",
  "Danna <3", "Te quiero mucho", "Jamassss", "", "Me gustas mucho", "Si supieras",
  "Quien pudiera?", "Mi chachachá jajaj", "Fuentes de ortiz", "Tu sonrisa <3", "Tu forma de sonreir", "La niña más linda del mundo", "Yo puedo cuidarte", "Tu <3", "Tus chongos <3", "Tu pelo de lado <3", "Tu mirada", "Mi princesa", "No puedo dejarte de pensar", "Eres vida", "Tus besitos <3", "Mi parte fav", "Mi maicito", "Mi puchurrumin", "Toda bonita", "Toda linda", "La más inteligente"
];
const FOTO_URL = "foto.jpg";      // sube tu foto con este nombre (o usa el botón "Elegir foto")
const VIDEO_ID = "6W4L2O-JQ-w";   // Zoé - Luna (MTV Unplugged)

// Títulos de Zoé -> brillan en dorado, como guiño a la banda
const TITULOS_ZOE = new Set(["Luna","Vía Láctea","Soñé","Arrullo de estrellas","Corazón atómico","Love"]);
const COLORES = ["#d9e4ff", "#e9d4ff", "#ffd4ec", "#c9f0ff", "#c7bcff", "#bcd0ff"];
const DORADO = "#ffe6b3";

/* ================= Escena ================= */
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05030f, 0.0012);
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 3000);
const CAM_Z = 92;
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x05030f, 1);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0x505878, 1.0));
const luz = new THREE.DirectionalLight(0xf2f0ff, 1.4);
luz.position.set(6, 4, 8); scene.add(luz);

/* ================= Cámara responsiva ================= */
function ajustarCamara(){
  const aspect = innerWidth/innerHeight;
  camera.aspect = aspect;
  // en pantallas angostas (celular vertical) alejamos la cámara para que quepa todo
  let z = CAM_Z;
  if(aspect < 1) z = CAM_Z + (1/aspect - 1) * 58;
  camera.position.z = Math.min(z, 170);
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

/* ================= Nebulosa (psicodélica, estilo Zoé) ================= */
function texturaBrillo(color){
  const c=document.createElement('canvas'); c.width=c.height=256; const x=c.getContext('2d');
  const g=x.createRadialGradient(128,128,0,128,128,128);
  g.addColorStop(0,color); g.addColorStop(0.5,color.replace('1)','0.25)')); g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=g; x.fillRect(0,0,256,256); return new THREE.CanvasTexture(c);
}
const nebulosas=[];
['rgba(150,60,200,1)','rgba(210,70,160,1)','rgba(60,120,210,1)','rgba(80,200,190,1)'].forEach((col,i)=>{
  const m=new THREE.SpriteMaterial({ map:texturaBrillo(col), transparent:true, opacity:0.3, blending:THREE.AdditiveBlending, depthWrite:false });
  const s=new THREE.Sprite(m); const a=(i/4)*Math.PI*2;
  s.position.set(Math.cos(a)*80, Math.sin(a)*45, -150-i*30); s.scale.set(270,270,1);
  s.userData.base=0.3; s.userData.fase=i*1.7; scene.add(s); nebulosas.push(s);
});

/* ================= Estrellas ================= */
function estrellas(n, rmin, rmax, tam, color){
  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(n*3);
  for(let i=0;i<n;i++){ const r=rmin+Math.random()*(rmax-rmin), t=Math.random()*Math.PI*2, f=Math.acos(2*Math.random()-1);
    pos[i*3]=r*Math.sin(f)*Math.cos(t); pos[i*3+1]=r*Math.sin(f)*Math.sin(t); pos[i*3+2]=r*Math.cos(f); }
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  const mat=new THREE.PointsMaterial({ color, size:tam, transparent:true, opacity:0.9, depthWrite:false, blending:THREE.AdditiveBlending });
  return new THREE.Points(geo,mat);
}
const estrellasLejos=estrellas(3000,150,800,1.0,0xffffff);
const estrellasCerca=estrellas(800,70,240,1.7,0xe9e9ff);
scene.add(estrellasLejos, estrellasCerca);

/* ================= LA LUNA ================= */
const RLUNA = 11;
const lunaGroup = new THREE.Group(); scene.add(lunaGroup);
function texturaLuna(){
  const w=1024,h=512,c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d');
  x.fillStyle='#9a9aa6'; x.fillRect(0,0,w,h);
  for(let i=0;i<9;i++){ const cx=Math.random()*w, cy=h*0.2+Math.random()*h*0.6, rr=60+Math.random()*130;
    const g=x.createRadialGradient(cx,cy,0,cx,cy,rr); g.addColorStop(0,'rgba(95,95,110,.9)'); g.addColorStop(1,'rgba(95,95,110,0)');
    x.fillStyle=g; x.beginPath(); x.arc(cx,cy,rr,0,7); x.fill(); }
  for(let i=0;i<130;i++){ const cx=Math.random()*w, cy=Math.random()*h, r=3+Math.random()*20;
    x.beginPath(); x.arc(cx+1.5,cy+1.5,r,0,7); x.fillStyle='rgba(40,40,55,.35)'; x.fill();
    x.beginPath(); x.arc(cx,cy,r,0,7); x.fillStyle='rgba(120,120,135,.5)'; x.fill();
    x.beginPath(); x.arc(cx-1,cy-1,r,Math.PI*1.05,Math.PI*1.95); x.strokeStyle='rgba(235,235,245,.35)'; x.lineWidth=1.5; x.stroke(); }
  return new THREE.CanvasTexture(c);
}
const luna=new THREE.Mesh(
  new THREE.SphereGeometry(RLUNA,64,64),
  new THREE.MeshPhongMaterial({ map:texturaLuna(), shininess:2, specular:0x1a1a22, emissive:0x141420, emissiveIntensity:0.28 })
);
lunaGroup.add(luna);
const atmMat=new THREE.ShaderMaterial({
  uniforms:{ glow:{ value:new THREE.Color(0xc7d2ff) } },
  vertexShader:'varying vec3 vN; void main(){ vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'varying vec3 vN; uniform vec3 glow; void main(){ float i=pow(0.62-dot(vN,vec3(0,0,1.0)),2.5); gl_FragColor=vec4(glow,1.0)*i;}',
  side:THREE.BackSide, blending:THREE.AdditiveBlending, transparent:true, depthWrite:false
});
lunaGroup.add(new THREE.Mesh(new THREE.SphereGeometry(RLUNA*1.2,64,64), atmMat));

/* ================= MEDALLÓN CON LA FOTO ================= */
function texturaMedallon(img){
  const s=512,c=document.createElement('canvas'); c.width=c.height=s; const x=c.getContext('2d');
  x.save(); x.beginPath(); x.arc(s/2,s/2,s/2-26,0,7); x.clip();
  if(img){ const e=Math.max(s/img.width,s/img.height), iw=img.width*e, ih=img.height*e; x.drawImage(img,(s-iw)/2,(s-ih)/2,iw,ih); }
  else { const g=x.createLinearGradient(0,0,s,s); g.addColorStop(0,'#2e2350'); g.addColorStop(1,'#5a2e6a'); x.fillStyle=g; x.fillRect(0,0,s,s);
    x.fillStyle='rgba(230,205,255,.95)'; x.font='210px serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText('\u2665', s/2, s/2+14); }
  x.restore();
  x.strokeStyle='rgba(225,220,255,.95)'; x.lineWidth=12; x.shadowColor='rgba(190,170,255,.9)'; x.shadowBlur=30;
  x.beginPath(); x.arc(s/2,s/2,s/2-26,0,7); x.stroke();
  const t=new THREE.CanvasTexture(c); t.minFilter=THREE.LinearFilter; return t;
}
const medMat=new THREE.SpriteMaterial({ map:texturaMedallon(null), transparent:true, depthWrite:false });
const medallon=new THREE.Sprite(medMat); medallon.scale.set(15,15,1); scene.add(medallon);
function ponerFoto(img){ const old=medMat.map; medMat.map=texturaMedallon(img); medMat.needsUpdate=true; if(old) old.dispose(); }
// carga la foto del repo si existe; si no, se queda el medallón con corazón
(function(){ const im=new Image(); im.onload=()=>ponerFoto(im); im.onerror=()=>{}; im.src=FOTO_URL; })();
document.getElementById('btnFoto').addEventListener('click',()=>document.getElementById('inputFoto').click());
document.getElementById('inputFoto').addEventListener('change',e=>{ const f=e.target.files[0]; if(!f) return;
  const rd=new FileReader(); rd.onload=ev=>{ const im=new Image(); im.onload=()=>ponerFoto(im); im.src=ev.target.result; }; rd.readAsDataURL(f); });

/* ================= Palabras en esfera ================= */
const grupoPalabras=new THREE.Group(); scene.add(grupoPalabras);
function spriteTexto(texto,color){
  const b=document.createElement('canvas'), ctx=b.getContext('2d'), fs=72, fuente='italic '+fs+'px Georgia, serif';
  ctx.font=fuente; const anc=Math.ceil(ctx.measureText(texto).width)+60, alt=Math.ceil(fs*1.7);
  b.width=anc; b.height=alt; ctx.font=fuente; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.shadowColor=color; ctx.shadowBlur=26; ctx.fillStyle=color; ctx.fillText(texto,anc/2,alt/2);
  ctx.shadowBlur=0; ctx.fillStyle='rgba(255,255,255,0.92)'; ctx.fillText(texto,anc/2,alt/2);
  const tex=new THREE.CanvasTexture(b); tex.minFilter=THREE.LinearFilter;
  const mat=new THREE.SpriteMaterial({ map:tex, transparent:true, depthWrite:false });
  const sp=new THREE.Sprite(mat); const eb=9; sp.scale.set(eb*(anc/alt),eb,1); sp.userData.mat=mat; return sp;
}
const RW=42, N=PALABRAS.length, phi=Math.PI*(3-Math.sqrt(5));
PALABRAS.forEach((p,i)=>{
  const y=1-(i/(N-1))*2, rad=Math.sqrt(1-y*y), th=phi*i;
  const color = TITULOS_ZOE.has(p) ? DORADO : COLORES[i%COLORES.length];
  const sp=spriteTexto(p,color); sp.position.set(Math.cos(th)*rad*RW, y*RW, Math.sin(th)*rad*RW); grupoPalabras.add(sp);
});

/* ================= Interacción ================= */
let rotX=0,rotY=0,objX=0,objY=0,arr=false,px=0,py=0,vel=0.0016,inter=false;
function abajo(x,y){ arr=true; px=x; py=y; ocultar(); }
function mueve(x,y){ if(!arr) return; objY+=(x-px)*0.005; objX+=(y-py)*0.005; objX=Math.max(-1.4,Math.min(1.4,objX)); px=x; py=y; }
function arriba(){ arr=false; }
const cv=renderer.domElement;
cv.addEventListener('mousedown',e=>abajo(e.clientX,e.clientY));
addEventListener('mousemove',e=>mueve(e.clientX,e.clientY));
addEventListener('mouseup',arriba);
cv.addEventListener('touchstart',e=>{const t=e.touches[0];abajo(t.clientX,t.clientY);},{passive:true});
cv.addEventListener('touchmove',e=>{const t=e.touches[0];mueve(t.clientX,t.clientY);},{passive:true});
cv.addEventListener('touchend',arriba);
function ocultar(){ if(inter) return; inter=true; document.getElementById('hint').classList.add('oculto'); }

/* ================= Música (YouTube) ================= */
let player=null, listo=false, silenciado=false;
const tag=document.createElement('script'); tag.src="https://www.youtube.com/iframe_api"; document.head.appendChild(tag);
window.onYouTubeIframeAPIReady=function(){
  player=new YT.Player('yt',{ videoId:VIDEO_ID,
    playerVars:{controls:0,disablekb:1,loop:1,playlist:VIDEO_ID,playsinline:1,rel:0},
    events:{ onReady:()=>{ listo=true; } } });
};
function iniciarMusica(){ if(player&&listo){ try{ player.unMute(); player.setVolume(55); player.playVideo(); }catch(e){} } }
document.getElementById('btnMute').addEventListener('click',()=>{
  if(!player||!listo) return; silenciado=!silenciado;
  if(silenciado){ player.mute(); document.getElementById('btnMute').textContent='🔇'; }
  else { player.unMute(); player.playVideo(); document.getElementById('btnMute').textContent='🔊'; }
});

/* ================= Entrar ================= */
let entrado=false;
function entrar(){ if(entrado) return; entrado=true;
  document.getElementById('intro').classList.add('fuera');
  iniciarMusica();
  const h=document.getElementById('hint'); h.style.opacity='1';
  setTimeout(()=>h.classList.add('oculto'), 6000);
}
const intro=document.getElementById('intro');
intro.addEventListener('click', entrar);
intro.addEventListener('touchstart', entrar, {passive:true});

/* ================= Animación ================= */
const tmp=new THREE.Vector3(); let medA=0, t=0;
function anima(){
  requestAnimationFrame(anima); t+=0.016;
  objY+=vel; rotX+=(objX-rotX)*0.06; rotY+=(objY-rotY)*0.06;
  grupoPalabras.rotation.x=rotX; grupoPalabras.rotation.y=rotY;
  estrellasCerca.rotation.y=rotY*0.4; estrellasCerca.rotation.x=rotX*0.4; estrellasLejos.rotation.y=rotY*0.15;
  luna.rotation.y+=0.0008;
  medA+=0.0045; const orb=26;
  medallon.position.set(Math.cos(medA)*orb, Math.sin(medA*0.6)*7, Math.sin(medA)*orb);
  nebulosas.forEach(s=>{ s.material.opacity=s.userData.base+Math.sin(t*0.4+s.userData.fase)*0.14; });
  // brillo relativo a la distancia real de la cámara (se adapta al encuadre móvil)
  const near=camera.position.z - RW, far=camera.position.z + RW;
  grupoPalabras.updateMatrixWorld();
  grupoPalabras.children.forEach(sp=>{ sp.getWorldPosition(tmp); const d=camera.position.distanceTo(tmp);
    let o=(far-d)/(far-near); o=Math.max(0.06,Math.min(1,o)); sp.userData.mat.opacity=o*o; });
  renderer.render(scene,camera);
}
ajustarCamara();
anima();
addEventListener('resize', ajustarCamara);
