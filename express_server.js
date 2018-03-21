var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser')
app.use(cookieParser())

app.set("view engine", "ejs");

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  console.log(req.cookies["username"])
  //the object we are accessing in the loop is urls
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString()
  var longURL = req.body.longURL
  urlDatabase[shortURL] = longURL
  res.redirect('http://localhost:8080/urls/' + shortURL);
});

app.get("/u/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL
  let longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id, urlDatabase,
    username: req.cookies["username"],
    };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  let longURL = req.body.longURL
  urlDatabase[shortURL] = longURL
});

app.post("/login", (req, res) =>{
  let login = req.body.login
  //already a string so good to go as a cookie
  res.cookie("username", login)
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