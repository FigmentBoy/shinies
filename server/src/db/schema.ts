import { relations } from 'drizzle-orm'
import { pgTable, integer, text, primaryKey } from 'drizzle-orm/pg-core'

export const levels = pgTable('levels', {
    id: integer('id').primaryKey().notNull(),
    name: text('name')
})

export const levelRelations = relations(levels, ({ many }) => ({
    shiners: many(levelsToUsers),
}))

export const users = pgTable('users', {
    id: integer('id').primaryKey().notNull(),
    username: text('username'),
})

export const userRelations = relations(users, ({ many }) => ({
    shinies: many(levelsToUsers)
}))

export const levelsToUsers = pgTable('levels_to_users', {
    userId: integer('user_id')
        .notNull()
        .references(() => users.id),
    levelId: integer('level_id')
        .notNull()
        .references(() => levels.id)
    },
    (t) => ({
        pk: primaryKey({ columns: [t.userId, t.levelId]})
    })
)