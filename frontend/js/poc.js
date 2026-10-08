/* HOOKE POC modules — presentation-ready demo layer.
   Uses localStorage for safe browser-only demo persistence. Live integrations stay server-side. */
(function(){
  const modules = {
    acquisitions:{label:'📦 Acquisitions',section:'Library Operations',roles:['librarian','head_of_library'],render:renderAcquisitions},
    authority:{label:'🔤 Authority Control',section:'Library Operations',roles:['librarian','head_of_library'],render:renderAuthority},
    bookReviews:{label:'⭐ Book Reviews',section:'Community',roles:['librarian','head_of_library'],render:renderBookReviews},
    manualEntry:{label:'✍ Manual Book Entry',section:'Catalogue',roles:['librarian','head_of_library'],render:renderManualEntry},
    listsAdmin:{label:'📋 Lists',section:'Library Operations',roles:['librarian','head_of_library'],render:renderListsAdmin},
    bookLists:{label:'📚 Book Lists',section:'Library Operations',roles:['librarian','head_of_library'],render:renderBookLists}
  };
  Object.assign(ADMIN_TABS, modules);

  const originalIntegration = ADMIN_TABS.integrations.render;
  ADMIN_TABS.integrations.render = renderIntegrationsPOC;

  function wrap(title,body){return '<div class="admin-header"><h2>'+title+'</h2><span class="badge demo">POC DEMO</span></div>'+body;}
  function card(body){return '<div class="card">'+body+'</div>';}
  function esc(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

  function renderAcquisitions(){
    const requests=db.purchaseRequests||[];
    return wrap('Acquisitions',card(
      '<div class="notice">Track suggested purchases before they become catalogue records. This demo stores requests locally; a production build would persist them in PostgreSQL.</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
      '<div class="field"><label>Title</label><input id="acqTitle" placeholder="The Thursday Murder Club"></div>'+
      '<div class="field"><label>Author</label><input id="acqAuthor" placeholder="Richard Osman"></div>'+
      '<div class="field"><label>Supplier</label><input id="acqSupplier" placeholder="Supplier / wholesaler"></div>'+
      '<div class="field"><label>Priority</label><select id="acqPriority"><option>Normal</option><option>High</option><option>Urgent</option></select></div></div>'+
      '<button class="btn btn-primary" onclick="pocAddAcquisition()">Add acquisition request</button>')+
      card(requests.length?'<table><tr><th>Title</th><th>Author</th><th>Supplier</th><th>Priority</th><th>Status</th><th></th></tr>'+
        requests.map((r,i)=>'<tr><td>'+esc(r.title)+'</td><td>'+esc(r.author||'—')+'</td><td>'+esc(r.supplier||'—')+'</td><td>'+esc(r.priority||'Normal')+'</td><td><span class="status-pill '+(r.status==='Ordered'?'ready':'active')+'">'+esc(r.status||'Requested')+'</span></td><td><button class="btn btn-tertiary" onclick="pocOrderAcquisition('+i+')">'+(r.status==='Ordered'?'Ordered':'Mark ordered')+'</button></td></tr>').join('')+'</table>':
        '<strong>No acquisition requests yet.</strong><p style="font-size:13px;color:var(--color-text-2)">Add a suggested purchase above to demonstrate the workflow.</p>')
    );
  }
  window.pocAddAcquisition=function(){
    const title=document.getElementById('acqTitle').value.trim(); if(!title){toast('A title is required');return;}
    db.purchaseRequests=db.purchaseRequests||[];
    db.purchaseRequests.push({title,author:document.getElementById('acqAuthor').value.trim(),supplier:document.getElementById('acqSupplier').value.trim(),priority:document.getElementById('acqPriority').value,status:'Requested',createdAt:Date.now()});
    saveDB(db); renderAdminTab('acquisitions'); toast('Acquisition request added');
  };
  window.pocOrderAcquisition=function(i){db.purchaseRequests[i].status='Ordered';saveDB(db);renderAdminTab('acquisitions');toast('Marked as ordered');};

  function renderAuthority(){
    const names={}; (db.books||[]).forEach(b=>{if(b.author)names[b.author]=(names[b.author]||0)+1;});
    const rows=Object.entries(names).sort((a,b)=>a[0].localeCompare(b[0])).map(([n,c])=>'<tr><td><strong>'+esc(n)+'</strong></td><td>'+c+'</td><td><span class="status-pill active">Author</span></td></tr>').join('');
    return wrap('Authority Control',card(
      '<div class="notice">A controlled-authority workspace for normalising names and spotting duplicate author records. The POC derives authority candidates from the demo catalogue.</div>'+
      '<div style="display:grid;grid-template-columns:1fr auto;gap:10px;margin-bottom:16px"><input id="authorityName" placeholder="Add authority name"><button class="btn btn-primary" onclick="pocAddAuthority()">Add</button></div>'+
      '<table><tr><th>Authority name</th><th>Linked titles</th><th>Type</th></tr>'+
      (rows||'<tr><td colspan="3">No authority records yet.</td></tr>')+'</table>'));
  }
  window.pocAddAuthority=function(){const n=document.getElementById('authorityName').value.trim();if(!n){toast('Enter an authority name');return;}db.books=db.books||[];db.books.push({id:crypto.randomUUID(),title:'Authority placeholder',author:n,isbn:'',copies:0,cover:''});saveDB(db);renderAdminTab('authority');toast('Authority candidate added');};

  function renderBookReviews(){
    db.reviews=db.reviews||[];
    return wrap('Book Reviews',card(
      '<div class="notice">Moderate student reviews before publication. Approve, flag or remove demo reviews.</div>'+
      (db.reviews.length?'<table><tr><th>Book</th><th>Rating</th><th>Review</th><th>Status</th><th></th></tr>'+
      db.reviews.map((r,i)=>'<tr><td>'+esc(r.title||r.bookTitle||'Untitled')+'</td><td>'+('★'.repeat(Number(r.rating)||0)||'—')+'</td><td>'+esc(r.body||'—')+'</td><td><span class="status-pill '+(r.status==='approved'?'ready':'active')+'">'+esc(r.status||'pending')+'</span></td><td><button class="btn btn-tertiary" onclick="pocApproveReview('+i+')">Approve</button></td></tr>').join('')+'</table>':
      '<strong>No reviews awaiting moderation.</strong><p style="font-size:13px;color:var(--color-text-2)">Student-submitted reviews will appear here.</p>')+
      '<div style="margin-top:16px;display:flex;gap:8px"><button class="btn btn-secondary" onclick="pocSeedReview()">Create demo review</button></div>'));
  }
  window.pocSeedReview=function(){db.reviews=db.reviews||[];const b=db.books[0]||{title:'The Hobbit'};db.reviews.push({title:b.title,rating:5,body:'A great example review for the presentation.',status:'pending'});saveDB(db);renderAdminTab('bookReviews');};
  window.pocApproveReview=function(i){db.reviews[i].status='approved';saveDB(db);renderAdminTab('bookReviews');toast('Review approved');};

  function renderManualEntry(){
    return wrap('Manual Book Entry',card(
      '<div class="notice">Create a catalogue record manually when an item cannot be imported from an external source.</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
      '<div class="field"><label>Title</label><input id="meTitle" placeholder="Book title"></div><div class="field"><label>Author</label><input id="meAuthor" placeholder="Author name"></div>'+
      '<div class="field"><label>ISBN-13</label><input id="meIsbn" placeholder="978…"></div><div class="field"><label>Copies</label><input id="meCopies" type="number" min="1" value="1"></div>'+
      '<div class="field"><label>Publisher</label><input id="mePublisher" placeholder="Publisher"></div><div class="field"><label>Classification</label><input id="meClass" placeholder="e.g. FIC OSM"></div></div>'+
      '<button class="btn btn-primary" onclick="pocManualAdd()">Create catalogue record</button>'));
  }
  window.pocManualAdd=function(){const t=document.getElementById('meTitle').value.trim(),a=document.getElementById('meAuthor').value.trim();if(!t||!a){toast('Title and author are required');return;}db.books.push({id:crypto.randomUUID(),title:t,author:a,isbn:document.getElementById('meIsbn').value.trim(),copies:Number(document.getElementById('meCopies').value)||1,cover:'',publisher:document.getElementById('mePublisher').value.trim(),classification:document.getElementById('meClass').value.trim(),metadataSource:'manual'});saveDB(db);renderAdminTab('manualEntry');toast('Catalogue record created');};

  function renderListsAdmin(){
    db.readingLists=db.readingLists||[];
    return wrap('Lists',card(
      '<div style="display:flex;justify-content:space-between;align-items:center"><strong>Managed lists</strong><button class="btn btn-primary" onclick="pocCreateList()">+ New list</button></div>'+
      '<div style="margin-top:14px">'+(db.readingLists.length?db.readingLists.map(l=>'<div class="integration-row"><div><strong>'+esc(l.title)+'</strong><div style="font-size:12px;color:var(--color-text-2)">'+(l.items?.length||0)+' books · '+esc(l.visibility||'private')+'</div></div><span class="status-pill active">Active</span></div>').join(''):'<p style="font-size:13px;color:var(--color-text-2)">No managed lists yet.</p>')+'</div>'));
  }
  window.pocCreateList=function(){const title=prompt('List name:');if(!title)return;db.readingLists.push({id:crypto.randomUUID(),title,visibility:'school',items:[]});saveDB(db);renderAdminTab('listsAdmin');toast('List created');};

  function renderBookLists(){
    db.readingLists=db.readingLists||[];
    const books=db.books||[];
    return wrap('Book Lists',card(
      '<div class="notice">Build curated lists from catalogue records — ideal for holiday reading, subject reading and staff recommendations.</div>'+
      '<div style="display:flex;gap:8px;margin-bottom:14px"><input id="blTitle" placeholder="New curated list name"><button class="btn btn-primary" onclick="pocCreateBookList()">Create</button></div>'+
      (db.readingLists.filter(l=>l.visibility==='school').map(l=>'<div class="card" style="margin:10px 0"><strong>'+esc(l.title)+'</strong><div style="font-size:12px;color:var(--color-text-2);margin:4px 0 10px">'+(l.items?.length||0)+' book(s)</div><select onchange="pocAddToList(this.value,\''+l.id+'\')"><option value="">Add a book…</option>'+books.map(b=>'<option value="'+b.id+'">'+esc(b.title)+'</option>').join('')+'</select></div>').join('')||'<p style="font-size:13px;color:var(--color-text-2)">Create a curated list to get started.</p>')));
  }
  window.pocCreateBookList=function(){const t=document.getElementById('blTitle').value.trim();if(!t){toast('Enter a list name');return;}db.readingLists.push({id:crypto.randomUUID(),title:t,visibility:'school',items:[]});saveDB(db);renderAdminTab('bookLists');};
  window.pocAddToList=function(bookId,listId){if(!bookId)return;const l=db.readingLists.find(x=>x.id===listId);if(!l)return;l.items=l.items||[];if(!l.items.some(x=>(x.bookId||x)===bookId))l.items.push({bookId});saveDB(db);renderAdminTab('bookLists');toast('Book added to list');};

  function renderIntegrationsPOC(){
    return wrap('Integrations & API Keys',card(
      '<div class="notice warn"><strong>POC rule:</strong> credentials are never required in the frontend. Oliver V5 and Groq keys belong in the backend environment. VLeBooks is intentionally configurable because vendor API access is not publicly documented enough to invent a credential flow.</div>'+
      '<h3 style="margin:0 0 10px">Oliver V5 / Softlink</h3>'+
      '<div class="field"><label>WSDL URL</label><input id="oliverWsdl" placeholder="http://server:port/application-prefix/OpacAccess?wsdl"></div>'+
      '<div class="field"><label>Corporation alias</label><input id="oliverCorp" placeholder="Abingdon"></div>'+
      '<div class="field"><label>Encrypted client alias</label><input id="oliverAlias" placeholder="Configured server-side"></div>'+
      '<div class="field"><label>Encrypted client password</label><input id="oliverPass" type="password" placeholder="Configured server-side"></div>'+
      '<div style="display:flex;gap:8px"><button class="btn btn-secondary" onclick="pocOliverTest()">Test Oliver connection</button><button class="btn btn-primary" onclick="pocOliverSearch()">Search Oliver catalogue</button></div>'+
      '<div id="oliverResult" style="margin-top:14px"></div>'+
      '<hr style="border:0;border-top:1px solid var(--color-border);margin:22px 0">'+
      '<h3 style="margin:0 0 10px">AI — Groq</h3><p style="font-size:13px;color:var(--color-text-2)">Set <code>GROQ_API_KEY</code> on the backend. The existing AI service already routes requests server-side through Groq.</p>'+
      '<div style="display:flex;gap:8px"><input id="aiDemoPrompt" placeholder="e.g. Recommend a mystery for a Year 9 reader"><button class="btn btn-primary" onclick="pocAskAI()">Ask Hooke AI</button></div><div id="aiResult" style="margin-top:12px"></div>'+
      '<hr style="border:0;border-top:1px solid var(--color-border);margin:22px 0">'+
      '<h3 style="margin:0 0 10px">VLeBooks</h3><p style="font-size:13px;color:var(--color-text-2)">POC adapter slot ready. Add the vendor endpoint/key only after VLeBooks supplies the approved API documentation and credentials.</p>'
    ));
  }
  async function pocOliverSearch(){
    const q=prompt('Search Oliver V5 catalogue:','The Hobbit');if(!q)return;
    const out=document.getElementById('oliverResult');out.innerHTML='<div class="notice">Searching Oliver…</div>';
    try{const r=await fetch('/api/integrations/oliver/search?q='+encodeURIComponent(q));const d=await r.json();if(!r.ok)throw new Error(d.error||'Unavailable');out.innerHTML='<div class="notice">'+esc(JSON.stringify(d.results||d).slice(0,6000))+'</div>';}catch(e){out.innerHTML='<div class="notice warn">Live Oliver is not connected yet. The UI is ready; add the server-side Softlink credentials in the backend environment.</div>';}
  }
  async function pocOliverTest(){const out=document.getElementById('oliverResult');out.innerHTML='<div class="notice">Testing server-side Oliver configuration…</div>';try{const r=await fetch('/api/integrations/oliver/status');const d=await r.json();out.innerHTML='<div class="notice">'+esc(d.message||JSON.stringify(d))+'</div>';}catch(e){out.innerHTML='<div class="notice warn">Backend integration endpoint is not reachable from this static demo.</div>';}}
  async function pocAskAI(){const p=document.getElementById('aiDemoPrompt').value.trim();if(!p)return;const out=document.getElementById('aiResult');out.innerHTML='<div class="notice">Asking Hooke AI…</div>';try{const r=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:p})});const d=await r.json();out.innerHTML='<div class="card"><strong>Hooke AI</strong><p style="white-space:pre-wrap">'+esc(d.reply||d.error||'No response')+'</p></div>';}catch(e){out.innerHTML='<div class="notice warn">AI is available when the backend is running with GROQ_API_KEY and an authenticated demo session.</div>';}}
})();
