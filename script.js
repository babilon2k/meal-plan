// --- script.js ---
// Klikalny wybór kafelków + lista zakupów w nowej karcie

async function loadMeals() {
  const container = document.getElementById('meals-container');
  try {
    const res = await fetch('meals.html');
    const html = await res.text();
    container.innerHTML = html;

    // aktywuj klikane kafelki
    const meals = document.querySelectorAll('.meal');
    meals.forEach(meal => {
      meal.addEventListener('click', () => meal.classList.toggle('selected'));
    });
    console.log(`✅ Załadowano ${meals.length} posiłków`);
  } catch (err) {
    container.innerHTML = '<p style="color:red;text-align:center;">❌ Nie udało się załadować posiłków.</p>';
    console.error('Błąd:', err);
  }
}

function generateList() {
  const selectedMeals = document.querySelectorAll('.meal.selected');
  if (!selectedMeals.length) {
    alert('Nie wybrano żadnych posiłków 😅');
    return;
  }

  let ingredients = [];
  selectedMeals.forEach(meal => {
    const p = meal.querySelectorAll('p');
    p.forEach(el => {
      if (el.innerText.toLowerCase().includes('składniki')) {
        const lines = el.innerText
          .split('\n')
          .slice(1)
          .map(x => x.trim())
          .filter(Boolean);
        ingredients.push(...lines);
      }
    });
  });

  const unique = [...new Set(ingredients.map(x => x.toLowerCase()))];

  const listTab = window.open('', '_blank');
  listTab.document.title = 'Lista zakupów';
  listTab.document.body.style.cssText =
    'background:#1e1e1e;color:#e4e4e4;font-family:Segoe UI,sans-serif;padding:20px;';
  listTab.document.body.innerHTML = `
    <h1 style="color:#ff9966;">🛒 Lista zakupów</h1>
    <ul style="list-style:none;padding:0;">
      ${unique.map(i => `<li style="border-bottom:1px solid #444;padding:6px 0;">${i}</li>`).join('')}
    </ul>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('generate-list').addEventListener('click', generateList);
  loadMeals();
});
