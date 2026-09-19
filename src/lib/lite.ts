// "Is this a weak device or a thin connection?" — one place for the heuristic,
// shared by the inline <head> script (which sets data-lite before first paint)
// and MediaGovernor. iOS Safari hides deviceMemory, so cores and the network
// hints carry most of the weight there. Deliberately strict (2 cores / 2 GB /
// 2G): a normal phone must keep its moving backgrounds; only a device that
// genuinely cannot cope loses them. `?lite=1` / `?lite=0` in the URL forces
// the mode on/off and is remembered (for testing on a strong phone). Strong phones stay on the full visuals.
export const LITE_DETECT_SNIPPET = `(function(){try{var n=navigator,c=n.connection||{},q=/[?&]lite=([01])/.exec(location.search);if(q)localStorage.setItem("lite",q[1]);var f=localStorage.getItem("lite");if(f==="1"){document.documentElement.setAttribute("data-lite","1");return}if(f==="0")return;var ss=sessionStorage,t=Date.now(),a=JSON.parse(ss.getItem("loads")||"[]").filter(function(x){return t-x<30000});a.push(t);ss.setItem("loads",JSON.stringify(a));if(a.length>=3)ss.setItem("liteAuto","1");if(ss.getItem("liteAuto")==="1"){document.documentElement.setAttribute("data-lite","1");return}var lite=c.saveData===true||/^(slow-2g|2g)$/.test(c.effectiveType||"")||(n.deviceMemory&&n.deviceMemory<=2)||(n.hardwareConcurrency&&n.hardwareConcurrency<=2);if(lite)document.documentElement.setAttribute("data-lite","1")}catch(e){}})();`;
// Safety net: 3 page loads within 30 seconds in one tab (what a crash-and-reload
// loop looks like in iOS Safari) flips this tab to lite mode for the session, so
// a struggling device degrades instead of reloading forever. `?lite=0` undoes it
// only for the localStorage choice; a fresh tab starts normal again.
