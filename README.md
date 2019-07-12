# music163-downloader
music 163 downloader（网易云音乐下载工具）

## 使用说明
```
npm install
node index.js
```

## 初衷
网易云音乐MAC版很多歌曲不允许下载，2块钱一首，感觉很坑爹，于是决定写一个下载工具

## 记录

### MAC版分析
-   都是http请求，使用wireshark抓包
-   免费的是明文，收费的也是明文，这就很坑爹了
-   问题点和思路发散
    -   mac版搜索音乐的POST请求加密了，cookie也有一个字段不清楚
    -   退出登陆，匿名访问，看是否流程有影响
    -   网易云网站是https访问
    -   分析网易云音乐web版本源代码
    -   PC版本使用fidder和反编译分析
-   最终考虑到MAC版的客户端语言不熟悉，决定从web版开始下手

#### 抓包记录
-   免费音乐
    -   ip 14.215.167.73
    -   抓包地址，url是明文：
        -   http://m7.music.126.net/20190708181041/3572401bfb7ceb4bd433105a923703b3/ymusic/bfc2/ab6f/ae0c/12896e0902e1a2321865b3e343ebfcbb.mp3
-   收费音乐
    -   ip 183.61.138.62 183.60.139.248
    -   抓包地址，虽然是收费的但也是明文：
        -   http://m7c.music.126.net/20190708181954/346122ee6396b57916a907670a9719e3/ymusic/23a8/b791/6861/5efa1f2f89b935e375b4df3d323cfe2e.mp3
        -   http://m8c.music.126.net/20190708182318/f660bcd87add1588e0bb6866455c1598/ymusic/f370/248b/7eb6/2465d8966bb5aed27ca25813add52b49.mp3

### web版分析
-   web版本，s是搜索名，type 1是指单曲
    -   https://music.163.com/#/search/m/?s=name&type=1
-   搜索接口
    -   https://music.163.com/weapi/cloudsearch/get/web?csrf_token=
    -   带了两个参数params和encSecKey，还有特殊cookie，经检验cookie没影响，传了两个参数即可
    -   返回的音乐id就是歌曲id
-   音乐界面接口
    -   https://music.163.com/#/song?id=422427073
-   url获取接口
    -   https://music.163.com/weapi/song/enhance/player/url/v1?csrf_token=
    -   一样带了两个参数params和encSecKey
-   通过查看网页源代码（而不是框架源代码）发现加密的处理方式在如下文件里面：
    -   https://s3.music.126.net/web/s/core_b0b05f4d0914b2e3f2a7e21bc0696a22.js?b0b05f4d0914b2e3f2a7e21bc0696a22
-   如下网站可以让uglify的网站变得可以阅读
    -   https://beautifier.io/
-   代码分析，使用CryptoJS库，还有一些自定义的接口
    ```
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
    window.asrsea = d
    ```
-   使用nodejs作为一个破解服务器的好处是可以与前端兼容代码
-   现在的问题是`window.asrsea`这个方法是如何被使用的
-   定义了cloudsearch方法
    ```
    "search-list": {
      url: "/api/cloudsearch/get/web",
      type: "post",
    }
    ```
-   v3x.bk3x接口应该就是网络请求接口
-   歌曲url获取api
    ```
    var DEFAULT_LEVEL = "standard";
    var DEFAULT_ENCODETYPE = "aac";
    
    b3x.bLn8f = function() {
      this.zW1x();
      v3x.bk3x("/api/song/enhance/player/url/v1", {
          type: "json",
          query: {
              ids: JSON.stringify([this.cu4y.id]),
              level: DEFAULT_LEVEL,
              encodeType: DEFAULT_ENCODETYPE
          },
          onload: this.bMl8d.f3x(this),
          onerror: this.bMl8d.f3x(this)
      })
    };
    ```
-   关键在于如下这个接口，处理网络请求的接口
    -   `轻音乐`单曲搜索，抓包分析每一次接口参数都不一样，是因为csrf变了，还是每次加密的随机数变了呢？
    -   e3x是api参数，e3x.query被转换为i3x，i3x再通过加密
    -   加密词典有点奇怪，是用emoji来加密
    ```
    v3x.bk3x = function(Y3x, e3x) {
        var i3x = {},
            e3x = NEJ.X({}, e3x),
            mo8g = Y3x.indexOf("?");
        if (window.GEnc && /(^|\.com)\/api/.test(Y3x) && !(e3x.headers && e3x.headers[er5w.zG1x] == er5w.JJ4N) && !e3x.noEnc) {
            if (mo8g != -1) {
                i3x = k3x.gZ6T(Y3x.substring(mo8g + 1));
                Y3x = Y3x.substring(0, mo8g)
            }
            if (e3x.query) {
                i3x = NEJ.X(i3x, k3x.fP6J(e3x.query) ? k3x.gZ6T(e3x.query) : e3x.query)
            }
            if (e3x.data) {
                i3x = NEJ.X(i3x, k3x.fP6J(e3x.data) ? k3x.gZ6T(e3x.data) : e3x.data)
            }
            i3x["csrf_token"] = v3x.gN6H("__csrf");
            Y3x = Y3x.replace("api", "weapi");
            e3x.method = "post";
            delete e3x.query;
            var bYc1x = window.asrsea(JSON.stringify(i3x), bkY2x(["流泪", "强"]), bkY2x(VM8E.md), bkY2x(["爱心", "女孩", "惊恐", "大笑"]));
            e3x.data = k3x.cz4D({
                params: bYc1x.encText,
                encSecKey: bYc1x.encSecKey
            })
        }
        cHx9o(Y3x, e3x)
    };
    ```
