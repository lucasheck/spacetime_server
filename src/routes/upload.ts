import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { extname, resolve } from "node:path";
import { createWriteStream, write } from "node:fs";
import { pipeline } from "node:stream";
import { promisify } from "node:util";

const pump = promisify(pipeline);

export async function uploadRoutes(app: FastifyInstance) {
	app.post("/upload", async (request, reply) => {
		const upload = await request.file({
			limits: {
				fileSize: 5242880, //5mb
			},
		});

		if (!upload) {
			return reply.status(400).send();
		}

		const mimeTypeRegex = /^(image|video)\/[a-zA-Z]+/;
		if (!mimeTypeRegex.test(upload.mimetype)) {
			return reply.status(400).send();
		}

		const fileId = randomUUID();
		const fileExtension = extname(upload.filename);

		const filename = fileId.concat(fileExtension);

		const writeStream = createWriteStream(
			resolve(__dirname, "../../uploads/", filename)
		);

		await pump(upload.file, writeStream);

		const fullUrl = request.protocol.concat("://").concat(request.hostname);
		const fileUrl = new URL(`/uploads/${filename}`, fullUrl).toString();

		return { fileUrl };
	});
}
