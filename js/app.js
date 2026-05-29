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
  // Toolbar: only visible on read view
  var toolbar=document.getElementById("gtb");
  var backToTop=document.getElementById("btt");
  if(view==="read"){
    toolbar.classList.add("visible");
    document.body.classList.add("reading-mode");
  }else{
    toolbar.classList.remove("visible");
    document.body.classList.remove("reading-mode");
    backToTop.classList.remove("show");
  }
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
  if(currentView==="read"&&totalCh>0){
    tb.textContent="第"+CHAPTERS[currentCh].num+"章 · "+CHAPTERS[currentCh].title;
    prev.disabled=currentCh<=0;
    next.disabled=currentCh>=totalCh-1;
  }else{
    tb.textContent="";
    prev.disabled=true;
    next.disabled=true;
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

window.addEventListener("scroll",function(){var s=document.documentElement.scrollTop,h=document.documentElement.scrollHeight-window.innerHeight;document.getElementById("pb").style.width=(h>0?(s/h*100):0)+"%";if(currentView==="read"){document.getElementById("btt").classList.toggle("show",s>400)}document.getElementById("nb").classList.toggle("scrolled",s>50)});

function handleHash(){var h=location.hash.slice(1);if(!h)go("home");else if(h==="list")go("list");else if(h==="about")go("about");else if(h.startsWith("ch")){var n=parseInt(h.slice(2))-1;if(n>=0&&n<totalCh)go("read",n);else go("home")}else go("home")}
window.addEventListener("hashchange",handleHash);


document.addEventListener("keydown",function(e){
  if(currentView!=="read")return;
  if(e.key==="ArrowLeft"){e.preventDefault();navCh(-1)}
  else if(e.key==="ArrowRight"){e.preventDefault();navCh(1)}
});
document.addEventListener("DOMContentLoaded",function(){renderHome();renderList();handleHash();updateToolbar()});
/* Music Player */
var SONGS=[
{file:"周杰伦 - 晴天.mp3",name:"晴天"},
{file:"周杰伦 - 安静.mp3",name:"安静"},
{file:"周杰伦 - 枫.mp3",name:"枫"},
{file:"周杰伦 - 烟花易冷.mp3",name:"烟花易冷"},
{file:"周杰伦 - 爱在西元前.mp3",name:"爱在西元前"},
{file:"周杰伦 - 爷爷泡的茶.mp3",name:"爷爷泡的茶"},
{file:"周杰伦 - 稻香.mp3",name:"稻香"},
{file:"周杰伦 - 花海.mp3",name:"花海"},
{file:"周杰伦 - 简单爱.mp3",name:"简单爱"},
{file:"周杰伦 - 龙卷风.mp3",name:"龙卷风"},
{file:"周杰伦 - 蒲公英的约定.mp3",name:"蒲公英的约定"},
{file:"周杰伦 - 黑色幽默.mp3",name:"黑色幽默"},
{file:"周杰伦 - 轨迹.mp3",name:"轨迹"},
{file:"周杰伦 - 退后.mp3",name:"退后"},
{file:"周杰伦 - 爷爷泡的茶.mp3",name:"爷爷泡的茶"},
{file:"周杰伦 - 红尘客栈.mp3",name:"红尘客栈"},
{file:"周杰伦 - 说好的幸福呢.mp3",name:"说好的幸福呢"},
{file:"周杰伦 - 给我一首歌的时间.mp3",name:"给我一首歌的时间"},
{file:"周杰伦 - 雨下一整晚.mp3",name:"雨下一整晚"},
{file:"周杰伦&Lara梁心颐 - 珊瑚海.mp3",name:"珊瑚海"}
];
var currentSongIdx=Math.floor(Math.random()*SONGS.length),isPlaying=false,musicExpanded=false;
var audio=document.getElementById("bgMusic");
audio.volume=0.3;

function loadSong(i){
  currentSongIdx=(i+SONGS.length)%SONGS.length;
  audio.src="music/"+SONGS[currentSongIdx].file;
  document.getElementById("musicNow").textContent="周杰伦 · "+SONGS[currentSongIdx].name;
  document.getElementById("musicNow").textContent="周杰伦 · "+SONGS[currentSongIdx].name;
  document.getElementById("musicBarFill").style.width="0%";
  document.getElementById("musicTime").textContent="0:00";
}

function toggleMusic(){
  musicExpanded=!musicExpanded;
  document.getElementById("musicPopup").classList.toggle("open",musicExpanded);
  if(musicExpanded&&!audio.src){loadSong(currentSongIdx)}
}

function togglePlay(){
  if(!audio.src)loadSong(currentSongIdx);
  if(isPlaying){audio.pause();isPlaying=false;document.getElementById("playBtn").textContent="▶";document.getElementById("musicFab").classList.remove("playing")}
  else{audio.play();isPlaying=true;document.getElementById("playBtn").textContent="⏸";document.getElementById("musicFab").classList.add("playing")}
}

function prevSong(){loadSong(currentSongIdx-1);if(isPlaying)audio.play()}
function nextSong(){loadSong(currentSongIdx+1);if(isPlaying)audio.play()}

function setVolume(v){audio.volume=v/100}

function seekMusic(e){
  var bar=document.getElementById("musicProgress");
  var pct=(e.offsetX/bar.offsetWidth);
  audio.currentTime=pct*audio.duration;
}

audio.addEventListener("timeupdate",function(){
  if(!audio.duration)return;
  var pct=(audio.currentTime/audio.duration)*100;
  document.getElementById("musicBarFill").style.width=pct+"%";
  var m=Math.floor(audio.currentTime/60),s=Math.floor(audio.currentTime%60);
  document.getElementById("musicTime").textContent=m+":"+(s<10?"0":"")+s;
  var dm=Math.floor(audio.duration/60),ds=Math.floor(audio.duration%60);
  document.getElementById("musicDuration").textContent=dm+":"+(ds<10?"0":"")+ds;
});

audio.addEventListener("ended",function(){nextSong();audio.play()});

/* Auto play random song on first interaction */
var musicStarted=false;
document.addEventListener("click",function(){
  if(!musicStarted){
    musicStarted=true;
    loadSong(currentSongIdx);
    audio.play().then(function(){
      isPlaying=true;
      document.getElementById("playBtn").textContent="⏸";document.getElementById("musicFab").classList.add("playing");
      document.getElementById("musicNow").textContent="周杰伦 · "+SONGS[currentSongIdx].name;
    }).catch(function(){});
  }
},{once:true});