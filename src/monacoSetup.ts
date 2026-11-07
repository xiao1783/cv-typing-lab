import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution.js'

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker()
  }
}

export default monaco
