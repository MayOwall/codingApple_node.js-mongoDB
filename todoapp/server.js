// env
require("dotenv/config");
const { MONGODB_ID, MONGODB_PASSWORD } = process.env;

// server
const mongoClient = require("mongodb").MongoClient;
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let db;
mongoClient.connect(
  `mongodb+srv://${MONGODB_ID}:${MONGODB_PASSWORD}@cluster0.sjgsexl.mongodb.net/todoapp?retryWrites=true&w=majority`,
  (err, client) => {
    db = client.db("todoapp");

    app.listen(8080, () => {
      console.log("hello, 8080");
    });
  }
);

// get
app.get("/", (req, res) => {
  console.log("👀 Page Access Detected : main");
  res.sendFile(__dirname + "/index.html");
});
app.get("/write", (req, res) => {
  console.log("👀 Page Access Detected : write");
  res.sendFile(__dirname + "/write.html");
});
app.get("/list", (req, res) => {
  db.collection("post")
    .find()
    .toArray((err, dbPosts) => {
      if (err) {
        return console.log("/list db 에러 발생");
      }
      res.render("list.ejs", { posts: dbPosts });
    });
});

// post
app.post("/add", (req, res) => {
  const { title, date } = req.body;
  if (!!title && !!date) {
    const nextData = {
      title,
      date,
    };
    db.collection("post").insertOne(nextData, () => {
      console.log("DB:Post 저장 완료");
    });
    res.send("전송 완료");
  } else {
    console.log("/add post의 title 혹은 date값이 비어있습니다");
    res.send("에러 발생");
  }
});
