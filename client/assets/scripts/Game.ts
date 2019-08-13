import Player from "./Player";
import NetUtil from "./util/NetUtil";
import Direction from "./Direction";
import StepManager from "./StepManager";
import Command from "./Command";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Game extends cc.Component {
    @property(cc.Component)
    private players: Player[] = [];
    @property(cc.Component)
    private stepManager: StepManager = null;
    @property(cc.Node)
    private layoutNode: cc.Node = null;
    @property(cc.EditBox)
    private nameEdit: cc.EditBox = null;
    @property(cc.Node)
    private startNode: cc.Node = null;
    @property(cc.Node)
    private reconnectNode: cc.Node = null;
    @property(cc.Label)
    private hintLabel: cc.Label = null;
    private myName: string = null;
    private isStart: boolean = false;

    public onLoad() {
        this.listenEvent();
    }

    public onDestory() {
        this.removeEvent();
    }

    private listenEvent() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.startNode.on("click", this.onClickStart, this);
        this.reconnectNode.on("click", this.onClickReconnect, this);
    }

    private removeEvent() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.startNode.off("click", this.onClickStart, this);
        this.reconnectNode.off("click", this.onClickReconnect, this);
    }

    private onKeyDown(event: cc.Event.EventKeyboard) {
        if (!NetUtil.connected) return;

        let direction: number;
        switch (event.keyCode) {
        case cc.macro.KEY.up:
            direction = Direction.UP;
            break;
        case cc.macro.KEY.down:
            direction = Direction.DOWN;
            break;
        case cc.macro.KEY.left:
            direction = Direction.LEFT;
            break;
        case cc.macro.KEY.right:
            direction = Direction.RIGHT;
            break;
        case cc.macro.KEY.space:
            direction = Direction.STOP;
            break;
        default:
            return;
        }
        // 发指令
        let command: Command = new Command(undefined, direction, this.stepManager.stepTime);
        let route: string = "game.gameHandler.message";
        let msg: any = { command: command };
        NetUtil.notify(route, msg);
    }

    private onClickStart(event: cc.Event.EventCustom) {
        if (NetUtil.connected) {
            this.ready();
        } else {
            NetUtil.init(this.ready.bind(this));
        }
    }

    private onClickReconnect(event: cc.Event.EventCustom) {
        if (!this.isStart) return;

        let route: string = "game.gameHandler.getHistoryCommands";
        let msg: any = {};
        NetUtil.request(route, msg, (data: any) => {
            this.stepManager.reconnect(data.historyCommands);
        });
    }

    private onStart(data: any) {
        this.isStart = true;
        // 设置玩家名
        for (let i = 0; i < this.players.length; i++) {
            let isEnemy: boolean = (this.myName !== data.playerList[i]);
            this.players[i].setPlayerName(data.playerList[i], isEnemy);
        }
        // 显示提示
        this.hintLabel.string = "开始游戏";
        this.hintLabel.node.opacity = 255;
        let fadeOutAction: cc.Action = cc.fadeOut(3.0);
        this.hintLabel.node.runAction(fadeOutAction);
        // 开始收帧
        this.stepManager.startGame(data.stepInterval);
    }

    private onPlayerExit(data: any) {
        this.isStart = false;
        // 显示布局
        this.layoutNode.active = true;
        // 显示提示
        this.hintLabel.string = "游戏结束";
        this.hintLabel.node.opacity = 255;
        // 停止收帧
        this.stepManager.stopGame();
        // 初始化
        this.players.forEach((player: Player) => {
            player.init();
        });
    }

    private ready() {
        this.myName = this.nameEdit.string;
        // 隐藏布局
        this.layoutNode.active = false;
        // 显示提示
        this.hintLabel.string = "等待中……";
        this.hintLabel.node.opacity = 255;
        // 发送请求
        NetUtil.once("onStart", this.onStart, this);
        NetUtil.once("onPlayerExit", this.onPlayerExit, this);
        let route: string = "connector.entryHandler.ready";
        let msg: any = { uid: this.myName };
        NetUtil.notify(route, msg);
    }
}