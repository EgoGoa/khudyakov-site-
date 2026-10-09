// Сфера экрана ожидания (Егор, 2026-10-08): та же «нано-сфера», что в
// вайб-баре (NanoSphere.tsx), — волнистые контуры вокруг одного радиуса,
// сложенные светом, с переливом по кругу в цвете раздела. Без свечения и
// теней вокруг (Егор). Рисуется маленьким скриптом прямо в HTML (layout.tsx):
// при пропавшей сети скрипты сайта могут не догрузиться.
//
// С 2026-10-09 (Егор) сфера не крутится при первом заходе и в стартовом
// окне — только на сайте, когда переход завис или нет сети (SlowLoadVeil
// ставит data-veil-wait). Скрипт отдаёт window.__veilOrb.start(): цикл
// идёт, пока висит data-veil-wait, цвет — раздела, куда идёт переход.
export const SLOW_VEIL_ORB_SCRIPT = `(function(){
var cv=document.getElementById("slow-veil-orb");
if(!cv||!cv.getContext)return;
var P={content:["#ff4fd8","#ff6a3d"],ai:["#c8f169","#10b981"],sites:["#ff6f61","#00c2b2"],smm:["#a855f7","#38bdf8"]};
function rgb(h){var n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255].join(",")}
var F,T,running=false;
function tint(path){var col=P[(path||location.pathname).split("/")[1]]||P.content;F=rgb(col[0]);T=rgb(col[1]);}
var d=Math.min(2,window.devicePixelRatio||1),S=140;cv.width=cv.height=S*d;
var ctx=cv.getContext("2d"),c=S*d/2,R=S*d*0.27,L=14,N=72,t0=0,html=document.documentElement;
var still=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
function draw(t){
ctx.clearRect(0,0,cv.width,cv.height);
ctx.globalCompositeOperation="lighter";
var g=ctx.createConicGradient?ctx.createConicGradient(t*1.35,c,c):null;
if(g){g.addColorStop(0,"rgba("+T+",0.95)");g.addColorStop(0.1,"rgba("+F+",0.55)");g.addColorStop(0.3,"rgba("+F+",0.2)");g.addColorStop(0.5,"rgba("+T+",0.5)");g.addColorStop(0.62,"rgba("+F+",0.2)");g.addColorStop(0.82,"rgba("+F+",0.28)");g.addColorStop(1,"rgba("+T+",0.95)");}
ctx.strokeStyle=g||"rgba("+F+",0.4)";ctx.lineWidth=0.6*d;
var e=1+0.2*Math.sin(t*1.1)+0.08*Math.sin(t*2.3);
for(var j=0;j<L;j++){ctx.beginPath();
for(var i=0;i<=N;i++){var a=i/N*Math.PI*2,aa=a+t*0.25;
var w=0.055*Math.sin(3*aa+t*1.1+j*0.17)+0.04*Math.sin(5*aa-t*1.6+j*0.31)+0.025*Math.sin(2*aa+t*0.7-j*0.12);
var r=R*(1+w*e)+(j-L/2)*0.28*d,x=c+Math.cos(a)*r,y=c+Math.sin(a)*r;
if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}
ctx.stroke();}
}
function frame(now){
if(!t0)t0=now;var t=(now-t0)/1000;
if(!html.hasAttribute("data-veil-wait")){running=false;return;}
draw(t+2);requestAnimationFrame(frame);
}
window.__veilOrb={start:function(path){tint(path);if(still){draw(2);return;}if(running)return;running=true;t0=0;requestAnimationFrame(frame);}};
})();`;
