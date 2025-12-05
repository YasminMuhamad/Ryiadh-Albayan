import React from "react";
import { Card } from "../../components/Card";
import { fmt } from "../../utils/formatDate";
import { CheckCircle, Clock, XCircle } from "lucide-react";

export default function PaymentsCard({ payments, coursesMap }) {
  return (
    <Card className="p-6">
      <h3 className="text-l font-semibold text-muted-foreground">Recent Payments</h3>
      <p className="text-md text-gray-600 mb-4">
        Track your latest course payments and statuses
      </p>

      <div className="space-y-3">
        {payments.length === 0 && (
          <div className="text-center text-gray-400 py-6">No payments found.</div>
        )}

        {payments.map((p) => {
          const courseTitle = coursesMap[p.courseId]?.title || "General";

          // اختيار أيقونة ولون حسب الحالة
          let statusColor = "";
          let StatusIcon = null;

          switch (p.status) {
            case "paid":
              statusColor = "text-green-700 bg-green-100";
              StatusIcon = <CheckCircle className="w-4 h-4" />;
              break;
            case "pending":
              statusColor = "text-yellow-700 bg-yellow-100";
              StatusIcon = <Clock className="w-4 h-4" />;
              break;
            case "refunded":
              statusColor = "text-red-700 bg-red-100";
              StatusIcon = <XCircle className="w-4 h-4" />;
              break;
            default:
              statusColor = "text-gray-500 bg-gray-100";
              StatusIcon = null;
          }

          return (
            <div
              key={p.id}
              className="flex justify-between items-center p-4 rounded-xl border border-gray-200"
            >
              {/* Left: course & amount */}
              <div className="flex flex-col gap-1">
                <p className="font-medium text-gray-800">{courseTitle}</p>
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${statusColor}`}
                >
                  {StatusIcon}
                  {p.amount} {p.currency} • {p.status}
                </div>
              </div>

              {/* Right: date */}
              <div className="text-xs text-gray-400">{fmt(p.createdAt)}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
