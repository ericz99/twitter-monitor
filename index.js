require("console-stamp")(console, {
  colors: {
    stamp: "yellow",
    label: "cyan",
    label: true,
    metadata: "green"
  }
});

const path = require("path");
const twit = require("twit");

const config = path.join(__dirname, "config.json");

var Twitter = new twit({
  consumer_key: config["consumer_key"],
  consumer_secret: config["consumer_secret"],
  access_token: config["access_token"],
  access_token_secret: config["access_token_secret"]
});

console.log("Custom Twitter OCR ~ Written by Eric!");
