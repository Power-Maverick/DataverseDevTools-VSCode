"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Placeholders = void 0;
class Placeholders {
    static getInputBoxOptions(placeholder) {
        let inbOptions;
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
    static getQuickPickOptions(placeholder, ignoreFocus = true) {
        let qpOptions;
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
}
exports.Placeholders = Placeholders;
Placeholders.dataverseEnvironmentURL = "DataverseEnvironmentURL";
Placeholders.userName = "UserName";
Placeholders.password = "Password";
Placeholders.connectionName = "ConnectionName";
Placeholders.connectionType = "ConnectionType";
Placeholders.required = "[Required]";
Placeholders.optional = "[Optional]";
Placeholders.ipEnvironmentURL = {
    placeHolderText: `${Placeholders.required} URL (e.g.: https://demo.crm.dynamics.com)`,
    prompt: `Enter your Dataverse environment URL`,
};
Placeholders.ipUsername = {
    placeHolderText: `${Placeholders.required} Username (e.g.: admin@demo.onmicrosoft.com)`,
    prompt: `Enter your username to authenticate with Dataverse`,
};
Placeholders.ipPassword = {
    placeHolderText: `${Placeholders.required} Password (e.g.: P@ssw0rd1)`,
    prompt: `Enter your password to authenticate with Dataverse`,
};
Placeholders.ipConnectionName = {
    placeHolderText: `${Placeholders.required} Name (e.g.: Awesome Dev)`,
    prompt: `Enter a friendly name to your connection`,
};
Placeholders.ipConnectionType = {
    placeHolderText: `${Placeholders.optional} Type (e.g.: Dev, Test, QA, PROD)`,
    prompt: `Pick your desired type`,
};
//# sourceMappingURL=Placeholders.js.map