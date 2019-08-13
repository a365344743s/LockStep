import Direction from "./Direction";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {
    @property(cc.Label)
    private playerNameLabel: cc.Label = null;
    public direction: number = 0;
    private zeroPosition: cc.Vec2 = null;
    private static readonly DISTANCE = 200;

    public start() {
        this.zeroPosition = this.node.getPosition();
        this.init();
    }

    public move(dt: number) {
        switch (this.direction) {
        case Direction.UP:
            this.node.y += dt * Player.DISTANCE;
            break;
        case Direction.DOWN:
            this.node.y -= dt * Player.DISTANCE;
            break;
        case Direction.LEFT:
            this.node.x -= dt * Player.DISTANCE;
            break;
        case Direction.RIGHT:
            this.node.x += dt * Player.DISTANCE;
            break;
        }
    }

    public setPlayerName(name: string, isEnemy: boolean) {
        this.playerNameLabel.string = name;
        if (isEnemy) {
            this.playerNameLabel.node.color = cc.Color.RED;
        } else {
            this.playerNameLabel.node.color = cc.Color.GREEN;
        }
    }

    public getPlayerName(): string {
        return this.playerNameLabel.string;
    }

    public init() {
        this.direction = Direction.STOP;
        this.node.setPosition(this.zeroPosition);
    }
}