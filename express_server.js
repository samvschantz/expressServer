var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
// switching to cookieSession
// var cookieParser = require('cookie-parser')
// app.use(cookieParser())
var cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ['googlegoggles'],
}))

app.set("view engine", "ejs");

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

const users = {};

var urlDatabase = {};

app.get("/", (req, res) => {
  res.redirect('http://localhost:8080/urls/');
});

app.get("/register", (req, res) => {
  let templateVars = users
  res.render("urls_register", templateVars)
});

app.post("/register", (req, res) => {
  let userID = 'user' + generateRandomString()
  let password = req.body.password
  let email = req.body.email
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
    req.session.userID = userID
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
  let templateVars = users
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  let username = req.session.userID
  let templateVars = users
  if (req.session.userID === undefined){
    res.redirect("http://localhost:8080/login")
  } else {
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  let userID = req.session.userID
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
    console.log(urlDatabase[person])
  }
  res.redirect('http://localhost:8080/urls/');
});

app.post("/logout", (req, res) => {

  res.redirect("http://localhost:8080/urls/")
})

app.get("/urls/:id", (req, res) => {
  var username = req.session.userID
  let templateVars = users
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  let longURL = req.body.longURL
  let userID = req.session.userID
  urlDatabase[userID][shortURL] = longURL
  res.redirect("http://localhost:8080/urls/")
});

app.post("/login", (req, res) =>{
  let userID = req.session.userID
  let email = req.body.email
  let password = req.body.password
  let matchFound = false
  for (var person in users){
    if (users[person]['email'] === email && bcrypt.compareSync(password, users[person]['password']){
      req.session.userID = users[person]['id']
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