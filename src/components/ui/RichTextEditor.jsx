import React, { useCallback, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import HardBreak from '@tiptap/extension-hard-break';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { Resizable } from 're-resizable';
import { Bold, Italic, Strikethrough, List, ListOrdered, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Link as LinkIcon, Image as ImageIcon, Undo, Redo, AlignLeft, AlignCenter, AlignRight, AlignJustify, Underline as UnderlineIcon, Code, Quote, Type, X, CornerDownLeft } from 'lucide-react';
import './RichTextEditor.css';

// Extensão personalizada para preservar parágrafos vazios
const PreserveEmptyParagraphs = {
  name: 'preserveEmptyParagraphs',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          'data-preserve': {
            default: 'true',
            renderHTML: attributes => {
              if (attributes['data-preserve'] === 'true') {
                return { 'data-preserve': 'true' };
              }
              return {};
            },
            parseHTML: element => element.getAttribute('data-preserve') || 'true'
          }
        }
      }
    ];
  },
  addCommands() {
    return {
      insertEmptyParagraph: () => ({ commands }) => {
        return commands.insertContent('<p><br></p>');
      }
    };
  }
};

// Extensão para forçar preservação de quebras de linha
const ForceLineBreaks = {
  name: 'forceLineBreaks',
  addKeyboardShortcuts() {
    return {
      'Enter': () => {
        // Comportamento normal do Enter (criar novo parágrafo)
        return false;
      },
      'Shift-Enter': () => {
        // Shift+Enter: inserir quebra de linha
        return this.editor.commands.insertContent('<br>');
      },
      'Ctrl-Enter': () => {
        // Ctrl+Enter: inserir quebra de linha (atalho para o botão)
        return this.editor.commands.insertContent('<br>');
      }
    };
  },
  addCommands() {
    return {
      insertLineBreak: () => ({ commands }) => {
        return commands.insertContent('<br>');
      }
    };
  }
};

