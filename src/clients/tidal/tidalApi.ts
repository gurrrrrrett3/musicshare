import fetch from "node-fetch";
import { Logger } from "../../util/logger.js";

export default class TidalApi {

    private _token!: string;
    public logger = new Logger('TidalApi');

    constructor(private _clientId: string, private _clientSecret: string) {
        this.getToken();
    }

    public async getToken() {
        if (!this._token) {
            await this._refreshToken();
        }
        return this._token;
    }

    private async _refreshToken() {
        const response = await fetch('https://auth.tidal.com/v1/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${this._clientId}:${this._clientSecret}`).toString('base64')}`
            },
            body: new URLSearchParams({
                'grant_type': 'client_credentials',
            })
        });
        const json = await response.json() as { access_token: string, expires_in: number };
        this._token = json.access_token;

        setTimeout(() => {
            this._refreshToken();
        }, json.expires_in * 1000);

        this.logger.debug(`Refreshed token. Expires in ${json.expires_in} seconds.`);
    }

    public async search(query: string, options?: { limit?: number }): Promise<TidalTrack[]> {
        const url = `https://openapi.tidal.com/search?query=${encodeURIComponent(query)}&limit=${options?.limit ?? 10}&offset=0&type=TRACKS&countryCode=US`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${await this.getToken()}`,
                'Content-Type': 'application/vnd.tidal.v1+json'
            }
        });

        const json = await response.json() as { tracks: TidalTrack[] };
        return json.tracks;
    }

    public async getTrack(id: string): Promise<TidalTrack> {
        const url = `https://api.tidal.com/v1/tracks/${id}?countryCode=US`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${await this.getToken()}`,
                'Content-Type': 'application/vnd.tidal.v1+json'
            }
        });

        const json = await response.json() as TidalTrack;
        return json;
    }
}


export interface TidalTrack {
    resource: Resource;
    id: string;
    status: number;
    message: string;
}

interface Resource {
    id: string;
    title: string;
    version: string;
    artists: Artist[];
    album: Album;
    duration: number;
    trackNumber: number;
    volumeNumber: number;
    isrc: string;
    copyright: string;
    mediaMetadata: MediaMetadata;
    properties: Properties;
}

interface Properties {
    content: string;
}

interface MediaMetadata {
    tags: string;
}

interface Album {
    id: string;
    title: string;
    imageCover: Picture[];
    videoCover: Picture[];
}

interface Artist {
    id: string;
    name: string;
    picture: Picture[];
    main: boolean;
}

interface Picture {
    url: string;
    width: number;
    height: number;
}