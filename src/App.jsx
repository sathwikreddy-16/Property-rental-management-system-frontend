import { useEffect, useMemo, useState } from 'react'
import { Search, MapPin, BedDouble, Bath, ArrowUpRight, Plus, House, SlidersHorizontal, LoaderCircle, X, LayoutDashboard, ClipboardList, Building2, CheckCircle2, AlertCircle, Wallet, Menu } from 'lucide-react'

const API = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080/api'
).replace(/\/$/, '')
const demo = [
  { id: 'demo-1', title: 'Sunlit modern apartment', location: 'Gachibowli', city: 'Hyderabad', propertyType: 'Apartment', monthlyRent: 22000, bedrooms: 2, bathrooms: 2, available: true, description: 'A bright, airy apartment with modern finishes and easy access to work, cafés and transit.', imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', ownerName: 'Ravi Kumar' },
  { id: 'demo-2', title: 'Independent family home', location: 'Miyapur', city: 'Hyderabad', propertyType: 'House', monthlyRent: 28000, bedrooms: 3, bathrooms: 2, available: true, description: 'A spacious family home with a private balcony and schools nearby.', imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80', ownerName: 'Anita Rao' },
  { id: 'demo-3', title: 'Minimal studio apartment', location: 'Kondapur', city: 'Hyderabad', propertyType: 'Studio', monthlyRent: 12000, bedrooms: 1, bathrooms: 1, available: true, description: 'A compact, comfortable studio designed for students and working professionals.', imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', ownerName: 'Sandeep Reddy' },
  { id: 'demo-4', title: 'Contemporary city residence', location: 'Madhapur', city: 'Hyderabad', propertyType: 'Apartment', monthlyRent: 32000, bedrooms: 2, bathrooms: 2, available: true, description: 'Contemporary interiors, natural light and quick access to the business district.', imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', ownerName: 'Priya Shah' },
  { id: 'demo-5', title: 'Quiet garden villa', location: 'Manikonda', city: 'Hyderabad', propertyType: 'Villa', monthlyRent: 45000, bedrooms: 3, bathrooms: 3, available: true, description: 'A calm villa with generous living spaces and a leafy outdoor area.', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', ownerName: 'Kiran Rao' },
  { id: 'demo-6', title: 'Affordable 1 BHK', location: 'Kukatpally', city: 'Hyderabad', propertyType: 'Apartment', monthlyRent: 15000, bedrooms: 1, bathrooms: 1, available: true, description: 'Practical layout, close to shopping, metro access and everyday essentials.', imageUrl: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80', ownerName: 'Vikram Das' },
]
const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n || 0))
const emptyForm = { title: '', location: '', city: 'Hyderabad', propertyType: 'Apartment', monthlyRent: '', bedrooms: 2, bathrooms: 1, description: '', imageUrl: '', ownerName: '', available: true }

export default function App() {
  const [page, setPage] = useState('discover')
  const [properties, setProperties] = useState(demo)
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState({ totalProperties: demo.length, availableProperties: demo.length, totalApplications: 0, pendingApplications: 0 })
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All types')
  const [maxRent, setMaxRent] = useState('Any budget')
  const [loading, setLoading] = useState(false)
  const [apiOnline, setApiOnline] = useState(false)
  const [selected, setSelected] = useState(null)
  const [showApply, setShowApply] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [notice, setNotice] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [applyForm, setApplyForm] = useState({ applicantName: '', email: '', phone: '', message: '' })

  async function loadData() {
    setLoading(true)
    try {
      const [pRes, sRes, aRes] = await Promise.all([
        fetch(`${API}/properties`), fetch(`${API}/dashboard/stats`), fetch(`${API}/applications`)
      ])
      if (!pRes.ok) throw new Error('API unavailable')
      const [p, s, a] = await Promise.all([pRes.json(), sRes.ok ? sRes.json() : Promise.resolve(stats), aRes.ok ? aRes.json() : Promise.resolve([])])
      setProperties(p); setStats(s); setApplications(a); setApiOnline(true)
    } catch {
      setApiOnline(false)
      // Keep demo properties visible so the UI can be explored before MySQL/backend setup.
    } finally { setLoading(false) }
  }
  useEffect(() => { loadData() }, [])
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(''), 3500); return () => clearTimeout(t) }, [notice])

  const filtered = useMemo(() => properties.filter(p => {
    const haystack = `${p.title} ${p.location} ${p.city} ${p.propertyType}`.toLowerCase()
    return haystack.includes(query.toLowerCase()) &&
      (type === 'All types' || p.propertyType?.toLowerCase() === type.toLowerCase()) &&
      (maxRent === 'Any budget' || Number(p.monthlyRent) <= Number(maxRent))
  }), [properties, query, type, maxRent])

  async function createProperty(e) {
    e.preventDefault()
    const payload = { ...form, monthlyRent: Number(form.monthlyRent), bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms) }
    const isEditing = editingId !== null
    try {
      const isDatabaseId = isEditing && !String(editingId).startsWith('demo-') && !String(editingId).startsWith('local-')
      if (isEditing && !isDatabaseId) throw new Error('Preview record')
      const res = await fetch(isEditing ? `${API}/properties/${editingId}` : `${API}/properties`, {
        method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error()
      const saved = await res.json()
      setProperties(prev => isEditing ? prev.map(p => p.id === editingId ? saved : p) : [saved, ...prev])
      setApiOnline(true); setNotice(isEditing ? 'Property updated successfully.' : 'Property published successfully.')
    } catch {
      if (isEditing) {
        setProperties(prev => prev.map(p => p.id === editingId ? { ...payload, id: editingId } : p))
        setNotice('Updated in preview mode. Start the backend to save changes to MySQL.')
      } else {
        const local = { ...payload, id: `local-${Date.now()}` }
        setProperties(prev => [local, ...prev]); setNotice('Added in preview mode. Start the backend to save to MySQL.')
      }
    }
    setShowAdd(false); setForm(emptyForm); setEditingId(null)
  }

  async function submitApplication(e) {
    e.preventDefault()
    const payload = { ...applyForm, propertyId: Number(showApply.id) }
    try {
      if (String(showApply.id).startsWith('demo-') || String(showApply.id).startsWith('local-')) throw new Error()
      const res = await fetch(`${API}/applications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error()
      const saved = await res.json(); setApplications(prev => [saved, ...prev]); setNotice('Application submitted successfully.')
    } catch {
      setApplications(prev => [{ ...payload, id: `local-${Date.now()}`, status: 'PENDING', appliedAt: new Date().toISOString(), propertyTitle: showApply.title }, ...prev])
      setNotice('Application added in preview mode. Connect MySQL backend to persist it.')
    }
    setShowApply(null); setApplyForm({ applicantName: '', email: '', phone: '', message: '' })
  }

  async function updateStatus(app, status) {
    try {
      const res = await fetch(`${API}/applications/${app.id}/status?status=${status}`, { method: 'PATCH' })
      if (!res.ok) throw new Error()
      const saved = await res.json(); setApplications(prev => prev.map(a => a.id === app.id ? saved : a)); setNotice(`Application ${status.toLowerCase()}.`)
    } catch {
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status } : a)); setNotice(`Status updated in preview mode: ${status.toLowerCase()}.`)
    }
  }

  const nav = [
    { id: 'discover', label: 'Discover homes', icon: House },
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: ClipboardList },
    { id: 'manage', label: 'Manage listings', icon: Building2 },
  ]

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-icon"><House size={20}/></div><div><b>haven<span>.</span></b><small>RENTAL PLATFORM</small></div></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => { setPage(item.id); setMobileNav(false) }}><item.icon size={18}/><span>{item.label}</span>{item.id === 'applications' && applications.length > 0 && <em>{applications.length}</em>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-orb">✦</div><b>Find your next place</b><p>Thoughtful homes for your next chapter.</p><button onClick={() => setPage('discover')}>Explore listings <ArrowUpRight size={14}/></button></div><div className="profile"><div className="avatar">AD</div><div><b>Workspace Admin</b><small>Property manager</small></div><span className={`status-dot ${apiOnline ? 'online' : ''}`} title={apiOnline ? 'Backend connected' : 'Preview mode'} /></div></div>
    </aside>
    {mobileNav && <button className="mobile-scrim" onClick={() => setMobileNav(false)} aria-label="Close menu"/>}
    <main className="main">
      <header className="topbar"><button className="mobile-menu icon-button" onClick={() => setMobileNav(!mobileNav)}><Menu size={20}/></button><div className="crumb">Workspace <span>/</span> <b>{nav.find(n => n.id === page)?.label || 'Discover homes'}</b></div><div className="top-actions"><span className={`connection ${apiOnline ? 'connected' : ''}`}><i/>{apiOnline ? 'MySQL API connected' : 'Preview mode'}</span><button className="avatar top-avatar" title="Workspace admin">AD</button></div></header>
      {notice && <div className="toast"><CheckCircle2 size={17}/>{notice}<button onClick={() => setNotice('')}><X size={15}/></button></div>}
      {page === 'discover' && <>
        <section className="hero"><div className="hero-copy"><div className="eyebrow"><span/> YOUR NEXT CHAPTER STARTS HERE</div><h1>A place to call<br/><i>your own.</i></h1><p>Discover considered homes in the neighbourhoods you love.</p><div className="hero-stats"><div><b>{properties.length.toString().padStart(2,'0')}+</b><span>Curated listings</span></div><div className="hero-stat-divider"/><div><b>4.8<span className="star">★</span></b><span>Tenant satisfaction</span></div></div></div><div className="hero-image"><img src="https://images.unsplash.com/photo-160060 dizabled" onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85' }} alt="Modern home interior"/><div className="floating-note"><div className="note-icon"><CheckCircle2 size={17}/></div><div><b>Find your fit</b><small>Homes picked for living well</small></div></div><div className="image-index">01 <span>/ 03</span></div></div></section>
        <section className="listing-section"><div className="section-heading"><div><div className="eyebrow muted">THE COLLECTION</div><h2>Homes worth <i>coming home to.</i></h2><p>Spaces with room for your life to happen.</p></div><button className="text-link" onClick={() => {setPage('manage');setEditingId(null);setForm(emptyForm);setShowAdd(true)}}>List your property <ArrowUpRight size={16}/></button></div>
          <div className="filters"><div className="searchbox"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by area, city or property..."/>{query && <button onClick={() => setQuery('')}><X size={15}/></button>}</div><div className="filter-select"><SlidersHorizontal size={16}/><select value={type} onChange={e => setType(e.target.value)}><option>All types</option><option>Apartment</option><option>House</option><option>Studio</option><option>Villa</option></select></div><select className="budget-select" value={maxRent} onChange={e => setMaxRent(e.target.value)}><option>Any budget</option><option value="15000">Up to ₹15,000</option><option value="25000">Up to ₹25,000</option><option value="35000">Up to ₹35,000</option><option value="50000">Up to ₹50,000</option></select><span className="result-count">{filtered.length} homes</span></div>
          <div className="listing-grid">{loading && <div className="loading"><LoaderCircle className="spin"/> Loading homes...</div>}{filtered.map((p,i) => <article className="property-card" key={p.id}><button className="property-image" onClick={() => setSelected(p)}><img src={p.imageUrl || demo[i % demo.length].imageUrl} alt={p.title} onError={e => e.currentTarget.src = demo[i % demo.length].imageUrl}/><span className={`availability ${p.available ? '' : 'unavailable'}`}>{p.available ? 'Available now' : 'Rented'}</span><span className="image-arrow"><ArrowUpRight size={17}/></span></button><div className="property-info"><div className="property-type">{p.propertyType || 'Home'} <span>·</span> {p.bedrooms} bedroom{p.bedrooms === 1 ? '' : 's'}</div><h3>{p.title}</h3><div className="property-location"><MapPin size={14}/>{p.location}, {p.city}</div><div className="card-bottom"><div className="price">{money(p.monthlyRent)}<span> / month</span></div><button className="round-arrow" onClick={() => setSelected(p)} aria-label="View property"><ArrowUpRight size={17}/></button></div></div></article>)}
          {!filtered.length && <div className="empty-state"><House size={30}/><h3>No homes found</h3><p>Try changing your search or budget filters.</p><button className="btn-secondary" onClick={() => {setQuery('');setType('All types');setMaxRent('Any budget')}}>Clear filters</button></div>}</div>
        </section>
      </>}
      {page === 'dashboard' && <section className="page-content"><div className="page-title"><div className="eyebrow muted">YOUR WORKSPACE</div><h1>Good morning, <i>Admin.</i></h1><p>Here’s what’s happening across your rental portfolio.</p></div><div className="stat-grid"><Stat icon={House} label="Total properties" value={stats.totalProperties ?? properties.length} tone="blue"/><Stat icon={CheckCircle2} label="Available homes" value={stats.availableProperties ?? properties.length} tone="green"/><Stat icon={ClipboardList} label="Applications" value={stats.totalApplications ?? applications.length} tone="orange"/><Stat icon={AlertCircle} label="Pending review" value={stats.pendingApplications ?? applications.filter(a=>a.status==='PENDING').length} tone="purple"/></div><div className="panel"><div className="panel-heading"><div><h2>Recently listed homes</h2><p>Your latest additions to the portfolio</p></div><button className="btn-secondary" onClick={() => setPage('manage')}>Manage listings <ArrowUpRight size={15}/></button></div>{properties.slice(0,5).map(p=><div className="compact-row" key={p.id}><img src={p.imageUrl || demo[0].imageUrl} alt=""/><div className="compact-title"><b>{p.title}</b><small>{p.location}, {p.city}</small></div><b className="compact-price">{money(p.monthlyRent)}<small>/mo</small></b><span className={`pill ${p.available?'pill-green':'pill-gray'}`}>{p.available?'Available':'Rented'}</span></div>)}</div></section>}
      {page === 'applications' && <section className="page-content"><div className="page-title"><div className="eyebrow muted">TENANT MANAGEMENT</div><h1>Rental <i>applications.</i></h1><p>Review prospective tenants and manage application status.</p></div><div className="panel"><div className="panel-heading"><div><h2>All applications</h2><p>{applications.length} submissions in total</p></div><span className="pill pill-orange">{applications.filter(a=>a.status==='PENDING').length} pending</span></div>{applications.length ? applications.map(a=><div className="application-row" key={a.id}><div className="applicant-avatar">{(a.applicantName||'T').slice(0,1).toUpperCase()}</div><div className="applicant-details"><b>{a.applicantName}</b><small>{a.email} · {a.phone || 'No phone provided'}</small><span>{a.message || 'No additional message'}</span></div><span className={`pill ${a.status==='APPROVED'?'pill-green':a.status==='REJECTED'?'pill-red':'pill-orange'}`}>{a.status || 'PENDING'}</span><div className="application-actions"><button title="Approve" onClick={()=>updateStatus(a,'APPROVED')}><CheckCircle2 size={17}/></button><button title="Reject" onClick={()=>updateStatus(a,'REJECTED')}><X size={17}/></button></div></div>) : <div className="empty-state"><ClipboardList size={30}/><h3>No applications yet</h3><p>Tenant applications will appear here when submitted.</p><button className="btn-secondary" onClick={()=>setPage('discover')}>Browse homes</button></div>}</div></section>}
      {page === 'manage' && <section className="page-content"><div className="page-title title-row"><div><div className="eyebrow muted">PROPERTY INVENTORY</div><h1>Manage <i>listings.</i></h1><p>Keep your property catalogue up to date.</p></div><button className="btn-primary" onClick={()=>setShowAdd(true)}><Plus size={17}/> Add a property</button></div><div className="panel">{properties.map(p=><div className="compact-row" key={p.id}><img src={p.imageUrl || demo[0].imageUrl} alt=""/><div className="compact-title"><b>{p.title}</b><small>{p.location}, {p.city} · {p.propertyType}</small></div><b className="compact-price">{money(p.monthlyRent)}<small>/mo</small></b><span className={`pill ${p.available?'pill-green':'pill-gray'}`}>{p.available?'Available':'Rented'}</span><button className="btn-small" onClick={()=>{setForm({...p, monthlyRent:String(p.monthlyRent)});setEditingId(p.id);setShowAdd(true)}}>Edit</button></div>)}</div></section>}
      <footer className="footer"><span>© 2026 Haven Rental Platform</span><span>Designed for better living <span className="footer-heart">✳</span></span></footer>
    </main>
    {selected && <div className="modal-backdrop" onClick={()=>setSelected(null)}><div className="modal property-modal" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setSelected(null)}><X size={18}/></button><img className="modal-cover" src={selected.imageUrl || demo[0].imageUrl} alt={selected.title}/><div className="modal-body"><div className="property-type">{selected.propertyType} · {selected.bedrooms} bedroom{selected.bedrooms===1?'':'s'}</div><h2>{selected.title}</h2><p className="property-location"><MapPin size={15}/>{selected.location}, {selected.city}</p><div className="modal-price">{money(selected.monthlyRent)} <small>/ month</small></div><div className="amenities"><span><BedDouble size={16}/>{selected.bedrooms} Bedrooms</span><span><Bath size={16}/>{selected.bathrooms} Bathrooms</span></div><p className="description">{selected.description || 'A comfortable home in a convenient neighbourhood.'}</p><div className="owner-line"><div className="avatar"> {String(selected.ownerName||'O').slice(0,1)} </div><div><small>PROPERTY OWNER</small><b>{selected.ownerName || 'Verified owner'}</b></div></div><button className="btn-primary full-btn" disabled={!selected.available} onClick={()=>{setShowApply(selected);setSelected(null)}}>{selected.available?'Apply to rent':'Currently unavailable'} <ArrowUpRight size={17}/></button></div></div></div>}
    {showAdd && <div className="modal-backdrop" onClick={()=>setShowAdd(false)}><div className="modal form-modal" onClick={e=>e.stopPropagation()}><div className="modal-heading"><div><div className="eyebrow muted">PROPERTY INVENTORY</div><h2>{editingId !== null ? 'Edit your' : 'Add a'} <i>listing.</i></h2></div><button className="modal-close inline-close" onClick={()=>setShowAdd(false)}><X size={18}/></button></div><form onSubmit={createProperty}><label>Property title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Modern 2 BHK Apartment"/></label><div className="form-grid"><label>Locality<input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Gachibowli"/></label><label>City<input required value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></label><label>Property type<select value={form.propertyType} onChange={e=>setForm({...form,propertyType:e.target.value})}><option>Apartment</option><option>House</option><option>Studio</option><option>Villa</option></select></label><label>Monthly rent (₹)<input required type="number" min="1" value={form.monthlyRent} onChange={e=>setForm({...form,monthlyRent:e.target.value})} placeholder="22000"/></label><label>Bedrooms<input required type="number" min="0" value={form.bedrooms} onChange={e=>setForm({...form,bedrooms:e.target.value})}/></label><label>Bathrooms<input required type="number" min="0" value={form.bathrooms} onChange={e=>setForm({...form,bathrooms:e.target.value})}/></label></div><label>Photo URL<input value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})} placeholder="https://..."/></label><label>Owner name<input value={form.ownerName} onChange={e=>setForm({...form,ownerName:e.target.value})} placeholder="Property owner"/></label><label>Description<textarea rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the home and neighbourhood"/></label><button className="btn-primary full-btn" type="submit"><Plus size={17}/> Save property</button></form></div></div>}
    {showApply && <div className="modal-backdrop" onClick={()=>setShowApply(null)}><div className="modal form-modal" onClick={e=>e.stopPropagation()}><div className="modal-heading"><div><div className="eyebrow muted">YOUR NEXT CHAPTER</div><h2>Apply to <i>rent.</i></h2><p>{showApply.title}</p></div><button className="modal-close inline-close" onClick={()=>setShowApply(null)}><X size={18}/></button></div><form onSubmit={submitApplication}><label>Full name<input required value={applyForm.applicantName} onChange={e=>setApplyForm({...applyForm,applicantName:e.target.value})} placeholder="Your full name"/></label><label>Email address<input required type="email" value={applyForm.email} onChange={e=>setApplyForm({...applyForm,email:e.target.value})} placeholder="you@example.com"/></label><label>Phone number<input value={applyForm.phone} onChange={e=>setApplyForm({...applyForm,phone:e.target.value})} placeholder="+91..."/></label><label>Message to owner<textarea rows="3" value={applyForm.message} onChange={e=>setApplyForm({...applyForm,message:e.target.value})} placeholder="Tell the owner a little about yourself"/></label><button className="btn-primary full-btn" type="submit">Submit application <ArrowUpRight size={17}/></button></form></div></div>}
  </div>
}

function Stat({icon:Icon,label,value,tone}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={20}/></div><span>{label}</span><b>{value}</b><small><span className="stat-dot"/> Live portfolio metric</small></div> }
