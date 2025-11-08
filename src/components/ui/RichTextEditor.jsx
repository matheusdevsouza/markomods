import React, { useCallback, useState, useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import HardBreak from '@tiptap/extension-hard-break';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Resizable } from 're-resizable';
import { Bold, Italic, Strikethrough, List, ListOrdered, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Link as LinkIcon, Image as ImageIcon, Undo, Redo, AlignLeft, AlignCenter, AlignRight, AlignJustify, Underline as UnderlineIcon, Code, Quote, Type, X, CornerDownLeft, Palette, Check, Upload, Image as ImageIcon2 } from 'lucide-react';
import './RichTextEditor.css';

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

const ForceLineBreaks = {
  name: 'forceLineBreaks',
  addKeyboardShortcuts() {
    return {
      'Enter': () => {
        return false;
      },
      'Shift-Enter': () => {
        return this.editor.commands.insertContent('<br>');
      },
      'Ctrl-Enter': () => {
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

      resizable.contentEditable = 'false';

      const updateAttrs = (newWidth) => {
        try {
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
        resizable.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.style.display = 'inline-block';
        wrapper.style.position = 'relative';
        wrapper.style.maxWidth = '100%';
        wrapper.style.border = '1px dashed transparent';
        wrapper.onmouseenter = () => { wrapper.style.border = '1px dashed var(--border)'; };
        wrapper.onmouseleave = () => { wrapper.style.border = '1px dashed transparent'; };
        
        wrapper.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const event = new CustomEvent('imageClick', {
            detail: { node, pos: getPos() }
          });
          document.dispatchEvent(event);
        };

        const deleteButton = document.createElement('div');
        deleteButton.style.position = 'absolute';
        deleteButton.style.top = '8px';
        deleteButton.style.right = '8px';
        deleteButton.style.width = '24px';
        deleteButton.style.height = '24px';
        deleteButton.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
        deleteButton.style.borderRadius = '6px';
        deleteButton.style.cursor = 'pointer';
        deleteButton.style.zIndex = '20';
        deleteButton.style.border = 'none';
        deleteButton.style.display = 'flex';
        deleteButton.style.alignItems = 'center';
        deleteButton.style.justifyContent = 'center';
        deleteButton.style.fontSize = '12px';
        deleteButton.style.color = 'white';
        deleteButton.style.fontWeight = '600';
        deleteButton.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.2)';
        deleteButton.style.opacity = '0';
        deleteButton.style.transition = 'all 0.2s ease';
        deleteButton.style.transform = 'scale(0.8)';

        deleteButton.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        `;
        
        wrapper.onmouseenter = () => { 
          wrapper.style.border = '1px dashed var(--border)';
          deleteButton.style.opacity = '1';
          deleteButton.style.transform = 'scale(1)';
        };
        wrapper.onmouseleave = () => { 
          wrapper.style.border = '1px dashed transparent';
          deleteButton.style.opacity = '0';
          deleteButton.style.transform = 'scale(0.8)';
        };

        deleteButton.onmouseenter = () => {
          deleteButton.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
          deleteButton.style.transform = 'scale(1.1)';
          deleteButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.3)';
        };
        
        deleteButton.onmouseleave = () => {
          deleteButton.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
          deleteButton.style.transform = 'scale(1)';
          deleteButton.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.2)';
        };

        deleteButton.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          try {
            const pos = getPos();
            if (pos !== undefined && pos !== null) {
              const { state, view } = editor;
              const tr = state.tr.delete(pos, pos + node.nodeSize);
              view.dispatch(tr);
            }
          } catch (error) {
            console.error('Erro ao excluir imagem:', error);
          }
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
            
            const newWidth = img.style.width;
            updateAttrs(newWidth);
            
            setTimeout(() => {
              const html = editor.getHTML();
              if (onChange) {
                onChange(html);
              }
            }, 50);
          };
          document.addEventListener('mousemove', onMove);
          document.addEventListener('mouseup', onUp);
        };

        img.style.width = typeof width === 'number' ? `${width}px` : width;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        
        wrapper.appendChild(img);
        wrapper.appendChild(handle);
        wrapper.appendChild(deleteButton);
        resizable.appendChild(wrapper);
        
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
          
          const existingHandle = resizable.querySelector('[style*="cursor: nwse-resize"]');
          if (!existingHandle) {
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

const ColorPicker = ({ onColorSelect, currentColor, onClose }) => {
  const [customColor, setCustomColor] = useState(currentColor || '#FFFFFF');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const predefinedColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#000080',
    '#808080', '#C0C0C0', '#FFC0CB', '#A52A2A', '#FFD700', '#00CED1',
    '#FF6347', '#32CD32', '#8A2BE2', '#DC143C', '#00BFFF', '#FF1493'
  ];

  const handleColorSelect = (color) => {
    onColorSelect(color);
  };

  const handleCustomColorSubmit = () => {
    if (customColor) {
      onColorSelect(customColor);
    }
  };

  return (
    <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg p-4 z-50 min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-foreground">Escolher Cor</h4>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* cores predefinidas */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-2">Cores Predefinidas</p>
        <div className="grid grid-cols-6 gap-2">
          {predefinedColors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              className={`w-8 h-8 rounded border-2 ${
                currentColor === color ? 'border-primary' : 'border-border'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            >
              {currentColor === color && (
                <Check size={12} className="text-white mx-auto" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* cor personalizada */}
      <div className="border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-8 h-8 rounded border border-border cursor-pointer"
          />
          <input
            type="text"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            placeholder="#000000"
            className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background text-foreground"
          />
          <button
            onClick={handleCustomColorSubmit}
            className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Aplicar
          </button>
        </div>
      </div>
      
      {/* botão limpar */}
      <div className="border-t border-border pt-3 mt-3">
        <button
          onClick={() => {
            onColorSelect('#FFFFFF');
            onClose();
          }}
          className="w-full px-3 py-2 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80"
        >
          Limpar
        </button>
      </div>
    </div>
  );
};

export const RichTextEditor = ({ value, onChange }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAlignment, setSelectedAlignment] = useState('left');
  const [showImageOptionsModal, setShowImageOptionsModal] = useState(false);
  const [selectedImageNode, setSelectedImageNode] = useState(null);
  const [selectedImagePos, setSelectedImagePos] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFloatingColorPicker, setShowFloatingColorPicker] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({ top: 0, left: 0 });
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [floatingMenuPosition, setFloatingMenuPosition] = useState({ top: 0, left: 0 });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const colorPickerRef = useRef(null);
  const floatingMenuRef = useRef(null);
  const selectionTimeoutRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        paragraph: {
          HTMLAttributes: {
            class: 'paragraph'
          },
          keepMarks: false,
          keepAttributes: false
        },
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
      TextStyle,
      Color.configure({ types: [TextStyle.name] }),
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
      
      html = html
        .replace(/<p[^>]*><\/p>/g, '<br>')
        .replace(/<p[^>]*>\s+<\/p>/g, '<br>')
        .replace(/<p[^>]*>\u00A0<\/p>/g, '<br>')
        .replace(/<p[^>]*>&nbsp;<\/p>/g, '<br>')
        .replace(/<p[^>]*>\s*<\/p>/g, '<br>')
        .replace(/\n/g, '<br>')
        .replace(/<\/p><p>/g, '</p><br><p>')
        .replace(/<br>\s*<br>\s*<br>/g, '<br><br>')
        .replace(/<br>\s*<br>/g, '<br>');
      
      onChange?.(html);
    },
    onCreate: ({ editor }) => {
      setTimeout(() => {
        const { state, view } = editor;
        const doc = state.doc;
        
        doc.descendants((node, nodePos) => {
          if (node.type.name === 'image') {
            const tr = state.tr.setNodeMarkup(nodePos, null, {
              ...node.attrs
            });
            view.dispatch(tr);
          }
        });
      }, 100);
    }
  });

  const applyTextColor = useCallback((color) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
    }
  }, [editor]);

  const applyFloatingTextColor = useCallback((color) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
    }
  }, [editor]);

  const getCurrentTextColor = useCallback(() => {
    if (editor) {
      return editor.getAttributes('textStyle').color || '#FFFFFF';
    }
    return '#FFFFFF';
  }, [editor]);

  const removeTextColor = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetColor().run();
      setShowColorPicker(false);
    }
  }, [editor]);

  const openLinkModal = useCallback(() => {
    if (editor) {
      const { selection } = editor.state;
      const selectedText = editor.state.doc.textBetween(selection.from, selection.to);
      setSelectedText(selectedText);
      setLinkUrl('');
      setShowLinkModal(true);
    }
  }, [editor]);

  const applyLink = useCallback(() => {
    if (editor && linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setShowLinkModal(false);
      setLinkUrl('');
      setSelectedText('');
    }
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
  }, [editor]);

  const openImageOptionsModal = useCallback((node, pos) => {
    setSelectedImageNode(node);
    setSelectedImagePos(pos);
    setShowImageOptionsModal(true);
  }, []);




  React.useEffect(() => {
    const handleImageClick = (event) => {
      const { node, pos } = event.detail;
      openImageOptionsModal(node, pos);
    };

    document.addEventListener('imageClick', handleImageClick);
    return () => {
      document.removeEventListener('imageClick', handleImageClick);
    };
  }, [openImageOptionsModal]);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const { selection } = editor.state;
      const hasSelection = !selection.empty;
      
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
      
      if (hasSelection) {
          selectionTimeoutRef.current = setTimeout(() => {
          const currentSelection = editor.state.selection;
          if (!currentSelection.empty) {
            const { view } = editor;
            const { from, to } = currentSelection;
            const start = view.coordsAtPos(from);
            const end = view.coordsAtPos(to);
            
            const editorRect = view.dom.getBoundingClientRect();
            const menuTop = start.top - editorRect.top - 10;
            const menuLeft = Math.min(start.left - editorRect.left, editorRect.width - 200);
            
            setFloatingMenuPosition({ top: menuTop, left: menuLeft });
            setShowFloatingMenu(true);
          }
        }, 500);
      } else {
        setShowFloatingMenu(false);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [editor]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      const isColorPickerClick = colorPickerRef.current && colorPickerRef.current.contains(event.target);
      const isFloatingMenuClick = floatingMenuRef.current && floatingMenuRef.current.contains(event.target);
      
      if (!isColorPickerClick && !isFloatingMenuClick) {
        setTimeout(() => {
          setShowColorPicker(false);
          setShowFloatingColorPicker(false);
        }, 100);
      }
    };

    if (showColorPicker || showFloatingColorPicker || showFloatingMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker, showFloatingColorPicker, showFloatingMenu]);

  React.useEffect(() => {
    if (editor && value) {
      setTimeout(() => {
        const { state, view } = editor;
        const doc = state.doc;
        
        doc.descendants((node, nodePos) => {
          if (node.type.name === 'image') {
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
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      }
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
      console.error('Erro ao inserir imagem:', error);
    }
  }, [selectedFile, selectedAlignment, editor]);

  const alignImage = useCallback((alignment) => {
    const { state, view } = editor;
    const { selection } = state;
    const { $from } = selection;
    
    const imageNode = $from.node();
    if (imageNode && imageNode.type.name === 'image') {
      const tr = state.tr.setNodeMarkup($from.before(), null, {
        ...imageNode.attrs,
        align: alignment
      });
      view.dispatch(tr);
    } else {
      const pos = $from.pos;
      const doc = state.doc;
      
      doc.descendants((node, nodePos) => {
        if (node.type.name === 'image' && Math.abs(nodePos - pos) < 10) {
          const tr = state.tr.setNodeMarkup(nodePos, null, {
            ...node.attrs,
            align: alignment
          });
          view.dispatch(tr);
          return false;
        }
      });
    }
    
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

  const forceAlignAllImages = useCallback((alignment) => {
    const { state, view } = editor;
    const doc = state.doc;
    
    doc.descendants((node, nodePos) => {
      if (node.type.name === 'image') {
        const tr = state.tr.setNodeMarkup(nodePos, null, {
          ...node.attrs,
          align: alignment
        });
        view.dispatch(tr);
      }
    });
    
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

  const alignSpecificImage = useCallback((alignment) => {
    if (!selectedImageNode || selectedImagePos === null) return;
    
    const { state, view } = editor;
    const tr = state.tr.setNodeMarkup(selectedImagePos, null, {
      ...selectedImageNode.attrs,
      align: alignment
    });
    view.dispatch(tr);
    
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
        
        {/* formatação de texto */}
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
        
        {/* seletor de cor */}
        <div className="relative" ref={colorPickerRef}>
          <MenuButton 
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowFloatingColorPicker(false);
            }} 
            active={editor.isActive('textStyle', { color: /^#/ })} 
            title="Cor do Texto"
          >
            <Palette size={16} />
          </MenuButton>
          {showColorPicker && (
            <ColorPicker
              onColorSelect={applyTextColor}
              currentColor={getCurrentTextColor()}
              onClose={() => setShowColorPicker(false)}
            />
          )}
        </div>
        <span className="mx-1 h-5 w-px bg-border" />
        
        {/* títulos */}
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
        
        {/* alinhamento de texto */}
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
        
        {/* listas */}
        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista com Marcadores">
          <List size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista Numerada">
          <ListOrdered size={16} />
        </MenuButton>
        <span className="mx-1 h-5 w-px bg-border" />
        
        {/* elementos de bloco */}
        <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citação">
          <Quote size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Bloco de Código">
          <Type size={16} />
        </MenuButton>
        <span className="mx-1 h-5 w-px bg-border" />
        
        {/* links e imagens */}
        <MenuButton onClick={openLinkModal} active={editor.isActive('link')} title="Adicionar Link">
          <LinkIcon size={16} />
        </MenuButton>
        <MenuButton onClick={removeLink} active={editor.isActive('link')} title="Remover Link">
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
        
        {/* botão de teste para centralizar todas as imagens */}
        <MenuButton onClick={() => {
          forceAlignAllImages('center');
          setTimeout(() => {
            const html = editor.getHTML();
          }, 100);
        }} title="Centralizar Todas as Imagens (Teste)">
          🎯
        </MenuButton>
        
        {/* controles de edição */}
        <div className="ml-auto flex gap-1">
          <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Desfazer">
            <Undo size={16} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Refazer">
            <Redo size={16} />
          </MenuButton>
        </div>
      </div>
      <div className="p-3 min-h-[220px] relative">
        <EditorContent 
          editor={editor} 
          className="rich-text-editor"
        />
        
        {/* menu flutuante de seleção de texto */}
        {showFloatingMenu && (
          <div 
            ref={floatingMenuRef}
            className="absolute bg-background border border-border rounded-lg shadow-lg p-2 flex items-center gap-1 z-50"
            style={{
              top: `${floatingMenuPosition.top}px`,
              left: `${floatingMenuPosition.left}px`,
            }}
          >
            <MenuButton 
              onClick={() => {
                setShowFloatingColorPicker(!showFloatingColorPicker);
                setShowColorPicker(false);
              }} 
              active={editor.isActive('textStyle', { color: /^#/ })} 
              title="Cor do Texto"
            >
              <Palette size={14} />
            </MenuButton>
            <MenuButton 
              onClick={removeTextColor} 
              title="Remover Cor"
            >
              <X size={14} />
            </MenuButton>
            {showFloatingColorPicker && (
              <div className="absolute top-full left-0 mt-2">
                <ColorPicker
                  onColorSelect={applyFloatingTextColor}
                  currentColor={getCurrentTextColor()}
                  onClose={() => setShowFloatingColorPicker(false)}
                />
              </div>
            )}
          </div>
        )}
      </div>

        {/* modal para inserir link */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Adicionar Link</h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* texto selecionado */}
            {selectedText && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Texto selecionado:
                </label>
                <div className="p-3 bg-muted rounded-md border border-border">
                  <span className="text-muted-foreground">"{selectedText}"</span>
                </div>
              </div>
            )}
            
            {/* campo de url */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                URL do link:
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://exemplo.com"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    applyLink();
                  } else if (e.key === 'Escape') {
                    setShowLinkModal(false);
                  }
                }}
              />
            </div>
            
            {/* botões */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={applyLink}
                disabled={!linkUrl.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed rounded-md transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal para inserir imagem */}
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
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Selecionar Imagem
                </label>
                
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    isDragOver 
                      ? 'border-primary bg-primary/5' 
                      : selectedFile 
                        ? 'border-green-500 bg-green-500/5' 
                        : 'border-border hover:border-primary/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {selectedFile ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                        <ImageIcon2 size={32} className="text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Clique para trocar ou arraste outra imagem
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                        <ImageIcon2 size={32} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">
                          Clique para selecionar ou arraste uma imagem
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF até 5MB
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <Upload size={16} />
                        Escolher Arquivo
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* seleção de alinhamento */}
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


              {/* botões de ação */}
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

      {/* modal de opções de imagem */}
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
              <div className="text-center">
                <img 
                  src={selectedImageNode.attrs.src} 
                  alt={selectedImageNode.attrs.alt || 'Imagem selecionada'}
                  className="max-w-full h-32 object-contain mx-auto rounded border"
                />
              </div>

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



              {/* botões de ação */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowImageOptionsModal(false)}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
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
