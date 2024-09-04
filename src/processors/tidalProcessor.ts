import Processor from "../classes/processor.js";
import { SongData } from "../classes/song.js";
import TidalApi from "../clients/tidal/tidalApi.js";

export type TidalSongData = SongData<
    'album'
    | 'albumImageUrl'
    | 'artistImageUrl'
>

export default class TidalProcessor extends Processor<TidalSongData> {

    public client = new TidalApi(process.env.TIDAL_CLIENT_ID!, process.env.TIDAL_CLIENT_SECRET!);

    constructor() {
        super('Tidal', "ti", "#ffffff");
    }

    public async search(query: string): Promise<TidalSongData[]> {
        const res = await this.client.search(query, { limit: 10 })

        if (res.length === 0) return [];
        if (!res[0].status.toString().startsWith('2')) {
            throw new Error(res[0].message);
        }

        return res.filter((item) => item.resource)
            .map((item) => ({
                name: item.resource.title,
                artist: item.resource.artists[0].name,
                duration: item.resource.duration,
                url: `https://tidal.com/browse/track/${item.id}`,
                id: item.id,

                albumImageUrl: item.resource.album.imageCover[0]?.url,
                artistImageUrl: item.resource.artists[0].picture[0]?.url,
                album: item.resource.album?.title
            }));
    }

    public async getIdInfo(id: string): Promise<TidalSongData> {
        const item = await this.client.getTrack(id);

        if (!item) throw new Error('Invalid tidal url');
        if (!item.status.toString().startsWith('2')) {
            throw new Error(item.message);
        }

        return {
            name: item.resource.title,
            artist: item.resource.artists[0]?.name,
            duration: item.resource.duration,
            url: `https://tidal.com/browse/track/${item.id}`,
            id: item.id,

            albumImageUrl: item.resource.album.imageCover[0]?.url,
            artistImageUrl: item.resource.artists[0].picture[0]?.url,
            album: item.resource.album?.title
        };
    }

    public async getUrlInfo(url: string): Promise<TidalSongData> {
        const id = url.match(/^(https?:\/\/)?(www\.)?tidal\.com\/browse\/track\/([a-zA-Z0-9]+)/)?.[3];
        if (!id) throw new Error('Invalid tidal url');

        return this.getIdInfo(id);
    }

    public shouldProcess(url: string): boolean {
        // https://tidal.com/browse/track/...
        // https://tidal.com/browse/album/...
        // https://tidal.com/browse/playlist/...
        // https://tidal.com/browse/artist/...
        // https://tidal.com/browse/video/...
        // https://tidal.com/browse/episode/...
        // https://tidal.com/browse/show/...

        return url.match(/^(https?:\/\/)?(www\.)?tidal\.com\/browse\/(track|album|playlist|artist|video|episode|show)\/([a-zA-Z0-9]+)/) !== null;
    }


}