var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// node_modules/mustache/mustache.js
var require_mustache = __commonJS({
  "node_modules/mustache/mustache.js"(exports, module) {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = global || self, global.Mustache = factory());
    })(exports, (function() {
      "use strict";
      var objectToString = Object.prototype.toString;
      var isArray = Array.isArray || /* @__PURE__ */ __name(function isArrayPolyfill(object) {
        return objectToString.call(object) === "[object Array]";
      }, "isArrayPolyfill");
      function isFunction(object) {
        return typeof object === "function";
      }
      __name(isFunction, "isFunction");
      function typeStr(obj) {
        return isArray(obj) ? "array" : typeof obj;
      }
      __name(typeStr, "typeStr");
      function escapeRegExp(string) {
        return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
      }
      __name(escapeRegExp, "escapeRegExp");
      function hasProperty(obj, propName) {
        return obj != null && typeof obj === "object" && propName in obj;
      }
      __name(hasProperty, "hasProperty");
      function primitiveHasOwnProperty(primitive, propName) {
        return primitive != null && typeof primitive !== "object" && primitive.hasOwnProperty && primitive.hasOwnProperty(propName);
      }
      __name(primitiveHasOwnProperty, "primitiveHasOwnProperty");
      var regExpTest = RegExp.prototype.test;
      function testRegExp(re, string) {
        return regExpTest.call(re, string);
      }
      __name(testRegExp, "testRegExp");
      var nonSpaceRe = /\S/;
      function isWhitespace(string) {
        return !testRegExp(nonSpaceRe, string);
      }
      __name(isWhitespace, "isWhitespace");
      var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#x2F;",
        "`": "&#x60;",
        "=": "&#x3D;"
      };
      function escapeHtml(string) {
        return String(string).replace(/[&<>"'`=\/]/g, /* @__PURE__ */ __name(function fromEntityMap(s) {
          return entityMap[s];
        }, "fromEntityMap"));
      }
      __name(escapeHtml, "escapeHtml");
      var whiteRe = /\s*/;
      var spaceRe = /\s+/;
      var equalsRe = /\s*=/;
      var curlyRe = /\s*\}/;
      var tagRe = /#|\^|\/|>|\{|&|=|!/;
      function parseTemplate(template, tags) {
        if (!template)
          return [];
        var lineHasNonSpace = false;
        var sections = [];
        var tokens = [];
        var spaces = [];
        var hasTag = false;
        var nonSpace = false;
        var indentation = "";
        var tagIndex = 0;
        function stripSpace() {
          if (hasTag && !nonSpace) {
            while (spaces.length)
              delete tokens[spaces.pop()];
          } else {
            spaces = [];
          }
          hasTag = false;
          nonSpace = false;
        }
        __name(stripSpace, "stripSpace");
        var openingTagRe, closingTagRe, closingCurlyRe;
        function compileTags(tagsToCompile) {
          if (typeof tagsToCompile === "string")
            tagsToCompile = tagsToCompile.split(spaceRe, 2);
          if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
            throw new Error("Invalid tags: " + tagsToCompile);
          openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + "\\s*");
          closingTagRe = new RegExp("\\s*" + escapeRegExp(tagsToCompile[1]));
          closingCurlyRe = new RegExp("\\s*" + escapeRegExp("}" + tagsToCompile[1]));
        }
        __name(compileTags, "compileTags");
        compileTags(tags || mustache.tags);
        var scanner = new Scanner(template);
        var start, type, value, chr, token, openSection;
        while (!scanner.eos()) {
          start = scanner.pos;
          value = scanner.scanUntil(openingTagRe);
          if (value) {
            for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
              chr = value.charAt(i);
              if (isWhitespace(chr)) {
                spaces.push(tokens.length);
                indentation += chr;
              } else {
                nonSpace = true;
                lineHasNonSpace = true;
                indentation += " ";
              }
              tokens.push(["text", chr, start, start + 1]);
              start += 1;
              if (chr === "\n") {
                stripSpace();
                indentation = "";
                tagIndex = 0;
                lineHasNonSpace = false;
              }
            }
          }
          if (!scanner.scan(openingTagRe))
            break;
          hasTag = true;
          type = scanner.scan(tagRe) || "name";
          scanner.scan(whiteRe);
          if (type === "=") {
            value = scanner.scanUntil(equalsRe);
            scanner.scan(equalsRe);
            scanner.scanUntil(closingTagRe);
          } else if (type === "{") {
            value = scanner.scanUntil(closingCurlyRe);
            scanner.scan(curlyRe);
            scanner.scanUntil(closingTagRe);
            type = "&";
          } else {
            value = scanner.scanUntil(closingTagRe);
          }
          if (!scanner.scan(closingTagRe))
            throw new Error("Unclosed tag at " + scanner.pos);
          if (type == ">") {
            token = [type, value, start, scanner.pos, indentation, tagIndex, lineHasNonSpace];
          } else {
            token = [type, value, start, scanner.pos];
          }
          tagIndex++;
          tokens.push(token);
          if (type === "#" || type === "^") {
            sections.push(token);
          } else if (type === "/") {
            openSection = sections.pop();
            if (!openSection)
              throw new Error('Unopened section "' + value + '" at ' + start);
            if (openSection[1] !== value)
              throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
          } else if (type === "name" || type === "{" || type === "&") {
            nonSpace = true;
          } else if (type === "=") {
            compileTags(value);
          }
        }
        stripSpace();
        openSection = sections.pop();
        if (openSection)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
        return nestTokens(squashTokens(tokens));
      }
      __name(parseTemplate, "parseTemplate");
      function squashTokens(tokens) {
        var squashedTokens = [];
        var token, lastToken;
        for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
          token = tokens[i];
          if (token) {
            if (token[0] === "text" && lastToken && lastToken[0] === "text") {
              lastToken[1] += token[1];
              lastToken[3] = token[3];
            } else {
              squashedTokens.push(token);
              lastToken = token;
            }
          }
        }
        return squashedTokens;
      }
      __name(squashTokens, "squashTokens");
      function nestTokens(tokens) {
        var nestedTokens = [];
        var collector = nestedTokens;
        var sections = [];
        var token, section;
        for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
          token = tokens[i];
          switch (token[0]) {
            case "#":
            case "^":
              collector.push(token);
              sections.push(token);
              collector = token[4] = [];
              break;
            case "/":
              section = sections.pop();
              section[5] = token[2];
              collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
              break;
            default:
              collector.push(token);
          }
        }
        return nestedTokens;
      }
      __name(nestTokens, "nestTokens");
      function Scanner(string) {
        this.string = string;
        this.tail = string;
        this.pos = 0;
      }
      __name(Scanner, "Scanner");
      Scanner.prototype.eos = /* @__PURE__ */ __name(function eos() {
        return this.tail === "";
      }, "eos");
      Scanner.prototype.scan = /* @__PURE__ */ __name(function scan(re) {
        var match = this.tail.match(re);
        if (!match || match.index !== 0)
          return "";
        var string = match[0];
        this.tail = this.tail.substring(string.length);
        this.pos += string.length;
        return string;
      }, "scan");
      Scanner.prototype.scanUntil = /* @__PURE__ */ __name(function scanUntil(re) {
        var index = this.tail.search(re), match;
        switch (index) {
          case -1:
            match = this.tail;
            this.tail = "";
            break;
          case 0:
            match = "";
            break;
          default:
            match = this.tail.substring(0, index);
            this.tail = this.tail.substring(index);
        }
        this.pos += match.length;
        return match;
      }, "scanUntil");
      function Context(view, parentContext) {
        this.view = view;
        this.cache = { ".": this.view };
        this.parent = parentContext;
      }
      __name(Context, "Context");
      Context.prototype.push = /* @__PURE__ */ __name(function push(view) {
        return new Context(view, this);
      }, "push");
      Context.prototype.lookup = /* @__PURE__ */ __name(function lookup(name) {
        var cache = this.cache;
        var value;
        if (cache.hasOwnProperty(name)) {
          value = cache[name];
        } else {
          var context = this, intermediateValue, names, index, lookupHit = false;
          while (context) {
            if (name.indexOf(".") > 0) {
              intermediateValue = context.view;
              names = name.split(".");
              index = 0;
              while (intermediateValue != null && index < names.length) {
                if (index === names.length - 1)
                  lookupHit = hasProperty(intermediateValue, names[index]) || primitiveHasOwnProperty(intermediateValue, names[index]);
                intermediateValue = intermediateValue[names[index++]];
              }
            } else {
              intermediateValue = context.view[name];
              lookupHit = hasProperty(context.view, name);
            }
            if (lookupHit) {
              value = intermediateValue;
              break;
            }
            context = context.parent;
          }
          cache[name] = value;
        }
        if (isFunction(value))
          value = value.call(this.view);
        return value;
      }, "lookup");
      function Writer() {
        this.templateCache = {
          _cache: {},
          set: /* @__PURE__ */ __name(function set(key, value) {
            this._cache[key] = value;
          }, "set"),
          get: /* @__PURE__ */ __name(function get(key) {
            return this._cache[key];
          }, "get"),
          clear: /* @__PURE__ */ __name(function clear() {
            this._cache = {};
          }, "clear")
        };
      }
      __name(Writer, "Writer");
      Writer.prototype.clearCache = /* @__PURE__ */ __name(function clearCache() {
        if (typeof this.templateCache !== "undefined") {
          this.templateCache.clear();
        }
      }, "clearCache");
      Writer.prototype.parse = /* @__PURE__ */ __name(function parse(template, tags) {
        var cache = this.templateCache;
        var cacheKey = template + ":" + (tags || mustache.tags).join(":");
        var isCacheEnabled = typeof cache !== "undefined";
        var tokens = isCacheEnabled ? cache.get(cacheKey) : void 0;
        if (tokens == void 0) {
          tokens = parseTemplate(template, tags);
          isCacheEnabled && cache.set(cacheKey, tokens);
        }
        return tokens;
      }, "parse");
      Writer.prototype.render = /* @__PURE__ */ __name(function render(template, view, partials, config) {
        var tags = this.getConfigTags(config);
        var tokens = this.parse(template, tags);
        var context = view instanceof Context ? view : new Context(view, void 0);
        return this.renderTokens(tokens, context, partials, template, config);
      }, "render");
      Writer.prototype.renderTokens = /* @__PURE__ */ __name(function renderTokens(tokens, context, partials, originalTemplate, config) {
        var buffer = "";
        var token, symbol, value;
        for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
          value = void 0;
          token = tokens[i];
          symbol = token[0];
          if (symbol === "#") value = this.renderSection(token, context, partials, originalTemplate, config);
          else if (symbol === "^") value = this.renderInverted(token, context, partials, originalTemplate, config);
          else if (symbol === ">") value = this.renderPartial(token, context, partials, config);
          else if (symbol === "&") value = this.unescapedValue(token, context);
          else if (symbol === "name") value = this.escapedValue(token, context, config);
          else if (symbol === "text") value = this.rawValue(token);
          if (value !== void 0)
            buffer += value;
        }
        return buffer;
      }, "renderTokens");
      Writer.prototype.renderSection = /* @__PURE__ */ __name(function renderSection(token, context, partials, originalTemplate, config) {
        var self2 = this;
        var buffer = "";
        var value = context.lookup(token[1]);
        function subRender(template) {
          return self2.render(template, context, partials, config);
        }
        __name(subRender, "subRender");
        if (!value) return;
        if (isArray(value)) {
          for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
            buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate, config);
          }
        } else if (typeof value === "object" || typeof value === "string" || typeof value === "number") {
          buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate, config);
        } else if (isFunction(value)) {
          if (typeof originalTemplate !== "string")
            throw new Error("Cannot use higher-order sections without the original template");
          value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);
          if (value != null)
            buffer += value;
        } else {
          buffer += this.renderTokens(token[4], context, partials, originalTemplate, config);
        }
        return buffer;
      }, "renderSection");
      Writer.prototype.renderInverted = /* @__PURE__ */ __name(function renderInverted(token, context, partials, originalTemplate, config) {
        var value = context.lookup(token[1]);
        if (!value || isArray(value) && value.length === 0)
          return this.renderTokens(token[4], context, partials, originalTemplate, config);
      }, "renderInverted");
      Writer.prototype.indentPartial = /* @__PURE__ */ __name(function indentPartial(partial, indentation, lineHasNonSpace) {
        var filteredIndentation = indentation.replace(/[^ \t]/g, "");
        var partialByNl = partial.split("\n");
        for (var i = 0; i < partialByNl.length; i++) {
          if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) {
            partialByNl[i] = filteredIndentation + partialByNl[i];
          }
        }
        return partialByNl.join("\n");
      }, "indentPartial");
      Writer.prototype.renderPartial = /* @__PURE__ */ __name(function renderPartial(token, context, partials, config) {
        if (!partials) return;
        var tags = this.getConfigTags(config);
        var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
        if (value != null) {
          var lineHasNonSpace = token[6];
          var tagIndex = token[5];
          var indentation = token[4];
          var indentedValue = value;
          if (tagIndex == 0 && indentation) {
            indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
          }
          var tokens = this.parse(indentedValue, tags);
          return this.renderTokens(tokens, context, partials, indentedValue, config);
        }
      }, "renderPartial");
      Writer.prototype.unescapedValue = /* @__PURE__ */ __name(function unescapedValue(token, context) {
        var value = context.lookup(token[1]);
        if (value != null)
          return value;
      }, "unescapedValue");
      Writer.prototype.escapedValue = /* @__PURE__ */ __name(function escapedValue(token, context, config) {
        var escape = this.getConfigEscape(config) || mustache.escape;
        var value = context.lookup(token[1]);
        if (value != null)
          return typeof value === "number" && escape === mustache.escape ? String(value) : escape(value);
      }, "escapedValue");
      Writer.prototype.rawValue = /* @__PURE__ */ __name(function rawValue(token) {
        return token[1];
      }, "rawValue");
      Writer.prototype.getConfigTags = /* @__PURE__ */ __name(function getConfigTags(config) {
        if (isArray(config)) {
          return config;
        } else if (config && typeof config === "object") {
          return config.tags;
        } else {
          return void 0;
        }
      }, "getConfigTags");
      Writer.prototype.getConfigEscape = /* @__PURE__ */ __name(function getConfigEscape(config) {
        if (config && typeof config === "object" && !isArray(config)) {
          return config.escape;
        } else {
          return void 0;
        }
      }, "getConfigEscape");
      var mustache = {
        name: "mustache.js",
        version: "4.1.0",
        tags: ["{{", "}}"],
        clearCache: void 0,
        escape: void 0,
        parse: void 0,
        render: void 0,
        Scanner: void 0,
        Context: void 0,
        Writer: void 0,
        /**
         * Allows a user to override the default caching strategy, by providing an
         * object with set, get and clear methods. This can also be used to disable
         * the cache by setting it to the literal `undefined`.
         */
        set templateCache(cache) {
          defaultWriter.templateCache = cache;
        },
        /**
         * Gets the default or overridden caching object from the default writer.
         */
        get templateCache() {
          return defaultWriter.templateCache;
        }
      };
      var defaultWriter = new Writer();
      mustache.clearCache = /* @__PURE__ */ __name(function clearCache() {
        return defaultWriter.clearCache();
      }, "clearCache");
      mustache.parse = /* @__PURE__ */ __name(function parse(template, tags) {
        return defaultWriter.parse(template, tags);
      }, "parse");
      mustache.render = /* @__PURE__ */ __name(function render(template, view, partials, config) {
        if (typeof template !== "string") {
          throw new TypeError('Invalid template! Template should be a "string" but "' + typeStr(template) + '" was given as the first argument for mustache#render(template, view, partials)');
        }
        return defaultWriter.render(template, view, partials, config);
      }, "render");
      mustache.escape = escapeHtml;
      mustache.Scanner = Scanner;
      mustache.Context = Context;
      mustache.Writer = Writer;
      return mustache;
    }));
  }
});

