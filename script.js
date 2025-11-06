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
    // znajdź sekcję składników
    const paragraphs = meal.querySelectorAll('p');
    paragraphs.forEach(p => {
      const text = p.innerText;
      if (text.includes('Składniki')) {
        const lines = text.split('\n')
          .map(l => l.trim())
          .filter(line => line && !line.includes('Składniki'));
        ingredients.push(...lines);
      }
    });
  });

  if (ingredients.length === 0) {
    alert('Nie wybrano żadnych posiłków 🥦');
    return;
  }

  // usuń duplikaty
  const uniqueIngredients = [...new Set(ingredients)];

  // otwórz nową kartę z listą
  const newTab = window.open('lista.html', '_blank');
  newTab.onload = () => {
    newTab.document.body.innerHTML = `
      <h1>🛍️ Lista zakupów</h1>
      <ul>${uniqueIngredients.map(i => `<li>${i}</li>`).join('')}</ul>
    `;
    Object.assign(newTab.document.body.style, {
      fontFamily: 'Segoe UI, sans-serif',
      background: '#1e1e1e',
      color: '#e4e4e4',
      padding: '20px',
      lineHeight: '1.6'
    });
  };
}

// 🔹 Uruchom po załadowaniu strony
window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('generate-list');
  if (btn) btn.addEventListener('click', generateList);
});
