let mode = 'buy';
let currentOz = 0.50;
let currency = 'USD';
let price24k = 2642.50;
// Load prices saved from Admin
let _saved = JSON.parse(localStorage.getItem('aurum_prices') || '{}');
if (_saved.p24) price24k = parseFloat(_saved.p24);

const rates = { USD: 1, KES: 130, EUR: 0.92 };
const symbols = { USD: '$', KES: 'KSh ', EUR: '€' };
function getBuySpread(){ return parseFloat(localStorage.getItem('buySpread') || 2) / 100; }
function getSellSpread(){ return parseFloat(localStorage.getItem('sellSpread') || 2) / 100; }
function drawChart() {
  const canvas = document.getElementById('goldChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.offsetWidth;
  const h = canvas.height = 160;
  ctx.clearRect(0, 0, w, h);
  // grid
  ctx.strokeStyle = '#eee';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(0, i * 40); ctx.lineTo(w, i * 40); ctx.stroke();
  }
  // candlesticks - green up, red down like your screenshot
  let x = 15;
  let base = 90;
  for (let i = 0; i < 18; i++) {
    let up = Math.random() > 0.35;
    let open = base + (Math.random() * 20 - 10);
    let close = open + (up ? Math.random() * 18 : -Math.random() * 18);
    let high = Math.max(open, close) + Math.random() * 8;
    let low = Math.min(open, close) - Math.random() * 8;
    ctx.strokeStyle = up ? '#22c55e' : '#ef4444';
    ctx.beginPath(); ctx.moveTo(x + 8, high); ctx.lineTo(x + 8, low); ctx.stroke();
    ctx.fillStyle = up ? '#22c55e' : '#ef4444';
    let y = Math.min(open, close);
    let height = Math.abs(close - open) || 4;
    ctx.fillRect(x, y, 16, height);
    x += 24;
    base = close;
  }
}

function updateAmounts() {
  let total = price24k * currentOz;
  let fee = total * (mode === 'buy' ? getBuySpread() : getSellSpread());
  let pay = total + fee;
  let sym = symbols[currency];
  let rate = rates[currency];
  let displayTotal = (total * rate).toLocaleString('en-US', {maximumFractionDigits: 2});
  let displayPay = (pay * rate).toLocaleString('en-US', {maximumFractionDigits: 2});
  document.getElementById('amountValue').textContent = sym + displayTotal;
  document.getElementById('youReceive').textContent = sym + displayTotal;
  document.getElementById('youPay').textContent = sym + displayPay;
  document.querySelector('.grams').innerHTML = currentOz.toFixed(2) + ' oz = <b id="amountValue">' + sym + displayTotal + '</b>';
}

function setMode(m) {
  mode = m;
  document.getElementById('buyBtn').style.opacity = m === 'buy' ? '1' : '0.6';
  document.getElementById('sellBtn').style.opacity = m === 'sell' ? '1' : '0.6';
  document.getElementById('confirmBtn').textContent = m === 'buy' ? 'Confirm Transaction' : 'Confirm Sell';
}

function setOz(oz) {
  currentOz = oz;
  document.querySelectorAll('.oz').forEach(b => {
    b.classList.toggle('active', b.textContent.includes(oz.toFixed(2)));
  });
  updateAmounts();
}

function switchCurrency() {
  if (currency === 'USD') currency = 'KES';
  else if (currency === 'KES') currency = 'EUR';
  else currency = 'USD';
  document.getElementById('currencyLabel').textContent = currency;
  updateAmounts();
  // update wallet + prices display
  document.getElementById('price24k').textContent = (price24k * rates[currency]).toFixed(2);
  document.getElementById('price22k').textContent = (2421.80 * rates[currency]).toFixed(2);
  document.getElementById('price18k').textContent = (1981.90 * rates[currency]).toFixed(2);
}

function confirmTrade() {
  let msg = mode === 'buy'
    ? 'You are BUYING ' + currentOz + ' oz of 24K Gold for ' + document.getElementById('youPay').textContent + '. Confirm?'
    : 'You are SELLING ' + currentOz + ' oz of 24K Gold for ' + document.getElementById('youReceive').textContent + '. Confirm?';
  if (confirm(msg)) {
    alert('✅ Transaction Confirmed! ' + mode.toUpperCase() + ' ' + currentOz + ' oz successful.');
    let gold = parseFloat(document.getElementById('goldStore').textContent);
    let ozToG = currentOz * 31.1035;
    if (mode === 'buy') document.getElementById('goldStore').textContent = (gold + ozToG).toFixed(1);
    else document.getElementById('goldStore').textContent = Math.max(0, gold - ozToG).toFixed(1);
  }
}

function showMpesa() {
  let box = document.getElementById('mpesaBox');
  box.style.display = box.style.display === 'none' ? 'block' : 'none';
}

function orderWhatsApp() {
  let text = 'Hi AURUM LTD, I want to ' + mode.toUpperCase() + ' ' + currentOz + ' oz of 24K Gold. Total: ' + document.getElementById('youPay').textContent;
  window.open('https://wa.me/254757441489?text=' + encodeURIComponent(text), '_blank');
}

// Time buttons
document.querySelectorAll('.time').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.time').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    drawChart();
  });
});

// Live price simulation + news
const newsList = [
  'Gold price goes up to new high as investors rush to buy gold',
  'Central banks buying more gold this month',
  'Dollar weakens, gold shines brighter for investors'
];
let newsIndex = 0;
setInterval(() => {
  price24k += (Math.random() - 0.45) * 3;
  if (currency === 'USD') document.getElementById('price24k').textContent = price24k.toFixed(2);
  drawChart();
  updateAmounts();
}, 3000);

setInterval(() => {
  newsIndex = (newsIndex + 1) % newsList.length;
  document.getElementById('newsText').textContent = newsList[newsIndex];
}, 8000);

// Start
drawChart();
updateAmounts();
setMode('buy');