import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface EventFormProps {
  onClose: () => void;
}

export function EventForm({ onClose }: EventFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dateTime: new Date(),
    location: "",
    rsvpDeadline: new Date(),
    maxAttendees: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          hostId: session?.user.id,
          dateTime: formData.dateTime.toISOString(),
          rsvpDeadline: formData.rsvpDeadline.toISOString(),
        }),
      });

      if (response.ok) {
        onClose();
        router.refresh();
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Event</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={format(formData.dateTime, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dateTime: new Date(e.target.value),
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              RSVP Deadline
            </label>
            <input
              type="datetime-local"
              value={format(formData.rsvpDeadline, "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rsvpDeadline: new Date(e.target.value),
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Maximum Attendees
            </label>
            <input
              type="number"
              value={formData.maxAttendees}
              onChange={(e) =>
                setFormData({ ...formData, maxAttendees: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create Event
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
