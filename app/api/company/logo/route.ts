import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { API_BASE_URL, COOKIE_NAMES } from "@/lib/config";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN);

    if (!sessionToken) {
      console.error("[Company Logo Upload Proxy] No session token found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the form data from the request
    const formData = await request.formData();

    console.log("[Company Logo Upload Proxy] Uploading to backend:", {
      url: `${API_BASE_URL}/api/company/logo`,
      hasLogo: formData.has("logo"),
    });

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/api/company/logo`, {
      method: "POST",
      headers: {
        Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${sessionToken.value}`,
      },
      body: formData,
    });

    console.log("[Company Logo Upload Proxy] Backend response:", {
      status: response.status,
      statusText: response.statusText,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Company Logo Upload Proxy] Backend error:", errorText);
      let errorMessage = "Failed to upload logo";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        // Use default error message
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log("[Company Logo Upload Proxy] Success, returning:", data);

    // Revalidate company cache to fetch updated logo
    revalidateTag("company");
    console.log("[Company Logo Upload Proxy] Revalidated company cache");

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Company Logo Upload Proxy] Exception:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN);

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/api/company/logo`, {
      method: "DELETE",
      headers: {
        Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${sessionToken.value}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to remove logo";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        // Use default error message
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status },
      );
    }

    const data = await response.json();
    revalidateTag("company");

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Company Logo Delete Proxy] Exception:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
