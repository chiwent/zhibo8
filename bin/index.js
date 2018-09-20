"use strict";

const chalk = require('chalk');
const readline = require('readline');
const axios = require('axios');
const Game = require('../lib/game.js');


let url = 'https://bifen4pc.qiumibao.com/json/list.htm';

let cache_url = 'https://dingshi4pc.qiumibao.com/livetext/data/cache/max_sid/'
    // like this: https://dingshi4pc.qiumibao.com/livetext/data/cache/max_sid/124716/0.htm

const geme = new Game();


let home, visit;

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
            home = data.list[answer - 1].home_team;
            visit = data.list[answer - 1].visit_team;
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
    console.log('max_id url:', url)
    while (true) {
        //return new Promise((resolve, reject) => { // 加了Promise 遇到相同信息就退出了
        axios.get(url)
            .then(response => { // 获取到最大的ID文件
                let max_num = response.data;
                let timer;
                // 得到最大的ID文件
                // https://dingshi4pc.qiumibao.com/livetext/data/cache/livetext/124716/0/lit_page_2/320.htm
                let final_url = 'https://dingshi4pc.qiumibao.com/livetext/data/cache/livetext/' + data_id + '/0/lit_page_2/' + max_num + '.htm';
                // console.log('final:', final_url)
                if (max_num !== flag) {
                    async function wait(final_url) {
                        await axios.get(final_url)
                            .then(response => { //获取到了最终的数据，待处理
                                // console.log(response.status)
                                let data = response.data;
                                // console.log(data.length)
                                if (data.length === 2) {
                                    console.log(chalk.blue(`Live-Time: ${data[0].live_time}`))
                                    console.log(chalk.red(`比分 ${home} ${data[0].home_score} : ${visit} ${data[0].visit_score}`))
                                    console.log(chalk.yellow(`Live-Game-Time: ${data[0].live_ptime}`))
                                    console.log('主播 ', chalk.cyan(`${data[0].user_chn}: `, chalk.cyan(data[0].live_text)))
                                    console.log(chalk.green(`: ${data[0].live_time}`))

                                    console.log(chalk.blue(`Live-Time: ${data[1].live_time}`))
                                    console.log(chalk.red(`比分 ${home} ${data[1].home_score} : ${visit} ${data[1].visit_score}`))
                                    console.log(chalk.yellow(`Live-Game-Time: ${data[1].live_ptime}`))
                                    console.log('主播 ', chalk.cyan(`${data[1].user_chn}: `, chalk.cyan(data[1].live_text)))
                                    console.log(chalk.green(`: ${data[1].live_time}`))
                                    console.log('\n')
                                }

                            }).catch(err => {})
                    }
                    wait(final_url)
                    flag = max_num;
                }
            })
            .catch(err => {
                //console.log('请求出错, 请检查网络状况或者前面的比赛进度提示')
            })

        //})
        await sleep(100)
    }
}


// https://dingshi4pc.qiumibao.com/livetext/data/cache/livetext/124716/0/lit_page_2/320.htm