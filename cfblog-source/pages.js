'use strict';

import Mustache from 'mustache';
import { OPT } from './config.js';
import { getTheme } from './theme.js';
import { getKVByKey, putKV, getKVArticleIndex, getKVArticleSingle, getKVArticleCategory, getKVNewId } from './kv.js';
import { isJSON, readRequestBody, sortByKey } from './utils.js';

//入口判断router
async function getHtml(request, env) {
    let url = new URL(request.url);

    let path = url.pathname.trim("/").split('/'); //转为小写,拆分路径
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


    //开始判断方法
    if (pathA == 'page' && parseInt(pathB) > 0) {//返回一个文章列表页面
        return await GetHtmlPageNew(pathA, parseInt(pathB), env);
    }
    else if (pathA == 'category' && pathB.length > 0) {
        return await GetHtmlTagsNew(pathA, pathB, parseInt(pathC), env);
    }

    else if (pathA == 'tags' && pathB.length > 0) {
        return await GetHtmlTagsNew(pathA, pathB, parseInt(pathC), env);
    }
    else if (pathA == 'article' && pathB.length > 0) {
        return await GetHtmlSingleNew(pathA, pathB, env);
    }
    else if (pathA == 'admin') {
        return await GetHtmlAdmin(request, path, env);
    }
    else {
        return OPT.html404;
    }
    return OPT.html404;
}

//单一文章
async function GetHtmlSingleNew(pathA, pathB, env) {
    //获取模板

    let themeIndex = await getTheme('article'); //主模板
    //获取mueme
    let widgetMenuList = await getKVByKey("SYSTEM_VALUE_WidgetMenu", true, env);
    //获取分类
    let widgetCategoryList = await getKVByKey("SYSTEM_VALUE_WidgetCategory", true, env);
    //获取标签
    let widgetTagsList = await getKVByKey("SYSTEM_VALUE_WidgetTags", true, env);
    //获取友情链接
    let widgetLinkList = await getKVByKey("SYSTEM_VALUE_WidgetLink", true, env);
    //获取所有文章
    let articleListAll = await getKVByKey("SYSTEM_INDEX_LIST", true, env);
    //获取最近文章
    let widgetRecentlyList = articleListAll.slice(0, OPT.recentlySize);
    for (var i = 0; i < widgetRecentlyList.length; i++) {
        widgetRecentlyList[i].createDate10 = widgetRecentlyList[i].createDate.substr(0, 10)
        widgetRecentlyList[i].url = "/article/" + widgetRecentlyList[i].id + "/" + (widgetRecentlyList[i].link === undefined ? 'detail' : widgetRecentlyList[i].link) + '.html'
    }
    //获取单篇文章 以及上下文
    let jsonArticleSingleArray = await getKVArticleSingle(pathB, env);//page = pathB
    for (var i = 0; i < jsonArticleSingleArray.length; i++) {
        if (!!jsonArticleSingleArray[i]) {
            jsonArticleSingleArray[i].createDate10 = jsonArticleSingleArray[i].createDate.substr(0, 10)
            jsonArticleSingleArray[i].contentLength = jsonArticleSingleArray[i].contentText.length
            jsonArticleSingleArray[i].url = "/article/" + jsonArticleSingleArray[i].id + "/" + (jsonArticleSingleArray[i].link === undefined ? 'detail' : jsonArticleSingleArray[i].link) + '.html'
        }
    }
    let articleSingle = jsonArticleSingleArray[1]
    if (articleSingle) {
        articleSingle.createDate10 = articleSingle.createDate.substr(0, 10)
        articleSingle.createDateYear = articleSingle.createDate.substr(0, 4)
        articleSingle.createDateMonth = articleSingle.createDate.substr(5, 7)
        articleSingle.createDateDay = articleSingle.createDate.substr(8, 10)
        articleSingle.contentLength = articleSingle.contentText.length
    }
    let articleNewer = []
    let articleOlder = []
    if (jsonArticleSingleArray[0])
        articleNewer.push(jsonArticleSingleArray[0])
    if (jsonArticleSingleArray[2])
        articleOlder.push(jsonArticleSingleArray[2])
    // //获取title
    let title = articleSingle.title + ' - ' + OPT.siteName;
    // //获取keyWords
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
    let optTemp = Object.assign({}, OPT);//JSON.parse(JSON.stringify(OPT));
    optTemp.password = '';
    optTemp.user = '';
    optTemp.cacheToken = '';
    optTemp.cacheZoneId = '';
    viewObject.OPT = optTemp;
    return Mustache.render(themeIndex, viewObject);

}

