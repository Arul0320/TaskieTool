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
  AlertCircle
} from "lucide-react";
import { Board, List, Card, User } from "../types";

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
    if (filterLabel && !card.labels.includes(filterLabel)) {
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
      color: user.avatarColor,
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
    e.preventDefault(); // Required to allow dropping!
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
      // Swap list order
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
    // Overdue only matters if not already in "Done" column
    if (listName.toLowerCase().includes("done")) return false;
    const today = new Date().toISOString().split("T")[0];
    return dueDateStr < today;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden select-none">
      
      {/* Board Header Metadata & Controls */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm flex-shrink-0 z-10">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-sans font-bold text-slate-800 tracking-tight truncate">
              {board.name}
            </h1>
            <button
              onClick={() => onToggleFavorite(board.id, board.isFavorite)}
              className="text-slate-300 hover:text-amber-400 p-1 rounded-full hover:bg-slate-50 transition"
            >
              <Star className={`w-4 h-4 ${board.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
            </button>
          </div>
          {board.description && (
            <p className="text-xs text-slate-500 truncate max-w-md md:max-w-xl">
              {board.description}
            </p>
          )}
        </div>

        {/* Filters Controls Section */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-44 md:w-56 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Filter Icon */}
          <div className="h-6 w-px bg-slate-200 mx-0.5"></div>

          {/* Assignee Filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="">All Assignees</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.username}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {/* Label Filter */}
          <select
            value={filterLabel}
            onChange={(e) => setFilterLabel(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="">All Labels</option>
            {allLabels.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          {/* Reset Filters button */}
          {(searchText || filterAssignee || filterPriority || filterLabel) ? (
            <button
              onClick={() => {
                setSearchText("");
                setFilterAssignee("");
                setFilterPriority("");
                setFilterLabel("");
              }}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-500 hover:underline px-1 py-1"
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Kanban Board Container (Horizontal Scrollable Column List) */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-5 flex items-start gap-4">
        {lists.map((list, listIdx) => {
          // Filter cards belonging to this list
          const listCards = filteredCards.filter(c => c.listId === list.id);

          return (
            <div
              key={list.id}
              className="w-72 bg-slate-100 rounded-2xl flex flex-col max-h-full border border-slate-200/60 shadow-sm flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, list.id, listCards.length)}
            >
              {/* Column (List) Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-slate-200/40 bg-slate-100 rounded-t-2xl flex-shrink-0">
                {editingListId === list.id ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      value={editingListName}
                      onChange={(e) => setEditingListName(e.target.value)}
                      onBlur={() => handleSaveRename(list.id)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveRename(list.id)}
                      autoFocus
                      className="bg-white border border-slate-300 rounded px-2 py-1 text-sm font-semibold text-slate-800 w-full focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 max-w-[65%]">
                    <h2 
                      onClick={() => {
                        setEditingListId(list.id);
                        setEditingListName(list.name);
                      }}
                      className="text-sm font-bold text-slate-800 hover:bg-slate-200/50 px-1.5 py-0.5 rounded cursor-pointer transition truncate"
                    >
                      {list.name}
                    </h2>
                    <span className="text-[11px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">
                      {listCards.length}
                    </span>
                  </div>
                )}

                {/* Column Action buttons */}
                <div className="flex items-center gap-0.5 text-slate-400">
                  <button
                    disabled={listIdx === 0}
                    onClick={() => moveList(listIdx, "left")}
                    className="p-1 hover:bg-slate-200 hover:text-slate-600 rounded disabled:opacity-20 transition"
                    title="Move Left"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={listIdx === lists.length - 1}
                    onClick={() => moveList(listIdx, "right")}
                    className="p-1 hover:bg-slate-200 hover:text-slate-600 rounded disabled:opacity-20 transition"
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
                    className="p-1 hover:bg-rose-50 hover:text-rose-500 rounded transition"
                    title="Delete Column"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Column Cards vertical stack */}
              <div 
                className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[150px]"
                onDragOver={handleDragOver}
              >
                {listCards.map((card, cardIdx) => {
                  const assignee = getUserInitialsAndColor(card.assigneeId);
                  const isCardOverdue = isOverdue(card.dueDate, list.name);

                  // Calculate checklist counts
                  const totalChecklist = card.checklist ? card.checklist.length : 0;
                  const doneChecklist = card.checklist ? card.checklist.filter(i => i.isDone).length : 0;

                  return (
                    <div
                      key={card.id}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, card.id, list.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, list.id, cardIdx)}
                      onClick={() => onCardClick(card.id)}
                      className={`group bg-white rounded-xl p-3.5 shadow-sm border hover:shadow-md transition cursor-pointer flex flex-col gap-2.5 relative ${
                        isCardOverdue 
                          ? "border-rose-400 shadow-rose-100 bg-rose-50/20" 
                          : "border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      {/* Top labels row */}
                      {card.labels && card.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {card.labels.map((label, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Card Title */}
                      <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition">
                        {card.title}
                      </h4>

                      {/* Card Description Truncated */}
                      {card.description && (
                        <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                          {card.description}
                        </p>
                      )}

                      {/* Bottom Meta indicators row */}
                      <div className="flex items-center justify-between gap-2 border-t border-slate-50 pt-2.5">
                        
                        {/* Task specific items (checklist, comments, dates) */}
                        <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-slate-400 font-semibold">
                          
                          {/* Priority Indicator */}
                          <span className={`px-1.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                            card.priority === "High" 
                              ? "bg-rose-50 text-rose-500 border border-rose-100" 
                              : card.priority === "Medium"
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : "bg-slate-50 text-slate-500 border border-slate-200/50"
                          }`}>
                            {card.priority}
                          </span>

                          {/* Due Date Alarm Indicator */}
                          {card.dueDate && (
                            <span className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md border ${
                              isCardOverdue 
                                ? "bg-rose-50 text-rose-600 border-rose-100 font-bold" 
                                : "bg-slate-50 text-slate-500 border-slate-200/50"
                            }`}>
                              <Clock className="w-3 h-3" />
                              <span>{card.dueDate.substring(5)}</span>
                            </span>
                          )}

                          {/* Checklist fraction progress */}
                          {totalChecklist > 0 && (
                            <span className={`flex items-center gap-1 ${doneChecklist === totalChecklist ? "text-emerald-600" : "text-slate-400"}`}>
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span>{doneChecklist}/{totalChecklist}</span>
                            </span>
                          )}

                          {/* Comments count */}
                          {card.comments && card.comments.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{card.comments.length}</span>
                            </span>
                          )}

                          {/* Attachments clip count */}
                          {card.attachments && card.attachments.length > 0 && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Paperclip className="w-3 h-3" />
                              <span>{card.attachments.length}</span>
                            </span>
                          )}
                        </div>

                        {/* Assignee Avatar circle */}
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-white shadow-sm flex-shrink-0"
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

              {/* Column bottom section - Quick add card */}
              <div className="p-2 border-t border-slate-200/40 bg-slate-50/50 rounded-b-2xl">
                {addingCardListId === list.id ? (
                  <form onSubmit={(e) => handleAddCardSubmit(e, list.id)} className="space-y-2">
                    <input
                      type="text"
                      placeholder="What needs to be done?"
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      required
                      autoFocus
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <div className="flex gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => setAddingCardListId(null)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-200 rounded-lg transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
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
                    className="w-full flex items-center justify-center gap-1.5 py-2 hover:bg-slate-200/60 rounded-xl text-slate-500 text-xs font-semibold cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                    <span>Add Task Card</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Column Button inside main scrollable viewport */}
        <div className="w-72 flex-shrink-0">
          {newListFormOpen ? (
            <form onSubmit={handleAddListSubmit} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 animate-in fade-in duration-150">
              <input
                type="text"
                placeholder="Column name (e.g. Backlog)"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                required
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setNewListFormOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md shadow-indigo-600/10 transition"
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
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-200/40 hover:bg-slate-200/70 text-slate-600 border border-dashed border-slate-300 hover:border-slate-400 rounded-2xl text-xs font-bold cursor-pointer transition duration-150"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span>Add Custom Column</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
