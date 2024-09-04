import { Logger } from "../util/logger.js";
import express from "express";
import http, { Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io";
import IndexRouter from "./routers/indexRouter.js";
import path from "path";

export default class Server {
    public static readonly PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    public static app: express.Application = express();
    public static server: HTTPServer = http.createServer(Server.app);
    public static io: SocketServer = new SocketServer(Server.server);

    private static readonly logger: Logger = new Logger("Server");

    public static start(): void {

        this.app.disable("x-powered-by");
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(IndexRouter);
        this.app.use("/_", express.static(path.resolve("./dist/client/_")))

        this.server.listen(this.PORT, () => {
            this.logger.info(`Server is running on port ${this.PORT}`);
        });

        this.io.on("connection", (socket) => {
            this.logger.info(`Socket connected: ${socket.id}`);

            socket.on("disconnect", () => {
                this.logger.info(`Socket disconnected: ${socket.id}`);
            });
        });




    }
}