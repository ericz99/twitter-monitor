/* Special Thank you to _luqy or matt, don't know you but, I want to give you credit! */

/* LINE: 108; just do another if statement to check if keyword does not match, which means we get anything the user tweets from most recent! */

try {
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
  const request = require("request");

  const config = require(path.join(__dirname, "config.json"));

  var Twitter = new twit({
    consumer_key: config.app.consumer.key,
    consumer_secret: config.app.consumer.secret,
    access_token: config.app.access.token,
    access_token_secret: config.app.access.secret
  });

  console.log("Custom Twitter OCR Monitor ~ Written by Eric!");
  console.log("Scanning for new tweets...");

  let keywords = config.app.other.keywords;
  let idarray = [];

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

  function startMonitor() {
    /* Only way to send multiple request is by looping through the twitter names */
    config.app.other.twittername.forEach(name => {
      Twitter.get(
        "statuses/user_timeline",
        {
          screen_name: name,
          count: 1,
          exclude_replies: true,
          include_rts: false
        },
        function(err, data) {
          if (!err) {
            data.forEach(function(tweet) {
              let text = tweet.text.toLowerCase();
              let id = tweet.id_str;

              keywords.forEach(keyword => {
                if (text.includes(keyword.toLowerCase())) {
                  if (
                    text.match(/restock/g) ||
                    text.match(/live/g) ||
                    text.match(/hi/g) ||
                    text.match(/test/g)
                  ) {
                    if (!(idarray.indexOf(id) > -1)) {
                      console.log("Found matching keyword: " + keyword + "!");
                      console.log("Found tweet id: " + id);

                      /* Send Webhook */
                      let opts = {
                        url: config.webhook,
                        method: "POST",
                        headers: headers,
                        json: {
                          embeds: [
                            {
                              title: `Tweet from @${tweet.user.screen_name}`,
                              url: `https://twitter.com/${
                                tweet.user.name
                              }/status/${id}`,
                              color: 1768289,
                              footer: {
                                text: "Custom Twitter OCR Monitor V1"
                              },
                              fields: [
                                {
                                  name: "Description",
                                  value: text,
                                  inline: true
                                }
                              ]
                            }
                          ]
                        }
                      };
                      request(opts);
                      console.log("Sent Hook!");

                      idarray.push(id);
                    }
                  }
                } else if (text.match(/[\s\S]+/g)) {
                  // /[\s\S]+/g
                  // /^\b\w+\b$/i
                  // /\/\*([\s\S]*?)\*\//g

                  if (!(idarray.indexOf(id) > -1)) {
                    console.log("Found matching keyword: * ");
                    console.log("Found tweet id: " + id);

                    /* Send Webhook */
                    let opts = {
                      url: config.webhook,
                      method: "POST",
                      headers: headers,
                      json: {
                        embeds: [
                          {
                            title: `Tweet from @${tweet.user.screen_name}`,
                            url: `https://twitter.com/${
                              tweet.user.name
                            }/status/${id}`,
                            color: 1768289,
                            footer: {
                              text: "Custom Twitter OCR Monitor V1"
                            },
                            fields: [
                              {
                                name: "Description",
                                value: text,
                                inline: true
                              }
                            ]
                          }
                        ]
                      }
                    };
                    request(opts);
                    console.log("Sent Hook!");

                    idarray.push(id);
                  }
                }
              });
            });
          } else {
            console.log(
              "An error occurred while attempting to search for tweets: " +
                err.message
            );
          }
        }
      );
    });
  }

  function ocrMonitor() {
    /* Intelligence Twitter Bot - hehe */
  }

  startMonitor();
  setInterval(startMonitor, config.interval);
} catch (err) {
  if (err) {
    console.log(err);
  }
}
