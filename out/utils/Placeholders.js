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
            default:
                inbOptions = { placeHolder: "", prompt: "" };
                break;
        }
        inbOptions.ignoreFocusOut = true;
        return inbOptions;
    }
    static getQuickPickOptions(placeholder, ignoreFocus = true) {
        let qpOptions;
        ``;
        switch (placeholder) {
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
Placeholders.webResourceSelection = "WebResourceSelection";
Placeholders.typingDirSelection = "TypingDirSelection";
Placeholders.webResourceLinkSelection = "WebResourceLinkSelection";
Placeholders.solutionSelection = "SolutionSelection";
Placeholders.wrDisplayName = "WR-DisplayName";
Placeholders.wrUniqueName = "WR-UniqueName";
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
Placeholders.ipWebResourceSelection = {
    placeHolderText: `Select the web resource to link`,
    prompt: `Pick your web resource to link with your local file`,
};
Placeholders.ipTypingDirSelection = {
    placeHolderText: `Select the directory`,
    prompt: `Pick your directory to add the type definition file`,
};
Placeholders.ipWebResourceLinkSelection = {
    placeHolderText: `Select your option`,
    prompt: `Do you want to upload a new webresource or link to an existing?`,
};
Placeholders.ipsolutionSelection = {
    placeHolderText: `Select the solution`,
    prompt: `Pick the solution where you want to deploy the web resource`,
};
Placeholders.ipWRDisplayName = {
    placeHolderText: `${Placeholders.required} Display Name (e.g. My Awesome Script)`,
    prompt: `Enter your Web Resource display name`,
};
Placeholders.ipWRUniqueName = {
    placeHolderText: `${Placeholders.required} Unique Name [DO NOT INCLUDE prefix] (e.g. /scripts/forms/myawesomescript.js)`,
    prompt: `Enter your Web Resource unique name without the prefix`,
};
//# sourceMappingURL=Placeholders.js.map