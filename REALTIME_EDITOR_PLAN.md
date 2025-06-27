# Real-time React Code Editor & Preview System

## Overview
Implement a real-time code editor with live preview system similar to Bolt.new, Lovable, and CodeSandbox. This will allow users to edit React components with instant visual feedback.

## Architecture Plan

### 1. Core Components Structure
```
src/components/code-editor/
├── CodeEditor.tsx          # Monaco editor wrapper
├── PreviewPane.tsx         # Live React component preview
├── EditorLayout.tsx        # Split view container
├── PreviewRenderer.tsx     # Sandboxed React renderer
└── CodeProcessor.tsx       # Code compilation & error handling
```

### 2. Technology Stack

#### Monaco Editor Integration
- **Package**: `@monaco-editor/react`
- **Features**: 
  - TypeScript/JSX syntax highlighting
  - IntelliSense and autocomplete
  - Error highlighting
  - Theme integration (dark/light)
  - Custom shortcuts

#### Live Preview System
- **Approach**: Sandboxed iframe with React rendering
- **Package**: Custom implementation using:
  - `@babel/standalone` for JSX compilation
  - `react-dom/client` for rendering
  - Error boundaries for safe execution

#### State Management
- **Real-time sync**: Editor content ↔ Preview
- **Debounced updates**: 300ms delay for performance
- **Error handling**: Compile-time and runtime errors

### 3. Implementation Phases

#### Phase 1: Basic Editor Setup
1. Install Monaco editor dependencies
2. Create basic code editor component
3. Implement TypeScript/JSX syntax highlighting
4. Add theme integration

#### Phase 2: Live Preview System
1. Create preview pane component
2. Implement Babel compilation in browser
3. Set up sandboxed React rendering
4. Add error boundary and error display

#### Phase 3: Layout & UX
1. Implement split-screen layout
2. Add resizable panels
3. Create toggle between editor/preview/both
4. Add toolbar with actions

#### Phase 4: Advanced Features
1. Code formatting (Prettier integration)
2. Import resolution for common libraries
3. Component props live editing
4. Hot reload support

## Detailed Implementation

### 1. Monaco Editor Setup

```bash
npm install @monaco-editor/react monaco-editor
```

**CodeEditor.tsx Structure:**
```typescript
interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language: 'typescript' | 'javascript';
  theme: 'vs-dark' | 'light';
}
```

**Features:**
- Auto-import suggestions
- JSX/TSX syntax support
- Error markers from TypeScript
- Custom key bindings
- Vim mode (optional)

### 2. Live Preview System

**PreviewRenderer.tsx:**
- Compile JSX to executable JavaScript using Babel
- Create isolated React root in iframe
- Handle component import/export patterns
- Provide common libraries (React, styled-components, etc.)

**Error Handling:**
- Compile-time errors (syntax, TypeScript)
- Runtime errors (component crashes)
- Import/dependency errors
- Performance warnings

### 3. Split Layout System

**EditorLayout.tsx:**
```typescript
interface LayoutProps {
  mode: 'editor' | 'preview' | 'split';
  onModeChange: (mode: LayoutMode) => void;
}
```

**Layout Modes:**
- **Editor Only**: Full-width Monaco editor
- **Preview Only**: Full-width preview pane  
- **Split View**: Resizable panels (like Bolt.new)

**Toggle Implementation:**
- Button toolbar at top
- Keyboard shortcuts (Ctrl+1, Ctrl+2, Ctrl+3)
- Responsive behavior (mobile = tabs)

### 4. Code Compilation Pipeline

**Real-time Process:**
1. User types in Monaco editor
2. Debounced onChange (300ms)
3. TypeScript validation
4. Babel JSX compilation
5. Update preview iframe
6. Handle and display errors

**Babel Configuration:**
```javascript
{
  presets: [
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-transform-modules-umd'
  ]
}
```

### 5. Component Integration

**With Existing System:**
- Replace `ReactComponentResults` preview with new editor
- Maintain props editor functionality
- Keep export/download features
- Integrate with AI generation workflow

**User Flow:**
1. AI generates React component
2. Opens in code editor with live preview
3. User can edit and see changes instantly
4. Export functionality remains available

## File Structure Changes

```
src/
├── components/
│   ├── code-editor/           # New: Real-time editor system
│   │   ├── CodeEditor.tsx
│   │   ├── PreviewPane.tsx
│   │   ├── EditorLayout.tsx
│   │   └── PreviewRenderer.tsx
│   ├── react-preview/         # Enhanced: Integration with editor
│   │   ├── ComponentPreview.tsx  # Updated to use new editor
│   │   └── PropsEditor.tsx       # Keep existing
│   └── generator/
│       └── ReactComponentResults.tsx  # Updated to use editor
└── lib/
    ├── codeCompiler.ts        # New: Babel compilation logic
    ├── previewRenderer.ts     # New: Sandboxed rendering
    └── editorThemes.ts        # New: Monaco theme configuration
```

## Performance Considerations

### Optimization Strategies
1. **Debounced Compilation**: 300ms delay prevents excessive re-compilation
2. **Web Workers**: Move Babel compilation to background thread
3. **Virtual Scrolling**: For large components in editor
4. **Code Splitting**: Lazy load editor components
5. **Memory Management**: Cleanup iframe resources on unmount

### Bundle Size Management
- Dynamic imports for Monaco editor
- Tree-shake unused Babel plugins
- CDN for heavy dependencies (React, etc.)

## Error Handling Strategy

### Compile-time Errors
- TypeScript diagnostics in editor
- Babel syntax error display
- Real-time error markers

### Runtime Errors
- Error boundaries in preview
- Console error capture
- Stack trace display
- Recovery suggestions

### User Experience
- Clear error messages
- Suggested fixes
- Non-blocking errors (preview still works)
- Error state persistence

## Integration Points

### With Current AI System
1. **AI Generated Code** → **Editor** → **Live Preview**
2. Maintain export functionality
3. Keep component variant generation
4. Preserve library management

### With UI Components
- Use existing Shadcn/ui components
- Maintain consistent theming
- Responsive design patterns

## Next Steps

1. **Install Dependencies**: Monaco editor and Babel packages
2. **Create Basic Editor**: Start with Phase 1 implementation
3. **Add Preview System**: Implement sandboxed rendering
4. **Build Layout**: Create split-screen interface
5. **Integrate with Current System**: Replace existing preview

This plan provides a comprehensive roadmap for implementing a real-time React code editor and preview system that will significantly enhance the user experience for component generation and editing.
