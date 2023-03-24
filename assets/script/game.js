import colors from  './colors';
import constant from './constant';

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
        this.addTouchEventListener();
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
     * 初始化游戏，并根据情况添加数字方格
     */
    initGame() {
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

    /**
     * 添加随机方格
     */
    addRandomBlock(animation) {
        let loc = this.getRandomAvailableBlock();
        if (loc != null) {
            let number = 819210;// this.getRandomNumber();
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
        if (this.moving != null && this.moving == true) {
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
        this.data[location.y][location.x]    = 0;
        this.blocks[location.y][location.x]  = null;
        this.mergedBlockLocations.push(`${next.x}-${next.y}`);

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
        cc.log(this.data);
        cc.log(this.blocks);
        this.addRandomBlock(true);
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





    // update (dt) {},
});
