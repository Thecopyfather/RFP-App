import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BadgeDollarSign, BookOpen, Check, ChevronRight, CircleHelp, Dice5, Download, Flag, Lightbulb, Menu, Monitor, RotateCcw, Settings2, Shield, Sparkles, TrendingUp, Users, Wallet, X, Zap } from 'lucide-react';
import { registerSW } from 'virtual:pwa-register';
import { GAME, HOW_TO_PLAY_PARAGRAPHS, INTRO_PARAGRAPHS } from './content/game';
import { ILLUSTRATIONS } from './content/illustrations';
import { applyCommand, createInitialState, createSecureId, getAvailableChoices, getMentorAction, getStartingCapital, getStats, getVisibleParagraphs, loadSave, SAVE_KEY, serializeSave } from './engine';
import { STAT_KEYS, type CommandInput, type CreationStep, type GameState, type Mentor, type StatKey } from './engine/types';

const money = (value:number) => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
const statIcons = {CR:Lightbulb,TA:TrendingUp,RE:Shield,NE:Users,TS:Monitor};
type Overlay = 'help'|'settings'|'sheet'|'restart'|'mentor'|null;
type Preferences = {textSize:'standard'|'large'; reduceMotion:boolean};
const PREFS_KEY = 'roll-for-profit:preferences:v1';

function initialSession() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return {state:null,error:null,raw:null};
    const loaded = loadSave(raw,GAME);
    return loaded.ok ? {state:loaded.state,error:null,raw} : {state:null,error:loaded.error,raw};
  } catch { return {state:null,error:'Browser storage is unavailable. Your progress will stay in this tab until it is closed.',raw:null}; }
}
function readPreferences():Preferences {
  try { const p=JSON.parse(localStorage.getItem(PREFS_KEY)||'{}'); return {textSize:p.textSize==='large'?'large':'standard',reduceMotion:p.reduceMotion===true}; }
  catch { return {textSize:'standard',reduceMotion:false}; }
}

function Die({value=5,small=false,label}:{value?:number;small?:boolean;label?:string}) {
  const positions:Record<number,number[]>={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
  return <span className={`die ${small?'die-small':''}`} role="img" aria-label={label||`Die showing ${value}`}>
    {Array.from({length:9},(_,i)=><span key={i} className={(positions[value]||[]).includes(i)?'pip filled':'pip'}/>)}
  </span>;
}

function Brand({onClick}:{onClick:()=>void}) {
  return <button className="brand" onClick={onClick} aria-label="Roll For Profit — main menu"><span className="brand-die"><Dice5 size={25} strokeWidth={1.7}/></span><span>ROLL <em>FOR</em> PROFIT<span className="brand-dot">®</span></span></button>;
}

function Modal({title,children,onClose,wide=false}:{title:string;children:ReactNode;onClose:()=>void;wide?:boolean}) {
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null;
    const original=document.body.style.overflow;
    document.body.style.overflow='hidden';
    ref.current?.focus();
    const handler=(e:KeyboardEvent)=>{
      if(e.key==='Escape')onClose();
      if(e.key==='Tab'){
        const items=ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, select, [tabindex="0"]');
        if(!items?.length)return;
        const first=items[0],last=items[items.length-1];
        if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    };
    document.addEventListener('keydown',handler);
    return ()=>{document.body.style.overflow=original;document.removeEventListener('keydown',handler);previous?.focus();};
  },[onClose]);
  return <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <motion.div role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabIndex={-1} ref={ref} className={`modal ${wide?'modal-wide':''}`} initial={{y:24,opacity:0}} animate={{y:0,opacity:1}} exit={{y:16,opacity:0}}>
      <div className="modal-header"><h2 id="dialog-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={21}/></button></div>{children}
    </motion.div>
  </motion.div>;
}

function ScenePanel({variant='office',compact=false}:{variant?:string;compact?:boolean}) {
  const spec=ILLUSTRATIONS[variant];
  return <div className={`scene-panel scene-${variant} ${compact?'scene-compact':''}`} aria-label={spec?.alt||'Scene illustration placeholder'}>
    <div className="scene-sun"/>
    <div className="scene-lines"/>
    <div className="scene-paper"><span>THE NEXT<br/>BIG THING.</span><div className="paper-rule"/><span className="paper-small">IDEAS → ACTION</span><TrendingUp size={58} strokeWidth={1}/></div>
    <div className="scene-dice"><Die value={5}/><Die value={3}/></div>
    <div className="scene-caption"><span className="tiny-dot"/> SCENE ILLUSTRATION · PLACEHOLDER</div>
  </div>;
}

