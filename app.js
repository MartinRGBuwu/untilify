// SPA hash routing with short IDs, plus friendly status messages

const DEFAULT_ID = 'uclfinal';

function getId() {
  // 1) If there’s a hash like #/dune3, use it
  const h = location.hash || '';
  const hashId = h.replace(/^#\/?/, '').split('/')[0]?.trim();
  if (hashId) return hashId;

  // 2) Else read the path: /dune3  (works in Live Server and custom domains)
  const parts = location.pathname.split('/').filter(Boolean);

  // On GitHub Pages project sites the first part is the repo name (untilify)
  if (parts.length >= 2 && parts[0].toLowerCase() === 'untilify') {
    return parts[1] || '';
  }

  // On local or custom domain, the id is the first segment
  return parts[0] || '';
}


function parseLocalish(isoLike) {
  if (!isoLike) return null;
  const normalized = isoLike.replace(' ', 'T');
  const d = new Date(normalized);
  return isNaN(d) ? null : d;
}

let eventDate = null;
let timerHandle = null;

async function loadAndRender(id) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = '';
  statusEl.className = 'status';

  // Load our static "database" (disable cache so edits show immediately)
  const res = await fetch('data.json', { cache: 'no-store' });
  const data = await res.json();

  const evt = data[id];
  if (!evt) {
    document.getElementById('eventName').textContent = 'Event not found';
    document.getElementById('eventDateText').textContent = '';
    statusEl.textContent = 'No event found for this link.';
    statusEl.classList.add('status--err');
    eventDate = null;
    if (timerHandle) clearInterval(timerHandle);
    ['d','h','m','s'].forEach(k => document.getElementById(k).textContent = '00');
    return;
  }

  document.getElementById('eventName').textContent = evt.name || id;
  eventDate = parseLocalish(evt.at);

  if (!eventDate) {
    document.getElementById('eventDateText').textContent = '';
    statusEl.textContent = 'Invalid date format for this event.';
    statusEl.classList.add('status--err');
    return;
  }

  document.getElementById('eventDateText').textContent = `Target: ${eventDate.toLocaleString()}`;

  if (timerHandle) clearInterval(timerHandle);
  update();
  timerHandle = setInterval(update, 1000);
}

function update() {
  const statusEl = document.getElementById('status');
  if (!eventDate) return;

  const now = new Date();
  let diff = eventDate - now;

  if (diff <= 0) {
    ['d','h','m','s'].forEach(k => document.getElementById(k).textContent = '00');
    statusEl.textContent = 'Event started!';
    statusEl.classList.add('status--warn');
    clearInterval(timerHandle);
    return;
  }

  const sec = Math.floor(diff / 1000) % 60;
  const min = Math.floor(diff / (1000*60)) % 60;
  const hr  = Math.floor(diff / (1000*60*60)) % 24;
  const day = Math.floor(diff / (1000*60*60*24));

  document.getElementById('d').textContent = day;
  document.getElementById('h').textContent = hr.toString().padStart(2,'0');
  document.getElementById('m').textContent = min.toString().padStart(2,'0');
  document.getElementById('s').textContent = sec.toString().padStart(2,'0');
}

// Listen for hash navigation (e.g. #/uclfinal)
window.addEventListener('hashchange', () => loadAndRender(getId()));

// Initial render
loadAndRender(getId());
