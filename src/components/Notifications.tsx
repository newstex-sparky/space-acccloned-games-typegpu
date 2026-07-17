import type { Notification } from '../engine/types';

interface Props {
  notifications: Notification[];
}

export function Notifications({ notifications }: Props) {
  return (
    <div className="notifications-container">
      {notifications.map((n) => (
        <div key={n.id} className={`notification notif-${n.type}`}>
          {n.text}
        </div>
      ))}
    </div>
  );
}