const MenuButton = ({ onClick, active, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-2 py-1 rounded hover:bg-muted ${active ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
    title={title}
  >
    {children}
  </button>
);

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: attributes => {
          const width = attributes.width || '100%';
          return { style: `width: ${typeof width === 'number' ? `${width}px` : width}` };
        },
        parseHTML: element => element.style?.width || element.getAttribute('width') || '100%'
      },
      align: {
        default: 'left',
        renderHTML: attributes => {
          const align = attributes.align || 'left';
          let margin = '0';
          if (align === 'center') {
            margin = '0 auto';
          } else if (align === 'right') {
            margin = '0 0 0 auto';
          } else {
            margin = '0 auto 0 0';
          }
          return { 
            style: `display: block; margin: ${margin}; text-align: ${align};` 
          };
        },
        parseHTML: element => {
          const style = element.style?.textAlign || 'left';
          return style;
        }
      },
      alt: { default: null },
      title: { default: null }
    };
  },
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('div');
      dom.style.display = 'inline-block';
      const img = document.createElement('img');
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      img.style.maxWidth = '100%';

      let width = node.attrs.width || '100%';

      const container = document.createElement('div');
      container.style.display = 'inline-block';
      container.style.maxWidth = '100%';

      const resizable = document.createElement('div');
      container.appendChild(resizable);
      dom.appendChild(container);

      // React-like mount for re-resizable is not straightforward in nodeViews; use contentEditable false wrapper
      resizable.contentEditable = 'false';

      const updateAttrs = (newWidth) => {
        try {
          // Encontrar a posição exata da imagem no documento
          const pos = getPos();
          
          if (pos !== undefined && pos !== null) {
            const { state, view } = editor;
            const tr = state.tr.setNodeMarkup(pos, null, {
              ...node.attrs,
              width: newWidth
            });
            view.dispatch(tr);
          } else {
          }
        } catch (error) {
        }
      };

      const mountResizable = () => {
        // Fallback simple handle for width resizing if re-resizable is not available in SSR
        resizable.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.style.display = 'inline-block';
        wrapper.style.position = 'relative';
        wrapper.style.maxWidth = '100%';
        wrapper.style.border = '1px dashed transparent';
        wrapper.onmouseenter = () => { wrapper.style.border = '1px dashed var(--border)'; };
        wrapper.onmouseleave = () => { wrapper.style.border = '1px dashed transparent'; };
        
        // Add click handler to open image options modal
        wrapper.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          // Dispatch custom event to open modal
          const event = new CustomEvent('imageClick', {
            detail: { node, pos: getPos() }
          });
          document.dispatchEvent(event);
        };
        
        const handle = document.createElement('div');
        handle.style.position = 'absolute';
        handle.style.right = '-6px';
        handle.style.bottom = '-6px';
        handle.style.width = '12px';
        handle.style.height = '12px';
        handle.style.background = 'var(--primary)';
        handle.style.borderRadius = '3px';
        handle.style.cursor = 'nwse-resize';
        handle.style.zIndex = '10';
        handle.style.border = '1px solid var(--background)';

        let startX = 0;
        let startWidth = 0;
        handle.onmousedown = (e) => {
          e.preventDefault();
          e.stopPropagation();
          startX = e.clientX;
          startWidth = img.getBoundingClientRect().width;
          const onMove = (me) => {
            const delta = me.clientX - startX;
            const newWidth = Math.max(50, startWidth + delta);
            img.style.width = `${newWidth}px`;
          };
          const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            
            // GARANTIR QUE O REDIMENSIONAMENTO SEJA SALVO
            const newWidth = img.style.width;
            updateAttrs(newWidth);
            
            // Forçar atualização do editor para garantir que a mudança seja persistida
            setTimeout(() => {
              const html = editor.getHTML();
              onChange?.(html);
            }, 50);
          };
          document.addEventListener('mousemove', onMove);
          document.addEventListener('mouseup', onUp);
        };

        // GARANTIR QUE A IMAGEM TENHA O TAMANHO CORRETO
        img.style.width = typeof width === 'number' ? `${width}px` : width;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        
        wrapper.appendChild(img);
        wrapper.appendChild(handle);
        resizable.appendChild(wrapper);
        
        // FORÇAR ATUALIZAÇÃO VISUAL
        wrapper.style.transform = 'translateZ(0)';
      };

      mountResizable();

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== 'image') return false;
          if (updatedNode.attrs.src !== img.src) img.src = updatedNode.attrs.src;
          if (updatedNode.attrs.width !== width) {
            width = updatedNode.attrs.width;
            img.style.width = typeof width === 'number' ? `${width}px` : width;
          }
          
          // GARANTIR QUE OS ELEMENTOS DE REDIMENSIONAMENTO ESTEJAM PRESENTES
          // Verificar se já existem elementos de redimensionamento
          const existingHandle = resizable.querySelector('[style*="cursor: nwse-resize"]');
          if (!existingHandle) {
            // Recriar elementos de redimensionamento se não existirem
            setTimeout(() => {
              mountResizable();
            }, 10);
          }
          
          return true;
        }
      };
    };
  }
});

