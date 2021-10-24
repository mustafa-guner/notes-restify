const program = require("commander");
const restify = require("restify-clients");
const util = require("util");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({
  path: path.join(__dirname, "config/.env"),
});

let client_port;
let client_host;
let client_version = "*";
let client_protocol;
let authid = process.env.API_USER;
let authcode = process.env.API_KEY;

//Automated client service
const client = (program) => {
  if (typeof process.env.PORT === "string")
    client_port = Number.parseInt(process.env.PORT);

  if (typeof program.port === "string")
    client_port = Number.parseInt(program.port);

  if (typeof program.host === "string") client_host = program.host;

  if (typeof program.url === "string") {
    let purl = new URL(program.url);

    if (purl.host && purl.host !== "") client_host = purl.host;
    if (purl.port && purl.port !== "") client_port = purl.port;
    if (purl.protocol && purl.protocol !== "") client_protocol = purl.protocol;
  }

  let connect_url = new URL("http://localhost:5858");
  if (client_protocol) connect_url.protocol = client_protocol;
  if (client_host) connect_url.host = client_host;
  if (client_port) connect_url.port = client_port;

  let client = restify.createJsonClient({
    url: connect_url.href,
    version: client_version,
  });
  client.basicAuth(authid, authcode);
  return client;
};

//node cli.js --help (options)
program
  .option(
    "-p, --port <port>",
    "Port number for user server, if using localhost"
  )
  .option(
    "-h, --host <host>",
    "Port number for user server, if using localhost"
  )
  .option(
    "-u, --url <url>",
    "Connection URL for user server, if using a remote server"
  );

// adds new user;
//@help-command node help add
//@command node cli.js add <username>
program
  .command("add <username>")
  .description("Add a user to the user server.")
  .option("--password <password>", "Password for new user.")
  .option("--family-name <familyName>", "Family name or last name of the user.")
  .option("--given-name <givenName>", "Given name or first name of the user.")
  .option("--middle-name <middleName>", "Middle name of the user.")
  .option("--email <email>", "Email address of the user.")
  .option("--photo <photo>", "Profil Image of the user.")
  //This action is function of the current command (add)
  .action((username, cmdObj) => {
    const { password, familyName, givenName, middleName, email, photo } =
      cmdObj;

    const toPost = {
      provider: "local",
      username,
      password,
      familyName,
      givenName,
      middleName,
      emails: [],
      photos: [],
    };

    if (typeof email !== "undefined") toPost.emails.push(email);
    if (typeof photo !== "undefined") toPost.photos.push(photo);

    client(program).post("/create-user", toPost, (error, req, res, obj) => {
      try {
        console.log("Created " + util.inspect(obj));
      } catch (err) {
        console.error(err.stack);
        console.log(error);
      }
    });
  });

//creates or find  user;
//@help-command node help create-or-find
//@command node cli.js create-or-find <username>
program
  .command("create-or-find <username>")
  .description("Search for the users and if not exists create new one")
  .option("--password <password>", "Password for new user.")
  .option("--family-name <familyName>", "Family name or last name of the user.")
  .option("--given-name <givenName>", "Given name or first name of the user.")
  .option("--middle-name <middleName>", "Middle name of the user.")
  .option("--email <email>", "Email address of the user.")
  .action((username, cmdObj) => {
    const { password, familyName, givenName, middleName, email } = cmdObj;
    const toPost = {
      provider: "local",
      username,
      password,
      familyName,
      givenName,
      middleName,
      emails: [],
      photos: [],
    };
    if (typeof email !== "undefined") toPost.emails.push(email);
    client(program).post("/find-or-create", toPost, (err, req, res, obj) => {
      try {
        console.log("Created or Found " + util.inspect(obj));
      } catch (err) {
        console.log(err.stack);
      }
    });
  });

//find  user;
//@help-command node help find
//@command node cli.js find <username>
program
  .command("find <username>")
  .description("Search for a user on the user server")
  .action((username, cmdObj) => {
    client(program).get(`/find/${username}`, (err, req, res, obj) => {
      if (err) return console.log(err.stack);
      console.log("Found " + util.inspect(obj));
    });
  });

//list users;
//@help-command node help list-users
//@command node cli.js list-users
program
  .command("list-users")
  .description("List all the users on the server")
  .action((cmdObj) => {
    client(program).get("/list", (err, req, res, obj) => {
      if (err) return console.log(err);
      console.log(util.inspect(obj));
    });
  });

//update-user <username>;
//@help-command node help update-user
//@command node cli.js update-user
program
  .command("update-user <username>")
  .description("Update the user on the server")
  .option("--password <password>", "Change password for the user")
  .option("--email <email>", "Change email for the user")
  .option(
    "--given-name <givenName>",
    "Change given name or first name for the user"
  )
  .action((username, cmdObj) => {
    const { password, email, givenName } = cmdObj;
    let updates = {
      username,
      password,
      givenName,
      emails: [],
      photos: [],
    };

    if (typeof email !== "undefined") {
      updates.emails.push(email);
    }

    client(program).post(
      `/update/${username}`,
      updates,
      (err, req, res, obj) => {
        if (err) return console.log(err);
        console.log("Updates: " + util.inspect(obj));
      }
    );
  });

//delete <username>;
//@help-command node help delete-user
//@command node cli.js delete-user
program
  .command("remove-user <username>")
  .description("Remove user from the server")
  .action((username, cmdObj) => {
    client(program).del(`/remove/${username}`, (err, req, res, obj) => {
      if (err) return console.log(err.stack);
      console.log(`Removed: ${username}`);
    });
  });

//check-password <username> <password>;
//@help-command node help check-password
//@command node cli.js check-password
program
  .command("check-password <username> <password>")
  .description("Check the credentials of the server user")
  .action((username, password, cmdObj) => {
    client(program).post(
      "/password-check",
      { username, password },
      (err, req, res, obj) => {
        if (err) return console.log(err.stack);
        console.log(obj);
      }
    );
  });

program.parse(process.argv);
//in order to display the commands and options on terminal this should be written.
