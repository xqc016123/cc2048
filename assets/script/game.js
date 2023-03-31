import colors from  './colors';
import constant from './constant';
import storage from './storage';
import Audio from "./audio";
import request from './request';

cc.Class({
    extends: cc.Component,

    properties: {
        board: cc.Node, // 游戏面板
        blockPrefab: cc.Prefab,
        dashboard: cc.Node, // 顶部消息模块
        startBtn: cc.Button, // 开始游戏按钮
        btnTitleLabel: cc.Label, // 开始按钮标题
        logoLabel: cc.Label, // 2048标题
        descripLabel: cc.RichText, // 描述文字
        scoreBoardPrefab: cc.Prefab, // 得分面板

        overlay: cc.Node, // 游戏失败弹窗
        // 游戏失败弹窗内容容器
        gameOver: cc.Node,
        gameOverClose: cc.Button,
        gameOverRestart: cc.Button,
        gameOverClear: cc.Button,
        // 游戏成功弹窗内容容器
        gameWon: cc.Node,
        gameWonClose: cc.Button,
        gameWonRestart: cc.Button,
        gameWonContinue: cc.Button,
        // 游戏菜单弹窗内容容器
        gameMenu: cc.Node,
        gameMenuClose: cc.Button,
        gameMenuNew: cc.Button,
        gameMenuVoice: cc.Button,
        gameMenuMode: cc.Button,
        gameMenuModeLabel: cc.Label,
        gameMenuVoiceLabel: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.setup();
        this.addTouchEventListener();
        this.addOnHide();
        Audio.preload();
        request.reportUser();
    },

    addOnHide() {
        if (this.isWxPlatform()) {
            const onHide = res => {
                storage.setScore(this.score);
                storage.setBestScore(this.best);
                storage.setBoard(this.data);
                storage.setIsGameOver(this.isGameOver);
                storage.setGameWon(this.won);
            };
            wx.onHide(onHide);
        }
    },

    start () {
        this.drawBoardGrid();
        this.updateStartBtnTitle();

        let width  = cc.winSize.width;
        let height = cc.winSize.height;
        this.setupDashBoard(width, height);
        this.setupBoardBackground(width, height);

        if (this.data !== null) {
            this.startGame(this.data);
        } else {
            this.restartGame();
        }
    },

    /**
     * 设置一些初始化信息
     */
    setup() {
        let data            = storage.getGameData();
        this.score          = data.score;
        this.best           = data.best;
        this.isGameOver     = data.isGameOver;
        this.won            = data.won;
        this.voiceOn        = data.voice;
        this.size           = data.size;
        this.data           = data.board;
        this.topSpacing     = this.getMenuButtonBoundingRect();
        this.caculateBlockFrame();
    },

    caculateBlockFrame() {
        let width      = cc.winSize.width;
        this.blockSize = width * 0.9 / ((this.size + 1) + this.size * 10) * 10;
        this.gap       = this.blockSize / 10;
    },

    isWxPlatform() {
        return cc.sys.platform === cc.sys.WECHAT_GAME;
    },

    /**
     * 获取微信小程序顶部胶囊区域高度
     */
    getMenuButtonBoundingRect() {
        if (this.isWxPlatform()) {
            const systemInfo = wx.getSystemInfoSync();
            // 胶囊按钮位置信息
            const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
            // 导航栏高度 = 状态栏到胶囊的间距（胶囊上坐标位置-状态栏高度） * 2 + 胶囊高度 + 状态栏高度
            if (systemInfo.system.indexOf('iOS') > -1) {
                return (menuButtonInfo.height + 12) * cc.winSize.height / systemInfo.screenHeight;
            } else {
                return (menuButtonInfo.height + 16) * cc.winSize.height / systemInfo.screenHeight;
            }
        } else {
            return 0;
        }
    },

    /**
     * 初始化数据面板
     */
    setupDashBoard(width, height) {
        this.logoLabel.node.setPosition(0, -10, 0);

        this.descripLabel.node.setPosition(0, -this.logoLabel.node.y - this.logoLabel.lineHeight - 18, 0);

        this.startBtn.node.width = width * 0.24;
        this.btnTitleLabel.string = constant.GAME_PAUSE;
        this.startBtn.node.height = this.startBtn.node.width / 3;
        this.startBtn.node.setPosition(
            width * 0.9 - this.startBtn.node.width,
            this.descripLabel.node.y - this.descripLabel.node.height / 2 + this.startBtn.node.height / 2, 0);

        this.dashboard.width = width * 0.9;
        this.dashboard.height = Math.abs(this.descripLabel.node.y - this.descripLabel.node.height + 6);
        this.dashboard.color = colors["BACKGROUND"];
        this.dashboard.setPosition(-0.45 * width, height / 2 - this.topSpacing, 0);

        // 添加最高分
        let bestScore = this.addScoreBoard(width);
        bestScore.getComponent("scoreBoard").setTitle(constant.SCORE_BEST);
        bestScore.setPosition(this.dashboard.width - bestScore.width / 2, - bestScore.height / 2, 0);
        this.bestScore = bestScore;
        this.updateBestScore(this.best);

        // 添加得分
        let currentScore = this.addScoreBoard(width);
        currentScore.getComponent("scoreBoard").setTitle(constant.SCORE_CUREENT);
        currentScore.setPosition(this.dashboard.width - currentScore.width * 1.5 - 12, - bestScore.height / 2, 0);
        this.curScore = currentScore;
        this.updateCurrentScore(this.score, false);
    },

    updateBestScore(score) {
        this.bestScore.getComponent("scoreBoard").setScore(score, false);
    },

    updateCurrentScore(score, animation) {
        this.curScore.getComponent("scoreBoard").setScore(score, animation);
    },

    /**
     * 更新开始游戏按钮的标题
     */
    updateStartBtnTitle() {
        if (this.isGameOver) {
            this.btnTitleLabel.string = constant.GAME_RESTART;
        } else {
            this.btnTitleLabel.string = constant.GAME_PAUSE;
        }
    },

    addScoreBoard(width) {
        let instance = cc.instantiate(this.scoreBoardPrefab);
        instance.width =  width * 0.22;
        instance.height = width * 0.11;
        this.dashboard.addChild(instance)
        return instance;
    },

    /**
     * 初始化棋盘容器
     */
    setupBoardBackground(width, height) {
        this.board.width = width * 0.9;
        this.board.height = this.board.width;
        this.board.color = colors["BOARD"];
        this.board.setPosition(
            -width * 0.45,
            height / 2 - this.dashboard.height - this.topSpacing - 12, 0);
    },

    /**
     * 绘制宫格
     */
    drawBoardGrid() {
        this.grid = [];
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = this.drawBlock(j, i, 0);
            }
        }
    },

    /**
     * 绘制一个格子
     */
    drawBlock(x, y, number) {
        let block = cc.instantiate(this.blockPrefab);
        block.width = this.blockSize;
        block.height = this.blockSize;
        let position = this.getPosition({x: x, y: y});
        block.setPosition(position.x, position.y, 0);
        block.getComponent("block").setNumber(number);
        this.board.addChild(block);
        return block;
    },

    /**
     * 通过坐标系位置，获取屏幕位置
     */
    getPosition(location) {
        return {
            x: (this.blockSize / 2 + this.gap) + (this.blockSize + this.gap) * location.x,
            y: -(this.blockSize / 2 + this.gap) - (this.blockSize + this.gap) * location.y
        };
    },

    /**
     * 新游戏
     */
    restartGame(modeChange) {
        this.isGameOver = false;
        this.score = 0;
        this.updateCurrentScore(this.score);
        this.clearExistBlocks();

        if (modeChange === true) {
            this.caculateBlockFrame();
            this.clearBoardGrid();
            this.drawBoardGrid();
            this.updateStartBtnTitle();
        }

        this.blocks = [];
        this.data = [];
        for (let y = 0; y < this.size; y++) {
            this.blocks[y] = [];
            this.data[y] = [];
            for (let x = 0; x < this.size; x++) {
                this.blocks[y][x] = null;
                this.data[y][x] = 0;
            }
        }

        this.addRandomBlock(false);
        this.addRandomBlock(false);
    },

    clearBoardGrid() {
        this.grid.forEach(rows => {
           rows.forEach(emptyBlock => {
               emptyBlock.destroy();
           });
        });
        this.grid = null;
    },

    /**
     * 清除之前的内容
     */
    clearExistBlocks() {
        if (Array.isArray(this.blocks)) {
            this.blocks.forEach(rows => {
                if (Array.isArray(rows)) {
                    rows.forEach(block => {
                        if (block) {
                            block.destroy();
                        }
                    });
                }
            });
        }
    },

    /**
     * 根据缓存开始新游戏
     */
    startGame(board) {
        this.score = 0;

        this.data = board;
        this.blocks = [];
        for (let y = 0; y < this.size; y++) {
            this.blocks[y] = [];
            for (let x = 0; x < this.size; x++) {
                if (this.data[y][x] === 0) {
                    this.blocks[y][x] = null;
                } else {
                    this.blocks[y][x] = this.addExistBlock(this.data[y][x], x, y);
                }
            }
        }
    },

    /**
     * 添加随机方格
     */
    addRandomBlock(animation) {
        let loc = this.getRandomAvailableBlock();
        if (loc != null) {
            let number = this.getRandomNumber();
            let block = this.drawBlock(loc.x, loc.y, number);
            if (animation) {
                block.scale = 0.8;
                cc.tween(block)
                    .to(constant.MERGE_DURATION, { scale: 1 })
                    .start();
            }
            this.blocks[loc.y][loc.x] = block;
            this.data[loc.y][loc.x] = number;
        }
    },

    /**
     * 添加已存在的方格
     */
    addExistBlock(number, x, y) {
        return this.drawBlock(x, y, number);
    },

    /**
     * 获取所有可用的格子的坐标
     */
    getAvailableBlockLocations() {
        let locations = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.blocks[i][j] == null) {
                    locations.push({ x: j, y: i });
                }
            }
        }
        return locations;
    },

    /**
     * 返回随机的可用方格位置信息
     */
    getRandomAvailableBlock() {
        let availableLocations = this.getAvailableBlockLocations();
        if (availableLocations.length > 0) {
            let randomIndex = Math.floor(Math.random() * availableLocations.length);
            return availableLocations[randomIndex];
        }
        return null;
    },

    /**
     * 获取2或4的随机数
     */
    getRandomNumber() {
        return Math.random() < 0.9 ? 2 : 4;
    },

    /**
     * 添加手势事件
     */
    addTouchEventListener() {
        // 触摸开始
        this.board.on("touchstart", (event) => {
            this.startPoint = event.getLocation();
        });

        // 触摸被取消
        this.board.on("touchcancel", (event) => {
            this.touchEnd(event);
        });

        // 触摸结束
        this.board.on("touchend", (event) => {
            this.touchEnd(event);
        });

        // 开始游戏按钮点击事件
        this.startBtn.node.on("click", () => {
            this.onStartClick();
        });

        // 关闭
        this.gameOverClose.node.on("click", () => {
           this.onCloseTapped(this.gameOver);
        });
        this.gameWonClose.node.on("click", () => {
            this.onCloseTapped(this.gameWon);
        });
        this.gameWonContinue.node.on("click", () => {
            this.onCloseTapped(this.gameWon);
        });
        this.gameMenuClose.node.on("click", () => {
            this.onCloseTapped(this.gameMenu);
        });

        // 重新开始
        this.gameOverRestart.node.on("click", () => {
            this.onRestartTapped(this.gameOver);
        });
        this.gameWonRestart.node.on("click", () => {
            this.onRestartTapped(this.gameWon);
        });
        this.gameMenuNew.node.on("click", () => {
            this.onRestartTapped(this.gameMenu);
        });

        // 音效
        this.gameMenuVoice.node.on("click", () => {
           this.onVoiceTapped(this.gameMenu);
        });

        // 模式
        this.gameMenuMode.node.on("click", () => {
            this.onModeTapped(this.gameMenu);
        });
    },

    /**
     * 处理触摸结束
     */
    touchEnd(event) {
        let endPoint = event.getLocation();
        let vec = endPoint.sub(this.startPoint);
        let direction = constant.DIRECTION_NONE;
        if (vec.mag() >= constant.MIN_TOCHE_MOVE_LENGTH) {
            if (Math.abs(vec.x) > Math.abs(vec.y)) { // 水平移动
                if (vec.x > 0) {
                    direction = constant.DIRECTION_RIGHT;
                } else {
                    direction = constant.DIRECTION_LEFT;
                }
            } else { // 垂直移动
                if (vec.y > 0) {
                    direction = constant.DIRECTION_UP;
                } else {
                    direction = constant.DIRECTION_DOWN;
                }
            }
        }

        if (direction != constant.DIRECTION_NONE) {
            this.move(direction);
        }
    },

    move(direction) {
        if (this.moving != null && this.moving == true && this.isGameOver) {
            return;
        }

        this.moving    = true;
        let vector     = this.getVector(direction);
        let traversals = this.getTraversals(vector);
        this.mergedBlockLocations = [];
        let moved                 = false;
        traversals.x.forEach(x => {
            traversals.y.forEach(y => {
                let location = { x: x, y: y };
                if (!this.locationAvailable(location)) { // 位置不可用代表这里有方格，可能需要移动
                    let movable = this.findFarthestLocation(location, vector);
                    let next    = movable.next;
                    let block   = this.getBlock(location);

                    // 判断是否需要合并
                    if (this.withinBounds(next) && this.canMerge(location, next)) {
                        this.mergeBlocks(block, location, movable.farthest, movable.next, vector);
                        moved = true;
                    } else {
                        if (!this.locationEquals(location, movable.farthest)) {
                            this.moveBlock(block, location, movable.farthest);
                            moved = true;
                        }
                    }
                }
            });
        });

        if (moved && this.voiceOn) {
            Audio.control("move");
        }

        this.scheduleOnce(() => {
            this.moving = false;
            if (moved) {
                this.afterMoved();
            }
        }, constant.MOVE_DURATION);
    },

    moveBlock(block, location, farthest, callback) {
        this.blocks[location.y][location.x] = null;
        this.blocks[farthest.y][farthest.x] = block;

        let number = this.data[location.y][location.x];
        this.data[location.y][location.x] = 0;
        this.data[farthest.y][farthest.x] = number;

        let position = this.getPosition(farthest);
        let action = cc.moveTo(constant.MOVE_DURATION, position);
        let finish = cc.callFunc(() => {
            callback && callback();
        });
        block.runAction(cc.sequence(action, finish));
    },

    mergeBlocks(block, location, farthest, next, vector) {
        this.data[next.y][next.x]           *= 2;
        this.score                          += Math.log2(this.data[next.y][next.x]);
        this.data[location.y][location.x]    = 0;
        this.blocks[location.y][location.x]  = null;
        if (this.best < this.score) {
            this.best = this.score;
        }
        this.mergedBlockLocations.push(`${next.x}-${next.y}`);

        if (this.won === false) {
            this.won = this.data[next.y][next.x] === 2048;
        }

        let nextBlock = this.getBlock(next);
        nextBlock.zIndex = 1;

        // 执行合并步骤
        let doMergeStep = () => {
            let position = this.getPosition(next);
            // 执行缩放动画
            let scaleAction1 = cc.scaleTo(constant.MERGE_DURATION / 2, 1.1, 1.1);
            let scaleAction2 = cc.scaleTo(constant.MERGE_DURATION / 2, 1, 1);
            nextBlock.runAction(cc.sequence(scaleAction1, scaleAction2));
            nextBlock.getComponent("block").setNumber(this.data[next.y][next.x]);

            // 合并完成
            let finish = cc.callFunc(() => {
                this.board.removeChild(block);
                nextBlock.zIndex = 0;
            });
            let move = cc.moveTo(constant.MERGE_DURATION, position);
            block.runAction(cc.sequence(move, finish));
        };

        let moveBeforeMerge = this.shouldMoveBeforeMerge(farthest, next, vector);
        if (moveBeforeMerge) {
            this.moveBlock(block, location, farthest, doMergeStep);
        } else {
            doMergeStep();
        }
    },

    /**
     * 一次手势后的处理
     */
    afterMoved() {
        this.updateBestScore(this.best);
        this.updateCurrentScore(this.score, true);
        this.addRandomBlock(true);
        this.isGameOver = this.checkGameOver();
        if (this.isGameOver) {
            Audio.control("fail");
            this.updateStartBtnTitle();
            this.showLoseBoard();
        } else if (this.won) {
            Audio.control("won");
            this.showWonBoard();
        }
    },

    /**
     * 检查游戏是否结束
     */
    checkGameOver() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                let number = this.data[y][x];
                if (number === 0) {
                    // 只要有空格，游戏就没结束
                    return false;
                }
                [constant.DIRECTION_UP, constant.DIRECTION_RIGHT, constant.DIRECTION_LEFT, constant.DIRECTION_DOWN]
                    .forEach(direction => {
                        let vector = this.getVector(direction);
                        let location = { x: x + vector.x, y: y + vector.y };
                        if (this.locationAvailable(location)) {
                            if (number === this.data[location.y][location.x]) {
                                // 四个方向上只有有相同的，游戏就没有结束
                                return  false;
                            }
                        }
                    });
            }
        }
        return true;
    },

    /**
     * 是否需要在merge前执行move操作
     */
    shouldMoveBeforeMerge(farthest, next, vector) {
        if (vector.x != 0) {
            return Math.abs(next.x - farthest.x) > 1;
        } else if (vector.y != 0) {
            return Math.abs(next.x - farthest.x) > 1;
        }
    },

    /**
     * 更具当前坐标获取方格
     */
    getBlock(location) {
        return this.blocks[location.y][location.x];
    },

    /**
     * 两个坐标位置的方格是否可以合并
     */
    canMerge(location, next) {
        return this.data[location.y][location.x] == this.data[next.y][next.x] &&
               this.mergedBlockLocations.indexOf(`${next.x}-${next.y}`) === -1;
    },

    /**
     * 获取移动方向的向量
     */
    getVector(direction) {
        switch (direction) {
            case constant.DIRECTION_UP:
                return { x: 0, y: -1 };
            case constant.DIRECTION_RIGHT:
                return { x: 1, y: 0 };
            case constant.DIRECTION_DOWN:
                return { x: 0, y: 1 };
            case constant.DIRECTION_LEFT:
                return { x: -1, y: 0 };
        }
    },

    /**
     * 获取遍历方向
     * 例如：向移动，x应该以3,2,1,0的方向进行遍历
     */
    getTraversals(vector) {
        let traversals = { x: [], y: [] };

        for (let pos = 0; pos < this.size; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }

        if (vector.x == 1) traversals.x = traversals.x.reverse();
        if (vector.y == 1) traversals.y = traversals.y.reverse();

        return traversals;
    },

    /**
     * 找到方格在移动方向上的最远的移动距离
     */
    findFarthestLocation(location, vector) {
        let previous;

        do {
            previous = location;
            location = { x: previous.x + vector.x, y: previous.y + vector.y };
        } while (this.locationAvailable(location));

        return {
            farthest: previous,
            next: location
        };
    },

    /**
     * 当前位置是否在棋盘允许范围内
     */
    withinBounds(location) {
        return location.x >= 0 && location.x < this.size &&
               location.y >= 0 && location.y < this.size;
    },

    /**
     * 看当前位置是否可用
     */
    locationAvailable(location) {
        if (this.withinBounds(location)) {
            return this.getBlock(location) == null;
        }
        return false;
    },

    /**
     * 判断两个坐标系是否相同
     */
    locationEquals(first, second) {
        return first.x == second.x && first.y == second.y;
    },

    /**
     * 开始游戏按钮点击事件
     */
    onStartClick() {
        if (this.isGameOver) {
            this.restartGame();
        } else {
            this.showMenuBoard();
        }
    },

    /**
     * 弹出菜单面板
     */
    showMenuBoard() {
        this.gameMenuModeLabel.string = this.size === 4 ? constant.MODE_NORMAL : constant.MODE_HARD;
        this.gameMenuVoiceLabel.string = this.voiceOn ? constant.VOICE_OFF : constant.VOICE_ON;
        this.popupBoardAnimation(this.overlay, this.gameMenu);
    },

    /**
     * 弹出2048面板
     */
    showWonBoard() {
        this.popupBoardAnimation(this.overlay, this.gameWon);
    },

    /**
     * 弹出失败面板
     */
    showLoseBoard() {
        this.popupBoardAnimation(this.overlay, this.gameOver);
    },

    popupBoardAnimation(overlay, content) {
        overlay.active = true;
        content.active = true;
        let opAction = cc.fadeTo(constant.MERGE_DURATION, 140);
        let scaleAction = cc.scaleTo(constant.MERGE_DURATION, 1);
        let copAction = cc.fadeTo(constant.MERGE_DURATION, 255);
        overlay.runAction(opAction);
        content.runAction(cc.spawn(copAction, scaleAction));
    },

    dismissPopBoardAnimation(overlay, content, callback) {
        let opAction = cc.fadeTo(constant.MERGE_DURATION, 0);
        let scaleAction = cc.scaleTo(constant.MERGE_DURATION, 0.5);
        let copAction = cc.fadeTo(constant.MERGE_DURATION, 0);
        let finish = cc.callFunc(() => {
            overlay.active = false;
            content.active = false;
            callback && callback();
        });
        overlay.runAction(cc.sequence(opAction, finish));
        content.runAction(cc.spawn(scaleAction, copAction));
    },

    onCloseTapped(content) {
        this.dismissPopBoardAnimation(this.overlay, content);
    },

    onRestartTapped(content) {
        this.dismissPopBoardAnimation(this.overlay, content, () => {
            this.restartGame();
        });
    },

    onVoiceTapped(content) {
        this.voiceOn = !this.voiceOn;
        console.log(`voiceOn = ${this.voiceOn}`);
        storage.setVoice(this.voiceOn);
        // 关闭音乐
        this.dismissPopBoardAnimation(this.overlay, content);
    },

    onModeTapped(content) {
        this.size = this.size === 4 ? 5 : 4;
        storage.setSize(this.size);
        this.dismissPopBoardAnimation(this.overlay, content, () => {
            this.restartGame(true);
        });
    },

    /**
     * 随机清除一格
     */
    clearRandomBlock() {

    },

    // update (dt) {},
});
