import { db } from '@/db';
import { certificates, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if the UUID has the 'UC-' prefix and remove it
    const uuid = id.startsWith('UC-') ? id.slice(3) : id;
    
    const certs = await db.select().from(certificates).where(eq(certificates.id, uuid));
    
    if (certs.length === 0) {
      return new Response("Certificate not found", { status: 404 });
    }
    
    const cert = certs[0];
    const certUsers = await db.select().from(users).where(eq(users.id, cert.userId!));
    
    if (certUsers.length === 0) {
      return new Response("User not found", { status: 404 });
    }
    
    const certOwner = certUsers[0];
    
    // Check ownership
    const { userId } = await auth();
    const isOwner = userId === certOwner.clerkId;
    
    return Response.json({
      certificate: cert,
      user: {
        firstName: certOwner.firstName,
        lastName: certOwner.lastName,
      },
      isOwner
    });
  } catch (error) {
    console.error("Failed to fetch certificate:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { cloudinaryUrl, cloudinaryId } = body;

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, userId));
    if (dbUsers.length === 0) {
      return new Response("User not found", { status: 404 });
    }

    const dbUser = dbUsers[0];

    const existing = await db.select().from(certificates).where(eq(certificates.id, id));
    if (existing.length === 0) {
      return new Response("Certificate not found", { status: 404 });
    }

    if (existing[0].userId !== dbUser.id) {
      return new Response("Forbidden", { status: 403 });
    }

    await db
      .update(certificates)
      .set({
        cloudinaryUrl: cloudinaryUrl ?? null,
        cloudinaryId: cloudinaryId ?? null,
      })
      .where(eq(certificates.id, id));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to update certificate:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
