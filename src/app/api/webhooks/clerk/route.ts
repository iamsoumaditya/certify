import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { v4 as uuidv4 } from 'uuid'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env')
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

  // Handle event
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : null
    
    try {
      await db
        .insert(users)
        .values({
          id: uuidv4(),
          clerkId: id,
          email,
          firstName: first_name ?? null,
          lastName: last_name ?? null,
          imageUrl: image_url ?? null,
        })
        .onConflictDoUpdate({
          target: users.clerkId,
          set: {
            email,
            firstName: first_name ?? null,
            lastName: last_name ?? null,
            imageUrl: image_url ?? null,
          },
        })
      console.log(`User ${id} successfully inserted to DB`)
    } catch (err) {
      console.error('Error: Failed to insert user into DB:', err)
      return new Response('Error: DB insertion failed', { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    const email = email_addresses && email_addresses.length > 0 ? email_addresses[0].email_address : null
    
    try {
      await db.update(users).set({
        email,
        firstName: first_name ?? null,
        lastName: last_name ?? null,
        imageUrl: image_url ?? null,
      }).where(eq(users.clerkId, id))
      console.log(`User ${id} successfully updated in DB`)
    } catch (err) {
      console.error('Error: Failed to update user in DB:', err)
      return new Response('Error: DB update failed', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data
    try {
      await db.delete(users).where(eq(users.clerkId, id as string))
      console.log(`User ${id} successfully deleted from DB`)
    } catch (err) {
      console.error('Error: Failed to delete user from DB:', err)
      return new Response('Error: DB deletion failed', { status: 500 })
    }
  }

  return new Response('Webhook received', { status: 200 })
}
