/* eslint-disable @typescript-eslint/naming-convention */
export class Commands {
    public static ChangeDirectory(path: string) {
        return `cd ${path}`;
    }

    public static InitPlugin() {
        return `pac plugin init`;
    }
}
