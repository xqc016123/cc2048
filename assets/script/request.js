const reportUser = function () {
    wx.login({
        success (res) {
            if (res.code) {
                console.log(res.code);
                // 发起网络请求
                wx.request({
                    url: 'https://qcxiang.fun/game/getGameInfo',
                    data: {
                        jscode: res.code,
                        type: 2048,
                    }
                });
            };
        }
    });
}

module.exports = {
    reportUser,
}
