import * as fs from "fs";
import * as path from "path";

export function readFileSync(source: string): any {
    return fs.readFileSync(source);
}