//标签+分类 
async function GetHtmlTagsNew(pathA, pathB, pathC, env) {
    pathB = decodeURI(pathB)
    //获取模板

    let themeIndex = await getTheme('index'); //主模板
    //获取mueme
    let widgetMenuList = await getKVByKey("SYSTEM_VALUE_WidgetMenu", true, env);
    //获取分类
    let widgetCategoryList = await getKVByKey("SYSTEM_VALUE_WidgetCategory", true, env);
    //获取标签
    let widgetTagsList = await getKVByKey("SYSTEM_VALUE_WidgetTags", true, env);
    //获取友情链接
    let widgetLinkList = await getKVByKey("SYSTEM_VALUE_WidgetLink", true, env);
    //获取所有文章
    let articleListAll = await getKVByKey("SYSTEM_INDEX_LIST", true, env);
    //获取最近文章
    let widgetRecentlyList = articleListAll.slice(0, OPT.recentlySize);
    for (var i = 0; i < widgetRecentlyList.length; i++) {
        widgetRecentlyList[i].createDate10 = widgetRecentlyList[i].createDate.substr(0, 10)
        widgetRecentlyList[i].url = "/article/" + widgetRecentlyList[i].id + "/" + widgetRecentlyList[i].link + '.html'
    }
    //获取本页文章
    let jsonArticleListArray = await getKVArticleCategory(pathB, pathC, OPT.pageSize, env);//关键字,页码
    let articleList = jsonArticleListArray[0]
    let isEnd = jsonArticleListArray[1]

    for (var i = 0; i < articleList.length; i++) {
        articleList[i].createDate10 = articleList[i].createDate.substr(0, 10)
        articleList[i].createDateYear = articleList[i].createDate.substr(0, 4)
        articleList[i].createDateMonth = articleList[i].createDate.substr(5, 7)
        articleList[i].createDateDay = articleList[i].createDate.substr(8, 10)
        articleList[i].contentLength = articleList[i].contentText.length
        articleList[i].url = "/article/" + articleList[i].id + "/" + articleList[i].link + '.html'
    }
    //获取pageNewer +1
    let pageNewer = [{ title: "上一页", url: "/" + pathA + "/" + pathB + "/" + (pathC - 1) }];
    if (pathC == 1)
        pageNewer = [];
    //获取pageOlder
    let pageOlder = [{ title: "下一页", url: "/" + pathA + "/" + pathB + "/" + (pathC + 1) }];
    if (isEnd)
        pageOlder = [];
    // //获取title
    let title = pathB + ' - ' + OPT.siteName;
    // //获取keyWords
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
    optTemp.password = '';
    optTemp.user = '';
    optTemp.cacheToken = '';
    optTemp.cacheZoneId = '';
    viewObject.OPT = optTemp;
    return Mustache.render(themeIndex, viewObject);

}