export const RichTextEditor = ({ value, onChange }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAlignment, setSelectedAlignment] = useState('left');
  const [showImageOptionsModal, setShowImageOptionsModal] = useState(false);
  const [selectedImageNode, setSelectedImageNode] = useState(null);
  const [selectedImagePos, setSelectedImagePos] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        paragraph: {
          HTMLAttributes: {
            class: 'paragraph'
          },
          // PRESERVAR PARÁGRAFOS VAZIOS
          keepMarks: false,
          keepAttributes: false
        },
        // DESABILITAR REMOÇÃO DE PARÁGRAFOS VAZIOS
        gapcursor: false,
        dropcursor: false
      }),
      HardBreak.configure({
        keepMarks: false,
        HTMLAttributes: {
          class: 'hard-break'
        }
      }),
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' }
      }),
      TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
      ResizableImage.configure({ inline: false, allowBase64: true }),
      PreserveEmptyParagraphs,
      ForceLineBreaks
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none whitespace-pre-wrap',
        style: 'white-space: pre-wrap;'
      }
    },
    onUpdate: ({ editor }) => {
      let html = editor.getHTML();
      
      // CONVERTER TODAS AS LINHAS VAZIAS EM <br>
      html = html
        // Converter parágrafos vazios (com ou sem classes) em quebras de linha
        .replace(/<p[^>]*><\/p>/g, '<br>')
        .replace(/<p[^>]*>\s+<\/p>/g, '<br>')
        .replace(/<p[^>]*>\u00A0<\/p>/g, '<br>')
        .replace(/<p[^>]*>&nbsp;<\/p>/g, '<br>')
        // Converter parágrafos com apenas espaços em branco
        .replace(/<p[^>]*>\s*<\/p>/g, '<br>')
        // Converter quebras de linha em <br>
        .replace(/\n/g, '<br>')
        // Adicionar quebras entre parágrafos para preservar espaçamento
        .replace(/<\/p><p>/g, '</p><br><p>')
        // EVITAR MULTIPLICAÇÃO: remover <br> duplicados consecutivos
        .replace(/<br>\s*<br>\s*<br>/g, '<br><br>')
        .replace(/<br>\s*<br>/g, '<br>');
      
      onChange?.(html);
    },
    onCreate: ({ editor }) => {
      // GARANTIR QUE IMAGENS EXISTENTES SEJAM REDIMENSIONÁVEIS
      // Isso resolve o problema de mods já publicados
      setTimeout(() => {
        // Forçar atualização de todas as imagens para garantir que tenham os elementos de redimensionamento
        const { state, view } = editor;
        const doc = state.doc;
        
        doc.descendants((node, nodePos) => {
          if (node.type.name === 'image') {
            // Forçar re-render da imagem para garantir elementos de redimensionamento
            const tr = state.tr.setNodeMarkup(nodePos, null, {
              ...node.attrs
            });
            view.dispatch(tr);
          }
        });
      }, 100);
    }
  });

  // Event listener para cliques em imagens
  React.useEffect(() => {
    const handleImageClick = (event) => {
      const { node, pos } = event.detail;
      setSelectedImageNode(node);
      setSelectedImagePos(pos);
      setShowImageOptionsModal(true);
    };

    document.addEventListener('imageClick', handleImageClick);
    return () => {
      document.removeEventListener('imageClick', handleImageClick);
    };
  }, []);

  // GARANTIR REDIMENSIONAMENTO EM MODS EXISTENTES
  // Quando o valor muda (edição de mod existente), reinicializar imagens
  React.useEffect(() => {
    if (editor && value) {
      // Aguardar o editor processar o conteúdo
      setTimeout(() => {
        // Forçar re-render de todas as imagens para garantir elementos de redimensionamento
        const { state, view } = editor;
        const doc = state.doc;
        
        doc.descendants((node, nodePos) => {
          if (node.type.name === 'image') {
            // Forçar re-render da imagem para garantir elementos de redimensionamento
            const tr = state.tr.setNodeMarkup(nodePos, null, {
              ...node.attrs
            });
            view.dispatch(tr);
          }
        });
      }, 200);
    }
  }, [editor, value]);

  const openImageModal = useCallback(() => {
    setShowImageModal(true);
    setSelectedFile(null);
    setSelectedAlignment('left');
  }, []);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const insertImage = useCallback(async () => {
    if (!selectedFile) return;
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      const token = localStorage.getItem('authToken');
      const resp = await fetch('/api/mods/editor/upload-image', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData
      });
      const data = await resp.json();
      if (data?.url) {
        editor?.chain().focus().setImage({ 
          src: data.url, 
          alt: selectedFile.name, 
          width: '100%', 
          align: selectedAlignment 
        }).run();
        setShowImageModal(false);
        setSelectedFile(null);
        setSelectedAlignment('left');
      }
    } catch (error) {
    }
  }, [selectedFile, selectedAlignment, editor]);

  const alignImage = useCallback((alignment) => {
    const { state, view } = editor;
    const { selection } = state;
    const { $from } = selection;
    
    // Find the image node
    const imageNode = $from.node();
    if (imageNode && imageNode.type.name === 'image') {
      const tr = state.tr.setNodeMarkup($from.before(), null, {
        ...imageNode.attrs,
        align: alignment
      });
      view.dispatch(tr);
    } else {
      // If no image is selected, try to find the nearest image
      const pos = $from.pos;
      const doc = state.doc;
      
      doc.descendants((node, nodePos) => {
        if (node.type.name === 'image' && Math.abs(nodePos - pos) < 10) {
          const tr = state.tr.setNodeMarkup(nodePos, null, {
            ...node.attrs,
            align: alignment
          });
          view.dispatch(tr);
          return false; // Stop searching
        }
      });
    }
    
    // Force immediate visual update
    setTimeout(() => {
      const editorElement = view.dom;
      const images = editorElement.querySelectorAll('img');
      images.forEach(img => {
        // Apply alignment directly to the image
        img.style.display = 'block';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        
        if (alignment === 'center') {
          img.style.margin = '0 auto';
        } else if (alignment === 'right') {
          img.style.margin = '0 0 0 auto';
        } else {
          img.style.margin = '0 auto 0 0';
        }
        
        // Also apply to parent container
        const parent = img.parentElement;
        if (parent) {
          parent.style.textAlign = alignment;
          parent.style.display = 'block';
        }
      });
    }, 10);
  }, [editor]);

  // Função para forçar alinhamento de todas as imagens
  const forceAlignAllImages = useCallback((alignment) => {
    const { state, view } = editor;
    const doc = state.doc;
    
    // Find all image nodes and update them
    doc.descendants((node, nodePos) => {
      if (node.type.name === 'image') {
        const tr = state.tr.setNodeMarkup(nodePos, null, {
          ...node.attrs,
          align: alignment
        });
        view.dispatch(tr);
      }
    });
    
    // Force immediate visual update
    setTimeout(() => {
      const editorElement = view.dom;
      const images = editorElement.querySelectorAll('img');
      images.forEach(img => {
        img.style.display = 'block';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        
        if (alignment === 'center') {
          img.style.margin = '0 auto';
        } else if (alignment === 'right') {
          img.style.margin = '0 0 0 auto';
        } else {
          img.style.margin = '0 auto 0 0';
        }
        
        const parent = img.parentElement;
        if (parent) {
          parent.style.textAlign = alignment;
          parent.style.display = 'block';
        }
      });
    }, 10);
  }, [editor]);

  // Função para alinhar uma imagem específica
  const alignSpecificImage = useCallback((alignment) => {
    if (!selectedImageNode || selectedImagePos === null) return;
    
    const { state, view } = editor;
    const tr = state.tr.setNodeMarkup(selectedImagePos, null, {
      ...selectedImageNode.attrs,
      align: alignment
    });
    view.dispatch(tr);
    
    // Force immediate visual update
    setTimeout(() => {
      const editorElement = view.dom;
      const images = editorElement.querySelectorAll('img');
      images.forEach(img => {
        if (img.src === selectedImageNode.attrs.src) {
          img.style.display = 'block';
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          
          if (alignment === 'center') {
            img.style.margin = '0 auto';
          } else if (alignment === 'right') {
            img.style.margin = '0 0 0 auto';
          } else {
            img.style.margin = '0 auto 0 0';
          }
          
          const parent = img.parentElement;
          if (parent) {
            parent.style.textAlign = alignment;
            parent.style.display = 'block';
          }
        }
      });
    }, 10);
    
    setShowImageOptionsModal(false);
  }, [editor, selectedImageNode, selectedImagePos]);

  if (!editor) return null;

  return (
    <div className="border border-border rounded-md bg-background">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/30">
        {/* Formatação de Texto */}
        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrito">
          <Bold size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Itálico">
          <Italic size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Sublinhado">
          <UnderlineIcon size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Tachado">
          <Strikethrough size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Código Inline">
          <Code size={16} />
        </MenuButton>
        <span className="mx-1 h-5 w-px bg-border" />
        
        {/* Títulos */}
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Título 1">
          <Heading1 size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Título 2">
          <Heading2 size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Título 3">
          <Heading3 size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive('heading', { level: 4 })} title="Título 4">
          <Heading4 size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} active={editor.isActive('heading', { level: 5 })} title="Título 5">
          <Heading5 size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} active={editor.isActive('heading', { level: 6 })} title="Título 6">
          <Heading6 size={16} />
        </MenuButton>
        <span className="mx-1 h-5 w-px bg-border" />
        
        {/* Alinhamento de Texto */}
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Alinhar à Esquerda">
          <AlignLeft size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centralizar">
          <AlignCenter size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Alinhar à Direita">
          <AlignRight size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justificar">
          <AlignJustify size={16} />
        </MenuButton>
        <span className="mx-1 h-5 w-px bg-border" />
        
        {/* Listas */}
        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista com Marcadores">
          <List size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista Numerada">
          <ListOrdered size={16} />
        </MenuButton>
        <span className="mx-1 h-5 w-px bg-border" />
        
        {/* Elementos de Bloco */}
        <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citação">
          <Quote size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Bloco de Código">
          <Type size={16} />
        </MenuButton>
        <span className="mx-1 h-5 w-px bg-border" />
        
        {/* Links e Imagens */}
        <MenuButton onClick={() => {
          const url = window.prompt('Informe a URL do link:');
          if (!url) return;
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }} active={editor.isActive('link')} title="Adicionar Link">
          <LinkIcon size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().unsetLink().run()} active={editor.isActive('link')} title="Remover Link">
          <LinkIcon size={16} className="text-red-400" />
        </MenuButton>
        <MenuButton onClick={openImageModal} title="Adicionar Imagem">
          <ImageIcon size={16} />
        </MenuButton>
        <MenuButton onClick={() => {
          if (editor) {
            editor.chain().focus().insertContent('<br>').run();
          }
        }} title="Inserir Quebra de Linha (Ctrl+Enter)">
          <CornerDownLeft size={16} />
        </MenuButton>
        <span className="mx-1 h-5 w-px bg-border" />
        
        {/* Botão de teste para centralizar todas as imagens */}
        <MenuButton onClick={() => {
          forceAlignAllImages('center');
          setTimeout(() => {
            const html = editor.getHTML();
          }, 100);
        }} title="Centralizar Todas as Imagens (Teste)">
          🎯
        </MenuButton>
        
        {/* Controles de Edição */}
        <div className="ml-auto flex gap-1">
          <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Desfazer">
            <Undo size={16} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Refazer">
            <Redo size={16} />
          </MenuButton>
        </div>
      </div>
      <div className="p-3 min-h-[220px]">
        <EditorContent 
          editor={editor} 
          className="rich-text-editor"
        />
      </div>

      {/* Modal para inserir imagem */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Inserir Imagem</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Upload de arquivo */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Selecionar Imagem
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Arquivo selecionado: {selectedFile.name}
                  </p>
                )}
              </div>

              {/* Seleção de alinhamento */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Alinhamento da Imagem
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedAlignment('left')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                      selectedAlignment === 'left'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <AlignLeft size={16} />
                    Esquerda
                  </button>
                  <button
                    onClick={() => setSelectedAlignment('center')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                      selectedAlignment === 'center'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <AlignCenter size={16} />
                    Centro
                  </button>
                  <button
                    onClick={() => setSelectedAlignment('right')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                      selectedAlignment === 'right'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <AlignRight size={16} />
                    Direita
                  </button>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
                <button
                  onClick={insertImage}
                  disabled={!selectedFile}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Inserir Imagem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de opções de imagem */}
      {showImageOptionsModal && selectedImageNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Opções da Imagem</h3>
              <button
                onClick={() => setShowImageOptionsModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Preview da imagem */}
              <div className="text-center">
                <img 
                  src={selectedImageNode.attrs.src} 
                  alt={selectedImageNode.attrs.alt || 'Imagem selecionada'}
                  className="max-w-full h-32 object-contain mx-auto rounded border"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Alinhamento atual: {selectedImageNode.attrs.align || 'left'}
                </p>
              </div>

              {/* Opções de alinhamento */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Alinhamento da Imagem
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => alignSpecificImage('left')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                      (selectedImageNode.attrs.align || 'left') === 'left'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <AlignLeft size={16} />
                    Esquerda
                  </button>
                  <button
                    onClick={() => alignSpecificImage('center')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                      (selectedImageNode.attrs.align || 'left') === 'center'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <AlignCenter size={16} />
                    Centro
                  </button>
                  <button
                    onClick={() => alignSpecificImage('right')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border ${
                      (selectedImageNode.attrs.align || 'left') === 'right'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <AlignRight size={16} />
                    Direita
                  </button>
                </div>
              </div>

              {/* Informações da imagem */}
              <div className="text-sm text-muted-foreground">
                <p><strong>Largura:</strong> {selectedImageNode.attrs.width || '100%'}</p>
                <p><strong>Alt:</strong> {selectedImageNode.attrs.alt || 'Sem descrição'}</p>
      </div>
      
              {/* Botões de ação */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowImageOptionsModal(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
