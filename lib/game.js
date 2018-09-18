"use strict";

const axios = require('axios');

class Game {
    constructor() {

        }
        // 重要赛事直播
    getImportantGame(url) {
        return new Promise((resolve, reject) => {
            axios.get(url)
                .then(response => {
                    let data = response.data;
                    // data = JSON.parse(data);
                    resolve(data);
                })
        })
    }
}

module.exports = Game;