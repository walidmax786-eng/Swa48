// Single-law reading + all-laws view + search + jump + remember last law.
// Storage is guarded: if the browser blocks storage, the app still works in memory.
const store = {
  get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
};
let current = 1;
const saved = parseInt(store.get('laws48_last') || '1', 10);
if (saved >= 1 && saved <= 48) current = saved;

const $ = (id) => document.getElementById(id);
const singleView = $('singleView'), allView = $('allView');

function escapeHtml(s){
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function lawCard(law){
  return `<article class="law-card">
    <div class="law-number">ল ${law.n} / ৪৮</div>
    <div class="block law-block">
      <h2 class="law-title">${escapeHtml(law.title)}</h2>
      <p class="law-meaning"><span class="label">অর্থ:</span> ${escapeHtml(law.meaning)}</p>
    </div>
    <div class="block explanation-block">
      <h3 class="section-title blue-title">ব্যাখ্যা</h3>
      <p class="explanation">${escapeHtml(law.explanation)}</p>
    </div>
    <div class="block example-block">
      <h3 class="section-title yellow-title">উদাহরণ</h3>
      <p class="example">${escapeHtml(law.example)}</p>
    </div>
  </article>`;
}

function renderSingle(){
  const law = LAWS[current - 1];
  $('lawNumber').textContent = `ল ${law.n} / ৪৮`;
  $('lawTitle').textContent = law.title;
  $('lawMeaning').textContent = law.meaning;
  $('lawExplanation').textContent = law.explanation;
  $('lawExample').textContent = law.example;
  $('progressBar').style.width = ((current / 48) * 100) + '%';
  $('prevBtn').disabled = current <= 1;
  $('nextBtn').disabled = current >= 48;
  $('jumpSelect').value = String(current);
  store.set('laws48_last', String(current));
  window.scrollTo({top: 0, behavior: 'smooth'});
}

function renderAll(list){
  allView.innerHTML = list.map(lawCard).join('') || '<p>কিছু পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজুন।</p>';
}

function renderDrawer(list){
  $('drawerList').innerHTML = list.map(l =>
    `<button type="button" data-n="${l.n}" class="${l.n === current ? 'active' : ''}"><strong>${l.n}.</strong> ${escapeHtml(l.title)} — ${escapeHtml(l.meaning)}</button>`
  ).join('');
}

// Jump dropdown
LAWS.forEach(l => {
  const o = document.createElement('option');
  o.value = String(l.n); o.textContent = `ল ${l.n} — ${l.title}`;
  $('jumpSelect').appendChild(o);
});

$('prevBtn').onclick = () => { if (current > 1){ current--; renderSingle(); renderDrawer(LAWS); } };
$('nextBtn').onclick = () => { if (current < 48){ current++; renderSingle(); renderDrawer(LAWS); } };
$('jumpSelect').onchange = (e) => { current = parseInt(e.target.value, 10); showSingle(); renderDrawer(LAWS); };
document.addEventListener('keydown', (e) => {
  if (singleView.hidden) return;
  if (e.key === 'ArrowRight' && current < 48){ current++; renderSingle(); renderDrawer(LAWS); }
  if (e.key === 'ArrowLeft' && current > 1){ current--; renderSingle(); renderDrawer(LAWS); }
});

function showSingle(){
  singleView.hidden = false; allView.hidden = true;
  $('oneBtn').classList.add('active'); $('allBtn').classList.remove('active');
  renderSingle();
}
function showAll(){
  singleView.hidden = true; allView.hidden = false;
  $('oneBtn').classList.remove('active'); $('allBtn').classList.add('active');
  renderAll(LAWS);
  $('progressBar').style.width = '100%';
}
$('oneBtn').onclick = showSingle;
$('allBtn').onclick = showAll;

$('listBtn').onclick = () => { renderDrawer(LAWS); $('drawer').hidden = false; };
$('closeDrawer').onclick = () => { $('drawer').hidden = true; };
$('drawer').addEventListener('click', (e) => { if (e.target.id === 'drawer') $('drawer').hidden = true; });
$('drawerList').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-n]');
  if (!b) return;
  current = parseInt(b.dataset.n, 10);
  $('drawer').hidden = true;
  showSingle(); renderDrawer(LAWS);
});

// Search: in single view it jumps to the first match; in all view it filters.
$('searchInput').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!q){ renderDrawer(LAWS); if (!allView.hidden) renderAll(LAWS); return; }
  const matches = LAWS.filter(l =>
    l.title.toLowerCase().includes(q) || l.meaning.includes(q) ||
    l.explanation.includes(q) || l.example.includes(q));
  renderDrawer(matches);
  if (!allView.hidden) renderAll(matches);
  else if (matches.length){ current = matches[0].n; renderSingle(); }
});

renderSingle();
renderDrawer(LAWS);
renderAll(LAWS);
allView.hidden = true;
