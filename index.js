const express = require("express");
const app = express();
require('dotenv').config()

const port = process.env.PORT;
const bodyParser = require("body-parser");
const userRouter = require('./src/routes/user.routes');

app.use(bodyParser.json());

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is aangeroepen`);
  next();
});

app.use(userRouter)

app.all("*", (req, res) => {
  res.status(404).json({
    status: 404,
    result: "End-point not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status).json(err);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
