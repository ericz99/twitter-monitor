const request = require("request");

module.exports = function(headers, data, config) {
  /* Send Webhook */
  let opts = {
    url: config.webhook,
    method: "POST",
    headers: headers,
    json: {
      embeds: [
        {
          author: {
            name: `${data.user.screen_name}`,
            url: `https://twitter.com/${data.user.screen_name}`,
            icon_url: `${data.user.profile_image_url}`
          },
          title: `Tweet from @${data.user.screen_name}`,
          url: `https://twitter.com/${data.user.screen_name}/status/${
            data.id_str
          }`,
          color: 1768289,
          footer: {
            text: `Twitter Monitor - ${data.created_at}`
          },
          fields: [
            {
              name: "Description",
              value: data.text,
              inline: true
            }
          ],
          image: {
            url:
              data.entities.media !== undefined
                ? data.entities.media[0].media_url
                : null
          }
        }
      ]
    }
  };

  request(opts);
};
