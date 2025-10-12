export class ErrorMessages {
    public static dataverseEnvironmentUrlRequired: string = "Dataverse environment URL is required.";
    public static usernameRequired: string = "Username is required.";
    public static passwordRequired: string = "Password is required.";
    public static clientIdRequired: string = "Client Id is required.";
    public static clientSecretRequired: string = "Client Secret is required.";
    public static tenantIdRequired: string = "Tenant Id is required.";
    public static connNameRequired: string = "Connection Name is required.";
    public static connNameReservedWords: string = "Cannot used reserved words; choose some other friendly name for your connection.";
    public static wrDisplayNameRequired: string = "Web Resource Display Name is required.";
    public static tsFileNameRequired: string = "TypeScript filename is required.";
    public static jsFileNameRequired: string = "JavaScript filename is required.";
    public static webpackNamespaceRequired: string = "Namespace for Webpack is required.";
    public static wrCompareError: string = "The selected file is either not linked to a web resources or it does not exists in Dataverse.";
    public static wrUploadError: string = "Failed to upload web resource. Please check your connection and try again.";
    public static drbConnectionError: string = "Connect to an environment before trying to load Dataverse REST Builder.";
    public static invalidLoginType: string = "Invalid Login Type.";
    public static commonToolsError: string = "An error occurred while trying to open the tool. Please try again.";
}
