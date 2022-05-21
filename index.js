const express = require("express");
const app = express();
require('dotenv').config();

const port = process.env.PORT;
const bodyParser = require("body-parser");
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const mealRoutes = require('./src/routes/meal.routes');
const dbconnection = require('./src/database/dbconnection');
const logger = require('./src/config/config').logger;

app.use(bodyParser.json());

app.all("*", (req, res, next) => {
  const method = req.method;
  logger.debug(`Method ${method} is aangeroepen`);
  next();
});

app.use(userRoutes)
app.use(authRoutes)
app.use(mealRoutes)

app.all("*", (req, res) => {
  res.status(404).json({
    status: 404,
    result: "End-point not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.debug('Error handler called.');
  logger.error(err)
  res.status(500).json({
    status: 500,
    message: err.toString()
  })
})

app.listen(port, () => {
  logger.debug(`Example app listening on port ${port}`);
});

process.on('SIGINT', () => {
  logger.debug('SIGINT signal received: closing HTTP server')
  dbconnection.end((err) => {
    logger.debug('Database connection closed')
  })
})

module.exports = app;
