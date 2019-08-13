const CONNECTION_CONFIG = {
    host: "127.0.0.1",
    port: "3010",
    log: true
};

/**
 * 网络工具类
 */
export default class NetUtil {
    // 是否已连接
    public static connected: boolean = false;

    /**
     * 初始化
     * @param callback 初始化完成的回调方法
     */
    public static init(callback: Function) {
        if (!this.connected) {
            this.connected = true;
            window["pomelo"].init(CONNECTION_CONFIG, callback);
        }
    }

    /**
     * 断开连接
     */
    public static disconnect() {
        if (this.connected) {
            this.connected = false;
            window["pomelo"].disconnect();
        }
    }

    /**
     * 监听一次性事件
     * @param eventName 事件名
     * @param callback callback(data)回调方法
     * @param target 绑定的self
     */
    public static once(eventName: string, callback: Function, target?: any) {
        if (this.connected) {
            window["pomelo"].once(eventName, callback, target);
        }
    }

    /**
     * 监听事件
     * @param eventName 事件名
     * @param callback callback(data)回调方法
     * @param target 绑定的self
     */
    public static on(eventName: string, callback: Function, target?: any) {
        if (this.connected) {
            window["pomelo"].on(eventName, callback, target);
        }
    }

    /**
     * 取消监听事件
     * @param eventName 事件名
     * @param callback callback(data)回调方法
     * @param target 绑定的self
     */
    public static off(eventName: string, callback: Function, target?: any) {
        if (this.connected) {
            window["pomelo"].off(eventName, callback, target);
        }
    }

    /**
     * 发送request
     * @param route 要发送request信息的handler
     * @param data 要发送的数据
     * @param callback callback(data)回调方法
     */
    public static request(route: string, data: Object, callback: Function) {
        if (this.connected) {
            window["pomelo"].request(route, data, callback);
        }
    }

    /**
     * 发送notify
     * @param route 要发送request信息的handler
     * @param data 要发送的数据
     */
    public static notify(route: string, data: Object) {
        if (this.connected) {
            window["pomelo"].notify(route, data);
        }
    }
}