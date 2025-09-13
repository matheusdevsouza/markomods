import React, { useState } from 'react';
import { X, Send, MessageSquare, Shield, User } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const ReplyModal = ({ 
  isOpen, 
  onClose, 
  comment, 
  onSubmit, 
  isLoading = false 
}) => {
  const { t } = useTranslation();
  const [replyContent, setReplyContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onSubmit(replyContent.trim());
      setReplyContent('');
    }
  };

  const handleClose = () => {
    setReplyContent('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-blue-500/30 rounded-xl p-6 w-full max-w-2xl mx-4 shadow-2xl shadow-blue-500/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center border-2 border-blue-500/50">
              <MessageSquare className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Responder Comentário</h3>
              <p className="text-sm text-blue-300">{t('modDetail.officialAdminReply')}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Comentário original */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/50 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-300" />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-300">
                {comment?.display_name || comment?.username}
              </span>
              <p className="text-xs text-gray-400">
                {comment?.created_at && new Date(comment.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-200 italic">
            "{comment?.content}"
          </p>
        </div>

        {/* Formulário de resposta */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t('modDetail.yourReply')}
            </label>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Digite sua resposta oficial aqui..."
              className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-400 mt-1">
              Esta resposta será marcada como oficial e aparecerá destacada.
            </p>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-sm font-medium text-gray-300 hover:text-white border-2 border-gray-600 rounded-lg hover:bg-gray-700/50 transition-all duration-200 flex items-center space-x-2"
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
              <span>Cancelar</span>
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isLoading || !replyContent.trim()}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isLoading ? t('modDetail.sending') : t('modDetail.sendReply')}</span>
            </button>
          </div>
        </form>

        {/* Aviso de permissão */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-blue-300">
              Apenas super administradores podem responder comentários. Sua resposta será marcada como oficial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyModal;

