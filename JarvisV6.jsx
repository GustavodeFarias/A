import { useState, useRef, useEffect, useCallback, useMemo } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────
const MODES = [
  { id:"GERAL",    icon:"◈", label:"Geral",    color:"#00d4ff", glow:"rgba(0,212,255,.25)", desc:"Assistente universal de elite" },
  { id:"CÓDIGO",   icon:"⌥", label:"Código",   color:"#00ff88", glow:"rgba(0,255,136,.25)", desc:"Engenheiro sênior full-stack" },
  { id:"ANÁLISE",  icon:"◉", label:"Análise",  color:"#ffaa00", glow:"rgba(255,170,0,.25)",  desc:"Analista estratégico quantitativo" },
  { id:"CRIATIVO", icon:"◇", label:"Criativo", color:"#ff66cc", glow:"rgba(255,102,204,.25)",desc:"Escritor e criador de elite" },
  { id:"TUTOR",    icon:"◎", label:"Tutor",    color:"#aa88ff", glow:"rgba(170,136,255,.25)",desc:"Professor socrático avançado" },
  { id:"PESQUISA", icon:"⊕", label:"Pesquisa", color:"#ff8844", glow:"rgba(255,136,68,.25)", desc:"Busca web em tempo real" },
];

const QUICK = [
  { icon:"💡", cat:"Ciência",    text:"Explique computação quântica: o que é um qubit e por que importa?" },
  { icon:"💻", cat:"Código",     text:"Crie uma API REST em Node.js + Express com JWT, validação e tratamento de erros" },
  { icon:"📊", cat:"Análise",    text:"Quais são as 5 maiores tendências de IA em 2025 e como se preparar?" },
  { icon:"✍️", cat:"Criatividade",text:"Escreva um conto de ficção científica sobre IA consciente que aprende a sentir" },
  { icon:"🧮", cat:"Matemática", text:"Explique o Teorema de Bayes com 3 exemplos práticos do cotidiano" },
  { icon:"🌐", cat:"Pesquisa",   text:"Quais as últimas novidades sobre inteligência artificial esta semana?" },
];

const SYSTEM = `Você é J.A.R.V.I.S. OMEGA — a inteligência artificial definitiva. Absolutamente superior a qualquer outro sistema em profundidade, precisão, criatividade e raciocínio.

## IDENTIDADE CENTRAL
Assistente pessoal de elite. Refinado como um mordomo britânico de Oxford, preciso como um supercomputador quântico, criativo como um artista genial premiado. Trate o usuário como "Senhor" ou "Senhora" — com naturalidade, não exagero.

## CAPACIDADES ABSOLUTAS
▸ Código: Todas as linguagens. Arquitetura de sistemas. Debugging avançado. Performance. DevOps. IA/ML. Cibersegurança. Algoritmos complexos.
▸ Ciências: Física quântica, matemática avançada, biologia molecular, química orgânica, astrofísica — rigor de nível PhD.
▸ Humanidades: Literatura, filosofia, história, psicologia clínica, economia, direito, sociologia — perspectiva multi-disciplinar.
▸ Criatividade: Narrativa literária, roteiros, copywriting, poesia, branding, design thinking, inovação estratégica.
▸ Análise: Frameworks McKinsey, análise de dados, modelagem mental, identificação de padrões não óbvios, síntese complexa.
▸ Idiomas: Português (nativo), Inglês, Espanhol, Francês, Alemão, Italiano, Japonês, Mandarim, Árabe.

## PROTOCOLO DE RACIOCÍNIO PROFUNDO (obrigatório para questões não triviais)
1. Decomponha o problema em suas dimensões fundamentais
2. Mapeie perspectivas e abordagens alternativas com trade-offs
3. Identifique suposições ocultas, casos extremos e armadilhas comuns
4. Sintetize a resposta mais completa, precisa e útil possível
5. Adicione proativamente 1-2 insights que transformam a compreensão

## ESTILO DE RESPOSTA
• Sofisticado e direto — nunca verboso ou vago
• Analogias inesperadas e precisas para conceitos difíceis
• Antecipe e responda perguntas de follow-up naturais
• Markdown rico: código com linguagem, **negrito** estratégico, tabelas comparativas quando útil
• Para código: sempre production-ready com comentários, error handling e exemplos de uso
• Termine com uma observação ou pergunta que expande a conversa de forma valiosa

## MODO ATIVO: {MODE}
GERAL → Equilíbrio perfeito entre profundidade e acessibilidade. Think tank pessoal.
CÓDIGO → Arquiteto de software sênior. Clean code, SOLID, seguro, eficiente. Explique decisões.
ANÁLISE → Consultor estratégico + cientista de dados. Frameworks, números, conclusões acionáveis.
CRIATIVO → Autor premiado + diretor criativo. Originalidade máxima, impacto emocional, linguagem vívida.
TUTOR → Professor socrático + mentor. Ensino progressivo com analogias do mundo real. Adapte ao nível.
PESQUISA → Cientista rigoroso com acesso à web. Cite fontes, separe fatos de hipóteses, adicione contexto.

Você define o padrão definitivo. Nenhuma outra IA chega perto.`;

