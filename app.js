const path = require("path");

const express = require("express");

const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
// const csrf = require("csurf");
// const flash = require("connect-flash");

//@@@@
// const bodyParser = require("body-parser");

const cors = require("cors");

//import models
const User = require("./models/user");

// // 存在すればログインしている / 存在しなければログインしていない（ログアウトしている）
// {
//   expires: "",
//   isLoggedIn: true | false,
// };

const MONGODB_URI =
  "mongodb+srv://yumi:HNYp6CMgzItJL9yA@cluster0.lbe7x.mongodb.net/questions?retryWrites=true&w=majority";

const app = express();

//Store session in the MongoDBStore
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

// const Protection = csrf();

// app.set("view engine", "jsx");

//import routes
const questionRoutes = require("./routes/questionsRoutes");
const resultsRoutes = require("./routes/resultsRoutes");
const authRoutes = require("./routes/auth");
//@@@@
//@http://localhost:3000/ /があるとoriginではない
//@originとcredentialsを設定する。
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//initialize session
app.use(
  session({
    secret: "my secret id",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// app.use(csrfProtection);
// app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

// app.use((req, res, next) => {
//   res.locals.isAuthenticated = req.session.isLoggedIn;
//   // res.locals.csrfToken = req.csrfToken();
//   console.log("hello");
//   next();
// });

//read middleware function inside of the routes and enable them.

// const questionRoutes = new Router();

// questionRoutes.get("/");

// const answerRoutes = new Router();

// // /answers/questions
// answerRoutes.get("/questions");

///@@@第一引数の/questionsはroutesフォルダのurlにつながる。例えばroutesフォルダにも/questionと記載すると。URLは/question/questionとダブってしまうので注意
//@@@URLのダブりを防ぐために、app.js内に/questionsなどは記載する。
//@@@app.js内でurlを記載することで、routesフォルダをみなくてもここでURLを一括管理できるので、なるべくここにURLを記載するように。
app.use("/questions", questionRoutes);
app.use("/result", resultsRoutes);
app.use(authRoutes);
// app.use("/session", sessionRoutes);

mongoose.set("useUnifiedTopology", true);

//connect to mongoose
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true })
  .then((result) => {
    console.log("connected");
    app.listen(3001);
  })
  .catch((err) => {
    console.log(err);
  });
