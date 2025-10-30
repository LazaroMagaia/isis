// util.js
// Centraliza URLs absolutas para imagens no servidor local Laravel

const BASE_URL = 'http://127.0.0.1:8000';

const UTIL = {
    images: {
        avatars: {
            user: `${BASE_URL}/assets/static/user.png`,
        },
        default:`${BASE_URL}/assets/`,
        logos: {
            main: `${BASE_URL}/assets/logo.png`,
        },
    },
};

export default UTIL;
