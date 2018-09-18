"use strict";

const chalk = require('chalk');
const readline = require('readline');
const axios = require('axios');
const Game = require('../lib/game.js');
//const axiosRetry = require('axios-retry');

//axiosRetry(axios, { retries: 3 });

let url = 'https://bifen4pc.qiumibao.com/json/list.htm';

let cache_url = 'https://dingshi4pc.qiumibao.com/livetext/data/cache/max_sid/'
    // like this: https://dingshi4pc.qiumibao.com/livetext/data/cache/max_sid/124716/0.htm

const geme = new Game();



geme.getImportantGame(url)
    .then(response => {
        let data = response;
        // console.log(data.list)
        console.log(chalk.cyan(`当前有 ${data.list.length} 场赛事直播\n`))
        data.list.forEach((item, index) => {
            //if (item.match(/\/zhibo\/(\w+)\/\d+\/.+.htm/) === "nba"){
            console.log(chalk.blue(`赛事${index + 1}  开赛时间：${item.time}`))
            console.log(chalk.red(`${item.home_team}(主队) VS ${item.visit_team}(客队)`))
            if (!item.period_cn) {
                console.log(chalk.hex('#ff646c')('暂无比赛信息'))
            } else {
                console.log(chalk.yellow(`比赛进度： ${item.period_cn}`))
                console.log(chalk.green(`当前比分  ${item.home_score} : ${item.visit_score}`))
            }
            console.log('\n')
                //}
        })
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
        rl.question('客官需要看哪一场比赛，请输入序号  ', answer => {
            console.log(`你选择了第${answer}场，即将为你切入直播信号 \n`);
            rl.close();
            if (!data.list[answer - 1].period_cn) {
                console.log('这场比赛可能还没有开始或者是没有直播');
            }
            let url = cache_url + data.list[answer - 1].id + '/0.htm';
            let data_id = data.list[answer - 1].id;
            main(data_id, url);
            // getSrc(url);
        })
    }).catch(err => {
        console.log(err)
    })


let sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}



let flag;

let main = async(data_id, url) => {
        //console.log('max_id url:', url)
        while (true) {
            axios.get(url)
                .then(response => { // 获取到最大的ID文件
                    let max_num = response.data;
                    /*
                    while (max_num === flag) {  // 用延时的方法来避开重复数据
                        //setTimeout(() => { console.log('延时以避开重复数据') }, 5000)
                        setTimeout(() => {}, 100)
                    }
                    */
                    // 用同步的方式来避开重复数据
                    async function filter(max_num, flag) {
                        while (max_num === flag) {
                            await (() => {});
                        }
                    }
                    filter(max_num, flag) // 同步等待，直到出现不重复的数据
                        /*
                        let true_num;
                        if (max_num % 2 === 0) {
                            true_num = max_num;
                        }
                        if (parseInt(response.status) === 404) {
                            console.log('没有比赛信息了');
                            process.exit(0);
                        }
                        */
                        // 得到最大的ID文件
                        // https://dingshi4pc.qiumibao.com/livetext/data/cache/livetext/124716/0/lit_page_2/320.htm
                    let final_url = 'https://dingshi4pc.qiumibao.com/livetext/data/cache/livetext/' + data_id + '/0/lit_page_2/' + max_num + '.htm';
                    // console.log('final:', final_url)
                    async function wait(final_url) {
                        await axios.get(final_url)
                            .then(response => { //获取到了最终的数据，待处理
                                // console.log(response.status)
                                let data = response.data;
                                // console.log(response.data[0].user_chn)
                                console.log(chalk.blue(`Live-Time: ${data[0].live_time}`))
                                console.log(chalk.red(`比分 ${data[0].home_score} : ${data[0].visit_score}`))
                                console.log(chalk.yellow(`Live-Game-Time: ${data[0].live_ptime}`))
                                console.log('主播 ', chalk.cyan(`${data[0].user_chn}: `, chalk.cyan(data[0].live_text)))
                                console.log(chalk.green(`: ${data[0].live_time}`))

                                console.log('\n')

                                console.log(chalk.blue(`Live-Time: ${data[1].live_time}`))
                                console.log(chalk.red(`比分 ${data[1].home_score} : ${data[1].visit_score}`))
                                console.log(chalk.yellow(`Live-Game-Time: ${data[1].live_ptime}`))
                                console.log('主播 ', chalk.cyan(`${data[1].user_chn}: `, chalk.cyan(data[1].live_text)))
                                console.log(chalk.green(`: ${data[1].live_time}`))

                            }).catch(err => {})
                    }
                    wait(final_url)
                    flag = max_num;
                })
                .catch(err => {
                    //console.log('请求出错, 请检查网络状况或者前面的比赛进度提示')
                })
            await sleep(1000)
        }
    }
    /*
    let getSrc = async(url) => {
        console.log('url:', url)
        const client = (url) => axios.create({ baseURL: url });
        axiosRetry(client, { retries: 4 });
        axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });

        // Custom retry delay
        axiosRetry(axios, {
            retryDelay: (retryCount) => {
                return retryCount * 500;
            }
        });
        while (true) {
            client(url)
                .get(url)
                .then(res => {
                    let max_num = response.data;
                    if (max_num % 2) {
                        max_num++;
                    }
                    if (parseInt(response.status) === 404) {
                        console.log('没有比赛信息了');
                        //process.exit(0);
                    }
                    // 得到最大的ID文件
                    let final_url = 'https://dingshi4pc.qiumibao.com/livetext/data/cache/livetext/' + data.list[answer - 1].id + '/0/lit_page_2/' + max_num + '.htm';
                    console.log('final:', final_url)
                    resolve(final_url)
                }).then(response => {
                    console.log(responsen.data)
                }).catch(err => {
                    console.log('请求出错, 请检查网络状况或者前面的比赛进度提示')
                })
            await sleep(500)
        }
    }
    */

// 超时时间
/*
axios.defaults.timeout = 7000;

// Axios使用拦截器全局处理请求重试  https://majing.io/posts/10000005381218
axios.defaults.retry = 1; //重试次数
axios.defaults.retryDelay = 1000; //重试延时
axios.defaults.shouldRetry = (error) => true; //重试条件，默认只要是错误都需要重试
axios.interceptors.response.use(undefined, (err) => {
    var config = err.config;
    // 判断是否配置了重试
    if (!config || !config.retry) return Promise.reject(err);

    if (!config.shouldRetry || typeof config.shouldRetry != 'function') {
        return Promise.reject(err);
    }

    //判断是否满足重试条件
    if (!config.shouldRetry(err)) {
        return Promise.reject(err);
    }

    // 设置重置次数，默认为0
    config.__retryCount = config.__retryCount || 0;

    // 判断是否超过了重试次数
    if (config.__retryCount >= config.retry) {
        return Promise.reject(err);
    }

    //重试次数自增
    config.__retryCount += 1;

    //延时处理
    var backoff = new Promise(function(resolve) {
        setTimeout(function() {
            resolve();
        }, config.retryDelay || 1);
    });

    //重新发起axios请求
    return backoff.then(function() {
        return axios(config);
    });
});
*/


// https://dingshi4pc.qiumibao.com/livetext/data/cache/livetext/124716/0/lit_page_2/320.htm