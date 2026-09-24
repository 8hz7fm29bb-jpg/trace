'use client'
import {useEffect,useMemo,useState} from 'react'
import {Archive,Camera,ChevronLeft,Factory,PackagePlus,Printer,Search,X} from 'lucide-react'
import {supabase} from '@/lib/supabase'

type Arrival={id:string;created_at:string;product_name:string|null;supplier:string|null;producer_lot:string|null;internal_lot:string|null;expiry_date:string|null;category:string|null;delivery_date?:string;photo_path?:string|null}
const empty={product_name:'',supplier:'',producer_lot:'',internal_lot:'',expiry_date:'',category:''}

export default function Home(){
 const [view,setView]=useState<'home'|'new'|'archive'>('home')
 const [form,setForm]=useState(empty)
 const [rows,setRows]=useState<Arrival[]>([])
 const [q,setQ]=useState('')
 const [message,setMessage]=useState('')
 const [suppliers,setSuppliers]=useState<string[]>([])
 const load=async()=>{if(!supabase)return;const {data}=await supabase.from('trace_arrivals').select('*').order('created_at',{ascending:false}).limit(100);setRows((data||[]) as Arrival[])}
 const loadSuppliers=async()=>{if(!supabase)return;const {data}=await supabase.from('trace_suppliers').select('name').order('name');setSuppliers((data||[]).map((x:any)=>x.name))}
 useEffect(()=>{load();loadSuppliers()},[])
 const filtered=useMemo(()=>rows.filter(r=>[r.product_name||'',r.supplier||'',r.producer_lot||'',r.internal_lot||''].join(' ').toLowerCase().includes(q.toLowerCase())),[rows,q])
 const [photo,setPhoto]=useState<File|null>(null)
 const [productPhotos,setProductPhotos]=useState<File[]>([])
 const save=async(e:React.FormEvent)=>{e.preventDefault();setMessage('');if(!form.supplier.trim()){setMessage('Inserisci il fornitore.');return}if(!photo){setMessage('Scatta la foto dell’etichetta o del documento di consegna.');return}if(!supabase){setMessage('Database non configurato.');return}
  setMessage('Registrazione in corso…')
  const ext=(photo.name.split('.').pop()||'jpg').toLowerCase();const path=`${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`
  const up=await supabase.storage.from('trace-arrivals').upload(path,photo,{contentType:photo.type||'image/jpeg'})
  if(up.error){setMessage('Errore salvataggio foto: '+up.error.message);return}
  await supabase.from('trace_suppliers').upsert({name:form.supplier.trim()},{onConflict:'name',ignoreDuplicates:true})
  const {data,error}=await supabase.from('trace_arrivals').insert({supplier:form.supplier.trim(),photo_path:path,product_name:null,producer_lot:null}).select('id,internal_lot,delivery_date').single()
  if(error){setMessage(error.message);return}
  await supabase.from('trace_arrival_photos').insert({arrival_id:data.id,photo_path:path,photo_type:'delivery'})
  for(const extra of productPhotos){
    const eext=(extra.name.split('.').pop()||'jpg').toLowerCase();const epath=`${new Date().toISOString().slice(0,10)}/${data.id}/${crypto.randomUUID()}.${eext}`
    const eup=await supabase.storage.from('trace-arrivals').upload(epath,extra,{contentType:extra.type||'image/jpeg'})
    if(!eup.error) await supabase.from('trace_arrival_photos').insert({arrival_id:data.id,photo_path:epath,photo_type:'product_label'})
  }
  setForm(empty);setPhoto(null);setProductPhotos([]);await loadSuppliers();setMessage(`Registrato: lotto ${data.internal_lot} · consegna ${new Date(data.delivery_date+'T12:00:00').toLocaleDateString('it-IT')}`);await load()
 }
 if(view==='new')return <main><Top/><button className="back" onClick={()=>setView('home')}><ChevronLeft/> Dashboard</button><section className="panel"><p className="eyebrow">ARRIVO MERCE</p><h2>Registra lotto</h2><p className="muted">Fotografa l'etichetta o il documento della merce e indica il fornitore. TRACE assegna automaticamente lotto di arrivo e data di consegna.</p><form onSubmit={save} className="form simple"><label className="cameraBox"><span>Foto merce / etichetta *</span><input className="cameraInput" type="file" accept="image/*" capture="environment" onChange={e=>setPhoto(e.target.files?.[0]||null)}/><div className="cameraButton"><Camera size={26}/><b>{photo?'FOTO ACQUISITA':'APRI FOTOCAMERA'}</b><small>{photo?photo.name:'Su smartphone e iPad si apre la fotocamera posteriore'}</small></div></label><label><span>Fornitore *</span><input list="trace-suppliers" value={form.supplier} onChange={e=>setForm({...form,supplier:e.target.value})} placeholder="Scrivi o seleziona il fornitore"/><datalist id="trace-suppliers">{suppliers.map(n=><option key={n} value={n}/>)}</datalist></label><div className="autoInfo"><div><span>LOTTO DI ARRIVO</span><b>Automatico</b></div><div><span>DATA CONSEGNA</span><b>{new Date().toLocaleDateString('it-IT')}</b></div></div><button className="primary">REGISTRA ARRIVO</button>{message&&<div className="message">{message}</div>}</form></section></main>
 if(view==='archive')return <main><Top/><button className="back" onClick={()=>setView('home')}><ChevronLeft/> Dashboard</button><section className="panel wide"><div className="archiveHead"><div><p className="eyebrow">TRACCIABILITÀ</p><h2>Archivio arrivi</h2></div><div className="search"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cerca prodotto, lotto, fornitore"/>{q&&<X size={17} onClick={()=>setQ('')}/>}</div></div>{filtered.length?<div className="list">{filtered.map(r=><div className="lot" key={r.id}><div><strong>{r.product_name||'Arrivo merce'}</strong><small>{r.supplier||'Fornitore non indicato'} · {new Date(r.created_at).toLocaleDateString('it-IT')}</small></div><div><span>LOTTO PRODUTTORE</span><b>{r.producer_lot||'—'}</b></div><div><span>LOTTO INTERNO</span><b>{r.internal_lot||'—'}</b></div></div>)}</div>:<div className="empty">Nessun lotto registrato.</div>}</section></main>
 return <main><Top/><section className="hero"><p className="eyebrow">GESTIONE LOTTI</p><h1>Tracciabilità semplice,<br/>dall'arrivo alla produzione.</h1><p className="lead">Registra i lotti in ingresso, crea i lotti interni e conserva il collegamento con le materie prime utilizzate.</p></section><section className="grid"><Card title="Registra lotto" text="Registra la merce in arrivo e il lotto del produttore." icon={PackagePlus} onClick={()=>setView('new')}/><Card title="Crea etichetta" text="Crea un nuovo lotto di produzione e seleziona i lotti utilizzati." icon={Printer}/><Card title="Archivio arrivi" text="Consulta i lotti delle materie prime registrate." icon={Archive} onClick={()=>{load();setView('archive')}}/><Card title="Archivio produzioni" text="Ricostruisci ogni lotto prodotto e le materie prime utilizzate." icon={Factory}/></section><footer>TRACE · OFFICINA22</footer></main>
}
function Top(){return <header><div className="brand">TRACE</div><div className="sub">TRACCIABILITÀ · OFFICINA22</div></header>}
function Card({title,text,icon:Icon,onClick}:{title:string;text:string;icon:any;onClick?:()=>void}){return <button className="card" onClick={onClick}><Icon size={28}/><span><strong>{title}</strong><small>{text}</small></span><b>→</b></button>}
function Field({label,value,onChange,placeholder,type='text'}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string;type?:string}){return <label><span>{label}</span><input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>}<label className="cameraBox extra"><span>Etichette singoli prodotti (opzionale)</span><input className="cameraInput" type="file" accept="image/*" capture="environment" onChange={e=>{const x=e.target.files?.[0];if(x)setProductPhotos(p=>[...p,x]);e.currentTarget.value=''}}/><div className="cameraButton secondary"><Camera size={23}/><b>+ FOTOGRAFA ETICHETTA PRODOTTO</b><small>{productPhotos.length?productPhotos.length+' foto aggiuntive acquisite':'Ripeti per ogni etichetta che vuoi conservare'}</small></div></label>
