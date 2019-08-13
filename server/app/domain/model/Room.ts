import { Channel } from 'pinus';
import Command from "./Command";

export default class Room {
    public channel: Channel = null;
    // 第几帧
    public stepTime: number = 0;
    // 这帧执行了多久
    public stepUpdateTime: number = 0;
    // 当前命令
    public commands: Command[] = [];
    // 历史命令
    public historyCommands: Command[][] = [];

    public constructor(channel: Channel) {
        this.channel = channel;
    }
}