import { prisma } from "../lib/prisma";
import { FastifyInstance } from "fastify";
import { z } from "zod";

export async function memoriesRoutes(app: FastifyInstance) {
	/* PRE HANDLER */
	app.addHook("preHandler", async (request) => {
		await request.jwtVerify();
	});

	/* READ */
	app.get("/memories", async (request) => {
		const memories = await prisma.memory.findMany({
			where: {
				userId: request.user.sub,
			},
			orderBy: {
				dateEvent: "asc",
			},
		});

		return memories.map((memory) => {
			return {
				id: memory.id,
				coverUrl: memory.coverUrl,
				userId: memory.userId,
				content: memory.content.substring(0, 115).concat("..."),
				createdAt: memory.createdAt,
				dateEvent: memory.dateEvent,
			};
		});
	});

	/* READ UNIQUE */
	app.get("/memories/:id", async (request, reply) => {
		const paramsSchema = z.object({
			id: z.string().uuid(),
		});

		const { id } = paramsSchema.parse(request.params);

		const memory = await prisma.memory.findUniqueOrThrow({
			where: {
				id,
			},
		});

		if (!memory.isPublic && memory.userId !== request.user.sub) {
			return reply.status(401).send();
		}
		return memory;
	});

	/* CREATE */
	app.post("/memories", async (request) => {
		const bodySchema = z.object({
			content: z.string(),
			coverUrl: z.string(),
			isPublic: z.coerce.boolean().default(false),
			dateEvent: z.coerce.date(),
		});

		const { content, coverUrl, isPublic, dateEvent } = bodySchema.parse(
			request.body
		);

		const memory = await prisma.memory.create({
			data: {
				content,
				coverUrl,
				isPublic,
				userId: request.user.sub,
				dateEvent,
			},
		});

		return memory;
	});

	/* UPDATE */
	app.put("/memories/:id", async (request, reply) => {
		console.log(request.user);
		const paramsSchema = z.object({
			id: z.string().uuid(),
		});

		const { id } = paramsSchema.parse(request.params);

		const bodySchema = z.object({
			content: z.string(),
			coverUrl: z.string(),
			isPublic: z.coerce.boolean().default(false),
			dateEvent: z.coerce.date(),
		});

		const { content, coverUrl, isPublic, dateEvent } = bodySchema.parse(
			request.body
		);

		let memory = await prisma.memory.findUniqueOrThrow({
			where: {
				id,
			},
		});

		if (memory.userId !== request.user.sub) {
			return reply.status(401).send();
		}

		memory = await prisma.memory.update({
			where: {
				id,
			},
			data: {
				content,
				coverUrl,
				isPublic,
				dateEvent,
			},
		});

		return memory;
	});

	/* DELETE */
	app.delete("/memories/:id", async (request, reply) => {
		const paramsSchema = z.object({
			id: z.string().uuid(),
		});

		const { id } = paramsSchema.parse(request.params);

		const memory = await prisma.memory.findUniqueOrThrow({
			where: {
				id,
			},
		});

		if (memory.userId !== request.user.sub) {
			return reply.status(401).send();
		}

		await prisma.memory.delete({
			where: {
				id,
			},
		});
	});
}
