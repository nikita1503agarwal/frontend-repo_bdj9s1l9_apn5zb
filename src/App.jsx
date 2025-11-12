import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
      {children}
    </label>
  )
}

function Preferences({ userId, prefs, onChange, onSave }) {
  const [form, setForm] = useState(prefs || { language: '', region: '', categories: [] })
  useEffect(() => setForm(prefs || { language: '', region: '', categories: [] }), [prefs])

  const toggleCategory = (c) => {
    setForm((f) => {
      const set = new Set(f.categories)
      if (set.has(c)) set.delete(c)
      else set.add(c)
      return { ...f, categories: Array.from(set) }
    })
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h3 className="font-semibold text-gray-800 mb-3">Preferences</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Language">
          <select
            className="w-full border rounded px-3 py-2"
            value={form.language || ''}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
          >
            <option value="">Auto</option>
            <option value="en">English</option>
            <option value="zh">Chinese</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="hi">Hindi</option>
          </select>
        </Field>
        <Field label="Region">
          <select
            className="w-full border rounded px-3 py-2"
            value={form.region || ''}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
          >
            <option value="">Auto</option>
            <option value="US">United States</option>
            <option value="CN">China</option>
            <option value="IN">India</option>
            <option value="EU">Europe</option>
            <option value="BR">Brazil</option>
          </select>
        </Field>
        <Field label="Categories">
          <div className="flex flex-wrap gap-2">
            {['politics','sports','entertainment','technology','business','science'].map(c => (
              <button key={c} type="button" onClick={() => toggleCategory(c)}
                className={`px-3 py-1 rounded border ${form.categories?.includes(c) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700'}`}>{c}</button>
            ))}
          </div>
        </Field>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => onSave(form)} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
      </div>
    </div>
  )
}

function ArticleComposer({ userId, onCreated }) {
  const [data, setData] = useState({ title: '', content: '', language: 'en', region: '', categories: [] })
  const toggleCategory = (c) => setData((d) => {
    const set = new Set(d.categories)
    set.has(c) ? set.delete(c) : set.add(c)
    return { ...d, categories: Array.from(set) }
  })

  const submit = async () => {
    const url = `${API_BASE}/articles?user_id=${encodeURIComponent(userId)}`
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const json = await res.json()
    onCreated?.(json)
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h3 className="font-semibold text-gray-800 mb-3">Post an article (journalist demo)</h3>
      <div className="grid gap-3">
        <Field label="Title">
          <input className="w-full border rounded px-3 py-2" value={data.title} onChange={(e)=>setData({...data,title:e.target.value})} />
        </Field>
        <Field label="Content">
          <textarea rows={4} className="w-full border rounded px-3 py-2" value={data.content} onChange={(e)=>setData({...data,content:e.target.value})} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Language">
            <select className="w-full border rounded px-3 py-2" value={data.language} onChange={(e)=>setData({...data,language:e.target.value})}>
              <option value="en">English</option>
              <option value="zh">Chinese</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </Field>
          <Field label="Region">
            <input className="w-full border rounded px-3 py-2" placeholder="e.g., US" value={data.region} onChange={(e)=>setData({...data,region:e.target.value})} />
          </Field>
          <Field label="Categories">
            <div className="flex flex-wrap gap-2">
              {['politics','sports','entertainment','technology','business','science'].map(c => (
                <button key={c} type="button" onClick={() => toggleCategory(c)}
                  className={`px-3 py-1 rounded border ${data.categories?.includes(c) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700'}`}>{c}</button>
              ))}
            </div>
          </Field>
        </div>
        <div>
          <button onClick={submit} className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">Publish</button>
        </div>
      </div>
    </div>
  )
}

function Feed({ userId, language, region }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams({ user_id: userId })
    if (language) params.set('language', language)
    if (region) params.set('region', region)
    const res = await fetch(`${API_BASE}/articles/feed?${params.toString()}`)
    const json = await res.json()
    setItems(json.items || [])
    setLoading(false)
  }

  useEffect(() => {
    if (userId) load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, language, region])

  const interact = async (articleId, action) => {
    await fetch(`${API_BASE}/interactions?user_id=${encodeURIComponent(userId)}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ article_id: articleId, action }) })
    load()
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Your Feed</h3>
        <button onClick={load} className="text-sm text-blue-600 hover:underline">Refresh</button>
      </div>
      {loading ? <div className="text-gray-500">Loading...</div> : (
        <ul className="space-y-4">
          {items.map(item => (
            <li key={item.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                <span className="text-xs text-gray-500">{item.language}{item.region ? ` • ${item.region}` : ''}</span>
              </div>
              <p className="text-gray-700 mt-1 whitespace-pre-wrap">{item.content}</p>
              <div className="mt-2 flex gap-2">
                <button className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={()=>interact(item.id,'view')}>Mark Read</button>
                <button className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={()=>interact(item.id,'like')}>Like</button>
                <button className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200" onClick={()=>interact(item.id,'share')}>Share</button>
              </div>
            </li>
          ))}
          {items.length === 0 && <li className="text-gray-500">No items yet. Try publishing or changing preferences.</li>}
        </ul>
      )}
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [prefs, setPrefs] = useState(null)

  const loginAnonymous = async () => {
    const res = await fetch(`${API_BASE}/auth/anonymous`, { method: 'POST' })
    const json = await res.json()
    setUser(json)
    // load prefs
    const pr = await fetch(`${API_BASE}/users/${json.user_id}/preferences`)
    setPrefs(await pr.json())
  }

  const savePrefs = async (form) => {
    if (!user) return
    await fetch(`${API_BASE}/users/${user.user_id}/preferences`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)})
    setPrefs(form)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-50">
      <header className="sticky top-0 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-indigo-600" />
            <div className="font-bold text-gray-900">AI News</div>
          </div>
          <div>
            {user ? (
              <div className="text-sm text-gray-700">User: {user.user_id.slice(0,8)}…</div>
            ) : (
              <button onClick={loginAnonymous} className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-black">Continue without account</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {user && (
          <>
            <Preferences userId={user.user_id} prefs={prefs} onSave={savePrefs} />
            <Feed userId={user.user_id} language={prefs?.language} region={prefs?.region} />
            <ArticleComposer userId={user.user_id} onCreated={() => {}} />
          </>
        )}
        {!user && (
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-xl font-semibold mb-2">Personalized, multilingual news</h2>
            <p className="text-gray-600">Sign in anonymously to try the AI-powered feed. You can set language, region, and interests, publish a demo article, and see personalized ordering based on your interactions.</p>
            <div className="mt-4">
              <button onClick={loginAnonymous} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Try it now</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
