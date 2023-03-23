import colors from  './colors';

cc.Class({
    extends: cc.Component,

    properties: {
        board: cc.Node, // 游戏面板
        blockPrefab: cc.Prefab,
        gap: 0,
        size: 4,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.setup();
        this.drawBoardGrid();
        this.initGame();
    },

    /**
     * 设置一些初始化信息
     */
    setup() {
        let width = cc.winSize.width;
        let height = cc.winSize.height;
        // 格子大小为屏幕宽度的20%
        this.blockSize = width * 0.2;
        // 间隔
        this.gap = width * 0.02;
        // 初始化棋盘容器
        this.setupBoardBackground(width, height);
    },

    /**
     * 初始化棋盘容器
     */
    setupBoardBackground(width, height) {
        this.board.width = width * 0.9;
        this.board.height = this.board.width;
        this.board.color = colors["BOARD"];
        this.board.setPosition(-width * 0.45, this.board.width / 2, 0);
    },

    /**
     * 绘制宫格
     */
    drawBoardGrid() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.drawBlock(j, i, 0);
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
        block.setPosition(
            (this.blockSize / 2 + this.gap) + (this.blockSize + this.gap) * x,
            -(this.blockSize / 2 + this.gap) - (this.blockSize + this.gap) * y, 0);
        block.getComponent("block").setNumber(number);
        this.board.addChild(block);
        return block;
    },

    /**
     * 初始化游戏，并根据情况添加数字方格
     */
    initGame() {
        this.blocks = [];
        this.data = [];
        for (let i = 0; i < this.size; i++) {
            this.blocks[i] = [];
            this.data[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.blocks[i][j] = null;
                this.data[i][j] = 0;
            }
        }

        this.addRandomBlock();
        this.addRandomBlock();
    },

    /**
     * 添加随机方格
     */
    addRandomBlock() {
        let loc = this.getRandomAvailableBlock();
        cc.log(loc);
        if (loc != null) {
            let number = this.getRandomNumber();
            this.blocks[loc.x][loc.y] = this.drawBlock(loc.x, loc.y, number);
            this.data[loc.x][loc.y] = number;
        }
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
    // update (dt) {},
});
