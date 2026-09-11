import React, { useState, useEffect } from "react";
import { X, Briefcase, Trello, UserPlus, Sparkles } from "lucide-react";
import { User, Workspace, Board } from "../types";

interface CreateModalProps {
  type: "workspace" | "board" | "edit-board" | "invite";
  activeWorkspace: Workspace | null;
  editBoardData?: Board | null;
  users: User[];
  onClose: () => void;
  onSubmitWorkspace: (name: string, description: string) => void;
  onSubmitBoard: (name: string, description: string) => void;
  onSubmitEditBoard: (boardId: string, name: string, description: string) => void;
  onSubmitInvite: (workspaceId: string, userId: string) => void;
}

export default function CreateModal({
  type,
  activeWorkspace,
  editBoardData,
  users,
  onClose,
  onSubmitWorkspace,
  onSubmitBoard,
  onSubmitEditBoard,
  onSubmitInvite
}: CreateModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  // Load initial editing parameters
  useEffect(() => {
    if (type === "edit-board" && editBoardData) {
      setName(editBoardData.name || "");
      setDescription(editBoardData.description || "");
    } else {
      setName("");
      setDescription("");
      setSelectedUserId("");
    }
  }, [type, editBoardData]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "workspace") {
      if (name.trim()) {
        onSubmitWorkspace(name.trim(), description.trim());
        onClose();
      }
    } else if (type === "board") {
      if (name.trim()) {
        onSubmitBoard(name.trim(), description.trim());
        onClose();
      }
    } else if (type === "edit-board" && editBoardData) {
      if (name.trim()) {
        onSubmitEditBoard(editBoardData.id, name.trim(), description.trim());
        onClose();
      }
    } else if (type === "invite") {
      if (activeWorkspace && selectedUserId) {
        onSubmitInvite(activeWorkspace.id, selectedUserId);
        onClose();
      }
    }
  };

  // Find users that are NOT yet in the active workspace
  const getInviteableUsers = () => {
    if (!activeWorkspace) return [];
    return users.filter(user => !activeWorkspace.members.includes(user.id));
  };

  const inviteable = getInviteableUsers();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f172a]/95 backdrop-blur-2xl rounded-3xl w-full max-w-md shadow-2xl border border-white/[0.12] overflow-hidden animate-in zoom-in-95 duration-200 text-slate-100">

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {type === "workspace" && (
              <>
                <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-sm tracking-tight text-white">Create Workspace</span>
              </>
            )}
            {type === "board" && (
              <>
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                  <Trello className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-sm tracking-tight text-white">Create Project Board</span>
              </>
            )}
            {type === "edit-board" && (
              <>
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
                  <Trello className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-sm tracking-tight text-white">Edit Board Details</span>
              </>
            )}
            {type === "invite" && (
              <>
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-sm tracking-tight text-white">Invite Team Member</span>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {type !== "invite" ? (
            <>
              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {type === "workspace" ? "Workspace Name" : "Board Title"} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder={type === "workspace" ? "e.g. CS201 - Advanced Algorithms" : "e.g. Sprint Roadmap"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>

              {/* Description Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Description <span className="text-slate-500 text-[11px]">(Optional)</span>
                </label>
                <textarea
                  placeholder={type === "workspace" ? "Provide context on this workspace..." : "Brief overview of what this board tracks..."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none transition resize-none"
                />
              </div>

              {type === "board" && activeWorkspace && (
                <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs text-slate-400">
                  Creating board inside: <span className="font-semibold text-indigo-300">{activeWorkspace.name}</span>
                </div>
              )}
            </>
          ) : (
            /* Invite Team Member View */
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Select User to Invite <span className="text-rose-400">*</span>
                </label>
                {inviteable.length > 0 ? (
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    required
                    className="w-full bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="" className="bg-slate-900 text-slate-400">Choose team member...</option>
                    {inviteable.map((u) => (
                      <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                        {u.username} ({u.role}) — {u.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-center text-xs text-slate-400">
                    All available users are already members of this workspace.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex gap-2.5 justify-end pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={type === "invite" && !selectedUserId}
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              {type === "edit-board" ? "Save Changes" : type === "invite" ? "Send Invite" : "Create"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
