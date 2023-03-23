import colors from  'colors';
cc.Class({
    extends: cc.Component,

    properties: {
       numberLabel: cc.Label, // 数字Label
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    setNumber (number) {
        if (number == 0) {
            this.numberLabel.node.action = false;
            this.numberLabel.string = "";
        } else {
            this.numberLabel.string = number;
        }
        this.node.color = colors[number];
    },

    // update (dt) {},
});
