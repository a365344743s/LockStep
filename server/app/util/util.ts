export default class Util {
    public static makeId(count: number): string {
        let id: string = "";
        for (let i = 0; i < count; i++) {
            let bit: string = Math.floor(Math.random() * 10).toString();
            id += bit;
        }

        return id;
    }
}