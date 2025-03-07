export interface OAuthPayload {
    code: string;
    state: string;
    provider: 'battlenet' | 'warcraftlogs'
}
