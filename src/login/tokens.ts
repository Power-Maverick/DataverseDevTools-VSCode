/* eslint-disable @typescript-eslint/naming-convention */
export interface Token {
    token_type: string;
    scope: string;
    expires_in: number;
    ext_expires_in: number;
    access_token: string;
}
