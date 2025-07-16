import { createReactEditorJS } from 'react-editor-js';

const ReactEditorJS = createReactEditorJS();

function EditorComponent({ content }) {
    return (
        <ReactEditorJS
            defaultValue={content}
            tools={{

                header: Header,
                list: List,
                image: ImageTool
            }}
        />
    );
}