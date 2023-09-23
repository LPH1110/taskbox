import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { useState } from 'react';

const RichTextEditor = ({ initial, onSave, onClose }) => {
    const [value, setValue] = useState(initial);
    return (
        <div className="space-y-2">
            <CKEditor
                editor={ClassicEditor}
                data={value}
                onChange={(event, editor) => {
                    const data = editor.getData();
                    setValue(data);
                }}
                config={{ placeholder: 'Try to type something interesting...' }}
                onError={(error, { willEditorRestart }) => {
                    // If the editor is restarted, the toolbar element will be created once again.
                    // The `onReady` callback will be called again and the new toolbar will be added.
                    // This is why you need to remove the older toolbar.
                    if (willEditorRestart) {
                        this.editor.ui.view.toolbar.element.remove();
                    }
                }}
            />
            <div className="flexStart gap-1">
                <button
                    onClick={() => onSave(value)}
                    type="button"
                    className="py-1 px-3 rounded-sm bg-blue-400 text-white hover:bg-blue-400/80 ease duration-200"
                >
                    Save
                </button>
                <button
                    onClick={onClose}
                    type="button"
                    className="py-1 px-3 rounded-sm hover:bg-slate-100 ease duration-200"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default RichTextEditor;
