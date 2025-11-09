import { NextRequest, NextResponse } from "next/server";
import { UserDatabaseService } from "@/lib/user-database";

const userDbService = new UserDatabaseService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const stats = await userDbService.getUserStats();
        return NextResponse.json({ success: true, data: stats });

      case 'active':
        const activeUsers = await userDbService.getActiveUsers();
        return NextResponse.json({ success: true, data: activeUsers });

      case 'get':
        const userId = searchParams.get('userId');
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
          );
        }
        const user = await userDbService.getUser(parseInt(userId));
        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: user });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: stats, active, or get' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
