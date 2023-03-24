import colors from './colors';

cc.Class({
    extends: cc.Component,

    properties: {
        numberLabel: cc.Label, // 数字Label
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
    },

    setNumber(number) {
        if (number == 0) {
            this.numberLabel.node.action = false;
            this.node.opacity = 89; // 设置透明度
        }
        this.numberLabel.string = number == 0 ? "" : number;
        this.node.color = colors[number <= 2048 ? number : "SUPER"]; // 背景色
        this.numberLabel.node.color = colors[number <= 4 ? "TEXT_S" : "TEXT_B"]; // 字体颜色
        this.numberLabel.fontSize = this.getFontSize(number); // 字号
    },

    getFontSize(number) {
        if (number < 100) {
            return 60;
        } else if (number < 1000) {
            return 56;
        } else if (number < 10000) {
            return 44;
        } else if (number < 100000) {
            return 38;
        } else if (number < 1000000) {
            return 32;
        }
        return 20;
    }

    // update (dt) {},
});
