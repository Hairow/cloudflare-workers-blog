'use strict';

import { OPT } from './config.js';

async function getTheme(thmeType) {
    let rst = await fetch(OPT.themeURL + thmeType + '.html', { cf: { cacheTtl: 600 } });
    return rst.text();

}

export { getTheme };
