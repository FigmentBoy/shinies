import { neon } from '@neondatabase/serverless'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'
import { Hono } from 'hono'
import * as schema from './db/schema'

export type Env = {
	DB_URL: string
}

const app = new Hono<{Bindings:Env}>()

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
			shiners: true
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
			shinies: true
		}
	})

	return ctx.json(user)
})

app.post('/postShiny/:sessionID/:level', async (ctx) => {
	const { sessionID, level } = ctx.req.param()

	let id
	
	try {
		id = parseInt(level)
	} catch {
		return ctx.text("-1")
	}

	const userInfo = await fetch("https://gd.figm.io/authentication/validate", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams({
			"sessionID": sessionID
		})
	}).then(response => response.json())

	
})

export default app;