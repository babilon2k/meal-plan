// 🔹 Dodaje checkbox do każdego posiłku
function addCheckboxes() {
  const meals = document.querySelectorAll('.meal');
  meals.forEach(meal => {
    if (meal.querySelector('.meal-select')) return;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'meal-select';
    checkbox.style.cssText = 'float:right; transform:scale(1.3); margin-top:4px; cursor:pointer;';
    meal.insertBefore(checkbox, meal.firstChild);
  });
}

// 🔹 Generuje listę zakupów w nowej karcie
function generateList() {
  const selectedMeals = document.querySelectorAll('.meal-select:checked');
  let ingredients = [];

  selectedMeals.forEach(meal => {
    const elements = Array.from(meal.querySelectorAll('*'));
    let collecting = false;

    elements.forEach(el => {
      const text = el.innerText?.trim() || '';
      const lower = text.toLowerCase();

      if (lower.includes('składniki')) collecting = true;
      if (lower.includes('przygotowanie') || lower.includes('makro')) collecting = false;

      if (collecting && !lower.includes('składniki') && text.length > 0) {
        const lines = text.split('\n')
          .map(l => l.trim())
          .filter(l => l && !l.toLowerCase().includes('makro') && !l.toLowerCase().includes('przygotowanie'));
        ingredients.push(...lines);
      }
    });
  });

  if (ingredients.length === 0) {
    alert('Nie wykryto żadnych składników 😅');
    return;
  }

  const uniqueIngredients = [...new Set(ingredients)].sort((a, b) => a.localeCompare(b));

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

// 🔹 Po załadowaniu strony
window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('generate-list');
  if (btn) btn.addEventListener('click', generateList);
});
