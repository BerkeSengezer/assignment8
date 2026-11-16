import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

const courses = [
  { id: 'WEB101', title: 'Web Programming', credits: 6 },
  { id: 'PRG101', title: 'Programming Fundamentals', credits: 5 },
  { id: 'DSN101', title: 'Interface Design', credits: 4 },
];

app.get('/hello', (req, res) => {
  res.type('text/plain').send("Hello from Berke's server");
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow: /api/admin\n');
});

app.get('/old-page', (req, res) => {
  res.redirect('/hello');
});

app.get('/api/courses', (req, res) => {
  res.json(courses);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    nodeVersion: process.version,
    uptimeSeconds: process.uptime(),
  });
});

app.get('/api/headers', (req, res) => {
  res.json({
    'User-Agent': req.get('User-Agent') || null,
    Accept: req.get('Accept') || null,
  });
});

app.listen(port, () => {
  console.log(`Study programme server running at http://localhost:${port}`);
});
