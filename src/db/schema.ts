import { pgTable, text, timestamp, uuid, date } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // using custom UUID generation on insert
  clerkId: text('clerk_id').unique(),
  email: text('email').unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const certificates = pgTable('certificates', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  courseName: text('course_name'),
  instructorName: text('instructor_name'),
  courseLength: text('course_length'),
  completionDate: date('completion_date'),
  referenceNo: text('reference_no'),
  cloudinaryUrl: text('cloudinary_url'),
  cloudinaryId: text('cloudinary_id'),
  createdAt: timestamp('created_at').defaultNow(),
});
