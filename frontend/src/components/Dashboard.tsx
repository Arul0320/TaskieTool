import React, { useState } from "react";
import {
  Trello,
  CheckSquare,
  Clock,
  Star,
  Trash2,
  Edit3,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Lock,
  Layers,
  Activity
} from "lucide-react";
import { Board, DashboardStats, User } from "../types";

interface DashboardProps {
  stats: DashboardStats | null;
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
  const canDeleteBoard = currentUser?.role === "Teacher";

  const totalBoards = stats?.totalBoards ?? boards.length;
  const totalTasks = stats?.totalTasks ?? 0;
  const completedTasks = stats?.completedTasks ?? 0;
  const recentActivity = stats?.recentActivity ?? [];

  const completionPercentage = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">

      {/* Hero Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-white/[0.08] bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/40 backdrop-blur-xl shadow-2xl">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live Workspace • {new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              {getTimeGreeting()}, <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">{currentUser?.username || "Collaborator"}</span>!
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Monitor project activities, track task velocity across Kanban pipelines, and collaborate with your team.
            </p>
          </div>

          <button
            onClick={onCreateBoardClick}
            className="flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98] transition cursor-pointer self-start sm:self-center group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>Create New Board</span>
          </button>
        </div>
      </div>

      {/* Metrics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Boards Widget */}
        <div className="relative overflow-hidden rounded-2xl p-6 border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl hover:border-indigo-500/30 transition duration-200 group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Boards</span>
              <h3 className="text-3xl font-display font-black text-white">{totalBoards}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition duration-200">
              <Trello className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center gap-2 text-xs text-slate-400">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Active Kanban pipelines in workspace</span>
          </div>
        </div>

        {/* Total Tasks Widget */}
        <div className="relative overflow-hidden rounded-2xl p-6 border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl hover:border-sky-500/30 transition duration-200 group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</span>
              <h3 className="text-3xl font-display font-black text-white">{totalTasks}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-110 transition duration-200">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs text-slate-400">
            <span>{completedTasks} completed</span>
            <span className="text-sky-400 font-semibold">{totalTasks - completedTasks} in progress</span>
          </div>
        </div>

        {/* Completion Progress Gauge */}
        <div className="relative overflow-hidden rounded-2xl p-6 border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl hover:border-emerald-500/30 transition duration-200 group sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completion Velocity</span>
              <h3 className="text-3xl font-display font-black text-emerald-400">{completionPercentage}%</h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition duration-200">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 pt-3 border-t border-white/[0.05] space-y-2">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Boards Showcase + Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left 2 Columns: Project Boards Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trello className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-display font-bold text-white">Your Project Boards</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/[0.08] text-slate-300">
                {boards.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                onClick={() => onSelectBoard(board.id)}
                className="group relative rounded-2xl p-5 border border-white/[0.08] bg-slate-900/50 hover:bg-slate-900/80 backdrop-blur-xl hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[190px]"
              >
                {/* Card Top Row: Title + Favorite Star */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 group-hover:scale-125 transition duration-200"></div>
                      <h3 className="font-display font-bold text-base text-white group-hover:text-indigo-300 transition line-clamp-1">
                        {board.name}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(board.id, board.isFavorite);
                      }}
                      className="p-1 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-white/[0.06] transition cursor-pointer"
                      title={board.isFavorite ? "Remove favorite" : "Mark favorite"}
                    >
                      <Star className={`w-4 h-4 transition duration-200 ${board.isFavorite ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : ""}`} />
                    </button>
                  </div>

                  {board.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {board.description}
                    </p>
                  )}
                </div>

                {/* Card Bottom Row: Metadata & Actions */}
                <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.05] text-[10px]">
                      {board.listOrder?.length || 0} columns
                    </span>
                    {board.academicYear && (
                      <span className="text-[10px] text-slate-500">{board.academicYear}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditBoardClick(board);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
                      title="Edit Board"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {showConfirmDeleteId === board.id ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 bg-rose-500/20 text-rose-300 px-2 py-1 rounded-lg border border-rose-500/30 text-xs"
                      >
                        <button
                          onClick={() => {
                            onDeleteBoard(board.id);
                            setShowConfirmDeleteId(null);
                          }}
                          className="font-bold hover:underline cursor-pointer"
                        >
                          Confirm
                        </button>
                        <span className="text-rose-400/40">|</span>
                        <button
                          onClick={() => setShowConfirmDeleteId(null)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canDeleteBoard) {
                            setShowConfirmDeleteId(board.id);
                          } else {
                            alert("Permission denied. Only Teachers can delete project boards.");
                          }
                        }}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          canDeleteBoard
                            ? "text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                            : "opacity-30 cursor-not-allowed text-slate-500"
                        }`}
                        title={canDeleteBoard ? "Delete Board" : "Requires Teacher Privilege"}
                      >
                        {canDeleteBoard ? <Trash2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    <div className="ml-1 flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 duration-200" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Board Glass Card */}
            <div
              onClick={onCreateBoardClick}
              className="border-2 border-dashed border-white/[0.1] hover:border-indigo-500/50 hover:bg-indigo-500/[0.04] cursor-pointer rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 transition duration-200 min-h-[190px] group"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/[0.05] group-hover:bg-indigo-600/20 text-slate-400 group-hover:text-indigo-400 flex items-center justify-center border border-white/[0.08] group-hover:border-indigo-500/30 transition duration-200 shadow-inner">
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" />
              </div>
              <div>
                <span className="text-sm font-display font-bold text-slate-200 group-hover:text-white transition">
                  Add Project Board
                </span>
                <p className="text-xs text-slate-400 mt-1 max-w-[210px]">
                  Build an interactive Kanban workflow for your course or team.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Workspace Activity Stream */}
        <div className="space-y-4 rounded-3xl p-6 border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-display font-bold text-white">Live Activity</h2>
            </div>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Real-time</span>
            </span>
          </div>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((log, idx) => (
                <div key={log.id} className="relative flex gap-3 text-xs items-start group">
                  {/* Vertical connector line */}
                  {idx < recentActivity.length - 1 && (
                    <div className="absolute left-3.5 top-7 bottom-0 w-px bg-white/[0.08] group-hover:bg-indigo-500/30 transition"></div>
                  )}

                  <div className="relative z-10 w-7 h-7 rounded-xl bg-slate-800 border border-white/[0.1] flex items-center justify-center font-bold text-indigo-300 text-[10px] flex-shrink-0 shadow-md">
                    {(log.userName || "User").split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                  </div>

                  <div className="space-y-1 flex-grow">
                    <p className="text-slate-300 leading-normal">
                      <span className="font-semibold text-white">{log.userName}</span> {log.text}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-slate-400 max-w-[130px] truncate">
                        {log.boardName}
                      </span>
                      <span>•</span>
                      <span>{formatTimeAgo(log.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <Clock className="w-8 h-8 mx-auto stroke-[1.5] text-slate-600" />
                <p className="text-xs">No activity recorded yet in this workspace.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
