const NotesStore = require("../models/notes-sqlite3");

module.exports = {
  homePage: async function (req, res, next) {
    const keylist = await NotesStore.keylist();

    const keyPromises = keylist.map((key) => NotesStore.read(key));
    const notelist = await Promise.all(keyPromises);

    res.render("index", { title: "Notes", notelist: notelist });
  },
};
