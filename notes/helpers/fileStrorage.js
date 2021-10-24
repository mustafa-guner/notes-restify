const path = require("path");
const fs = require("fs-extra");
const { Note } = require("../models/Notes");

module.exports = {
  notesDir: async () => {
    const dir =
      process.env.NOTES_FS_DIR || path.join(__dirname, "notes-fs-data");
    await fs.ensureDir(dir); //makes sure that the directory exists.
    return dir;
  },
  filePath: (notesdir, key) => path.join(notesdir, `${key}.json`),

  readJSON: async (notesdir, key) => {
    const readFrom = filePath(notesdir, key);
    const data = await fs.readFile(readFrom, "utf8");
    return Note.fromJSON(data);
  },

  //@desc  is used to support both the create & update methods.Write the content to the disk as a JSON file.
  crupdate: async (key, title, body) => {
    const notesdir = await notesDir();
    if (key.indexOf("/") >= 0) {
      throw new Error(`key ${key} cannot contain '/'`);
    }
    const note = new Note(key, title, body);
    const writeTo = filePath(notesdir, key);
    const writeJSON = note.JSON;
    await fs.writeFile(writeTo, writeJSON, "utf8");
    return note;
  },
};
