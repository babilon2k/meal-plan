// --- script.js (stabilna wersja Chrome + Edge) ---

// Załaduj plik meals.html i poczekaj aż się wstawi do DOM
async function loadMeals() {
  try {
    const res = await fetch('meals.html');
    const html = await res.text();
    const container = document.getElementById('meals-container');
    container.innerHTML = html;

    // Poczekaj chwilę, aż DOM się odświeży (dla Chrome)
    await new Promise(r => setTimeout(r, 100));
    addCheckboxes();
    console.log('✅ meals.html wczytane i checkboxy dodane');
  } catch (err) {
    console.error('❌ Błąd ładowania meals.html:', err);
  }
}

// Dodaj checkbox do każdego posiłku
function addCheckboxes() {
  const meals = document.querySelectorAll('.meal');
  meals.forEach(meal => {
    if (meal.querySelector('.meal-select')) return;
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'meal-select';
    cb.style.cssText = 'float:right; transform:scale(1.2); margin-top:6px; cursor:pointer;';
    meal.insertBefore(cb, meal.firstChild);
  });
}

// Zbierz składniki z zaznaczonych posiłków
function generateList() {
  const selected = document.querySelectorAll('.meal-select:checked');
  if (selected.length === 0) return alert('Nie wybrano żadnych posiłków 🥦');

  let allIngredients = [];

  selected.forEach(meal => {
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
  if (unique.length === 0) return alert('Nie wykryto żadnych składników 😅');

  // Nowa karta z listą
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

// Główna inicjalizacja
window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('generate-list');
  if (btn) btn.addEventListener('click', generateList);
  loadMeals();
});
