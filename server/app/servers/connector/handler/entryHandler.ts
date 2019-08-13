import { Application, FrontendSession, SessionService } from 'pinus';

export default function (app: Application) {
    return new Handler(app);
}

export class Handler {
    private app: Application = null;
    private sessionService: SessionService = null;

    public constructor(app: Application) {
        this.app = app;
        this.sessionService = app.get("sessionService");
    }

    /**
     * 准备完毕
     * @param msg
     * @param {} session
     * @returns {Promise<void>}
     */
    public async ready(msg: any, session: FrontendSession) {
        // 如果已经登录，移除之前的事件监听
        let uid: string = msg.uid;
        if (!! this.sessionService.getByUid(uid)) {
            session.removeAllListeners();
        }
        // 监听事件
        await session.abind(uid);
        session.on("closed", Handler.onClosed.bind(null, this.app));
        // 加入房间
        let channelName: string = await this.app.rpc.game.gameRemoter.add(session, uid, this.app.getServerId());
        session.set("rid", channelName);
        await session.apush("rid");
        await this.app.rpc.game.gameRemoter.start(session, channelName);
    }

    /**
     * 断开连接的监听
     * @param {} app
     * @param {} session
     * @returns {Promise<void>}
     */
    private static async onClosed(app: Application, session: FrontendSession) {
        if (!session || !session.uid) {
            return;
        }
        await app.rpc.game.gameRemoter.leave(session, session.uid, app.getServerId(), session.get("rid"));
    }
}