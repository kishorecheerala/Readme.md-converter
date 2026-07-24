/**
 * Generates Mermaid.js diagrams based on document structure or user prompt.
 */
export function generateMermaidDiagram(prompt: string, type: 'flowchart' | 'sequence' | 'er' = 'flowchart'): string {
  const cleanPrompt = prompt.trim();

  if (type === 'sequence') {
    return `\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User as Client Application
    participant API as API Gateway
    participant Engine as Processing Service
    participant DB as Main Database

    User->>API: 1. Send Request (${cleanPrompt.slice(0, 30) || 'Action'})
    API->>Engine: 2. Dispatch Task
    Engine->>DB: 3. Query & Mutate State
    DB-->>Engine: 4. Acknowledge Data
    Engine-->>API: 5. Return Result Payload
    API-->>User: 6. 200 OK Response
\`\`\``;
  }

  if (type === 'er') {
    return `\`\`\`mermaid
erDiagram
    DOCUMENT ||--o{ REVISION : contains
    DOCUMENT ||--|| THEME : uses
    USER ||--o{ DOCUMENT : creates
    DOCUMENT {
        string id
        string title
        datetime createdAt
    }
    REVISION {
        string id
        string content
        int versionNumber
    }
\`\`\``;
  }

  // Default Flowchart
  return `\`\`\`mermaid
flowchart TD
    Start([Input Markdown Document]) --> Parse[Unified / Remark Parser]
    Parse --> Validate{Validation Passed?}
    Validate -- Yes --> ApplyTheme[Apply Selected Theme CSS]
    Validate -- No --> ErrorHandler[Trigger Error Alert]
    ApplyTheme --> Render[Render Live Split Preview]
    Render --> Export PDF/DOCX/HTML
\`\`\``;
}
