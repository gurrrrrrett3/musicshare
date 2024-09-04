import path from "path";
import fs from "fs";
import Processor from "../classes/processor.js";
import GlobalLogger, { Logger } from "../util/logger.js"
import { RequiredSongData } from "../classes/song.js";

export default class ProcessorManager {
    public readonly logger = new Logger('ProcessorManager');
    public processors: Processor<any>[] = [];

    public async loadProcessors() {
        let processorPath = path.resolve(`./dist/processors`);
        let processorFiles = fs.readdirSync(processorPath).filter((file) => file.endsWith('.js'));

        for (let processorFile of processorFiles) {
            let processorImport = await import(`${processorPath}/${processorFile}`);
            const processor = new processorImport.default() as Processor<any>;
            if (!processor.enabled) continue;

            this.processors.push(processor);

            GlobalLogger.info(processor.name, 'Loaded processor');
        }
    }

    public findProcessor(url: string) {
        return this.processors.find((processor) => processor.shouldProcess(url));
    }

    // preform a lookup on a song url and return the song data from all processors
    public async lookupSongUrl(url: string) {
        let processor = this.processors.find((processor) => processor.shouldProcess(url));
        if (!processor) return null;

        const song = await processor.getUrlInfo(url);
        const otherProcessors = this.processors.filter((p) => p.name !== processor?.name);
        const searchString = `${song.name} ${song.artist}`;

        console.log(`Searching for ${searchString} with ${otherProcessors.length} processors`);

        const songInfo = await Promise.all(otherProcessors.map(async (processor: Processor<RequiredSongData>) => {
            let songs = await processor.search(searchString).catch((err) => {
                processor.error(err.message);
                console.log(err);
                return [{
                    error: true,
                    message: err.message,
                    processor: processor.name
                }]
            });

            processor.debug(`Found ${songs.length} results for ${searchString}`)
            return {
                processor: processor.name,
                song: {
                    ...songs[0],
                    error: false,
                },
            }
        })).then((songInfo) => {
            const songInfoObject: Record<string, RequiredSongData & { error?: boolean, message?: string }> = {};
            for (const { processor, song } of songInfo) {
                const proc = this.processors.find((p) => p.name === processor);
                // @ts-ignore
                songInfoObject[processor] = song.error ? song.message : {
                    ...song,
                    processor: {
                        name: processor,
                        icon: proc?.iconName || 'unknown',
                        color: proc?.color || '#ffffff'
                    }
                }
            }
            return songInfoObject;
        });

        songInfo[processor.name] = {
            ...song,
            processor: {
                name: processor.name,
                icon: processor.iconName,
                color: processor.color
            }
        }

        return songInfo;
    }
}