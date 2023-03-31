export default class Audio {

    static _audios = {};

    static preload() {
        ["won", "fail", "move"].forEach(e => {
            let filepath = "resources/" + e + ".wav";
            this.doLoadAudioInterval(e, filepath);
        });
    }

    static doLoadAudioInterval(audioType, resStr) {
        cc.loader.load(cc.url.raw(resStr), (err, audioClip) => {
            if (!err) {
                // 封装为AudioSource
                let audioSource = new cc.AudioSource();
                audioSource.clip = audioClip;
                // 缓存到音频池
                this._audios[audioType] = audioSource;
            }
        })
    }

    static control(audioType) {
        let audio = this._audios[audioType];
        if (audio) {
            audio.play();
        }
    }

}
