import { pgTable, serial, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const userTable = pgTable('user', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
})

export const userSessionTable = pgTable('user_session', {
  userId: integer('user_id').primaryKey().references(() => userTable.id),
  sessionKey: text('session_key').notNull().unique(),
})

const reasoningStepColumns = (current: boolean) => {
  const question = text('question').notNull();
  return {
    question: current ? question.unique() : question,
    analysis: text('analysis').notNull(),
    annotatedAnalysis: jsonb('annotated_analysis'),
    conclusion: text('conclusion').notNull(),
  }
}

export const reasoningStepTable = pgTable('reasoning_step', {
  id: serial('id').primaryKey(),
  ...reasoningStepColumns(true),
  createdBy: integer('created_by').notNull().references(() => userTable.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const reasoningStepVersionTable = pgTable('reasoning_step_version', {
  id: serial('id').primaryKey(),
  reasoningStepId: integer('reasoning_step_id').notNull().references(() => reasoningStepTable.id),
  version: integer('version').notNull(),
  ...reasoningStepColumns(false),
  createdBy: integer('created_by').notNull().references(() => userTable.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const reasoningDependencyTable = pgTable('reasoning_dependency', {
  sourceId: integer('source_id').notNull().references(() => reasoningStepTable.id),
  targetId: integer('target_id').notNull().references(() => reasoningStepTable.id),
  createdBy: integer('created_by').notNull().references(() => userTable.id),
})

export const featuredTable = pgTable('featured', {
  id: integer('id').primaryKey().references(() => reasoningStepTable.id),
  conclusion: text('conclusion'),
})

export const definitionTable = pgTable('definition', {
  id: serial('id').primaryKey(),
  term: text('term').notNull(),
  text: text('text').notNull(),
  createdBy: integer('created_by').notNull().references(() => userTable.id),
})

export const adminTable = pgTable('admin', {
  userId: integer('user_id').primaryKey().references(() => userTable.id),
})

export const reasoningStepMessageTable = pgTable('reasoning_step_message', {
  id: serial('id').primaryKey(),
  reasoningStepId: integer('reasoning_step_id').notNull().references(() => reasoningStepTable.id),
  userId: integer('user_id').notNull().references(() => userTable.id),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
