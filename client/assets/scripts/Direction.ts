const {ccclass, property} = cc._decorator;

@ccclass
export default class Direction extends cc.Component {
    public direction: number = Direction.STOP;
    public static readonly STOP = 0;
    public static readonly UP = 1;
    public static readonly DOWN = 2;
    public static readonly LEFT = 3;
    public static readonly RIGHT = 4;
}