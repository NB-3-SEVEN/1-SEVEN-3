export const formatGroupResponse = (group) => {
  if (!group) throw new Error("그룹 데이터는 필수입니다.");

  const owner = group.participants.find(
    (p) => p.nickname === group.ownerNickname
  );

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    photoUrl: group.photoUrl,
    goalRep: group.goalRep,
    discordwebhookUrl: group.discordwebhookUrl,
    discordInviteUrl: group.discordInviteUrl,
    likeCount: group.likeCount,
    tags: group.tags,
    owner: {
      id: owner.id,
      nickname: owner.nickname,
      createdAt: Date.parse(owner.createdAt),
      updatedAt: Date.parse(owner.updatedAt),
    },
    participants: [
      owner,
      ...group.participants
        .filter((p) => p.id !== owner.id)
        .map((p) => ({
          id: p.id,
          nickname: p.nickname,
          createdAt: Date.parse(p.createdAt),
          updatedAt: Date.parse(p.updatedAt),
        })),
    ],
    createdAt: Date.parse(group.createdAt),
    updatedAt: Date.parse(owner.updatedAt),
    badges: group.badges,
  };
};
