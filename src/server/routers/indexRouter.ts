import { Router } from 'express';
import path from "path";
import ApiRouter from "./apiRouter.js";

const router = Router();

router.use("/api", ApiRouter);

router.get("/", (req, res) => {
    res.sendFile(path.resolve("./dist/client/index.html"));
})

export default router;