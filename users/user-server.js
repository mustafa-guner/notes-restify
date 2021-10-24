const restify = require("restify");
const util = require("util");

const {
  findOneUser,
  SQUser,
  userParams,
  createOneUser,
  sanitizedUser,
  connectDB,
} = require("./users-sequelize");

const path = require("path");
const DEBUG = require("debug");
const log = DEBUG("users:service");
const error = DEBUG("users:error");

require("dotenv").config({
  path: path.join(__dirname, "config/.env"),
});

const server = restify.createServer({
  name: "User-Auth-Service",
  version: "0.0.1",
});

server.use(restify.plugins.authorizationParser());
server.use(check);
server.use(restify.plugins.queryParser());
server.use(restify.plugins.jsonp());
server.use(
  restify.plugins.bodyParser({
    mapParams: true,
  })
);

server.get("/list", async (req, res, next) => {
  try {
    await connectDB();
    let users = await SQUser.findAll({});
    users = users.map((user) => sanitizedUser(user));
    if (!users) users = [];
    res.contentType = "json";
    res.send(users);
    next(false);
  } catch (err) {
    res.send(500, err);
    next(false);
  }
});

server.post("/update/:username", async (req, res, next) => {
  try {
    await connectDB();
    let toupdate = userParams(req);
    await SQUser.update(toupdate, {
      where: { username: req.params.username },
    });

    const result = await findOneUser(req.params.username);
    res.contentType = "json";

    res.send(result);
    next(false);
  } catch (err) {
    res.send(500, err);
    next(false);
  }
});

server.del("/remove/:username", async (req, res, next) => {
  try {
    await connectDB();
    let user = await findOneUser(req.params.username);
    if (!user) throw new Error("User is not found!");
    await SQUser.destroy({ where: { username: user.username } });
    let usersLeft = await SQUser.findAll({});
    res.contentType = "json";
    res.send(usersLeft);
    next(false);
  } catch (err) {
    res.send(500, err);
    next(false);
  }
});

server.get("/find/:username", async (req, res, next) => {
  try {
    await connectDB();
    const user = await findOneUser(req.params.username);
    if (!user) {
      return res.send(404, new Error("Did not find " + req.params.username));
    }
    res.contentType = "json";
    res.send(user);
    next(false);
  } catch (err) {
    res.send(500, err);
    next(false);
  }
});

server.post("/create-user", async (req, res, next) => {
  try {
    await connectDB();
    let result = await createOneUser(req);
    res.contentType = "json";

    res.send(result);
    next(false);
  } catch (err) {
    res.send(500, err.message);
    next(false);
  }
});

server.post("/find-or-create", async (req, res, next) => {
  try {
    await connectDB();
    let user = await findOneUser(req.params.username);
    if (!user) {
      user = await createOneUser(req);
      if (!user) throw new Error("No user created!");
    }

    res.contentType = "json";
    res.send(user);
    return next(false);
  } catch (err) {
    console.log("error verrddii annnnasini avraddiinii");
    res.send(500, err);
    next(false);
  }
});

server.post("/password-check", async (req, res, next) => {
  try {
    await connectDB();
    const user = await findOneUser(req.params.username);
    let status;
    if (!user) {
      status = {
        success: false,
        message: "Coundt find the user.",
        username: req.params.username,
      };
    } else if (
      req.params.username === user.username &&
      req.params.password === user.password
    ) {
      status = {
        success: true,
        message: `Welcome back! ${user.username}`,
      };
    } else {
      status = {
        success: false,
        message: "Incorrect password",
        username: req.params.username,
      };
    }

    res.contentType = "json";
    res.send(status);
    next(false);
  } catch (err) {
    res.send(500, err);
    next(false);
  }
});

server.listen(process.env.PORT, "localhost", () => {
  log(server.name + " listening at " + server.url);
});

//UNCAUGHT ERRORS HANDLERS

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION - " + (err.stack || err));
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED PROMISE REJECTION - " + util.inspect(promise));
  process.exit(1);
});

//Mimic API Key authentication
const { API_USER, API_KEY } = process.env;
let apiKeys = [{ user: API_USER, key: API_KEY }];

function check(req, res, next) {
  if (req.authorization && req.authorization.basic) {
    let found = false;

    for (let auth of apiKeys) {
      if (
        auth.key === req.authorization.basic.password &&
        auth.user === req.authorization.basic.username
      ) {
        found = true;
        break;
      }
    }
    if (found) next();
    else {
      res.send(401, new Error("Not authenticated"));
      next(false);
    }
  } else {
    res.send(500, new Error("No Authorization Key"));
    next(false);
  }
}
