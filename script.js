// --- script.js ---

async function loadMeals() {
  const container = document.getElementById('meals-container');
  try {
    const res = await fetch('meals.html');
    const html = await res.text();
    container.innerHTML = html;

    // Dodaj klasy sekcji do meal na podstawie poprzedzającego tytułu
    let currentSection = '';
    const elements = container.children;
    for (let el of elements) {
      if (el.classList.contains('section-title')) {
        if (el.textContent.toLowerCase().includes('śniad')) currentSection = 'sniadania';
        else if (el.textContent.toLowerCase().includes('obiad')) currentSection = 'obiady';
        else if (el.textContent.toLowerCase().includes('kolac')) currentSection = 'kolacje';
      } else if (el.classList.contains('meal')) {
        el.dataset.section = currentSection;
      }
    }

    // Aktywuj klikalne kafelki
    const meals = document.querySelectorAll('.meal');
    meals.forEach(meal => {
      meal.addEventListener('click', () => meal.classList.toggle('selected'));
    });

    // Filtry
    document.getElementById('search').addEventListener('input', filterMeals);
    document.getElementById('section-filter').addEventListener('change', filterMeals);

    console.log(`✅ Załadowano ${meals.length} posiłków`);
  } catch (err) {
    container.innerHTML = '<p style="color:red;text-align:center;">❌ Nie udało się załadować posiłków.</p>';
    console.error('Błąd:', err);
  }
}

function filterMeals() {
  const query = document.getElementById('search').value.toLowerCase();
  const section = document.getElementById('section-filter').value;
  const meals = document.querySelectorAll('.meal');

  meals.forEach(meal => {
    const name = meal.querySelector('h3').textContent.toLowerCase();
    const inSection = section === 'all' || meal.dataset.section === section;
    const matchesQuery = name.includes(query);
    meal.style.display = inSection && matchesQuery ? '' : 'none';
  });
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
document.getElementById('add-meal-btn').addEventListener('click', () => {
  const name = prompt('Nazwa posiłku:');
  if (!name) return;
  const section = prompt('Sekcja (sniadania / obiady / kolacje):', 'obiady');
  const link = prompt('Link do przepisu (np. Facebook / TikTok):', '');
  const ingredients = prompt('Składniki (każdy w nowej linii):', '').split('\n').filter(Boolean);
  const macro = prompt('Makro (np. 500 kcal | 40B | 10T | 60W):', '');

  // Utwórz gotowy blok HTML
  const html = `
<div class="meal" data-section="${section}">
  <h3>${name}</h3>
  ${link ? `<p><a href="${link}" target="_blank">Link do przepisu</a></p>` : ''}
  <p><strong>Składniki:</strong><br>${ingredients.join('<br>')}</p>
  <p class="macro">Makro: ${macro}</p>
</div>`;

  // Dodaj na stronę
  document.getElementById('meals-container').insertAdjacentHTML('beforeend', html);
  alert('✅ Dodano nowy przepis — możesz teraz kliknąć go i dodać do listy zakupów.');

  // Możesz też skopiować HTML do schowka
  navigator.clipboard.writeText(html).then(() => {
    console.log('Skopiowano HTML nowego przepisu — wklej go do meals.html');
  });
});
// --- DODAWANIE PRZEPISU Z WKLEJONEGO TEKSTU ---
document.getElementById('add-text-btn').addEventListener('click', () => {
  const raw = prompt('Wklej cały tekst przepisu tutaj:');
  if (!raw) return alert('Brak tekstu 😅');

  const lower = raw.toLowerCase();
  let section = 'obiady';
  if (lower.includes('śniad')) section = 'sniadania';
  else if (lower.includes('kolac')) section = 'kolacje';

  // Wyciągamy nazwę (pierwszy wiersz z dużymi literami)
  const nameMatch = raw.match(/^.*[A-ZŻŹĆĄŚĘŁÓŃ ]{3,}.*$/m);
  const name = nameMatch ? nameMatch[0].trim() : 'Nowy przepis';

  // Link
  const linkMatch = raw.match(/https?:\/\/\S+/);
  const link = linkMatch ? linkMatch[0] : '';

  // Składniki (od "Składniki:" aż do "Makro")
  const ingredientsMatch = raw.match(/Składniki:(.+?)(Makro|$)/is);
  const ingredients = ingredientsMatch
    ? ingredientsMatch[1].trim().split('\n').filter(x => x.trim() !== '').join('<br>')
    : 'brak składników';

  // Makro
  const macroMatch = raw.match(/Makro[^:]*:?(.+)/i);
  const macro = macroMatch ? macroMatch[1].trim() : 'brak danych';

  const html = `
<div class="meal" data-section="${section}">
  <h3>${name}</h3>
  ${link ? `<p><a href="${link}" target="_blank">Link do przepisu</a></p>` : ''}
  <p><strong>Składniki:</strong><br>${ingredients}</p>
  <p class="macro">Makro: ${macro}</p>
</div>`;

  document.getElementById('meals-container').insertAdjacentHTML('beforeend', html);
  navigator.clipboard.writeText(html);

  alert('✅ Przepis dodany! Skopiowano gotowy blok HTML do schowka 💾');
});

