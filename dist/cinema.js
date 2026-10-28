/* One reversible timeline. Every essential visual value is a pure function of scroll progress.
   0-.18 hero; .18-.43 staggered photographic masks; .48-.65 editorial;
   .78-.94 closing. No wheel handlers, timers, or autonomous reveal animations. */
(()=>{'use strict';
const film=document.querySelector('#film'),stage=film.querySelector('.film-stage'),body=document.body;
const scenes=[...stage.querySelectorAll('.scene')],hero=scenes[0],triptych=scenes[1],editorial=scenes[2],closing=scenes[3];
const panels=[...triptych.querySelectorAll('.photo-panel')],copies=panels.map(p=>p.querySelector('.panel-copy'));
const $=s=>stage.querySelector(s),motion=matchMedia('(prefers-reduced-motion: reduce)'),small=matchMedia('(max-width: 760px), (max-height: 560px)');
const stops={inicio:0,servicos:.435,taiane:.715,contacto:.975};
const labels=['01 / O OLHAR','02 / OS DETALHES','03 / A TAIANE','04 / O SEU MOMENTO'];
const dots=[...$('.film-controls nav').querySelectorAll('a')],button=$('#reading-mode');
let userReading=new URLSearchParams(location.search).get('motion')==='reduce',cinematic=false,frame=0,lastActive=-1;
const clamp=x=>Math.max(0,Math.min(1,x));const range=(p,a,b)=>clamp((p-a)/(b-a));const smooth=x=>x*x*(3-2*x);const phase=(p,a,b)=>smooth(range(p,a,b));
function transform(el,value){el.style.transform=value}function opacity(el,value){el.style.opacity=String(value)}
function render(){frame=0;if(!cinematic)return;const rect=film.getBoundingClientRect(),distance=film.offsetHeight-stage.offsetHeight;const p=clamp(-rect.top/Math.max(1,distance));
 const depart=phase(p,.025,.225),revealEditorial=phase(p,.48,.64),finish=phase(p,.78,.94);
 opacity(hero,1-phase(p,.18,.29));transform($('.hero-photo'),`scale(${1+depart*.22}) translate(${depart*-5}%,${depart*3}%)`);
 transform($('.hero-title'),`translate(${-depart*14}%,${-depart*95}px)`);opacity($('.hero-title'),1-phase(p,.075,.195));
 transform($('.hero-caption'),`translateY(${-depart*35}px)`);opacity($('.hero-caption'),1-phase(p,.055,.155));opacity($('.hero-signature'),1-phase(p,.075,.18));
 panels.forEach((panel,i)=>{const enter=phase(p,.17+i*.045,.32+i*.045);const leave=phase(p,.49+i*.02,.63+i*.015);let top=(1-enter)*100;let left=i*100/3,right=(2-i)*100/3;
  if(i<2)top=Math.max(top,leave*100);else{left*=1-finish;top=Math.max(top,leave*100*(1-finish));}
  panel.style.clipPath=`inset(${top}% ${right}% 0 ${left}%)`;
  const image=panel.querySelector('img');const shift=(i-1)*33.333*(i===2?1-finish:1);transform(image,`translateX(${shift}%) scale(${1.16-enter*.12+(i===2?finish*.06:leave*.08)})`);
  opacity(copies[i],phase(p,.29+i*.04,.37+i*.035)*(1-phase(p,.47,.55)));
  transform(copies[i],`translateY(${(1-enter)*70-leave*45}px)`);
 });
 opacity($('.image-disclaimer'),phase(p,.38,.42)*(1-phase(p,.47,.53)));
 opacity(editorial,1-phase(p,.81,.93));editorial.style.clipPath=`inset(${(1-revealEditorial)*100}% 0 0 0)`;
 transform($('.editorial-heading'),`translateY(${(1-phase(p,.53,.66))*75-finish*50}px)`);
 opacity($('.editorial-heading'),phase(p,.54,.65));
 [...$('.editorial-notes').children].forEach((el,i)=>{const a=phase(p,.55+i*.025,.65+i*.02);transform(el,`translateY(${(1-a)*65}px)`);opacity(el,a)});
 transform($('.editorial-watermark'),`translateX(${(1-revealEditorial)*80-finish*60}px)`);
 opacity(closing,phase(p,.825,.95));transform($('.closing-copy'),`translateY(${(1-phase(p,.84,.96))*65}px)`);
 opacity($('.closing-copy'),phase(p,.85,.96));
 const active=p<.255?0:p<.565?1:p<.88?2:3;
 if(active!==lastActive){scenes.forEach((scene,i)=>{scene.inert=i!==active;scene.setAttribute('aria-hidden',String(i!==active))});dots.forEach((dot,i)=>i===active?dot.setAttribute('aria-current','step'):dot.removeAttribute('aria-current'));$('.current-chapter').textContent=labels[active];lastActive=active;}
 body.classList.toggle('editorial-active',p>.625&&p<.855);transform($('.film-progress span'),`scaleX(${p})`);$('.scroll-hint').textContent=p>.96?'FIM DA VISITA ↓':'CONTINUE A ROLAR ↓';
}
function schedule(){if(!frame)frame=requestAnimationFrame(render)}
function go(id,update=true){const target=document.getElementById(id);if(!target)return;if(update)history.pushState(null,'','#'+id);if(cinematic){const y=scrollY+film.getBoundingClientRect().top+(film.offsetHeight-stage.offsetHeight)*stops[id];scrollTo({top:y,behavior:'instant'});render()}else target.scrollIntoView({behavior:'instant',block:'start'});}
function configure(){cinematic=!motion.matches&&!small.matches&&!userReading;body.classList.toggle('cinematic',cinematic);body.classList.toggle('reading',!cinematic);body.classList.remove('editorial-active');lastActive=-1;
 stage.querySelectorAll('[style]').forEach(el=>el.removeAttribute('style'));scenes.forEach(scene=>{scene.inert=false;scene.removeAttribute('aria-hidden')});button.disabled=motion.matches||small.matches;button.setAttribute('aria-pressed',String(!cinematic));button.textContent=cinematic?'Modo leitura':(!motion.matches&&!small.matches?'Experiência scroll':'Leitura direta');
 if(cinematic)render();
}
button.addEventListener('click',()=>{const id=Object.keys(stops)[Math.max(lastActive,0)];userReading=!userReading;configure();go(id,false)});
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.hash.slice(1);if(!(id in stops))return;e.preventDefault();go(id);if(a.classList.contains('skip')){const contact=closing.querySelector('.contact-button');contact.focus({preventScroll:true})}}));
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('hashchange',()=>go(location.hash.slice(1),false));motion.addEventListener('change',configure);small.addEventListener('change',configure);
configure();if(location.hash.slice(1) in stops)requestAnimationFrame(()=>go(location.hash.slice(1),false));
})();
