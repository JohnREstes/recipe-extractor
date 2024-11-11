//server.js

const express = require('express');
const cors = require('cors'); // Import the CORS middleware
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3010;

// Enable CORS for all routes
app.use(cors());

app.use(express.static('public')); // Serve static files like HTML, CSS, JS

app.get('/extract', async (req, res) => {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      // Extract recipe name from tags containing 'recipe' or 'recipes' and 'name' or 'title' in the class
      let recipeName = '';
  
      // Look for any tags where the class contains both 'recipe' or 'recipes' and either 'name' or 'title'
      recipeName = $('*').filter(function() {
        const className = $(this).attr('class');
        return className && 
               (className.includes('recipe') || className.includes('recipes')) &&
               (className.includes('name') || className.includes('title'));
      }).first().text().trim();
  
      // If no title found, fallback to searching common title tags (h1, h2, etc.)
      if (!recipeName) {
        recipeName = $('h1.recipe-name').first().text().trim(); // Target <h1> with class 'recipe-name'
      }
      if (!recipeName) {
        recipeName = $('h2.wprm-recipe-name').first().text().trim(); // Target <h2> with class 'wprm-recipe-name'
      }
      if (!recipeName) {
        recipeName = $('h2.tasty-recipes-title').first().text().trim(); // Target <h2> with class 'tasty-recipes-title'
      }

      // Handle case if recipe name is still not found
      if (!recipeName) {
        return res.status(404).json({ error: 'Recipe name not found' });
      }

      // Extract ingredients
      let ingredients = [];
      $('div[class*="ingredients"], div[class*="ingredient"]').each((i, elem) => {
        $(elem).find('ul li').each((j, ingredient) => {
          ingredients.push($(ingredient).text().trim());
        });
      });

      // Handle missing ingredients
      if (ingredients.length === 0) {
        ingredients = ['Ingredients not found'];
      }

        // Extract instructions with a fallback to elements under a class of 'preparation'
        let instructions = [];

        // First, check for ul or ol under a class of 'direction'
        $('div[class*="direction"] ul, div[class*="direction"] ol').each((i, elem) => {
            $(elem).find('li').each((j, li) => {
                instructions.push($(li).text().trim()); // Get the text of each <li> item and trim whitespace
        });
        });
            
        // First, check for ul or ol under a class of 'preparation'
        $('div[class*="preparation"] ul, div[class*="preparation"] ol').each((i, elem) => {
        $(elem).find('li').each((j, li) => {
            instructions.push($(li).text().trim()); // Get the text of each <li> item and trim whitespace
        });
        });

        // If no instructions are found under 'preparation', fall back to the previous method
        if (instructions.length === 0) {
        $('div[class*="instruction"] ul, div[class*="instruction"] ol').each((i, elem) => {
            $(elem).find('li').each((j, li) => {
            instructions.push($(li).text().trim()); // Get the text of each <li> item and trim whitespace
            });
        });
        }

        // Handle missing instructions
        if (instructions.length === 0) {
        instructions = ['Instructions not found'];
        }

      // Return the recipe data
      res.json({
        recipeName,
        ingredients: [...new Set(ingredients)],  // Remove duplicates from ingredients
        instructions: [...new Set(instructions)] // Remove duplicates from instructions
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to extract recipe details' });
    }
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