//page的htmlNew
async function GetHtmlPageNew(pathA, pathB, env) {
    //获取模板

    let themeIndex = await getTheme('index'); //主模板
    //获取mueme
    let widgetMenuList = await getKVByKey("SYSTEM_VALUE_WidgetMenu", true, env);
    //获取分类
    let widgetCategoryList = await getKVByKey("SYSTEM_VALUE_WidgetCategory", true, env);
    //获取标签
    let widgetTagsList = await getKVByKey("SYSTEM_VALUE_WidgetTags", true, env);
    //获取友情链接
    let widgetLinkList = await getKVByKey("SYSTEM_VALUE_WidgetLink", true, env);
    //获取所有文章
    let articleListAll = await getKVByKey("SYSTEM_INDEX_LIST", true, env);
    //获取最近文章
    let widgetRecentlyList = articleListAll.slice(0, OPT.recentlySize);
    for (var i = 0; i < widgetRecentlyList.length; i++) {
        widgetRecentlyList[i].createDate10 = widgetRecentlyList[i].createDate.substr(0, 10)
        widgetRecentlyList[i].url = "/article/" + widgetRecentlyList[i].id + "/" + widgetRecentlyList[i].link + '.html'
    }
    //获取本页文章
    let articleList = articleListAll.slice((pathB - 1) * OPT.pageSize, pathB * OPT.pageSize);
    for (var i = 0; i < articleList.length; i++) {
        articleList[i].createDate10 = articleList[i].createDate.substr(0, 10)
        articleList[i].createDateYear = articleList[i].createDate.substr(0, 4)
        articleList[i].createDateMonth = articleList[i].createDate.substr(5, 7)
        articleList[i].createDateDay = articleList[i].createDate.substr(8, 10)
        articleList[i].contentLength = articleList[i].contentText.length
        articleList[i].url = "/article/" + articleList[i].id + "/" + articleList[i].link + '.html'
    }
    //获取pageNewer +1
    let pageNewer = [{ title: "上一页", url: "/page/" + (pathB - 1) }];
    if (pathB == 1)
        pageNewer = [];
    //获取pageOlder
    let pageOlder = [{ title: "下一页", url: "/page/" + (pathB + 1) }];
    if (pathB * OPT.pageSize >= articleListAll.length)
        pageOlder = [];
    // //获取title
    let title = (pathB > 1 ? 'page ' + pathB + ' - ' : '') + OPT.siteName;
    // //获取keyWords
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
    optTemp.password = '';
    optTemp.user = '';
    optTemp.cacheToken = '';
    optTemp.cacheZoneId = '';
    viewObject.OPT = optTemp;
    return Mustache.render(themeIndex, viewObject);

}


