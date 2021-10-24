const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const hbs = require("hbs");
const fs = require("fs-extra");
const rfs = require("rotating-file-stream");
const bp = require("body-parser");
const indexRouter = require("./routes/index.js");
const notesRouter = require("./routes/notesRouter.js");
const app = express();

require("dotenv").config({
  path: path.join(__dirname, "/config/.env"),
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// const accessLogStream = fs.createWriteStream(`${__dirname}/access.log`, {
//   flags: "a",
// });
//flags a => append

// app.use(logger(process.env.REQUEST_LOG_FORMAT));
// app.use(logger(process.env.REQUEST_LOG_FORMAT, { stream: accessLogStream })); //Output stream for writing log lines, (without usage of rotating-file-stream package)
//Yapilan tum requestleri loglama (dosya icerisine) ve daha sonra onu dolduguna zipleme fonksiyonu
app.use(
  logger(process.env.REQUEST_LOG_FORMAT || "dev", {
    stream: process.env.REQUEST_LOG_FILE
      ? rfs.createStream(process.env.REQUEST_LOG_FILE, {
          size: "10M", //rotate every 10 MegaBytes written
          interval: "1d", //rotate daily
          compress: "gzip", //compress rotated files
        })
      : process.stdout,
  })
);
app.use(bp.json());
app.use(bp.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
hbs.registerPartials(path.join(__dirname, "/views/partials"));

//lET EXPRESS RECOGNIZE THE BOOTSTRAP
app.use(
  "/assets/vendor/bootstrap",
  express.static(path.join(__dirname, "node_modules", "bootstrap", "dist"))
);

//LET EXPRESS RECOGNIZE THE JQUERY
app.use(
  "/assets/vendor/jquery",
  express.static(path.join(__dirname, "node_modules", "jquery", "dist"))
);

//LET EXPRESS RECOGNIZE POPPER JS
app.use(
  "/assets/vendor/@popperjs",
  express.static(
    path.join(__dirname, "node_modules", "@popperjs/core", "dist", "umd")
  )
);

//LET EXPRESS RECOGNIZE THE FEATHER ICONS
app.use(
  "/assets/vendor/feather-icons",
  express.static(path.join(__dirname, "node_modules", "feather-icons", "dist"))
);

app.use("/", indexRouter);
app.use("/notes/", notesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
