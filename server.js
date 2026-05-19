// Zak's Brain Games — simple Express server
// Serves the static front-end from /public, provides a /privacy route,
// and exposes /api/submit-game and /api/contact endpoints that forward
// submissions to the site owner's email via FormSubmit (no API key needed).

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Recipient email is kept server-side only so it is never shipped to the
// browser. Override with the CONTACT_EMAIL env var in production if desired.
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'ovaisinamullah@gmail.com';

app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));

function clean(value, max = 2000) {
  if (value === undefined || value === null) return '';
  return String(value).slice(0, max).trim();
}

async function forwardSubmission(fields, subject) {
  const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_EMAIL)}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      ...fields,
      _subject: subject,
      _template: 'table',
      _captcha: 'false'
    })
  });
  if (!response.ok) {
    throw new Error(`Forwarding service responded with ${response.status}`);
  }
  return response.json();
}

app.post('/api/submit-game', async (req, res) => {
  const name = clean(req.body?.name, 120);
  const url = clean(req.body?.url, 500);
  const description = clean(req.body?.description, 800);
  const submitterName = clean(req.body?.submitterName, 120);
  const submitterEmail = clean(req.body?.submitterEmail, 200);

  if (!url || !description) {
    return res.status(400).json({ ok: false, error: 'Game URL and description are required.' });
  }
  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).json({ ok: false, error: 'Game URL must start with http:// or https://' });
  }

  try {
    await forwardSubmission(
      {
        'Game Name': name || '(not provided)',
        'Game URL': url,
        'Description': description,
        'Submitter Name': submitterName || '(not provided)',
        'Submitter Email': submitterEmail || '(not provided)'
      },
      "New Game Submission — Zak's Brain Games"
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Game submission failed:', err);
    res.status(502).json({ ok: false, error: 'Could not send your submission right now. Please try again later.' });
  }
});

app.post('/api/contact', async (req, res) => {
  const name = clean(req.body?.name, 120);
  const email = clean(req.body?.email, 200);
  const message = clean(req.body?.message, 2000);

  if (!message) {
    return res.status(400).json({ ok: false, error: 'A message is required.' });
  }

  try {
    await forwardSubmission(
      {
        Name: name || '(not provided)',
        Email: email || '(not provided)',
        Message: message
      },
      "Contact Form — Zak's Brain Games"
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Contact submission failed:', err);
    res.status(502).json({ ok: false, error: 'Could not send your message right now. Please try again later.' });
  }
});

// Friendly /privacy route
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

// HangCar game page
app.get('/hangcar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'hangcar.html'));
});

// Word Trio game page
app.get('/wordtrio', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'wordtrio.html'));
});

// Story Spark game page (folder-based: /storyspark/index.html)
app.get(['/storyspark', '/storyspark/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'storyspark', 'index.html'));
});

// Planet Pop Quiz game page (folder-based: /planetpopquiz/index.html)
app.get(['/planetpopquiz', '/planetpopquiz/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'planetpopquiz', 'index.html'));
});

// SEO helpers
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// Fallback to index.html (single-page app)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Zak's Brain Games running on http://localhost:${PORT}`);
});

module.exports = app;
