// ========== STABILNA I DEBUGUJĄCA WERSJA ==========

// Dodaje checkbox do każdego posiłku
function addCheckboxes() {
  const meals = document.querySelectorAll('.meal');
  if (meals.length === 0) {
    console.warn('⚠️ addCheckboxes(): brak elementów .meal — spróbuję ponownie za 0.5s');
    setTimeout(addCheckboxes, 500);
    return;
  }

  meals.forEach(meal => {
    if (meal.querySelector('.meal-select')) return;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'meal-select';
    checkbox.style.cssText = 'float:right; transform:scale(1.3); margin-top:4px; cursor:pointer;';
    meal.insertBefore(checkbox, meal.firstChild);
  });
  console.log(`✅ Dodano checkboxy do ${meals.length} posiłków`);
}

// Główna funkcja generowania listy
function generateList() {
  const selectedMeals = document.querySelectorAll('.meal-select:checked');
  console.log(`🟢 Wybrano ${selectedMeals.length} posiłków`);

  if (selectedMeals.length === 0) {
    alert('Nie wybrano żadnych posiłków 🥦');
    return;
  }

  let ingredients = [];

  selectedMeals.forEach((meal, mi) => {
    const title = meal.querySelector('h3')?.innerText || '(bez tytułu)';
    console.group(`📦 Posiłek #${mi + 1}: ${title}`);
    const elements = Array.from(meal.querySelectorAll('*'));
    console.log(`🔍 Liczba elementów w tym posiłku: ${elements.length}`);

    let collecting = false;
    elements.forEach((el, idx) => {
      const text = (el.innerText || '').trim();
      const lower = text.toLowerCase();

      if (lower.includes('składniki')) {
        collecting = true;
        console.log(`🧩 Start sekcji składników — <${el.tagName}>`);
      }

      if (collecting && text && !lower.includes('składniki') && !lower.includes('przygotowanie') && !lower.includes('makro')) {
        const lines = text.split('\n')
          .map(l => l.trim())
          .filter(l => l && !l.toLowerCase().includes('makro') && !l.toLowerCase().includes('przygotowanie'));
        if (lines.length > 0) {
          console.log(`➕ Dodano linie z <${el.tagName}>:`, lines);
          ingredients.push(...lines);
        }
      }

      if (lower.includes('przygotowanie') || lower.includes('makro')) {
        collecting = false;
        console.log(`🛑 Koniec sekcji składników — <${el.tagName}>`);
      }
    });
    console.groupEnd();
  });

  const uniqueIngredients = [...new Set(ingredients.map(i => i.trim()).filter(Boolean))];
  console.log('🧾 Wszystkie znalezione składniki:', ingredients);
  console.log('✅ Unikalne składniki:', uniqueIngredients);

  if (uniqueIngredients.length === 0) {
    alert('Nie wykryto żadnych składników 😅 — sprawdź konsolę (F12 → Console)');
    return;
  }

  const newTab = window.open('', '_blank');
  newTab.document.title = 'Lista zakupów';
  newTab.document.body.innerHTML = `
    <h1 style="color:#ff9966; text-align:center;">🛒 Lista zakupów</h1>
    <ul style="list-style-type:none; padding:0;">
      ${uniqueIngredients.map(i => `<li style="padding:4px 0; border-bottom:1px solid #444;">${i}</li>`).join('')}
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

// Po załadowaniu strony
window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Skrypt załadowany — oczekuję na dane z meals.html...');
  const btn = document.getElementById('generate-list');
  if (btn) btn.addEventListener('click', generateList);

  // Sprawdź co 0.5 sekundy, czy wczytano posiłki
  const interval = setInterval(() => {
    if (document.querySelectorAll('.meal').length > 0) {
      clearInterval(interval);
      addCheckboxes();
      console.log('✅ Wykryto przepisy — checkboxy dodane');
    }
  }, 500);
});
