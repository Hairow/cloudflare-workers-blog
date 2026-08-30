'use strict';

//去除两头的字符
String.prototype.trim = function (char) {
    if (char) {
        return this.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '');
    }
    return this.replace(/^\s+|\s+$/g, '');
};
//替换html模板return this.replace(new RegExp(FindText, "g"), RepText);
String.prototype.r = function (oldStr, newStr) {
    //return this.replace("<!--{"+oldStr+"}-->",newStr);
    if (newStr != undefined)
        newStr = newStr.replace(new RegExp("[$]", "g"), "$$$$");
    return this.replace(new RegExp("<!--{" + oldStr + "}-->", "g"), newStr);
};
String.prototype.replaceAll = function (oldStr, newStr) {
    //return this.replace("<!--{"+oldStr+"}-->",newStr);
    return this.replace(new RegExp(oldStr, "g"), newStr);
};

function getCurrentTime() {
    var date = new Date();//当前时间
    var month = zeroFill(date.getMonth() + 1);//月
    var day = zeroFill(date.getDate());//日
    var hour = zeroFill(date.getHours());//时
    var minute = zeroFill(date.getMinutes());//分
    var second = zeroFill(date.getSeconds());//秒
    //当前时间
    var curTime = date.getFullYear() + "-" + month + "-" + day
        + "T" + hour + ":" + minute + ":" + second;

    return curTime;
}

function zeroFill(i) {
    if (i >= 0 && i <= 9) {
        return "0" + i;
    } else {
        return i;
    }
}

//json对象排序,默认倒叙
function sortByKey(array, key, isDesc = true) {
    return array.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return isDesc ? ((x > y) ? -1 : ((x < y) ? 1 : 0)) : ((x < y) ? -1 : ((x > y) ? 1 : 0));

    });
}

function isJSON(str) {
    if (typeof str == 'string') {
        try {
            var obj = JSON.parse(str);
            if (typeof obj == 'object' && obj) {
                return true;
            } else {
                return false;
            }

        } catch (e) {
            return false;
        }
    }
    if (typeof str == 'object' && str) {
        return true;
    }
    else {
        return false;
    }
}

//获取POST数据
async function readRequestBody(request) {
    const { headers } = request
    const contentType = headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
        let postJson = await request.json();

        let newJson = {}
        newJson.category = []
        for (var i = 0; i < postJson.length; i++) {
            if ('tags' == postJson[i].name) {
                newJson[postJson[i].name] = postJson[i].value.split(',');
            }
            else if (postJson[i].name.includes("category")) {
                newJson.category.push(postJson[i].value)
            }
            else {
                newJson[postJson[i].name] = postJson[i].value;
            }

        }
        return newJson;
    }
    else if (contentType.includes("application/text")) {
        return await request.text()
    }
    else if (contentType.includes("text/html")) {
        return await request.text()
    }
    else if (contentType.includes("form")) {
        const formData = await request.formData()
        const body = {}
        for (const entry of formData.entries()) {
            body[entry[0]] = entry[1]
        }
        return JSON.stringify(body)
    }
    else {
        const myBlob = await request.blob()
        const objectURL = URL.createObjectURL(myBlob)
        return objectURL
    }
}

export { getCurrentTime, zeroFill, sortByKey, isJSON, readRequestBody };
