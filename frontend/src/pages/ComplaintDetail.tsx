import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Complaint } from "../types";
import StatusBadge from "../components/StatusBadge";
import { complaintApi } from "../services/api";

const ComplaintDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      complaintApi.getComplaintById(id).then((data) => {
        setComplaint(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !complaint) return;

    await complaintApi.addComment(complaint.id, newComment, false);
    const updated = await complaintApi.getComplaintById(complaint.id);
    setComplaint(updated);
    setNewComment("");
  };

  const handleDelete = async () => {
    if (!complaint) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this complaint?",
    );
    if (!confirmDelete) return;

    await complaintApi.deleteComplaint(complaint.id);
    window.location.href = "/"; // redirect after delete
  };

  if (loading)
    return <div className="text-center py-20">Loading report details...</div>;
  if (!complaint)
    return (
      <div className="text-center py-20 text-red-500 font-bold">
        Report not found.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between text-sm mb-4">
        <div className="flex items-center gap-2 text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">
            Report #{complaint.id}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <div>
                    <StatusBadge status={complaint.status} />
                    <h1 className="text-2xl font-bold text-slate-900 mt-2">
                      {complaint.title}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                      Submitted:{" "}
                      {new Date(complaint.dateSubmitted).toLocaleString()}
                    </p>
                    <div className="flex gap-2 mt-5">
                    <button
                      onClick={handleDelete}
                      className="text-lg px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-800 cursor-pointer active:bg-red-800"
                    >
                      Delete
                    </button>
                  </div>
                  </div>
                  
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Priority
                  </div>
                  <div
                    className={`font-bold ${
                      complaint.priority === "HIGH" ||
                      complaint.priority === "CRITICAL"
                        ? "text-red-600"
                        : "text-slate-600"
                    }`}
                  >
                    {complaint.priority}
                  </div>
                </div>
              </div>

              <div className="prose prose-slate max-w-none pb-8 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                  Report Content
                </h4>
                <p className="text-slate-700 whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-bold text-slate-800">
                Activity Log & Communication
              </h2>
            </div>

            <div className="p-6 space-y-6 max-h-[400px] overflow-y-auto">
              {complaint.comments.length > 0 ? (
                complaint.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`flex flex-col ${comment.isAdmin ? "items-start" : "items-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                        comment.isSystem
                          ? "bg-slate-200 text-slate-600"
                          : comment.isAdmin
                            ? "bg-slate-100 text-slate-800 border border-slate-200"
                            : "bg-blue-600 text-white"
                      }`}
                    >
                      <p className="text-sm">{comment.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold px-2">
                      {comment.isSystem
                        ? "System"
                        : comment.isAdmin
                          ? "Staff"
                          : "You"}{" "}
                      •{" "}
                      {new Date(comment.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 text-sm py-4">
                  No comments yet.
                </div>
              )}
            </div>

            <form
              onSubmit={handleAddComment}
              className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2"
            >
              <input
                type="text"
                className="flex-grow px-4 py-2 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-lg">
            <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-widest opacity-60">
              Report Info
            </h3>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Category</span>
                <span className="font-bold text-blue-400">
                  {complaint.category}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Privacy</span>
                <span className="font-bold text-slate-200">
                  {complaint.isAnonymous ? "Anonymous" : "Public"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Reference ID</span>
                <span className="font-mono text-slate-500">{complaint.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
