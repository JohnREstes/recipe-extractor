document.getElementById('urlForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const url = document.getElementById('url').value;
    
    try {
      const response = await fetch(`/extract?url=${encodeURIComponent(url)}`);
      const data = await response.json();
  
      if (data.ingredients && data.ingredients.length > 0) {
        const ingredientsList = document.getElementById('ingredients');
        ingredientsList.innerHTML = '';
        data.ingredients.forEach(ingredient => {
          const li = document.createElement('li');
          li.textContent = ingredient;
          ingredientsList.appendChild(li);
        });
      } else {
        alert('No ingredients found on this page!');
      }
    } catch (error) {
      alert('Error extracting ingredients: ' + error.message);
    }
  });
  