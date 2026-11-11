/* =========================================================
   app.js — el "motor" del universo 💜
   Todo lo personalizable vive en config.js
   Secciones:
     1. Escena y cámara        6. Medallón con la foto
     2. Nebulosas y estrellas  7. Palabras en esfera
     3. Océano morado          8. Las 7 estrellas
     4. La luna                9. Interacción, cartas y final
     5. La pareja de palito   10. Música, entrada y animación
   ========================================================= */

const $ = id => document.getElementById(id);
const COLORES = ["#e6dcff", "#f3d9ff", "#ffd6ef", "#d8e2ff", "#cdb8ff", "#ead1ff"];
const MORADO = "#a464ff";
const FUENTE = 'Georgia, "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", serif';

/* ---------- Utilidades de texturas ---------- */
function lienzo(w, h){ const c=document.createElement('canvas'); c.width=w; c.height=h||w; return [c, c.getContext('2d')]; }

function texturaBrillo(color){
  const [c,x]=lienzo(256);
  const g=x.createRadialGradient(128,128,0,128,128,128);
  g.addColorStop(0,color); g.addColorStop(0.5,color.replace('1)','0.25)')); g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=g; x.fillRect(0,0,256,256); return new THREE.CanvasTexture(c);
}

function spriteTexto(texto, glow, o={}){
  const fs=o.fs||72, alto=o.alto||9, fuente='italic '+(o.bold?'bold ':'')+fs+'px '+FUENTE;
  const [b,ctx]=lienzo(1);
  ctx.font=fuente; const anc=Math.ceil(ctx.measureText(texto).width)+60, alt=Math.ceil(fs*1.7);
  b.width=anc; b.height=alt; ctx.font=fuente; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.shadowColor=glow; ctx.shadowBlur=o.blur||26; ctx.fillStyle=glow; ctx.fillText(texto,anc/2,alt/2);
  if(o.doble) ctx.fillText(texto,anc/2,alt/2);
  ctx.shadowBlur=0; ctx.fillStyle=o.relleno||'rgba(255,255,255,0.92)'; ctx.fillText(texto,anc/2,alt/2);
  const tex=new THREE.CanvasTexture(b); tex.minFilter=THREE.LinearFilter;
  const mat=new THREE.SpriteMaterial({ map:tex, transparent:true, depthWrite:false });
  const sp=new THREE.Sprite(mat); sp.scale.set(alto*(anc/alt),alto,1);
  sp.userData.mat=mat; sp.userData.alto=alto; sp.userData.ratio=anc/alt; return sp;
}

/* =========================================================
   1. Escena y cámara
   ========================================================= */
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07031a, 0.0012);
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 3000);
const CAM_Z = 92;
camera.position.set(0, 0, CAM_Z);
const PR = Math.min(window.devicePixelRatio || 1, 2);
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setPixelRatio(PR);
renderer.setClearColor(0x07031a, 1);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0x5a4a86, 1.0));
const luz = new THREE.DirectionalLight(0xf3eaff, 1.4);
luz.position.set(6, 4, 8); scene.add(luz);

/* =========================================================
   2. Nebulosas y estrellas de fondo
   ========================================================= */
const nebulosas=[];
['rgba(140,60,230,1)','rgba(200,80,200,1)','rgba(90,70,220,1)','rgba(225,110,210,1)'].forEach((col,i)=>{
  const m=new THREE.SpriteMaterial({ map:texturaBrillo(col), transparent:true, opacity:0.3, blending:THREE.AdditiveBlending, depthWrite:false });
  const s=new THREE.Sprite(m); const a=(i/4)*Math.PI*2;
  s.position.set(Math.cos(a)*80, Math.sin(a)*45, -150-i*30); s.scale.set(270,270,1);
  s.userData.base=0.3; s.userData.fase=i*1.7; scene.add(s); nebulosas.push(s);
});

const texPunto=(()=>{ const [c,x]=lienzo(64);
  const g=x.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.35,'rgba(255,255,255,.75)'); g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); })();

