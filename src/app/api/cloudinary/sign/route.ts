import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { paramsToSign } = body;
    const timestamp = Math.round(Date.now() / 1000);

    const signingParams = {
      ...paramsToSign,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      signingParams,
      process.env.CLOUDINARY_API_SECRET!
    );

    return Response.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error("Cloudinary sign error:", error);
    return new Response("Internal Error", { status: 500 });
  }
}
