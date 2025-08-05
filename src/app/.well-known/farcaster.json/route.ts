import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const name = 'Goobie Game';

  const accountAssociation = {
    header: 'eyJmaWQiOjg2OTk5OSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDc2ZDUwQjBFMTQ3OWE5QmEyYkQ5MzVGMUU5YTI3QzBjNjQ5QzhDMTIifQ',
    payload: 'eyJkb21haW4iOiJwb255b25nbWktZ29vYmllZ2FtZTIudmVyY2VsLmFwcCJ9', 
    signature: 'MHg4ZTY4OTU3MTI4YTlmZGQ5NjFlMjg0Mzk2ZmI3Y2ZhZTk1YjJhZDcyODMxOTBkYTc0ZmMzYTI0ZGUyNzkwNjA3MjRiNmJmM2ViNjRhNTQ1M2E1Y2NmZjlkNWVhOTcxZjAzZTU0MTY0MjVmY2I4M2YyYTBjZmNlMjNjMmRkOThkMzFj'
  };

  const frame = {
    version: "1",
    name: name,
    iconUrl: `${appUrl}/icon.png`,
    homeUrl: appUrl,
    imageUrl: `${appUrl}/og.png`,
    buttonTitle: "Open",
    webhookUrl: `${appUrl}/api/webhook`,
    splashImageUrl: `${appUrl}/splash.png`,
    splashBackgroundColor: "#555555",
    primaryCategory: "games",
    tags: ["goobie", "game", "farcaster", "mini-app", "play"]
  };

  return NextResponse.json({
    accountAssociation,
    frame
  });
}