function estrellasFondo(n, rmin, rmax, tam, color){
  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(n*3);
  for(let i=0;i<n;i++){ const r=rmin+Math.random()*(rmax-rmin), t=Math.random()*Math.PI*2, f=Math.acos(2*Math.random()-1);
    pos[i*3]=r*Math.sin(f)*Math.cos(t); pos[i*3+1]=r*Math.sin(f)*Math.sin(t); pos[i*3+2]=r*Math.cos(f); }
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  const mat=new THREE.PointsMaterial({ color, size:tam, map:texPunto, transparent:true, opacity:0.95, depthWrite:false, blending:THREE.AdditiveBlending, fog:false });
  return new THREE.Points(geo,mat);
}
// siempre más lejos que la cámara, para que ninguna estrella pase pegada a la pantalla
const estrellasLejos=estrellasFondo(3200,300,900,3.4,0xffffff);
const estrellasCerca=estrellasFondo(900,190,320,3.6,0xe6d9ff);
scene.add(estrellasLejos, estrellasCerca);

/* =========================================================
   3. Océano morado (como las luces de ARMY en un estadio)
   ========================================================= */
const N_OC=5000, posO=new Float32Array(N_OC*3), faseO=new Float32Array(N_OC), tonoO=new Float32Array(N_OC);
for(let i=0;i<N_OC;i++){
  const r=55+Math.pow(Math.random(),0.8)*360, a=Math.random()*Math.PI*2;
  posO[i*3]=Math.cos(a)*r; posO[i*3+1]=-58+Math.random()*2.5; posO[i*3+2]=Math.sin(a)*r;
  faseO[i]=Math.random()*Math.PI*2; tonoO[i]=Math.random();
}
const geoO=new THREE.BufferGeometry();
geoO.setAttribute('position', new THREE.BufferAttribute(posO,3));
geoO.setAttribute('fase', new THREE.BufferAttribute(faseO,1));
geoO.setAttribute('tono', new THREE.BufferAttribute(tonoO,1));
const oceanoMat=new THREE.ShaderMaterial({
  uniforms:{ uTime:{value:0}, uBrillo:{value:1}, uEscala:{value:400} },
  vertexShader:`
    attribute float fase; attribute float tono;
    uniform float uTime; uniform float uEscala;
    varying float vA; varying float vT;
    void main(){
      vec3 p = position;
      float ola = sin(atan(p.z, p.x)*4.0 - uTime*0.8);           // "la ola" que recorre el estadio
      p.y += ola*1.6 + sin(length(p.xz)*0.05 - uTime*1.2)*1.3;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      float dist = -mv.z;
      float tw = 0.55 + 0.45*sin(uTime*2.3 + fase);
      float cresta = 0.75 + 0.7*smoothstep(0.55, 1.0, ola);
      vA = tw * cresta * clamp(1.0 - (dist-180.0)/480.0, 0.15, 1.0);
      vT = tono;
      gl_PointSize = max(1.0, (1.9 + 1.5*tw) * uEscala / max(dist, 1.0));
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader:`
    uniform float uBrillo; varying float vA; varying float vT;
    void main(){
      float d = length(gl_PointCoord - 0.5);
      if(d > 0.5) discard;
      float a = smoothstep(0.5, 0.05, d);
      vec3 col = mix(vec3(0.55,0.30,1.0), vec3(0.93,0.78,1.0), vT*vT);
      gl_FragColor = vec4(col*uBrillo, a*vA*0.85);
    }`,
  transparent:true, depthWrite:false, blending:THREE.AdditiveBlending
});
const oceano=new THREE.Points(geoO, oceanoMat); scene.add(oceano);

/* =========================================================
   4. La luna (lila, guiño a "Moon" de Jin)
   ========================================================= */
const RLUNA = 11;
const lunaGroup = new THREE.Group(); scene.add(lunaGroup);
function texturaLuna(){
  const w=1024,h=512, [c,x]=lienzo(w,h);
  x.fillStyle='#a9a3bd'; x.fillRect(0,0,w,h);
  for(let i=0;i<9;i++){ const cx=Math.random()*w, cy=h*0.2+Math.random()*h*0.6, rr=60+Math.random()*130;
    const g=x.createRadialGradient(cx,cy,0,cx,cy,rr); g.addColorStop(0,'rgba(98,86,132,.9)'); g.addColorStop(1,'rgba(98,86,132,0)');
    x.fillStyle=g; x.beginPath(); x.arc(cx,cy,rr,0,7); x.fill(); }
  for(let i=0;i<130;i++){ const cx=Math.random()*w, cy=Math.random()*h, r=3+Math.random()*20;
    x.beginPath(); x.arc(cx+1.5,cy+1.5,r,0,7); x.fillStyle='rgba(44,34,70,.35)'; x.fill();
    x.beginPath(); x.arc(cx,cy,r,0,7); x.fillStyle='rgba(126,116,150,.5)'; x.fill();
    x.beginPath(); x.arc(cx-1,cy-1,r,Math.PI*1.05,Math.PI*1.95); x.strokeStyle='rgba(242,232,255,.35)'; x.lineWidth=1.5; x.stroke(); }
  return new THREE.CanvasTexture(c);
}
const luna=new THREE.Mesh(
  new THREE.SphereGeometry(RLUNA,64,64),
  new THREE.MeshPhongMaterial({ map:texturaLuna(), shininess:2, specular:0x1c1626, emissive:0x1c1230, emissiveIntensity:0.32 })
);
lunaGroup.add(luna);
const atmMat=new THREE.ShaderMaterial({
  uniforms:{ glow:{ value:new THREE.Color(0xb68cff) } },
  vertexShader:'varying vec3 vN; void main(){ vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'varying vec3 vN; uniform vec3 glow; void main(){ float i=pow(0.62-dot(vN,vec3(0,0,1.0)),2.5); gl_FragColor=vec4(glow,1.0)*i;}',
  side:THREE.BackSide, blending:THREE.AdditiveBlending, transparent:true, depthWrite:false
});
lunaGroup.add(new THREE.Mesh(new THREE.SphereGeometry(RLUNA*1.2,64,64), atmMat));

/* =========================================================
   5. La pareja de palito, de la mano, parada sobre la luna
   ========================================================= */
function texturaPareja(){
  const [c,x]=lienzo(512);
  x.lineCap='round'; x.lineJoin='round';
  function personas(){
    x.beginPath();
    // persona 1 (izquierda)
    x.moveTo(190,186); x.lineTo(190,318);                         // cuerpo
    x.moveTo(190,318); x.lineTo(158,428); x.moveTo(190,318); x.lineTo(222,428);   // piernas
    x.moveTo(190,224); x.lineTo(144,292);                         // brazo libre
    x.moveTo(190,224); x.lineTo(256,276);                         // brazo que da la mano
    // persona 2 (derecha, un poquito más bajita)
    x.moveTo(322,210); x.lineTo(322,330);
    x.moveTo(322,330); x.lineTo(294,428); x.moveTo(322,330); x.lineTo(350,428);
    x.moveTo(322,246); x.lineTo(366,306);
    x.moveTo(322,246); x.lineTo(256,276);
    x.stroke();
    x.beginPath(); x.arc(190,150,34,0,Math.PI*2); x.stroke();   // cabezas
    x.beginPath(); x.arc(322,178,30,0,Math.PI*2); x.stroke();
  }
  x.shadowColor='rgba(170,110,255,1)';
  x.shadowBlur=30; x.lineWidth=26; x.strokeStyle='rgba(185,135,255,.8)'; personas();    // brillo morado
  x.shadowBlur=8;  x.lineWidth=13; x.strokeStyle='#faf5ff'; personas();                 // trazo blanco
  x.shadowBlur=16; x.fillStyle='#fff'; x.beginPath(); x.arc(256,276,11,0,7); x.fill();  // manos unidas
  const t=new THREE.CanvasTexture(c); t.minFilter=THREE.LinearFilter; return t;
}
function texturaCorazon(){
  const [c,x]=lienzo(128);
  x.font='96px serif'; x.textAlign='center'; x.textBaseline='middle';
  x.shadowColor='rgba(170,110,255,1)'; x.shadowBlur=22; x.fillStyle='#d9b6ff'; x.fillText('♥',64,70);
  x.shadowBlur=0; x.fillStyle='rgba(246,236,255,.95)'; x.fillText('♥',64,70);
  return new THREE.CanvasTexture(c);
}
const ALTO_PAREJA=11;
const pareja=new THREE.Sprite(new THREE.SpriteMaterial({ map:texturaPareja(), transparent:true, depthWrite:false }));
const corazonPareja=new THREE.Sprite(new THREE.SpriteMaterial({ map:texturaCorazon(), transparent:true, depthWrite:false }));
let altoPareja=ALTO_PAREJA, corazonY=0;
function colocarPareja(alto){
  altoPareja=alto;
  pareja.scale.set(alto, alto, 1);
  pareja.position.set(0, RLUNA + 0.34*alto - 0.25, 0);   // los pies quedan justo en la orilla de la luna
  corazonY = pareja.position.y + 0.42*alto;
  corazonPareja.position.set(0, corazonY, 0);
}
colocarPareja(ALTO_PAREJA);
if(CONFIG.pareja){ scene.add(pareja, corazonPareja); }

/* =========================================================
   6. Medallón con la foto
   ========================================================= */
function texturaMedallon(img){
  const s=512, [c,x]=lienzo(s);
  x.save(); x.beginPath(); x.arc(s/2,s/2,s/2-26,0,7); x.clip();
  if(img){ const e=Math.max(s/img.width,s/img.height), iw=img.width*e, ih=img.height*e; x.drawImage(img,(s-iw)/2,(s-ih)/2,iw,ih); }
  else { const g=x.createLinearGradient(0,0,s,s); g.addColorStop(0,'#3a1d6e'); g.addColorStop(1,'#7a2e8a'); x.fillStyle=g; x.fillRect(0,0,s,s);
    x.fillStyle='rgba(235,212,255,.95)'; x.font='210px serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText('♥', s/2, s/2+14); }
  x.restore();
  // Si el navegador bloquea la imagen (pasa al abrir el archivo directo, sin servidor), no se puede usar
  if(img){ try{ x.getImageData(0,0,1,1); }catch(e){ return null; } }
  x.strokeStyle='rgba(222,200,255,.95)'; x.lineWidth=12; x.shadowColor='rgba(160,100,255,.95)'; x.shadowBlur=30;
  x.beginPath(); x.arc(s/2,s/2,s/2-26,0,7); x.stroke();
  const t=new THREE.CanvasTexture(c); t.minFilter=THREE.LinearFilter; return t;
}
const medMat=new THREE.SpriteMaterial({ map:texturaMedallon(null), transparent:true, depthWrite:false });
const medallon=new THREE.Sprite(medMat); medallon.scale.set(15,15,1); scene.add(medallon);

function ponerFoto(img){
  const tex=texturaMedallon(img);
  if(!tex){ console.warn('💜 La foto no se puede mostrar si abres index.html directo. Ábrelo con Live Server (VS Code) o desde GitHub Pages.'); return; }
  const old=medMat.map; medMat.map=tex; medMat.needsUpdate=true; if(old) old.dispose();
}
function cargarFoto(src){
  const im=new Image();
  im.onload=()=>ponerFoto(im);
  im.onerror=()=>console.warn('💜 No encontré la foto "'+src+'". Revisa que el nombre sea exacto (mayúsculas y extensión).');
  im.src=src;
}
if(CONFIG.foto) cargarFoto(CONFIG.foto);
$('btnFoto').addEventListener('click',()=>$('inputFoto').click());
$('inputFoto').addEventListener('change',e=>{ const f=e.target.files[0]; if(!f) return;
  const rd=new FileReader(); rd.onload=ev=>cargarFoto(ev.target.result); rd.readAsDataURL(f); });

/* =========================================================
   7. Palabras en esfera
   ========================================================= */
const grupoPalabras=new THREE.Group(); scene.add(grupoPalabras);
const TITULOS_BTS=new Set(CONFIG.titulosBTS);
const RW=42, N=CONFIG.palabras.length, phi=Math.PI*(3-Math.sqrt(5));
CONFIG.palabras.forEach((p,i)=>{
  const y=1-(i/Math.max(1,N-1))*2, rad=Math.sqrt(1-y*y), th=phi*i;
  const sp = TITULOS_BTS.has(p)
    ? spriteTexto(p, MORADO, { blur:34, doble:true, relleno:'rgba(246,236,255,0.97)' })
    : spriteTexto(p, COLORES[i%COLORES.length]);
  sp.position.set(Math.cos(th)*rad*RW, y*RW, Math.sin(th)*rad*RW); grupoPalabras.add(sp);
});

/* =========================================================
   8. Las 7 estrellas (Osa Mayor)
   ========================================================= */
function texturaDestello(){
  const s=128, [c,x]=lienzo(s);
  const g=x.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
  g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.16,'rgba(255,255,255,.85)');
  g.addColorStop(0.38,'rgba(255,255,255,.16)'); g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g; x.fillRect(0,0,s,s);
  const h=x.createLinearGradient(0,0,s,0), v=x.createLinearGradient(0,0,0,s);
  [h,v].forEach(gr=>{ gr.addColorStop(0,'rgba(255,255,255,0)'); gr.addColorStop(.5,'rgba(255,255,255,.95)'); gr.addColorStop(1,'rgba(255,255,255,0)'); });
  x.fillStyle=h; x.fillRect(0,s/2-1.5,s,3);
  x.fillStyle=v; x.fillRect(s/2-1.5,0,3,s);
  return new THREE.CanvasTexture(c);
}
const texDestello=texturaDestello(), texHalo=texturaBrillo('rgba(170,110,255,1)');
const FORMA=[[-3.0,0.9],[-2.0,1.0],[-1.0,0.75],[0,0.5],[0.1,-0.4],[1.4,-0.25],[1.45,0.75]];
const UNIONES=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]];
const ESC=10, CENTRO_X=-0.78;
let constY=24;   // altura de la constelación (se sube un poco en celular)
const constelacion=new THREE.Group(); constelacion.position.set(0,constY,10); scene.add(constelacion);
const encima = m => { m.depthTest=false; m.depthWrite=false; return m; };
const estrellas7 = CONFIG.estrellas.slice(0,7).map((info,i)=>{
  const pos=new THREE.Vector3((FORMA[i][0]-CENTRO_X)*ESC, FORMA[i][1]*ESC, 0);
  const halo=new THREE.Sprite(encima(new THREE.SpriteMaterial({ map:texHalo, transparent:true, blending:THREE.AdditiveBlending, opacity:.5 })));
  const nucleo=new THREE.Sprite(encima(new THREE.SpriteMaterial({ map:texDestello, transparent:true, blending:THREE.AdditiveBlending })));
  const etiqueta=spriteTexto(info.quien, MORADO, { fs:64, alto:2.8, blur:20 });
  encima(etiqueta.material); etiqueta.material.opacity=0;
  halo.position.copy(pos); nucleo.position.copy(pos);
  halo.renderOrder=10; nucleo.renderOrder=11; etiqueta.renderOrder=12;
  constelacion.add(halo, nucleo, etiqueta);
  return { info, pos, halo, nucleo, etiqueta, hallada:false, fase:i*0.9 };
});
const TOTAL=estrellas7.length;
const lineas = UNIONES.filter(([a,b])=>a<TOTAL && b<TOTAL).map(([a,b])=>{
  const geo=new THREE.BufferGeometry().setFromPoints([estrellas7[a].pos, estrellas7[b].pos]);
  const mat=encima(new THREE.LineBasicMaterial({ color:0xc9a6ff, transparent:true, opacity:0.12, blending:THREE.AdditiveBlending }));
  const l=new THREE.Line(geo,mat); l.renderOrder=9; constelacion.add(l); return { a, b, mat };
});

/* ---------- Cámara responsiva ---------- */
let k=1;
function ajustarCamara(){
  const aspect=innerWidth/innerHeight;
  camera.aspect=aspect;
  let z=CAM_Z; if(aspect<1) z=CAM_Z+(1/aspect-1)*58;   // en celular vertical alejamos la cámara
  camera.position.z=Math.min(z,170);
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  k=Math.min(1.6, camera.position.z/CAM_Z);              // estrellas más grandes si la cámara se aleja
  constY = aspect<1 ? 24+Math.min(16,(1/aspect-1)*12) : 24;
  colocarPareja(ALTO_PAREJA*Math.min(k,1.3));            // en celular la pareja crece un poco para que se note
  estrellas7.forEach(e=>{
    e.etiqueta.position.set(e.pos.x, e.pos.y-3.3*k, 0);
    e.etiqueta.scale.set(e.etiqueta.userData.alto*e.etiqueta.userData.ratio*k, e.etiqueta.userData.alto*k, 1);
  });
  oceanoMat.uniforms.uEscala.value = innerHeight*PR/2;
}
ajustarCamara();
addEventListener('resize', ajustarCamara);

/* =========================================================
   9. Interacción, cartas y sorpresa final
   ========================================================= */
let rotX=0,rotY=0,objX=0,objY=0,arr=false,px=0,py=0,vel=0.0016,inter=false;
let dx0=0, dy0=0, t0=0, movido=false;
const cv=renderer.domElement, vtmp=new THREE.Vector3();

function estrellaEn(x,y){
  let mejor=-1, md=Infinity;
  estrellas7.forEach((e,i)=>{
    e.nucleo.getWorldPosition(vtmp); vtmp.project(camera);
    const sx=(vtmp.x+1)/2*innerWidth, sy=(1-vtmp.y)/2*innerHeight, d=Math.hypot(sx-x, sy-y);
    if(d<md){ md=d; mejor=i; }
  });
  return md<42 ? mejor : -1;
}
function ocultarHint(){ if(inter) return; inter=true; $('hint').classList.add('oculto'); }

cv.addEventListener('pointerdown',e=>{
  arr=true; px=dx0=e.clientX; py=dy0=e.clientY; t0=performance.now(); movido=false;
  try{ cv.setPointerCapture(e.pointerId); }catch(_){}
  cv.style.cursor='grabbing';
});
cv.addEventListener('pointermove',e=>{
  if(!arr){ cv.style.cursor = estrellaEn(e.clientX,e.clientY)>=0 ? 'pointer' : 'grab'; return; }
  if(Math.hypot(e.clientX-dx0, e.clientY-dy0)>8){ movido=true; ocultarHint(); }
  objY+=(e.clientX-px)*0.005; objX+=(e.clientY-py)*0.005; objX=Math.max(-1.4,Math.min(1.4,objX));
  px=e.clientX; py=e.clientY;
});
cv.addEventListener('pointerup',e=>{
  arr=false; cv.style.cursor='grab';
  if(!movido && performance.now()-t0<600){ const i=estrellaEn(e.clientX,e.clientY); if(i>=0) abrirCarta(i); }
});
cv.addEventListener('pointercancel',()=>{ arr=false; });

let halladas=0, finalVisto=false, brilloObj=1, abiertaEn=0;
// en celular, el "click" fantasma que llega después del toque no debe cerrar la carta al instante
const reciente = () => performance.now()-abiertaEn < 500;

function actualizarContador(){
  const c=$('contador');
  if(halladas<TOTAL){ c.textContent='✦ '+halladas+' / '+TOTAL+' estrellas'; }
  else { c.textContent='✦ '+TOTAL+' / '+TOTAL+' · '+CONFIG.final.coreano+' 💜'; c.classList.add('listo'); }
}
function abrirCarta(i){
  const e=estrellas7[i];
  if(!e.hallada){ e.hallada=true; halladas++; actualizarContador(); }
  $('cQuien').textContent=e.info.quien;
  $('cCancion').textContent='✦ “'+e.info.cancion+'” ✦';
  $('cMsg').textContent=e.info.mensaje;
  $('cBtn').textContent=(halladas===TOTAL && !finalVisto) ? 'ver la sorpresa 💜' : 'seguir explorando ✦';
  $('carta').classList.add('visible'); abiertaEn=performance.now();
}
function cerrarCarta(){
  if(reciente()) return;
  $('carta').classList.remove('visible');
  if(halladas===TOTAL && !finalVisto) setTimeout(mostrarFinal, 450);
}
$('cBtn').addEventListener('click', cerrarCarta);
$('carta').addEventListener('click', e=>{ if(e.target===$('carta')) cerrarCarta(); });

$('fKr').textContent=CONFIG.final.coreano; $('fEs').textContent=CONFIG.final.titulo;
$('fMsg').textContent=CONFIG.final.mensaje; $('fPorque').textContent=CONFIG.final.porque; $('fFirma').textContent=CONFIG.final.firma;
function mostrarFinal(){ finalVisto=true; brilloObj=2.3; $('final').classList.add('visible'); abiertaEn=performance.now(); lluviaCorazones(); }
$('final').addEventListener('click', ()=>{ if(reciente()) return; $('final').classList.remove('visible'); brilloObj=1.45; });
$('contador').addEventListener('click', ()=>{ if(halladas===TOTAL) mostrarFinal(); });
actualizarContador();

function lluviaCorazones(){
  for(let i=0;i<38;i++){
    const s=document.createElement('span'); s.className='corazon';
    s.textContent = Math.random()<0.72 ? '💜' : '✦';
    s.style.left=(Math.random()*100)+'vw';
    s.style.fontSize=(14+Math.random()*18)+'px';
    s.style.animationDuration=(4.5+Math.random()*4)+'s';
    s.style.animationDelay=(Math.random()*2.5)+'s';
    s.style.setProperty('--dx',(Math.random()*120-60)+'px');
    s.style.setProperty('--r',(Math.random()*80-40)+'deg');
    s.addEventListener('animationend',()=>s.remove());
    document.body.appendChild(s);
  }
}

function estrellaFugaz(){
  const f=document.createElement('div'); f.className='fugaz';
  const tx=-(220+Math.random()*180), ty=100+Math.random()*110;
  f.style.left=(innerWidth*(0.25+Math.random()*0.8))+'px';
  f.style.top=(innerHeight*(0.03+Math.random()*0.35))+'px';
  f.style.setProperty('--tx',tx+'px'); f.style.setProperty('--ty',ty+'px');
  f.style.setProperty('--ang',(Math.atan2(ty,tx)*180/Math.PI)+'deg');
  f.addEventListener('animationend',()=>f.remove());
  document.body.appendChild(f);
  setTimeout(estrellaFugaz, 3500+Math.random()*5000);
}

/* =========================================================
   10. Música (YouTube), entrada y animación
   ========================================================= */
let player=null, listo=false, silenciado=false, sonando=false, quiereMusica=false;
const btnMute=$('btnMute');
function actualizarBtn(){ btnMute.textContent = !sonando ? '▶ música' : (silenciado ? '🔇' : '🔊'); }
const tag=document.createElement('script'); tag.src="https://www.youtube.com/iframe_api"; document.head.appendChild(tag);
window.onYouTubeIframeAPIReady=function(){
  const v=CONFIG.video;
  player=new YT.Player('yt',{ videoId:v.id,
    playerVars:{ controls:0, disablekb:1, loop:1, playlist:v.id, playsinline:1, rel:0, start:v.inicio||0 },
    events:{
      onReady:()=>{ listo=true; if(quiereMusica) iniciarMusica(); },
      onStateChange:e=>{ sonando=(e.data===1 || e.data===3); actualizarBtn(); }
    } });
};
function iniciarMusica(){ quiereMusica=true; if(!player||!listo) return; try{ player.unMute(); player.setVolume(60); player.playVideo(); }catch(e){} }
btnMute.addEventListener('click',()=>{
  if(!player||!listo) return;
  if(!sonando){ silenciado=false; iniciarMusica(); return; }
  silenciado=!silenciado;
  if(silenciado) player.mute(); else player.unMute();
  actualizarBtn();
});

/* ---------- Portada y entrada ---------- */
$('introPre').textContent=CONFIG.intro.pre;
$('introBig').textContent=CONFIG.intro.titulo;
$('introSub').textContent=CONFIG.intro.sub;
let entrado=false;
function entrar(){ if(entrado) return; entrado=true;
  $('intro').classList.add('fuera');
  iniciarMusica();
  const h=$('hint'); h.style.opacity='1'; setTimeout(()=>h.classList.add('oculto'), 7000);
  $('contador').style.opacity='1';
  setTimeout(estrellaFugaz, 2500);
  setTimeout(()=>{ if(player && listo && !sonando) actualizarBtn(); }, 2500);
}
$('intro').addEventListener('click', entrar);
$('intro').addEventListener('touchstart', entrar, {passive:true});

/* ---------- Animación ---------- */
const tmp=new THREE.Vector3(); let medA=0, t=0;
function anima(){
  requestAnimationFrame(anima); t+=0.016;
  objY+=vel; rotX+=(objX-rotX)*0.06; rotY+=(objY-rotY)*0.06;
  grupoPalabras.rotation.x=rotX; grupoPalabras.rotation.y=rotY;
  estrellasCerca.rotation.y=rotY*0.4; estrellasCerca.rotation.x=rotX*0.4; estrellasLejos.rotation.y=rotY*0.15;
  oceano.rotation.y=rotY*0.12;
  luna.rotation.y+=0.0008;
  medA+=0.0045; const orb=26;
  medallon.position.set(Math.cos(medA)*orb, Math.sin(medA*0.6)*7, Math.sin(medA)*orb);
  nebulosas.forEach(s=>{ s.material.opacity=s.userData.base+Math.sin(t*0.4+s.userData.fase)*0.14; });

  // corazoncito que flota sobre la pareja
  corazonPareja.position.y=corazonY+Math.sin(t*1.6)*0.04*altoPareja;
  corazonPareja.scale.setScalar(0.24*altoPareja*(1+0.12*Math.sin(t*3.2)));

  oceanoMat.uniforms.uTime.value=t;
  const ub=oceanoMat.uniforms.uBrillo; ub.value+=(brilloObj-ub.value)*0.03;

  constelacion.position.y=constY+Math.sin(t*0.5)*0.6;
  estrellas7.forEach(e=>{
    const tw=0.85+0.15*Math.sin(t*2.2+e.fase);
    const pulso=e.hallada ? 1 : 1+0.28*Math.sin(t*3+e.fase);
    e.nucleo.scale.setScalar((e.hallada?6.2:5.6)*k*pulso*tw);
    e.nucleo.material.color.set(e.hallada ? 0xe3c9ff : 0xffffff);
    e.halo.scale.setScalar((e.hallada?16:13)*k*(0.9+0.1*Math.sin(t*1.5+e.fase)));
    e.halo.material.opacity = e.hallada ? 1 : 0.6+0.2*Math.sin(t*2+e.fase);
    e.etiqueta.material.opacity += ((e.hallada?0.95:0)-e.etiqueta.material.opacity)*0.06;
  });
  lineas.forEach(L=>{
    const on=estrellas7[L.a].hallada && estrellas7[L.b].hallada;
    L.mat.opacity += ((on?0.6:0.12)-L.mat.opacity)*0.05;
  });

  grupoPalabras.updateMatrixWorld();
  const cz=camera.position.z;
  grupoPalabras.children.forEach(sp=>{ sp.getWorldPosition(tmp); const d=camera.position.distanceTo(tmp);
    let o=(cz+RW-d)/(2*RW); o=Math.max(0.06,Math.min(1,o)); sp.userData.mat.opacity=o*o; });
  renderer.render(scene,camera);
}
anima();