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
app.get("/detail/:id", (req, res) => {
  const { id } = req.params;
  db.collection("post").findOne({ _id: Number(id) }, (err, data) => {
    res.render("detail.ejs", { data });
  });
});

// post
app.post("/add", (req, res) => {
  try {
    const { title, date } = req.body;
    db.collection("counter").findOne({ name: "게시물갯수" }, (err, res) => {
      if (err) return console.log(err);
      const { postCount } = res;
      if (!!title && !!date) {
        const nextData = {
          _id: postCount + 1,
          title,
          date,
        };
        db.collection("post").insertOne(nextData, () => {
          console.log("DB:Post 저장 완료");
          db.collection("counter").updateOne(
            { name: "게시물갯수" },
            { $inc: { postCount: 1 } },
            (err, _) => err && console.log(err)
          );
        });
      }
    });
    res.sendFile(__dirname + "/index.html");
  } catch (e) {
    console.log(e);
    res.send("에러 발생");
  }
});

// delete
app.delete("/delete", (req, res) => {
  try {
    const { _id } = req.body;
    db.collection("post").deleteOne({ _id: Number(_id) }, () => {
      res.status(200).send({ message: "성공적으로 삭제했습니다" });
    });
  } catch (e) {
    console.log(e);
  }
});
