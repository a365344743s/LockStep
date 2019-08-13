import { Channel } from 'pinus';
import Room from "./model/Room";
import consts from "../util/consts";
import Command from "./model/Command";

export default class Updater {
    // 分割房间
    private static rooms: Map<string, Room> = new Map<string, Room>();
    // 上次更新时间（用来控制update更新）
    private static lateUpdate: number = 0;

    /**
     * 添加房间
     * @param {} channel
     */
    public static addRoom(channel: Channel) {
        let room: Room = new Room(channel);
        this.rooms.set(channel.name, room);
    }

    /**
     * 移除房间
     * @param {} channel
     */
    public static removeRoom(channel: Channel) {
        this.rooms.delete(channel.name);
    }

    /**
     * 添加命令
     * @param {string} channelName
     * @param command
     */
    public static addCommand(channelName: string, command: Command) {
        let room: Room = this.rooms.get(channelName);
        room.commands.push(command);
    }

    /**
     * 获取历史命令
     * @param {string} channelName
     * @returns {Command[][]}
     */
    public static getHistoryCommands(channelName: string) {
        return this.rooms.get(channelName).historyCommands;
    }

    /**
     * 初始化
     */
    public static init() {
        this.lateUpdate = Date.now();
        setInterval(() => {
            let now: number = Date.now();
            let dt: number = now - this.lateUpdate;
            this.lateUpdate = now;
            this.update(dt);
        }, 0);
    }

    private static update(dt: number) {
        if (this.rooms.size <= 0) return;
        // 遍历房间来更新帧
        this.rooms.forEach((room: Room) => {
            // 大于一帧的间隔
            room.stepUpdateTime += dt;
            if (room.stepUpdateTime >= consts.STEP_INTERVAL) {
                room.stepUpdateTime -= consts.STEP_INTERVAL;
                room.stepTime++;
                this.stepUpdate(room);
            }
        });
    }

    /**
     * 更新一帧
     * @param {Room} room
     */
    private static stepUpdate(room: Room) {
        // 过滤指令
        let uids: string[] = room.channel.getMembers();
        let commands: Command[] = [];
        for (let uid of uids) {
            commands.push(new Command(uid, undefined, room.stepTime));
        }
        for (let roomCommand of room.commands) {
            for (let command of commands) {
                if (roomCommand.playerName === command.playerName) {
                    command.direction = roomCommand.direction;
                }
            }
        }
        // 记录到历史指令（用于重连）
        room.historyCommands.push(commands);
        room.commands = [];
        // 发帧
        room.channel.apushMessage("onMessage", { commands: commands });
    }
}