'use strict';

import { OPT } from './config.js';

////////////密码认证用的函数,来自 https://github.com/maple3142/GDIndex
function unauthorized() {
    return new Response('Unauthorized', {
        headers: {
            'WWW-Authenticate': 'Basic realm="cfblog"',
            'Access-Control-Allow-Origin': '*'
        },
        status: 401
    });
}

function parseBasicAuth(auth) {
    try {
        return atob(auth.split(' ').pop()).split(':');
    } catch (e) {
        return [];
    }
}

function doBasicAuth(request) {
    const auth = request.headers.get('Authorization');

    if (!auth || !/^Basic [A-Za-z0-9._~+/-]+=*$/i.test(auth)) {
        return false;
    }

    const [user, pass] = parseBasicAuth(auth);

    return user === OPT.user && pass === OPT.password;
}

export { unauthorized, parseBasicAuth, doBasicAuth };
