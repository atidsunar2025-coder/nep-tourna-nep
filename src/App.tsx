import { FormEvent, useEffect, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'

type Tournament = { id: string; name: string; game: string; format: string; starts_at: string; status: string; description: string | null }

function Layout({ session, children }: { session: Session | null; children: React.ReactNode }) {
  const navigate = useNavigate()
  async function logout() { await supabase.auth.signOut(); navigate('/') }
  return <div className="shell"><header><Link className="brand" to="/">NEP <span>TOURNA</span></Link><nav><Link to="/tournaments">Tournaments</Link>{session ? <><span className="user">{session.user.email}</span><button onClick={logout}>Sign out</button></> : <Link className="button" to="/login">Sign in</Link>}</nav></header><main>{children}</main><footer>NEP TOURNA · Tournament management</footer></div>
}

function Home() { return <section className="hero"><p className="eyebrow">TOURNAMENT PLATFORM</p><h1>Run tournaments.<br/><span>Play with your community.</span></h1><p>Manage events, registrations, schedules and results from one fast, Cloudflare-hosted app.</p><Link className="button large" to="/tournaments">Browse tournaments</Link></section> }

function Login() {
  const [mode, setMode] = useState<'signin'|'signup'>('signin'); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [message,setMessage]=useState(''); const navigate=useNavigate()
  async function submit(e: FormEvent) { e.preventDefault(); setMessage(''); const result = mode==='signin' ? await supabase.auth.signInWithPassword({email,password}) : await supabase.auth.signUp({email,password}); if(result.error) setMessage(result.error.message); else { setMessage(mode==='signup'?'Check your email to confirm your account.':'Signed in.'); if(mode==='signin') navigate('/tournaments') } }
  return <section className="card auth"><h2>{mode==='signin'?'Welcome back':'Create account'}</h2><form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" minLength={6} required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="button" type="submit">{mode==='signin'?'Sign in':'Create account'}</button></form>{message&&<p className="message">{message}</p>}<button className="linkButton" onClick={()=>setMode(mode==='signin'?'signup':'signin')}>{mode==='signin'?'Need an account? Sign up':'Already have an account? Sign in'}</button></section>
}

function Tournaments() {
  const [items,setItems]=useState<Tournament[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('')
  useEffect(()=>{ supabase.from('tournaments').select('id,name,game,format,starts_at,status,description').order('starts_at',{ascending:true}).then(({data,error})=>{if(error)setError(error.message);setItems(data??[]);setLoading(false)}) },[])
  return <section><div className="sectionHead"><div><p className="eyebrow">EVENTS</p><h2>Tournaments</h2></div><Link className="button" to="/">Home</Link></div>{loading?<p>Loading tournaments…</p>:error?<div className="message error">{error}</div>:items.length===0?<div className="empty">No tournaments yet. Create your first event in Supabase.</div>:<div className="grid">{items.map(t=><article className="card" key={t.id}><span className="pill">{t.status}</span><h3>{t.name}</h3><p>{t.game} · {t.format}</p><p className="muted">{new Date(t.starts_at).toLocaleString()}</p>{t.description&&<p>{t.description}</p>}</article>)}</div>}</section>
}

export default function App(){ const [session,setSession]=useState<Session|null>(null); useEffect(()=>{supabase.auth.getSession().then(({data})=>setSession(data.session)); const {data}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s)); return ()=>data.subscription.unsubscribe()},[]); return <Layout session={session}><Routes><Route path="/" element={<Home/>}/><Route path="/login" element={<Login/>}/><Route path="/tournaments" element={<Tournaments/>}/><Route path="*" element={<Home/>}/></Routes></Layout> }
