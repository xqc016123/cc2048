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

const setIsGameOver = function (isGameOver) {
    try {
        wx.setStorageSync(constant.STORAGE_BEST_KEY, isGameOver);
    } catch (e) { }
}

const setGameWon = function (gameWon) {
    try {
        wx.setStorageSync(constant.STORAGE_WON_KEY, gameWon);
    } catch (e) { }
}

const setBoard = function (board) {
    try {
        wx.setStorageSync(constant.STORAGE_BOARD_KEY, board);
    } catch (e) { }
}

const setSize = function (size) {
    try {
        wx.setStorageSync(constant.STORAGE_SIZE_KEY, size);
    } catch (e) { }
}

const  setVoice = function (isOpen) {
    try {
        wx.setStorageSync(constant.STORAGE_VOICE_KEY, isOpen);
    } catch (e) { }
}

const  getGameData = function () {
    try {
        let score = wx.getStorageSync(constant.STORAGE_SCORE_KEY);
        let best = wx.getStorageSync(constant.STORAGE_BEST_KEY);
        let board = wx.getStorageSync(constant.STORAGE_BOARD_KEY);
        if (board === "") {
            board = null;
        }
        let isGameOver = wx.getStorageSync(constant.STORAGE_OVER_KEY);
        let won = wx.getStorageSync(constant.STORAGE_WON_KEY);
        let size = wx.getStorageSync(constant.STORAGE_SIZE_KEY);
        let voice = wx.getStorageSync(constant.STORAGE_VOICE_KEY);
        return {
            score: score || 0,
            best: best || 0,
            board: board,
            isGameOver: isGameOver || false,
            won: won || false,
            size: size || 4,
            voice: voice || true,
        }
    } catch (e) { }
}

module.exports = {
    setScore, setBestScore, setBoard, setIsGameOver, setGameWon, setSize, setVoice, getGameData,
}