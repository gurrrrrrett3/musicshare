import { Logger } from "../util/logger.js";
import Song from "./song.js";

export default abstract class Processor<ApplicableSongData extends Partial<Song>> extends Logger {

    public readonly enabled: boolean = true;

    constructor(
        public readonly name: string,
        public readonly identifier: string,
        public readonly color: string = "#ffffff"
    ) {
        super(name);
    }

    public get iconName() {
        return this.name.toLowerCase().replace(/ /g, '');
    }

    public abstract search(query: string, artist?: string): Promise<ApplicableSongData[]>
    public abstract getUrlInfo(url: string): Promise<ApplicableSongData>
    public abstract getIdInfo(id: string): Promise<ApplicableSongData>
    public abstract shouldProcess(url: string): boolean
}