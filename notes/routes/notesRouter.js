const express = require("express");
const notesRouter = express.Router();
const {
  addPage,
  updatePage,
  save,
  confirmRemove,
  getNote,
} = require("../controllers/notesController");

notesRouter.get("/add", addPage);
notesRouter.get("/update/", updatePage);
notesRouter.post("/save", save);

notesRouter.post("/remove/confirm", confirmRemove);

notesRouter.get("/view", getNote);

module.exports = notesRouter;
