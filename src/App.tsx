import React, { useState, useEffect, useCallback } from "react";
import { 
  User, 
  Workspace, 
  Board, 
  List, 
  Card, 
  DashboardStats 
} from "./types";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import BoardView from "./components/BoardView";
import CardModal from "./components/CardModal";
import CreateModal from "./components/CreateModal";
import LoginView from "./components/LoginView";

export default function App() {
  // Authentication & Active Selection States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  
  // View Control
  const [currentView, setCurrentView] = useState<"dashboard" | "board">("dashboard");
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Lists & Cards inside the Active Board
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Modal Control States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalType, setCreateModalType] = useState<"workspace" | "board" | "edit-board" | "invite">("workspace");
  const [editBoardData, setEditBoardData] = useState<Board | null>(null);

  // ----------------------------------------------------
  // DATA FETCHING HOOKS (Fetch / AJAX with backend)
  // ----------------------------------------------------

  const [authLoading, setAuthLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("Error fetching me:", err);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, []);

  const fetchWorkspaces = useCallback(async () => {
    try {
      const res = await fetch("/api/workspaces");
      const data = await res.json();
      if (data.workspaces && data.workspaces.length > 0) {
        setWorkspaces(data.workspaces);
        // Default select first workspace if none active
        if (!activeWorkspaceId) {
          setActiveWorkspaceId(data.workspaces[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching workspaces:", err);
    }
  }, [activeWorkspaceId]);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setDashboardStats(data);
    } catch (err) {
      console.error("Error fetching dashboard statistics:", err);
    }
  }, []);

  const fetchBoards = useCallback(async () => {
    if (!activeWorkspaceId) return;
    try {
      const res = await fetch(`/api/boards?workspaceId=${activeWorkspaceId}`);
      const data = await res.json();
      if (data.boards) {
        setBoards(data.boards);
      }
    } catch (err) {
      console.error("Error fetching boards:", err);
    }
  }, [activeWorkspaceId]);

  const fetchListsAndCards = useCallback(async () => {
    if (!activeBoardId) return;
    try {
      // Parallel fetch lists and cards
      const [listsRes, cardsRes] = await Promise.all([
        fetch(`/api/boards/${activeBoardId}/lists`),
        fetch(`/api/cards?boardId=${activeBoardId}`)
      ]);
      const listsData = await listsRes.json();
      const cardsData = await cardsRes.json();

      if (listsData.lists) setLists(listsData.lists);
      if (cardsData.cards) setCards(cardsData.cards);
    } catch (err) {
      console.error("Error fetching board lists and cards:", err);
    }
  }, [activeBoardId]);

  // ----------------------------------------------------
  // REACT LIFECYCLE EFFECT PIPELINES
  // ----------------------------------------------------

  // 1. Initial Load Bootstrapper
  useEffect(() => {
    fetchMe();
    fetchUsers();
  }, [fetchMe, fetchUsers]);

  // 2. Fetch Workspaces
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // 3. Fetch Boards when Active Workspace changes
  useEffect(() => {
    if (activeWorkspaceId) {
      fetchBoards();
    }
  }, [activeWorkspaceId, fetchBoards]);

  // 4. Fetch Lists/Cards when Active Board changes
  useEffect(() => {
    if (activeBoardId) {
      fetchListsAndCards();
    }
  }, [activeBoardId, fetchListsAndCards]);

  // 5. Fetch Dashboard metrics when currentView shifts to Dashboard
  useEffect(() => {
    if (currentView === "dashboard") {
      fetchDashboardStats();
    }
  }, [currentView, fetchDashboardStats]);

  // ----------------------------------------------------
  // MUTATIONS (MUTATIVE SIDE EFFECTS / AJAX)
  // ----------------------------------------------------

  // Switch User (Hot Personas)
  const handleSwitchUser = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;
      
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        // Refresh session contexts
        fetchWorkspaces();
        fetchDashboardStats();
      }
    } catch (err) {
      console.error("Failed to swap user persona:", err);
    }
  };

  // Switch Active Workspace
  const handleSwitchWorkspace = (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    setActiveBoardId(null);
    setCurrentView("dashboard");
  };

  // Workspace Creation
  const handleCreateWorkspace = async (name: string, description: string) => {
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description })
      });
      const data = await res.json();
      if (data.workspace) {
        setWorkspaces(prev => [...prev, data.workspace]);
        setActiveWorkspaceId(data.workspace.id);
        setActiveBoardId(null);
        setCurrentView("dashboard");
      }
    } catch (err) {
      console.error("Workspace creation failed:", err);
    }
  };

  // Team Invite Workspace Member
  const handleInviteMember = async (workspaceId: string, userId: string) => {
    try {
      const res = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, userId })
      });
      const data = await res.json();
      if (data.success) {
        // Update workspaces cache locally
        setWorkspaces(prev => prev.map(ws => {
          if (ws.id === workspaceId) {
            return { ...ws, members: [...ws.members, userId] };
          }
          return ws;
        }));
        alert("Team member invited successfully!");
      }
    } catch (err) {
      console.error("Invite member failed:", err);
    }
  };

  // Create Project Board
  const handleCreateBoard = async (name: string, description: string) => {
    if (!activeWorkspaceId) return;
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: activeWorkspaceId, name, description })
      });
      const data = await res.json();
      if (data.board) {
        setBoards(prev => [...prev, data.board]);
        setActiveBoardId(data.board.id);
        setCurrentView("board");
        fetchDashboardStats();
      }
    } catch (err) {
      console.error("Create board failed:", err);
    }
  };

  // Toggle Board Favorite Star
  const handleToggleFavorite = async (boardId: string, currentState: boolean) => {
    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !currentState })
      });
      const data = await res.json();
      if (data.board) {
        setBoards(prev => prev.map(b => b.id === boardId ? { ...b, isFavorite: !currentState } : b));
        fetchDashboardStats();
      }
    } catch (err) {
      console.error("Toggle board favorite failed:", err);
    }
  };

  // Edit Board Metadata Details
  const handleEditBoardDetails = async (boardId: string, name: string, description: string) => {
    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description })
      });
      const data = await res.json();
      if (data.board) {
        setBoards(prev => prev.map(b => b.id === boardId ? data.board : b));
        fetchDashboardStats();
      }
    } catch (err) {
      console.error("Edit board details failed:", err);
    }
  };

  // Delete Board
  const handleDeleteBoard = async (boardId: string) => {
    try {
      const res = await fetch(`/api/boards/${boardId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setBoards(prev => prev.filter(b => b.id !== boardId));
        if (activeBoardId === boardId) {
          setActiveBoardId(null);
          setCurrentView("dashboard");
        }
        fetchDashboardStats();
      }
    } catch (err) {
      console.error("Delete board failed:", err);
    }
  };

  // Add Column (List)
  const handleAddList = async (name: string) => {
    if (!activeBoardId) return;
    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardId: activeBoardId, name })
      });
      const data = await res.json();
      if (data.list) {
        setLists(prev => [...prev, data.list]);
        // Update local board structure order
        setBoards(prev => prev.map(b => {
          if (b.id === activeBoardId) {
            return { ...b, listOrder: [...b.listOrder, data.list.id] };
          }
          return b;
        }));
      }
    } catch (err) {
      console.error("Add column failed:", err);
    }
  };

  // Rename Column (List)
  const handleRenameList = async (listId: string, newName: string) => {
    try {
      const res = await fetch(`/api/lists/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName })
      });
      const data = await res.json();
      if (data.list) {
        setLists(prev => prev.map(l => l.id === listId ? data.list : l));
      }
    } catch (err) {
      console.error("Rename column failed:", err);
    }
  };

  // Delete Column (List)
  const handleDeleteList = async (listId: string) => {
    try {
      const res = await fetch(`/api/lists/${listId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setLists(prev => prev.filter(l => l.id !== listId));
        setCards(prev => prev.filter(c => c.listId !== listId));
        // Remove from local boards cache order
        setBoards(prev => prev.map(b => {
          if (b.id === activeBoardId) {
            return { ...b, listOrder: b.listOrder.filter(id => id !== listId) };
          }
          return b;
        }));
        fetchDashboardStats();
      }
    } catch (err) {
      console.error("Delete column failed:", err);
    }
  };

  // Shift/Reorder columns
  const handleReorderLists = async (listIds: string[]) => {
    if (!activeBoardId) return;
    try {
      const res = await fetch(`/api/boards/${activeBoardId}/reorder-lists`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listOrder: listIds })
      });
      const data = await res.json();
      if (data.success) {
        setBoards(prev => prev.map(b => b.id === activeBoardId ? { ...b, listOrder: listIds } : b));
        
        // Re-sort local lists
        setLists(prev => [...prev].sort((a, b) => {
          const aIdx = listIds.indexOf(a.id);
          const bIdx = listIds.indexOf(b.id);
          return aIdx - bIdx;
        }));
      }
    } catch (err) {
      console.error("Column reorder failed:", err);
    }
  };

  // Create Task Card
  const handleAddCard = async (listId: string, title: string) => {
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId, title })
      });
      const data = await res.json();
      if (data.card) {
        setCards(prev => [...prev, data.card]);
        fetchDashboardStats();
      }
    } catch (err) {
      console.error("Create task failed:", err);
    }
  };

  // Drag & drop card relocation and reordering
  const handleMoveCard = async (cardId: string, targetListId: string, targetIndex: number) => {
    try {
      // Optimistic update of local states for buttery smoothness
      setCards(prev => {
        const item = prev.find(c => c.id === cardId);
        if (!item) return prev;
        
        // Remove from list
        const filtered = prev.filter(c => c.id !== cardId);
        // Find insert point in target list
        const targetListCards = filtered.filter(c => c.listId === targetListId).sort((a, b) => a.order - b.order);
        targetListCards.splice(targetIndex, 0, { ...item, listId: targetListId });

        // Recompute orders for updated lists
        const oldListId = item.listId;
        const remainingOldListCards = filtered.filter(c => c.listId === oldListId).sort((a, b) => a.order - b.order);

        // Map order numbers back to state list
        return prev.map(c => {
          if (c.id === cardId) {
            return { ...c, listId: targetListId, order: targetIndex };
          }
          if (c.listId === targetListId) {
            const idx = targetListCards.findIndex(tc => tc.id === c.id);
            return { ...c, order: idx };
          }
          if (c.listId === oldListId) {
            const idx = remainingOldListCards.findIndex(tc => tc.id === c.id);
            return { ...c, order: idx };
          }
          return c;
        });
      });

      const res = await fetch("/api/cards/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, targetListId, targetIndex })
      });
      const data = await res.json();
      if (data.success) {
        // Refetch complete datasets to keep everything in strict alignment
        fetchListsAndCards();
        fetchDashboardStats();
      }
    } catch (err) {
      console.error("Card drag reorder failed:", err);
      fetchListsAndCards(); // Revert on failure
    }
  };

  // Update specific Task details (assignee, priority, tags, dates, desc)
  const handleUpdateCard = async (cardId: string, updates: Partial<Card>) => {
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.card) {
        setCards(prev => prev.map(c => c.id === cardId ? data.card : c));
        fetchDashboardStats();
      }
    } catch (err) {
      console.error("Task update failed:", err);
    }
  };

  // Delete Card Task
  const handleDeleteCard = async (cardId: string) => {
    try {
      const res = await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCards(prev => prev.filter(c => c.id !== cardId));
        setActiveCardId(null);
        fetchDashboardStats();
      }
    } catch (err) {
      console.error("Delete task failed:", err);
    }
  };

  // Subtask Checklist: Add Item
  const handleAddChecklistItem = async (cardId: string, text: string) => {
    try {
      const res = await fetch(`/api/cards/${cardId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.card) {
        setCards(prev => prev.map(c => c.id === cardId ? data.card : c));
      }
    } catch (err) {
      console.error("Add checklist item failed:", err);
    }
  };

  // Subtask Checklist: Toggle Check status
  const handleToggleChecklistItem = async (cardId: string, itemId: string, isDone: boolean) => {
    try {
      const res = await fetch(`/api/cards/${cardId}/checklist/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDone })
      });
      const data = await res.json();
      if (data.card) {
        setCards(prev => prev.map(c => c.id === cardId ? data.card : c));
      }
    } catch (err) {
      console.error("Toggle checklist item failed:", err);
    }
  };

  // Subtask Checklist: Delete Item
  const handleDeleteChecklistItem = async (cardId: string, itemId: string) => {
    try {
      const res = await fetch(`/api/cards/${cardId}/checklist/${itemId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.card) {
        setCards(prev => prev.map(c => c.id === cardId ? data.card : c));
      }
    } catch (err) {
      console.error("Delete checklist item failed:", err);
    }
  };

  // Comments: Add comment
  const handleAddComment = async (cardId: string, text: string) => {
    try {
      const res = await fetch(`/api/cards/${cardId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.card) {
        setCards(prev => prev.map(c => c.id === cardId ? data.card : c));
      }
    } catch (err) {
      console.error("Add comment failed:", err);
    }
  };

  // Comments: Delete comment
  const handleDeleteComment = async (cardId: string, commentId: string) => {
    try {
      const res = await fetch(`/api/cards/${cardId}/comments/${commentId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.card) {
        setCards(prev => prev.map(c => c.id === cardId ? data.card : c));
      }
    } catch (err) {
      console.error("Delete comment failed:", err);
    }
  };

  // Attachments: Add base64 attachment
  const handleAddAttachment = async (cardId: string, name: string, dataUrl: string) => {
    try {
      const res = await fetch(`/api/cards/${cardId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dataUrl })
      });
      const data = await res.json();
      if (data.card) {
        setCards(prev => prev.map(c => c.id === cardId ? data.card : c));
      }
    } catch (err) {
      console.error("Attachment upload failed:", err);
    }
  };

  // Attachments: Delete attachment
  const handleDeleteAttachment = async (cardId: string, attachmentId: string) => {
    try {
      const res = await fetch(`/api/cards/${cardId}/attachments/${attachmentId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.card) {
        setCards(prev => prev.map(c => c.id === cardId ? data.card : c));
      }
    } catch (err) {
      console.error("Delete attachment failed:", err);
    }
  };

  // ----------------------------------------------------
  // CONTEXT TRIGGERS & RENDER FLOWS
  // ----------------------------------------------------

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || null;
  const activeBoard = boards.find(b => b.id === activeBoardId) || null;
  const activeCard = cards.find(c => c.id === activeCardId) || null;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-mono text-slate-400 animate-pulse">Loading KanbanFlow Session...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          // Trigger data loading once logged in
          fetchWorkspaces();
          fetchUsers();
          fetchDashboardStats();
        }}
        availableUsers={users}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Top Application Header Navbar */}
      <Navbar
        currentUser={currentUser}
        users={users}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        currentView={currentView}
        onSwitchUser={handleSwitchUser}
        onSwitchWorkspace={handleSwitchWorkspace}
        onSetView={setCurrentView}
        onCreateWorkspaceClick={() => {
          setCreateModalType("workspace");
          setShowCreateModal(true);
        }}
        onInviteMemberClick={() => {
          setCreateModalType("invite");
          setShowCreateModal(true);
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 overflow-hidden">
        {currentView === "dashboard" || !activeBoard ? (
          /* Dashboard view cockpit */
          dashboardStats && (
            <Dashboard
              stats={dashboardStats}
              boards={boards}
              currentUser={currentUser}
              onSelectBoard={(boardId) => {
                setActiveBoardId(boardId);
                setCurrentView("board");
              }}
              onToggleFavorite={handleToggleFavorite}
              onEditBoardClick={(board) => {
                setEditBoardData(board);
                setCreateModalType("edit-board");
                setShowCreateModal(true);
              }}
              onDeleteBoard={handleDeleteBoard}
              onCreateBoardClick={() => {
                setCreateModalType("board");
                setShowCreateModal(true);
              }}
            />
          )
        ) : (
          /* Kanban Board viewport */
          <BoardView
            board={activeBoard}
            lists={lists}
            cards={cards}
            users={users}
            onToggleFavorite={handleToggleFavorite}
            onAddList={handleAddList}
            onRenameList={handleRenameList}
            onDeleteList={handleDeleteList}
            onReorderLists={handleReorderLists}
            onAddCard={handleAddCard}
            onCardClick={setActiveCardId}
            onMoveCard={handleMoveCard}
          />
        )}
      </main>

      {/* 1. Modal Task Detail panel popup */}
      {activeCard && (
        <CardModal
          card={activeCard}
          lists={lists}
          users={users}
          currentUser={currentUser}
          onClose={() => setActiveCardId(null)}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
          onAddChecklistItem={handleAddChecklistItem}
          onToggleChecklistItem={handleToggleChecklistItem}
          onDeleteChecklistItem={handleDeleteChecklistItem}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onAddAttachment={handleAddAttachment}
          onDeleteAttachment={handleDeleteAttachment}
          onMoveCard={handleMoveCard}
        />
      )}

      {/* 2. Generic Creator popup modal (Workspace, Board, Invite) */}
      {showCreateModal && (
        <CreateModal
          type={createModalType}
          activeWorkspace={activeWorkspace}
          editBoardData={editBoardData}
          users={users}
          onClose={() => {
            setShowCreateModal(false);
            setEditBoardData(null);
          }}
          onSubmitWorkspace={handleCreateWorkspace}
          onSubmitBoard={handleCreateBoard}
          onSubmitEditBoard={handleEditBoardDetails}
          onSubmitInvite={handleInviteMember}
        />
      )}

    </div>
  );
}
