import * as vscode from "vscode";

interface IPlaceholder {
    placeHolderText: string;
    prompt: string;
}

export class Placeholders {
    public static getInputBoxOptions(placeholder: string) {
        let inbOptions: vscode.InputBoxOptions;

        switch (placeholder) {
            case this.dataverseEnvironmentURL:
                inbOptions = {
                    placeHolder: this.ipEnvironmentURL.placeHolderText,
                    prompt: this.ipEnvironmentURL.prompt,
                };
                break;
            case this.userName:
                inbOptions = {
                    placeHolder: this.ipUsername.placeHolderText,
                    prompt: this.ipUsername.prompt,
                };
                break;
            case this.password:
                inbOptions = {
                    placeHolder: this.ipPassword.placeHolderText,
                    prompt: this.ipPassword.prompt,
                    password: true,
                };
                break;
            case this.connectionName:
                inbOptions = {
                    placeHolder: this.ipConnectionName.placeHolderText,
                    prompt: this.ipConnectionName.prompt,
                };
                break;
            default:
                inbOptions = { placeHolder: "", prompt: "" };
                break;
        }

        inbOptions.ignoreFocusOut = true;
        return inbOptions;
    }

    public static getQuickPickOptions(placeholder: string, ignoreFocus: boolean = true) {
        let qpOptions: vscode.QuickPickOptions;

        switch (placeholder) {
            case this.connectionType:
                qpOptions = { placeHolder: this.ipConnectionType.placeHolderText, title: this.ipConnectionType.prompt, ignoreFocusOut: ignoreFocus };
                break;
            default:
                qpOptions = { placeHolder: "", ignoreFocusOut: ignoreFocus };
                break;
        }

        return qpOptions;
    }

    public static dataverseEnvironmentURL: string = "DataverseEnvironmentURL";
    public static userName: string = "UserName";
    public static password: string = "Password";
    public static connectionName: string = "ConnectionName";
    public static connectionType: string = "ConnectionType";

    public static required: string = "[Required]";
    public static optional: string = "[Optional]";

    private static ipEnvironmentURL: IPlaceholder = {
        placeHolderText: `${Placeholders.required} URL (e.g.: https://demo.crm.dynamics.com)`,
        prompt: `Enter your Dataverse environment URL`,
    };
    private static ipUsername: IPlaceholder = {
        placeHolderText: `${Placeholders.required} Username (e.g.: admin@demo.onmicrosoft.com)`,
        prompt: `Enter your username to authenticate with Dataverse`,
    };
    private static ipPassword: IPlaceholder = {
        placeHolderText: `${Placeholders.required} Password (e.g.: P@ssw0rd1)`,
        prompt: `Enter your password to authenticate with Dataverse`,
    };
    private static ipConnectionName: IPlaceholder = {
        placeHolderText: `${Placeholders.required} Name (e.g.: Awesome Dev)`,
        prompt: `Enter a friendly name to your connection`,
    };
    private static ipConnectionType: IPlaceholder = {
        placeHolderText: `${Placeholders.optional} Type (e.g.: Dev, Test, QA, PROD)`,
        prompt: `Pick your desired type`,
    };
}
