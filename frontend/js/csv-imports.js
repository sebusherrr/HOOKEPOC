/* CSV import enhancements for the Hooke browser demo.
   Real student print codes must be stored and served by a secured backend, not localStorage. */
(function(){
  db.printCodes = db.printCodes || [];
  ADMIN_TABS.import.roles = ['librarian','head_of_library'];
  ADMIN_TABS.import.label = '⬆ Book CSV Import';
  ADMIN_TABS.printcodes = {
    label:'🖨 Student Print Codes', section:'Community',
    roles:['librarian','head_of_library'], render:function(){return window.adminPrintCodes();}
  };

  function esc(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function parseText(raw){
    raw=String(raw||'').replace(/^\uFEFF/,'').trim();
    if(!raw)return {headers:[],rows:[],error:'Choose a CSV file or paste CSV text first.'};
    var matrix=[],row=[],field='',quoted=false;
    for(var i=0;i<raw.length;i++){
      var ch=raw[i];
      if(ch==='"'){
        if(quoted&&raw[i+1]==='"'){field+='"';i++;}
        else quoted=!quoted;
      }else if(ch===','&&!quoted){row.push(field);field='';}
      else if((ch==='\n'||ch==='\r')&&!quoted){
        if(ch==='\r'&&raw[i+1]==='\n')i++;
        row.push(field);matrix.push(row);row=[];field='';
      }else field+=ch;
    }
    if(quoted)return {headers:[],rows:[],error:'A quoted field is not closed. Check the CSV export.'};
    if(field.length||row.length){row.push(field);matrix.push(row);}
    var headers=(matrix.shift()||[]).map(function(h){return h.trim().toLowerCase().replace(/^\uFEFF/,'').replace(/[\s-]+/g,'_');});
    if(!headers.length||headers.every(function(h){return !h;}))return {headers:[],rows:[],error:'The CSV header row is missing.'};
    var rows=matrix.filter(function(r){return r.some(function(v){return String(v||'').trim();});}).map(function(values,index){
      var obj={_line:index+2};headers.forEach(function(h,j){if(h)obj[h]=String(values[j] == null ? '' : values[j]).trim();});return obj;
    });
    return {headers:headers,rows:rows,error:''};
  }
  function fileToText(file,target,preview){
    if(!file)return;
    if(!/\.csv$/i.test(file.name)&&file.type!=='text/csv'){toast('Please save the Excel workbook as a .csv file first.');return;}
    file.text().then(function(text){
      var input=document.getElementById(target);if(!input)return;
      input.value=text.replace(/^\uFEFF/,'');if(preview)preview();toast('CSV loaded — check the preview before importing');
    }).catch(function(){toast('Could not read the file. Try exporting as CSV UTF-8.');});
  }
  window.readBookCSVFile=function(file){fileToText(file,'csvInput',previewCSV);};
  window.adminImport=function(){
    return '<div class="admin-header"><h2>Book CSV Import</h2></div>'+
      '<div class="notice">This proof of concept saves imported books in this browser only; it does not update a live school database.</div>'+
      '<div class="card"><div class="field"><label for="bookCsvFile">Choose a CSV file exported from Excel</label><input id="bookCsvFile" type="file" accept=".csv,text/csv" onchange="readBookCSVFile(this.files[0])"></div>'+
      '<div class="csv-drop">Or paste CSV text below<br><span style="font-size:11.5px">Required columns: title, author. Optional: isbn, copies, cover. Headers are case-insensitive.</span></div>'+
      '<textarea id="csvInput" rows="7" placeholder="title,author,isbn,copies&#10;Never Let Me Go,Kazuo Ishiguro,9780571273188,2"></textarea>'+
      '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-secondary" onclick="previewCSV()">Preview and validate</button><button class="btn btn-primary" onclick="commitCSV()">Import valid rows</button><button class="btn btn-tertiary" onclick="clearBookCSV()">Clear</button></div>'+
      '<div id="csvPreview" style="margin-top:16px"></div></div>'+
      '<div class="card"><strong>Excel upload tips</strong><ul style="margin-bottom:0;color:var(--color-text-2);font-size:13px"><li>In Excel choose File → Save As → CSV UTF-8 (Comma delimited) (*.csv).</li><li>Upload the .csv file, not the original .xlsx workbook.</li><li>The first row must contain column headers such as title and author.</li><li>Quoted fields containing commas are supported.</li></ul></div>';
  };
  ADMIN_TABS.import.render=window.adminImport;
  window.clearBookCSV=function(){document.getElementById('csvInput').value='';document.getElementById('bookCsvFile').value='';document.getElementById('csvPreview').innerHTML='';};
  window.parseCSV=function(){
    var p=parseText(document.getElementById('csvInput').value);window._bookCSVError=p.error;
    return p.rows.map(function(r){
      return Object.assign({},r,{title:r.title||r.book_title||r.name||'',author:r.author||r.authors||'',isbn:r.isbn||r.isbn13||r.isbn_13||'',copies:r.copies||r.copy_count||r.quantity||'1',cover:r.cover||r.cover_url||r.image_url||''});
    });
  };
  window.previewCSV=function(){
    var rows=parseCSV(),el=document.getElementById('csvPreview');
    if(window._bookCSVError){el.innerHTML='<div class="notice warn">'+esc(window._bookCSVError)+'</div>';return;}
    if(!rows.length){el.innerHTML='<p>No data rows found. Check the header row.</p>';return;}
    var checked=rows.map(function(r){var copies=Number(r.copies||1);return Object.assign({},r,{issue:!r.title?'Missing title':!r.author?'Missing author':(!Number.isFinite(copies)||copies<0)?'Copies must be zero or a positive number':''});});
    var valid=checked.filter(function(r){return !r.issue;});
    var dupes=valid.filter(function(r){return r.isbn&&db.books.some(function(b){return String(b.isbn||'').trim()===r.isbn;});}).length;
    el.innerHTML='<div class="notice">'+rows.length+' row(s) · '+valid.length+' valid · '+(checked.length-valid.length)+' invalid · '+dupes+' existing ISBN duplicate(s), which will be skipped.</div>'+
      '<div style="overflow-x:auto"><table><tr><th>Line</th><th>Title</th><th>Author</th><th>ISBN</th><th>Copies</th><th>Validation</th></tr>'+
      checked.slice(0,100).map(function(r){return '<tr><td>'+r._line+'</td><td>'+esc(r.title||'—')+'</td><td>'+esc(r.author||'—')+'</td><td>'+esc(r.isbn||'—')+'</td><td>'+esc(r.copies||'1')+'</td><td>'+esc(r.issue||'Ready')+'</td></tr>';}).join('')+
      '</table></div>'+(checked.length>100?'<p>Showing first 100 rows of '+checked.length+'.</p>':'');
  };
  window.commitCSV=function(){
    var rows=parseCSV(),el=document.getElementById('csvPreview');
    if(window._bookCSVError){el.innerHTML='<div class="notice warn">'+esc(window._bookCSVError)+'</div>';return;}
    var added=0,dup=0,failed=0,errors=[];
    rows.forEach(function(r){
      var copies=Number(r.copies||1);
      if(!r.title||!r.author||!Number.isFinite(copies)||copies<0){failed++;errors.push('Line '+r._line+': '+(!r.title?'missing title':!r.author?'missing author':'invalid copies value'));return;}
      if(r.isbn&&db.books.some(function(b){return String(b.isbn||'').trim()===r.isbn;})){dup++;return;}
      db.books.push({id:crypto.randomUUID(),title:r.title,author:r.author,isbn:r.isbn,copies:Math.floor(copies),cover:r.cover||''});added++;
    });
    saveDB(db);
    el.innerHTML='<div class="notice">Import finished: <strong>'+added+' added</strong>, '+dup+' duplicate ISBN(s) skipped, '+failed+' invalid row(s) skipped.</div>'+
      (errors.length?'<details style="margin-top:10px"><summary>Show row errors</summary><ul>'+errors.slice(0,100).map(function(e){return '<li>'+esc(e)+'</li>';}).join('')+'</ul></details>':'')+
      '<p style="font-size:12.5px;color:var(--color-text-2)">Saved to this browser demo only.</p>';
    if(added){if(typeof renderStudentHome==='function')renderStudentHome();if(typeof renderCatalogueTab==='function')renderCatalogueTab();}
    toast('Book CSV import finished');
  };

  window.readPrintCodesFile=function(file){fileToText(file,'printCodesInput',previewPrintCodes);};
  function getCodeRows(){
    var p=parseText(document.getElementById('printCodesInput').value);
    if(p.error)return {rows:[],error:p.error};
    return {rows:p.rows.map(function(r){return {
      line:r._line,email:r.email||r.student_email||r.school_email||'',
      studentId:r.student_id||r.studentid||r.pupil_id||r.id||'',
      name:r.name||r.student_name||r.full_name||'',
      code:r.code||r.print_code||r.printcode||r.printer_code||''
    };}),error:''};
  }
  window.adminPrintCodes=function(){
    db.printCodes=db.printCodes||[];
    return '<div class="admin-header"><h2>Student Print Codes</h2></div>'+
      '<div class="notice warn"><strong>Demo mode:</strong> this prototype stores imported records in this browser only. Six-digit print codes are sensitive account information. Do not import real codes until this is connected to the school’s authenticated backend with restricted access and secure storage.</div>'+
      '<div class="card"><h3 style="margin-top:0">Import from Excel</h3><p style="font-size:13px;color:var(--color-text-2)">Export your workbook as CSV UTF-8. Keep the code column formatted as text in Excel so leading zeroes are preserved.</p>'+
      '<div class="field"><label for="printCodesFile">Choose CSV file</label><input id="printCodesFile" type="file" accept=".csv,text/csv" onchange="readPrintCodesFile(this.files[0])"></div>'+
      '<div class="field"><label for="printCodesInput">Or paste CSV text</label><textarea id="printCodesInput" rows="5" placeholder="email,student_id,name,code&#10;student@abingdon.org.uk,123456,Student Name,012345"></textarea></div>'+
      '<p style="font-size:12px;color:var(--color-text-2)">Required: a student identifier (email, student_id or name) and a code column. Codes must be exactly six digits.</p>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-secondary" onclick="previewPrintCodes()">Preview</button><button class="btn btn-primary" onclick="commitPrintCodes()">Import print codes</button></div><div id="printCodesPreview" style="margin-top:14px"></div></div>'+
      '<div class="card"><div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><strong>Imported records · '+db.printCodes.length+'</strong><button class="btn btn-tertiary" onclick="exportPrintCodesTemplate()">Download CSV template</button></div>'+
      '<p style="font-size:12.5px;color:var(--color-text-2)">Codes are masked in the staff list. Browser-only storage is not suitable for real school codes.</p>'+
      (db.printCodes.length?'<table><tr><th>Student</th><th>Identifier</th><th>Print code</th></tr>'+db.printCodes.map(function(r){return '<tr><td>'+esc(r.name||'—')+'</td><td>'+esc(r.email||r.studentId||'—')+'</td><td>••••••</td></tr>';}).join('')+'</table>':'<p>No print codes imported yet.</p>')+'</div>';
  };
  window.previewPrintCodes=function(){
    var p=getCodeRows(),el=document.getElementById('printCodesPreview');
    if(p.error){el.innerHTML='<div class="notice warn">'+esc(p.error)+'</div>';return;}
    if(!p.rows.length){el.innerHTML='<p>No rows found. Check the header row.</p>';return;}
    var rows=p.rows.map(function(r){return Object.assign({},r,{issue:!/^\d{6}$/.test(r.code)?'Code must be exactly six digits':(!r.email&&!r.studentId&&!r.name)?'Student identifier missing':''});});
    el.innerHTML='<div class="notice">'+rows.length+' row(s) · '+rows.filter(function(r){return !r.issue;}).length+' valid · '+rows.filter(function(r){return r.issue;}).length+' invalid. Codes are hidden in this preview.</div>'+
      '<div style="overflow-x:auto"><table><tr><th>Line</th><th>Student</th><th>Identifier</th><th>Code</th><th>Status</th></tr>'+
      rows.slice(0,100).map(function(r){return '<tr><td>'+r.line+'</td><td>'+esc(r.name||'—')+'</td><td>'+esc(r.email||r.studentId||'—')+'</td><td>••••••</td><td>'+esc(r.issue||'Ready')+'</td></tr>';}).join('')+'</table></div>';
  };
  window.commitPrintCodes=function(){
    var p=getCodeRows(),el=document.getElementById('printCodesPreview');
    if(p.error){el.innerHTML='<div class="notice warn">'+esc(p.error)+'</div>';return;}
    db.printCodes=db.printCodes||[];var added=0,updated=0,failed=0,errors=[];
    p.rows.forEach(function(r){
      if(!/^\d{6}$/.test(r.code)||(!r.email&&!r.studentId&&!r.name)){failed++;errors.push('Line '+r.line+': invalid six-digit code or missing student identifier');return;}
      var existing=db.printCodes.find(function(x){return (r.email&&x.email&&x.email.toLowerCase()===r.email.toLowerCase())||(r.studentId&&x.studentId&&x.studentId===r.studentId)||(!r.email&&!r.studentId&&r.name&&x.name&&x.name.toLowerCase()===r.name.toLowerCase());});
      var record={email:r.email.toLowerCase(),studentId:r.studentId,name:r.name,code:r.code,updatedAt:Date.now()};
      if(existing){Object.assign(existing,record);updated++;}else{db.printCodes.push(Object.assign({id:crypto.randomUUID()},record));added++;}
    });
    saveDB(db);
    el.innerHTML='<div class="notice">Import finished: <strong>'+added+' added</strong>, '+updated+' updated, '+failed+' invalid row(s) skipped.</div>'+
      (errors.length?'<ul>'+errors.slice(0,100).map(function(e){return '<li>'+esc(e)+'</li>';}).join('')+'</ul>':'')+
      '<p>Demo browser storage only. Codes are not displayed in this result.</p>';
    renderAdminTab('printcodes');
  };
  window.exportPrintCodesTemplate=function(){
    var csv='email,student_id,name,code\r\nstudent@abingdon.org.uk,123456,Student Name,012345\r\n';
    var blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='hooke-print-codes-template.csv';a.click();URL.revokeObjectURL(url);
  };

  // The student's profile can match a code by the signed-in email. This is only a
  // browser-demo display; real deployments must fetch it after server-side authorisation.
  var oldProfile=window.studentExtraProfile;
  window.studentExtraProfile=function(){
    if(typeof oldProfile==='function')oldProfile();
    var u=window.currentUser||{},email=String(u.email||'').toLowerCase();
    var rec=(db.printCodes||[]).find(function(r){return r.email&&r.email.toLowerCase()===email;});
    var main=document.querySelector('[data-student-extra-page]');
    if(!rec||!main)return;
    var card=document.createElement('section');card.className='student-extra-panel';card.style.marginTop='14px';
    card.innerHTML='<h3>Printer access</h3><p>Your six-digit school printer code is available below. Keep it private.</p><div style="font-size:26px;font-weight:650;letter-spacing:.18em">'+esc(rec.code)+'</div>';
    main.appendChild(card);
  };
})();
