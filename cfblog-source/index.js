'use strict';

import { OPT, mergeEnvConfig } from './config.js';
import { unauthorized, doBasicAuth } from './auth.js';
import { getKVKeys } from './kv.js';
import { getCurrentTime } from './utils.js';
import { getHtml, getSiteMap } from './pages.js';

//主函数
async function handleRequest(request, env, ctx) {
    mergeEnvConfig(env);
    let url = new URL(request.url);
    //密码认证
    let path = url.pathname.trim("/").split('/'); //转为小写,拆分路径
    if (path[0] === 'admin' || OPT.privateBlog === true) {
        if (!doBasicAuth(request)) {
            return unauthorized();
        }
    }
    //备份导出
    if (path[0] === 'admin' && path[1] === "export") {
        let kvs = await getKVKeys(env);
        return new Response(JSON.stringify(kvs), {
            headers: {
                'content-type': 'application/octet-stream;charset=utf-8',
                'Content-Disposition': 'attachment; filename=cfblog-' + getCurrentTime() + '.json'
            },
        })
    }

    //自定义主题(用于预览)
    let theme = url.searchParams.get('theme');
    let pageSize = url.searchParams.get('pageSize');

    if (theme) {
        OPT.themeURL = OPT.themeURL.replace(/themes\/[^/]+/, 'themes/' + theme)
    }
    if (pageSize) {
        OPT.pageSize = parseInt(pageSize)
    }


    // 处理/robots.txt
    if (url.pathname == "/robots.txt") {
        return new Response(OPT.robots + '\nSitemap: https://' + OPT.siteDomain + "/sitemap.xml", {
            headers: {
                "content-type": "text/plain;charset=UTF-8",
            },
            status: 200
        })
    }
    // 阅读计数 API
    if (url.pathname == "/api/pageview") {
        let articleId = url.searchParams.get('path');
        if (!articleId) {
            return new Response(JSON.stringify({ count: 0 }), {
                headers: { 'content-type': 'application/json;charset=UTF-8' },
            });
        }
        let count = parseInt(await env.CFBLOG.get('pageview_' + articleId)) || 0;
        return new Response(JSON.stringify({ count: count }), {
            headers: { 'content-type': 'application/json;charset=UTF-8' },
        });
    }
    // 增加阅读计数
    if (url.pathname == "/api/pageview/increment") {
        let articleId = url.searchParams.get('path');
        if (!articleId) {
            return new Response(JSON.stringify({ count: 0 }), {
                headers: { 'content-type': 'application/json;charset=UTF-8' },
            });
        }
        let count = parseInt(await env.CFBLOG.get('pageview_' + articleId)) || 0;
        count++;
        await env.CFBLOG.put('pageview_' + articleId, count.toString());
        return new Response(JSON.stringify({ count: count }), {
            headers: { 'content-type': 'application/json;charset=UTF-8' },
        });
    }
    //favicon.ico
    if (url.pathname == "/favicon.ico") {
        return new Response("404", {
            headers: {
                "content-type": "text/plain;charset=UTF-8",
            },
            status: 404
        })
    }

    //缓存开始


    let pathA = '';//参数A:[page,category,tags,single,search]
    let pathB = '';//参数B
    let pathC = '';//参数C
    //如果是首页
    if (path.length == 0 || path[0] == "") {
        pathA = 'page';
        pathB = '1';
    }
    else { //两个以上参数
        pathA = path[0];
        pathB = (path[1] === undefined ? 1 : path[1]);
        pathC = (path[2] === undefined ? 1 : path[2]);

    }
    const cache = caches.default

    const cacheFullPath = "https://" + OPT.siteDomain + '/' + pathA + '/' + pathB + '/' + pathC;
    const cacheKey = new Request(cacheFullPath, request)


    //去找是否存在缓存
    let response = await cache.match(cacheKey)
    //如果存在缓存直接返回
    if (!!response) {
        return response;
    }
    //缓存结束

    //sitemap.xml
    if (pathA == "sitemap.xml") {

        response = new Response(await getSiteMap(env), {
            headers: {
                "content-type": "text/xml;charset=UTF-8",
            },
            status: 200
        })
    }
    else {
        //处理html正文
        let html = await getHtml(request, env);
        response = new Response(html, {
            headers: {
                "content-type": "text/html;charset=UTF-8",
            },
            status: 200
        })

    }
    //1.开启缓存
    if (pathA == 'admin')
        response.headers.set('Cache-Control', "no-store");
    else {
        response.headers.set('Cache-Control', "public, max-age=" + OPT.cacheTime);
        //2.存入缓存 ,一定要存 cacheFullPath的
        ctx.waitUntil(cache.put(cacheFullPath, response.clone()));
    }

    return response;
}

export default {
    async fetch(request, env, ctx) {
        return handleRequest(request, env, ctx);
    }
};