//admin页面的html
async function GetHtmlAdmin(request, path, env) {
    let url = new URL(request.url);
    //如果是首页
    if (path.length == 1 || path[1] == "list") {
        let themeIndex = await getTheme('admin/index'); //主模板
        //替换连个json categoryJson menuJson 
        let categoryJson = await getKVByKey("SYSTEM_VALUE_WidgetCategory", true, env);
        let menuJson = await getKVByKey("SYSTEM_VALUE_WidgetMenu", true, env);
        let linkJson = await getKVByKey("SYSTEM_VALUE_WidgetLink", true, env);
        return themeIndex.r("categoryJson", JSON.stringify(categoryJson))
            .r("menuJson", JSON.stringify(menuJson))
            .r("linkJson", JSON.stringify(linkJson))
    }
    //发布事件
    if (path[1] == "publish") {
        //重新梳理控件参数 
        //SYSTEM_VALUE_WidgetCategory //设置的不处理
        //SYSTEM_VALUE_WidgetMenu //设置的不处理
        //SYSTEM_VALUE_WidgetTags //从索引提取的
        //提取所有index
        let jsonIndex = await getKVByKey("SYSTEM_INDEX_LIST", true, env);
        let jsonTags = [];
        //提取tag到变量
        for (var i = 0; i < jsonIndex.length; i++) {
            if (typeof jsonIndex[i].tags === "object") {
                for (var y = 0; y < jsonIndex[i].tags.length; y++) {
                    if (jsonTags.indexOf(jsonIndex[i].tags[y]) == -1) {
                        jsonTags.push(jsonIndex[i].tags[y])
                    }
                }
            }

        }
        await putKV("SYSTEM_VALUE_WidgetTags", JSON.stringify(jsonTags), env);
        //清理缓存
        let cacheRST = await purgeCache();
        if (cacheRST)
            return `{"msg":"发布成功，缓存已刷新","rst":true}`;
        else
            return `{"msg":"发布成功（缓存约60秒后自动刷新）","rst":true}`;

    }
    //获取文章列表
    if (path[1] == "getList") {
        let page = (path[2] === undefined ? 1 : parseInt(path[2]));
        let jsonArticleListArray = await getKVArticleIndex(page, 20, env);//page = pathB
        return JSON.stringify(jsonArticleListArray[0])

    }
    //进编辑页面
    if (path[1] == "edit") {
        let articleId = path[2];
        let themeIndex = await getTheme('admin/edit'); //主模板
        //替换连个json categoryJson menuJson 
        let categoryJson = await getKVByKey("SYSTEM_VALUE_WidgetCategory", false, env);
        let articleJson = await getKVByKey(articleId, false, env);
        return themeIndex.r("categoryJson", categoryJson)
            .r("articleJson", articleJson.replaceAll("script>", "script＞"))
    }

    //保存设置
    if (path[1] == "saveConfig") {
        const postData = await readRequestBody(request);
        let WidgetCategory = postData.WidgetCategory;//url.searchParams.get('WidgetCategory');
        let WidgetMenu = postData.WidgetMenu;//url.searchParams.get('WidgetMenu');
        let WidgetLink = postData.WidgetLink;//url.searchParams.get('WidgetMenu');
        //如果是json,保存到数据库
        if (isJSON(WidgetCategory) && isJSON(WidgetMenu)) {
            await putKV("SYSTEM_VALUE_" + "WidgetCategory", WidgetCategory, env);
            await putKV("SYSTEM_VALUE_" + "WidgetMenu", WidgetMenu, env);
            await putKV("SYSTEM_VALUE_" + "WidgetLink", WidgetLink, env);
            return `{"msg":"saved","rst":true}`;
        }
        else
            return `{"msg":"Not a JSON object","rst":false}`;
    }
    //导入
    if (path[1] == "import") {
        const postData = await readRequestBody(request);
        let importJson = postData.importJson;//url.searchParams.get('WidgetCategory');
        if (isJSON(importJson)) {
            let keys = Object.keys(importJson)
            for (let i = 0; i < keys.length; ++i) {
                await putKV(keys[i], importJson[keys[i]], env);
            }
            return `{"msg":"import success!","rst":true}`;
        }
        else
            return `{"msg":" importJson Not a JSON object","rst":false}`;
    }
    //新建文章
    if (path[1] == "saveAddNew") {
        const postData = await readRequestBody(request);
        let title = postData.title;        //url.searchParams.get('title');
        let img = postData.img;          //url.searchParams.get('img');
        let link = postData.link;         //url.searchParams.get('link');
        let createDate = postData.createDate;   //url.searchParams.get('createDate');
        let category = postData.category;
        let tags = postData.tags;         //url.searchParams.get('tags').split(',');
        let priority = (postData.priority === undefined ? "0.5" : postData.priority);         //权重
        let changefreq = (postData.changefreq === undefined ? "daily" : postData.changefreq);         //更新频率
        let contentMD = postData["content-markdown-doc"];    //url.searchParams.get('content-markdown-doc');
        let contentHtml = postData["content-html-code"];  //url.searchParams.get('content-html-code');
        let contentText = '';
        let id = '';
        if (title.length > 0 && createDate.length > 0 && category.length > 0 && contentMD.length > 0 && contentHtml.length > 0) {
            id = await getKVNewId(env);
            contentText = contentHtml.replace(/<\/?[^>]*>/g, '').trim().substring(0, OPT.readMoreLength);
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
            }
            //全文写入数据库
            await putKV(id, JSON.stringify(articleFull), env);//JSON.stringify(articleFull)
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
            }
            //index也要建立SYSTEM_INDEX_LIST
            let oldIndex = await getKVByKey("SYSTEM_INDEX_LIST", true, env);
            let newIndex = [];
            newIndex.push(articleSimpel);
            newIndex = newIndex.concat(oldIndex);
            newIndex = sortByKey(newIndex, "id")
            //这里要排个序
            await putKV("SYSTEM_INDEX_LIST", JSON.stringify(newIndex), env);
            return '{"msg":"added OK","rst":true,"id":"' + id + '"}';
        }
        else {
            return `{"msg":"信息不全","rst":false}`;
        }
        return `{"msg":"some error ","rst":false}`;
    }
    //删除文章
    if (path[1] == "delete") {
        let articleId = path[2];
        if (articleId.length == 6) {
            await env.CFBLOG.delete(articleId);
            //index也要重新建立,一定要准,后面不在重构 SYSTEM_INDEX_LIST
            //获取旧索引
            let oldIndex = await getKVByKey("SYSTEM_INDEX_LIST", true, env);
            //删掉当前文章
            for (var i = 0; i < oldIndex.length; i++) {
                if (articleId == oldIndex[i].id) {
                    oldIndex.splice(i, 1);
                }
            }
            //写入索引数据库
            await putKV("SYSTEM_INDEX_LIST", JSON.stringify(oldIndex), env);
            return '{"msg":"Delete (' + articleId + ')  OK","rst":true,"id":"' + articleId + '"}';
        }
        else { return '{"msg":"Delete  false ","rst":false,"id":"' + articleId + '"}'; }
    }
    //编辑文章
    if (path[1] == "saveEdit") {
        const postData = await readRequestBody(request);
        let title = postData.title;        //url.searchParams.get('title');
        let img = postData.img;          //url.searchParams.get('img');
        let link = postData.link;         //url.searchParams.get('link');
        let createDate = postData.createDate;   //url.searchParams.get('createDate');
        let category = postData.category;
        let tags = postData.tags;         //url.searchParams.get('tags').split(',');
        let contentMD = postData["content-markdown-doc"];    //url.searchParams.get('content-markdown-doc');
        let contentHtml = postData["content-html-code"];  //url.searchParams.get('content-html-code');
        let priority = (postData.priority === undefined ? "0.5" : postData.priority);         //权重
        let changefreq = (postData.changefreq === undefined ? "daily" : postData.changefreq);         //更新频率
        let contentText = '';
        let id = postData.id;

        if (title.length > 0 && createDate.length > 0 && category.length > 0 && contentMD.length > 0 && contentHtml.length > 0) {
            //去html标签
            contentText = contentHtml.replace(/<\/?[^>]*>/g, '').trim().substring(0, OPT.readMoreLength);
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
            }
            //全文写入数据库
            await putKV(id, JSON.stringify(articleFull), env);//JSON.stringify(articleFull)
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
            }
            //index也要重新建立,一定要准,后面不在重构 SYSTEM_INDEX_LIST
            //获取旧索引
            let oldIndex = await getKVByKey("SYSTEM_INDEX_LIST", true, env);
            //删掉当前文章
            for (var i = 0; i < oldIndex.length; i++) {
                if (id == oldIndex[i].id) {
                    oldIndex.splice(i, 1);
                }
            }

            //加入编辑后的文章
            oldIndex.push(articleSimpel);
            //重新排序
            oldIndex = sortByKey(oldIndex, "id")
            //写入索引数据库
            await putKV("SYSTEM_INDEX_LIST", JSON.stringify(oldIndex), env);
            return '{"msg":"Edit OK","rst":true,"id":"' + id + '"}';
        }
        else {
            return `{"msg":"信息不全","rst":false}`;
        }

    }
    return `{"msg":"some errors","rst":false}`;
}

