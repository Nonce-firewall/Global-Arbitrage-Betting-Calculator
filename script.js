const translations = {
  en: { title: "Global Arbitrage Engine", oddsLabel: "Odds", investment: "Capital / Stake", commission: "Comm %", rounding: "Rounding", profit: "Min. Profit", stake: "Amount", market: "Market Mode", advBtn: "+ Advanced Settings", advBtnHide: "- Hide Settings", save: "Save Calculation", history: "Recent Calculations", hCapital: "Capital", hProfit: "Profit", hROI: "ROI", clear: "Clear" },
  es: { title: "Motor de Arbitraje", oddsLabel: "Cuotas", investment: "Capital / Apuesta", commission: "Comisión %", rounding: "Redondeo", profit: "Ganan. Mín.", stake: "Monto", market: "Modo Mercado", advBtn: "+ Ajustes Avanzados", advBtnHide: "- Ocultar Ajustes", save: "Guardar", history: "Historial", hCapital: "Capital", hProfit: "Ganancia", hROI: "ROI", clear: "Limpiar" },
  fr: { title: "Moteur d'Arbitrage", oddsLabel: "Cotes", investment: "Capital / Mise", commission: "Comm %", rounding: "Arrondi", profit: "Bénéf. Min.", stake: "Montant", market: "Mode Marché", advBtn: "+ Paramètres Avancés", advBtnHide: "- Masquer Paramètres", save: "Sauvegarder", history: "Historique", hCapital: "Capital", hProfit: "Profit", hROI: "ROI", clear: "Effacer" }
};

let currentMode = 2;
let lastProfit = 0;
let lastROI = 0;

function toggleTheme() { document.body.classList.toggle('light-theme'); }

function toggleAdvanced() {
  const section = document.getElementById('advanced-section');
  const btn = document.getElementById('advToggle');
  const lang = document.getElementById('langSelect').value;
  section.classList.toggle('open');
  btn.innerText = section.classList.contains('open') ? translations[lang].advBtnHide : translations[lang].advBtn;
}

function setMode(num) {
  currentMode = num;
  document.getElementById('slider').style.transform = num === 3 ? 'translateX(100%)' : 'translateX(0%)';
  document.getElementById('mode2').classList.toggle('active', num === 2);
  document.getElementById('mode3').classList.toggle('active', num === 3);
  const elements = [document.getElementById('o3-container'), document.getElementById('s3-row')];
  elements.forEach(el => num === 3 ? el.classList.add('show') : el.classList.remove('show'));
  calculate();
}

function calculate() {
  const o = [
      parseFloat(document.getElementById('o1').value) || 0, 
      parseFloat(document.getElementById('o2').value) || 0, 
      currentMode === 3 ? (parseFloat(document.getElementById('o3').value) || 0) : 0
  ];
  const total = parseFloat(document.getElementById('totalStake').value) || 0;
  const comm = (parseFloat(document.getElementById('comm').value) || 0) / 100;
  const roundStep = parseFloat(document.getElementById('roundTo').value);

  if (o[0] <= 1 || o[1] <= 1 || (currentMode === 3 && o[2] <= 1) || total <= 0) return;

  const effO = o.map(val => val > 0 ? (1 + (val - 1) * (1 - comm)) : 0);
  const probs = effO.map(val => val > 0 ? (1 / val) : 0);
  const sumProbs = currentMode === 2 ? (probs[0] + probs[1]) : (probs[0] + probs[1] + probs[2]);

  const stakes = probs.map((p, i) => {
      if (currentMode === 2 && i === 2) return 0;
      let val = (p / sumProbs) * total;
      return roundStep > 0.01 ? Math.round(val / roundStep) * roundStep : val;
  });
  
  const actualTotal = stakes.reduce((a, b) => a + b, 0);
  const returns = stakes.map((s, i) => s > 0 ? (s + ((s * (o[i] - 1)) * (1 - comm))) : Infinity);
  const minReturn = Math.min(...returns.filter(r => r !== Infinity));
  
  lastProfit = minReturn - actualTotal;
  lastROI = (lastProfit / actualTotal) * 100;

  document.getElementById('s1').innerText = stakes[0].toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  document.getElementById('s2').innerText = stakes[1].toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  if (currentMode === 3) {
      document.getElementById('s3').innerText = stakes[2].toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }
  
  const profEl = document.getElementById('minProfit');
  profEl.innerText = lastProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  profEl.className = lastProfit >= 0 ? 'green' : 'red';
  document.getElementById('minPerc').innerText = lastROI.toFixed(2) + "%";
}

function changeLanguage() {
  const lang = document.getElementById('langSelect').value;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.innerText = translations[lang][el.getAttribute('data-i18n')]; });
  calculate();
}

function saveResult() {
  const table = document.getElementById('historyTable').getElementsByTagName('tbody')[0];
  const row = table.insertRow(0);
  row.innerHTML = `<td>${parseFloat(document.getElementById('totalStake').value).toLocaleString()}</td><td class="${lastProfit >= 0 ? 'green' : 'red'}">${lastProfit.toFixed(2)}</td><td>${lastROI.toFixed(2)}%</td>`;
  if(table.rows.length > 5) table.deleteRow(5);
}

function clearHistory() { document.getElementById('historyTable').getElementsByTagName('tbody')[0].innerHTML = ""; }

document.querySelectorAll('input, select').forEach(el => el.addEventListener('input', calculate));
setMode(2);

