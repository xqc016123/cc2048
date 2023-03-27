import constant from "./constant";

const setScore = function (score) {
    try {
        wx.setStorageSync(constant.STORAGE_SCORE_KEY, score);
    } catch (e) { }
}

const setBestScore = function (score) {
    try {
        wx.setStorageSync(constant.STORAGE_BEST_KEY, score);
    } catch (e) { }
}

const setBoard = function (board) {
    try {
        wx.setStorageSync(constant.STORAGE_BOARD_KEY, board);
    } catch (e) { }
}

const  getGameData = function () {
    try {
        let score = wx.getStorageSync(constant.STORAGE_SCORE_KEY);
        let best = wx.getStorageSync(constant.STORAGE_BEST_KEY);
        let board = wx.getStorageSync(constant.STORAGE_BOARD_KEY);
        return {
            score: score || 0,
            best: best || 0,
            board: [
                [0, 0, 0, 2],
                [0, 4, 0, 0],
                [0, 4, 4, 0],
                [0, 4, 4, 2],
            ],
        }
    } catch (e) { }
}

module.exports = {
    setScore, setBestScore, setBoard, getGameData,
}