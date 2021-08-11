import { env, Uri } from "vscode";

export async function openUri(uri: string): Promise<void> {
    await env.openExternal(Uri.parse(uri));
}
