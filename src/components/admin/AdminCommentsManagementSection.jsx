
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageSquare, Check, X, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useData } from '@/contexts/DataContext';

const SectionWrapper = ({ title, description, children, icon: Icon }) => (
  <Card className="glass-effect mb-8">
    <CardHeader>
      <CardTitle className="text-2xl text-primary flex items-center">
        {Icon && <Icon size={24} className="mr-3" />}
        {title}
      </CardTitle>
      {description && <CardDescription className="text-muted-foreground">{description}</CardDescription>}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const AdminCommentsManagementSection = () => {
  const { mediaKitPublicData, updateAndSaveMediaKitData } = useData();
  const { toast } = useToast();

  const comments = mediaKitPublicData?.comments || [];
  const commentsRequireApproval = mediaKitPublicData?.profile?.comments_require_approval === undefined ? true : mediaKitPublicData.profile.comments_require_approval;

  const handleToggleApprovalRequirement = (checked) => {
    const updatedData = {
      ...mediaKitPublicData,
      profile: {
        ...mediaKitPublicData.profile,
        comments_require_approval: checked,
      },
    };
    updateAndSaveMediaKitData(updatedData);
    toast({ title: "Configuração de Comentários Atualizada", description: `Aprovação de comentários ${checked ? 'ativada' : 'desativada'}.` });
  };

  const handleCommentAction = (commentId, action) => {
    let updatedComments = [...comments];
    const commentIndex = updatedComments.findIndex(c => c.id === commentId);

    if (commentIndex === -1) return;

    if (action === 'approve') {
      updatedComments[commentIndex] = { ...updatedComments[commentIndex], is_approved: true };
    } else if (action === 'unapprove') {
      updatedComments[commentIndex] = { ...updatedComments[commentIndex], is_approved: false };
    } else if (action === 'delete') {
      updatedComments.splice(commentIndex, 1);
    }

    const updatedData = { ...mediaKitPublicData, comments: updatedComments };
    updateAndSaveMediaKitData(updatedData);
    toast({ title: "Comentário Atualizado", description: `Ação '${action}' executada com sucesso.` });
  };

  return (
    <SectionWrapper title={t('modDetail.comments')} description="Aprove, reprove ou exclua comentários." icon={MessageSquare}>
      <div className="flex items-center space-x-2 mb-6">
        <Switch
          id="comments-approval-switch"
          checked={commentsRequireApproval}
          onCheckedChange={handleToggleApprovalRequirement}
        />
        <Label htmlFor="comments-approval-switch" className="text-card-foreground">Exigir aprovação para novos comentários</Label>
      </div>

      {comments.length === 0 ? (
        <p className="text-muted-foreground">Nenhum comentário para gerenciar.</p>
      ) : (
        <div className="space-y-4">
          {comments.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).map(comment => (
            <Card key={comment.id} className="p-4 bg-card/60 border-border/50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-card-foreground">{comment.commenter_username || "Usuário Anônimo"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleString('pt-BR')} - 
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      Status: <span className={comment.is_approved ? 'text-purple-500' : 'text-yellow-500'}>{comment.is_approved ? 'Aprovado' : 'Pendente'}</span>
                    </div>
                  </p>
                  <p className="mt-2 text-sm text-card-foreground whitespace-pre-wrap break-words overflow-wrap-anywhere">{comment.content}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-purple-500 border-purple-500 hover:bg-purple-500/10" onClick={() => handleCommentAction(comment.id, 'approve')}>
                    Aprovar
                  </Button>
                  {!comment.is_approved ? (
                    <Button size="sm" variant="outline" className="text-yellow-500 border-yellow-500 hover:bg-yellow-500/10" onClick={() => handleCommentAction(comment.id, 'unapprove')}>
                      <X size={16} className="mr-1 sm:mr-2" /> Reprovar
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="text-yellow-500 border-yellow-500 hover:bg-yellow-500/10" onClick={() => handleCommentAction(comment.id, 'unapprove')}>
                      <X size={16} className="mr-1 sm:mr-2" /> Reprovar
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => handleCommentAction(comment.id, 'delete')} className="bg-red-500 hover:bg-red-600 text-white">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
};

export default AdminCommentsManagementSection;