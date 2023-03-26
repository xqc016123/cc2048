import constant from './constant';

cc.Class({
    extends: cc.Component,

    properties: {
        titleLabel: cc.Label,
        scoreLabel: cc.Label,
        scoreAnimLabel: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    setTitle(title) {
        this.titleLabel.string = title;
    },

    setScore(score, animation) {
        if (animation) {
            let curScore = this.scoreLabel.string;
            if (curScore == score) return;
            this.scoreLabel.string = score;
            this.scoreAnimLabel.string = `+${score - curScore}`;

            let opAction = cc.fadeTo(constant.MERGE_DURATION, 255);
            let position = {
                x: this.scoreLabel.node.x,
                y: this.scoreLabel.node.y + 50,
            };
            let moveAction = cc.moveBy(constant.MERGE_DURATION, position);
            let scaleAction = cc.scaleTo(constant.MERGE_DURATION, 1.4, 1.4);
            let finish = cc.callFunc(() => {
                this.scoreAnimLabel.node.opacity = 0;
                this.scoreAnimLabel.node.y = this.scoreLabel.node.y;
                this.scoreAnimLabel.node.scale = 1;
            });
            this.scoreAnimLabel.node.runAction(cc.sequence(cc.spawn(opAction, moveAction, scaleAction), finish));
        } else {
            this.scoreLabel.string = score;
        }
    },

    // update (dt) {},
});
