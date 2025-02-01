import { NextResponse } from "next/server";


export async function POST(req: Request) {
  const { password, email, first_name, last_name} = await req.json();
  // Add your logic to store user credentials in a database
  // For example, insert into a users table
  //const user = { email, password, name };
  try {
    const res = await fetch("http://176.34.210.163:4000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, email, first_name, last_name }),
    });

    // Check if the response is ok
    if (!res.ok) {
      const errorText = await res.text(); // Get the error details as text
      console.error("Server error:", errorText);
      
      return NextResponse.json({ message: "Server error" }, { status: 400 });
    }

    // Parse the JSON response
    const data = await res.json();
    console.log(data)
    return NextResponse.json({ message: "User registered successfully." }, { status: 201 });

  } catch (error) {
    console.error("Error during fetch:", error);
  }

  return NextResponse.json({ message: "Registration failed." }, { status: 400 });

  // If registration is successful
  // return NextResponse.json({ message: "User registered successfully." }, { status: 201 });
  // If registration fails
  // return NextResponse.json({ message: "Registration failed." }, { status: 400 });
}
