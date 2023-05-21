import fastify from "fastify";
import "dotenv/config";
import cors from "@fastify/cors";
import { memoriesRoutes } from "./routes/memories";
import { authRoutes } from "./routes/auth";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import { uploadRoutes } from "./routes/upload";
import { resolve } from "node:path";

const app = fastify();

app.register(cors, {
	origin: true, // Todas as urls de frontend poderão acessar o nosso backend.
	// origin: ['http://localhost:3000', 'http://github.com/lucasheck', 'etc...']
});
app.register(jwt, {
	secret: "spacetime",
});
app.register(multipart);
app.register(require("@fastify/static"), {
	root: resolve(__dirname, "../uploads"),
	prefix: "/uploads",
});

app.register(memoriesRoutes);
app.register(authRoutes);
app.register(uploadRoutes);

app.listen({
	host: "0.0.0.0",
	port: 3333,
}).then(() => {
	console.log("HTTP Server Running on http://localhost:3333");
});
