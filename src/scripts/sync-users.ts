import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Environment variables
const API_URL = "https://mediratelocaldev.kinde.com/api/v1/users";
const API_TOKEN = process.env.KINDE_API_TOKEN;

if (!API_TOKEN) {
  throw new Error("KINDE_API_TOKEN is missing in environment variables.");
}

async function fetchAndSyncUsers(nextToken?: string) {
  try {
    const url = nextToken ? `${API_URL}?next_token=${nextToken}` : API_URL;

    // Fetch users from the API
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    const { users, next_token } = response.data;

    // Loop through each user and sync into the database
    for (const user of users) {
      const { id, email, first_name, last_name, created_on, is_suspended, last_signed_in, total_sign_ins, failed_sign_ins } = user;

      const existingUser = await prisma.user.findUnique({
        where: { kindeId: id },
      });

      if (existingUser) {
        // Update the existing user
        await prisma.user.update({
          where: { kindeId: id },
          data: {
            email,
            firstName: first_name,
            lastName: last_name,
            updatedAt: new Date(),
            isSuspended: is_suspended,
            lastSignedIn: last_signed_in ? new Date(last_signed_in) : null,
            totalSignIns: total_sign_ins,
            failedSignIns: failed_sign_ins,
          },
        });
      } else {
        // Create a new user
        await prisma.user.create({
          data: {
            kindeId: id,
            email,
            firstName: first_name,
            lastName: last_name,
            createdAt: created_on ? new Date(created_on) : new Date(),
            updatedAt: new Date(),
            isSuspended: is_suspended,
            lastSignedIn: last_signed_in ? new Date(last_signed_in) : null,
            totalSignIns: total_sign_ins,
            failedSignIns: failed_sign_ins,
          },
        });
      }
    }

    // Handle pagination if there's a next_token
    if (next_token) {
      console.log("Fetching next page with token:", next_token);
      await fetchAndSyncUsers(next_token);
    }

    console.log("User synchronization completed successfully.");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error syncing users:", error.message);
    } else {
      console.error("Unknown error:", error);
    }

    // Log the detailed error response if available
    if (axios.isAxiosError(error) && error.response) {
      console.error("API Response Error:", error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

fetchAndSyncUsers();
