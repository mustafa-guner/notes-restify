module.exports = {
  GET_ALL: (db) => {
    return new Promise((resolve, reject) => {
      db.all("SELECT notekey FROM notes", (err, notes) => {
        if (err) return reject(err);
        console.log(notes);
        resolve(notes.map((note) => note.notekey));
      });
    }).then((res) => res);
  },
};
