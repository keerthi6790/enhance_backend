import prisma from "./Prisma";

export async function checkUserCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
    },
  });

  if (!user) return 0;

  // User's own credits
  let totalCredits = user.credits;

  return totalCredits;
}

export async function deductCredits(
  userId: string,
  amount: number,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  let remainingAmount = amount;

  // First, deduct from user's own credits
  if (user.credits > 0) {
    const deductFromUser = Math.min(user.credits, remainingAmount);
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: deductFromUser,
        },
      },
    });
    remainingAmount -= deductFromUser;
  }

  if (remainingAmount > 0) {
    throw new Error("Insufficient credits");
  }
}
