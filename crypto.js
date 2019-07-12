let CryptoJS = require('crypto-js');
let { RSAKeyPair, setMaxDigits, encryptedString } = require('./crypto-utils');

// (function() {
//   for (var u = CryptoJS, p = u.lib.BlockCipher, d = u.algo, l = [], s = [], t = [], r = [], w = [], v = [], b = [], x = [], q = [], n = [], a = [], c = 0; 256 > c; c++) a[c] = 128 > c ? c << 1 : c << 1 ^ 283;
//   for (var e = 0, j = 0, c = 0; 256 > c; c++) {
//       var k = j ^ j << 1 ^ j << 2 ^ j << 3 ^ j << 4,
//           k = k >>> 8 ^ k & 255 ^ 99;
//       l[e] = k;
//       s[k] = e;
//       var z = a[e],
//           F = a[z],
//           G = a[F],
//           y = 257 * a[k] ^ 16843008 * k;
//       t[e] = y << 24 | y >>> 8;
//       r[e] = y << 16 | y >>> 16;
//       w[e] = y << 8 | y >>> 24;
//       v[e] = y;
//       y = 16843009 * G ^ 65537 * F ^ 257 * z ^ 16843008 * e;
//       b[k] = y << 24 | y >>> 8;
//       x[k] = y << 16 | y >>> 16;
//       q[k] = y << 8 | y >>> 24;
//       n[k] = y;
//       e ? (e = z ^ a[a[a[G ^ z]]], j ^= a[a[j]]) : e = j = 1
//   }
//   var H = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
//       d = d.AES = p.extend({
//           lu7n: function() {
//               for (var a = this.K3x, c = a.words, d = a.sigBytes / 4, a = 4 * ((this.ZO9F = d + 6) + 1), e = this.blg2x = [], j = 0; j < a; j++)
//                   if (j < d) e[j] = c[j];
//                   else {
//                       var k = e[j - 1];
//                       j % d ? 6 < d && 4 == j % d && (k = l[k >>> 24] << 24 | l[k >>> 16 & 255] << 16 | l[k >>> 8 & 255] << 8 | l[k & 255]) : (k = k << 8 | k >>> 24, k = l[k >>> 24] << 24 | l[k >>> 16 & 255] << 16 | l[k >>> 8 & 255] << 8 | l[k & 255], k ^= H[j / d | 0] << 24);
//                       e[j] = e[j - d] ^ k
//                   } c = this.bld2x = [];
//               for (d = 0; d < a; d++) j = a - d, k = d % 4 ? e[j] : e[j - 4], c[d] = 4 > d || 4 >= j ? k : b[l[k >>> 24]] ^ x[l[k >>> 16 & 255]] ^ q[l[k >>> 8 & 255]] ^ n[l[k & 255]]
//           },
//           encryptBlock: function(a, b) {
//               this.BV2x(a, b, this.blg2x, t, r, w, v, l)
//           },
//           decryptBlock: function(a, c) {
//               var d = a[c + 1];
//               a[c + 1] = a[c + 3];
//               a[c + 3] = d;
//               this.BV2x(a, c, this.bld2x, b, x, q, n, s);
//               d = a[c + 1];
//               a[c + 1] = a[c + 3];
//               a[c + 3] = d
//           },
//           BV2x: function(a, b, c, d, e, j, l, f) {
//               for (var m = this.ZO9F, g = a[b] ^ c[0], h = a[b + 1] ^ c[1], k = a[b + 2] ^ c[2], n = a[b + 3] ^ c[3], p = 4, r = 1; r < m; r++) var q = d[g >>> 24] ^ e[h >>> 16 & 255] ^ j[k >>> 8 & 255] ^ l[n & 255] ^ c[p++],
//                   s = d[h >>> 24] ^ e[k >>> 16 & 255] ^ j[n >>> 8 & 255] ^ l[g & 255] ^ c[p++],
//                   t = d[k >>> 24] ^ e[n >>> 16 & 255] ^ j[g >>> 8 & 255] ^ l[h & 255] ^ c[p++],
//                   n = d[n >>> 24] ^ e[g >>> 16 & 255] ^ j[h >>> 8 & 255] ^ l[k & 255] ^ c[p++],
//                   g = q,
//                   h = s,
//                   k = t;
//               q = (f[g >>> 24] << 24 | f[h >>> 16 & 255] << 16 | f[k >>> 8 & 255] << 8 | f[n & 255]) ^ c[p++];
//               s = (f[h >>> 24] << 24 | f[k >>> 16 & 255] << 16 | f[n >>> 8 & 255] << 8 | f[g & 255]) ^ c[p++];
//               t = (f[k >>> 24] << 24 | f[n >>> 16 & 255] << 16 | f[g >>> 8 & 255] << 8 | f[h & 255]) ^ c[p++];
//               n = (f[n >>> 24] << 24 | f[g >>> 16 & 255] << 16 | f[h >>> 8 & 255] << 8 | f[k & 255]) ^ c[p++];
//               a[b] = q;
//               a[b + 1] = s;
//               a[b + 2] = t;
//               a[b + 3] = n
//           },
//           keySize: 8
//       });
//   u.AES = p.lO8G(d)
// })();

function a(a) {
  var d, e, b = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 
      c = "";
  for (d = 0; a > d; d += 1) e = Math.random() * b.length, e = Math.floor(e), c += b.charAt(e);
  return c
}

function b(a, b) {
  var c = CryptoJS.enc.Utf8.parse(b),
      d = CryptoJS.enc.Utf8.parse("0102030405060708"),
      e = CryptoJS.enc.Utf8.parse(a),
      f = CryptoJS.AES.encrypt(e, c, {
          iv: d,
          mode: CryptoJS.mode.CBC
      });
  return f.toString()
}

function c(a, b, c) {
  var d, e;
  return setMaxDigits(131), d = new RSAKeyPair(b, "", c), e = encryptedString(d, a)
}

function d(d, e, f, g) {
  var h = {},
      i = a(16);
  return h.encText = b(d, g), h.encText = b(h.encText, i), h.encSecKey = c(i, e, f), h
}

module.exports = {
  d
};

