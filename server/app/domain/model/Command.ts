export default class Command {
    // 用户名
    public playerName: string;
    // 方向
    public direction: number;
    // 第几帧
    public stepTime: number;

    public constructor(playerName: string, direction: number, stepTime: number) {
        this.playerName = playerName;
        this.direction = direction;
        this.stepTime = stepTime;
    }
}