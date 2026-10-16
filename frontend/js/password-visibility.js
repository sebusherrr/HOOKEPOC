(function(){
  function addPasswordToggles(){
    document.querySelectorAll('input[type="password"]').forEach(function(input){
      if(input.dataset.visibilityToggle==='1')return;
      input.dataset.visibilityToggle='1';
      const wrap=document.createElement('span');wrap.style.cssText='display:flex;gap:8px;align-items:center;width:100%';
      input.parentNode.insertBefore(wrap,input);wrap.appendChild(input);input.style.flex='1';input.style.minWidth='0';
      const button=document.createElement('button');button.type='button';button.className='btn btn-tertiary';button.textContent='Show';button.setAttribute('aria-label','Show password');button.style.whiteSpace='nowrap';
      button.addEventListener('click',function(){const show=input.type==='password';input.type=show?'text':'password';button.textContent=show?'Hide':'Show';button.setAttribute('aria-label',(show?'Hide':'Show')+' password');});
      wrap.appendChild(button);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addPasswordToggles);else addPasswordToggles();
  new MutationObserver(addPasswordToggles).observe(document.documentElement,{childList:true,subtree:true});
})();