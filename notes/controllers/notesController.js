var Notes = require("../models/notes-sqlite3");

module.exports = {
  addPage: (req, res, next) => {
    res.render("noteedit", {
      title: "Add a Note",
      docreate: true,
      notekey: "",
      note: undefined,
    });
  },

  updatePage: async (req, res, next) => {
    try {
      const { key } = req.query;
      const note = await Notes.read(key);
      res.render("noteedit", {
        title: "Update " + note.title,
        docreate: false,
        notekey: key,
        note: note,
      });
    } catch (err) {
      next(err);
    }
  },

  save: async (req, res, next) => {
    try {
      const { title, notekey, body, docreate } = req.body;

      if (docreate === "create") {
        await Notes.create(notekey, title, body);
      } else {
        await Notes.update(notekey, title, body);
      }

      res.redirect("/notes/view?key=" + notekey);
    } catch (err) {
      next(err);
    }
  },

  confirmRemove: async (req, res, next) => {
    try {
      const { notekey } = req.body;

      await Notes.destroy(notekey);

      res.redirect("/");
    } catch (err) {
      next(err);
    }
  },

  getNote: async (req, res, next) => {
    try {
      let note = await Notes.read(req.query.key);

      res.render("noteview", {
        title: note?.title,
        notekey: req.query.key,
        note: note,
      });
    } catch (err) {
      next(err);
    }
  },
};
