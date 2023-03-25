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
// 메인페이지
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
// 할 일 작성 페이지
app.get("/write", (req, res) => {
  res.sendFile(__dirname + "/write.html");
});
// 할 일 리스트 페이지
app.get("/list", (req, res) => {
  try {
    db.collection("post")
      .find()
      .toArray((err, dbPosts) => {
        res.render("list.ejs", { posts: dbPosts });
      });
  } catch (e) {
    console.log("GET_list", e);
    res.send("에러 발생");
  }
});
// 할 일 상세 페이지
app.get("/detail/:id", (req, res) => {
  try {
    const { id } = req.params;
    db.collection("post").findOne({ _id: Number(id) }, (err, data) => {
      res.render("detail.ejs", { data });
    });
  } catch (e) {
    console.log("GET_detail", e);
    res.send("GET_detail 에러 발생");
  }
});

// post
// 할 일 추가
app.post("/add", (req, resTop) => {
  try {
    const { title, date } = req.body;
    db.collection("counter").findOne({ name: "게시물갯수" }, (err, res) => {
      const { postCount } = res;
      if (!!title && !!date) {
        const nextData = {
          _id: postCount + 1,
          title,
          date,
        };
        db.collection("post").insertOne(nextData, () => {
          db.collection("counter").updateOne(
            { name: "게시물갯수" },
            { $inc: { postCount: 1 } },
            (err, res) => {
              resTop.render("detail.ejs", { data: nextData });
            }
          );
        });
      }
    });
  } catch (e) {
    console.log("POST_add", e);
    res.send("POST_add, 에러 발생");
  }
});

// delete
// 할 일 삭제
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
