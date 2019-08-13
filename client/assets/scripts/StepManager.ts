import NetUtil from "./util/NetUtil";
import Player from "./Player";
import Command from "./Command";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StepManager extends cc.Component {
    @property(cc.Component)
    private players: Player[] = [];
    // 是否正在追帧
    private isFastRunning: boolean;
    // 正在执行帧的剩余时间（秒）
    private restRunningSecond: number;
    // 收了几帧
    public stepTime: number;
    // 帧间隔
    private stepInterval: number;
    // 收到的命令帧
    private receiveCommands: Command[][];
    // 正在执行的命令帧
    private runningCommands: Command[];

    public startGame(stepInterval: number) {
        this.stepInterval = stepInterval;
        this.stepTime = 0;
        this.receiveCommands = [];
        this.runningCommands = null;
        NetUtil.on("onMessage", this.onMessage, this);
    }

    public stopGame() {
        NetUtil.off("onMessage", this.onMessage, this);
    }

    public reconnect(historyCommands: Command[][]) {
        // 初始化
        this.players.forEach((player: Player) => {
            player.init();
        });
        this.receiveCommands = historyCommands;
    }

    public update(dt: number) {
        // 如果有收到帧
        if (this.receiveCommands && (this.receiveCommands.length > 0)) {
            // 超过3帧就追帧
            let scale: number = Math.ceil(this.receiveCommands.length / 3);
            if (scale > 10) scale = 10;
            this.isFastRunning = (scale > 1);

            let ms: number = dt * scale;
            // 取帧
            if (this.runningCommands == null) {
                this.runningCommands = this.receiveCommands[0];
                this.restRunningSecond = this.stepInterval / 1000;
                console.log("run " + this.runningCommands[0].stepTime + " step");
            }
            // 执行时间不能大于剩余时间
            if (ms > this.restRunningSecond) {
                ms = this.restRunningSecond;
            }
            // 查看帧中是否有指令
            for (let command of this.runningCommands) {
                if (command.direction == undefined) continue;
                // 改变方向
                for (let player of this.players) {
                    if (player.getPlayerName() === command.playerName) {
                        player.direction = command.direction;
                    }
                }
            }
            // 移动
            for (let player of this.players) {
                player.move(ms);
            }
            // 是否执行完了一帧
            this.restRunningSecond -= ms;
            if (this.restRunningSecond <= 0) {
                this.runningCommands = null;
                this.receiveCommands.shift();
            }
        }
    }

    private onMessage(data: any) {
        let commands: Command[] = data.commands;
        this.stepTime = commands[commands.length - 1].stepTime;
        this.receiveCommands.push(commands);
        console.log("receive " + this.stepTime + " step");
    }
}