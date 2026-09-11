import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Clock, 
  CheckSquare, 
  MessageSquare, 
  Paperclip, 
  User as UserIcon, 
  Tag, 
  AlertCircle,
  Columns,
  X
} from "lucide-react";
import { Board, List, Card, User, CardPriority } from "../types";

interface BoardViewProps {
  board: Board;
  lists: List[];
  cards: Card[];
  users: User[];
  onToggleFavorite: (boardId: string, currentState: boolean) => void;
  onAddList: (name: string) => void;
  onRenameList: (listId: string, newName: string) => void;
  onDeleteList: (listId: string) => void;
  onReorderLists: (listIds: string[]) => void;
  onAddCard: (listId: string, title: string) => void;
  onCardClick: (cardId: string) => void;
  onMoveCard: (cardId: string, targetListId: string, targetIndex: number) => void;
}

export default function BoardView({
  board,
  lists,
  cards,
  users,
  onToggleFavorite,
  onAddList,
  onRenameList,
  onDeleteList,
  onReorderLists,
  onAddCard,
  onCardClick,
  onMoveCard
}: BoardViewProps) {
  // Search & Filters state
  const [searchText, setSearchText] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterLabel, setFilterLabel] = useState("");

  // Column operations
  const [newListFormOpen, setNewListFormOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState("");

  // Quick Card additions
  const [addingCardListId, setAddingCardListId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");

  // Drag and drop states
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [draggedSourceListId, setDraggedSourceListId] = useState<string | null>(null);

  // Collect all unique labels for filter menu
  const allLabels = Array.from(new Set(cards.flatMap(c => c.labels || [])));

  // Filter cards
  const filteredCards = cards.filter(card => {
    if (searchText && 
        !card.title.toLowerCase().includes(searchText.toLowerCase()) && 
        !card.description.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    if (filterAssignee && card.assigneeId !== filterAssignee) {
      return false;
    }
    if (filterPriority && card.priority !== filterPriority) {
      return false;
    }
    if (filterLabel && !(card.labels || []).includes(filterLabel)) {
      return false;
    }
    return true;
  });

  // Get user avatar initials
  const getUserInitialsAndColor = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return { initials: "UN", color: "#64748b", name: "Unassigned" };
    return {
      initials: user.username.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2),
      color: user.avatarColor || "#6366f1",
      name: user.username
    };
  };

  // HTML5 Card Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, cardId: string, sourceListId: string) => {
    setDraggedCardId(cardId);
    setDraggedSourceListId(sourceListId);
    e.dataTransfer.setData("text/plain", cardId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetListId: string, targetIndex: number) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("text/plain") || draggedCardId;
    if (cardId) {
      onMoveCard(cardId, targetListId, targetIndex);
    }
    setDraggedCardId(null);
    setDraggedSourceListId(null);
  };

  // Reorder lists (Columns) left and right
  const moveList = (listIndex: number, direction: "left" | "right") => {
    const newListOrder = [...board.listOrder];
    const targetIndex = direction === "left" ? listIndex - 1 : listIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < newListOrder.length) {
      const temp = newListOrder[listIndex];
      newListOrder[listIndex] = newListOrder[targetIndex];
      newListOrder[targetIndex] = temp;
      onReorderLists(newListOrder);
    }
  };

  // Handle Add List submit
  const handleAddListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      onAddList(newListName.trim());
      setNewListName("");
      setNewListFormOpen(false);
    }
  };

  // Handle Save Renamed List submit
  const handleSaveRename = (listId: string) => {
    if (editingListName.trim()) {
      onRenameList(listId, editingListName.trim());
      setEditingListId(null);
    }
  };

  // Handle Quick Add Card submit
  const handleAddCardSubmit = (e: React.FormEvent, listId: string) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      onAddCard(listId, newCardTitle.trim());
      setNewCardTitle("");
      setAddingCardListId(null);
    }
  };

  const isOverdue = (dueDateStr: string, listName: string) => {
    if (!dueDateStr) return false;
    if (listName.toLowerCase().includes("done") || listName.toLowerCase().includes("complete")) return false;
    const today = new Date().toISOString().split("T")[0];
    return dueDateStr < today;
  };

  const hasActiveFilters = Boolean(searchText || filterAssignee || filterPriority || filterLabel);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-4rem)] md:h-[calc(100vh-4rem)] bg-[#090d16] select-none overflow-hidden">
      
      {/* Board Top Control Bar */}
      <div className="py-2.5 sm:py-3 px-3 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-slate-900/60 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 shadow-md z-10 flex-shrink-0">
        
        {/* Left Side: Board Title & Meta */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg md:text-xl font-display font-extrabold text-white tracking-tight truncate max-w-[200px] sm:max-w-none">
              {board.name}
            </h1>
            <button
              onClick={() => onToggleFavorite(board.id, board.isFavorite)}
              className="p-1 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-white/[0.06] transition cursor-pointer flex-shrink-0"
              title={board.isFavorite ? "Remove favorite" : "Mark favorite"}
            >
              <Star className={`w-4 h-4 transition duration-200 ${board.isFavorite ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" : ""}`} />
            </button>
          </div>

          {board.description && (
            <span className="text-xs text-slate-400 border-l border-white/[0.1] pl-3 max-w-sm truncate hidden sm:inline">
              {board.description}
            </span>
          )}
        </div>

        {/* Right Side: Search & Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
          {/* Search box */}
          <div className="relative flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-32 sm:w-44 lg:w-48 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.1] focus:border-indigo-500/60 focus:bg-slate-900 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition"
            />
          </div>

          {/* Assignee Filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-2 sm:px-2.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.1] focus:border-indigo-500/60 rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer transition flex-shrink-0"
          >
            <option value="" className="bg-slate-900 text-slate-300">Assignees</option>
            {users.map(u => (
              <option key={u.id} value={u.id} className="bg-slate-900 text-slate-300">{u.username}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2 sm:px-2.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.1] focus:border-indigo-500/60 rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer transition flex-shrink-0"
          >
            <option value="" className="bg-slate-900 text-slate-300">Priorities</option>
            <option value="Urgent" className="bg-slate-900 text-rose-300">Urgent</option>
            <option value="High" className="bg-slate-900 text-amber-300">High</option>
            <option value="Medium" className="bg-slate-900 text-sky-300">Medium</option>
            <option value="Low" className="bg-slate-900 text-emerald-300">Low</option>
          </select>

          {/* Label Filter */}
          {allLabels.length > 0 && (
            <select
              value={filterLabel}
              onChange={(e) => setFilterLabel(e.target.value)}
              className="px-2 sm:px-2.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.1] focus:border-indigo-500/60 rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer transition flex-shrink-0"
            >
              <option value="" className="bg-slate-900 text-slate-300">Labels</option>
              {allLabels.map(l => (
                <option key={l} value={l} className="bg-slate-900 text-slate-300">{l}</option>
              ))}
            </select>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchText("");
                setFilterAssignee("");
                setFilterPriority("");
                setFilterLabel("");
              }}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition cursor-pointer flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board Container (Horizontal Scrollable Column List with Mobile Snap) */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-start gap-4 sm:gap-5 snap-x snap-mandatory sm:snap-none">
        {lists.map((list, listIdx) => {
          const listCards = filteredCards.filter(c => c.listId === list.id);

          return (
            <div
              key={list.id}
              className="w-[82vw] sm:w-80 max-w-[340px] bg-slate-900/60 backdrop-blur-xl rounded-2xl flex flex-col max-h-full border border-white/[0.08] shadow-2xl flex-shrink-0 snap-center sm:snap-align-none"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, list.id, listCards.length)}
            >
              {/* Column Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] rounded-t-2xl flex-shrink-0">
                {editingListId === list.id ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      value={editingListName}
                      onChange={(e) => setEditingListName(e.target.value)}
                      onBlur={() => handleSaveRename(list.id)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveRename(list.id)}
                      autoFocus
                      className="bg-slate-800 border border-indigo-500/60 rounded-lg px-2.5 py-1 text-xs font-semibold text-white w-full focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 max-w-[65%]">
                    <h2 
                      onClick={() => {
                        setEditingListId(list.id);
                        setEditingListName(list.name);
                      }}
                      className="text-xs font-display font-bold text-white hover:bg-white/[0.08] px-2 py-0.5 rounded-lg cursor-pointer transition truncate"
                      title="Click to rename"
                    >
                      {list.name}
                    </h2>
                    <span className="text-[10px] font-mono font-bold bg-white/[0.08] text-indigo-300 px-2 py-0.5 rounded-full border border-white/[0.06]">
                      {listCards.length}
                    </span>
                  </div>
                )}

                {/* Column Action buttons */}
                <div className="flex items-center gap-0.5 text-slate-400">
                  <button
                    disabled={listIdx === 0}
                    onClick={() => moveList(listIdx, "left")}
                    className="p-1 hover:bg-white/[0.08] hover:text-white rounded-lg disabled:opacity-20 transition cursor-pointer"
                    title="Move Left"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={listIdx === lists.length - 1}
                    onClick={() => moveList(listIdx, "right")}
                    className="p-1 hover:bg-white/[0.08] hover:text-white rounded-lg disabled:opacity-20 transition cursor-pointer"
                    title="Move Right"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete column '${list.name}' and all its tasks?`)) {
                        onDeleteList(list.id);
                      }
                    }}
                    className="p-1 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg transition cursor-pointer"
                    title="Delete Column"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Column Cards vertical stack */}
              <div 
                className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[160px]"
                onDragOver={handleDragOver}
              >
                {listCards.map((card, cardIdx) => {
                  const assignee = getUserInitialsAndColor(card.assigneeId || "");
                  const isCardOverdue = isOverdue(card.dueDate || "", list.name);
                  const totalChecklist = card.checklist ? card.checklist.length : 0;
                  const doneChecklist = card.checklist ? card.checklist.filter(i => i.isDone).length : 0;
                  const checklistProgress = totalChecklist > 0 ? (doneChecklist / totalChecklist) * 100 : 0;

                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id, list.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => {
                        e.stopPropagation();
                        handleDrop(e, list.id, cardIdx);
                      }}
                      onClick={() => onCardClick(card.id)}
                      className="bg-slate-800/80 hover:bg-slate-800 border border-white/[0.08] hover:border-indigo-500/50 rounded-xl p-3.5 transition duration-150 cursor-pointer space-y-2.5 group relative shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5"
                    >
                      {/* Top label pills */}
                      {card.labels && card.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {card.labels.map(label => (
                            <span 
                              key={label}
                              className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 tracking-wider"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Card Title */}
                      <h3 className="text-xs font-semibold text-white group-hover:text-indigo-200 transition line-clamp-2 leading-snug">
                        {card.title}
                      </h3>

                      {/* Card Description preview */}
                      {card.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {card.description}
                        </p>
                      )}

                      {/* Checklist Mini Progress Bar */}
                      {totalChecklist > 0 && (
                        <div className="space-y-1">
                          <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${checklistProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Bottom Row Badges & Assignee */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-400">
                          
                          {/* Priority Pill */}
                          <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                            card.priority === "Urgent"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : card.priority === "High" 
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
                                : card.priority === "Medium"
                                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                                  : "bg-slate-700/50 text-slate-300 border border-slate-600/30"
                          }`}>
                            {card.priority || "Medium"}
                          </span>

                          {/* Due Date Alarm Indicator */}
                          {card.dueDate && (
                            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] ${
                              isCardOverdue 
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold" 
                                : "bg-white/[0.04] text-slate-400 border-white/[0.08]"
                            }`}>
                              <Clock className="w-2.5 h-2.5" />
                              <span>{card.dueDate.substring(5)}</span>
                            </span>
                          )}

                          {/* Checklist progress counter */}
                          {totalChecklist > 0 && (
                            <span className={`flex items-center gap-1 ${doneChecklist === totalChecklist ? "text-emerald-400 font-bold" : "text-slate-400"}`}>
                              <CheckSquare className="w-3 h-3" />
                              <span>{doneChecklist}/{totalChecklist}</span>
                            </span>
                          )}

                          {/* Comments count */}
                          {card.comments && card.comments.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              <span>{card.comments.length}</span>
                            </span>
                          )}

                          {/* Attachments count */}
                          {card.attachments && card.attachments.length > 0 && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Paperclip className="w-3 h-3" />
                              <span>{card.attachments.length}</span>
                            </span>
                          )}
                        </div>

                        {/* Assignee Avatar */}
                        <div 
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold text-white ring-1 ring-white/10 shadow-sm flex-shrink-0"
                          style={{ backgroundColor: assignee.color }}
                          title={assignee.name}
                        >
                          {assignee.initials}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Column Bottom Section - Quick Add Card */}
              <div className="p-2.5 border-t border-white/[0.06] bg-white/[0.02] rounded-b-2xl">
                {addingCardListId === list.id ? (
                  <form onSubmit={(e) => handleAddCardSubmit(e, list.id)} className="space-y-2">
                    <input
                      type="text"
                      placeholder="What needs to be done?"
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      required
                      autoFocus
                      className="w-full bg-slate-800/90 border border-indigo-500/60 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setAddingCardListId(null)}
                        className="px-3 py-1 text-xs font-semibold text-slate-400 hover:bg-white/[0.06] hover:text-white rounded-lg transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md shadow-indigo-600/25 transition cursor-pointer"
                      >
                        Add Task
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => {
                      setAddingCardListId(list.id);
                      setNewCardTitle("");
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 hover:bg-white/[0.06] rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Add Task Card</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Column Button inside main scrollable viewport */}
        <div className="w-[82vw] sm:w-80 max-w-[340px] flex-shrink-0 snap-center sm:snap-align-none">
          {newListFormOpen ? (
            <form onSubmit={handleAddListSubmit} className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-white/[0.12] shadow-xl space-y-3 animate-in fade-in duration-150">
              <input
                type="text"
                placeholder="Column name (e.g. Backlog, Testing)"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                required
                autoFocus
                className="w-full bg-slate-800 border border-white/[0.1] focus:border-indigo-500/60 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setNewListFormOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-white/[0.06] rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md shadow-indigo-600/30 transition cursor-pointer"
                >
                  Create Column
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => {
                setNewListFormOpen(true);
                setNewListName("");
              }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 hover:text-white border border-dashed border-white/[0.12] hover:border-indigo-500/40 rounded-2xl text-xs font-bold cursor-pointer transition duration-150 group"
            >
              <Plus className="w-4 h-4 text-indigo-400 group-hover:rotate-90 transition duration-200" />
              <span>Add Custom Column</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
