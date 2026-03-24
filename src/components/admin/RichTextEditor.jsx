/**
 * RichTextEditor — TipTap-based WYSIWYG editor for admin CMS pages.
 * Outputs HTML stored in the database body column.
 *
 * Props:
 *   content   (string) — initial HTML content
 *   onChange  (fn)     — called with HTML string on every change
 *   placeholder (string, optional)
 */
import { useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Link as LinkIcon, Undo2, Redo2, Unlink, Paperclip, Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const MAX_INLINE_FILE = 20 * 1024 * 1024; // 20MB
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ToolbarButton({ onClick, isActive, children, title, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-2 rounded transition-colors ${
        disabled
          ? 'text-gray-300 cursor-not-allowed'
          : isActive
            ? 'bg-[#00458B] text-white'
            : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, onAttachClick, uploading, uploadError }) {
  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes('link').href;
    const url = window.prompt('URL', previous || 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-col gap-1">
      <div className="flex gap-1 flex-wrap items-center">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
          <Italic size={16} />
        </ToolbarButton>

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 size={16} />
        </ToolbarButton>

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
          <ListOrdered size={16} />
        </ToolbarButton>

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton onClick={setLink} isActive={editor.isActive('link')} title="Add hyperlink (URL)">
          <LinkIcon size={16} />
        </ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link">
            <Unlink size={16} />
          </ToolbarButton>
        )}

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton
          onClick={onAttachClick}
          isActive={false}
          disabled={uploading}
          title="Insert image or attach file (uploads to storage)"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
        </ToolbarButton>

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo2 size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo2 size={16} />
        </ToolbarButton>
      </div>
      {uploadError && (
        <p className="text-xs text-red-600 px-1">{uploadError}</p>
      )}
    </div>
  );
}

export default function RichTextEditor({ content, onChange, placeholder }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-[#00A6CE] underline' } }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full h-auto rounded-lg my-2' },
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none p-4 min-h-[300px] focus:outline-none text-sm',
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  const onAttachClick = useCallback(() => {
    setUploadError('');
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editor) return;

    const allowed =
      IMAGE_TYPES.has(file.type) ||
      file.type === 'application/pdf' ||
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (!allowed) {
      setUploadError('Use an image (JPEG, PNG, GIF, WebP) or PDF / Word document.');
      return;
    }
    if (file.size > MAX_INLINE_FILE) {
      setUploadError('File is too large (max 20MB).');
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const safeName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const filePath = `uploads/news-inline/${safeName}`;

      const { error: storageErr } = await supabase.storage.from('documents').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (storageErr) throw storageErr;

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);

      if (IMAGE_TYPES.has(file.type)) {
        editor.chain().focus().setImage({ src: publicUrl, alt: file.name }).run();
      } else {
        const label = escapeHtml(file.name);
        editor
          .chain()
          .focus()
          .insertContent(
            `<p><a href="${escapeHtml(publicUrl)}" target="_blank" rel="noopener noreferrer">${label}</a></p>`,
          )
          .run();
      }
    } catch (err) {
      console.error('Inline upload failed:', err);
      setUploadError(err.message || 'Upload failed. Check storage permissions and try again.');
    } finally {
      setUploading(false);
    }
  }, [editor]);

  return (
    <div className="relative border border-gray-300 rounded-lg overflow-hidden">
      <Toolbar
        editor={editor}
        onAttachClick={onAttachClick}
        uploading={uploading}
        uploadError={uploadError}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
      <EditorContent editor={editor} />
      {!content && placeholder && !editor?.getText() && (
        <p className="absolute top-[60px] left-4 text-gray-400 text-sm pointer-events-none">{placeholder}</p>
      )}
    </div>
  );
}
