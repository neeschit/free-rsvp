import type { EventBase } from '~/model/event';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { Heading, Text } from '~/components/ui/Typography';
import * as patterns from '~/styles/tailwind-patterns';
import { useState } from 'react';

type EventDetailsProps = {
  event: EventBase;
  isHost: boolean;
  className?: string;
};

export function EventDetails({ event, isHost, className = '' }: EventDetailsProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [recipients, setRecipients] = useState<Array<{ email: string; name: string }>>([{ email: '', name: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ success: boolean; message: string } | null>(null);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    
    try {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date.getTime())
        ? date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        : dateString;
    } catch (e) {
      return dateString;
    }
  };

  const addRecipient = () => {
    setRecipients([...recipients, { email: '', name: '' }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, field: 'email' | 'name', value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index][field] = value;
    setRecipients(newRecipients);
  };

  const sendInvites = async () => {
    setIsLoading(true);
    setInviteResult(null);

    try {
      const validRecipients = recipients.filter(r => r.email.trim());
      if (validRecipients.length === 0) {
        setInviteResult({ success: false, message: 'Please add at least one email address' });
        return;
      }

      const formData = new FormData();
      formData.append('eventId', event.PK.replace('EVENT#', ''));
      formData.append('recipients', JSON.stringify(validRecipients));

      const response = await fetch('/api/send-invites', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setInviteResult({ 
          success: true, 
          message: `Successfully sent ${result.sentCount} invites!` 
        });
        setRecipients([{ email: '', name: '' }]);
      } else {
        setInviteResult({ 
          success: false, 
          message: 'Failed to send some invites. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error sending invites:', error);
      setInviteResult({ 
        success: false, 
        message: 'An error occurred while sending invites.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className={className}>
        <div className="flex justify-between items-start mb-2">
          <Heading level={2}>Event Details</Heading>
          {isHost && (
            <div className="flex gap-2">
              <Button 
                variant="secondary"
                onClick={() => setShowInviteModal(true)}
                className="whitespace-nowrap text-sm"
              >
                📧 Send Invites
              </Button>
              <a 
                  href="#invite-guests" 
                  className="lg:hidden text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap ml-4 mt-1"
              >
                  Start Inviting
              </a>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Heading level={3}>{event.EventName}</Heading>
            {event.Theme && (
              <Text variant="secondary" className="italic">Theme: {event.Theme}</Text>
            )}
          </div>
          
          <div className={patterns.gridCols2}>
            <div>
              <Text variant="muted" className="text-sm">Date</Text>
              <Text className="mt-1">
                {formatDate(event.Date)}
              </Text>
            </div>
            
            <div>
              <Text variant="muted" className="text-sm">Time</Text>
              <Text className="mt-1">
                {event.Time || 'TBD'}
              </Text>
            </div>
          </div>
          
          <div>
            <Text variant="muted" className="text-sm">Location</Text>
            <Text className="mt-1">
              {event.Location || 'TBD'}
            </Text>
          </div>
        </div>
      </Card>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <Heading level={3}>Send Invites</Heading>
              <Button 
                variant="outline" 
                onClick={() => setShowInviteModal(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              {recipients.map((recipient, index) => (
                <div key={index} className="space-y-2 p-3 border rounded-lg dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <Text variant="muted" className="text-sm">Guest {index + 1}</Text>
                    {recipients.length > 1 && (
                      <Button 
                        variant="outline" 
                        onClick={() => removeRecipient(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={recipient.email}
                    onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                    className="w-full p-2 border rounded dark:border-gray-600 dark:bg-gray-700"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Name (optional)"
                    value={recipient.name}
                    onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                    className="w-full p-2 border rounded dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
              ))}

              <Button 
                variant="outline" 
                onClick={addRecipient}
                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm"
              >
                + Add Another Recipient
              </Button>

              {inviteResult && (
                <div className={`p-3 rounded-lg ${
                  inviteResult.success 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {inviteResult.message}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="secondary"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={sendInvites}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Sending...' : 'Send Invites'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 