import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  // Add your logic to store user credentials in a database
  // For example, insert into a users table
  const user = { email, password, name };

  // If registration is successful
  return NextResponse.json({ message: "User registered successfully." }, { status: 201 });

  // If registration fails
  // return NextResponse.json({ message: "Registration failed." }, { status: 400 });
}
