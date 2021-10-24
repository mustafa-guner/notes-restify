const Sequelize = require("sequelize");
const jsyaml = require("js-yaml");
const util = require("util");
const fs = require("fs-extra").promises;
const DEBUG = require("debug");
const log = DEBUG("users:model-users");
const error = DEBUG("users:error");

let sequlz;

class SQUser extends Sequelize.Model {}

const connectDB = async () => {
  if (sequlz) return sequlz;

  const yamlText = await fs.readFile(process.env.SEQUELIZE_CONNECT, "utf8");
  const params = await jsyaml.safeLoad(yamlText, "utf8");

  if (
    process.env.SEQUELIZE_DBNAME !== "undefined" &&
    process.env.SEQUELIZE_DBNAME !== ""
  ) {
    params.dbname = process.env.SEQUELIZE_DBNAME;
  }

  //DATABASE USER
  if (
    process.env.SEQUELIZE_DBUSER !== "undefined" &&
    process.env.SEQUELIZE_DBUSER !== ""
  ) {
    params.username = process.env.SEQUELIZE_DBUSER;
  }

  //DATABASE USER PASSWORD
  if (
    process.env.SEQUELIZE_DBPASSWD !== "undefined" &&
    process.env.SEQUELIZE_DBPASSWD !== ""
  ) {
    params.password = process.env.SEQUELIZE_DBPASSWD;
  }

  //DATABASE HOST
  if (
    process.env.SEQUELIZE_DBHOST !== "undefined" &&
    process.env.SEQUELIZE_DBHOST !== ""
  ) {
    params.params.host = process.env.SEQUELIZE_DBHOST;
  }

  //DATABASE PORT
  if (
    process.env.SEQUELIZE_DBPORT !== "undefined" &&
    process.env.SEQUELIZE_DBPORT !== ""
  ) {
    params.params.port = process.env.SEQUELIZE_DBPORT;
  }

  //DATABASE DBDIALECT
  if (
    process.env.SEQUELIZE_DBDIALECT !== "undefined" &&
    process.env.SEQUELIZE_DBDIALECT !== ""
  ) {
    params.params.dialect = process.env.SEQUELIZE_DBDIALECT;
  }

  log("Sequelize parameters: " + util.inspect(params));

  sequlz = new Sequelize(
    params.dbname,
    params.username,
    params.password,
    params.params
  );

  await sequlz.authenticate();

  SQUser.init(
    {
      username: { type: Sequelize.DataTypes.STRING, unique: true },
      password: Sequelize.DataTypes.STRING,
      provider: Sequelize.DataTypes.STRING,
      familyName: Sequelize.DataTypes.STRING,
      givenName: Sequelize.DataTypes.STRING,
      middleName: Sequelize.DataTypes.STRING,
      emails: Sequelize.STRING(2048),
      photos: Sequelize.STRING(2048),
    },
    {
      sequelize: sequlz,
      modelName: "SQUser",
    }
  );
  await SQUser.sync();
};

const userParams = (req) => {
  return {
    username: req.params.username,
    password: req.params.password,
    provider: req.params.provider,
    familyName: req.params.familyName,
    givenName: req.params.givenName,
    middleName: req.params.middleName,
    emails: JSON.stringify(req.params.emails),
    photos: JSON.stringify(req.params.photos),
  };
};

const sanitizedUser = (user) => {
  let ret = {
    id: user.username,
    username: user.username,
    password: user.password,
    provider: user.provider,
    familyName: user.familyName,
    middleName: user.middleName,
  };
  try {
    ret.emails = JSON.parse(user.emails);
  } catch (e) {
    ret.emails = [];
  }

  try {
    ret.photos = JSON.parse(user.photos);
  } catch (e) {
    ret.photos = [];
  }

  return ret;
};

const findOneUser = async (username) => {
  let user = await SQUser.findOne({ where: { username: username } });
  user = user ? sanitizedUser(user) : undefined;

  return user;
};

const createOneUser = async (req) => {
  let inputs = userParams(req);
  await SQUser.create(inputs);
  const result = await findOneUser(req.params.username);
  return result;
};

module.exports = {
  SQUser,
  sanitizedUser,
  userParams,
  findOneUser,
  createOneUser,
  connectDB,
};
