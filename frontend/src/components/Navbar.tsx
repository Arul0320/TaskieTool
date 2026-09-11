import React, { useState } from "react";
import {
  Briefcase,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Trello,
  User as UserIcon,
  Plus,
  UserPlus,
  Sparkles,
  Check
} from "lucide-react";
import { User, Workspace } from "../types";

interface NavbarProps {
  currentUser: User | null;
  users: User[];
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  currentView: "dashboard" | "board";
  activeBoardTitle?: string;
  onSwitchUser: (userId: string) => void;
  onSwitchWorkspace: (workspaceId: string) => void;
  onSetView: (view: "dashboard" | "board") => void;
  onCreateWorkspaceClick: () => void;
  onInviteMemberClick: () => void;
}

export default function Navbar({
  currentUser,
  users,
  workspaces,
  activeWorkspace,
  currentView,
  activeBoardTitle,
  onSwitchUser,
  onSwitchWorkspace,
  onSetView,
  onCreateWorkspaceClick,
  onInviteMemberClick
}: NavbarProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "Teacher":
        return "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30";
      case "Student":
        return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
      default:
        return "bg-violet-500/15 text-violet-300 border border-violet-500/30";
    }
  };

  return (
    <>
      {/* Top Navigation Bar (All Devices) */}
      <nav className="sticky top-0 z-40 h-14 sm:h-16 px-3 sm:px-6 lg:px-8 flex items-center justify-between border-b border-white/[0.08] bg-[#090d16]/85 backdrop-blur-xl transition-all duration-200">
        
        {/* Left: Brand Logo & Workspace Selector */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          {/* Brand Logo */}
          <div
            onClick={() => onSetView("dashboard")}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-sky-400 rounded-xl blur-xs opacity-50 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-1.5 sm:p-2 rounded-xl text-white shadow-lg shadow-indigo-500/25">
                <Trello className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:rotate-6 duration-200" />
              </div>
            </div>
            <span className="font-display font-extrabold tracking-tight text-base sm:text-lg text-white">
              Taskie<span className="bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent font-normal">Tool</span>
            </span>
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-white/[0.08] hidden sm:block"></div>

          {/* Workspace Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
              onBlur={() => setTimeout(() => setShowWorkspaceDropdown(false), 200)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition duration-150 cursor-pointer group"
            >
              <Briefcase className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span className="max-w-[85px] xs:max-w-[120px] sm:max-w-[160px] md:max-w-[180px] truncate text-xs sm:text-sm font-medium">
                {activeWorkspace ? activeWorkspace.name : "Select Workspace"}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showWorkspaceDropdown ? "rotate-180" : ""}`} />
            </button>

            {/* Workspace Dropdown Panel */}
            {showWorkspaceDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/[0.06] flex items-center justify-between">
                  <span>Workspaces</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateWorkspaceClick();
                    }}
                    className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-semibold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto p-1 space-y-0.5">
                  {workspaces.length > 0 ? (
                    workspaces.map((ws) => {
                      const isActive = activeWorkspace?.id === ws.id;
                      return (
                        <button
                          key={ws.id}
                          onClick={() => {
                            onSwitchWorkspace(ws.id);
                            setShowWorkspaceDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                            isActive
                              ? "bg-indigo-600/20 text-white font-semibold border border-indigo-500/30"
                              : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          <div className="truncate pr-2">
                            <p className="truncate font-medium">{ws.name}</p>
                            {ws.description && (
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">{ws.description}</p>
                            )}
                          </div>
                          {isActive && <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No workspaces yet.
                    </div>
                  )}
                </div>

                {activeWorkspace && (
                  <div className="border-t border-white/[0.06] pt-1 px-1">
                    <button
                      onClick={() => {
                        onInviteMemberClick();
                        setShowWorkspaceDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-sky-400 hover:text-sky-300 hover:bg-white/[0.04] rounded-xl transition cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Invite Team Members</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Middle: Segmented View Switcher (Desktop & Laptop screens >= md) */}
        <div className="hidden md:flex items-center p-1 bg-slate-950/80 border border-white/[0.08] rounded-xl shadow-inner">
          <button
            onClick={() => onSetView("dashboard")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition duration-150 cursor-pointer ${
              currentView === "dashboard"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onSetView("board")}
            disabled={!activeWorkspace}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-semibold transition duration-150 ${
              !activeWorkspace ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
            } ${
              currentView === "board"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
            }`}
          >
            <Trello className="w-3.5 h-3.5" />
            <span>Active Board</span>
            {activeBoardTitle && currentView === "board" && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-200 border border-indigo-400/20 max-w-[110px] truncate hidden lg:inline">
                {activeBoardTitle}
              </span>
            )}
          </button>
        </div>

        {/* Right: User Persona Profile & Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                className="flex items-center gap-2 sm:gap-2.5 p-1 rounded-xl hover:bg-white/[0.06] transition cursor-pointer group"
              >
                {/* User Avatar */}
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-md ring-2 ring-white/10 group-hover:ring-indigo-500/50 transition flex-shrink-0"
                  style={{ backgroundColor: currentUser.avatarColor || "#6366f1" }}
                >
                  {getInitials(currentUser.username)}
                </div>

                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition max-w-[100px] md:max-w-[120px] truncate">
                    {currentUser.username}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${getRoleBadgeColor(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition hidden sm:block" />
              </button>

              {/* Persona Switcher Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-2 border-b border-white/[0.06]">
                    <p className="text-xs font-bold text-slate-200">{currentUser.username}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                  </div>

                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Persona
                  </div>

                  <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
                    {users.map((u) => {
                      const isCurrent = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSwitchUser(u.id);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2.5 transition cursor-pointer ${
                            isCurrent ? "bg-indigo-600/20 text-white border border-indigo-500/30" : "text-slate-300 hover:bg-white/[0.06]"
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: u.avatarColor || "#6366f1" }}
                          >
                            {getInitials(u.username)}
                          </div>
                          <div className="truncate flex-1">
                            <p className="truncate font-medium">{u.username}</p>
                            <span className="text-[9px] text-slate-400 uppercase">{u.role}</span>
                          </div>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-white/[0.06] pt-1 px-1 mt-1">
                    <button
                      onClick={() => {
                        fetch("/api/auth/logout", { method: "POST" }).then(() => {
                          window.location.reload();
                        });
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (< md screens: Mobile & Tablet) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#090d16]/95 backdrop-blur-2xl border-t border-white/[0.08] px-4 flex items-center justify-around shadow-2xl safe-area-bottom">
        <button
          onClick={() => onSetView("dashboard")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition cursor-pointer ${
            currentView === "dashboard"
              ? "text-indigo-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        <button
          onClick={() => onSetView("board")}
          disabled={!activeWorkspace}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            !activeWorkspace ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
          } ${
            currentView === "board"
              ? "text-indigo-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Trello className="w-5 h-5" />
          <span className="text-[10px]">Active Board</span>
        </button>

        <button
          onClick={onCreateWorkspaceClick}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-400 hover:text-white cursor-pointer transition"
        >
          <Plus className="w-5 h-5 text-sky-400" />
          <span className="text-[10px]">New Space</span>
        </button>

        <button
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-400 hover:text-white cursor-pointer transition"
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </>
  );
}
