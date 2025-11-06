// --- script.js ---
// Wersja: wybór całego kafelka zamiast checkboxa

// Załaduj przepisy
async function loadMeals() {
  try {
    const res = await fetch('meals.html');
    const html = await res.text();
    const container = document.getElementById('meals-container');
    container.innerHTML = html;

    // krótka pauza dla Chrome zanim DOM się wyrenderuje
    await new Promise(r => setTimeout(r, 100));
    setupMealSelection();
    console.log('✅ meals.html załadowane i aktywowano klikane kafelki');
  } catch (err) {
    console.error('❌ Błąd ładowania meals.html:', err);
  }
}

// Zamienia każdy kafelek .meal w klikalny selektor
function setupMealSelection() {
  const meals = document.querySelectorAll('.meal');
  meals.forEach(meal => {
    meal.classList.add('selectable');
    meal.addEventListener('click', () => {
      meal.classList.toggle('selected');
    });
  });
  console.log(`🟢 Aktywowano ${meals.length} klikalnych kafelków`);
}

// Generuj listę zakupów z zaznaczonych kafelków
function generateList() {
  const selectedMeals = document.querySelectorAll('.meal.selected');
  if (selectedMeals.length === 0) {
    alert('Nie wybrano żadnych posiłków 🥦');
    return;
  }

  let allIngredients = [];

  selectedMeals.forEach(meal => {
    const paragraphs = meal.querySelectorAll('p');
    let collecting = false;

    paragraphs.forEach(p => {
      const text = p.innerText.trim().toLowerCase();

      if (text.includes('składniki')) collecting = true;
      if (collecting && !text.includes('składniki') && !text.includes('przygotowanie') && !text.includes('makro')) {
        const lines = p.innerText
          .split('\n')
          .map(l => l.trim())
          .filter(l => l && !l.toLowerCase().includes('przygotowanie') && !l.toLowerCase().includes('makro'));
        allIngredients.push(...lines);
      }
      if (text.includes('przygotowanie') || text.includes('makro')) collecting = false;
    });
  });

  const unique = [...new Set(allIngredients.map(i => i.trim()).filter(Boolean))];
  if (unique.length === 0) {
    alert('Nie wykryto żadnych składników 😅');
    return;
  }

  // Otwórz listę w nowej karcie
  const newTab = window.open('', '_blank');
  newTab.document.title = 'Lista zakupów';
  newTab.document.body.innerHTML = `
    <h1 style="color:#ff9966; text-align:center;">🛒 Lista zakupów</h1>
    <ul style="list-style:none; padding:0; margin-top:20px;">
      ${unique.map(i => `<li style="padding:6px 0; border-bottom:1px solid #444;">${i}</li>`).join('')}
    </ul>
  `;
  Object.assign(newTab.document.body.style, {
    fontFamily: 'Segoe UI, sans-serif',
    background: '#1e1e1e',
    color: '#e4e4e4',
    padding: '20px',
    lineHeight: '1.6'
  });
}

// Inicjalizacja
window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('generate-list');
  if (btn) btn.addEventListener('click', generateList);
  loadMeals();
});
