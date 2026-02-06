import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, BookOpen, BrainCircuit, Clock } from 'lucide-react';
import moment from 'moment';

const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return 'N/A';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({
  document, onDelete
}) => {
  
  const navigate = useNavigate();
  
  const handleNavigate = () => {
    navigate(`/documents/${document._id}`);
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };
  
  return (
    <div
      onClick={handleNavigate}
      className="group bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-md transition relative"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
          <FileText className="w-5 h-5 text-slate-600" strokeWidth={2} />
        </div>

        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {/* Title */}
      <h3
        className="font-medium text-slate-900 mb-1 truncate"
        title={document.title}
      >
        {document.title}
      </h3>

      {/* File info */}
      <div className="text-xs text-slate-500 mb-4">
        {document.fileSize !== undefined && (
          <span>{formatFileSize(document.fileSize)}</span>
        )}
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-600 mb-4">
        {document.flashcardCount !== undefined && (
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" strokeWidth={2} />
            <span>{document.flashcardCount} Flashcards</span>
          </div>
        )}

        {document.quizCount !== undefined && (
          <div className="flex items-center gap-1">
            <BrainCircuit className="w-4 h-4" strokeWidth={2} />
            <span>{document.quizCount} Quizzes</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Clock className="w-4 h-4" strokeWidth={2} />
        <span>Uploaded {moment(document.createdAt).fromNow()}</span>
      </div>

      {/* Hover bar */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-slate-900 rounded-b-xl transition-all group-hover:w-full" />
    </div>
  );
};

export default DocumentCard;


