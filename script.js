// 🔹 Główna funkcja generowania listy zakupów
function generateList() {
  const selectedMeals = document.querySelectorAll('.meal-select:checked');
  let ingredients = [];

  selectedMeals.forEach(meal => {
    const mealDiv = meal.closest('.meal');
    const text = mealDiv.querySelector('p').innerText;
    const lines = text.split('\n').filter(line => line && !line.includes('Składniki'));
    ingredients.push(...lines);
  });

  if (ingredients.length === 0) {
    alert('Nie wybrano żadnych posiłków 🥦');
    return;
  }

  const uniqueIngredients = [...new Set(ingredients)];
  const newTab = window.open('lista.html', '_blank');
  newTab.onload = () => {
    newTab.document.body.innerHTML = `
      <h1>🛍️ Lista zakupów</h1>
      <ul>${uniqueIngredients.map(i => `<li>${i}</li>`).join('')}</ul>
    `;
    newTab.document.body.style.fontFamily = 'Segoe UI, sans-serif';
    newTab.document.body.style.background = '#1e1e1e';
    newTab.document.body.style.color = '#e4e4e4';
    newTab.document.body.style.padding = '20px';
    newTab.document.body.style.lineHeight = '1.6';
  };
}

// 🔹 Po załadowaniu meals.html — dodaj checkboxy do każdego posiłku
function addCheckboxes() {
  const meals = document.querySelectorAll('.meal');
  meals.forEach(meal => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'meal-select';
    checkbox.style.cssText = 'float:right; transform:scale(1.3); margin-top:4px; cursor:pointer;';
    meal.insertBefore(checkbox, meal.firstChild);
  });
}

// 🔹 Po załadowaniu strony — aktywuj przycisk i checkboxy
window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('generate-list');
  if (btn) btn.addEventListener('click', generateList);

  // poczekaj aż meals.html się załaduje
  const observer = new MutationObserver(() => addCheckboxes());
  observer.observe(document.getElementById('meals-container'), { childList: true });
});
