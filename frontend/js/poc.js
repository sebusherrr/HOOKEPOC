/* HOOKE POC modules — presentation-ready demo layer.
   Uses localStorage for safe browser-only demo persistence. Live integrations stay server-side. */
(function(){
  const modules = {
    acquisitions:{label:'Acquisitions',section:'Library Operations',roles:['librarian','head_of_library'],render:renderAcquisitions},
    authority:{label:'Authority Control',section:'Library Operations',roles:['librarian','head_of_library'],render:renderAuthority},
    bookReviews:{label:'Book Reviews',section:'Community',roles:['librarian','head_of_library'],render:renderBookReviews},
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
    const cart=requests.filter(r=>r.brownsCart===true);
    const cartQty=cart.reduce((sum,r)=>sum+(Number(r.quantity)||1),0);
    return wrap('Acquisitions',
      card(
        '<div class="notice">Create a request for a book or another library item. Book requests can be added to Hooke’s Brown’s Books order basket, then copied/exported for entry into the supplier’s real cart. Direct Brown’s Books cart integration needs an approved supplier API or account integration.</div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
        '<div class="field"><label>Item type</label><select id="acqType" onchange="pocAcqTypeChanged()"><option value="book">Book</option><option value="other">Other item</option></select></div>'+
        '<div class="field"><label>Title / item name</label><input id="acqTitle" placeholder="The Thursday Murder Club" required></div>'+
        '<div class="field"><label>Author (books)</label><input id="acqAuthor" placeholder="Richard Osman"></div>'+
        '<div class="field"><label>ISBN (books)</label><input id="acqIsbn" placeholder="978…"></div>'+
        '<div class="field"><label>Quantity</label><input id="acqQuantity" type="number" min="1" step="1" value="1"></div>'+
        '<div class="field"><label>Estimated unit price (£)</label><input id="acqPrice" type="number" min="0" step="0.01" placeholder="Optional"></div>'+
        '<div class="field"><label>Supplier</label><input id="acqSupplier" value="Brown’s Books" placeholder="Supplier / wholesaler"></div>'+
        '<div class="field"><label>Priority</label><select id="acqPriority"><option>Normal</option><option>High</option><option>Urgent</option></select></div></div>'+
        '<button class="btn btn-primary" onclick="pocAddAcquisition()">Add acquisition request</button>'
      )+
      card('<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div><h3 style="margin:0">Brown’s Books order basket</h3><p style="font-size:13px;color:var(--color-text-2);margin:5px 0 0">'+cart.length+' title(s), '+cartQty+' item(s). This is a Hooke handoff basket, not the supplier’s live cart.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-secondary" onclick="pocCopyBrownsCart()">Copy order list</button><button class="btn btn-tertiary" onclick="pocExportBrownsCart()">Export CSV</button></div></div>'+
        (cart.length?'<table><tr><th>Title</th><th>ISBN</th><th>Qty</th><th></th></tr>'+cart.map(r=>'<tr><td>'+esc(r.title)+'</td><td>'+esc(r.isbn||'—')+'</td><td>'+esc(r.quantity||1)+'</td><td><button class="btn btn-tertiary" onclick="pocRemoveFromBrownsCart(\''+r.id+'\')">Remove</button></td></tr>').join('')+'</table>':'<p style="font-size:13px;color:var(--color-text-2)">Add a book below, then use Copy order list or Export CSV to transfer the details into Brown’s Books.</p>')
      )+
      card(requests.length?'<table><tr><th>Type</th><th>Title / item</th><th>Author</th><th>Supplier</th><th>Priority</th><th>Status</th><th>Actions</th></tr>'+
        requests.map((r,i)=>'<tr><td>'+esc(r.itemType||'book')+'</td><td>'+esc(r.title)+'</td><td>'+esc(r.author||'—')+'</td><td>'+esc(r.supplier||'—')+'</td><td>'+esc(r.priority||'Normal')+'</td><td><span class="status-pill '+(r.status==='Ordered'?'ready':'active')+'">'+esc(r.status||'Requested')+'</span></td><td>'+(r.itemType==='other'?'<span style="color:var(--color-text-2)">General request</span>':(r.brownsCart?'<button class="btn btn-tertiary" onclick="pocRemoveFromBrownsCart(\''+r.id+'\')">In Brown’s basket · Remove</button>':'<button class="btn btn-secondary" onclick="pocAddToBrownsCart(\''+r.id+'\')">Add to Brown’s cart</button>'))+' <button class="btn btn-tertiary" onclick="pocOrderAcquisition('+i+')">'+(r.status==='Ordered'?'Ordered':'Mark ordered')+'</button></td></tr>').join('')+'</table>':'<strong>No acquisition requests yet.</strong><p style="font-size:13px;color:var(--color-text-2)">Add a book or another item above to get started.</p>')
    );
  }
  window.pocAcqTypeChanged=function(){
    const isBook=document.getElementById('acqType').value==='book';
    document.getElementById('acqAuthor').disabled=!isBook;
    document.getElementById('acqIsbn').disabled=!isBook;
    if(!isBook){document.getElementById('acqSupplier').value='';}
    else if(!document.getElementById('acqSupplier').value.trim()){document.getElementById('acqSupplier').value='Brown’s Books';}
  };
  window.pocAddAcquisition=function(){
    const title=document.getElementById('acqTitle').value.trim(); if(!title){toast('A title or item name is required');return;}
    const itemType=document.getElementById('acqType').value;
    const quantity=Math.max(1,Math.floor(Number(document.getElementById('acqQuantity').value)||1));
    const rawPrice=document.getElementById('acqPrice').value;
    db.purchaseRequests=db.purchaseRequests||[];
    db.purchaseRequests.push({id:crypto.randomUUID(),itemType,title,author:itemType==='book'?document.getElementById('acqAuthor').value.trim():'',isbn:itemType==='book'?document.getElementById('acqIsbn').value.trim():'',quantity,estimatedUnitPrice:rawPrice===''?null:Number(rawPrice),supplier:document.getElementById('acqSupplier').value.trim()||(itemType==='book'?'Brown’s Books':''),priority:document.getElementById('acqPriority').value,status:'Requested',brownsCart:false,createdAt:Date.now()});
    saveDB(db); renderAdminTab('acquisitions'); toast('Acquisition request added');
  };
  window.pocAddToBrownsCart=function(id){
    const item=(db.purchaseRequests||[]).find(r=>r.id===id);
    if(!item||item.itemType==='other'){toast('Only book requests can be added to the Brown’s Books basket');return;}
    item.brownsCart=true; item.supplier='Brown’s Books'; saveDB(db); renderAdminTab('acquisitions'); toast('Book added to Hooke’s Brown’s Books basket');
  };
  window.pocRemoveFromBrownsCart=function(id){
    const item=(db.purchaseRequests||[]).find(r=>r.id===id); if(!item)return;
    item.brownsCart=false; saveDB(db); renderAdminTab('acquisitions'); toast('Removed from Brown’s Books basket');
  };
  function brownsCartText(){
    return (db.purchaseRequests||[]).filter(r=>r.brownsCart===true).map(r=>[r.title,r.author||'',r.isbn||'',r.quantity||1,r.estimatedUnitPrice??''].join('\t')).join('\n');
  }
  window.pocCopyBrownsCart=async function(){
    const items=brownsCartText(); if(!items){toast('The Brown’s Books basket is empty');return;}
    try{await navigator.clipboard.writeText('Title\tAuthor\tISBN\tQuantity\tEstimated unit price (£)\n'+items);toast('Order list copied. Paste it into your Brown’s Books ordering workflow.');}
    catch(e){toast('Clipboard access is unavailable. Use Export CSV instead.');}
  };
  window.pocExportBrownsCart=function(){
    const rows=(db.purchaseRequests||[]).filter(r=>r.brownsCart===true);
    if(!rows.length){toast('The Brown’s Books basket is empty');return;}
    const csvCell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
    const csv=[['Title','Author','ISBN','Quantity','Estimated unit price GBP'],...rows.map(r=>[r.title,r.author||'',r.isbn||'',r.quantity||1,r.estimatedUnitPrice??''])].map(row=>row.map(csvCell).join(',')).join('\r\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='hooke-browns-books-order.csv';a.click();URL.revokeObjectURL(url);
    toast('Brown’s Books order CSV exported');
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
  window.pocManualAdd=function(){const t=document.getElementById('meTitle').value.trim(),a=document.getElementById('meAuthor').value.trim();if(!t||!a){toast('Title and author are required');return;}db.books=db.books||[];const book={id:crypto.randomUUID(),title:t,author:a,isbn:document.getElementById('meIsbn').value.trim(),copies:Number(document.getElementById('meCopies').value)||1,cover:'',publisher:document.getElementById('mePublisher').value.trim(),classification:document.getElementById('meClass').value.trim(),metadataSource:'manual',createdAt:Date.now()};db.books.push(book);saveDB(db);renderAdminTab('manualEntry');if(typeof renderStudentHome==='function')renderStudentHome();if(typeof renderCatalogueTab==='function')renderCatalogueTab();toast('Book saved to this browser and added to the catalogue');};

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
