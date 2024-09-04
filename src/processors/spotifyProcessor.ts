import { Album, AudioFeatures, Client, Track, TrackManager } from "spotify-api.js";
import Processor from "../classes/processor.js";
import Song, { SongData } from "../classes/song.js";

export type SpotifySongData = SongData<
    'album'
    | 'albumImageUrl'
    | 'acousticness'
    | 'danceability'
    | 'duration_ms'
    | 'energy'
    | 'generes'
    | 'instrumentalness'
    | 'key'
    | 'liveness'
    | 'loudness'
    | 'mode'
    | 'popularity'
    | 'speechiness'
    | 'tempo'
    | 'time_signature'
    | 'valence'>;

export default class SpotifyProcessor extends Processor<SpotifySongData> {

    public client!: Client;

    constructor() {
        super('Spotify', 'sp', '#1DB954');

        this.init();
    }

    public async init() {
        this.client = await Client.create({
            token: {
                clientID: process.env.SPOTIFY_CLIENT_ID as string,
                clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
            }
        });

    }

    public async search(query: string): Promise<SpotifySongData[]> {
        const track = await this.client.tracks.search(query, { limit: 1 })
        const audioFeatures = await this.client.tracks.getAudioFeatures(track[0].id);
        if (!track || !audioFeatures) throw new Error('Invalid spotify url');

        return [this.buildSongData(track[0], audioFeatures)];
    }

    public async getIdInfo(id: string): Promise<SpotifySongData> {

        const [track, audioFeatures] = await Promise.all([
            this.client.tracks.get(id),
            this.client.tracks.getAudioFeatures(id)
        ]);

        if (!track || !audioFeatures) throw new Error('Invalid spotify url');

        const album = track.album ? await this.client.albums.get(track.album.id) || undefined : undefined;

        return this.buildSongData(track, audioFeatures, album);
    }

    public async getUrlInfo(url: string): Promise<SpotifySongData> {
        const id = url.match(/^(https?:\/\/)?(open\.)?spotify\.com\/track\/([a-zA-Z0-9]+)/)?.[3];
        if (!id) throw new Error('Invalid spotify url');

        return this.getIdInfo(id);
    }

    public override shouldProcess(url: string): boolean {
        // https://open.spotify.com/track/...
        // https://open.spotify.com/album/...
        // https://open.spotify.com/playlist/...
        // https://open.spotify.com/artist/...
        // https://open.spotify.com/episode/...
        // https://open.spotify.com/show/...

        // https://play.spotify.com/track/...
        // https://play.spotify.com/album/...
        // https://play.spotify.com/playlist/...
        // https://play.spotify.com/artist/...
        // https://play.spotify.com/episode/...
        // https://play.spotify.com/show/...

        // spotify:track:...
        // spotify:album:...
        // spotify:playlist:...
        // spotify:artist:...
        // spotify:episode:...
        // spotify:show:...

        return url.match(/^(https?:\/\/)?(open\.)?spotify\.com\/(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]+)/) !== null;
    }

    public buildSongData(track: Track, audioFeatures: AudioFeatures, album?: Album) {
        return {
            name: track.name,
            artist: track.artists[0].name,
            album: track.album?.name || '',
            albumImageUrl: track.album?.images[0]?.url || undefined,
            duration: track.duration,
            url: track.externalURL.spotify,
            id: track.id,
            acousticness: audioFeatures.acousticness,
            danceability: audioFeatures.danceability,
            duration_ms: audioFeatures.duration_ms,
            energy: audioFeatures.energy,
            generes: album?.genres || [],
            instrumentalness: audioFeatures.instrumentalness,
            key: audioFeatures.key,
            liveness: audioFeatures.liveness,
            loudness: audioFeatures.loudness,
            mode: audioFeatures.mode,
            popularity: track.popularity || 0,
            speechiness: audioFeatures.speechiness,
            tempo: audioFeatures.tempo,
            time_signature: audioFeatures.time_signature,
            valence: audioFeatures.valence

        }
    }
}