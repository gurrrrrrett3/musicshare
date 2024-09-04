import { MusicBrainzApi } from 'musicbrainz-api';
import Processor from "../classes/processor.js";
import { SongData } from "../classes/song.js";

export type MusicBrainzSongData = SongData<never>;

export default class MusicBrainzProcessor extends Processor<MusicBrainzSongData> {

    public client: MusicBrainzApi;
    public enabled: boolean = false; // disabled until i can fix searching

    constructor(public baseUrl: string = 'https://musicbrainz.org') {
        super('MusicBrainz', 'mb');

        this.client = new MusicBrainzApi({
            appName: 'musicshare',
            appVersion: '0.1.0',
            botAccount: {},
            appContactInfo: 'gart@gart.sh'
        })

    }

    public async search(query: string, artist?: string): Promise<MusicBrainzSongData[]> {
        const res = await this.client.search('release', {
            artist,
            query,
            limit: 10
        });

        return res.releases.map((release) => ({
            name: release.title,
            artist: release["artist-credit"]?.[0].name || '',
            duration: release.media?.[0].tracks?.reduce((acc, track) => acc + track.length, 0) || 0,
            url: `${this.baseUrl}/release/${release.id}`,
            id: release.id
        }));
    }

    public async getIdInfo(id: string): Promise<MusicBrainzSongData> {
        // id in this case is type:uuid
        const [type, uuid] = id.split(':');

        // @ts-ignore
        const res = await this.client.lookup(type, uuid, [
            "artist-credits"
        ]);

        switch (type) {
            case 'release':
                return {
                    name: res.title,
                    artist: res["artist-credit"]?.[0].artist.name || '',
                    duration: res.media?.[0].tracks?.reduce((acc, track) => acc + track.length, 0) || 0,
                    url: `${this.baseUrl}/release/${res.id}`,
                    id: res.id
                };
            case 'work':
                return {
                    name: res.title,
                    artist: res["artist-credit"]?.[0].name || '',
                    duration: 0,
                    url: `${this.baseUrl}/work/${res.id}`,
                    id: res.id
                };
            case 'recording':
                return {
                    name: res.title,
                    artist: res["artist-credit"]?.[0].name || '',
                    duration: res.length || 0,
                    url: `${this.baseUrl}/recording/${res.id}`,
                    id: res.id
                };
            case 'label':
                return {
                    name: res.name,
                    artist: '',
                    duration: 0,
                    url: `${this.baseUrl}/label/${res.id}`,
                    id: res.id
                };
            default:
                throw new Error('Invalid musicbrainz url');
        }
    }

    public async getUrlInfo(url: string): Promise<MusicBrainzSongData> {
        const groups = url.match(/^(https?:\/\/)?(www\.)?musicbrainz\.org\/(?<type>release(-group)?|work|recording|label)\/(?<id>[a-zA-Z0-9-]+)/)?.groups || [];
        const { type, id } = groups as { type: string, id: string };
        if (!type || !id) throw new Error('Invalid musicbrainz url');

        return this.getIdInfo(`${type}:${id}`);
    }

    public shouldProcess(url: string): boolean {
        // musicbrainz.org/release/...
        // musicbrainz.org/release-group/...
        // musicbrainz.org/work/...
        // musicbrainz.org/recording/...

        return url.match(/^(https?:\/\/)?(www\.)?musicbrainz\.org\/(release(-group)?|work|recording|label)\/[a-zA-Z0-9-]+/) !== null;
    }

}