const express = require("express");
const app = express();

app.listen(8080, function () {
  console.log("hello, 8080");
});

app.get("/", function (req, res) {
  console.log("hello, main");
  res.sendFile(__dirname + "/index.html");
});
app.get("/pet", function (req, res) {
  console.log("hello, pet");
  res.send("펫, 반갑슴다");
});

app.get("/beauty", function (req, res) {
  console.log("hello, beauty");
  res.send("뷰티, 반갑슴다");
});