// index.js
var OPT = {
  // ----- 以下由 env vars / secrets 注入，此处仅作默认值 -----
  "user": "",
  "password": "",
  "siteDomain": "localhost",
  "privateBlog": false,
  "siteName": "CF Blog",
  "siteDescription": "",
  "keyWords": "",
  "pageSize": 5,
  "recentlySize": 3,
  "readMoreLength": 150,
  "cacheZoneId": "",
  "cacheToken": "",
  "cacheTime": 60,
  // ----- 以下为内容/模板配置，保留在代码中 -----
  "widgetOther": ``,
  "themeURL": "https://raw.githubusercontent.com/gdtool/cloudflare-workers-blog/master/themes/JustNews/",
  // 模板地址,以 "/"" 结尾default2.0
  "html404": `<h1>404</h1>`,
  //404页面返回
  "codeBeforHead": `
    <link rel="icon" type="image/x-icon" href="https://cdn.jsdelivr.net/gh/gdtool/zhaopp/cfblog/favicon.ico" />
<link rel="Shortcut Icon" href="https://cdn.jsdelivr.net/gh/gdtool/zhaopp/cfblog/favicon.ico">
    `,
  //其他代码,显示在</head>前
  "codeBeforBody": `
        <script>
            var _hmt = _hmt || [];
            (function() {
            var hm = document.createElement("script");
            hm.src = "https://hm.baidu.com/hm.js?3c82d815b755ee9b789cb004067c1fc7";
            var s = document.getElementsByTagName("script")[0]; 
            s.parentNode.insertBefore(hm, s);
            })();
        <\/script>
    `,
  //其他代码,显示在</body>前
  "commentCode": ``,
  //评论区代码
  "otherCodeA": "\u9605\u8BFB:",
  //默认模板,建议设置为 "阅读次数:"四个大字
  "otherCodeB": "",
  "otherCodeC": "",
  "otherCodeD": "",
  "otherCodeE": "",
  "copyRight": `Powered by <a href="https://www.cloudflare.com">Cloudflare</a> & <a href="https://blog.gezhong.vip">CF-Blog </a>`,
  //版权信息
  "robots": `User-agent: *
    Disallow: /admin`
  //robots.txt设置
};
var Mustache = require_mustache();
var index_default = {
  async fetch(request, env2, ctx) {
    return handleRequest(request, env2, ctx);
  }
};
function mergeEnvConfig(env2) {
  OPT.user = env2.USER || OPT.user;
  OPT.password = env2.PASSWORD || OPT.password;
  OPT.siteDomain = env2.SITE_DOMAIN || OPT.siteDomain;
  OPT.privateBlog = env2.PRIVATE_BLOG === "true";
  OPT.siteName = env2.SITE_NAME || OPT.siteName;
  OPT.siteDescription = env2.SITE_DESCRIPTION || OPT.siteDescription;
  OPT.keyWords = env2.KEY_WORDS || OPT.keyWords;
  OPT.pageSize = parseInt(env2.PAGE_SIZE) || OPT.pageSize;
  OPT.recentlySize = parseInt(env2.RECENTLY_SIZE) || OPT.recentlySize;
  OPT.readMoreLength = parseInt(env2.READ_MORE_LENGTH) || OPT.readMoreLength;
  OPT.cacheTime = parseInt(env2.CACHE_TIME) || OPT.cacheTime;
  OPT.themeURL = env2.THEME_URL || OPT.themeURL;
  OPT.cacheZoneId = env2.CACHE_ZONE_ID || OPT.cacheZoneId;
  OPT.cacheToken = env2.CACHE_TOKEN || OPT.cacheToken;
}
__name(mergeEnvConfig, "mergeEnvConfig");
async function handleRequest(request, env2, ctx) {
  mergeEnvConfig(env2);
  let url = new URL(request.url);
  let path = url.pathname.trim("/").split("/");
  if (path[0] === "admin" || OPT.privateBlog === true) {
    if (!doBasicAuth(request)) {
      return unauthorized();
    }
  }
  if (path[0] === "admin" && path[1] === "export") {
    let kvs = await getKVKeys(env2);
    return new Response(JSON.stringify(kvs), {
      headers: {
        "content-type": "application/octet-stream;charset=utf-8",
        "Content-Disposition": "attachment; filename=cfblog-" + getCurrentTime() + ".json"
      }
    });
  }
  console.log(url.pathname);
  let theme = url.searchParams.get("theme");
  let pageSize = url.searchParams.get("pageSize");
  if (theme) {
    OPT.themeURL = OPT.themeURL.replace(/themes\/[^/]+/, "themes/" + theme);
  }
  if (pageSize) {
    OPT.pageSize = parseInt(pageSize);
  }
  console.log("theme pageSize", OPT.pageSize, OPT.themeURL);
  if (url.pathname == "/robots.txt") {
    return new Response(OPT.robots + "\nSitemap: https://" + OPT.siteDomain + "/sitemap.xml", {
      headers: {
        "content-type": "text/plain;charset=UTF-8"
      },
      status: 200
    });
  }
  if (url.pathname == "/favicon.ico") {
    return new Response("404", {
      headers: {
        "content-type": "text/plain;charset=UTF-8"
      },
      status: 404
    });
  }
  let pathA = "";
  let pathB = "";
  let pathC = "";
  if (path.length == 0 || path[0] == "") {
    pathA = "page";
    pathB = "1";
  } else {
    pathA = path[0];
    pathB = path[1] === void 0 ? 1 : path[1];
    pathC = path[2] === void 0 ? 1 : path[2];
  }
  const cache = caches.default;
  const cacheFullPath = "https://" + OPT.siteDomain + "/" + pathA + "/" + pathB + "/" + pathC;
  const cacheKey = new Request(cacheFullPath, request);
  console.log("cacheFullPath:", cacheFullPath);
  let response = await cache.match(cacheKey);
  if (!!response) {
    return response;
  }
  if (pathA == "sitemap.xml") {
    response = new Response(await getSiteMap(env2), {
      headers: {
        "content-type": "text/xml;charset=UTF-8"
      },
      status: 200
    });
  } else {
    let html = await getHtml(request, env2);
    response = new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8"
      },
      status: 200
    });
  }
  if (pathA == "admin")
    response.headers.set("Cache-Control", "no-store");
  else {
    response.headers.set("Cache-Control", "public, max-age=" + OPT.cacheTime);
    ctx.waitUntil(cache.put(cacheFullPath, response.clone()));
  }
  return response;
}
__name(handleRequest, "handleRequest");
async function getHtml(request, env2) {
  let url = new URL(request.url);
  let path = url.pathname.trim("/").split("/");
  let pathA = "";
  let pathB = "";
  let pathC = "";
  if (path.length == 0 || path[0] == "") {
    pathA = "page";
    pathB = "1";
  } else {
    pathA = path[0];
    pathB = path[1] === void 0 ? 1 : path[1];
    pathC = path[2] === void 0 ? 1 : path[2];
  }
  if (pathA == "page" && parseInt(pathB) > 0) {
    return await GetHtmlPageNew(pathA, parseInt(pathB), env2);
  } else if (pathA == "category" && pathB.length > 0) {
    return await GetHtmlTagsNew(pathA, pathB, parseInt(pathC), env2);
  } else if (pathA == "tags" && pathB.length > 0) {
    return await GetHtmlTagsNew(pathA, pathB, parseInt(pathC), env2);
  } else if (pathA == "article" && pathB.length > 0) {
    return await GetHtmlSingleNew(pathA, pathB, env2);
  } else if (pathA == "search") {
  } else if (pathA == "admin") {
    return await GetHtmlAdmin(request, path, env2);
  } else {
    return OPT.html404;
  }
  return OPT.html404;
}
__name(getHtml, "getHtml");
async function GetHtmlSingleNew(pathA, pathB, env2) {
  let themeIndex = await getTheme("article");
  let widgetMenuList = await getKVByKey("SYSTEM_VALUE_WidgetMenu", true, env2);
  let widgetCategoryList = await getKVByKey("SYSTEM_VALUE_WidgetCategory", true, env2);
  let widgetTagsList = await getKVByKey("SYSTEM_VALUE_WidgetTags", true, env2);
  let widgetLinkList = await getKVByKey("SYSTEM_VALUE_WidgetLink", true, env2);
  let articleListAll = await getKVByKey("SYSTEM_INDEX_LIST", true, env2);
  let widgetRecentlyList = articleListAll.slice(0, OPT.recentlySize);
  for (var i = 0; i < widgetRecentlyList.length; i++) {
    widgetRecentlyList[i].createDate10 = widgetRecentlyList[i].createDate.substr(0, 10);
    widgetRecentlyList[i].url = "/article/" + widgetRecentlyList[i].id + "/" + (widgetRecentlyList[i].link === void 0 ? "detail" : widgetRecentlyList[i].link) + ".html";
  }
  let jsonArticleSingleArray = await getKVArticleSingle(pathB, env2);
  for (var i = 0; i < jsonArticleSingleArray.length; i++) {
    if (!!jsonArticleSingleArray[i]) {
      jsonArticleSingleArray[i].createDate10 = jsonArticleSingleArray[i].createDate.substr(0, 10);
      jsonArticleSingleArray[i].contentLength = jsonArticleSingleArray[i].contentText.length;
      jsonArticleSingleArray[i].url = "/article/" + jsonArticleSingleArray[i].id + "/" + (jsonArticleSingleArray[i].link === void 0 ? "detail" : jsonArticleSingleArray[i].link) + ".html";
    }
  }
  let articleSingle = jsonArticleSingleArray[1];
  if (articleSingle) {
    articleSingle.createDate10 = articleSingle.createDate.substr(0, 10);
    articleSingle.createDateYear = articleSingle.createDate.substr(0, 4);
    articleSingle.createDateMonth = articleSingle.createDate.substr(5, 7);
    articleSingle.createDateDay = articleSingle.createDate.substr(8, 10);
    articleSingle.contentLength = articleSingle.contentText.length;
  }
  let articleNewer = [];
  let articleOlder = [];
  if (jsonArticleSingleArray[0])
    articleNewer.push(jsonArticleSingleArray[0]);
  if (jsonArticleSingleArray[2])
    articleOlder.push(jsonArticleSingleArray[2]);
  let title = articleSingle.title + " - " + OPT.siteName;
  let keyWords = articleSingle.tags.concat(articleSingle.category).join(",");
  let viewObject = {};
  viewObject.widgetMenuList = widgetMenuList;
  viewObject.widgetCategoryList = widgetCategoryList;
  viewObject.widgetTagsList = widgetTagsList;
  viewObject.widgetLinkList = widgetLinkList;
  viewObject.widgetRecentlyList = widgetRecentlyList;
  viewObject.articleSingle = articleSingle;
  viewObject.articleNewer = articleNewer;
  viewObject.articleOlder = articleOlder;
  viewObject.title = title;
  viewObject.keyWords = keyWords;
  let optTemp = Object.assign({}, OPT);
  optTemp.password = "";
  optTemp.user = "";
  optTemp.cacheToken = "";
  optTemp.cacheZoneId = "";
  viewObject.OPT = optTemp;
  return Mustache.render(themeIndex, viewObject);
}
__name(GetHtmlSingleNew, "GetHtmlSingleNew");
async function GetHtmlTagsNew(pathA, pathB, pathC, env2) {
  pathB = decodeURI(pathB);
  let themeIndex = await getTheme("index");
  let widgetMenuList = await getKVByKey("SYSTEM_VALUE_WidgetMenu", true, env2);
  let widgetCategoryList = await getKVByKey("SYSTEM_VALUE_WidgetCategory", true, env2);
  let widgetTagsList = await getKVByKey("SYSTEM_VALUE_WidgetTags", true, env2);
  let widgetLinkList = await getKVByKey("SYSTEM_VALUE_WidgetLink", true, env2);
  let articleListAll = await getKVByKey("SYSTEM_INDEX_LIST", true, env2);
  let widgetRecentlyList = articleListAll.slice(0, OPT.recentlySize);
  for (var i = 0; i < widgetRecentlyList.length; i++) {
    widgetRecentlyList[i].createDate10 = widgetRecentlyList[i].createDate.substr(0, 10);
    widgetRecentlyList[i].url = "/article/" + widgetRecentlyList[i].id + "/" + widgetRecentlyList[i].link + ".html";
  }
  let jsonArticleListArray = await getKVArticleCategory(pathB, pathC, OPT.pageSize, env2);
  let articleList = jsonArticleListArray[0];
  let isEnd = jsonArticleListArray[1];
  for (var i = 0; i < articleList.length; i++) {
    articleList[i].createDate10 = articleList[i].createDate.substr(0, 10);
    articleList[i].createDateYear = articleList[i].createDate.substr(0, 4);
    articleList[i].createDateMonth = articleList[i].createDate.substr(5, 7);
    articleList[i].createDateDay = articleList[i].createDate.substr(8, 10);
    articleList[i].contentLength = articleList[i].contentText.length;
    articleList[i].url = "/article/" + articleList[i].id + "/" + articleList[i].link + ".html";
  }
  let pageNewer = [{ title: "\u4E0A\u4E00\u9875", url: "/" + pathA + "/" + pathB + "/" + (pathC - 1) }];
  if (pathC == 1)
    pageNewer = [];
  let pageOlder = [{ title: "\u4E0B\u4E00\u9875", url: "/" + pathA + "/" + pathB + "/" + (pathC + 1) }];
  if (isEnd)
    pageOlder = [];
  let title = pathB + " - " + OPT.siteName;
  let keyWords = pathB;
  let viewObject = {};
  viewObject.widgetMenuList = widgetMenuList;
  viewObject.widgetCategoryList = widgetCategoryList;
  viewObject.widgetTagsList = widgetTagsList;
  viewObject.widgetLinkList = widgetLinkList;
  viewObject.widgetRecentlyList = widgetRecentlyList;
  viewObject.articleList = articleList;
  viewObject.pageNewer = pageNewer;
  viewObject.pageOlder = pageOlder;
  viewObject.title = title;
  viewObject.keyWords = keyWords;
  let optTemp = Object.assign({}, OPT);
  optTemp.password = "";
  optTemp.user = "";
  optTemp.cacheToken = "";
  optTemp.cacheZoneId = "";
  viewObject.OPT = optTemp;
  return Mustache.render(themeIndex, viewObject);
}
__name(GetHtmlTagsNew, "GetHtmlTagsNew");
async function GetHtmlPageNew(pathA, pathB, env2) {
  let themeIndex = await getTheme("index");
  let widgetMenuList = await getKVByKey("SYSTEM_VALUE_WidgetMenu", true, env2);
  let widgetCategoryList = await getKVByKey("SYSTEM_VALUE_WidgetCategory", true, env2);
  let widgetTagsList = await getKVByKey("SYSTEM_VALUE_WidgetTags", true, env2);
  let widgetLinkList = await getKVByKey("SYSTEM_VALUE_WidgetLink", true, env2);
  let articleListAll = await getKVByKey("SYSTEM_INDEX_LIST", true, env2);
  let widgetRecentlyList = articleListAll.slice(0, OPT.recentlySize);
  for (var i = 0; i < widgetRecentlyList.length; i++) {
    widgetRecentlyList[i].createDate10 = widgetRecentlyList[i].createDate.substr(0, 10);
    widgetRecentlyList[i].url = "/article/" + widgetRecentlyList[i].id + "/" + widgetRecentlyList[i].link + ".html";
  }
  let articleList = articleListAll.slice((pathB - 1) * OPT.pageSize, pathB * OPT.pageSize);
  for (var i = 0; i < articleList.length; i++) {
    articleList[i].createDate10 = articleList[i].createDate.substr(0, 10);
    articleList[i].createDateYear = articleList[i].createDate.substr(0, 4);
    articleList[i].createDateMonth = articleList[i].createDate.substr(5, 7);
    articleList[i].createDateDay = articleList[i].createDate.substr(8, 10);
    articleList[i].contentLength = articleList[i].contentText.length;
    articleList[i].url = "/article/" + articleList[i].id + "/" + articleList[i].link + ".html";
  }
  let pageNewer = [{ title: "\u4E0A\u4E00\u9875", url: "/page/" + (pathB - 1) }];
  if (pathB == 1)
    pageNewer = [];
  let pageOlder = [{ title: "\u4E0B\u4E00\u9875", url: "/page/" + (pathB + 1) }];
  if (pathB * OPT.pageSize >= articleListAll.length)
    pageOlder = [];
  let title = (pathB > 1 ? "page " + pathB + " - " : "") + OPT.siteName;
  let keyWords = OPT.keyWords;
  let viewObject = {};
  viewObject.widgetMenuList = widgetMenuList;
  viewObject.widgetCategoryList = widgetCategoryList;
  viewObject.widgetTagsList = widgetTagsList;
  viewObject.widgetLinkList = widgetLinkList;
  viewObject.widgetRecentlyList = widgetRecentlyList;
  viewObject.articleList = articleList;
  viewObject.pageNewer = pageNewer;
  viewObject.pageOlder = pageOlder;
  viewObject.title = title;
  viewObject.keyWords = keyWords;
  let optTemp = Object.assign({}, OPT);
  optTemp.password = "";
  optTemp.user = "";
  optTemp.cacheToken = "";
  optTemp.cacheZoneId = "";
  viewObject.OPT = optTemp;
  return Mustache.render(themeIndex, viewObject);
}
__name(GetHtmlPageNew, "GetHtmlPageNew");
async function GetHtmlAdmin(request, path, env2) {
  let url = new URL(request.url);
  if (path.length == 1 || path[1] == "list") {
    let themeIndex = await getTheme("admin/index");
    let categoryJson = await getKVByKey("SYSTEM_VALUE_WidgetCategory", true, env2);
    let menuJson = await getKVByKey("SYSTEM_VALUE_WidgetMenu", true, env2);
    let linkJson = await getKVByKey("SYSTEM_VALUE_WidgetLink", true, env2);
    return themeIndex.r("categoryJson", JSON.stringify(categoryJson)).r("menuJson", JSON.stringify(menuJson)).r("linkJson", JSON.stringify(linkJson));
  }
  if (path[1] == "publish") {
    let jsonIndex = await getKVByKey("SYSTEM_INDEX_LIST", true, env2);
    let jsonTags = [];
    for (var i = 0; i < jsonIndex.length; i++) {
      if (typeof jsonIndex[i].tags === "object") {
        for (var y = 0; y < jsonIndex[i].tags.length; y++) {
          if (jsonTags.indexOf(jsonIndex[i].tags[y]) == -1) {
            jsonTags.push(jsonIndex[i].tags[y]);
          }
        }
      }
    }
    await putKV("SYSTEM_VALUE_WidgetTags", JSON.stringify(jsonTags), env2);
    let cacheRST = await purgeCache();
    if (cacheRST)
      return `{"msg":"\u53D1\u5E03\u6210\u529F\uFF0C\u7F13\u5B58\u5DF2\u5237\u65B0","rst":true}`;
    else
      return `{"msg":"\u53D1\u5E03\u6210\u529F\uFF08\u7F13\u5B58\u7EA660\u79D2\u540E\u81EA\u52A8\u5237\u65B0\uFF09","rst":true}`;
  }
  if (path[1] == "getList") {
    let page = path[2] === void 0 ? 1 : parseInt(path[2]);
    let jsonArticleListArray = await getKVArticleIndex(page, 20, env2);
    return JSON.stringify(jsonArticleListArray[0]);
  }
  if (path[1] == "edit") {
    let articleId = path[2];
    let themeIndex = await getTheme("admin/edit");
    let categoryJson = await getKVByKey("SYSTEM_VALUE_WidgetCategory", false, env2);
    let articleJson = await getKVByKey(articleId, false, env2);
    return themeIndex.r("categoryJson", categoryJson).r("articleJson", articleJson.replaceAll("script>", "script\uFF1E"));
  }
  if (path[1] == "saveConfig") {
    const postData = await readRequestBody(request);
    let WidgetCategory = postData.WidgetCategory;
    let WidgetMenu = postData.WidgetMenu;
    let WidgetLink = postData.WidgetLink;
    if (isJSON(WidgetCategory) && isJSON(WidgetMenu)) {
      await putKV("SYSTEM_VALUE_WidgetCategory", WidgetCategory, env2);
      await putKV("SYSTEM_VALUE_WidgetMenu", WidgetMenu, env2);
      await putKV("SYSTEM_VALUE_WidgetLink", WidgetLink, env2);
      return `{"msg":"saved","rst":true}`;
    } else
      return `{"msg":"Not a JSON object","rst":false}`;
  }
  if (path[1] == "import") {
    const postData = await readRequestBody(request);
    let importJson = postData.importJson;
    if (isJSON(importJson)) {
      let keys = Object.keys(importJson);
      for (let i2 = 0; i2 < keys.length; ++i2) {
        await putKV(keys[i2], importJson[keys[i2]], env2);
      }
      return `{"msg":"import success!","rst":true}`;
    } else
      return `{"msg":" importJson Not a JSON object","rst":false}`;
  }
  if (path[1] == "saveAddNew") {
    const postData = await readRequestBody(request);
    let title = postData.title;
    let img = postData.img;
    let link = postData.link;
    let createDate = postData.createDate;
    let category = postData.category;
    let tags = postData.tags;
    let priority = postData.priority === void 0 ? "0.5" : postData.priority;
    let changefreq = postData.changefreq === void 0 ? "daily" : postData.changefreq;
    let contentMD = postData["content-markdown-doc"];
    let contentHtml = postData["content-html-code"];
    let contentText = "";
    let id = "";
    if (title.length > 0 && createDate.length > 0 && category.length > 0 && contentMD.length > 0 && contentHtml.length > 0) {
      id = await getKVNewId(env2);
      contentText = contentHtml.replace(/<\/?[^>]*>/g, "").trim().substring(0, OPT.readMoreLength);
      let articleFull = {
        "id": id,
        "title": title,
        "img": img,
        "link": link,
        "createDate": createDate,
        "category": category,
        "tags": tags,
        "contentMD": contentMD,
        "contentHtml": contentHtml,
        "contentText": contentText,
        "priority": priority,
        "changefreq": changefreq
      };
      await putKV(id, JSON.stringify(articleFull), env2);
      let articleSimpel = {
        "id": id,
        "title": title,
        "img": img,
        "link": link,
        "createDate": createDate,
        "category": category,
        "tags": tags,
        "contentText": contentText,
        "priority": priority,
        "changefreq": changefreq
      };
      let oldIndex = await getKVByKey("SYSTEM_INDEX_LIST", true, env2);
      let newIndex = [];
      newIndex.push(articleSimpel);
      newIndex = newIndex.concat(oldIndex);
      newIndex = sortByKey(newIndex, "id");
      await putKV("SYSTEM_INDEX_LIST", JSON.stringify(newIndex), env2);
      return '{"msg":"added OK","rst":true,"id":"' + id + '"}';
    } else {
      return `{"msg":"\u4FE1\u606F\u4E0D\u5168","rst":false}`;
    }
    return `{"msg":"some error ","rst":false}`;
  }
  if (path[1] == "delete") {
    let articleId = path[2];
    if (articleId.length == 6) {
      await env2.CFBLOG.delete(articleId);
      let oldIndex = await getKVByKey("SYSTEM_INDEX_LIST", true, env2);
      for (var i = 0; i < oldIndex.length; i++) {
        if (articleId == oldIndex[i].id) {
          oldIndex.splice(i, 1);
        }
      }
      await putKV("SYSTEM_INDEX_LIST", JSON.stringify(oldIndex), env2);
      return '{"msg":"Delete (' + articleId + ')  OK","rst":true,"id":"' + articleId + '"}';
    } else {
      return '{"msg":"Delete  false ","rst":false,"id":"' + articleId + '"}';
    }
  }
  if (path[1] == "saveEdit") {
    const postData = await readRequestBody(request);
    let title = postData.title;
    let img = postData.img;
    let link = postData.link;
    let createDate = postData.createDate;
    let category = postData.category;
    let tags = postData.tags;
    let contentMD = postData["content-markdown-doc"];
    let contentHtml = postData["content-html-code"];
    let priority = postData.priority === void 0 ? "0.5" : postData.priority;
    let changefreq = postData.changefreq === void 0 ? "daily" : postData.changefreq;
    let contentText = "";
    let id = postData.id;
    if (title.length > 0 && createDate.length > 0 && category.length > 0 && contentMD.length > 0 && contentHtml.length > 0) {
      contentText = contentHtml.replace(/<\/?[^>]*>/g, "").trim().substring(0, OPT.readMoreLength);
      let articleFull = {
        "id": id,
        "title": title,
        "img": img,
        "link": link,
        "createDate": createDate,
        "category": category,
        "tags": tags,
        "contentMD": contentMD,
        "contentHtml": contentHtml,
        "contentText": contentText,
        "priority": priority,
        "changefreq": changefreq
      };
      await putKV(id, JSON.stringify(articleFull), env2);
      let articleSimpel = {
        "id": id,
        "title": title,
        "img": img,
        "link": link,
        "createDate": createDate,
        "category": category,
        "tags": tags,
        "contentText": contentText,
        "priority": priority,
        "changefreq": changefreq
      };
      let oldIndex = await getKVByKey("SYSTEM_INDEX_LIST", true, env2);
      for (var i = 0; i < oldIndex.length; i++) {
        if (id == oldIndex[i].id) {
          oldIndex.splice(i, 1);
        }
      }
      oldIndex.push(articleSimpel);
      oldIndex = sortByKey(oldIndex, "id");
      await putKV("SYSTEM_INDEX_LIST", JSON.stringify(oldIndex), env2);
      return '{"msg":"Edit OK","rst":true,"id":"' + id + '"}';
    } else {
      return `{"msg":"\u4FE1\u606F\u4E0D\u5168","rst":false}`;
    }
  }
  return `{"msg":"some errors","rst":false}`;
}
__name(GetHtmlAdmin, "GetHtmlAdmin");
async function getSiteMap(env2) {
  console.log("\u8FDB\u5165\u51FD\u6570 getSiteMap");
  let ArticleAll = await getKVByKey("SYSTEM_INDEX_LIST", true, env2);
  let siteMap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  for (var i = 0, l = ArticleAll.length; i < l; i++) {
    siteMap += "\n	<url>";
    siteMap += "\n		<loc>https://" + OPT.siteDomain + "/article/" + ArticleAll[i].id + "/" + ArticleAll[i].link + ".html</loc>";
    siteMap += "\n		<lastmod>" + ArticleAll[i].createDate.substr(0, 10) + "</lastmod>";
    siteMap += "\n		<changefreq>" + (ArticleAll[i].changefreq === void 0 ? "daily" : ArticleAll[i].changefreq) + "</changefreq>";
    siteMap += "\n		<priority>" + (ArticleAll[i].priority === void 0 ? "0.5" : ArticleAll[i].priority) + "</priority>";
    siteMap += "\n	</url>";
  }
  siteMap += "\n</urlset>";
  return siteMap;
}
__name(getSiteMap, "getSiteMap");
async function getKVArticleCategory(keyWords, page, pageSize, env2) {
  keyWords = decodeURI(keyWords);
  console.log("\u8FDB\u5165\u51FD\u6570: getKVArticleCategory", keyWords, page, pageSize);
  page = page <= 1 ? 1 : page;
  let ArticleAll = await getKVByKey("SYSTEM_INDEX_LIST", true, env2);
  let ArticleIndexJson = [];
  for (var i = 0, l = ArticleAll.length; i < l; i++) {
    if (ArticleAll[i]["tags"].indexOf(keyWords) > -1 || ArticleAll[i]["category"].indexOf(keyWords) > -1) {
      ArticleIndexJson.push(ArticleAll[i]);
    } else {
    }
  }
  ArticleIndexJson = sortByKey(ArticleIndexJson, "id");
  let isEnd = ArticleIndexJson.length > pageSize * page ? false : true;
  let ArticleJson = [];
  for (var i = (page - 1) * pageSize, l = Math.min(page * pageSize, ArticleIndexJson.length); i < l; i++) {
    ArticleJson.push(ArticleIndexJson[i]);
  }
  ArticleJson = sortByKey(ArticleJson, "id");
  return [ArticleJson, isEnd];
}
__name(getKVArticleCategory, "getKVArticleCategory");
async function getKVArticleSingle(articleId, env2) {
  articleId = ("00000" + parseInt(articleId)).substr(-6);
  let ArticleIndexJson = await getKVByKey("SYSTEM_INDEX_LIST", true, env2);
  let articleWZ = -1;
  for (var i = 0, l = ArticleIndexJson.length; i < l; i++) {
    if (ArticleIndexJson[i]["id"] == articleId) {
      articleWZ = i;
      break;
    }
  }
  let ArticleJust = await getKVByKey(articleId, true, env2);
  if (ArticleJust == void 0 || ArticleJust.length === 0)
    return [void 0, void 0, void 0];
  return [ArticleIndexJson[articleWZ - 1], ArticleJust, ArticleIndexJson[articleWZ + 1]];
}
__name(getKVArticleSingle, "getKVArticleSingle");
async function getKVArticleIndex(page, pageSize, env2) {
  page = page <= 1 ? 1 : page;
  let ArticleIndexJson = await getKVByKey("SYSTEM_INDEX_LIST", true, env2);
  let isEnd = ArticleIndexJson.length > pageSize * page ? false : true;
  let ArticleJson = [];
  for (var i = (page - 1) * pageSize, l = Math.min(page * pageSize, ArticleIndexJson.length); i < l; i++) {
    ArticleJson.push(ArticleIndexJson[i]);
  }
  ArticleJson = sortByKey(ArticleJson, "id");
  return [ArticleJson, isEnd];
}
__name(getKVArticleIndex, "getKVArticleIndex");
async function getKVNewId(env2) {
  let V = await getKVByKey("SYSTEM_INDEX_NUM", false, env2);
  if (V === "" || V === null || V === "[]" || V === void 0) {
    await putKV("SYSTEM_INDEX_NUM", 1, env2);
    return "000001";
  } else {
    await putKV("SYSTEM_INDEX_NUM", parseInt(V) + 1, env2);
    return ("00000" + (parseInt(V) + 1)).substr(-6);
  }
}
__name(getKVNewId, "getKVNewId");
async function getKVByKey(key, isJSON2, env2) {
  console.log("------------KV\u8BFB\u53D6---------------------:", key, isJSON2);
  let V = await env2.CFBLOG.get(key);
  if (isJSON2) {
    try {
      if (V === null || V === void 0)
        return [];
      else
        return JSON.parse(V);
    } catch (error) {
      return [];
    }
  } else {
    if (V === null || V === void 0)
      return "[]";
    else
      return V;
  }
}
__name(getKVByKey, "getKVByKey");
async function getKVKeys(env2, keys = [], cursor = "", limit = 1) {
  const value = await env2.CFBLOG.list({ limit, cursor });
  keys = keys.concat(value.keys);
  if (value.list_complete) {
    let kvs = { OPT };
    for (let i = 0; i < keys.length; ++i) {
      const KEYvalue = await env2.CFBLOG.get(keys[i].name);
      if (KEYvalue != null) {
        kvs[keys[i].name] = isJSON(KEYvalue) ? JSON.parse(KEYvalue) : KEYvalue;
      }
    }
    return kvs;
  } else {
    return await getKVKeys(env2, keys, value.cursor, limit);
  }
  return {};
}
__name(getKVKeys, "getKVKeys");
async function putKV(key, v, env2) {
  if (v == null || v == void 0)
    return false;
  if (typeof v === "object")
    v = JSON.stringify(v);
  return await env2.CFBLOG.put(key, v);
}
__name(putKV, "putKV");
function getCurrentTime() {
  var date = /* @__PURE__ */ new Date();
  var month = zeroFill(date.getMonth() + 1);
  var day = zeroFill(date.getDate());
  var hour = zeroFill(date.getHours());
  var minute = zeroFill(date.getMinutes());
  var second = zeroFill(date.getSeconds());
  var curTime = date.getFullYear() + "-" + month + "-" + day + "T" + hour + ":" + minute + ":" + second;
  return curTime;
}
__name(getCurrentTime, "getCurrentTime");
function zeroFill(i) {
  if (i >= 0 && i <= 9) {
    return "0" + i;
  } else {
    return i;
  }
}
__name(zeroFill, "zeroFill");
async function getTheme(thmeType) {
  thmeType = thmeType.replace(".html", "");
  let rst = await fetch(OPT.themeURL + thmeType + ".html", { cf: { cacheTtl: 600 } });
  return rst.text();
}
__name(getTheme, "getTheme");
String.prototype.trim = function(char) {
  if (char) {
    return this.replace(new RegExp("^\\" + char + "+|\\" + char + "+$", "g"), "");
  }
  return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.r = function(oldStr, newStr) {
  if (newStr != void 0)
    newStr = newStr.replace(new RegExp("[$]", "g"), "$$$$");
  return this.replace(new RegExp("<!--{" + oldStr + "}-->", "g"), newStr);
};
String.prototype.replaceAll = function(oldStr, newStr) {
  return this.replace(new RegExp(oldStr, "g"), newStr);
};
function sortByKey(array, key, isDesc = true) {
  return array.sort(function(a, b) {
    var x = a[key];
    var y = b[key];
    return isDesc ? x > y ? -1 : x < y ? 1 : 0 : x < y ? -1 : x > y ? 1 : 0;
  });
}
__name(sortByKey, "sortByKey");
function unauthorized() {
  return new Response("Unauthorized", {
    headers: {
      "WWW-Authenticate": 'Basic realm="cfblog"',
      "Access-Control-Allow-Origin": "*"
    },
    status: 401
  });
}
__name(unauthorized, "unauthorized");
function parseBasicAuth(auth) {
  try {
    return atob(auth.split(" ").pop()).split(":");
  } catch (e) {
    return [];
  }
}
__name(parseBasicAuth, "parseBasicAuth");
function doBasicAuth(request) {
  const auth = request.headers.get("Authorization");
  if (!auth || !/^Basic [A-Za-z0-9._~+/-]+=*$/i.test(auth)) {
    return false;
  }
  const [user, pass] = parseBasicAuth(auth);
  console.log("-----parseBasicAuth----- ", user, pass);
  return user === OPT.user && pass === OPT.password;
}
__name(doBasicAuth, "doBasicAuth");
function isJSON(str) {
  if (typeof str == "string") {
    try {
      var obj = JSON.parse(str);
      if (typeof obj == "object" && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
  if (typeof str == "object" && str) {
    return true;
  } else {
    return false;
  }
}
__name(isJSON, "isJSON");
async function readRequestBody(request) {
  const { headers } = request;
  const contentType = headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    let string = JSON.stringify(await request.json());
    let postJson = JSON.parse(string);
    let newJson = {};
    newJson.category = [];
    for (var i = 0; i < postJson.length; i++) {
      if ("tags" == postJson[i].name) {
        newJson[postJson[i].name] = postJson[i].value.split(",");
      } else if (postJson[i].name.includes("category")) {
        newJson.category.push(postJson[i].value);
      } else {
        newJson[postJson[i].name] = postJson[i].value;
      }
    }
    return newJson;
  } else if (contentType.includes("application/text")) {
    return await request.text();
  } else if (contentType.includes("text/html")) {
    return await request.text();
  } else if (contentType.includes("form")) {
    const formData = await request.formData();
    const body = {};
    for (const entry of formData.entries()) {
      body[entry[0]] = entry[1];
    }
    return JSON.stringify(body);
  } else {
    const myBlob = await request.blob();
    const objectURL = URL.createObjectURL(myBlob);
    return objectURL;
  }
}
__name(readRequestBody, "readRequestBody");
async function purgeCache(zone = OPT.cacheZoneId, key = OPT.cacheToken) {
  if (zone == void 0 || key == void 0 || zone.length < 5 || key.length < 5)
    return false;
  let response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: '{"purge_everything":true}'
    }
  );
  let data = await response.json();
  return data.success;
}
__name(purgeCache, "purgeCache");
export {
  index_default as default
};
/*! Bundled license information:

mustache/mustache.js:
  (*!
   * mustache.js - Logic-less {{mustache}} templates with JavaScript
   * http://github.com/janl/mustache.js
   *)
*/
//# sourceMappingURL=index.js.map
