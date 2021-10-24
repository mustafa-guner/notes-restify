const { Note, AbstractNotesStore } = require("./Notes");
const sqlite = require("sqlite3");
const { GET_ALL } = require("../helpers/SQLITE3_database");

let db;

/*
@desc SQLITE DOCUMENTATION
run: used to create or alter tables and to insert or update table data
get: select a single row of data from one or more tables
all: select multiple rows of data from one or more tables
*/

const connectDB = async () => {
  //If its already open
  if (db) return db;
  const TABLE =
    "CREATE TABLE IF NOT EXISTS notes (notekey VARCHAR(255),title VARCHAR(255),body TEXT);";
  const dbfile = process.env.SQLITE_FILE || "notes-guest.sqlite3";
  await new Promise((resolve, reject) => {
    (db = new sqlite.Database(
      dbfile,
      sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE
    )),
      (err) => {
        if (err) return reject(err);
        resolve(db);
      };

    db.exec(TABLE);
    return db;
  });
};

class SQLITE3NotesStore extends AbstractNotesStore {
  async close() {
    const _db = db;
    db = undefined;
    return _db
      ? new Promise((resolve, reject) => {
          _db.close((err) => {
            if (err) return reject(err);
            resolve();
            console.log("Database is closed.");
          });
        })
      : undefined;
  }

  async update(key, title, body) {
    const _db = await connectDB();

    _db.serialize(() => {
      const note = new Note(key, title, body);

      const statment = _db.prepare(
        "UPDATE notes SET title = ? , body = ? WHERE notekey = ? "
      );
      statment.run(title, body, key);
      statment.finalize();

      return note;
    });
  }

  async create(key, title, body) {
    const _db = await connectDB();

    _db.serialize(() => {
      const note = new Note(key, title, body);

      const statment = _db.prepare(
        "INSERT INTO notes(notekey,title,body) VALUES(?, ?, ?);"
      );
      statment.run(key, title, body);
      statment.finalize();

      return note;
    });
  }

  async read(key) {
    const _db = await connectDB();

    const note = await new Promise((resolve, reject) => {
      _db.get("SELECT * FROM notes WHERE notekey = ?", [key], (err, row) => {
        if (err) return reject(err);

        resolve(new Note(row.notekey, row.title, row.body));
      });
    });
    return note;
  }

  async keylist() {
    const _db = await connectDB();

    return await GET_ALL(_db);
  }

  async destroy(key) {
    const _db = await connectDB();
    _db.serialize(() => {
      const statment = _db.prepare("DELETE from notes WHERE notekey = ?");
      statment.run(key);
      statment.finalize();
    });
  }
}

const instance = new SQLITE3NotesStore();
module.exports = instance;