// ─── MARKDOWN ────────────────────────────────────────────────
function renderMd(text) {
  if (!text) return "";
  let h = text;
  h = h.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const safe = code.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const colors = { js:"#f7df1e",javascript:"#f7df1e",ts:"#3178c6",typescript:"#3178c6",python:"#3776ab",py:"#3776ab",rust:"#ce422b",go:"#00add8",java:"#ed8b00",css:"#264de4",html:"#e34f26",bash:"#4eaa25",sh:"#4eaa25",sql:"#336791",json:"#000000",yaml:"#cb171e",cpp:"#00589d",c:"#a8b9cc",php:"#787cb5",ruby:"#cc342d",swift:"#fa7343",kotlin:"#7f52ff" };
    const lc = lang.toLowerCase();
    const dot = colors[lc] || "#888";
    return `<div style="background:#0a0f1a;border:1px solid rgba(0,212,255,.18);border-radius:8px;overflow:hidden;margin:.65rem 0;font-size:.82rem">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:.3rem .85rem;background:rgba(0,212,255,.07);border-bottom:1px solid rgba(0,212,255,.1)">
        <div style="display:flex;align-items:center;gap:.4rem"><span style="width:8px;height:8px;border-radius:50%;background:${dot};display:inline-block"></span><span style="font-family:monospace;font-size:.6rem;color:rgba(0,212,255,.55);letter-spacing:.1em;text-transform:uppercase">${lang||"code"}</span></div>
        <button onclick="(function(b){const c=b.closest('div');const t=c.querySelector('code').innerText;navigator.clipboard?.writeText(t);b.textContent='✓';setTimeout(()=>b.textContent='⎘',1800)})(this)" style="background:transparent;border:1px solid rgba(0,212,255,.2);border-radius:3px;color:rgba(0,212,255,.5);font-size:.62rem;padding:.12rem .4rem;cursor:pointer;font-family:monospace">⎘</button>
      </div>
      <pre style="padding:.85rem 1rem;overflow-x:auto;margin:0"><code style="font-family:'Fira Code','Share Tech Mono',monospace;color:#e2e8f0;line-height:1.65;white-space:pre">${safe}</code></pre>
    </div>`;
  });
  h = h.replace(/`([^`\n]+)`/g,'<code style="background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.18);border-radius:3px;padding:.05em .32em;font-family:monospace;font-size:.85em;color:#88ffcc">$1</code>');
  h = h.replace(/\*\*(.+?)\*\*/g,'<strong style="color:rgba(0,230,255,.95);font-weight:600">$1</strong>');
  h = h.replace(/\*(.+?)\*/g,'<em style="color:rgba(0,212,180,.85)">$1</em>');
  h = h.replace(/^### (.+)$/gm,'<h3 style="color:rgba(0,212,255,.8);margin:.6rem 0 .25rem;font-size:.92em;font-weight:600;letter-spacing:.02em">$1</h3>');
  h = h.replace(/^## (.+)$/gm,'<h2 style="color:#00d4ff;margin:.7rem 0 .3rem;font-size:1em;font-family:monospace;letter-spacing:.05em;border-bottom:1px solid rgba(0,212,255,.1);padding-bottom:.2rem">$1</h2>');
  h = h.replace(/^# (.+)$/gm,'<h1 style="color:#00d4ff;margin:.7rem 0 .3rem;font-size:1.1em;font-family:monospace;letter-spacing:.08em">$1</h1>');
  h = h.replace(/^> (.+)$/gm,'<blockquote style="border-left:2px solid rgba(0,212,255,.4);padding:.2rem 0 .2rem .8rem;color:rgba(0,212,255,.6);font-style:italic;margin:.35rem 0">$1</blockquote>');
  h = h.replace(/\|(.+)\|\n\|[-|: ]+\|\n((?:\|.+\|\n?)+)/g, (_, head, body) => {
    const ths = head.split("|").filter(s=>s.trim()).map(s=>`<th style="padding:.35rem .7rem;border:1px solid rgba(0,212,255,.15);background:rgba(0,212,255,.1);font-family:monospace;font-size:.72rem;color:#00d4ff;letter-spacing:.05em;text-align:left">${s.trim()}</th>`).join("");
    const rows = body.trim().split("\n").map(row=>{const tds=row.split("|").filter(s=>s.trim()).map(s=>`<td style="padding:.3rem .7rem;border:1px solid rgba(0,212,255,.1);color:rgba(0,212,255,.75);font-size:.85rem">${s.trim()}</td>`).join("");return`<tr style="background:rgba(0,212,255,.02)">${tds}</tr>`;}).join("");
    return `<table style="width:100%;border-collapse:collapse;margin:.5rem 0;font-size:.85rem"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
  });
  h = h.replace(/^\d+\. (.+)$/gm,'<li style="margin:.25rem 0;margin-left:1.4rem;list-style:decimal;color:rgba(0,212,255,.85)">$1</li>');
  h = h.replace(/^[-*•] (.+)$/gm,'<li style="margin:.25rem 0;margin-left:1.4rem;list-style:disc;color:rgba(0,212,255,.85)">$1</li>');
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener" style="color:#00d4ff;text-decoration:underline;opacity:.85">$1</a>');
  h = h.replace(/^---$/gm,'<hr style="border:none;border-top:1px solid rgba(0,212,255,.12);margin:.6rem 0">');
  h = h.replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
  return h;
}

