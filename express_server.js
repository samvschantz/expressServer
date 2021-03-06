var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser')
app.use(cookieParser())

const bcrypt = require('bcrypt');
// const password = "purple-monkey-dinosaur"; // you will probably this from req.params
// const hashedPassword = bcrypt.hashSync(password, 10);

app.set("view engine", "ejs");

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

var urlDatabase = {
  "userRandomID": {
    "b2xVn2": "http://www.lighthouselabs.ca",
  },
 "user2RandomID": {
  "b2xVn2": "http://www.lighthouselabs.ca",
 }
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/register", (req, res) => {
  let templateVars = {
    username: req.cookies['userID']
  };
  res.render("urls_register", templateVars)
});

app.post("/register", (req, res) => {
  let userID = 'user' + generateRandomString()
  let password = bcrypt.hashSync(req.body.password, 10);
  let email = req.body.email
  // how comparesync works
  // bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword); // returns true
  // bcrypt.compareSync("pink-donkey-minotaur", hashedPassword); // returns false
  for (var person in users){
    if (users[person]['email'] === email){
      res.sendStatus(400)
    } else if (users[person]['password'] === password){
      res.sendStatus(400)
    }
  };
  // checks whether email or password field are filled in
  if (!email || !password){
    res.sendStatus(400)
  } else {
    users[userID] = {
      id: userID,
      email: email,
      password: password
    };
    urlDatabase[userID] = {}
    res.cookie("userID", userID)
    res.redirect("http://localhost:8080/urls/")
  };
});

app.get("/login", (req, res) => {
  res.render("urls_login")
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let username = req.cookies['userID']
  let templateVars = {
    username: req.cookies['userID'],
    urls: urlDatabase[username]
  };
  //the object we are accessing in the loop is urls
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["userID"],
  };
  if (req.cookies["userID"] === undefined){
    res.redirect("http://localhost:8080/login")
  } else {
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  let userID = req.cookies.userID
  var shortURL = generateRandomString()
  var longURL = req.body.longURL
  if (urlDatabase[userID] === {}){
    urlDatabase[userID] = { [shortURL] : longURL }
  } else {
    urlDatabase[userID][shortURL] = longURL
  }
  res.redirect('http://localhost:8080/urls/' + shortURL);
});

app.get("/u/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL
  for (person in urlDatabase){
    var longURL = urlDatabase[person][shortURL]
  }
  res.redirect(longURL);
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID")
  res.redirect("http://localhost:8080/urls/")
})

app.get("/urls/:id", (req, res) => {
  var username = req.cookies['userID']
  let templateVars = {
    shortURL: req.params.id, urlDatabase,
    username: req.cookies['userID']
    };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  let longURL = req.body.longURL
  let userID = req.cookies.userID
  urlDatabase[userID][shortURL] = longURL
  res.redirect("http://localhost:8080/urls/")
});

app.post("/login", (req, res) =>{
  let userID = req.body.userID
  let email = req.body.email
  let password = req.body.password
  let matchFound = false
  for (var person in users){
    if (users[person]['email'] === email && bcrypt.compareSync(password, users[person]['password'])){
      res.cookie("userID", users[person]['id'])
      matchFound = true
      }
  };
  if(matchFound === false){
    res.sendStatus(400);
  };
  res.redirect('http://localhost:8080/urls/')
});

app.post("/urls/:id/delete", (req, res) =>{
  var shortURL = req.params.id
  delete urlDatabase[shortURL]
  res.redirect('http://localhost:8080/urls/')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});