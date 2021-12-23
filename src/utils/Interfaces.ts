import * as vscode from "vscode";
import { CancellationToken, Progress } from "vscode";
import { WebResourceType } from "./Constants";

/* eslint-disable @typescript-eslint/naming-convention */
export interface IConnection {
    connectionName: string;
    loginType: string;
    environmentType?: string;
    environmentUrl: string;
    userName?: string;
    password?: string;
    tenantId?: string;
    currentAccessToken?: string;
    refreshToken?: string;
}

export interface Token {
    token_type: string;
    scope: string;
    expires_in: number;
    ext_expires_in?: number;
    access_token: string;
    refresh_token?: string;
}

export interface IStore {
    noConnections?: boolean;
}

export interface ICommand {
    command: string;
    callback: (...args: any[]) => any;
}

export interface IProgressOptions {
    progress: Progress<{ message?: string; increment?: number }>;
    token?: CancellationToken;
}

export interface IEntityMetadata {
    value: IEntityDefinition[];
}

export interface IEntityDefinition {
    ActivityTypeMask: number;
    IsDocumentManagementEnabled: boolean;
    IsOneNoteIntegrationEnabled: boolean;
    IsInteractionCentricEnabled: boolean;
    IsKnowledgeManagementEnabled: boolean;
    IsSLAEnabled: boolean;
    IsBPFEntity: boolean;
    IsActivity: boolean;
    IsAvailableOffline: boolean;
    IsAIRUpdated: boolean;
    IconLargeName: null;
    IconMediumName: null;
    IconSmallName: null;
    IconVectorName: null;
    IsCustomEntity: boolean;
    IsBusinessProcessEnabled: boolean;
    ChangeTrackingEnabled: boolean;
    IsManaged: boolean;
    IsEnabledForCharts: boolean;
    IsEnabledForTrace: boolean;
    IsValidForAdvancedFind: boolean;
    MobileOfflineFilters: string;
    IsReadingPaneEnabled: boolean;
    IsQuickCreateEnabled: boolean;
    LogicalName: string;
    ObjectTypeCode: number;
    OwnershipType: string;
    PrimaryNameAttribute: string;
    PrimaryImageAttribute: string;
    PrimaryIdAttribute: string;
    SchemaName: string;
    EntityColor: string;
    EntitySetName: string;
    HasNotes: boolean;
    HasActivities: boolean;
    HasEmailAddresses: boolean;
    MetadataId: string;
    Description: IDescription;
    DisplayCollectionName: IDescription;
    DisplayName: IDescription;
    IsAuditEnabled: IIs;
    IsValidForQueue: IIs;
    IsConnectionsEnabled: IIs;
    IsCustomizable: IIs;
    IsRenameable: IIs;
    IsMappable: IIs;
    IsDuplicateDetectionEnabled: IIs;
    IsMailMergeEnabled: IIs;
    IsVisibleInMobile: IIs;
    IsVisibleInMobileClient: IIs;
    IsReadOnlyInMobileClient: IIs;
    IsOfflineInMobileClient: IIs;
    Attributes: IAttributeMetadata;
}

export interface IAttributeMetadata {
    value: IAttributeDefinition[];
}

export interface IAttributeDefinition {
    AttributeType: string;
    MaxLength: number;
    IsPrimaryId: boolean;
    IsSearchable: boolean;
    IsManaged: boolean;
    LogicalName: string;
    SchemaName: string;
    AutoNumberFormat: string;
    MetadataId: string;
    IsAuditEnabled: IIs;
    IsGlobalFilterEnabled: IIs;
    IsSortableEnabled: IIs;
    IsCustomizable: IIs;
    IsRenameable: IIs;
    IsValidForAdvancedFind: IIs;
    RequiredLevel: IRequiredLevel;
}

export interface IRequiredLevel {
    Value: string;
    CanBeChanged: boolean;
    ManagedPropertyLogicalName: string;
}

export interface IDescription {
    UserLocalizedLabel: IUserLocalizedLabel;
}

export interface IUserLocalizedLabel {
    Label: string;
    LanguageCode: number;
    IsManaged: boolean;
    MetadataId: string;
    HasChanged: null;
}

export interface IIs {
    Value: boolean;
    CanBeChanged: boolean;
    ManagedPropertyLogicalName: string;
}

export interface IPanel {
    panel: vscode.WebviewPanel;
    extensionUri: vscode.Uri;
    webViewFileName: string;
}

export interface IViewOption {
    title: string;
    type: string;
    icon?: string;
}

export interface IWebResources {
    value: IWebResource[];
}

export interface IWebResource {
    webresourceid?: string;
    displayname?: string;
    name?: string;
    content: string;
    webresourcetype?: WebResourceType;
    description?: null | string;
    solutionid?: string;
    ismanaged?: boolean;
    componentstate?: number;
    iscustomizable?: IIs;
    canbedeleted?: IIs;
}

export interface ILinkerFile {
    DVDT: ILinkerRoot;
}

export interface ILinkerRoot {
    WebResources: ILinkerResources;
    Settings: any[];
}

export interface ILinkerResources {
    Resource: Array<ILinkerRes>;
}

export interface ILinkerRes {
    "@_localFileName": string;
    "@_localFilePath": string;
    "@_dvDisplayName": string;
    "@_dvFilePath": string;
    "@_Id": string;
}

export interface IOptionSetMetadata {
    LogicalName: string;
    MetadataId: string;
    OptionSet: IOptionSet;
    // GlobalOptionSet: IOptionSet;
}

export interface IOptionSet {
    MetadataId?: string;
    Options: IOption[];
}

export interface IOption {
    Value: number;
    IsManaged: boolean;
    MetadataId: null;
    Label: IDescription;
    Description: IDescription;
}

export interface IOptionValue {
    name: string;
    value: number;
}

export interface ISolutions {
    value: ISolution[];
}

export interface ISolution {
    description: null | string;
    friendlyname: string;
    ismanaged: boolean;
    isvisible: boolean;
    solutionid: string;
    uniquename: string;
    version: string;
    publisherid: IPublisher;
}

export interface IPublisher {
    customizationprefix: string;
    publisherid: string;
}

export interface IComponentUpdate {
    ComponentId: string;
    ComponentType: number;
    SolutionUniqueName: string;
    AddRequiredComponents: boolean;
}

export interface ISolutionComponents {
    value: ISolutionComponent[];
}

export interface ISolutionComponent {
    objectid: string;
    solutioncomponentid: string;
    componenttype: number;
    ismetadata: boolean;
    _solutionid_value: string;
}

export interface ISmartMatchRecord {
    wrId: string;
    wrDisplayName: string;
    wrPath: string;
    localFileName: string;
    localFilePath: string;
    localFullPath: string;
    confidenceLevel: number;
    linked: boolean;
}

export interface ILinkView {
    fp: string;
    id: string;
}
