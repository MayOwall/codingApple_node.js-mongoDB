// env
require("dotenv/config");
const { MONGODB_ID, MONGODB_PASSWORD } = process.env;

// session libraries
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

// server
const mongoClient = require("mongodb").MongoClient;
const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(
  session({ secret: "비밀 코드", resave: true, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());
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

// GET
// 메인페이지
app.get("/", (req, res) => {
  res.render("index.ejs");
});
// 할 일 작성 페이지
app.get("/write", (req, res) => {
  res.render("write.ejs");
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
// 할 일 수정 페이지
app.get("/edit/:id", (req, res) => {
  try {
    const { id } = req.params;
    db.collection("post").findOne({ _id: Number(id) }, (err, data) => {
      if (err) res.send("에러 발생");
      res.render("edit.ejs", { data });
    });
  } catch (e) {
    console.log("GET_edit", e);
  }
});
// 로그인 페이지
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// POST
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
// 할 일 수정
app.post("/edit", (req, res) => {
  const { _id, title, date } = req.body;
  db.collection("post").updateOne(
    { _id: Number(_id) },
    { $set: { title: title, date: date } },
    (err, _) => {
      err ? console.log("수정 실패") : console.log("수정 성공");
    }
  );
  res.end();
});
app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/fail" }),
  (req, res) => {
    res.redirect("/");
  }
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false,
    },
    function (입력한아이디, 입력한비번, done) {
      //console.log(입력한아이디, 입력한비번);
      db.collection("login").findOne(
        { id: 입력한아이디 },
        function (에러, 결과) {
          if (에러) return done(에러);

          if (!결과)
            return done(null, false, { message: "존재하지않는 아이디요" });
          if (입력한비번 == 결과.pw) {
            return done(null, 결과);
          } else {
            return done(null, false, { message: "비번틀렸어요" });
          }
        }
      );
    }
  )
);

// DELETE
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
