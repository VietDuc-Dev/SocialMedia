import SessionModel, { SessionDocument } from "../models/session.model";
import { BadRequestException } from "../utils/appError";

export const getSessionsService = async (userId: string, sessionId: string) => {
  const sessions = await SessionModel.find(
    { userId, expiresAt: { $gt: Date.now() } },
    { _id: 1, userAgent: 1, createdAt: 1 },
    { sort: { createdAt: -1 } }
  );

  if (!sessions || sessions.length === 0) {
    throw new BadRequestException("No active sessions found");
  }

  const formattedSessions = sessions.map((session) => ({
    ...session.toObject(),
    ...(session.id === sessionId && {
      isCurrent: true,
    }),
  }));

  return { sessions: formattedSessions };
};

export const deleteSessionIdService = async (
  sessionId: string,
  userId: string
) => {
  const deleteSession = await SessionModel.findOneAndDelete({
    _id: sessionId,
    userId,
  });
  if (!deleteSession) {
    throw new BadRequestException("Session not found");
  }

  return {};
};
