import { Application, FrontendSession, bindRemoterMethod, RemoterClass, Channel, ChannelService } from 'pinus';
import Util from "../../../util/util";
import consts from "../../../util/consts";
import Updater from "../../../domain/Updater";
import Command from "../../../domain/model/Command";

export default function (app: Application) {
    return new Remoter(app);
}

// UserRpc的命名空间自动合并
declare global {
    interface UserRpc {
        game: {
            // 一次性定义一个类自动合并到UserRpc中
            gameRemoter: RemoterClass<FrontendSession, Remoter>;
        };
    }
}

export class Remoter {
    private app: Application = null;
    private channelService: ChannelService = null;
    // 正在等待的channelname
    private waitingChannelName: string = null;

    public constructor(app: Application) {
        this.app = app;
        this.channelService = app.get("channelService");
    }

    /**
     * 加入游戏
     * @param {string} uid
     * @param {string} sid
     * @returns {Promise<string>}
     */
    public async add(uid: string, sid: string) {
        let channel: Channel = this.getChannel();
        channel.add(uid, sid);
        // 人数够不够开始游戏
        let uids: string[] = channel.getMembers();
        if (uids.length >= consts.ROOM_PLAYER_COUNT) {
            this.waitingChannelName = null;
        }

        return channel.name;
    }

    /**
     * 离开游戏
     * @param {string} uid
     * @param {string} sid
     * @param {string} rid
     * @returns {Promise<void>}
     */
    public async leave(uid: string, sid: string, rid: string) {
        let channel: Channel = this.channelService.getChannel(rid, false);
        if (!channel) return;

        if (channel.name === this.waitingChannelName) {
            this.waitingChannelName = null;
        } else {
            await channel.apushMessage("onPlayerExit", {});
        }
        channel.destroy();
        Updater.removeRoom(channel);

        return;
    }

    /**
     * 开始游戏
     * @param {string} rid
     * @returns {Promise<void>}
     */
    public async start(rid: string) {
        let channel: Channel = this.channelService.getChannel(rid, false);
        let uids: string[] = channel.getMembers();
        if (uids.length >= consts.ROOM_PLAYER_COUNT) {
            // 随机排序
            uids.sort((a: string, b: string) => {
                return Math.random() > 0.5 ? 1 : -1
            });
            await channel.apushMessage("onStart", {
                playerList: uids,
                stepInterval: consts.STEP_INTERVAL
            });
            Updater.addRoom(channel);
        }
        return;
    }

    /**
     * 获取可用的channel
     * @returns {}
     */
    private getChannel(): Channel {
        let channel: Channel;
        // 有等待中的channel
        if (this.waitingChannelName) {
            channel = this.channelService.getChannel(this.waitingChannelName, false);
        } else {
            // 生成channel name
            let name: string = Util.makeId(8);
            while (this.channelService.getChannel(name, false)) {
                name = Util.makeId(8);
            }
            // 创建channel
            channel = this.channelService.getChannel(name, true);
            this.waitingChannelName = name;
        }

        return channel;
    }
}