function StatsDisplay({state,compact=false}:{state:GameState;compact?:boolean}) {
  const stats=getStats(GAME,state);
  return <div className={`stats-grid ${compact?'stats-compact':''}`}>
    {GAME.attributes.map(attr=>{const Icon=statIcons[attr.key];return <div className="stat" key={attr.key}><Icon size={16} strokeWidth={1.6}/><span className="stat-key">{attr.key}</span><strong>{state.rolled.includes(attr.key)?stats[attr.key]:'—'}</strong><span className="stat-name">{attr.name}</span></div>;})}
  </div>;
}

function MentorMark({mentor,size='normal'}:{mentor:Mentor;size?:'normal'|'small'}) {
  const Icon=mentor.id==='bootstrapper'?Shield:mentor.id==='hustler'?Zap:Users;
  return <span className={`mentor-mark mark-${mentor.id} ${size==='small'?'mark-small':''}`}><Icon size={size==='small'?22:35} strokeWidth={1.3}/></span>;
}

export default function App() {
  const [session]=useState(initialSession);
  const [game,setGame]=useState<GameState|null>(session.state);
  const gameRef=useRef(game);
  const [view,setView]=useState<'menu'|'intro'|'game'>('menu');
  const [overlay,setOverlay]=useState<Overlay>(null);
  const [preferences,setPreferences]=useState(readPreferences);
  const [saveError,setSaveError]=useState<string|null>(session.error);
  const [toast,setToast]=useState<string|null>(null);
  const [isRolling,setIsRolling]=useState(false);
  const [updateReady,setUpdateReady]=useState(false);
  const [refreshApp,setRefreshApp]=useState<null|(()=>void)>(null);
  const titleRef=useRef<HTMLHeadingElement>(null);
  const focusTitle=useCallback((node:HTMLHeadingElement|null)=>{titleRef.current=node;node?.focus({preventScroll:true});},[]);
  const systemReduced=useReducedMotion();
  const reducedMotion=preferences.reduceMotion||!!systemReduced;
  const scene=game?GAME.scenes[game.sectionId]:null;
  const mentor=GAME.mentors.find(m=>m.id===game?.mentorId);
  const perk=GAME.perks.find(p=>p.id===game?.perkId);

  useEffect(()=>{
    const update=registerSW({onNeedRefresh(){setUpdateReady(true);},onRegisterError(){/* Offline support is optional when the preview origin cannot register a worker. */}});
    setRefreshApp(()=>()=>{void update(true);});
  },[]);
  useEffect(()=>{
    if(!toast)return;
    const timeout=setTimeout(()=>setToast(null),4500);
    return ()=>clearTimeout(timeout);
  },[toast]);
  useEffect(()=>{
    if(game?.phase!=='roll-result'){setIsRolling(false);return;}
    setIsRolling(true);
    const timeout=setTimeout(()=>setIsRolling(false),reducedMotion?0:850);
    return ()=>clearTimeout(timeout);
  },[game?.pendingRoll?.id,game?.pendingRoll?.power,reducedMotion,game?.phase]);
  useEffect(()=>{
    window.scrollTo({top:0,behavior:'instant'});
    titleRef.current?.focus({preventScroll:true});
  },[view,game?.sectionId,game?.creationStep,game?.phase]);
  useEffect(()=>{
    const handler=(e:StorageEvent)=>{
      if(e.key===SAVE_KEY&&e.newValue){const next=loadSave(e.newValue,GAME);if(next.ok){gameRef.current=next.state;setGame(next.state);setToast('Your progress was updated in another tab.');}}
    };
    window.addEventListener('storage',handler);return ()=>window.removeEventListener('storage',handler);
  },[]);

  function persist(next:GameState){
    gameRef.current=next;setGame(next);
    try{localStorage.setItem(SAVE_KEY,serializeSave(next,GAME));setSaveError(null);}
    catch{setSaveError('Your browser could not save this change. Keep this tab open to retain your current progress.');}
  }
  function send(command:CommandInput){
    const current=gameRef.current;if(!current)return;
    try {
      const next=applyCommand(GAME,current,{...command,id:createSecureId()});
      persist(next);
      if(next.lastOutcome&&next.lastOutcome!==current.lastOutcome){
        const changes=[next.lastOutcome.capitalChange?`${next.lastOutcome.capitalChange>0?'+':'−'}${money(Math.abs(next.lastOutcome.capitalChange))} Capital`:'',...Object.entries(next.lastOutcome.statChanges).filter(([,v])=>v).map(([key,value])=>`${value!>0?'+':''}${value} ${key}`)].filter(Boolean);
        if(changes.length)setToast(changes.join(' · '));
      }
    }catch(error){setToast(error instanceof Error?error.message:'That action could not be completed. Your progress is unchanged.');}
  }
  function startNew(){persist(createInitialState(GAME));setOverlay(null);setView('intro');}
  function requestNew(){if(game||session.raw)setOverlay('restart');else startNew();}
  function changePreferences(next:Preferences){setPreferences(next);try{localStorage.setItem(PREFS_KEY,JSON.stringify(next));}catch{setToast('Reading preferences could not be saved on this browser.');}}
  function downloadSave(){
    let raw=session.raw||'';
    try{raw=localStorage.getItem(SAVE_KEY)??raw;}catch{/* Preserve the initial recovery copy when storage cannot be read. */}
    const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='roll-for-profit-save.json';a.click();URL.revokeObjectURL(url);
  }
  const closeOverlay=useCallback(()=>setOverlay(null),[]);

  const actionButton=(label:string,onClick:()=>void,disabled=false,secondary=false)=><button className={`button ${secondary?'button-secondary':'button-primary'}`} onClick={onClick} disabled={disabled}>{label}<ArrowRight size={18}/></button>;

  function renderMenu(){return <main className="menu-main">
    <div className="menu-hero">
      <section className="hero-copy">
        <div className="eyebrow"><span className="status-dot"/> A BUSINESS ADVENTURE. YOUR BUSINESS ADVENTURE.</div>
        <h1 className="hero-title" ref={focusTitle} tabIndex={-1}>ROLL<br/><span className="title-for">FOR</span> <span className="title-profit">PROFIT<span className="title-period">.</span></span></h1>
        <div className="hero-subtitle"><span className="short-rule"/> THE STARTUP PHASE <span className="edition">VOL. 01</span></div>
        <p className="hero-description">Your ideas. Your decisions. Your first <em>$10,000.</em><br/>An entrepreneurial adventure where every choice counts.</p>
        <div className="menu-actions">{actionButton('New Game',requestNew)}{game&&actionButton('Continue Game',()=>setView('game'),false,true)}</div>
        {game&&<p className="save-hint"><span className="status-dot"/>{game.name||'Your entrepreneur'} · {game.phase==='creation'?'Character in progress':game.phase==='boundary'?`Saved at prototype boundary ${game.boundary?.target}`:`Section ${game.sectionId}`} · {saveError?'In this tab · not saved':'Saved on this device'}</p>}
        <button className="text-link" onClick={()=>setOverlay('help')}><BookOpen size={17}/> How to Play <ArrowUpRight size={15}/></button>
      </section>
      <section className="hero-poster" aria-label="The Startup Phase cover artwork placeholder">
        <div className="poster-top"><span>AN ADVENTURE BY<br/><strong>MARK KINGTON</strong></span><span className="poster-volume">01</span></div>
        <div className="poster-statement">BIG IDEAS.<br/>BOLD MOVES.<br/><span>YOUR CALL.</span></div>
        <ScenePanel variant="office"/>
        <div className="poster-bottom"><span>FROM FIRST IDEA<br/>TO FIRST <strong>$10K.</strong></span><span className="round-arrow"><ArrowUpRight size={28}/></span></div>
        <span className="poster-sticker"><Sparkles size={15}/> ROLL. RISK. REPEAT.</span>
      </section>
    </div>
    <div className="menu-details"><div><span className="detail-number">01</span><div><h3>Build your character</h3><p>Five attributes. One unfair advantage.</p></div></div><div><span className="detail-number">02</span><div><h3>Choose your path</h3><p>Your next move changes the story.</p></div></div><div><span className="detail-number">03</span><div><h3>Let the dice decide</h3><p>A little strategy. A little good fortune.</p></div></div></div>
    <footer className="site-footer"><span>© 2026 MARK KINGTON</span><span>THE STARTUP PHASE <i/> PLAYABLE PROTOTYPE</span><button onClick={()=>setOverlay('settings')}>MAKE YOURSELF COMFORTABLE <Settings2 size={14}/></button></footer>
  </main>;}

  function renderIntro(){return <main className="intro-main"><button className="back-link" onClick={()=>setView('menu')}><ArrowLeft size={16}/> Main menu</button><div className="eyebrow">BEFORE THE FIRST ROLL</div><h1 ref={focusTitle} tabIndex={-1}>Your journey<br/><em>begins.</em></h1><div className="intro-layout"><div className="narrative">{INTRO_PARAGRAPHS.map((p,i)=><p key={i}>{p}</p>)}</div><aside className="intro-aside"><span className="eyebrow">A NOTE TO YOUR FUTURE SELF</span><blockquote>“Your choices matter.”</blockquote><p>Mark “The Copy Father” Kington</p><Die value={1}/></aside></div><div className="intro-action">{actionButton('Create Your Entrepreneur',()=>setView('game'))}</div></main>;}

  function renderCreation(){if(!game)return null;const step=game.creationStep;const steps:CreationStep[]=['attributes','perk','mentor','summary'];const current=steps.indexOf(step);const ready=game.rolled.length===5;
    return <main className="creation-main"><div className="page-kicker"><span>YOUR ENTREPRENEUR</span><span>CHARACTER CREATION <i/> {current+1} OF 4</span></div><div className="creation-heading"><div><h1 ref={focusTitle} tabIndex={-1}>{step==='attributes'?'Every great story starts with you.':step==='perk'?'Find your unfair advantage.':step==='mentor'?'Nobody builds alone.':'Meet your entrepreneur.'}</h1><p>{step==='attributes'?'Roll 1d6 for each attribute. These are the strengths you’ll bring to the business world.':step==='perk'?'Choose one original bonus perk to shape your approach.':step==='mentor'?'Choose the mentor who fits the way you want to build.':'Your strengths, your edge, your mentor. Let’s get to work.'}</p></div><span className="chapter-badge">0{current+1}<span>THE SETUP</span></span></div>
    <nav className="creation-steps" aria-label="Character creation progress">{steps.map((s,i)=><button key={s} className={`${s===step?'active':''} ${i<current?'completed':''}`} onClick={()=>send({type:'SET_CREATION_STEP',step:s})} disabled={i>current} aria-current={s===step?'step':undefined}><span>{i<current?<Check size={14}/>:String(i+1).padStart(2,'0')}</span>{s==='attributes'?'Your attributes':s==='perk'?'Bonus perk':s==='mentor'?'Your mentor':'Ready to roll'}</button>)}</nav>
    {step==='attributes'&&<section className="attribute-section"><div className="name-field"><label htmlFor="entrepreneur-name">WHAT SHOULD WE CALL YOU? <span>OPTIONAL</span></label><input id="entrepreneur-name" value={game.name} maxLength={60} placeholder="Your entrepreneur name" onChange={e=>send({type:'SET_NAME',name:e.target.value})} autoComplete="given-name"/></div><div className="attribute-cards">{GAME.attributes.map(attr=>{const Icon=statIcons[attr.key];const rolled=game.rolled.includes(attr.key);return <article className={`attribute-card ${rolled?'has-roll':''}`} key={attr.key}><div className="attribute-top"><span className="attribute-icon"><Icon size={22} strokeWidth={1.5}/></span><span>{attr.key}</span></div><h2>{attr.name}</h2><p>{attr.description}</p><div className="attribute-roll"><span className="attribute-value">{rolled?game.baseStats[attr.key]:'?'}</span>{rolled?<Die value={game.baseStats[attr.key]} small/>:<button aria-label={`Roll ${attr.name}`} className="small-roll" onClick={()=>send({type:'ROLL_ATTRIBUTE',stat:attr.key})}><Dice5 size={18}/> Roll 1d6</button>}</div></article>;})}</div><div className="creation-bottom"><p><Dice5 size={17}/>{ready?'Your starting rolls are set. Let’s find your edge.':'Every entrepreneur has strengths and weaknesses.'}</p><div>{!ready&&actionButton('Roll All Attributes',()=>send({type:'ROLL_ALL_ATTRIBUTES'}))}{ready&&actionButton('Continue',()=>send({type:'SET_CREATION_STEP',step:'perk'}))}</div></div></section>}
    {step==='perk'&&<section><div className="perk-grid">{GAME.perks.map((p,i)=><button className={`perk-card ${game.perkId===p.id?'selected':''}`} key={p.id} onClick={()=>send({type:'SELECT_PERK',perkId:p.id})} aria-pressed={game.perkId===p.id} aria-label={`Select ${p.name}`}><span className="selection-top"><span className="perk-number">0{i+1}</span><span className="selection-radio">{game.perkId===p.id&&<Check size={13}/>}</span></span><h2>{p.name}</h2><p>{p.description}</p><span className="perk-bonus">{p.capital?`+${money(p.capital)} CAPITAL · −2 RE`:Object.entries(p.stats).map(([s,v])=>`+${v} ${s}`).join(' · ')}</span></button>)}</div><div className="creation-bottom"><button className="back-link" onClick={()=>send({type:'SET_CREATION_STEP',step:'attributes'})}><ArrowLeft size={16}/> Attributes</button>{actionButton('Continue',()=>send({type:'SET_CREATION_STEP',step:'mentor'}),!game.perkId)}</div></section>}
    {step==='mentor'&&<section><div className="mentor-grid">{GAME.mentors.map(m=><button key={m.id} className={`mentor-card ${game.mentorId===m.id?'selected':''}`} aria-label={`Select ${m.name}`} aria-pressed={game.mentorId===m.id} onClick={()=>send({type:'SELECT_MENTOR',mentorId:m.id})}><div className="mentor-card-top"><MentorMark mentor={m}/><span className="selection-radio">{game.mentorId===m.id&&<Check size={13}/>}</span></div><span className="eyebrow">{m.tagline}</span><h2>{m.name}</h2><blockquote>“{m.quote.replace(/^["“]|["”]$/g,'')}”</blockquote><div className="mentor-ability"><span>PASSIVE · {m.passive.name}</span><p>{m.passive.text}</p></div><div className="mentor-ability"><span>ONCE PER ACT · {m.power.name}</span><p>{m.power.text}</p></div></button>)}</div><div className="creation-bottom"><button className="back-link" onClick={()=>send({type:'SET_CREATION_STEP',step:'perk'})}><ArrowLeft size={16}/> Bonus perk</button>{actionButton('Continue',()=>send({type:'SET_CREATION_STEP',step:'summary'}),!game.mentorId)}</div></section>}
    {step==='summary'&&<section className="summary-layout"><div className="summary-card"><div className="summary-person"><span className="avatar">{(game.name||'You').slice(0,1).toUpperCase()}</span><div><span className="eyebrow">THE NEXT CHAPTER IS YOURS</span><h2>{game.name||'The entrepreneur'}</h2><p>Act 1 · The Struggling Startup</p></div></div><StatsDisplay state={game}/><div className="summary-capital"><span>STARTING CAPITAL</span><strong>{money(getStartingCapital(GAME,game))}</strong><span>GOAL <ArrowRight size={14}/> $10,000</span></div><div className="summary-perk"><Sparkles size={20}/><div><span className="eyebrow">YOUR BONUS PERK</span><strong>{perk?.name}</strong><p>{perk?.description}</p></div></div></div><aside className="summary-aside">{mentor&&<><MentorMark mentor={mentor}/><span className="eyebrow">IN YOUR CORNER</span><h2>{mentor.name}</h2><p>{mentor.passive.text}</p></>}<div className="summary-callout"><Flag size={19}/><p>Your goal is to grow your business, survive setbacks, and reach your first $10k success.</p></div>{actionButton('Start Adventure',()=>send({type:'START_ADVENTURE'}))}<button className="back-link" onClick={()=>send({type:'SET_CREATION_STEP',step:'mentor'})}><ArrowLeft size={16}/> Review mentor</button></aside></section>}
    </main>;
  }

  function renderCharacterAside(){if(!game)return null;return <aside className="character-aside"><div className="aside-top"><span className="eyebrow">YOUR ENTREPRENEUR</span><span className="tiny-dot"/></div><div className="aside-person"><span className="avatar avatar-small">{(game.name||'You').slice(0,1).toUpperCase()}</span><div><strong>{game.name||'The entrepreneur'}</strong><span>THE STARTUP PHASE</span></div></div><div className="capital-display"><span><Wallet size={15}/> CAPITAL</span><strong>{money(game.capital)}</strong><div className="capital-track"><span style={{width:`${Math.min(100,Math.max(0,game.capital/GAME.winCapital*100))}%`}}/></div><div className="capital-label"><span>YOUR NEXT BIG MILESTONE</span><span>$10,000</span></div></div><StatsDisplay state={game} compact/>{mentor&&<button className="aside-mentor" onClick={()=>setOverlay('mentor')}><MentorMark mentor={mentor} size="small"/><span><small>YOUR MENTOR</small><strong>{mentor.name}</strong><small>{game.powerUsed?'POWER USED THIS ACT':'ONCE-PER-ACT POWER AVAILABLE'}</small></span><ChevronRight size={15}/></button>}<button className="sheet-link" onClick={()=>setOverlay('sheet')}>Character Sheet <ArrowUpRight size={16}/></button><div className="aside-note"><BookOpen size={20}/><p>“Every decision, every dice roll, and every risk you take will shape your journey.”</p></div></aside>;}

  function renderRoll(){if(!game?.pendingRoll||!scene?.check)return null;const roll=game.pendingRoll;const outcome=scene.check.outcomes[roll.outcomeIndex];const power=getMentorAction(GAME,game);const attr=GAME.attributes.find(a=>a.key===roll.stat)!;
    return <section className="roll-card"><div className="eyebrow"><Dice5 size={15}/> THE MOMENT OF TRUTH</div><h2>{isRolling?'A little luck goes a long way.':'The dice have spoken.'}</h2><div className={`dice-pair ${isRolling?'is-rolling':''}`} aria-busy={isRolling}><Die value={roll.dice[0]} label={`First die: ${roll.dice[0]}`}/><Die value={roll.dice[1]} label={`Second die: ${roll.dice[1]}`}/></div><div className="roll-equation" aria-label={`Roll total ${roll.total}`}><span>{roll.dice[0]} + {roll.dice[1]}</span><span className="modifier-chip">{roll.modifier<0?'−':'+'} {Math.abs(roll.modifier)} {roll.stat}</span><span>=</span><strong>{roll.total}</strong></div><p className="roll-stat-note">2d6 + {attr.name} · Includes your perk and mentor bonuses</p>{roll.previousDice&&<p className="roll-stat-note">Shoestring Miracle reroll · Original dice: {roll.previousDice.join(' + ')}</p>}<div className={`outcome outcome-${outcome.rank}`} aria-live="polite">{!isRolling&&<><span className="eyebrow">{roll.power==='neutral-result'?'MENTOR INTERVENTION':outcome.rank==='success'?'A STRONG RESULT':outcome.rank==='mixed'?'A MIXED RESULT':'A SETBACK'}</span><p>{outcome.label}</p>{roll.power&&<small>{mentor?.power.name} applied. {roll.power==='neutral-result'?'No Capital or attribute changes for this event.':roll.power==='reroll-loss'?'Capital loss is protected on this reroll.':'Capital loss is halved, rounded up to the nearest $100.'}</small>}</>}</div>{power&&!isRolling&&<div className="mentor-offer"><span className="eyebrow">YOUR MENTOR CAN HELP</span><p>{power.description}</p><button className="button button-secondary" onClick={()=>send({type:'USE_MENTOR'})}>Use {power.name}<Sparkles size={16}/></button><small>Optional · Once per act</small></div>}{actionButton('Continue Adventure',()=>send({type:'CONFIRM_ROLL'}),isRolling)}<p className="saved-roll"><Check size={13}/> Your roll is saved. Coming back won’t change it.</p></section>;
  }

  function renderAdventure(){if(!game||!scene)return null;const choices=getAvailableChoices(GAME,game);const paragraphs=getVisibleParagraphs(GAME,game);const isOver=game.phase==='game-over';const isWin=game.phase==='victory';
    return <main className="adventure-main"><div className="page-kicker"><button onClick={()=>setView('menu')}><ArrowLeft size={14}/> MY ADVENTURE</button><span>ACT 01 <i/> SECTION {game.sectionId.padStart(3,'0')}</span></div><div className="mobile-capital"><span><Wallet size={15}/> {money(game.capital)}</span><button onClick={()=>setOverlay('sheet')}>Character Sheet <ArrowUpRight size={14}/></button></div><div className="adventure-layout"><article className="story"><div className="story-chapter"><span className="eyebrow">{isOver?'THE END OF THIS RUN':isWin?'YOUR FIRST $10K':'ACT 1 · THE STRUGGLING STARTUP'}</span><span className="story-section">{game.sectionId.padStart(2,'0')}</span></div><h1 ref={focusTitle} tabIndex={-1}>{scene.heading}</h1>{game.phase!=='roll-result'&&<ScenePanel variant={scene.illustration} compact/>}<div className="narrative">{paragraphs.map((p,i)=><p key={`${game.sectionId}-${i}`}>{p}</p>)}</div>{game.phase==='roll-result'?renderRoll():isOver||isWin?<section className="ending-card"><Flag size={25}/><h2>{isWin?'Your first $10,000.':'Every ending is a beginning.'}</h2>{isOver&&<p>{HOW_TO_PLAY_PARAGRAPHS.find(p=>p.toLowerCase().includes('falls to zero'))||'If your Capital falls to zero, your business collapses. Your story ends, and you’ll need to return to the beginning to try again.'}</p>}<div className="ending-summary"><span>FINAL CAPITAL <strong>{money(game.capital)}</strong></span><span>SECTIONS VISITED <strong>{game.visit}</strong></span></div><StatsDisplay state={game}/>{actionButton('Restart Adventure',()=>setOverlay('restart'))}<button className="text-link" onClick={()=>setOverlay('sheet')}>View final character sheet <ArrowUpRight size={15}/></button></section>:<section className="decisions"><div className="decision-heading"><span className="eyebrow">{scene.check?'TAKE A CHANCE':'YOUR NEXT MOVE'}</span><span>{scene.check?'2D6 + '+scene.check.stat:'THE CHOICE IS YOURS'}</span></div>{scene.check?<><p className="check-intro">{scene.check.intro}</p>{actionButton('Roll Dice',()=>send({type:'ROLL_CHECK'}))}<div className="roll-bands">{scene.check.outcomes.map((o,i)=><span key={i}><strong>{o.min&&o.max?`${o.min}–${o.max}`:o.min?`${o.min}+`:`≤${o.max}`}</strong> {o.rank==='success'?'Success':o.rank==='mixed'?'Mixed':'Setback'}</span>)}</div></>:choices.map((choice,i)=><button className="choice-button" key={choice.id} onClick={()=>send({type:'CHOOSE',choiceId:choice.id})}><span className="choice-number">{String(i+1).padStart(2,'0')}</span><span>{choice.label}</span><ArrowUpRight size={20}/></button>)}</section>}<div className="story-colophon"><span>ROLL FOR PROFIT</span><span>AN ADVENTURE BY MARK KINGTON</span></div></article>{renderCharacterAside()}</div></main>;
  }

  function renderBoundary(){if(!game?.boundary)return null;return <main className="boundary-main"><span className="eyebrow"><Flag size={15}/> PLAYABLE PROTOTYPE</span><span className="boundary-number">TO BE<br/><em>CONTINUED.</em></span><h1 ref={focusTitle} tabIndex={-1}>There’s more to your story.</h1><p>You chose:</p><blockquote>{game.boundary.label}</blockquote><div className="boundary-destination"><BookOpen size={20}/><span>The original story continues at <strong>section {game.boundary.target}</strong>.<br/>That section is beyond this prototype’s playable chapters.</span></div><div className="boundary-summary"><span>YOUR CAPITAL<strong>{money(game.capital)}</strong></span><span>YOUR MENTOR<strong>{mentor?.name}</strong></span></div><p className="boundary-note"><Check size={15}/> Your progress and this destination are saved on this device.</p><div className="boundary-actions">{actionButton('Return to Menu',()=>setView('menu'))}{actionButton('Character Sheet',()=>setOverlay('sheet'),false,true)}</div><button className="text-link" onClick={()=>setOverlay('restart')}><RotateCcw size={15}/> Explore a different path with a new character</button></main>;}

  function renderSheet(){if(!game)return null;const stats=getStats(GAME,game);return <><div className="sheet-person"><span className="avatar">{(game.name||'You').slice(0,1).toUpperCase()}</span><div><span className="eyebrow">ENTREPRENEUR</span><h3>{game.name||'The entrepreneur'}</h3><p>Act 1 · Section {game.sectionId}</p></div></div><div className="sheet-capital"><span>CAPITAL <strong>{money(game.capital)}</strong></span><span>YOUR GOAL <strong>$10,000</strong></span></div><div className="sheet-stats">{GAME.attributes.map(a=><div key={a.key}><strong>{a.key}</strong><span>{a.name}<small>Rolled {game.baseStats[a.key]}{perk?.stats[a.key]?` · Perk ${perk.stats[a.key]!>0?'+':''}${perk.stats[a.key]}`:''}{mentor?.passive.stats[a.key]?` · Mentor +${mentor.passive.stats[a.key]}`:''}{game.statChanges[a.key]?` · Adventure ${game.statChanges[a.key]>0?'+':''}${game.statChanges[a.key]}`:''}</small></span><b>{game.rolled.includes(a.key)?stats[a.key]:'—'}</b></div>)}</div>{perk&&<div className="sheet-item"><Sparkles size={20}/><div><span className="eyebrow">BONUS PERK</span><h3>{perk.name}</h3><p>{perk.description}</p></div></div>}{mentor&&<div className="sheet-item"><MentorMark mentor={mentor} size="small"/><div><span className="eyebrow">MENTOR</span><h3>{mentor.name}</h3><p>{mentor.passive.text}</p><span className={`power-status ${game.powerUsed?'used':''}`}><span className="tiny-dot"/>{mentor.power.name} · {game.powerUsed?'Used this act':'Available this act'}</span></div></div>}{game.history.length>0&&<div className="history"><span className="eyebrow">YOUR JOURNEY SO FAR</span>{game.history.slice(-8).reverse().map((h,i)=><div key={`${h.id}-${i}`}><span>§{h.sectionId}</span><p>{h.label}</p>{h.capitalChange!==0&&<strong className={h.capitalChange>0?'positive':'negative'}>{h.capitalChange>0?'+':'−'}{money(Math.abs(h.capitalChange))}</strong>}</div>)}</div>}<button className="button button-secondary" onClick={()=>{setOverlay('restart');}}><RotateCcw size={16}/> Restart Adventure</button></>;}

  return <MotionConfig reducedMotion={reducedMotion?'always':'user'}><div className={`app ${preferences.textSize==='large'?'large-text':''} ${reducedMotion?'reduce-motion':''}`}>
    <header className="site-header"><Brand onClick={()=>setView('menu')}/><div className="header-center">THE STARTUP PHASE <span>AN INTERACTIVE GAMEBOOK</span></div><div className="header-actions"><span className="prototype-label">PROTOTYPE <span>01</span></span><button className="icon-button" onClick={()=>setOverlay('settings')} aria-label="Settings"><Settings2 size={20}/></button><button className="icon-button mobile-menu" onClick={()=>setView('menu')} aria-label="Main menu"><Menu size={21}/></button></div></header>
    {saveError&&<div className="save-error" role="alert"><span>{saveError}</span>{session.raw&&<button onClick={downloadSave}><Download size={15}/> Download existing save</button>}</div>}
    {updateReady&&<div className="update-notice">A new version is ready. Your current progress is saved.<button onClick={()=>refreshApp?.()}>Update game <ArrowRight size={14}/></button></div>}
    <AnimatePresence mode="wait"><motion.div key={`${view}-${view==='game'?game?.phase==='creation'?'creation':game?.phase==='boundary'?'boundary':'adventure':''}`} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:.22}}>{view==='menu'?renderMenu():view==='intro'?renderIntro():game?.phase==='creation'?renderCreation():game?.phase==='boundary'?renderBoundary():renderAdventure()}</motion.div></AnimatePresence>
    {view!=='menu'&&<footer className="game-footer"><span><span className="status-dot"/> {saveError?'PROGRESS IN THIS TAB':'PROGRESS SAVED ON THIS DEVICE'}</span><button onClick={()=>setOverlay('help')}><CircleHelp size={15}/> How to Play</button><button onClick={()=>setView('menu')}><BookOpen size={15}/> Return to Menu</button></footer>}
    <AnimatePresence>{toast&&<motion.div className="toast" role="status" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}}><Check size={17}/>{toast}<button onClick={()=>setToast(null)} aria-label="Dismiss notification"><X size={15}/></button></motion.div>}</AnimatePresence>
    <AnimatePresence>{overlay==='settings'&&<Modal title="Make yourself comfortable." onClose={closeOverlay}><div className="settings-section"><span className="eyebrow">READING SIZE</span><div className="segmented"><button aria-pressed={preferences.textSize==='standard'} onClick={()=>changePreferences({...preferences,textSize:'standard'})}>Standard</button><button aria-pressed={preferences.textSize==='large'} onClick={()=>changePreferences({...preferences,textSize:'large'})}>Larger text</button></div></div><label className="switch-setting"><span><strong>Reduce motion</strong><small>Keep dice and scene transitions gentle.</small></span><input type="checkbox" checked={preferences.reduceMotion} onChange={e=>changePreferences({...preferences,reduceMotion:e.target.checked})}/></label><div className="settings-note"><Check size={17}/><p>Progress saves automatically in this browser. Continue on this same device and browser to pick up where you left off.</p></div><button className="button button-secondary" onClick={()=>setOverlay('help')}><BookOpen size={17}/> How to Play <ArrowRight size={16}/></button></Modal>}
    {overlay==='help'&&<Modal title="How to Play" onClose={closeOverlay} wide><span className="eyebrow">THE ORIGINAL RULES</span><div className="help-intro"><Die value={5} small/><p>Make your choices. Roll the dice.<br/><strong>Build your first $10,000.</strong></p></div><div className="narrative help-copy">{HOW_TO_PLAY_PARAGRAPHS.map((p,i)=><p key={i}>{p}</p>)}</div><div className="help-prototype"><span className="eyebrow">ABOUT THIS PROTOTYPE</span><p>Play sections 1–10, the mentor choice in 27, the funding outcomes in 31–33, and the pivot path through 24 and 83–85. Other destinations are clearly marked boundaries. This is the first slice of the full gamebook.</p><p>All story text is from Mark Kington’s original manuscript. Scene artwork is a labelled placeholder.</p></div><a className="text-link" href="/assets/original-character-sheet.png" download="Roll-For-Profit-Character-Sheet.png"><Download size={16}/> Original printable character sheet</a><button className="button button-primary" onClick={closeOverlay}>Got it. Let’s roll. <ArrowRight size={17}/></button></Modal>}
    {overlay==='sheet'&&game&&<Modal title="Character Sheet" onClose={closeOverlay} wide>{renderSheet()}</Modal>}
    {overlay==='mentor'&&mentor&&<Modal title={mentor.name} onClose={closeOverlay}><div className="mentor-profile"><MentorMark mentor={mentor}/><blockquote>“{mentor.quote.replace(/^["“]|["”]$/g,'')}”</blockquote><p>{mentor.description}</p><h3>{mentor.passive.name}</h3><p>{mentor.passive.text}</p><h3>{mentor.power.name} <span>ONCE PER ACT</span></h3><p>{mentor.power.text}</p><span className="power-status">{game?.powerUsed?'Power used this act':'Power available this act'}</span><p className="mentor-clarification">When eligible, your mentor’s power appears beside your dice result. You choose whether to use it.</p></div></Modal>}
    {overlay==='restart'&&<Modal title="A fresh start?" onClose={closeOverlay}><div className="restart-copy"><RotateCcw size={32}/><p>Starting a new adventure replaces your current save. You’ll roll a new character and choose your perk and mentor again.</p></div><div className="dialog-actions"><button className="button button-secondary" onClick={closeOverlay}>Keep my adventure</button><button className="button button-primary" onClick={startNew}>New Game <ArrowRight size={17}/></button></div></Modal>}</AnimatePresence>
  </div></MotionConfig>;
}
