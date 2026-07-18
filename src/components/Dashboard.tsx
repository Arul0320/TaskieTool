import React, { useState } from "react";
import { 
  Trello, 
  CheckSquare, 
  AlertTriangle, 
  Clock, 
  Star, 
  Trash2, 
  Edit3, 
  Plus, 
  FolderKanban, 
  ExternalLink,
  Lock
} from "lucide-react";
import { Board, DashboardStats, User } from "../types";

interface DashboardProps {
  stats: DashboardStats;
  boards: Board[];
  currentUser: User | null;
  onSelectBoard: (boardId: string) => void;
  onToggleFavorite: (boardId: string, currentState: boolean) => void;
  onEditBoardClick: (board: Board) => void;
  onDeleteBoard: (boardId: string) => void;
  onCreateBoardClick: () => void;
}

export default function Dashboard({
  stats,
  boards,
  currentUser,
  onSelectBoard,
  onToggleFavorite,
  onEditBoardClick,
  onDeleteBoard,
  onCreateBoardClick
}: DashboardProps) {
  const [showConfirmDeleteId, setShowConfirmDeleteId] = useState<string | null>(null);

  // Check role permission
  const canDeleteBoard = currentUser?.role === "Admin" || currentUser?.role === "Manager";

  // Calculate completed percent
  const completionPercentage = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  // Format date readable
  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch (e) {
      return "Recently";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-sans font-bold tracking-tight text-slate-900">
            Welcome back, {currentUser?.username || "Guest"}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here is an overview of your current workspace and project metrics.
          </p>
        </div>
        <button
          onClick={onCreateBoardClick}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Board</span>
        </button>
      </div>

      {/* Metrics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Boards Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Boards</span>
            <h3 className="text-3xl font-bold text-slate-900">{stats.totalBoards}</h3>
          </div>
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
            <Trello className="w-6 h-6" />
          </div>
        </div>

        {/* Total Tasks Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</span>
            <h3 className="text-3xl font-bold text-slate-900">{stats.totalTasks}</h3>
          </div>
          <div className="bg-sky-50 p-3 rounded-xl text-sky-600">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        {/* Completed Tasks Progress Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Tasks</span>
              <h3 className="text-3xl font-bold text-slate-900">
                {stats.completedTasks} <span className="text-sm font-medium text-slate-400">/ {stats.totalTasks}</span>
              </h3>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>{completionPercentage}% complete</span>
            </div>
          </div>
        </div>

        {/* Overdue Warning Card */}
        <div className={`p-6 rounded-2xl border transition shadow-sm flex items-center justify-between ${
          stats.overdueTasks > 0 
            ? "bg-rose-50 border-rose-100 text-rose-900" 
            : "bg-white border-slate-100"
        }`}>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue Tasks</span>
            <h3 className={`text-3xl font-bold ${stats.overdueTasks > 0 ? "text-rose-600 animate-pulse" : "text-slate-900"}`}>
              {stats.overdueTasks}
            </h3>
          </div>
          <div className={`p-3 rounded-xl ${
            stats.overdueTasks > 0 ? "bg-rose-100 text-rose-600" : "bg-amber-50 text-amber-600"
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Section: Boards Directory */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-sans font-bold text-slate-800 flex items-center gap-2">
              <Trello className="w-4 h-4 text-indigo-500" />
              <span>Project Boards</span>
            </h2>
            <span className="text-xs text-slate-400 font-semibold">{boards.length} Boards available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {boards.map((board) => (
              <div 
                key={board.id}
                className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200/80 transition duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Visual Accent Top Bar */}
                <div className={`h-2.5 w-full bg-gradient-to-r ${
                  board.isFavorite 
                    ? "from-amber-400 to-amber-500" 
                    : "from-indigo-500 to-sky-400"
                }`}></div>

                {/* Content */}
                <div className="p-5 flex-grow space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 
                      onClick={() => onSelectBoard(board.id)}
                      className="text-base font-bold text-slate-800 hover:text-indigo-600 cursor-pointer transition truncate max-w-[80%]"
                    >
                      {board.name}
                    </h3>
                    
                    <button
                      onClick={() => onToggleFavorite(board.id, board.isFavorite)}
                      className="text-slate-300 hover:text-amber-400 p-1 rounded-full hover:bg-slate-50 transition"
                    >
                      <Star className={`w-4 h-4 ${board.isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
                    {board.description || "No description provided."}
                  </p>
                </div>

                {/* Actions Footer */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <button
                    onClick={() => onSelectBoard(board.id)}
                    className="flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-500 cursor-pointer"
                  >
                    <span>Open Board</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditBoardClick(board)}
                      className="p-1.5 hover:bg-white rounded hover:text-slate-600 transition"
                      title="Edit Board"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {showConfirmDeleteId === board.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 text-rose-600 p-1 rounded border border-rose-100">
                        <button 
                          onClick={() => {
                            onDeleteBoard(board.id);
                            setShowConfirmDeleteId(null);
                          }}
                          className="font-bold hover:underline"
                        >
                          Confirm
                        </button>
                        <span className="text-slate-300">|</span>
                        <button 
                          onClick={() => setShowConfirmDeleteId(null)}
                          className="hover:underline text-slate-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (canDeleteBoard) {
                            setShowConfirmDeleteId(board.id);
                          } else {
                            alert("Permission denied. Only Admins or Managers can delete boards.");
                          }
                        }}
                        className={`p-1.5 rounded transition ${
                          canDeleteBoard 
                            ? "hover:bg-white hover:text-rose-500" 
                            : "opacity-40 cursor-not-allowed"
                        }`}
                        title={canDeleteBoard ? "Delete Board" : "Requires Admin/Manager Privilege"}
                      >
                        {canDeleteBoard ? <Trash2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Board Placeholder Card */}
            <div 
              onClick={onCreateBoardClick}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/10 cursor-pointer rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 transition min-h-[160px]"
            >
              <div className="bg-slate-50 p-3 rounded-full text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-700">Add Project Board</span>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Create an interactive Kanban workflow for your team.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Recent Workspace Activity Stream */}
        <div className="space-y-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-sans font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Workspace Activity</span>
            </h2>
            <span className="text-[11px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">Live</span>
          </div>

          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((log) => (
                <div key={log.id} className="flex gap-3 text-xs items-start animate-in fade-in duration-150">
                  {/* User Initial Avatar bubble */}
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 flex-shrink-0 border border-slate-200">
                    {log.userName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                  </div>
                  {/* Log description */}
                  <div className="space-y-1 flex-grow">
                    <p className="text-slate-600 leading-normal">
                      <span className="font-bold text-slate-800">{log.userName}</span> {log.text}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span className="font-semibold px-1.5 py-0.5 bg-slate-50 rounded text-slate-500 border border-slate-100 max-w-[120px] truncate">
                        {log.boardName}
                      </span>
                      <span>•</span>
                      <span>{formatTimeAgo(log.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Clock className="w-8 h-8 mx-auto stroke-[1.5] text-slate-300 mb-2" />
                <p className="text-xs">No recent activity recorded.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
