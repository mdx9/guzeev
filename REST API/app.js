// app.js
const express = require('express');
const app = express();
const usersRoutes = require('./routes/users');

app.use(express.json()); // для парсинга JSON в теле запросов

app.use('/api/users', usersRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`REST API сервер запущен на http://localhost:${PORT}`);
});