-   还用到了NEJ网易前端开发框架
-   这个文件好像是页面中播放相关具体操作的接口
    -   https://s3.music.126.net/web/s/pt_frame_index_7b81c9f2be0f02b8c34b54eb2d2e3315.js?7b81c9f2be0f02b8c34b54eb2d2e3315
-   获取csrf方法，通过如下方法从cookie中获取对应的csrf
    ```
    j = NEJ.P("nej.j")
    
    j.gN6H = function() {
        var dd4h = new Date,
            crO6I = +dd4h,
            brZ4d = 864e5;
        var crY6S = function(X3x) {
            var tk0x = document.cookie,
                uO0x = "\\b" + X3x + "=",
                beL1x = tk0x.search(uO0x);
            if (beL1x < 0) return "";
            beL1x += uO0x.length - 2;
            var yo1x = tk0x.indexOf(";", beL1x);
            if (yo1x < 0) yo1x = tk0x.length;
            return tk0x.substring(beL1x, yo1x) || ""
        };
        return function(X3x, i3x) {
            if (i3x === undefined) return crY6S(X3x);
            if (u.fP6J(i3x)) {
                if (!!i3x) {
                    document.cookie = X3x + "=" + i3x + ";";
                    return i3x
                }
                i3x = {
                    expires: -100
                }
            }
            i3x = i3x || o;
            var tk0x = X3x + "=" + (i3x.value || "") + ";";
            delete i3x.value;
            if (i3x.expires !== undefined) {
                dd4h.setTime(crO6I + i3x.expires * brZ4d);
                i3x.expires = dd4h.toGMTString()
            }
            tk0x += u.vU0x(i3x, ";");
            document.cookie = tk0x
        }
    }()
    ```
-   web版匿名登录其实是没有csrf cookie的
-   所以现在关键是`NEJ.X` `k3x.fP6J` `k3x.gZ6T` `bkY2x` `k3x.cz4D`这几个方法
    -   `k3x.fP6J`
    ```
    // Object对象
    bb3x = NEJ.O,
    
    // 判断对象类型
    var HH3x = function(i3x, u3x) {
        try {
            u3x = u3x.toLowerCase();
            if (i3x === null) return u3x == "null";
            if (i3x === undefined) return u3x == "undefined";
            return bb3x.toString.call(i3x).toLowerCase() == "[object " + u3x + "]"
        } catch (e) {
            return !1
        }
    };
    
    // 判断是否为string类型
    k3x.fP6J = function(i3x) {
        return HH3x(i3x, "string")
    };
    ```
    -   `k3x.gZ6T`
    ```
    k3x = c3x("nej.u");
    
    // 判断是否为函数类型
    k3x.gO6I = function(i3x) {
        return HH3x(i3x, "function")
    };
    
    // 类似于map函数，遍历第一个数组调用第二个参数对应的遍历函数，第三个参数如果传入了就是作用域this对象
    k3x.be3x = function(j3x, cF4J, O3x) {
        if (!j3x || !j3x.length || !k3x.gO6I(cF4J)) return this;
        if (!!j3x.forEach) {
            j3x.forEach(cF4J, O3x);
            return this
        }
        for (var i = 0, l = j3x.length; i < l; i++) cF4J.call(O3x, j3x[i], i, j3x);
        return this
    };
    
    // 按第二个参数把字符串分割，然后decode uri把参数值返回到map中
    k3x.TS7L = function(io7h, TW7P) {
        var iH7A = {};
        k3x.be3x((io7h || "").split(TW7P), function(X3x) {
            var bfj1x = X3x.split("=");
            if (!bfj1x || !bfj1x.length) return;
            var K3x = bfj1x.shift();
            if (!K3x) return;
            iH7A[decodeURIComponent(K3x)] = decodeURIComponent(bfj1x.join("="))
        });
        return iH7A
    };
    
    // 把参数按照&分割返回到map中
    k3x.gZ6T = function(bw3x) {
        return k3x.TS7L(bw3x, "&")
    };
    ```
    -   `bkY2x`
    ```
    // 把emoji id对应的值连起来，返回字符串
    var bkY2x = function(cHA9r) {
        var m3x = [];
        k3x.be3x(cHA9r, function(cHy9p) {
            m3x.push(VM8E.emj[cHy9p])
        });
        return m3x.join("")
    };
    ```
    -   `k3x.cz4D`
    ```
    // 第一个参数是参数值map，第二个参数是连接符，第三个参数是是否uri encode
    k3x.vU0x = function(gC6w, TW7P, Lj4n) {
        if (!gC6w) return "";
        var bv3x = [];
        for (var x in gC6w) {
            bv3x.push(encodeURIComponent(x) + "=" + (!!Lj4n ? encodeURIComponent(gC6w[x]) : gC6w[x]))
        }
        return bv3x.join(TW7P || ",")
    };
    
    // 使用uri encode把参数值map用&串起来
    k3x.cz4D = function(gC6w) {
        return k3x.vU0x(gC6w, "&", !0)
    };
    ```
