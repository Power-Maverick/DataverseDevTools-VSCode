import { activeDirectoryEndpointUrl, activeDirectoryResourceId } from "../utils/Constants";
import * as url from "url";

export interface EnvironmentParameters {
    activeDirectoryEndpointUrl: string;
    dataverseUrl: string;
    activeDirectoryResourceId: string;
}

export class Environment {
    constructor(parameters: EnvironmentParameters) {
        this.activeDirectoryEndpointUrl = parameters.activeDirectoryEndpointUrl;
        this.activeDirectoryResourceId = parameters.activeDirectoryResourceId;
        this.dataverseUrl = parameters.dataverseUrl;
    }

    activeDirectoryEndpointUrl: string;
    activeDirectoryResourceId: string;
    dataverseUrl?: string;

    static readonly azureCloud = {
        activeDirectoryEndpointUrl: "https://login.microsoftonline.com/",
        activeDirectoryResourceId: "https://management.core.windows.net/",
    };
}

export async function getSelectedEnvironment(dUrl: string): Promise<Environment> {
    let eParams: EnvironmentParameters = {
        activeDirectoryEndpointUrl: activeDirectoryEndpointUrl,
        activeDirectoryResourceId: activeDirectoryResourceId,
        dataverseUrl: dUrl,
    };

    return new Environment(eParams);
}

export function isADFS(environment: Environment): boolean {
    const u = url.parse(environment.activeDirectoryEndpointUrl);
    const pathname = (u.pathname || "").toLowerCase();
    return pathname === "/adfs" || pathname.startsWith("/adfs/");
}
