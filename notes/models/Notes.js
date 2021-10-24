const _note_key = Symbol("key");
const _note_title = Symbol("title");
const _note_body = Symbol("body");
const { dataValidator } = require("../helpers/dataValidator");

///Symbol is a data hiding technique
//Symbol is a primitive which can not be recreated. In this case
//a symbols is similar to an object as creating multiple instances will result
//which are not exactly equal

//Semmboller classlar arasindaki ayni constructorlerin cakismasini engellemek amaciyla
//encapsulation mantigilya  yaratilan objelerdir ancak primitive ozelligi tasirlar.
//Symbol("deneme") === Symbol("deneme") -> false.

//https://medium.com/intrinsic-blog/javascript-symbols-but-why-6b02768f4a5c

//Describes a single note in app
class Note {
  constructor(key, title, body) {
    this[_note_key] = key;
    this[_note_title] = title;
    this[_note_body] = body;
  }

  get key() {
    return this[_note_key];
  }

  get title() {
    return this[_note_title];
  }

  get body() {
    return this[_note_body];
  }

  set title(title) {
    return (this[_note_title] = title);
  }

  set body(body) {
    return (this[_note_body] = body);
  }

  //IMPLEMENTED FOR THE FILE SYSTEM DATABASE
  get JSON() {
    //to string
    return JSON.stringify({
      key: this.key,
      title: this.title,
      body: this.body,
    });
  }

  static fromJSON(json) {
    //to the object

    const data = JSON.parse(json);
    if (dataValidator(data)) {
      //returns false
      throw new Error(`Not a note: ${json}`);
    }
    const note = new Note(data.key, data.title, data.body);
    return note;
  }
}

//Describes methods for managing some note instances
class AbstractNotesStore {
  async close() {}
  async update(key, title, body) {}
  async create(key, title, body) {}
  async read(key) {}
  async destroy(key) {}
  async keylist() {}
  async count() {}
}

// let note = new Note("deneme", "title", "body");

// let stringify = note.JSON;
// console.log(Note.fromJSON(stringify));
//It did not override the current class key. Since Symbol is unique (even keys are same)
//it created one more key

module.exports = { Note, AbstractNotesStore };
