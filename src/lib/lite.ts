// "Is this a weak device or a thin connection?" — one place for the heuristic,
// shared by the inline <head> script (which sets data-lite before first paint)
// and MediaGovernor. iOS Safari hides deviceMemory, so cores and the network
// hints carry most of the weight there. `?lite=1` / `?lite=0` in the URL forces
// the mode on/off and is remembered (for testing on a strong phone). Strong phones stay on the full visuals.
export const LITE_DETECT_SNIPPET = `(function(){try{var n=navigator,c=n.connection||{},q=/[?&]lite=([01])/.exec(location.search);if(q)localStorage.setItem("lite",q[1]);var f=localStorage.getItem("lite");if(f==="1"){document.documentElement.setAttribute("data-lite","1");return}if(f==="0")return;var lite=c.saveData===true||/^(slow-2g|2g|3g)$/.test(c.effectiveType||"")||(n.deviceMemory&&n.deviceMemory<=4)||(n.hardwareConcurrency&&n.hardwareConcurrency<=4);if(lite)document.documentElement.setAttribute("data-lite","1")}catch(e){}})();`;
