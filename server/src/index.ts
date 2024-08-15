import { neon } from '@neondatabase/serverless'
import { eq, AnyColumn, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'
import { Hono, Schema } from 'hono'
import * as schema from './db/schema'

export type Env = {
	DB_URL: string
}

const app = new Hono<{Bindings:Env}>()

const increment = (column: AnyColumn, value = 1) => {
	return sql`${column} + ${value}`;
};

app.post('/getLevel/:id', async (ctx) => {
	const { id } = ctx.req.param()
	let idInt

	try {
		idInt = parseInt(id)
	} catch {
		return ctx.json({})
	}

	const sql = neon(ctx.env.DB_URL)
	const db = drizzle(sql, { schema })

	const level = await db.query.levels.findFirst({
		where: eq(schema.levels.id, idInt),
		with: {
			shinies: {
				with: {
					user: true
				}
			}
		}
	})

	return ctx.json(level)
})

app.post('/getUser/:id', async (ctx) => {
	const { id } = ctx.req.param()
	let idInt

	try {
		idInt = parseInt(id)
	} catch {
		return ctx.json({})
	}

	const sql = neon(ctx.env.DB_URL)
	const db = drizzle(sql, { schema })

	const user = await db.query.users.findFirst({
		where: eq(schema.users.id, idInt),
		with: {
			shinies: {
				with: {
					level: true
				}
			}
		}
	})

	return ctx.json(user)
})

app.post('/postShiny', async (ctx) => {
	const data = await ctx.req.formData();

	const sessionID = data.get("sessionID") as string
	const level = data.get("level") as string

	let id
	
	try {
		id = parseInt(level)
	} catch {
		return ctx.text("-1")
	}

	const userInfo: any = await fetch("https://gd.figm.io/authentication/validate", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			sessionID: sessionID
		})
	}).then(response => response.json())

	if (userInfo == "-1") {
		return ctx.text("-1")
	}

	const sql = neon(ctx.env.DB_URL)
	const db = drizzle(sql, { schema })

	let levelObj = await db.query.levels.findFirst({
		where: eq(schema.levels.id, id)
	})

	if (!levelObj) {
		const levelInfo = await fetch("http://www.boomlings.com/database/getGJLevels21.php", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				"type": "0",
				"str": level,
				"secret": "Wmfd2893gb7",
			})
		}).then(res => res.text())

		console.log(levelInfo, level)

		const levelSplit = levelInfo.split(":")

		if (levelSplit[2] != "2") {
			return ctx.text("-1")
		}

		const name = levelSplit[3]

		levelObj = {
			id: id,
			name: name
		}

		await db.insert(schema.levels).values(levelObj)
	}

	await db.insert(schema.users)
		.values({id: userInfo.accountID, username: userInfo.username})
		.onConflictDoUpdate({
			target: schema.users.id,
			set: { username: userInfo.username }
		})
	
	await db.insert(schema.shinies)
		.values({userId: userInfo.accountID, levelId: levelObj.id})
		.onConflictDoUpdate({
			target: [schema.shinies.userId, schema.shinies.levelId],
			set: { count: increment(schema.shinies.count) }
		})

	return ctx.text("Ok")
})

export default app;