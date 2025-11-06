// 🔹 Dodaje checkbox do każdego posiłku
function addCheckboxes() {
  const meals = document.querySelectorAll('.meal');
  meals.forEach(meal => {
    // jeśli już ma checkboxa — pomiń
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
    const allParagraphs = Array.from(meal.querySelectorAll('p'));
    let collecting = false;
    allParagraphs.forEach(p => {
      const text = p.innerText.trim();
      if (text.toLowerCase().includes('składniki')) collecting = true;
      if (text.toLowerCase().includes('przygotowanie') || text.toLowerCase().includes('makro')) collecting = false;

      if (collecting && !text.toLowerCase().includes('składniki')) {
        // usuń niepotrzebne słowa i puste linie
        const lines = text.split('\n')
          .map(l => l.trim())
          .filter(l => l && !l.toLowerCase().includes('przygotowanie') && !l.toLowerCase().includes('makro'));
        ingredients.push(...lines);
      }
    });
  });

  if (ingredients.length === 0) {
    alert('Nie wykryto żadnych składników 😅');
    return;
  }

  // usuń duplikaty i posortuj
  const uniqueIngredients = [...new Set(ingredients)].sort((a, b) => a.localeCompare(b));

  // otwórz nową kartę z listą zakupów
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
