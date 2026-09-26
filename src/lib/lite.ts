// "Is this a weak device or a thin connection?" — one place for the heuristic,
// shared by the inline <head> script (which sets data-lite/data-mid before
// first paint) and MediaGovernor. iOS Safari hides deviceMemory, so cores and
// the network hints carry most of the weight there.
//
// Two tiers now, not one:
//   · data-lite  — genuinely cannot cope (2 cores / 2 GB / 2G). Deliberately
//     strict: a normal phone must keep its moving backgrounds, only a device
//     that struggles loses them outright (no backdrop-blur, no video,
//     animations run once). This threshold is unchanged from before.
//   · data-mid   — a real but not extreme step down (4 cores / 4 GB / 3G).
//     Keeps the visuals recognisable — blur is softer, not gone; video stays,
//     but only one autoplay clip runs at a time — while cutting the GPU work
//     that made mid-range phones stutter or force-reload.
//
// `?lite=1` / `?lite=0` and `?mid=1` / `?mid=0` in the URL force a tier on/off
// and are remembered (for testing on a strong phone).
//
// Safety net: a struggling tab that reloads itself repeatedly (what a
// crash-and-reload loop looks like in iOS Safari) is degraded automatically,
// one step at a time — 2 loads in 20s drops to data-mid, 3 loads in 30s drops
// straight to data-lite — so a device that can't cope stops fighting the page
// instead of reloading forever. `?lite=0` / `?mid=0` undo only the
// localStorage choice; a fresh tab starts normal again.
//
// Страховка работает только на сенсорных устройствах (pointer: coarse) —
// ради них она и сделана. На компьютере три быстрые загрузки за 30с —
// обычное дело (перезагрузил, походил по страницам), и раньше это молча
// переводило вкладку в lite до её закрытия: видеофоны пропадали на всём
// сайте (Егор, 2026-09-26: «фоны на страницах пропали с видео»).
export const LITE_DETECT_SNIPPET = `(function(){try{
var n=navigator,c=n.connection||{},d=document.documentElement;
var ql=/[?&]lite=([01])/.exec(location.search),qm=/[?&]mid=([01])/.exec(location.search);
if(ql)localStorage.setItem("lite",ql[1]);
if(qm)localStorage.setItem("mid",qm[1]);
var fl=localStorage.getItem("lite"),fm=localStorage.getItem("mid");
if(fl==="1"){d.setAttribute("data-lite","1");return}
if(fm==="1"){d.setAttribute("data-mid","1")}
if(fl==="0"&&fm==="0")return;
var ss=sessionStorage,t=Date.now();
var coarse=window.matchMedia&&matchMedia("(pointer: coarse)").matches;
if(coarse){
var a=JSON.parse(ss.getItem("loads")||"[]").filter(function(x){return t-x<30000});
a.push(t);ss.setItem("loads",JSON.stringify(a));
var a20=a.filter(function(x){return t-x<20000});
if(a.length>=3)ss.setItem("liteAuto","1");
else if(a20.length>=2)ss.setItem("midAuto","1");
if(ss.getItem("liteAuto")==="1"){d.setAttribute("data-lite","1");return}
}
if(fl==="0")return;
var lite=c.saveData===true||/^(slow-2g|2g)$/.test(c.effectiveType||"")||(n.deviceMemory&&n.deviceMemory<=2)||(n.hardwareConcurrency&&n.hardwareConcurrency<=2);
if(lite){d.setAttribute("data-lite","1");return}
if(fm==="0")return;
if(d.hasAttribute("data-mid"))return;
var mid=(coarse&&ss.getItem("midAuto")==="1")||/^3g$/.test(c.effectiveType||"")||(n.deviceMemory&&n.deviceMemory<=4)||(n.hardwareConcurrency&&n.hardwareConcurrency<=4);
if(mid)d.setAttribute("data-mid","1")
}catch(e){}})();(function(){var d=document.documentElement;d.setAttribute("data-tier",d.hasAttribute("data-lite")?"low":d.hasAttribute("data-mid")?"mid":"high")})();`;
