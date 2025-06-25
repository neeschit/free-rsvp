import type { InviteMetadata } from '~/model/event';
import { Card } from '~/components/ui/Card';
import { Heading, Text } from '~/components/ui/Typography';
import { StatusBadge } from '~/components/ui/StatusBadge';

type InviteListProps = {
  invites: InviteMetadata[];
  className?: string;
};

export function InviteList({ invites, className = '' }: InviteListProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (invite: InviteMetadata) => {
    const status = invite.Status || "Sent";
    switch (status) {
      case "Opened":
        return <StatusBadge type="success">Opened</StatusBadge>;
      case "Clicked":
        return <StatusBadge type="info">Clicked</StatusBadge>;
      default:
        return <StatusBadge type="default">Sent</StatusBadge>;
    }
  };

  const getStatusDetails = (invite: InviteMetadata) => {
    const details = [`Sent ${formatDate(invite.SentAt)}`];
    
    if (invite.OpenedAt) {
      details.push(`Opened ${formatDate(invite.OpenedAt)}`);
    }
    
    if (invite.ClickedAt) {
      details.push(`Clicked ${formatDate(invite.ClickedAt)}`);
    }
    
    return details.join(' • ');
  };

  if (invites.length === 0) {
    return (
      <Card className={className}>
        <Heading level={3}>Sent Invites</Heading>
        <Text variant="muted" className="text-center py-8">
          No invites sent yet. Use the "Send Invites" button to invite guests!
        </Text>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="flex justify-between items-center mb-4">
        <Heading level={3}>Sent Invites ({invites.length})</Heading>
      </div>

      <div className="space-y-3">
        {invites.map((invite) => (
          <div 
            key={invite.InviteId} 
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Text className="font-medium">
                  {invite.RecipientName || invite.RecipientEmail}
                </Text>
                {invite.RecipientName && (
                  <Text variant="muted" className="text-sm">
                    ({invite.RecipientEmail})
                  </Text>
                )}
              </div>
              <Text variant="muted" className="text-xs">
                {getStatusDetails(invite)} • ID: {invite.InviteId.slice(-8)}
              </Text>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusBadge(invite)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <Text variant="muted" className="text-sm">
          💡 Invite tracking is handled by Amazon SES. Status updates will be available through SES Virtual Delivery Manager.
        </Text>
      </div>
    </Card>
  );
} 