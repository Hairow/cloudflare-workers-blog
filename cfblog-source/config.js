'use strict';

// 站点配置(默认值,运行时可被 env vars / secrets / URL 参数覆盖)
const OPT = {
    // ----- 以下由 env vars / secrets 注入,此处仅作默认值 -----
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
    // ----- 以下为内容/模板配置,保留在代码中 -----
    "widgetOther": ``,
    "themeURL": "https://raw.githubusercontent.com/gdtool/cloudflare-workers-blog/master/themes/JustNews/", // 模板地址,以 "/"" 结尾default2.0
    "html404": `<h1>404</h1>`,//404页面返回
    "codeBeforHead": `
    <link rel="icon" type="image/x-icon" href="https://cdn.jsdelivr.net/gh/gdtool/zhaopp/cfblog/favicon.ico" />
<link rel="Shortcut Icon" href="https://cdn.jsdelivr.net/gh/gdtool/zhaopp/cfblog/favicon.ico">
    `,//其他代码,显示在</head>前
    "codeBeforBody": `
        <script>
            var _hmt = _hmt || [];
            (function() {
            var hm = document.createElement("script");
            hm.src = "https://hm.baidu.com/hm.js?3c82d815b755ee9b789cb004067c1fc7";
            var s = document.getElementsByTagName("script")[0]; 
            s.parentNode.insertBefore(hm, s);
            })();
        </script>
    `,//其他代码,显示在</body>前
    "commentCode": ``,//评论区代码
    "otherCodeA": "阅读:",//默认模板,建议设置为 "阅读次数:"四个大字
    "otherCodeB": "",
    "otherCodeC": "",
    "otherCodeD": "",
    "otherCodeE": "",
    "copyRight": `Powered by <a href="https://www.cloudflare.com">Cloudflare</a> & <a href="https://blog.gezhong.vip">CF-Blog </a>`,//版权信息
    "robots": `User-agent: *
    Disallow: /admin`//robots.txt设置

};

// 将 wrangler.jsonc vars + secrets 合并到 OPT(仅在首次请求或值缺失时)
function mergeEnvConfig(env) {
    OPT.user = env.USER || OPT.user;
    OPT.password = env.PASSWORD || OPT.password;
    OPT.siteDomain = env.SITE_DOMAIN || OPT.siteDomain;
    OPT.privateBlog = env.PRIVATE_BLOG === 'true';
    OPT.siteName = env.SITE_NAME || OPT.siteName;
    OPT.siteDescription = env.SITE_DESCRIPTION || OPT.siteDescription;
    OPT.keyWords = env.KEY_WORDS || OPT.keyWords;
    OPT.pageSize = parseInt(env.PAGE_SIZE) || OPT.pageSize;
    OPT.recentlySize = parseInt(env.RECENTLY_SIZE) || OPT.recentlySize;
    OPT.readMoreLength = parseInt(env.READ_MORE_LENGTH) || OPT.readMoreLength;
    OPT.cacheTime = parseInt(env.CACHE_TIME) || OPT.cacheTime;
    OPT.themeURL = env.THEME_URL || OPT.themeURL;
    OPT.cacheZoneId = env.CACHE_ZONE_ID || OPT.cacheZoneId;
    OPT.cacheToken = env.CACHE_TOKEN || OPT.cacheToken;
}

export { OPT, mergeEnvConfig };
