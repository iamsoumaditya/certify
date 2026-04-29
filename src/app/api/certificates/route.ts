import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { certificates, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get the user's DB ID
    const dbUsers = await db.select().from(users).where(eq(users.clerkId, userId));
    if (dbUsers.length === 0) {
      return new Response("User not found in database", { status: 404 });
    }
    const dbUser = dbUsers[0];

    const body = await request.json();
    const { courseName, instructorName, courseLength, completionDate, cloudinaryUrl, cloudinaryId } = body;

    // Get current max reference number for this user
    const userCerts = await db.select()
      .from(certificates)
      .where(eq(certificates.userId, dbUser.id))
      .orderBy(desc(certificates.createdAt));
      
    const nextRefNum = userCerts.length + 1;
    const referenceNo = nextRefNum.toString().padStart(4, '0');
    
    const newId = uuidv4();

    await db.insert(certificates).values({
      id: newId,
      userId: dbUser.id,
      courseName,
      instructorName,
      courseLength,
      completionDate: new Date(completionDate).toISOString().split('T')[0],
      referenceNo,
      cloudinaryUrl: cloudinaryUrl ?? null,
      cloudinaryId: cloudinaryId ?? null,
    });

    return Response.json({ id: newId, referenceNo });
  } catch (error) {
    console.error("Failed to create certificate:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const dbUsers = await db.select().from(users).where(eq(users.clerkId, userId));
    if (dbUsers.length === 0) {
      return new Response("User not found in database", { status: 404 });
    }
    const dbUser = dbUsers[0];

    const userCerts = await db.select()
      .from(certificates)
      .where(eq(certificates.userId, dbUser.id))
      .orderBy(desc(certificates.createdAt));

    return Response.json({ certificates: userCerts });
  } catch (error) {
    console.error("Failed to fetch certificates:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
