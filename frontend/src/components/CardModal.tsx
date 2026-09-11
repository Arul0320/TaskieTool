import React, { useState } from "react";
import {
  X,
  User as UserIcon,
  Clock,
  CheckSquare,
  MessageSquare,
  Paperclip,
  History,
  Plus,
  Trash2,
  Check,
  Tag,
  Calendar,
  AlertCircle,
  FileText,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { Card, User, List, CardPriority } from "../types";

interface CardModalProps {
  card: Card;
  lists: List[];
  users: User[];
  currentUser: User | null;
  onClose: () => void;
  onUpdateCard: (cardId: string, updates: Partial<Card>) => void;
  onDeleteCard: (cardId: string) => void;
  onAddChecklistItem: (cardId: string, text: string) => void;
  onToggleChecklistItem: (cardId: string, itemId: string, isDone: boolean) => void;
  onDeleteChecklistItem: (cardId: string, itemId: string) => void;
  onAddComment: (cardId: string, text: string) => void;
  onDeleteComment: (cardId: string, commentId: string) => void;
  onAddAttachment: (cardId: string, name: string, dataUrl: string) => void;
  onDeleteAttachment: (cardId: string, attachmentId: string) => void;
  onMoveCard: (cardId: string, targetListId: string, targetIndex: number) => void;
}

export default function CardModal({
  card,
  lists,
  users,
  currentUser,
  onClose,
  onUpdateCard,
  onDeleteCard,
  onAddChecklistItem,
  onToggleChecklistItem,
  onDeleteChecklistItem,
  onAddComment,
  onDeleteComment,
  onAddAttachment,
  onDeleteAttachment,
  onMoveCard
}: CardModalProps) {
  // Tabs for main section
  const [activeTab, setActiveTab] = useState<"details" | "activity">("details");

  // Local input states
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  const [newChecklistText, setNewChecklistText] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [newCustomLabel, setNewCustomLabel] = useState("");

  const [uploading, setUploading] = useState(false);

  // Calculate checklist stats
  const totalChecklist = card.checklist ? card.checklist.length : 0;
  const completedChecklist = card.checklist ? card.checklist.filter(i => i.isDone).length : 0;
  const checklistPercentage = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  // Handle saving title
  const handleSaveTitle = () => {
    if (title.trim() && title.trim() !== card.title) {
      onUpdateCard(card.id, { title: title.trim() });
    }
    setIsEditingTitle(false);
  };

  // Handle saving description
  const handleSaveDesc = () => {
    if (description.trim() !== card.description) {
      onUpdateCard(card.id, { description: description.trim() });
    }
    setIsEditingDesc(false);
  };

  // Add checklist sub-task
  const handleAddChecklistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChecklistText.trim()) {
      onAddChecklistItem(card.id, newChecklistText.trim());
      setNewChecklistText("");
    }
  };

  // Add Comment
  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentText.trim()) {
      onAddComment(card.id, newCommentText.trim());
      setNewCommentText("");
    }
  };

  // Add dynamic custom label
  const handleAddCustomLabel = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCustomLabel.trim();
    if (!trimmed) return;
    const currentLabels = card.labels || [];
    if (!currentLabels.includes(trimmed)) {
      onUpdateCard(card.id, { labels: [...currentLabels, trimmed] });
    }
    setNewCustomLabel("");
  };

  // Remove dynamic label
  const handleRemoveLabel = (labelToRemove: string) => {
    const currentLabels = card.labels || [];
    onUpdateCard(card.id, { labels: currentLabels.filter(l => l !== labelToRemove) });
  };

  // Handle File Upload & Convert to Base64
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onAddAttachment(card.id, file.name, result);
        setUploading(false);
      };
      reader.onerror = () => {
        alert("Failed to read file.");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  // Find user details by user ID
  const getUserDetails = (userId: string) => {
    const u = users.find(user => user.id === userId);
    return u || { username: "Unassigned", avatarColor: "#64748b" };
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Date styling check
  const isDateOverdue = () => {
    if (!card.dueDate) return false;
    const currentColumn = lists.find(l => l.id === card.listId);
    if (currentColumn?.name.toLowerCase().includes("done")) return false;
    const today = new Date().toISOString().split("T")[0];
    return card.dueDate < today;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-2.5 sm:p-6 z-50 overflow-y-auto backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Card frame */}
      <div className="bg-[#0f172a]/95 backdrop-blur-2xl rounded-3xl w-full max-w-4xl shadow-2xl border border-white/[0.12] flex flex-col md:flex-row max-h-[92vh] overflow-y-auto md:overflow-hidden animate-in zoom-in-95 duration-200 text-slate-100">

        {/* Left Side Pane: Details, Checklists, Comments, Activities */}
        <div className="flex-1 p-5 sm:p-6 md:p-8 md:overflow-y-auto space-y-6">

          {/* Header Close & Navigation Tabs Row */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex bg-white/[0.04] p-1 rounded-xl text-xs font-semibold border border-white/[0.06]">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-4 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === "details"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Task Details
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "activity"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>History</span>
                <span className="text-[10px] bg-white/[0.1] text-indigo-300 px-1.5 py-0.2 rounded-full font-bold">
                  {card.activityHistory?.length || 0}
                </span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/[0.08] rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {activeTab === "details" ? (
            <>
              {/* Task Title Edit Section */}
              <div className="space-y-1">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={handleSaveTitle}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                      autoFocus
                      className="bg-slate-800 border border-indigo-500 rounded-xl px-3 py-1.5 text-base font-display font-bold text-white w-full focus:outline-none"
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <h2
                    onClick={() => setIsEditingTitle(true)}
                    className="text-lg md:text-xl font-display font-bold text-white hover:bg-white/[0.04] p-1.5 -ml-1.5 rounded-xl cursor-pointer transition"
                    title="Click to edit title"
                  >
                    {card.title}
                  </h2>
                )}
                <p className="text-xs text-slate-400">
                  in column <span className="font-semibold text-indigo-400">{lists.find(l => l.id === card.listId)?.name || "Default"}</span>
                </p>
              </div>

              {/* Labels Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Labels</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(card.labels || []).map((lbl) => (
                    <span
                      key={lbl}
                      className="group flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                    >
                      <span>{lbl}</span>
                      <button
                        onClick={() => handleRemoveLabel(lbl)}
                        className="hover:text-rose-400 transition cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {/* Add tag form */}
                  <form onSubmit={handleAddCustomLabel} className="inline-flex items-center">
                    <input
                      type="text"
                      placeholder="+ Add label"
                      value={newCustomLabel}
                      onChange={(e) => setNewCustomLabel(e.target.value)}
                      className="bg-white/[0.04] border border-white/[0.1] focus:border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none w-24 focus:w-32 transition-all"
                    />
                  </form>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Description</span>
                  </div>
                  {!isEditingDesc && (
                    <button
                      onClick={() => setIsEditingDesc(true)}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {isEditingDesc ? (
                  <div className="space-y-2">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Add detailed task notes or specifications..."
                      className="w-full bg-slate-800/90 border border-indigo-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveDesc}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Save Notes
                      </button>
                      <button
                        onClick={() => {
                          setDescription(card.description);
                          setIsEditingDesc(false);
                        }}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:bg-white/[0.06] rounded-xl transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingDesc(true)}
                    className="bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-3.5 text-xs text-slate-300 cursor-pointer min-h-[70px] leading-relaxed transition"
                  >
                    {card.description ? (
                      <p className="whitespace-pre-line">{card.description}</p>
                    ) : (
                      <span className="text-slate-500 italic">No description provided. Click here to write notes...</span>
                    )}
                  </div>
                )}
              </div>

              {/* Subtasks / Checklist Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Checklist ({completedChecklist}/{totalChecklist})</span>
                  </div>
                  {totalChecklist > 0 && (
                    <span className="text-xs font-mono font-bold text-emerald-400">{checklistPercentage}%</span>
                  )}
                </div>

                {/* Progress bar */}
                {totalChecklist > 0 && (
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${checklistPercentage}%` }}
                    ></div>
                  </div>
                )}

                {/* Checklist Items list */}
                <div className="space-y-1.5">
                  {(card.checklist || []).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition group"
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer flex-1 text-xs">
                        <input
                          type="checkbox"
                          checked={item.isDone}
                          onChange={(e) => onToggleChecklistItem(card.id, item.id, e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className={`transition ${item.isDone ? "line-through text-slate-500" : "text-slate-200"}`}>
                          {item.text}
                        </span>
                      </label>
                      <button
                        onClick={() => onDeleteChecklistItem(card.id, item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Checklist form */}
                <form onSubmit={handleAddChecklistSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add an item to checklist..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Attachments Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Paperclip className="w-3.5 h-3.5 text-sky-400" />
                    <span>Attachments ({(card.attachments || []).length})</span>
                  </div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{uploading ? "Uploading..." : "Upload File"}</span>
                    <input type="file" onChange={handleFileChange} className="hidden" disabled={uploading} />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(card.attachments || []).map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition text-xs"
                    >
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 truncate text-slate-300 hover:text-white"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                        <span className="truncate font-medium">{att.name}</span>
                      </a>
                      <button
                        onClick={() => onDeleteAttachment(card.id, att.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Discussion ({(card.comments || []).length})</span>
                </div>

                {/* Comment Input */}
                <form onSubmit={handleAddCommentSubmit} className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Write a comment or update..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                    >
                      Post Comment
                    </button>
                  </div>
                </form>

                {/* Comment Stream */}
                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {(card.comments || []).map((comm) => {
                    const author = getUserDetails(comm.userId);
                    return (
                      <div
                        key={comm.id}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white"
                              style={{ backgroundColor: author.avatarColor }}
                            >
                              {getInitials(author.username)}
                            </div>
                            <span className="font-semibold text-slate-200">{author.username}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500">
                              {new Date(comm.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <button
                              onClick={() => onDeleteComment(card.id, comm.id)}
                              className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-300 pl-7 whitespace-pre-line">{comm.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Activity History Tab View */
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Audit Trail & History
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {(card.activityHistory || []).map((act) => {
                  const actor = getUserDetails(act.userId);
                  return (
                    <div
                      key={act.id}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs"
                    >
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: actor.avatarColor }}
                      >
                        {getInitials(actor.username)}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-slate-300">
                          <span className="font-semibold text-white">{actor.username}</span> {act.text}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(act.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar Pane: Controls, Selectors, and Card Actions */}
        <div className="w-full md:w-72 bg-slate-900/90 p-5 sm:p-6 md:p-8 border-t md:border-t-0 md:border-l border-white/[0.08] space-y-5 flex flex-col justify-between md:overflow-y-auto flex-shrink-0">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Task Controls</h3>

            {/* Column Selector */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Column</label>
              <select
                value={card.listId}
                onChange={(e) => onMoveCard(card.id, e.target.value, 0)}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {lists.map((l) => (
                  <option key={l.id} value={l.id} className="bg-slate-900 text-white">
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selector */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Priority</label>
              <select
                value={card.priority || "Medium"}
                onChange={(e) => onUpdateCard(card.id, { priority: e.target.value as CardPriority })}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Urgent" className="bg-slate-900 text-rose-300">Urgent</option>
                <option value="High" className="bg-slate-900 text-amber-300">High</option>
                <option value="Medium" className="bg-slate-900 text-sky-300">Medium</option>
                <option value="Low" className="bg-slate-900 text-emerald-300">Low</option>
              </select>
            </div>

            {/* Assignee Selector */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Assignee</label>
              <select
                value={card.assigneeId || ""}
                onChange={(e) => onUpdateCard(card.id, { assigneeId: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="" className="bg-slate-900 text-slate-400">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.username} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date Picker */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Due Date</label>
              <input
                type="date"
                value={card.dueDate || ""}
                onChange={(e) => onUpdateCard(card.id, { dueDate: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Delete Task Button */}
          <div className="pt-4 border-t border-white/[0.08]">
            <button
              onClick={() => {
                if (confirm(`Delete task '${card.title}'?`)) {
                  onDeleteCard(card.id);
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Task</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
