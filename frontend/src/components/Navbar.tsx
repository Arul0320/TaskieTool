import React, { useState } from "react";
import {
  Briefcase,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Trello,
  User as UserIcon,
  Plus,
  UserPlus
} from "lucide-react";
import { User, Workspace } from "../types";

interface NavbarProps {
  currentUser: User | null;
  users: User[];
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  currentView: "dashboard" | "board";
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
      .toUpperCase();
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "Teacher":
        return "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30";
      case "Student":
        return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border border-slate-500/30";
    }
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white h-16 px-6 flex items-center justify-between sticky top-0 z-40 shadow-md">
      {/* Left side: Brand + Workspace Switcher */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSetView("dashboard")}>
          <div className="bg-gradient-to-tr from-indigo-500 to-sky-400 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20">
            <Trello className="w-5 h-5" />
          </div>
          <span className="font-sans font-bold tracking-tight text-lg text-white">
            Taskie<span className="text-sky-400 font-light">Tool</span>
          </span>
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-800"></div>

        {/* Workspace Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
            onBlur={() => setTimeout(() => setShowWorkspaceDropdown(false), 200)}
            className="flex items-center gap-2 hover:bg-slate-800/80 px-3 py-1.5 rounded-lg text-slate-200 text-sm font-medium transition duration-150 border border-slate-800 cursor-pointer"
          >
            <Briefcase className="w-4 h-4 text-sky-400" />
            <span className="max-w-[150px] truncate">
              {activeWorkspace ? activeWorkspace.name : "Select Workspace"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showWorkspaceDropdown && (
            <div className="absolute left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700 flex items-center justify-between">
                <span>Workspaces</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateWorkspaceClick();
                  }}
                  className="p-1 hover:bg-slate-700 text-sky-400 hover:text-sky-300 rounded transition cursor-pointer"
                  title="Create Workspace"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {workspaces.length > 0 ? (
                  workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        onSwitchWorkspace(ws.id);
                        setShowWorkspaceDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm flex flex-col gap-0.5 hover:bg-slate-700/60 transition cursor-pointer ${
                        activeWorkspace?.id === ws.id ? "bg-slate-700/80 text-white font-medium border-l-2 border-sky-400" : "text-slate-300"
                      }`}
                    >
                      <span className="truncate">{ws.name}</span>
                      {ws.description && (
                        <span className="text-xs text-slate-400 truncate max-w-full">
                          {ws.description}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-3 text-xs text-slate-400 text-center">
                    No workspaces yet.
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateWorkspaceClick();
                      }}
                      className="mt-1.5 block mx-auto text-sky-400 hover:underline font-bold"
                    >
                      + Create Workspace
                    </button>
                  </div>
                )}
              </div>

              {activeWorkspace && (
                <div className="border-t border-slate-700 pt-1 px-1">
                  <button
                    onClick={() => {
                      onInviteMemberClick();
                      setShowWorkspaceDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 text-left px-3 py-2 text-xs font-medium text-sky-400 hover:bg-slate-700/50 rounded-lg transition cursor-pointer"
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

      {/* Middle: View Selector */}
      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => onSetView("dashboard")}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
            currentView === "dashboard"
              ? "bg-slate-800 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => onSetView("board")}
          disabled={!activeWorkspace}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition ${
            !activeWorkspace ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          } ${
            currentView === "board"
              ? "bg-slate-800 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Trello className="w-4 h-4" />
          <span>Active Board</span>
        </button>
      </div>

      {/* Right side: Profile & User Switcher */}
      <div className="flex items-center gap-4">
        {currentUser && (
          <div className="flex items-center gap-3">
            <span className="text-right hidden sm:flex flex-col">
              <span className="text-sm font-medium text-slate-100">{currentUser.username}</span>
              <span className={`text-[10px] self-end px-1.5 py-0.5 rounded font-bold uppercase ${getRoleBadgeColor(currentUser.role)}`}>
                {currentUser.role}
              </span>
            </span>

            {/* Profile Dropdown Activator */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                onBlur={() => setTimeout(() => setShowUserDropdown(false), 250)}
                className="flex items-center focus:outline-none"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-slate-700 hover:border-sky-400 transition cursor-pointer"
                  style={{ backgroundColor: currentUser.avatarColor }}
                >
                  {getInitials(currentUser.username)}
                </div>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-200">
                  <div className="px-4 py-3 border-b border-slate-700">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold truncate text-white">{currentUser.username}</p>
                    <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                  </div>

                  {users.length > 1 && (
                    <>
                      <div className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-800/50">
                        Switch User
                      </div>

                      <div className="max-h-56 overflow-y-auto border-b border-slate-700 py-1">
                        {users.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSwitchUser(u.id);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-700 transition cursor-pointer ${
                              currentUser.id === u.id ? "bg-slate-700/40 text-sky-400 font-medium" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                style={{ backgroundColor: u.avatarColor }}
                              >
                                {getInitials(u.username)}
                              </div>
                              <span className="truncate max-w-[120px]">{u.username}</span>
                            </div>
                            <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">
                              {u.role}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        fetch("/api/auth/logout", { method: "POST" })
                          .then(() => window.location.reload());
                      }}
                      className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
