import { Router } from 'express';
import { processorManager } from '../../index.js';

const router = Router();

router.get("/lookup", async (req, res) => {
    const query = req.query.query as string;
    const processor = processorManager.findProcessor(query)
    const results = await processorManager.lookupSongUrl(query);

    if (!processor) return res.json({
        error: "No processor found"
    })

    const processorData = {
        name: processor.name,
        icon: processor.iconName,
        color: processor.color
    }

    // since youtube music doesn't actually have a processor (it just uses youtube), we need to manually set the icon
    if (processor.name == "Youtube") {
        const url = new URL(query);
        if (url.hostname === "music.youtube.com") {
            processorData.icon = "youtubemusic";
        }
    }

    res.json({
        processor: processorData,
        results
    })
})

export default router;