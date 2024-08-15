import { relations } from 'drizzle-orm'
import { pgTable, integer, text, primaryKey } from 'drizzle-orm/pg-core'

export const levels = pgTable('levels', {
    id: integer('id').primaryKey().notNull(),
    name: text('name')
})

export const levelRelations = relations(levels, ({ many }) => ({
    shinies: many(shinies)
}))

export const users = pgTable('users', {
    id: integer('id').primaryKey().notNull(),
    username: text('username'),
})

export const userRelations = relations(users, ({ many }) => ({
    shinies: many(shinies)
}))

export const shinies = pgTable('shinies', {
        userId: integer('user_id')
            .notNull()
            .references(() => users.id, {
                onDelete: 'cascade'
            }),
        levelId: integer('level_id')
            .notNull()
            .references(() => levels.id),
        count: integer('count')
            .default(1)
            .notNull(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.userId, t.levelId]})
    })
)

export const shinyRelations = relations(shinies, ({ one }) => ({
    user: one(users, {
        fields: [shinies.userId],
        references: [users.id]
    }),
    level: one(levels, {
        fields: [shinies.levelId],
        references: [levels.id]
    })
}))