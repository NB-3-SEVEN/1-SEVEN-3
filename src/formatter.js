export const formatGroupResponse = (group) => {
  if (!group) throw new Error("그룹 데이터는 필수입니다.");

  const owner = group.participants.find(
    (p) => p.nickname === group.ownerNickname
  );

  const participants = group.participants.map((participant) => {
    return {
      id: participant.id,
      nickname: participant.nickname,
      createdAt: Date.parse(participant.createdAt),
      updatedAt: Date.parse(participant.updatedAt),
    };
  });

  const tags = group.TagGroup.map((tag) => {
    return tag.tag.name;
  });
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    photoUrl: group.photoUrl,
    goalRep: group.goalRep,
    discordWebhookUrl: group.discordWebhookUrl,
    discordInviteUrl: group.discordInviteUrl,
    likeCount: group.likeCount,
    tags: tags,
    owner: {
      id: owner.id,
      nickname: owner.nickname,
      createdAt: Date.parse(owner.createdAt),
      updatedAt: Date.parse(owner.updatedAt),
    },
    participants: participants,
    createdAt: Date.parse(group.createdAt),
    updatedAt: Date.parse(owner.updatedAt),
    badges: group.badges,
  };
};
