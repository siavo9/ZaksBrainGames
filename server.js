// Zak's Brain Games — simple Express server
// Serves the static, fully self-contained front-end from /public.

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

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

// Memory Market game page (folder-based: /memorymarket/index.html)
app.get(['/memorymarket', '/memorymarket/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'memorymarket', 'index.html'));
});

// Shape Shifter game page (folder-based: /shapeshifter/index.html)
app.get(['/shapeshifter', '/shapeshifter/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shapeshifter', 'index.html'));
});

// Rhyme Time Rocket game page (folder-based: /rhymetimerocket/index.html)
app.get(['/rhymetimerocket', '/rhymetimerocket/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'rhymetimerocket', 'index.html'));
});

// World Explorer game page (folder-based: /worldexplorer/index.html)
app.get(['/worldexplorer', '/worldexplorer/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'worldexplorer', 'index.html'));
});

// Animal Kingdom Sort game page (folder-based: /animalkingdomsort/index.html)
app.get(['/animalkingdomsort', '/animalkingdomsort/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'animalkingdomsort', 'index.html'));
});

// Community Helpers game page (folder-based: /communityhelpers/index.html)
app.get(['/communityhelpers', '/communityhelpers/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'communityhelpers', 'index.html'));
});

// Monster Truck Builder game page (folder-based: /monstertruckbuilder/index.html)
app.get(['/monstertruckbuilder', '/monstertruckbuilder/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'monstertruckbuilder', 'index.html'));
});

// Coin Counter Cafe game page (folder-based: /coincountercafe/index.html)
app.get(['/coincountercafe', '/coincountercafe/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'coincountercafe', 'index.html'));
});

// Tick-Tock Clock Quest game page (folder-based: /ticktockclockquest/index.html)
app.get(['/ticktockclockquest', '/ticktockclockquest/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ticktockclockquest', 'index.html'));
});

// Feelings Friends game page (folder-based: /feelingsfriends/index.html)
app.get(['/feelingsfriends', '/feelingsfriends/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'feelingsfriends', 'index.html'));
});

// Spell-a-Bee game page (folder-based: /spellabee/index.html)
app.get(['/spellabee', '/spellabee/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'spellabee', 'index.html'));
});

// Color Book game page (folder-based: /color-book/index.html)
app.get(['/color-book', '/color-book/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'color-book', 'index.html'));
});

// Robo Recess game page (folder-based: /roborecess/index.html)
app.get(['/roborecess', '/roborecess/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'roborecess', 'index.html'));
});

// Sound Soup game page (folder-based: /soundsoup/index.html)
app.get(['/soundsoup', '/soundsoup/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'soundsoup', 'index.html'));
});

// Pattern Express game page (folder-based: /patternexpress/index.html)
app.get(['/patternexpress', '/patternexpress/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'patternexpress', 'index.html'));
});

// Dino Don't! game page (folder-based: /dinodont/index.html)
app.get(['/dinodont', '/dinodont/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dinodont', 'index.html'));
});

// Mailbot Maze game page (folder-based: /mailbotmaze/index.html)
app.get(['/mailbotmaze', '/mailbotmaze/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mailbotmaze', 'index.html'));
});

// Echo Beats game page (folder-based: /echobeats/index.html)
app.get(['/echobeats', '/echobeats/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'echobeats', 'index.html'));
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
