
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, MessageCircle, Twitter, Copy } from 'lucide-react'; // Assuming MessageCircle for WhatsApp, Twitter for X
import { useToast } from "@/components/ui/use-toast";

const ShareButtons = ({ modName, modUrl }) => {
  const { toast } = useToast();

  const encodedUrl = encodeURIComponent(modUrl);
  const encodedText = encodeURIComponent(`Confira este mod incrível: ${modName}! ${modUrl}`);

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={18} />,
      url: `https://api.whatsapp.com/send?text=${encodedText}`,
    },
    {
      name: 'X/Twitter',
      icon: <Twitter size={18} />,
      url: `https://twitter.com/intent/tweet?text=${encodedText}`,
    },
    // Reddit and Discord links are more complex (need specific subreddits/servers or rely on user copy-pasting)
    // For now, a copy link button is more universally useful.
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(modUrl)
      .then(() => {
        toast({ title: "Link Copiado!", description: "O link do mod foi copiado para sua área de transferência." });
      })
      .catch(err => {
        toast({ title: "Erro ao Copiar", description: "Não foi possível copiar o link.", variant: "destructive" });
      });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-md font-semibold text-foreground flex items-center">
        <Share2 size={18} className="mr-2 text-primary" /> Compartilhar Mod:
      </h3>
      <div className="flex flex-wrap gap-2">
        {shareOptions.map(option => (
          <Button
            key={option.name}
            variant="outline"
            size="sm"
            className="minecraft-btn flex items-center gap-2"
            onClick={() => window.open(option.url, '_blank', 'noopener,noreferrer')}
            aria-label={`Compartilhar ${modName} no ${option.name}`}
          >
            {option.icon} {option.name}
          </Button>
        ))}
        <Button
            variant="outline"
            size="sm"
            className="minecraft-btn flex items-center gap-2"
            onClick={copyToClipboard}
            aria-label={`Copiar link do mod ${modName}`}
          >
            <Copy size={18}/> Copiar Link
        </Button>
      </div>
    </div>
  );
};

export default ShareButtons;
