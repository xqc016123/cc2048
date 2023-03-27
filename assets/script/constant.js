module.exports = {
    MIN_TOCHE_MOVE_LENGTH: 50, // 最小识别手势响应的长度

    // 手势方向定义
    DIRECTION_NONE  : "none",
    DIRECTION_UP    : "up",
    DIRECTION_DOWN  : "down",
    DIRECTION_LEFT  : "left",
    DIRECTION_RIGHT : "right",

    // 移动动画时长：0.2s
    MOVE_DURATION  : 0.2,
    // 合并动画时常： 0.08s
    MERGE_DURATION : 0.12,

    // 最高分
    SCORE_BEST      : "最高分",
    // 得分
    SCORE_CUREENT   : "得分",

    GAME_PAUSE   : "菜单",
    GAME_RESTART : "重新开始",
    GAME_RANK    : "排行榜",
    GAME_REWARD  : "观看广告，清除一格",

    STORAGE_SCORE_KEY  : "2048_game_score_storage",
    STORAGE_BEST_KEY   : "2048_game_best_storage",
    STORAGE_BOARD_KEY  : "2048_game_board_storage",
    STORAGE_OVER_KEY   : "2048_game_over_storage",
    STORAGE_WON_KEY    : "2048_game_won_storage",
}