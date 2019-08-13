import { Application, BackendSession } from 'pinus';
import Updater from "../../../domain/Updater";
import Command from "../../../domain/model/Command";
import consts from "../../../util/consts";

export default function (app: Application) {
    return new Handler(app);
}

export class Handler {
    private app: Application = null;

    public constructor(app: Application) {
        this.app = app;
    }

    public async message(msg: any, session: BackendSession) {
        let command: Command = msg.command;
        command.playerName = session.uid;
        Updater.addCommand(session.get("rid"), command);
    }

    public async getHistoryCommands(msg: any, session: BackendSession) {
        let historyCommands: Command[][] = Updater.getHistoryCommands(session.get("rid"));
        return { code: consts.code.OK, historyCommands: historyCommands };
    }
}