-   由于csrf根本没有，而且`window.asrsea`调用的`a`函数生成的随机数变了，所以每次都不一样
-   至此，整个请求流程就全部清晰了，接下来实现代码

### 测试
-   解出来的结果
    ```
    params=VyN%2B65g72wmEOFcEoPqqPw06KOmB4nPVk3ee3%2FortybLXaOvZUSkGNBq%2FoBEkz8DVDp%2BdXNqgEkiVKAX8cMjqpRwbHk67Jch3rE1cYPHF4FvbeiPgQE2zDTZ49oAUWaXS0kEnNh5hb%2BVOGVhFi4ugw%3D%3D
    &
    encSecKey=c81108cdabaaade65bb41d5f5e49aa8e1e2aad15fbfdfe717565ccf610291ec233103d0836dc5351b57a7c5f870604e0206c79fe3a645952682bd529880e21ab0a8b3d890620bb938fde409c0c570ada33f562a84c268f788f97bc6581c62a338c092b1a88aac926d5c07fbb45d293f82f0695acb9b6090095b1ccc0cb1d5de0
    ```
-   对比结果
    ```
    params=nsaEo8tzDyZ3T%2FjJXdK325YfyH7bjqpq%2BDfkAjgb3y5taMK%2F%2FARu%2FpVECpjbwvGFEWfvq0Jn%2FYUWerDjGk1q9xybmHj8sflN5NCIe6k1KuVavb1E8fat0BzVnDFbm2ywup%2BnDowNKGiMl%2B7Gafkcjw%3D%3D
    &
    encSecKey=c3052987324f0456c32614d1dd2c49784a4375a5501669eb282b555a37cd16ea78f61b60716af79652bd9292794f09e98590a2e94be827327c497b86b3928b9c8f6f60bc89b89ba029d6f037ef21a6ab0d9bbf540a158d8a0fd7f4657d67d5319d4299fce4b7b6bceb877ab96d06c929e473dcca74b522fa6ff9fe13967edccd
    ```
-   请求时还是会报错，经检查是从vscode的终端复制粘贴时有了换行，导致参数没填对，填正确的内容就就得到了如下结果
-   结果如下，其中url就是下载地址
    ```
    node index.js 
    params=HF3uMkpNqWeKx%2B4JX7X0YjKo3e1wHHe0%2BYMyWEIhCE%2BCp5Ul89phTECVHejrdU3j3AKAGBKiTAmIwA4YKGoeLQPlHkfwIGQoWveJcFfMSAX1y6fuRJFSwSmrDcpHs%2Bf46I2VR%2Fx4zBAWVqFq0BaxUQ%3D%3D&encSecKey=394a146ba14a6b2e6bfae9eee776d175cc9ed15bff2c3741ce6cee4b4a4d0695df06180e64d16f26be3f4e1f1ec628fcdedaae25710c9a5e8ebbaeb568674aea3a4fc4164b26f9848aa431ac0da192c7bf11ba7272ab8ede231dccb781bb63a769152f4ee70e1ca6d9f6ada23710630d0174b177c20d42bfbf6297d62ba90614
    {"data":[{"id":586299,"url":"http://m801.music.126.net/20190712135848/0af583785ee6aedaeaa5434cd894ae7a/jdyyaac/045f/0109/045e/359d39a57d6c6dab1f3b340d32dd0ab8.m4a","br":96000,"size":3482393,"md5":"359d39a57d6c6dab1f3b340d32dd0ab8","code":200,"expi":1200,"type":"m4a","gain":0.0,"fee":0,"uf":null,"payed":0,"flag":0,"canExtend":false,"freeTrialInfo":null,"level":"standard","encodeType":"aac"}],"code":200}
    ```