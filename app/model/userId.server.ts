import { getUserId as getSessionUserId, requireUserId as requireSessionUserId } from "~/utils/session.server";

// Export session-based user identification
export const getUserId = getSessionUserId;
export const requireAuth = requireSessionUserId;
