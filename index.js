require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const url = require('url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/public', express.static(`${process.cwd()}/public`));

// In-memory database for storing URLs
let urlDatabase = {};
let shortUrlCounter = 1;

// Routes
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

// URL Shortener endpoint
app.post('/api/shorturl', (req, res) => {
  const { url: originalUrl } = req.body;

  // Validate the URL format using a regex for http/https
  const urlRegex = /^(https?:\/\/)(www\.)?[\w-]+(\.[\w-]+)+.*$/;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Extract hostname for DNS lookup
  const hostname = new URL(originalUrl).hostname;

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const shortUrl = shortUrlCounter++;
    urlDatabase[shortUrl] = originalUrl;

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// Redirect short URLs
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// Listen on port
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});