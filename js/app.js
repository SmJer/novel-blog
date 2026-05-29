let currentView="home",currentCh=-1,fontSize=parseInt(localStorage.getItem("novel-fs"))||17,activeWorld=0;
var totalCh=typeof CHAPTERS!=="undefined"?CHAPTERS.length:0;
var lastRead=parseInt(localStorage.getItem("novel-last"))||0;
var worlds=[];
if(typeof CHAPTERS!=="undefined"){CHAPTERS.forEach(function(c){if(worlds.indexOf(c.world)===-1)worlds.push(c.world)});worlds.sort()}

function tt(){var t=document.documentElement.getAttribute("data-theme"),n=t==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",n);localStorage.setItem("novel-theme",n);document.getElementById("tbtn").textContent=n==="dark"?"🌙":"☀️"}
(function(){var s=localStorage.getItem("novel-theme");if(s){document.documentElement.setAttribute("data-theme",s);document.getElementById("tbtn").textContent=s==="dark"?"🌙":"☀️"}})();

function getWorldLabel(w){return w===1?"世界一：沈念橙":w===2?"世界二：馨澄":"世界"+w}
function getFilteredChapters(w){if(w===0)return CHAPTERS;return CHAPTERS.filter(function(c){return c.world===w})}

function renderWorldTabs(containerId,onclick){
  var c=document.getElementById(containerId);if(!c)return;
  var html='<div class="world-tab'+(activeWorld===0?' active':'')+'" onclick="'+onclick+'(0)">全部</div>';
  worlds.forEach(function(w){
    html+='<div class="world-tab'+(activeWorld===w?' active':'')+'" onclick="'+onclick+'('+w+')">'+getWorldLabel(w)+'</div>';
  });
  c.innerHTML=html;
}

function switchWorld(w){activeWorld=w;renderHome();renderWorldTabs("worldTabs","switchWorld")}
function switchListWorld(w){activeWorld=w;renderList();renderWorldTabs("listWorldTabs","switchListWorld")}

function go(view,idx){
  if(view==="read"){
    if(idx!==undefined){currentCh=idx}
    else if(currentCh<0){currentCh=0}
    lastRead=currentCh;
    localStorage.setItem("novel-last",currentCh);
    renderRead();
  }
  document.querySelectorAll(".view").forEach(function(v){v.classList.remove("active")});
  var map={home:"vh",list:"vl",read:"vr",about:"va"};
  var el=document.getElementById(map[view]);
  if(el)el.classList.add("active");
  currentView=view;
  window.scrollTo({top:0,behavior:"smooth"});
  document.querySelectorAll(".nk a[data-n]").forEach(function(a){a.classList.toggle("active",a.dataset.n===view)});
  updateToolbar();
  if(view==="read")history.pushState(null,"","#ch"+(currentCh+1));
  else if(view==="home")history.pushState(null,"","#");
  else history.pushState(null,"","#"+view);
  return false;
}

function navCh(dir){
  if(totalCh<=0)return;
  if(currentCh<0)currentCh=lastRead;
  var n=currentCh+dir;
  if(n<0)n=0;
  if(n>=totalCh)n=totalCh-1;
  go("read",n);
}

function updateToolbar(){
  var tb=document.getElementById("tbTitle");
  var prev=document.getElementById("tbPrev");
  var next=document.getElementById("tbNext");
  var gc=document.getElementById("goCh");
  if(currentView==="read"&&totalCh>0){
    tb.textContent="第"+CHAPTERS[currentCh].num+"章 · "+CHAPTERS[currentCh].title;
    prev.disabled=currentCh<=0;
    next.disabled=currentCh>=totalCh-1;
    gc.style.display="none";
  }else{
    tb.textContent="";
    prev.disabled=totalCh<=0;
    next.disabled=totalCh<=0;
    gc.style.display="inline-block";
    gc.textContent=currentView==="read"?"📖 开始阅读":"📖 从这里读";
  }
}

function startRead(){
  if(currentCh<0)currentCh=lastRead;
  if(currentCh<0)currentCh=0;
  go("read",currentCh);
}

function renderHome(){
  var c=document.getElementById("homeChList");
  if(!c||typeof CHAPTERS==="undefined")return;
  var list=getFilteredChapters(activeWorld);
  var html='<div class="ch-grid">';
  list.forEach(function(ch,i){
    var idx=CHAPTERS.indexOf(ch);
    html+='<div class="ch-card" onclick="go(\'read\','+idx+')">';
    html+='<div class="ch-card-num">第'+ch.num+'章</div>';
    html+='<div class="ch-card-title">'+ch.title+'</div>';
    html+='<div class="ch-card-go">阅读 →</div>';
    html+='</div>';
  });
  html+='</div>';
  c.innerHTML=html;
  renderWorldTabs("worldTabs","switchWorld");
}

function renderList(){
  var c=document.getElementById("chapterList");
  if(!c||typeof CHAPTERS==="undefined")return;
  var list=getFilteredChapters(activeWorld);
  c.innerHTML=list.map(function(ch,i){
    var idx=CHAPTERS.indexOf(ch);
    return '<a class="ch-item" href="#ch'+ch.num+'" onclick="go(\'read\','+idx+');return false;"><span><span class="ch-num">第'+ch.num+'章</span> '+ch.title+'</span><span style="font-size:12px;color:var(--tx3)">→</span></a>';
  }).join("");
  renderWorldTabs("listWorldTabs","switchListWorld");
}

function renderRead(){
  if(currentCh<0||currentCh>=totalCh)return;
  var ch=CHAPTERS[currentCh];
  if(!ch)return;
  document.getElementById("readTitle").textContent="第"+ch.num+"章";
  document.getElementById("readSubTitle").textContent=ch.title;
  var worldLabel=getWorldLabel(ch.world);
  document.getElementById("readInfo").textContent=worldLabel+" · 第"+ch.num+"章 · "+(currentCh+1)+"/"+totalCh;
  document.getElementById("readContent").innerHTML=ch.content;
  document.getElementById("readContent").style.setProperty("--fsz",fontSize+"px");
  document.getElementById("fsl").textContent=fontSize+"px";
  localStorage.setItem("novel-last",currentCh);
  lastRead=currentCh;
  renderBottomNav();
}

function renderBottomNav(){
  var bn=document.getElementById("bottomNav");
  if(currentView!=="read"){bn.style.display="none";return;}
  bn.style.display="flex";
  var prevBtn=document.getElementById("bnPrev");
  var nextBtn=document.getElementById("bnNext");
  prevBtn.disabled=currentCh<=0;
  nextBtn.disabled=currentCh>=totalCh-1;
  prevBtn.style.visibility=currentCh<=0?"hidden":"visible";
  nextBtn.style.visibility=currentCh>=totalCh-1?"hidden":"visible";
}

function cfs(d){fontSize=Math.max(14,Math.min(22,fontSize+d));document.getElementById("fsl").textContent=fontSize+"px";var rc=document.getElementById("readContent");if(rc)rc.style.setProperty("--fsz",fontSize+"px");localStorage.setItem("novel-fs",fontSize)}

window.addEventListener("scroll",function(){var s=document.documentElement.scrollTop,h=document.documentElement.scrollHeight-window.innerHeight;document.getElementById("pb").style.width=(h>0?(s/h*100):0)+"%";document.getElementById("btt").classList.toggle("show",s>400);document.getElementById("nb").classList.toggle("scrolled",s>50)});

function handleHash(){var h=location.hash.slice(1);if(!h)go("home");else if(h==="list")go("list");else if(h==="about")go("about");else if(h.startsWith("ch")){var n=parseInt(h.slice(2))-1;if(n>=0&&n<totalCh)go("read",n);else go("home")}else go("home")}
window.addEventListener("hashchange",handleHash);

document.addEventListener("DOMContentLoaded",function(){renderHome();renderList();handleHash();updateToolbar()});