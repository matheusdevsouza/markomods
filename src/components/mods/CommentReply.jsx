import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Clock, MessageSquare, Shield } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const CommentReply = ({ reply, modId, currentUser, onDelete }) => {
  const { t } = useTranslation();
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canDelete = currentUser && (
    currentUser.id === reply.user_id || 
    ['admin', 'super_admin'].includes(currentUser.role)
  );

  return (
    <div className="ml-8 mt-3 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-l-4 border-blue-500 rounded-r-lg relative">
      {/* Indicador de resposta */}
      <div className="absolute -left-2 top-4 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
        <MessageSquare className="w-2.5 h-2.5 text-white" />
      </div>

      {/* Header da resposta */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <img 
              src={reply.avatar_url || '/default-avatar.png'} 
              alt={reply.display_name || reply.username}
              className="w-full h-full object-cover"
            />
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-300">
                {reply.display_name || reply.username}
              </span>
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-yellow-400 font-medium">Admin</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>Respondendo a {reply.reply_to_username}</span>
              <span>•</span>
              <span>{formatDate(reply.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Botão de deletar */}
        {canDelete && (
          <button
            onClick={() => onDelete(reply.id)}
            className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center transition-colors"
            title="Excluir resposta"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Conteúdo da resposta */}
      <div className="text-sm text-gray-200 leading-relaxed">
        {reply.content}
      </div>

      {/* Badge de resposta oficial */}
      <div className="mt-3 flex justify-end">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
          <Shield className="w-3 h-3 mr-1" />
          {t('modDetail.officialReply')}
        </span>
      </div>
    </div>
  );
};

export default CommentReply;

