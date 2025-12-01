import React from "react";
import { fmtDateOnly } from "../../utils/formatDate";
import { Card } from "../Card";

export default function ProfileCard({ user, totalCoursesCount, subscriptionStatus }) {
  let statusColor = "text-gray-500 bg-gray-100";
  if (subscriptionStatus === "Active") statusColor = "text-green-700 bg-green-100";
  else if (subscriptionStatus === "Inactive") statusColor = "text-red-700 bg-red-100";

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <img
          src={user?.profile_pic || "/placeholder-avatar.png"}
          alt="avatar"
          className="w-16 h-16 rounded-full object-cover border border-gray-200"
        />
        <div className="flex-1">
          <div className="font-semibold text-gray-800 text-lg">{user?.name}</div>
          <div className="text-sm text-gray-500">{user?.email}</div>
          <div className="mt-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}
            >
              {subscriptionStatus || "Unknown"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t pt-3 text-sm text-gray-500 space-y-1">
        <div>Joined: {fmtDateOnly(user?.createdAt)}</div>
        <div>Total Courses: <span className="font-semibold text-gray-800">{totalCoursesCount}</span></div>
      </div>
    </Card>
  );
}
