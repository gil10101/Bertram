import { NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/backend/webhooks";
import type { UserJSON } from "@clerk/backend";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

function getPrimaryEmail(user: UserJSON): string {
  if (!user.primary_email_address_id || !user.email_addresses?.length) {
    return "";
  }
  const primary = user.email_addresses.find(
    (e) => e.id === user.primary_email_address_id
  );
  return primary?.email_address ?? "";
}

function getDisplayName(user: UserJSON): string {
  return [user.first_name, user.last_name].filter(Boolean).join(" ");
}

export async function POST(request: Request) {
  let evt;
  try {
    evt = await verifyWebhook(request);
  } catch {
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabase();

    switch (evt.type) {
      case "user.created": {
        const email = getPrimaryEmail(evt.data);
        const displayName = getDisplayName(evt.data);

        const { error } = await supabase.from("users").upsert(
          {
            clerk_id: evt.data.id,
            email,
            display_name: displayName,
          },
          { onConflict: "clerk_id" }
        );

        if (error) {
          console.error("Supabase upsert failed (user.created):", error);
          return NextResponse.json(
            { error: "Database operation failed" },
            { status: 500 }
          );
        }
        break;
      }

      case "user.updated": {
        const email = getPrimaryEmail(evt.data);
        const displayName = getDisplayName(evt.data);

        const { error } = await supabase
          .from("users")
          .update({ email, display_name: displayName })
          .eq("clerk_id", evt.data.id);

        if (error) {
          console.error("Supabase update failed (user.updated):", error);
          return NextResponse.json(
            { error: "Database operation failed" },
            { status: 500 }
          );
        }
        break;
      }

      case "user.deleted": {
        const clerkId = evt.data.id;
        if (!clerkId) {
          return NextResponse.json(
            { error: "Missing user ID in delete event" },
            { status: 400 }
          );
        }

        // Delete oauth_tokens first (user_id column stores the Clerk ID)
        const { error: tokenError } = await supabase
          .from("oauth_tokens")
          .delete()
          .eq("user_id", clerkId);

        if (tokenError) {
          console.error("Failed to delete oauth_tokens:", tokenError);
        }

        const { error: userError } = await supabase
          .from("users")
          .delete()
          .eq("clerk_id", clerkId);

        if (userError) {
          console.error("Failed to delete user:", userError);
          return NextResponse.json(
            { error: "Database operation failed" },
            { status: 500 }
          );
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
