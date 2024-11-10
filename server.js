const express = require('express');
const cors = require('cors'); // Import the CORS middleware
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3010;

// Enable CORS for all routes
app.use(cors());

app.use(express.static('public')); // Serve static files like HTML, CSS, JS

// Extract ingredients from the provided URL
app.get('/extract', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Find the div containing the ingredients list (you can modify this selector based on your target website structure)
    let ingredients = [];
    
    $('div[class*="ingredients"], div[class*="ingredient"]').each((i, elem) => {
      $(elem).find('ul li').each((j, ingredient) => {
        ingredients.push($(ingredient).text().trim());
      });
    });

    if (ingredients.length > 0) {
      res.json({ ingredients });
    } else {
      res.json({ ingredients: [] });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to extract ingredients' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
