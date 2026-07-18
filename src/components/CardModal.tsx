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
  Bookmark,
  Calendar,
  AlertCircle,
  FileText
} from "lucide-react";
import { Card, User, List, UserRole } from "../types";

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

  const [uploading, setUploading] = useState(false);

  // Common labels library for toggling
  const AVAILABLE_LABELS = ["Design", "Auth", "Backend", "Frontend", "Security", "Docs", "Bug", "Refactor", "Marketing", "Research"];

  // Calculate checklist stats
  const totalChecklist = card.checklist ? card.checklist.length : 0;
  const completedChecklist = card.checklist ? card.checklist.filter(i => i.isDone).length : 0;
  const checklistPercentage = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  // Handle saving title
  const handleSaveTitle = () => {
    if (title.trim() && title !== card.title) {
      onUpdateCard(card.id, { title: title.trim() });
    }
    setIsEditingTitle(false);
  };

  // Handle saving description
  const handleSaveDesc = () => {
    if (description !== card.description) {
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

  // Toggle label inclusion
  const handleToggleLabel = (label: string) => {
    const currentLabels = card.labels || [];
    let updatedLabels: string[];
    if (currentLabels.includes(label)) {
      updatedLabels = currentLabels.filter(l => l !== label);
    } else {
      updatedLabels = [...currentLabels, label];
    }
    onUpdateCard(card.id, { labels: updatedLabels });
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
      .toUpperCase();
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
    <div className="fixed inset-0 bg-slate-900/65 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Modal Card frame */}
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Left Side Pane: Details, Checklists, Comments, Activities */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
          
          {/* Header Close & Navigation Tabs Row */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-500">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-4 py-1.5 rounded-lg transition ${
                  activeTab === "details" ? "bg-white text-slate-800 shadow-sm" : "hover:text-slate-800"
                }`}
              >
                Task Information
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`px-4 py-1.5 rounded-lg transition flex items-center gap-1 ${
                  activeTab === "activity" ? "bg-white text-slate-800 shadow-sm" : "hover:text-slate-800"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Task History</span>
                <span className="text-[10px] bg-slate-200 text-slate-500 px-1 py-0.25 rounded-full font-bold">
                  {card.activityHistory?.length || 0}
                </span>
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"
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
                      className="text-xl font-sans font-bold text-slate-800 border-b-2 border-indigo-600 w-full focus:outline-none py-1"
                    />
                    <button 
                      onClick={handleSaveTitle}
                      className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <h2 
                    onClick={() => setIsEditingTitle(true)}
                    className="text-xl font-sans font-bold text-slate-800 cursor-pointer hover:bg-slate-50 px-2 py-1 -ml-2 rounded transition"
                  >
                    {card.title}
                  </h2>
                )}
                <p className="text-[11px] text-slate-400 font-medium">
                  In Column: <span className="font-bold text-slate-600">{(lists.find(l => l.id === card.listId))?.name || "Pipeline"}</span>
                </p>
              </div>

              {/* Task Description Edit Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h3>
                {isEditingDesc ? (
                  <div className="space-y-2">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                      placeholder="Add a detailed description for this task..."
                    />
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => {
                          setDescription(card.description);
                          setIsEditingDesc(false);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveDesc}
                        className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p 
                    onClick={() => setIsEditingDesc(true)}
                    className="text-sm text-slate-600 bg-slate-50 hover:bg-slate-100/70 p-3.5 rounded-xl cursor-pointer transition whitespace-pre-wrap min-h-[3.5rem]"
                  >
                    {card.description || "Click to add a detailed description for this task..."}
                  </p>
                )}
              </div>

              {/* Checklist Subtask Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-slate-400" />
                    <span>Subtasks Checklist</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {completedChecklist} / {totalChecklist} Done
                  </span>
                </div>

                {/* Checklist Progress Slider */}
                {totalChecklist > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-600">
                      <span>Task Completion Ratio</span>
                      <span>{checklistPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${checklistPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Subtask listing */}
                <div className="space-y-2">
                  {card.checklist && card.checklist.length > 0 ? (
                    card.checklist.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between gap-3 p-2 bg-slate-50/50 hover:bg-slate-50 rounded-xl transition border border-transparent hover:border-slate-100"
                      >
                        <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-slate-700 flex-grow py-0.5">
                          <input
                            type="checkbox"
                            checked={item.isDone}
                            onChange={(e) => onToggleChecklistItem(card.id, item.id, e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className={`${item.isDone ? "line-through text-slate-400" : "text-slate-700"}`}>
                            {item.text}
                          </span>
                        </label>
                        <button
                          onClick={() => onDeleteChecklistItem(card.id, item.id)}
                          className="text-slate-300 hover:text-rose-500 p-1 hover:bg-white rounded transition"
                          title="Delete Subtask"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No checklist subtasks. Add some below to break down this assignment.</p>
                  )}
                </div>

                {/* Add Subtask Form */}
                <form onSubmit={handleAddChecklistSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a new subtask..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    required
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                  <button 
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </form>
              </div>

              {/* Attachments Upload Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <span>Attachments</span>
                  </h3>
                  <label className={`cursor-pointer px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-600 flex items-center gap-1.5 transition ${uploading ? "opacity-50" : ""}`}>
                    <Plus className="w-3.5 h-3.5" />
                    <span>{uploading ? "Uploading..." : "Upload File"}</span>
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      className="hidden" 
                      disabled={uploading}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {card.attachments && card.attachments.length > 0 ? (
                    card.attachments.map((attach) => (
                      <div 
                        key={attach.id}
                        className="flex items-center gap-3 p-2 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/50 rounded-xl overflow-hidden group justify-between"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-grow">
                          <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg flex-shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <a 
                              href={attach.url} 
                              download={attach.name} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-xs font-bold text-slate-700 hover:text-indigo-600 hover:underline truncate block"
                            >
                              {attach.name}
                            </a>
                            <span className="text-[9px] text-slate-400 block font-semibold uppercase">
                              {new Date(attach.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteAttachment(card.id, attach.id)}
                          className="text-slate-300 hover:text-rose-500 p-1.5 hover:bg-white rounded transition"
                          title="Remove Attachment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic sm:col-span-2">No attachments uploaded yet. Add references or logs above.</p>
                  )}
                </div>
              </div>

              {/* Comments Timeline Section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>Discussion ({card.comments?.length || 0})</span>
                </h3>

                {/* Timeline and listings */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {card.comments && card.comments.length > 0 ? (
                    card.comments.map((comment) => {
                      const commenter = getUserDetails(comment.userId);
                      return (
                        <div key={comment.id} className="flex gap-3 text-xs items-start animate-in fade-in duration-100">
                          {/* Commenter Initial */}
                          <div 
                            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-[10px] flex-shrink-0"
                            style={{ backgroundColor: commenter.avatarColor }}
                          >
                            {getInitials(commenter.username || "Guest")}
                          </div>
                          {/* Text Card */}
                          <div className="bg-slate-50 hover:bg-slate-100/50 p-3 rounded-2xl flex-grow space-y-1 relative group border border-slate-100">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-800">{commenter.username}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{comment.text}</p>
                            
                            {/* Comments deletion for author or managers */}
                            {(currentUser?.id === comment.userId || currentUser?.role === "Admin" || currentUser?.role === "Manager") && (
                              <button
                                onClick={() => onDeleteComment(card.id, comment.id)}
                                className="absolute right-2.5 bottom-2.5 text-slate-300 hover:text-rose-500 p-1 rounded hover:bg-white opacity-0 group-hover:opacity-100 transition duration-150"
                                title="Delete Comment"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 italic">No comments written yet. Keep your team aligned here.</p>
                  )}
                </div>

                {/* Post comment form */}
                <form onSubmit={handleAddCommentSubmit} className="space-y-2">
                  <textarea
                    rows={2}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition cursor-pointer"
                    >
                      Post Comment
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            /* Task History Activity Stream Tab */
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <History className="w-4 h-4 text-slate-400" />
                <span>Task Activity History</span>
              </h3>

              <div className="relative border-l border-slate-200 pl-4 space-y-4 max-h-[500px] overflow-y-auto pr-1 py-2">
                {card.activityHistory && card.activityHistory.length > 0 ? (
                  card.activityHistory.map((act) => {
                    const actor = getUserDetails(act.userId);
                    return (
                      <div key={act.id} className="relative text-xs">
                        {/* Bullet point */}
                        <div 
                          className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ring-4 ring-white"
                          style={{ backgroundColor: actor.avatarColor }}
                        ></div>
                        <div className="space-y-0.5">
                          <p className="text-slate-600">
                            <span className="font-bold text-slate-800">{actor.username}</span> {act.text}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(act.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic">No activity logs recorded.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side Pane: Metadata Properties Selectors */}
        <div className="w-full md:w-80 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 p-6 md:p-8 space-y-6 flex-shrink-0">
          
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2">Task Parameters</h3>

          {/* Workflow status / Column select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Column Column</label>
            <select
              value={card.listId}
              onChange={(e) => onMoveCard(card.id, e.target.value, 0)}
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-500 transition shadow-xs"
            >
              {lists.map(list => (
                <option key={list.id} value={list.id}>{list.name}</option>
              ))}
            </select>
          </div>

          {/* Assignee selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Assignee</span>
            </label>
            <select
              value={card.assigneeId}
              onChange={(e) => onUpdateCard(card.id, { assigneeId: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-500 transition shadow-xs"
            >
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
              ))}
            </select>
          </div>

          {/* Priority selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500">Priority Level</label>
            <select
              value={card.priority}
              onChange={(e) => onUpdateCard(card.id, { priority: e.target.value as any })}
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-500 transition shadow-xs"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>

          {/* Due date picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Due Date</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={card.dueDate || ""}
                onChange={(e) => onUpdateCard(card.id, { dueDate: e.target.value })}
                className={`w-full bg-white border rounded-xl p-2.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-500 transition shadow-xs ${
                  isDateOverdue() ? "border-rose-300 text-rose-600 bg-rose-50/10" : "border-slate-200"
                }`}
              />
              {isDateOverdue() && (
                <span className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Task is currently overdue!</span>
                </span>
              )}
            </div>
          </div>

          {/* Labels Manager / Tag toggler */}
          <div className="space-y-2.5 pt-2">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Label Tags</span>
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
              {AVAILABLE_LABELS.map((lbl) => {
                const isSelected = (card.labels || []).includes(lbl);
                return (
                  <button
                    key={lbl}
                    onClick={() => handleToggleLabel(lbl)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition border flex items-center gap-1 ${
                      isSelected 
                        ? "bg-indigo-50 text-indigo-600 border-indigo-200" 
                        : "bg-slate-50 text-slate-500 border-slate-200/50 hover:bg-slate-100"
                    }`}
                  >
                    <span>{lbl}</span>
                    {isSelected && <Check className="w-2.5 h-2.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Critical Task deletion block */}
          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to permanently delete task '${card.title}'?`)) {
                  onDeleteCard(card.id);
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-xl text-xs font-bold transition border border-rose-100 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Task Card</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
