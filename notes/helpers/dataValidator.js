module.exports = {
  dataValidator: (data) => {
    return (
      typeof data !== "object" ||
      !data.hasOwnProperty("key") ||
      !data.hasOwnProperty("title") ||
      !data.hasOwnProperty("body") ||
      typeof data.title !== "string" ||
      typeof data.body !== "string" ||
      typeof data.key !== "string"
    );
  },
};
