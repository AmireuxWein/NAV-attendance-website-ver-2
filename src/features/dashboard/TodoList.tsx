import { useState } from 'react';
import { CheckCircle2, Circle, Edit2, Trash2, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Announcement } from '../../contexts/DataContext';

interface TodoListProps {
  announcements: Announcement[];
  addAnnouncement: (content: string) => void;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
}

export function TodoList({
  announcements,
  addAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
}: TodoListProps) {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 custom-shadow flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-secondary" size={20} />
          <h3 className="text-xl font-bold text-on-surface">Ghi chú công việc</h3>
        </div>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
        {announcements.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).map((n) => (
          <div key={n.id} className="flex gap-3 p-3 rounded-xl bg-surface border border-outline-variant/30 hover:border-primary/20 transition-all group">
            <button
              onClick={() => updateAnnouncement(n.id, { isCompleted: !n.isCompleted })}
              className="mt-0.5 text-outline hover:text-primary transition-colors flex-shrink-0"
            >
              {n.isCompleted ? <CheckCircle2 size={18} className="text-primary" /> : <Circle size={18} />}
            </button>
            <div className="flex-1">
              {editingNoteId === n.id ? (
                <input
                  type="text"
                  value={editingNoteContent}
                  onChange={(e) => setEditingNoteContent(e.target.value)}
                  onBlur={() => {
                    if (editingNoteContent.trim()) {
                      updateAnnouncement(n.id, { content: editingNoteContent.trim() });
                    }
                    setEditingNoteId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (editingNoteContent.trim()) {
                        updateAnnouncement(n.id, { content: editingNoteContent.trim() });
                      }
                      setEditingNoteId(null);
                    } else if (e.key === 'Escape') {
                      setEditingNoteId(null);
                    }
                  }}
                  autoFocus
                  className="w-full bg-transparent border-b border-primary/30 focus:border-primary outline-none text-sm font-medium"
                />
              ) : (
                <p className={cn("text-sm font-medium transition-all", n.isCompleted ? "text-outline-variant line-through" : "text-on-surface")}>
                  {n.content}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setEditingNoteId(n.id);
                  setEditingNoteContent(n.content);
                }}
                className="p-1 rounded-full hover:bg-surface-container text-outline hover:text-primary transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Xóa ghi chú này?')) {
                    deleteAnnouncement(n.id);
                  }
                }}
                className="p-1 rounded-full hover:bg-error/10 text-outline hover:text-error transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm font-medium text-outline-variant">Chưa có ghi chú nào.</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        <input
          type="text"
          placeholder="Thêm ghi chú công việc..."
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newNoteContent.trim()) {
              addAnnouncement(newNoteContent.trim());
              setNewNoteContent('');
            }
          }}
          className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm font-medium focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
        <button
          onClick={() => {
            if (newNoteContent.trim()) {
              addAnnouncement(newNoteContent.trim());
              setNewNoteContent('');
            }
          }}
          disabled={!newNoteContent.trim()}
          className="bg-primary hover:opacity-90 disabled:opacity-50 text-white p-3 rounded-xl transition-all shadow-md shadow-primary/20 disabled:shadow-none shrink-0"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
