let { d } = require('./crypto');
let { bkY2x, md } = require('./crypto-token');
let { gZ6T, fP6J, cz4D } = require('./utils');
let request = require('request');

let DEFAULT_LEVEL = "standard";
let DEFAULT_ENCODETYPE = "aac";
//let DEFAULT_SONG_ID = "586299";
let DEFAULT_SONG_ID = "18831731";

let bk3x = function(Y3x, _e3x) {
  let i3x = {},
      e3x = Object.assign({}, _e3x),
      mo8g = Y3x.indexOf("?");
  if (mo8g != -1) {
      i3x = gZ6T(Y3x.substring(mo8g + 1));
      Y3x = Y3x.substring(0, mo8g)
  }
  if (e3x.query) {
      i3x = Object.assign(i3x, fP6J(e3x.query) ? gZ6T(e3x.query) : e3x.query)
  }
  if (e3x.data) {
      i3x = Object.assign(i3x, fP6J(e3x.data) ? gZ6T(e3x.data) : e3x.data)
  }
  i3x["csrf_token"] = '';
  Y3x = Y3x.replace("api", "weapi");
  e3x.method = "post";
  delete e3x.query;
  let bYc1x = d(JSON.stringify(i3x), bkY2x(["流泪", "强"]), bkY2x(md), bkY2x(["爱心", "女孩", "惊恐", "大笑"]));
  e3x.data = cz4D({
      params: bYc1x.encText,
      encSecKey: bYc1x.encSecKey
  })
  console.log(e3x.data);
  request({
    url: Y3x,
    method: "POST",
    headers: {
        "content-type": "	application/x-www-form-urlencoded",
    },
    body: e3x.data
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
    }
  });
};

let bLn8f = function(id) {
  bk3x("https://music.163.com/api/song/enhance/player/url/v1", {
      type: "json",
      query: {
          ids: JSON.stringify([id]),
          level: DEFAULT_LEVEL,
          encodeType: DEFAULT_ENCODETYPE
      },
  })
};

bLn8f(DEFAULT_SONG_ID);