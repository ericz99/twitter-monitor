const log = require("./lib/logger")("Twitter Monitor V1");
const path = require("path");
const twit = require("twit");
const request = require("request");
const notify = require("./lib/notify");

const config = require(path.join(__dirname, "config.json"));

// twitter configuration
var T = new twit({
  consumer_key: config.app.consumer.key,
  consumer_secret: config.app.consumer.secret,
  access_token: config.app.access.token,
  access_token_secret: config.app.access.secret
});

let headers = {
  "Accept-Encoding": "gzip, deflate",
  "Accept-Language": "en-US,en;q=0.9",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
  "Cache-Control": "max-age=0",
  Connection: "keep-alive"
};

/* Start up function */
(function() {
  const Twitter = {
    userID: [],
    tweetID: [],
    init: function() {
      this.connector().then(() => this.startMonitor());
    },
    connector: function() {
      log.green("Initializing Twitter Monitor...");
      return new Promise((resolve, reject) => {
        config.app.other.twittername.forEach(name => {
          T.get("/users/show", { screen_name: name }, (err, data, res) => {
            if (err) {
              reject();
              return log.red("ERROR" + err);
            }

            this.userID.push(data.id_str);
            if (this.userID.length == config.app.other.twittername.length) {
              resolve();
            }
          });
        });
      });
    },
    startMonitor: function() {
      var stream = T.stream("statuses/filter", {
        follow: this.userID,
        exclude_replies: true,
        include_rts: false
      });

      stream.on("connected", res => {
        log.green(
          "Twitter Monitor is connected... ~ Currently monitoring " +
            config.app.other.twittername.length +
            " profiles"
        );
      });

      stream.on("tweet", tweet => {
        if (
          !this.tweetID.includes(tweet.id_str) &&
          this.userID.includes(tweet.user.id_str)
        ) {
          this.tweetID.push(tweet.id_str);
          log.green("****** TWEET DETECTED ******");
          log.blue(`[USER: ${tweet.user.screen_name}] - Just tweeted!`);
          log.blue(`[TIMESTAMP] - ${tweet.timestamp_ms}`);
          log.yellow("Sent discord webhook!");
          // notify user
          notify(headers, tweet, config);
        }
      });
    }
  };

  Twitter.init();
})();
