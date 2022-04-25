const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

let database = [];
let id = 0;

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} is aangeroepen`);
  next();
});

// UC-201 Register as a new user
app.post("/api/user", (req, res) => {
  let user = req.body;
  let email = req.body.email
  console.log(database)
  if (database.filter((item) => item.email == email).length == 0) {
    id++;
    user = {
      id,
      ...user,
    };
    console.log(user);
    database.push(user);
    res.status(201).json({
      status: 201,
      result: database,
    });
  } else {
    res.status(404).json({
      status: 404,
      result: `Email address is already in use`,
    });
  }
});

// UC-202 Get all users
app.get("/api/user", (req, res, next) => {
  res.status(200).json({
    status: 200,
    result: database,
  });
});

// UC-203 Request personal user profile
app.get("/api/user/profile", (req, res) => {
  res.status(404).json({
    status: 404,
    result: "Function not functioning yet",
  });
});

// UC-204 Get single user by ID
app.get("/api/user/:userId", (req, res, next) => {
  const userId = req.params.userId;
  console.log(`User met ID ${userId} gezocht`);
  let user = database.filter((item) => item.id == userId);
  if (user.length > 0) {
    console.log(user);
    res.status(200).json({
      status: 200,
      result: user,
    });
  } else {
    res.status(404).json({
      status: 404,
      result: `User with ID ${userId} not found`,
    });
  };
});

// UC-205 Update a single user
app.put("/api/user/:userId", (req, res) => {
  let user = req.body;
  const removedIndex = database.findIndex((item) => item.id == req.params.userId)

  if(removedIndex == -1) {
    res.status(404).json({
      status: 404,
      result: `User with ID ${req.params.userId} does not exist`
    })
    return
  } else if(user.email == null || database.filter((item) => item.email == user.email).length > 0) {
    res.status(404).json({
      status: 404,
      result: "Email address is already in use"
    })
    return
  }

  database.splice(removedIndex, 1)

  user = {
    id:req.params.userId,
    ...user
  }
  database.push(user)

  res.status(200).json({
    status: 200,
    result: `User with id ${req.params.userId} updated successfully`
  })
})

// UC-206 Delete a user
app.delete("/api/user/:userId", (req, res) => {
  const removeIndex = database.findIndex((item) => item.id == req.params.userId)
  if(removeIndex != -1) {
    database.splice(removeIndex, 1)
    res.status(200).json({
      status: 200,
      result: `User with id ${req.params.userId} deleted successfully`
    })
    return
  } else {
    res.status(404).json({
      status: 404,
      result: `User with id ${req.params.userId} does not exist`
    })
  }
})

app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
