'use strict';

import { OPT } from './config.js';
import { isJSON as isJSONStr, sortByKey } from './utils.js';

///////////////////////////////////// KV操作 //////////////////////////////////////////////////////////////////
//获取文章索引Category
async function getKVArticleCategory(keyWords, page, pageSize, env) {
    keyWords = decodeURI(keyWords)
    page = (page <= 1 ? 1 : page);
    let ArticleAll = await getKVByKey("SYSTEM_INDEX_LIST", true, env);
    //从ALL里面,搜出包含关键字的
    let ArticleIndexJson = [];
    for (var i = 0, l = ArticleAll.length; i < l; i++) {
        if ((ArticleAll[i]["tags"].indexOf(keyWords) > -1) || (ArticleAll[i]["category"].indexOf(keyWords) > -1)) {
            ArticleIndexJson.push(ArticleAll[i]);
        }
    }
    //组合后,排个序
    ArticleIndexJson = sortByKey(ArticleIndexJson, "id")
    let isEnd = ArticleIndexJson.length > pageSize * page ? false : true;//返回是否最后一页
    let ArticleJson = []
    for (var i = (page - 1) * pageSize, l = Math.min(page * pageSize, ArticleIndexJson.length); i < l; i++) {
        ArticleJson.push(ArticleIndexJson[i])
    }
    ArticleJson = sortByKey(ArticleJson, "id")
    return [ArticleJson, isEnd]

}
//获取单个文章索引 getKVArticleSingle
async function getKVArticleSingle(articleId, env) {
    articleId = ("00000" + parseInt(articleId)).substr(-6);
    let ArticleIndexJson = await getKVByKey("SYSTEM_INDEX_LIST", true, env);
    //在索引中的位置,只要 -1 和+1,当前的从数据库读取
    let articleWZ = -1;
    for (var i = 0, l = ArticleIndexJson.length; i < l; i++) {
        if (ArticleIndexJson[i]["id"] == articleId) {
            articleWZ = i;
            break;
        }
    }
    //获取当前文章
    let ArticleJust = await getKVByKey(articleId, true, env);
    if (ArticleJust == undefined || ArticleJust.length === 0)
        return [undefined, undefined, undefined]
    //返回 [newer,just,older]
    return [ArticleIndexJson[(articleWZ - 1)], ArticleJust, ArticleIndexJson[(articleWZ + 1)]]

}

//获取文章索引
async function getKVArticleIndex(page, pageSize, env) {
    page = (page <= 1 ? 1 : page);
    let ArticleIndexJson = await getKVByKey("SYSTEM_INDEX_LIST", true, env);

    let isEnd = ArticleIndexJson.length > pageSize * page ? false : true;//返回是否最后一页
    let ArticleJson = []
    for (var i = (page - 1) * pageSize, l = Math.min(page * pageSize, ArticleIndexJson.length); i < l; i++) {
        ArticleJson.push(ArticleIndexJson[i])
    }
    ArticleJson = sortByKey(ArticleJson, "id")
    return [ArticleJson, isEnd]

}
//返回并设置文章ID
async function getKVNewId(env) {
    let V = await getKVByKey("SYSTEM_INDEX_NUM", false, env);
    if (V === '' || V === null || V === '[]' || V === undefined) {
        await putKV("SYSTEM_INDEX_NUM", 1, env);
        return "000001";

    }
    else {
        await putKV("SYSTEM_INDEX_NUM", parseInt(V) + 1, env);
        return ("00000" + (parseInt(V) + 1)).substr(-6);
    }
}
//要存入数据库的html缓存 SYSTEM_CACHE_MENU,SYSTEM_CACHE_CATEGORY,SYSTEM_CACHE_RECENTLY,SYSTEM_CACHE_TAGS,
//要存入数据库的设置值  SYSTEM_VALUE_WidgetMenu,SYSTEM_VALUE_CATEGORY
async function getKVByKey(key, isJSON, env) {
    let V = await env.CFBLOG.get(key);
    if (isJSON) {
        try {
            if (V === null || V === undefined)
                return [];
            else
                return JSON.parse(V);
        }
        catch (error) {
            return [];
        }
    }
    else {
        if (V === null || V === undefined)
            return '[]';
        else
            return V;
    }
}

async function getKVKeys(env, keys = [], cursor = '', limit = 1) {
    const value = await env.CFBLOG.list({ limit: limit, cursor: cursor })
    keys = keys.concat(value.keys)
    if (value.list_complete) {
        let kvs = { OPT: OPT }
        for (let i = 0; i < keys.length; ++i) {
            const KEYvalue = await env.CFBLOG.get(keys[i].name)
            if (KEYvalue != null) {
                kvs[keys[i].name] = isJSONStr(KEYvalue) ? JSON.parse(KEYvalue) : KEYvalue
            }
        }
        return kvs
    }
    else {
        return await getKVKeys(env, keys, value.cursor, limit);
    }
}

async function putKV(key, v, env) {
    if (v == null || v == undefined)
        return false;
    if (typeof v === "object")
        v = JSON.stringify(v)
    return await env.CFBLOG.put(key, v);
}

export { getKVArticleCategory, getKVArticleSingle, getKVArticleIndex, getKVNewId, getKVByKey, getKVKeys, putKV };