//getSiteMap
async function getSiteMap(env) {
    let ArticleAll = await getKVByKey("SYSTEM_INDEX_LIST", true, env);
    let siteMap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    for (var i = 0, l = ArticleAll.length; i < l; i++) {
        siteMap += '\n\t' + "<url>";
        siteMap += '\n\t\t' + "<loc>" + "https://" + OPT.siteDomain + "/article/" + ArticleAll[i].id + "/" + ArticleAll[i].link + '.html' + "</loc>";
        siteMap += '\n\t\t' + "<lastmod>" + ArticleAll[i].createDate.substr(0, 10) + "</lastmod>";
        siteMap += '\n\t\t' + "<changefreq>" + (ArticleAll[i].changefreq === undefined ? "daily" : ArticleAll[i].changefreq) + "</changefreq>";
        siteMap += '\n\t\t' + "<priority>" + (ArticleAll[i].priority === undefined ? "0.5" : ArticleAll[i].priority) + "</priority>";
        siteMap += '\n\t' + "</url>";

    }
    siteMap += '\n' + "</urlset>";
    return siteMap

}

//清理缓存
async function purgeCache(zone = OPT.cacheZoneId, key = OPT.cacheToken) {
    if (zone == undefined || key == undefined || zone.length < 5 || key.length < 5)
        return false
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

export { getHtml, getSiteMap };
