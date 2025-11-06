// script.js — odporna wersja (fetch surowego meals.html, parsowanie i ekstrakcja)

// Pobierz meals.html jako tekst przy starcie i wstaw do kontenera
let rawMealsHtml = '';

async function loadMeals() {
  try {
    const res = await fetch('meals.html');
    rawMealsHtml = await res.text();
    document.getElementById('meals-container').innerHTML = rawMealsHtml;
    addCheckboxes(); // dodaj checkboxy po wstawieniu treści
    console.log('✅ meals.html wczytane i wstawione, checkboxy dodane');
  } catch (e) {
    console.error('Błąd podczas fetch meals.html:', e);
  }
}

// Dodaje checkbox do każdego posiłku (w DOM wstawionym)
function addCheckboxes() {
  const meals = document.querySelectorAll('#meals-container .meal');
  if (!meals || meals.length === 0) {
    console.warn('addCheckboxes: brak .meal w #meals-container');
    return;
  }
  meals.forEach(meal => {
    if (meal.querySelector('.meal-select')) return; // nie duplikuj
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'meal-select';
    checkbox.style.cssText = 'float:right; transform:scale(1.15); margin-top:6px; cursor:pointer;';
    meal.insertBefore(checkbox, meal.firstChild);
  });
  console.log(`Dodano checkboxy: ${meals.length} posiłków`);
}

// Ekstraktor składników z pojedynczego elementu <element> (DOM element z parsedDoc)
function extractIngredientsFromMealElement(mealEl) {
  const ingredients = [];
  const allEls = Array.from(mealEl.querySelectorAll('*'));
  let collecting = false;

  allEls.forEach(el => {
    const text = (el.innerText || '').trim();
    if (!text) return;
    const t = text.toLowerCase();

    // start/stop rules
    if (t.includes('skład') || t.includes('sklad')) {
      collecting = true;
      // jeśli element zawiera też linię z listą -> zbierz jego dalsze linie
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      // usuń frazę 'składniki' z linii
      lines.forEach(l => {
        if (!/skład|sklad/i.test(l)) ingredients.push(l);
      });
      return;
    }

    if (collecting) {
      if (t.includes('przygotowanie') || t.includes('makro') || t.includes('smacznego')) {
        collecting = false;
        return;
      }
      // zbierz linie z tego elementu
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      lines.forEach(l => {
        // filtruj nagłówki/etkiety przypadkowe
        if (!/przygotowanie|makro|smacznego/i.test(l)) ingredients.push(l);
      });
    }
  });

  // czyszczenie: usuń numery porcji, nadmiarowe spacje
  return ingredients.map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

// Główna funkcja: odczytaj które posiłki zaznaczone i dla każdego weź składniki z rawMealsHtml (parsed)
async function generateList() {
  // pobierz zaznaczone checkboxy z INSERTED DOM (te które widzi użytkownik)
  const checkedBoxes = Array.from(document.querySelectorAll('.meal-select:checked'));
  if (checkedBoxes.length === 0) { alert('Nie wybrano żadnych posiłków 🥦'); return; }

  // żeby zmapować zaznaczone elementy na elementy parsowane z rawMealsHtml,
  // we pobieramy indeks każdej zaznaczonej .meal w dokumencie #meals-container
  const allMealsInDOM = Array.from(document.querySelectorAll('#meals-container .meal'));
  const selectedIndexes = checkedBoxes.map(cb => allMealsInDOM.indexOf(cb.closest('.meal'))).filter(i => i >= 0);

  // parsuj surowy HTML (rawMealsHtml) do DOMDocument, żeby pobrać "czyste" elementy
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawMealsHtml, 'text/html');
  const parsedMeals = Array.from(doc.querySelectorAll('.meal'));

  let ingredients = [];

  selectedIndexes.forEach(idx => {
    const mealEl = parsedMeals[idx];
    if (!mealEl) {
      console.warn('Brak parsowanego elementu dla indeksu', idx);
      return;
    }
    const found = extractIngredientsFromMealElement(mealEl);
    console.log(`Z posiłku idx=${idx} znaleziono:`, found);
    ingredients.push(...found);
  });

  // usuń duplikaty i uporządkuj
  const unique = [...new Set(ingredients.map(s => s.trim()).filter(Boolean))];

  if (unique.length === 0) {
    // dodatkowy logging: pokaż, co parsowano
    console.warn('Brak znalezionych składników po parsowaniu. Debug info:');
    console.log('selectedIndexes:', selectedIndexes);
    console.log('parsedMeals count:', parsedMeals.length);
    alert('Nie wykryto żadnych składników 😅 — sprawdź konsolę (F12) i wyślij logi jeśli potrzebujesz pomocy.');
    return;
  }

  // otwórz nową kartę z listą
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

  console.log('🔔 Lista zakupów wygenerowana, pozycje:', unique.length);
}

// Inicjalizacja po ładowaniu strony
window.addEventListener('DOMContentLoaded', () => {
  // przy starcie: wczytaj meals.html i przygotuj UI
  loadMeals();

  // przypnij handler generowania do przycisku
  const btn = document.getElementById('generate-list');
  if (btn) btn.addEventListener('click', generateList);
});