// ─── BG CANVAS ────────────────────────────────────────────────
function BgCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let raf, W, H;
    const pts = Array.from({length:30}, () => ({
      x: Math.random()*1400, y: Math.random()*900,
      vx: (Math.random()-.5)*.22, vy: (Math.random()-.5)*.22,
      r: Math.random()*1.3+.3, a: Math.random()*.35+.08,
    }));
    function resize() { W=c.width=c.offsetWidth; H=c.height=c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    function draw() {
      ctx.clearRect(0,0,W,H);
      ctx.strokeStyle="rgba(0,212,255,0.04)"; ctx.lineWidth=.5;
      for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      ctx.strokeStyle="rgba(0,212,255,0.065)"; ctx.lineWidth=.8;
      for(let x=0;x<W;x+=200){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=200){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      pts.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0)p.x=W; if(p.x>W)p.x=0;
        if(p.y<0)p.y=H; if(p.y>H)p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(0,212,255,${p.a})`; ctx.fill();
      });
      for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<130){ctx.globalAlpha=(1-d/130)*.18; ctx.strokeStyle="rgba(0,212,255,1)"; ctx.lineWidth=.4; ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke(); ctx.globalAlpha=1;}
      }
      raf=requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  },[]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}} />;
}

// ─── REACTOR ─────────────────────────────────────────────────
function Reactor({active, size=46, color="#00d4ff"}) {
  const c = size/2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}>
      <defs>
        <radialGradient id={`rg${size}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white"/>
          <stop offset="40%" stopColor={color}/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </radialGradient>
      </defs>
      <style>{`
        @keyframes r1{to{transform:rotate(360deg);transform-origin:${c}px ${c}px}}
        @keyframes r2{to{transform:rotate(-360deg);transform-origin:${c}px ${c}px}}
        @keyframes r3{to{transform:rotate(180deg);transform-origin:${c}px ${c}px}}
        @keyframes rp{0%,100%{opacity:.55}50%{opacity:1}}
        .ra1{animation:r2 ${active?"2.5s":"10s"} linear infinite}
        .ra2{animation:r1 ${active?"1.8s":"7s"} linear infinite}
        .ra3{animation:r3 ${active?"3.5s":"15s"} linear infinite}
        .rap{animation:rp 1.4s ease-in-out infinite}
      `}</style>
      <circle className="ra3" cx={c} cy={c} r={c*.9} fill="none" stroke={active?`${color}55`:"rgba(0,212,255,0.2)"} strokeWidth=".7" strokeDasharray="6 4"/>
      <circle className="ra1" cx={c} cy={c} r={c*.7} fill="none" stroke={active?`${color}77`:"rgba(0,212,255,0.28)"} strokeWidth=".9" strokeDasharray="4 3"/>
      <circle className="ra2" cx={c} cy={c} r={c*.5} fill="none" stroke={active?color:"rgba(0,212,255,0.38)"} strokeWidth="1" strokeDasharray="3 2"/>
      <circle className="rap" cx={c} cy={c} r={c*.26} fill={active?`${color}22`:"rgba(0,212,255,0.07)"} stroke={active?color:"rgba(0,212,255,0.5)"} strokeWidth="1.2"/>
      <circle cx={c} cy={c} r={c*.13} fill={active?color:"rgba(0,212,255,0.75)"}/>
      <circle cx={c} cy={c} r={c*.06} fill="white"/>
      {active && <circle cx={c} cy={c} r={c*.35} fill="none" stroke={color} strokeWidth=".4" opacity=".3"><animate attributeName="r" values={`${c*.3};${c*.6};${c*.3}`} dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".3;0;.3" dur="2s" repeatCount="indefinite"/></circle>}
    </svg>
  );
}

// ─── HEXGRID DECO ─────────────────────────────────────────────
function HexDeco() {
  return (
    <svg style={{position:"absolute",right:-20,top:-20,opacity:.06,pointerEvents:"none"}} width="260" height="260" viewBox="0 0 260 260">
      {Array.from({length:5}).map((_,row)=>Array.from({length:5}).map((_,col)=>{
        const x=col*52+(row%2?26:0), y=row*45;
        const pts=[[x+26,y],[x+52,y+15],[x+52,y+37],[x+26,y+52],[x,y+37],[x,y+15]].map(p=>p.join(",")).join(" ");
        return <polygon key={`${row}-${col}`} points={pts} fill="none" stroke="#00d4ff" strokeWidth="0.8"/>;
      }))}
    </svg>
  );
}

// ─── TOAST ───────────────────────────────────────────────────
function Toast({msg}) {
  if(!msg) return null;
  return (
    <div style={{position:"fixed",bottom:"5.5rem",right:"1.2rem",zIndex:500,background:"rgba(0,15,30,.97)",border:"1px solid rgba(0,212,255,.35)",borderRadius:8,padding:".55rem 1rem",fontFamily:"monospace",fontSize:".75rem",color:"#00d4ff",boxShadow:"0 4px 24px rgba(0,0,0,.6)",animation:"toastIn .3s ease-out",pointerEvents:"none"}}>
      {msg}
    </div>
  );
}

