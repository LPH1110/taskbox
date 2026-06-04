import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from './button'
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  CheckSquare,
  Code
} from 'lucide-react'
import { useEffect } from 'react'
import './tiptap-editor.css'

interface TiptapEditorProps {
  content: string
  onUpdate: (html: string) => void
  editable: boolean
  placeholder?: string
}

export function TiptapEditor({ content, onUpdate, editable, placeholder = "Write something..." }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML())
    },
  })

  // Update editable state if it changes
  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable)
    }
  }, [editable, editor])

  // Sync content if it changes externally (only if not focused to prevent cursor jump)
  useEffect(() => {
    if (editor && content !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className={`tiptap-editor rounded-md transition-all duration-300 ${editable ? 'border bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-1' : 'bg-transparent'}`}>
      <div 
        className={`flex flex-wrap items-center gap-1 bg-muted/20 overflow-hidden transition-all duration-300 ease-in-out ${
          editable ? 'max-h-[50px] border-b p-1 opacity-100' : 'max-h-0 border-transparent p-0 opacity-0'
        }`}
      >
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${editor.isActive('bold') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${editor.isActive('italic') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${editor.isActive('underline') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${editor.isActive('strike') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${editor.isActive('bulletList') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${editor.isActive('orderedList') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${editor.isActive('taskList') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${editor.isActive('codeBlock') ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>
      
      <div className={`transition-all duration-300 ${editable ? 'p-3 min-h-[100px] rounded-b-md' : 'p-4 min-h-[80px]'}`}>
        <EditorContent editor={editor} className="prose prose-sm dark:prose-invert max-w-none focus:outline-none" />
      </div>
    </div>
  )
}
