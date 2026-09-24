'use client'
import {useEffect,useMemo,useState} from 'react'
import {Archive,ChevronLeft,Factory,PackagePlus,Printer,Search,X} from 'lucide-react'
import {supabase} from '@/lib/supabase'

type Arrival={id:string;created_at:string;product_name:string;supplier:string|null;producer_lot:string;internal_lot:string|null;expiry_date:string|null;category:string|null}
const empty={product_name:'',supplier:'',producer_lot:'',internal_lot:'',expiry_date:'',category:''}

export default function Home(){
 const [view,setView]=useState<'home'|'new'|'archive'>('home')
 const [form,setForm]=useState(empty)
 const [rows,setRows]=useState<Arrival[]>([])
 const [q,setQ]=useState('')
 const [message,setMessage]=useState('')
 const load=async()=>{if(!supabase)return;const {data}=await supabase.from('trace_arrivals').select('*').order('created_at',{ascending:false}).limit(100);setRows((data||[]) as Arrival[])}
 useEffect(()=>{load()},[])
 const filtered=useMemo(()=>rows.filter(r=>[r.product_name,r.supplier,r.producer_lot,r.internal_lot].join(' ').toLowerCase().includes(q.toLowerCase())),[rows,q])
 const save=async(e:React.FormEvent)=>{e.preventDefault();setMessage('');if(!form.product_name.trim()||!form.producer_lot.trim()){setMessage('Inserisci almeno prodotto e lotto produttore.');return}if(!supabase){setMessage('Database non configurato.');return}
  const {error}=await supabase.from('trace_arrivals').insert({product_name:form.product_name.trim(),supplier:form.supplier.trim()||null,producer_lot:form.producer_lot.trim(),internal_lot:form.internal_lot.trim()||null,expiry_date:form.expiry_date||null,category:form.category.trim()||null})
  if(error){setMessage(error.message.includes('trace_arrivals')?'La tabella TRACE deve ancora essere creata nel database.':error.message);return}
  setForm(empty);setMessage('Lotto registrato.');await load()
 }
 if(view==='new')return <main><Top/><button className="back" onClick={()=>setView('home')}><ChevronLeft/> Dashboard</button><section className="panel"><p className="eyebrow">ARRIVO MERCE</p><h2>Registra lotto</h2><p className="muted">Inserisci i dati leggibili sull'etichetta del prodotto in ingresso.</p><form onSubmit={save} className="form"><Field label="Nome prodotto *" value={form.product_name} onChange={v=>setForm({...form,product_name:v})} placeholder="Es. Passata di pomodoro"/><Field label="Fornitore" value={form.supplier} onChange={v=>setForm({...form,supplier:v})} placeholder="Es. Fornitore Rossi"/><Field label="Lotto produttore *" value={form.producer_lot} onChange={v=>setForm({...form,producer_lot:v})} placeholder="Lotto riportato in confezione"/><Field label="Lotto interno" value={form.internal_lot} onChange={v=>setForm({...form,internal_lot:v})} placeholder="Es. L023"/><Field label="Scadenza / TMC" value={form.expiry_date} onChange={v=>setForm({...form,expiry_date:v})} type="date"/><Field label="Categoria (opzionale)" value={form.category} onChange={v=>setForm({...form,category:v})} placeholder="Predisposta per usi futuri"/><button className="primary">REGISTRA LOTTO</button>{message&&<div className="message">{message}</div>}</form></section></main>
 if(view==='archive')return <main><Top/><button className="back" onClick={()=>setView('home')}><ChevronLeft/> Dashboard</button><section className="panel wide"><div className="archiveHead"><div><p className="eyebrow">TRACCIABILITÀ</p><h2>Archivio arrivi</h2></div><div className="search"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cerca prodotto, lotto, fornitore"/>{q&&<X size={17} onClick={()=>setQ('')}/>}</div></div>{filtered.length?<div className="list">{filtered.map(r=><div className="lot" key={r.id}><div><strong>{r.product_name}</strong><small>{r.supplier||'Fornitore non indicato'} · {new Date(r.created_at).toLocaleDateString('it-IT')}</small></div><div><span>LOTTO PRODUTTORE</span><b>{r.producer_lot}</b></div><div><span>LOTTO INTERNO</span><b>{r.internal_lot||'—'}</b></div></div>)}</div>:<div className="empty">Nessun lotto registrato.</div>}</section></main>
 return <main><Top/><section className="hero"><p className="eyebrow">GESTIONE LOTTI</p><h1>Tracciabilità semplice,<br/>dall'arrivo alla produzione.</h1><p className="lead">Registra i lotti in ingresso, crea i lotti interni e conserva il collegamento con le materie prime utilizzate.</p></section><section className="grid"><Card title="Registra lotto" text="Registra la merce in arrivo e il lotto del produttore." icon={PackagePlus} onClick={()=>setView('new')}/><Card title="Crea etichetta" text="Crea un nuovo lotto di produzione e seleziona i lotti utilizzati." icon={Printer}/><Card title="Archivio arrivi" text="Consulta i lotti delle materie prime registrate." icon={Archive} onClick={()=>{load();setView('archive')}}/><Card title="Archivio produzioni" text="Ricostruisci ogni lotto prodotto e le materie prime utilizzate." icon={Factory}/></section><footer>TRACE · OFFICINA22</footer></main>
}
function Top(){return <header><div className="brand">TRACE</div><div className="sub">TRACCIABILITÀ · OFFICINA22</div></header>}
function Card({title,text,icon:Icon,onClick}:{title:string;text:string;icon:any;onClick?:()=>void}){return <button className="card" onClick={onClick}><Icon size={28}/><span><strong>{title}</strong><small>{text}</small></span><b>→</b></button>}
function Field({label,value,onChange,placeholder,type='text'}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string;type?:string}){return <label><span>{label}</span><input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>}