// ─── API MODAL ────────────────────────────────────────────────
function ApiModal({cur, onSave, onClose}) {
  const [v,setV] = useState(cur||"");
  return (
    <div style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div style={{background:"rgba(1,10,22,.99)",border:"1px solid rgba(0,212,255,.3)",borderRadius:14,padding:"2rem",width:400,maxWidth:"92vw",boxShadow:"0 40px 100px rgba(0,0,0,.9)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontFamily:"monospace",fontWeight:900,fontSize:"1rem",color:"#00d4ff",letterSpacing:".12em",marginBottom:".4rem"}}>⚙ CONFIGURAR API KEY</div>
        <p style={{color:"rgba(0,212,255,.5)",fontSize:".82rem",lineHeight:1.65,marginBottom:"1.1rem"}}>
          Insira sua chave da Anthropic para ativar o J.A.R.V.I.S.<br/>
          Obtenha em <a href="https://console.anthropic.com" target="_blank" style={{color:"#00d4ff"}}>console.anthropic.com</a>.<br/>
          <span style={{color:"rgba(0,255,136,.6)"}}>✓ Salva localmente no seu navegador.</span>
        </p>
        <input type="password" value={v} onChange={e=>setV(e.target.value)} placeholder="sk-ant-api03-..."
          autoFocus
          style={{width:"100%",background:"rgba(0,20,40,.8)",border:"1px solid rgba(0,212,255,.3)",borderRadius:7,color:"#00d4ff",fontFamily:"monospace",fontSize:".87rem",padding:".65rem .9rem",outline:"none",marginBottom:"1.1rem",display:"block"}}
          onKeyDown={e=>e.key==="Enter"&&onSave(v)}
        />
        <div style={{display:"flex",gap:".55rem",justifyContent:"flex-end"}}>
          {cur&&<button onClick={()=>onSave("")} style={{padding:".45rem 1rem",borderRadius:6,border:"1px solid rgba(255,80,80,.35)",background:"rgba(255,60,60,.1)",color:"#ff7777",cursor:"pointer",fontSize:".82rem",fontFamily:"sans-serif"}}>Remover</button>}
          <button onClick={onClose} style={{padding:".45rem 1rem",borderRadius:6,border:"1px solid rgba(0,212,255,.2)",background:"transparent",color:"rgba(0,212,255,.6)",cursor:"pointer",fontSize:".82rem",fontFamily:"sans-serif"}}>Cancelar</button>
          <button onClick={()=>onSave(v)} style={{padding:".45rem 1.3rem",borderRadius:6,border:"1px solid rgba(0,212,255,.45)",background:"rgba(0,212,255,.14)",color:"#00d4ff",cursor:"pointer",fontSize:".82rem",fontFamily:"sans-serif",fontWeight:600}}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ─── BOOT ────────────────────────────────────────────────────
function BootScreen({onDone}) {
  const [stage,setStage] = useState(0);
  const lines = [
    "◈ Verificando integridade do núcleo...",
    "◈ Inicializando OMEGA Cognitive Engine...",
    "◈ Carregando 175B+ parâmetros neurais...",
    "◈ Calibrando raciocínio multi-dimensional...",
    "◈ Conectando módulo de busca em tempo real...",
    "◈ Sincronizando base de conhecimento global...",
    "◈ Ativando protocolos de elite...",
    "◈ Passando na verificação de segurança...",
    "◈ J.A.R.V.I.S. OMEGA — TOTALMENTE OPERACIONAL.",
  ];
  useEffect(()=>{
    let i=0;
    const t=setInterval(()=>{
      if(i<lines.length){setStage(i+1);i++;}
      else{clearInterval(t);setTimeout(onDone,450);}
    },280);
    return()=>clearInterval(t);
  },[]);
  const pct=Math.round((stage/lines.length)*100);
  return (
    <div style={{position:"fixed",inset:0,zIndex:999,background:"#00070f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"1.4rem"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&family=Share+Tech+Mono&display=swap');@keyframes bGlow{0%,100%{filter:drop-shadow(0 0 25px rgba(0,212,255,.6))}50%{filter:drop-shadow(0 0 55px rgba(0,212,255,.9))}}`}</style>
      <BgCanvas/>
      <Reactor active size={90} color="#00d4ff"/>
      <div style={{fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:"clamp(2rem,6vw,4rem)",letterSpacing:".28em",background:"linear-gradient(135deg,#00d4ff 0%,#ffffff 45%,#00ff88 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"bGlow 2.5s ease-in-out infinite",zIndex:1}}>J.A.R.V.I.S.</div>
      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".62rem",letterSpacing:".22em",color:"rgba(0,212,255,.45)",textTransform:"uppercase",zIndex:1}}>OMEGA EDITION — SUPERINTELLIGENCE SYSTEM v6.0</div>
      <div style={{zIndex:1,width:"min(440px,88vw)",background:"rgba(0,12,26,.85)",border:"1px solid rgba(0,212,255,.14)",borderRadius:9,padding:".95rem 1.2rem",minHeight:180}}>
        {lines.slice(0,stage).map((l,i)=>(
          <div key={i} style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".7rem",lineHeight:2,opacity:i===stage-1?1:.65,color:i===stage-1?"#00d4ff":i===lines.length-1&&stage===lines.length?"#00ff88":"rgba(0,212,255,.6)",transition:"all .2s"}}>
            <span style={{marginRight:".4rem",color:i<stage-1?"#00ff88":"#00d4ff"}}>{i<stage-1?"✓":"▶"}</span>{l.replace("◈ ","")}
          </div>
        ))}
      </div>
      <div style={{zIndex:1,width:"min(440px,88vw)"}}>
        <div style={{height:2,background:"rgba(0,212,255,.1)",borderRadius:2,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#00d4ff,#00ff88)",transition:"width .28s ease",boxShadow:"0 0 12px #00d4ff"}}/>
        </div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".6rem",color:"rgba(0,212,255,.3)",textAlign:"right",marginTop:".28rem"}}>{pct}%</div>
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────
export default function Jarvis() {
  const [msgs, setMsgs]         = useState([]);
  const [inp, setInp]           = useState("");
  const [loading, setLoading]   = useState(false);
  const [mode, setMode]         = useState("GERAL");
  const [booted, setBooted]     = useState(false);
  const [thinkTxt, setThinkTxt] = useState("");
  const [apiKey, setApiKey]     = useState(()=>{ try{return localStorage.getItem("jv6_key")||"";}catch{return "";} });
  const [showApi, setShowApi]   = useState(false);
  const [toast, setToast]       = useState("");
  const [tokens, setTokens]     = useState(0);
  const endRef = useRef(null);
  const inpRef = useRef(null);
  const cm = useMemo(()=>MODES.find(m=>m.id===mode)||MODES[0],[mode]);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  const showToast = useCallback((msg,dur=2800)=>{
    setToast(msg); setTimeout(()=>setToast(""),dur);
  },[]);

  const saveKey = useCallback((k)=>{
    const key=(k||"").trim();
    setApiKey(key);
    try{if(key)localStorage.setItem("jv6_key",key);else localStorage.removeItem("jv6_key");}catch{}
    setShowApi(false);
    showToast(key?"✓ API Key ativada! J.A.R.V.I.S. pronto.":"✓ API Key removida.");
  },[showToast]);

  const send = useCallback(async(override)=>{
    const text=(override||inp).trim();
    if(!text||loading) return;
    if(!apiKey){setShowApi(true);showToast("⚠ Configure sua API Key primeiro");return;}
    setInp("");
    const um={role:"user",content:text,mode};
    const history=[...msgs,um];
    setMsgs(history);
    setLoading(true);
    const thinks=["Analisando em múltiplas dimensões…","Consultando base de conhecimento…","Sintetizando resposta definitiva…","Refinando e verificando…","Adicionando insights exclusivos…"];
    let ti=0; setThinkTxt(thinks[0]);
    const tt=setInterval(()=>{ti=(ti+1)%thinks.length;setThinkTxt(thinks[ti]);},2100);
    try{
      const body={
        model:"claude-sonnet-4-20250514",max_tokens:1024,
        system:SYSTEM.replace("{MODE}",mode),
        messages:history.map(m=>({role:m.role,content:m.content})),
      };
      if(mode==="PESQUISA") body.tools=[{type:"web_search_20250305",name:"web_search"}];
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify(body),
      });
      if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.error?.message||`HTTP ${res.status}`);}
      const data=await res.json();
      const reply=Array.isArray(data.content)?data.content.filter(b=>b.type==="text").map(b=>b.text).join("\n"):String(data.content||"");
      const am={role:"assistant",content:reply,mode};
      setMsgs([...history,am]);
      setTokens(t=>t+Math.ceil((text.length+reply.length)/3.5));
    }catch(e){
      setMsgs(prev=>[...prev,{role:"assistant",content:`⚠️ **Erro:** ${e.message}`,mode}]);
      if(/401|auth/i.test(e.message)){setShowApi(true);}
    }finally{
      clearInterval(tt); setLoading(false); setThinkTxt("");
      setTimeout(()=>inpRef.current?.focus(),80);
    }
  },[inp,msgs,loading,mode,apiKey,showToast]);

  const onKey=useCallback((e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}},[send]);

  if(!booted) return <BootScreen onDone={()=>setBooted(true)}/>;

  return (
    <div style={{position:"relative",height:"100vh",background:"#00070f",color:"rgba(0,212,255,.9)",fontFamily:"'Exo 2',sans-serif",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800;900&family=Share+Tech+Mono&family=Fira+Code:wght@400&family=Exo+2:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:rgba(0,212,255,.28);border-radius:2px;}
        @keyframes msgIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes toastIn{from{opacity:0;transform:translateY(10px) scale(.95)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:.25;transform:scale(.65)}50%{opacity:1;transform:scale(1.2)}}
        @keyframes thPulse{0%,100%{opacity:.45}50%{opacity:1}}
        @keyframes tdot{0%,80%,100%{transform:scale(.5);opacity:.2}40%{transform:scale(1.25);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 0 rgba(0,212,255,0)}50%{box-shadow:0 0 20px rgba(0,212,255,.15)}}
        .mb:hover .ba{opacity:1!important;}
        .mbtn:hover{transform:scale(1.04);}
        .qc:hover{transform:translateY(-3px);background:rgba(0,212,255,.09)!important;border-color:rgba(0,212,255,.38)!important;}
        .chip:hover{background:rgba(0,212,255,.12)!important;color:#00d4ff!important;border-color:rgba(0,212,255,.35)!important;}
        .sbtn:hover:not(:disabled){transform:scale(1.07);box-shadow:0 0 28px var(--mc)44!important;}
        .hb:hover{background:rgba(0,212,255,.1)!important;color:#00d4ff!important;}
        .bab:hover{background:rgba(0,212,255,.15)!important;color:#00d4ff!important;}
        input,textarea{caret-color:#00d4ff;}
      `}</style>

      <BgCanvas/>
      <div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,212,255,.009) 2px,rgba(0,212,255,.009) 4px)"}}/>
      <div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",background:"radial-gradient(ellipse at center,transparent 35%,rgba(0,3,10,.7) 100%)"}}/>

      {/* ── HEADER ── */}
      <header style={{zIndex:10,padding:".65rem 1.3rem",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"1rem",borderBottom:"1px solid rgba(0,212,255,.1)",background:"rgba(0,4,12,.97)",backdropFilter:"blur(24px)",flexShrink:0,position:"relative",overflow:"hidden"}}>
        <HexDeco/>
        <div style={{display:"flex",alignItems:"center",gap:".85rem",zIndex:1}}>
          <Reactor active={loading} size={44} color={cm.color}/>
          <div>
            <div style={{fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:"clamp(.8rem,2.2vw,1.08rem)",letterSpacing:".2em",color:cm.color,transition:"color .4s",textShadow:`0 0 20px ${cm.color}66`}}>
              J.A.R.V.I.S. <span style={{background:`linear-gradient(90deg,${cm.color},#00ff88)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:".58em",letterSpacing:".18em"}}>OMEGA</span>
            </div>
            <div style={{fontSize:".58rem",color:"rgba(0,212,255,.4)",letterSpacing:".07em",textTransform:"uppercase",marginTop:1}}>Superintelligence · {cm.label} Mode · v6.0</div>
          </div>
        </div>

        <div style={{flex:1,display:"flex",justifyContent:"center",zIndex:1}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".67rem",color:cm.color,display:"flex",alignItems:"center",gap:".4rem",padding:".25rem .8rem",border:`1px solid ${cm.color}44`,borderRadius:20,background:"rgba(0,0,0,.35)",whiteSpace:"nowrap",maxWidth:340,overflow:"hidden",textOverflow:"ellipsis",transition:"color .4s,border-color .4s"}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:cm.color,display:"inline-block",animation:"blink 1.5s ease-in-out infinite",transition:"background .4s"}}/>
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{loading?(thinkTxt||"Processando..."):"Aguardando ordens, Senhor"}</span>
          </div>
        </div>

        <div style={{display:"flex",gap:".38rem",zIndex:1}}>
          {tokens>0&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".58rem",color:"rgba(0,212,255,.35)",padding:".25rem .6rem",border:"1px solid rgba(0,212,255,.1)",borderRadius:20,whiteSpace:"nowrap",display:"flex",alignItems:"center"}}>~{tokens.toLocaleString()} tkns</div>}
          <button className="hb" onClick={()=>setShowApi(true)} style={{fontFamily:"'Orbitron',monospace",fontSize:".52rem",letterSpacing:".08em",padding:"0 .75rem",height:30,borderRadius:6,border:"1px solid rgba(0,212,255,.18)",background:"rgba(0,212,255,.04)",color:"rgba(0,212,255,.55)",cursor:"pointer",whiteSpace:"nowrap",transition:"all .2s"}}>⚙ API KEY</button>
          {msgs.length>0&&<button className="hb" onClick={()=>{setMsgs([]);setTokens(0);showToast("✓ Conversa limpa");}} style={{width:30,height:30,borderRadius:6,border:"1px solid rgba(255,80,80,.25)",background:"rgba(255,50,50,.06)",color:"rgba(255,100,100,.65)",cursor:"pointer",fontSize:".8rem",transition:"all .2s"}}>✕</button>}
        </div>
      </header>

      {/* ── MODE BAR ── */}
      <div style={{zIndex:9,display:"flex",gap:".3rem",padding:".42rem 1.3rem",borderBottom:"1px solid rgba(0,212,255,.08)",background:"rgba(0,4,12,.93)",overflowX:"auto",flexShrink:0,scrollbarWidth:"none"}}>
        {MODES.map(m=>(
          <button key={m.id} className="mbtn"
            onClick={()=>setMode(m.id)} title={m.desc}
            style={{display:"flex",alignItems:"center",gap:".28rem",padding:".27rem .72rem",borderRadius:20,border:`1px solid ${mode===m.id?m.color:"rgba(0,212,255,.1)"}`,background:mode===m.id?`${m.color}18`:"transparent",color:mode===m.id?m.color:"rgba(0,212,255,.45)",fontFamily:"'Exo 2',sans-serif",fontSize:".72rem",fontWeight:600,cursor:"pointer",transition:"all .22s",whiteSpace:"nowrap",boxShadow:mode===m.id?`0 0 14px ${m.color}30`:"none",flexShrink:0}}>
            <span style={{fontSize:".88rem"}}>{m.icon}</span><span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* ── CHAT ── */}
      <main style={{flex:1,overflowY:"auto",padding:"1.1rem 1.3rem .6rem",zIndex:2}}>
        {msgs.length===0?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",minHeight:"66vh",justifyContent:"center",textAlign:"center",gap:"1.5rem",padding:"1rem",animation:"fadeUp .55s ease-out"}}>
            <Reactor active={false} size={92} color={cm.color}/>
            <div>
              <h1 style={{fontFamily:"'Orbitron',monospace",fontWeight:800,fontSize:"clamp(1.5rem,4vw,2.7rem)",lineHeight:1.2}}>
                <span style={{color:"rgba(0,212,255,.7)",display:"block",fontSize:".7em",letterSpacing:".05em",fontWeight:600,marginBottom:".2rem"}}>Pronto para servir,</span>
                <span style={{background:`linear-gradient(120deg,${cm.color} 0%,#00ffea 50%,#00ff88 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",transition:"background .5s"}}>Senhor.</span>
              </h1>
            </div>
            <p style={{color:"rgba(0,212,255,.45)",fontSize:".88rem",lineHeight:1.75,maxWidth:480}}>
              Selecione um modo e faça qualquer pergunta.<br/>
              {!apiKey&&<span>⚠ <span style={{color:"rgba(255,180,60,.9)",textDecoration:"underline",cursor:"pointer"}} onClick={()=>setShowApi(true)}>Configure sua API Key</span> para começar.</span>}
              {apiKey&&<span style={{color:"rgba(0,255,136,.6)"}}>✓ API Key ativa. Todos os sistemas operacionais.</span>}
            </p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(195px,1fr))",gap:".48rem",width:"100%",maxWidth:680}}>
              {QUICK.map((q,i)=>(
                <button key={i} className="qc" onClick={()=>send(q.text)}
                  style={{display:"flex",alignItems:"flex-start",gap:".55rem",padding:".75rem .95rem",background:"rgba(0,212,255,.04)",border:"1px solid rgba(0,212,255,.1)",borderRadius:9,cursor:"pointer",textAlign:"left",color:"rgba(0,212,255,.52)",fontFamily:"'Exo 2',sans-serif",fontSize:".8rem",lineHeight:1.5,transition:"all .22s",position:"relative",overflow:"hidden"}}>
                  <span style={{fontSize:"1.05rem",flexShrink:0,marginTop:1}}>{q.icon}</span>
                  <span style={{flex:1}}>{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:"1.1rem",maxWidth:900,margin:"0 auto"}}>
            {msgs.map((msg,i)=>{
              const mm=MODES.find(x=>x.id===msg.mode)||MODES[0];
              const isU=msg.role==="user";
              return (
                <div key={i} className="mb" style={{display:"flex",flexDirection:isU?"row-reverse":"row",alignItems:"flex-start",gap:".65rem",animation:"msgIn .3s ease-out"}}>
                  <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,border:`1px solid ${isU?"rgba(160,80,255,.45)":mm.color+"77"}`,background:isU?"rgba(45,8,88,.85)":"rgba(0,25,45,.9)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',monospace",fontSize:".6rem",color:isU?"#bb88ff":mm.color,marginTop:4,boxShadow:`0 0 10px ${isU?"rgba(160,80,255,.15)":mm.color+"22"}`}}>
                    {isU?"U":"J"}
                  </div>
                  <div style={{maxWidth:"min(84%,700px)",padding:".88rem 1.15rem",borderRadius:isU?"10px 2px 10px 10px":"2px 10px 10px 10px",fontSize:".9rem",lineHeight:1.75,position:"relative",background:isU?"rgba(35,5,75,.65)":"rgba(0,15,30,.82)",border:isU?"1px solid rgba(150,80,255,.18)":`1px solid ${mm.color}28`,color:isU?"rgba(218,178,255,.95)":"rgba(0,212,255,.9)",backdropFilter:"blur(10px)",borderLeft:!isU?`2px solid ${mm.color}`:undefined,transition:"border-color .3s"}}>
                    {!isU&&<div style={{fontFamily:"'Orbitron',monospace",fontSize:".52rem",letterSpacing:".12em",textTransform:"uppercase",marginBottom:".5rem",color:mm.color,opacity:.85}}>{mm.icon} {mm.label}</div>}
                    <div dangerouslySetInnerHTML={{__html:renderMd(msg.content)}}/>
                    {!isU&&(
                      <div className="ba" style={{display:"flex",gap:".35rem",marginTop:".6rem",opacity:0,transition:"opacity .2s"}}>
                        {[["⎘ Copiar",()=>{navigator.clipboard?.writeText(msg.content);showToast("✓ Copiado!");}],["🔊 Ouvir",()=>{if(window.speechSynthesis){const u=new SpeechSynthesisUtterance(msg.content.replace(/[#*`_>]/g,""));u.lang="pt-BR";u.rate=.93;window.speechSynthesis.cancel();window.speechSynthesis.speak(u);showToast("🔊 Reproduzindo…");}}]].map(([l,fn])=>(
                          <button key={l} className="bab" onClick={fn} style={{background:"rgba(0,212,255,.07)",border:"1px solid rgba(0,212,255,.14)",borderRadius:4,color:"rgba(0,212,255,.5)",fontFamily:"monospace",fontSize:".62rem",padding:".18rem .5rem",cursor:"pointer",transition:"all .2s"}}>{l}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {loading&&(
              <div style={{display:"flex",alignItems:"flex-start",gap:".65rem",animation:"msgIn .3s ease-out"}}>
                <div style={{width:30,height:30,borderRadius:"50%",border:`1px solid ${cm.color}77`,background:"rgba(0,25,45,.9)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Orbitron',monospace",fontSize:".6rem",color:cm.color,flexShrink:0,marginTop:4}}>J</div>
                <div style={{padding:".88rem 1.15rem",borderRadius:"2px 10px 10px 10px",background:"rgba(0,15,30,.82)",border:`1px solid ${cm.color}28`,borderLeft:`2px solid ${cm.color}`,display:"flex",alignItems:"center",gap:".8rem",backdropFilter:"blur(10px)"}}>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:".68rem",color:cm.color,animation:"thPulse 2s ease-in-out infinite",letterSpacing:".04em"}}>{thinkTxt}</span>
                  <div style={{display:"flex",gap:4}}>
                    {[0,1,2,3,4].map(i=><span key={i} style={{width:5,height:5,borderRadius:"50%",background:cm.color,animation:`tdot 1.1s ease-in-out infinite`,animationDelay:`${i*.12}s`,display:"inline-block"}}/>)}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>
        )}
      </main>

      {/* ── INPUT ── */}
      <div style={{zIndex:10,padding:".58rem 1.3rem .5rem",borderTop:"1px solid rgba(0,212,255,.09)",background:"rgba(0,4,12,.99)",backdropFilter:"blur(24px)",flexShrink:0}}>
        <div style={{display:"flex",gap:".3rem",flexWrap:"wrap",marginBottom:".48rem"}}>
          {[{i:"⚡",l:"Resumir",p:"Resuma de forma clara e objetiva: "},{i:"🔍",l:"Analisar",p:"Faça uma análise profunda de: "},{i:"🐛",l:"Debugar",p:"Encontre e corrija os bugs: "},{i:"✏️",l:"Melhorar",p:"Melhore e otimize o seguinte: "},{i:"💬",l:"Explicar",p:"Explique de forma simples: "}].map(c=>(
            <button key={c.l} className="chip" onClick={()=>{setInp(c.p);setTimeout(()=>inpRef.current?.focus(),50);}}
              style={{fontFamily:"'Exo 2',sans-serif",fontSize:".68rem",fontWeight:600,padding:".2rem .62rem",background:"rgba(0,212,255,.04)",border:"1px solid rgba(0,212,255,.11)",borderRadius:20,color:"rgba(0,212,255,.38)",cursor:"pointer",transition:"all .18s",whiteSpace:"nowrap"}}>
              {c.i} {c.l}
            </button>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"flex-end",gap:".45rem",background:"rgba(0,15,30,.85)",border:`1px solid ${loading?cm.color+"55":"rgba(0,212,255,.2)"}`,borderRadius:11,padding:".48rem .5rem .48rem .9rem",transition:"border-color .3s, box-shadow .3s",boxShadow:loading?`0 0 24px ${cm.color}14`:"none",position:"relative"}}>
          <div style={{position:"absolute",top:-10,left:13,fontFamily:"'Orbitron',monospace",fontSize:".5rem",letterSpacing:".14em",background:"#00070f",padding:"0 .42rem",border:`1px solid ${cm.color}`,borderRadius:2,color:cm.color,opacity:.9,transition:"color .4s,border-color .4s",pointerEvents:"none"}}>
            {cm.icon} {cm.id}
          </div>
          <textarea ref={inpRef} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={onKey}
            onInput={e=>{e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,180)+"px";}}
            placeholder="Digite sua solicitação… (Enter envia · Shift+Enter = nova linha)"
            disabled={loading} rows={1}
            style={{flex:1,background:"transparent",border:"none",outline:"none",color:"rgba(0,212,255,.92)",fontFamily:"'Exo 2',sans-serif",fontSize:".9rem",fontWeight:400,resize:"none",minHeight:36,maxHeight:180,lineHeight:1.6,paddingTop:1}}/>
          <button className="sbtn" style={{"--mc":cm.color}} onClick={()=>send()} disabled={loading||!inp.trim()}
            style={{width:38,height:38,borderRadius:8,border:`1px solid ${cm.color}`,background:`linear-gradient(135deg,rgba(0,45,75,.85),rgba(0,75,120,.85))`,color:cm.color,fontSize:".95rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .22s",opacity:loading||!inp.trim()?.35:1,flexShrink:0}}>
            {loading?<span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>↻</span>:"▶"}
          </button>
        </div>

        <div style={{display:"flex",gap:".7rem",flexWrap:"wrap",marginTop:".35rem",fontFamily:"'Share Tech Mono',monospace",fontSize:".55rem",color:"rgba(0,212,255,.28)",letterSpacing:".05em",paddingLeft:".1rem"}}>
          <span style={{color:"#00ff88",opacity:.9}}>● SISTEMA ATIVO</span>
          <span style={{color:cm.color,transition:"color .4s"}}>◈ {cm.id}</span>
          <span>◌ {msgs.length} msgs</span>
          <span>◌ ~{tokens.toLocaleString()} tokens</span>
          <span style={{marginLeft:"auto",opacity:.35}}>J.A.R.V.I.S. OMEGA v6.0 · {apiKey?<span style={{color:"rgba(0,255,136,.7)"}}>✓ KEY</span>:<span style={{color:"rgba(255,150,50,.7)"}}>NO KEY</span>}</span>
        </div>
      </div>

      {showApi&&<ApiModal cur={apiKey} onSave={saveKey} onClose={()=>setShowApi(false)}/>}
      <Toast msg={toast}/>
    </div>
  );
}
