//public/script.js

//const currentHost = 'http://localhost:3010';
const currentHost = 'https://node.johnetravels.com/app4'

document.getElementById('urlForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const url = document.getElementById('url').value;

    if (!url) {
        alert('Please enter a valid URL');
        return;
    }

    try {
        // Full URL with EC2 public IP or domain
        const response = await fetch(`${currentHost}/extract?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        // Handle the recipe name
        if (data.recipeName) {
            const recipeNameElement = document.getElementById('recipeName');
            recipeNameElement.textContent = data.recipeName;  // Display the recipe name
            const recipeName = document.getElementById('recipeName');
            recipeName.classList.remove('hiddenItem');
        } else {
            alert('No recipe name found on this page!');
        }

        // Handle ingredients
        if (data.ingredients && data.ingredients.length > 0) {
            const ingredientsList = document.getElementById('ingredients');
            ingredientsList.innerHTML = ''; // Clear previous results

            // Use a Set to eliminate duplicates
            const uniqueIngredients = new Set(data.ingredients);

            // Append unique ingredients to the list
            uniqueIngredients.forEach(ingredient => {
                const li = document.createElement('li');

                // Create a container div for checkbox and text
                const ingredientContainer = document.createElement('div');
                ingredientContainer.classList.add('ingredient-container'); // Add a class for flexbox

                // Create a checkbox input for each ingredient
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('ingredient-checkbox');

                // Create a span for the ingredient text
                const ingredientText = document.createElement('span');
                ingredientText.textContent = ingredient;

                // Append checkbox and ingredient text to the container div
                ingredientContainer.appendChild(checkbox);
                ingredientContainer.appendChild(ingredientText);

                // Add event listener to cross out ingredient when checked
                checkbox.addEventListener('change', function () {
                    if (checkbox.checked) {
                        ingredientText.style.textDecoration = 'line-through';  // Strike through the text
                    } else {
                        ingredientText.style.textDecoration = 'none';  // Remove the strike-through
                    }
                });

                // Append the container div to the list item
                li.appendChild(ingredientContainer);
                ingredientsList.appendChild(li);
            });

            const ingredientsListDiv = document.getElementById('ingredientsList');
            ingredientsListDiv.classList.remove('hiddenItem');
        } else {
            alert('No ingredients found on this page!');
        }

        // Handle instructions
        if (data.instructions && data.instructions.length > 0) {
            const instructionsList = document.getElementById('instructions');
            instructionsList.innerHTML = ''; // Clear previous results

            // Use a Set to eliminate duplicates
            const uniqueInstructions = new Set(data.instructions);

            // Append unique instructions to the list
            uniqueInstructions.forEach(instruction => {
                const li = document.createElement('li');
                li.textContent = instruction.trim();  // Ensure we trim any extra whitespace
                instructionsList.appendChild(li);
            });

            const instructionListDiv = document.getElementById('instructionList');
            instructionListDiv.classList.remove('hiddenItem');
        } else {
            alert('No instructions found on this page!');
        }

    } catch (error) {
        alert('Error extracting ingredients and instructions: ' + error.message);
    }
});

// Add a "Clear" button functionality
document.getElementById('clearButton').addEventListener('click', function () {
    // Clear the URL input
    document.getElementById('url').value = '';

    // Clear recipe data
    document.getElementById('recipeName').textContent = ''; // Clear recipe name
    document.getElementById('ingredients').innerHTML = ''; // Clear ingredients list
    document.getElementById('instructions').innerHTML = ''; // Clear instructions list

    // Hide ingredient and instruction sections
    document.getElementById('recipeName').classList.add('hiddenItem');
    document.getElementById('ingredientsList').classList.add('hiddenItem');
    document.getElementById('instructionList').classList.add('hiddenItem');
});
