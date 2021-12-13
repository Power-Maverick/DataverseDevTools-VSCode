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
            case this.clientId:
                inbOptions = {
                    placeHolder: this.ipClientId.placeHolderText,
                    prompt: this.ipClientId.prompt,
                };
                break;
            case this.clientSecret:
                inbOptions = {
                    placeHolder: this.ipClientSecret.placeHolderText,
                    prompt: this.ipClientSecret.prompt,
                    password: true,
                };
                break;
            case this.connectionName:
                inbOptions = {
                    placeHolder: this.ipConnectionName.placeHolderText,
                    prompt: this.ipConnectionName.prompt,
                };
                break;
            case this.wrDisplayName:
                inbOptions = {
                    placeHolder: this.ipWRDisplayName.placeHolderText,
                    prompt: this.ipWRDisplayName.prompt,
                };
                break;
            case this.wrUniqueName:
                inbOptions = {
                    placeHolder: this.ipWRUniqueName.placeHolderText,
                    prompt: this.ipWRUniqueName.prompt,
                };
                break;
            case this.tsNamespace:
                inbOptions = {
                    placeHolder: this.ipTSNamespace.placeHolderText,
                    prompt: this.ipTSNamespace.prompt,
                };
                break;
            case this.tsFileName:
                inbOptions = {
                    placeHolder: this.ipTSFileName.placeHolderText,
                    prompt: this.ipTSFileName.prompt,
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
            case this.logintype:
                qpOptions = { placeHolder: this.ipLoginType.placeHolderText, title: this.ipLoginType.prompt, ignoreFocusOut: ignoreFocus };
                break;
            case this.connectionType:
                qpOptions = { placeHolder: this.ipConnectionType.placeHolderText, title: this.ipConnectionType.prompt, ignoreFocusOut: ignoreFocus };
                break;
            case this.webResourceSelection:
                qpOptions = { placeHolder: this.ipWebResourceSelection.placeHolderText, title: this.ipWebResourceSelection.prompt, ignoreFocusOut: ignoreFocus };
                break;
            case this.typingDirSelection:
                qpOptions = { placeHolder: this.ipTypingDirSelection.placeHolderText, title: this.ipTypingDirSelection.prompt, ignoreFocusOut: ignoreFocus };
                break;
            case this.webResourceLinkSelection:
                qpOptions = { placeHolder: this.ipWebResourceLinkSelection.placeHolderText, title: this.ipWebResourceLinkSelection.prompt, ignoreFocusOut: ignoreFocus };
                break;
            case this.solutionSelection:
                qpOptions = { placeHolder: this.ipsolutionSelection.placeHolderText, title: this.ipsolutionSelection.prompt, ignoreFocusOut: ignoreFocus };
                break;
            case this.tsTemplateType:
                qpOptions = { placeHolder: this.ipTSTemplateType.placeHolderText, title: this.ipTSTemplateType.prompt, ignoreFocusOut: ignoreFocus };
                break;
            default:
                qpOptions = { placeHolder: "", ignoreFocusOut: ignoreFocus };
                break;
        }

        return qpOptions;
    }

    public static dataverseEnvironmentURL: string = "DataverseEnvironmentURL";
    public static logintype: string = "LoginType";
    public static userName: string = "UserName";
    public static password: string = "Password";
    public static clientId: string = "ClientId";
    public static clientSecret: string = "ClientSecret";
    public static connectionName: string = "ConnectionName";
    public static connectionType: string = "ConnectionType";
    public static webResourceSelection: string = "WebResourceSelection";
    public static typingDirSelection: string = "TypingDirSelection";
    public static webResourceLinkSelection: string = "WebResourceLinkSelection";
    public static solutionSelection: string = "SolutionSelection";
    public static wrDisplayName: string = "WR-DisplayName";
    public static wrUniqueName: string = "WR-UniqueName";
    public static tsNamespace: string = "TS-Namespace";
    public static tsFileName: string = "TS-FileName";
    public static tsTemplateType: string = "TS-TemplateType";

    public static required: string = "[Required]";
    public static optional: string = "[Optional]";

    private static ipEnvironmentURL: IPlaceholder = {
        placeHolderText: `${Placeholders.required} URL (e.g.: https://demo.crm.dynamics.com)`,
        prompt: `Enter your Dataverse environment URL`,
    };
    private static ipLoginType: IPlaceholder = {
        placeHolderText: `${Placeholders.required} Select your option for login`,
        prompt: `Login using username/password or MSFT login prompt`,
    };
    private static ipUsername: IPlaceholder = {
        placeHolderText: `${Placeholders.required} Username (e.g.: admin@demo.onmicrosoft.com)`,
        prompt: `Enter your username to authenticate with Dataverse`,
    };
    private static ipPassword: IPlaceholder = {
        placeHolderText: `${Placeholders.required} Password (e.g.: P@ssw0rd1)`,
        prompt: `Enter your password to authenticate with Dataverse`,
    };
    private static ipClientId: IPlaceholder = {
        placeHolderText: `${Placeholders.required} Client Id (e.g.: EAB0D415-3221-44E2-9791-1A20C6BC4786)`,
        prompt: `Enter your client id to authenticate with Dataverse`,
    };
    private static ipClientSecret: IPlaceholder = {
        placeHolderText: `${Placeholders.required} Client Secret (e.g.: UPcKJK_aZ45JkA!13k6NAq8-rj9Z-856Ye)`,
        prompt: `Enter your client secret to authenticate with Dataverse`,
    };
    private static ipConnectionName: IPlaceholder = {
        placeHolderText: `${Placeholders.required} Name (e.g.: Awesome Dev)`,
        prompt: `Enter a friendly name to your connection`,
    };
    private static ipConnectionType: IPlaceholder = {
        placeHolderText: `${Placeholders.optional} Type (e.g.: Dev, Test, QA, PROD)`,
        prompt: `Pick your desired type`,
    };
    private static ipWebResourceSelection: IPlaceholder = {
        placeHolderText: `Select the web resource to link`,
        prompt: `Pick your web resource to link with your local file`,
    };
    private static ipTypingDirSelection: IPlaceholder = {
        placeHolderText: `Select the directory`,
        prompt: `Pick your directory to add the type definition file`,
    };
    private static ipWebResourceLinkSelection: IPlaceholder = {
        placeHolderText: `Select your option`,
        prompt: `Do you want to upload a new webresource or link to an existing?`,
    };
    private static ipsolutionSelection: IPlaceholder = {
        placeHolderText: `Select the solution`,
        prompt: `Pick the solution where you want to deploy the web resource`,
    };
    private static ipWRDisplayName: IPlaceholder = {
        placeHolderText: `${Placeholders.required} Display Name (e.g. My Awesome Script)`,
        prompt: `Enter your Web Resource display name`,
    };
    private static ipWRUniqueName: IPlaceholder = {
        placeHolderText: `${Placeholders.required} Unique Name [DO NOT INCLUDE prefix] (e.g. /scripts/forms/myawesomescript.js)`,
        prompt: `Enter your Web Resource unique name without the prefix`,
    };
    private static ipTSNamespace: IPlaceholder = {
        placeHolderText: `${Placeholders.required} Namespace (e.g. DV)`,
        prompt: `Enter the namespace for your TypeScript project`,
    };
    private static ipTSFileName: IPlaceholder = {
        placeHolderText: `${Placeholders.required} test [DO NOT INCLUDE .ts]`,
        prompt: `Enter the name of the TypeScript file`,
    };
    private static ipTSTemplateType: IPlaceholder = {
        placeHolderText: `${Placeholders.required} Template (e.g.: TypeScript Only, Webpack)`,
        prompt: `Pick your desired bundling template`,
    };
}
