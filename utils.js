// 判断对象类型
let HH3x = function(i3x, u3x) {
  try {
      u3x = u3x.toLowerCase();
      if (i3x === null) return u3x == "null";
      if (i3x === undefined) return u3x == "undefined";
      return Object.prototype.toString.call(i3x).toLowerCase() == "[object " + u3x + "]"
  } catch (e) {
      return false
  }
};

// 判断是否为string类型
let fP6J = function(i3x) {
  return HH3x(i3x, "string")
};

// 判断是否为函数类型
let gO6I = function(i3x) {
  return HH3x(i3x, "function")
};

// 类似于map函数，遍历第一个数组调用第二个参数对应的遍历函数，第三个参数如果传入了就是作用域this对象
let be3x = function(j3x, cF4J, O3x) {
  if (!j3x || !j3x.length || !gO6I(cF4J)) {
    return;
  }
  if (!!j3x.forEach) {
      j3x.forEach(cF4J, O3x);
      return;
  }
  for (var i = 0, l = j3x.length; i < l; i++) cF4J.call(O3x, j3x[i], i, j3x);
  return;
};

// 按第二个参数把字符串分割，然后decode uri把参数值返回到map中
let TS7L = function(io7h, TW7P) {
  var iH7A = {};
  be3x((io7h || "").split(TW7P), function(X3x) {
      var bfj1x = X3x.split("=");
      if (!bfj1x || !bfj1x.length) return;
      var K3x = bfj1x.shift();
      if (!K3x) return;
      iH7A[decodeURIComponent(K3x)] = decodeURIComponent(bfj1x.join("="))
  });
  return iH7A
};

// 把参数按照&分割返回到map中
let gZ6T = function(bw3x) {
  return TS7L(bw3x, "&")
};

// 第一个参数是参数值map，第二个参数是连接符，第三个参数是是否uri encode
let vU0x = function(gC6w, TW7P, Lj4n) {
  if (!gC6w) return "";
  var bv3x = [];
  for (var x in gC6w) {
      bv3x.push(encodeURIComponent(x) + "=" + (!!Lj4n ? encodeURIComponent(gC6w[x]) : gC6w[x]))
  }
  return bv3x.join(TW7P || ",")
};

// 使用uri encode把参数值map用&串起来
let cz4D = function(gC6w) {
  return vU0x(gC6w, "&", true)
};

module.exports = {
  be3x,
  gZ6T,
  cz4D,
  fP6J
};

// let testData = ['hello', 'world'];
// be3x(testData, (item) => {
//   console.log(`item is ${item}`);
// });

// let testString = 'hello hell';
// let testFunction = () => {
//   console.log('hello test function');
// };

// let testStringResult = fP6J(testString);
// let testFunctionResult = gO6I(testFunction);

// console.log(`test string result ${testStringResult} test function result ${testFunctionResult}`);