import React, { useState, useEffect } from "react";
import { X, Briefcase, Trello, UserPlus, FileText } from "lucide-react";
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
      setName(editBoardData.name);
      setDescription(editBoardData.description);
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
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            {type === "workspace" && (
              <>
                <Briefcase className="w-5 h-5 text-sky-400" />
                <span className="font-bold text-sm tracking-tight">Create Workspace</span>
              </>
            )}
            {type === "board" && (
              <>
                <Trello className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-sm tracking-tight">Create Project Board</span>
              </>
            )}
            {type === "edit-board" && (
              <>
                <Trello className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm tracking-tight">Edit Board Details</span>
              </>
            )}
            {type === "invite" && (
              <>
                <UserPlus className="w-5 h-5 text-sky-400" />
                <span className="font-bold text-sm tracking-tight">Invite Workspace Members</span>
              </>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body & Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          
          {type !== "invite" ? (
            <>
              {/* Name field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {type === "workspace" ? "Workspace Title" : "Board Name"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={type === "workspace" ? "e.g. Design Team" : "e.g. Website Overhaul"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>

              {/* Description field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  placeholder={
                    type === "workspace" 
                      ? "Describe the purpose of this group or department..." 
                      : "Brief objectives of this board..."
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                />
              </div>
            </>
          ) : (
            /* Invite dropdown */
            <div className="space-y-4">
              <div className="text-xs text-slate-500 leading-normal">
                Invite registered users to <span className="font-bold text-slate-700">{activeWorkspace?.name}</span> to assign them cards and collaborate.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Team Member</label>
                {inviteable.length > 0 ? (
                  <select
                    required
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm text-slate-700 font-semibold focus:outline-none focus:border-indigo-500 transition shadow-xs"
                  >
                    <option value="">-- Choose Member --</option>
                    {inviteable.map(u => (
                      <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center text-xs text-slate-400 font-medium">
                    All registered users are already members of this workspace!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Submit Buttons */}
          <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={type === "invite" && inviteable.length === 0}
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {type === "workspace" && "Create Workspace"}
              {type === "board" && "Create Board"}
              {type === "edit-board" && "Save Details"}
              {type === "invite" && "Invite Member"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
