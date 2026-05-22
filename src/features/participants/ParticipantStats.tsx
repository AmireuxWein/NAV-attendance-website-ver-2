export function ParticipantStats({
  totalParticipants,
  groupStats,
  defaultOrder
}: {
  totalParticipants: number;
  groupStats: Record<string, number>;
  defaultOrder: string[];
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div className="bg-surface-container-lowest rounded-3xl p-5 custom-shadow border border-outline-variant/10">
        <p className="text-xs font-bold text-outline uppercase tracking-widest mb-1">Tổng cộng</p>
        <p className="text-3xl font-bold text-primary">{totalParticipants}</p>
      </div>
      {defaultOrder.map(group => (
        <div key={group} className="bg-surface-container-lowest rounded-3xl p-5 custom-shadow border border-outline-variant/10">
          <p className="text-xs font-bold text-outline uppercase tracking-widest mb-1">{group}</p>
          <p className="text-3xl font-bold text-tertiary">{groupStats[group] || 0}</p>
        </div>
      ))}
    </div>
  );
}
