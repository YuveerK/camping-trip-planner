import { Avatar } from '../../../components/ui/Avatar';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import type { TripMember } from '../../../types';
import { getMemberDisplayName } from '../../../utils/format';

interface MembersListProps {
  members: TripMember[];
  currentUserId?: string;
  isOwner: boolean;
  onRemove: (member: TripMember) => void;
}

export function MembersList({ members, currentUserId, isOwner, onRemove }: MembersListProps) {
  return (
    <div className="flex flex-col gap-2">
      {members.map((member) => {
        const name = getMemberDisplayName(member);
        const email = member.user?.email ?? member.invitedEmail ?? '';
        const isCurrentUser = member.userId === currentUserId;

        return (
          <Card key={member.id} className="p-4">
            <div className="flex items-center gap-3">
              <Avatar name={name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-stone-800">
                    {name} {isCurrentUser && <span className="text-stone-400">(you)</span>}
                  </p>
                  <Badge variant={member.role === 'OWNER' ? 'earth' : 'gray'}>{member.role}</Badge>
                  {member.isPending && <Badge variant="yellow">Pending invite</Badge>}
                </div>
                <p className="text-xs text-stone-400 truncate">{email}</p>
              </div>
              {isOwner && member.role !== 'OWNER' && (
                <button onClick={() => onRemove(member)} className="p-1.5 rounded-lg text-stone-300 hover:bg-red-100 hover:text-red-500 transition-colors shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
