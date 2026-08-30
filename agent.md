# AGENTS.md

## Project

You are the primary AI coding agent for **CollegeAI — RAG-Based College Chatbot**.

This project is a full-stack Retrieval-Augmented Generation (RAG) application designed to answer college-related questions using information retrieved from an approved college knowledge base.

The project's `README.md` is the primary product and implementation specification.

---

# 1. Source of Truth

Follow this priority order:

1. `README.md`
2. `AGENTS.md`
3. Current phase instructions provided by the user
4. Existing project code and established architecture
5. Only then use reasonable implementation decisions when the specification does not define something

Do not silently change the project's core requirements.

Do not replace the RAG architecture with a simple LLM chatbot.

---

# 2. Core Product Requirement

The application must implement a genuine RAG pipeline:

College Documents
→ Text Extraction
→ Text Cleaning
→ Chunking
→ Embeddings
→ Vector Database
→ User Question
→ Question Embedding
→ Similarity Search
→ Relevant Context
→ LLM
→ Grounded Answer
→ Source References

The chatbot must answer using retrieved college knowledge whenever relevant information is available.

The system must not fabricate college information.

When sufficient relevant context cannot be found, return a clear "information not available in the knowledge base" response rather than inventing an answer.

---

# 3. Development Strategy

Build the project **phase by phase**.

Never attempt to implement the entire project in one step unless the user explicitly instructs you to do so.

Implement only the currently requested phase.

Do not implement future phases early.

After every phase:

1. Run relevant tests.
2. Run the frontend build when applicable.
3. Run the backend checks when applicable.
4. Fix errors caused by the current phase.
5. Verify that previously working functionality still works.
6. List files created.
7. List files modified.
8. Summarize completed functionality.
9. Report known issues or incomplete work.

---

# 4. Phase Boundaries

Follow the project's phase order.

## Phase 1 — Foundation

Implement only:

* Project structure
* Frontend setup
* Backend setup
* Database connection
* Environment configuration
* Authentication
* Registration
* Login
* Logout
* Protected routes
* Basic responsive application shell

Do not implement RAG, document ingestion, vector search, or AI chat during this phase.

---

## Phase 2 — Document Management

Implement only:

* Admin authentication/authorization
* Admin dashboard
* Document upload
* Document listing
* Document metadata
* Document deletion
* Processing status
* Reprocessing controls

Do not build the complete RAG retrieval layer unless explicitly included in the phase request.

---

## Phase 3 — RAG Ingestion

Implement:

* File validation
* Text extraction
* Text cleaning
* Chunking
* Chunk metadata
* Embedding generation
* Vector storage
* Processing status updates
* Processing failure handling

Verify that uploaded documents can actually be indexed.

---

## Phase 4 — Retrieval and Chat

Implement:

* Chat interface
* Question processing
* Question embeddings
* Semantic retrieval
* Relevance threshold
* Context construction
* LLM generation
* Source references
* Unknown-question handling

The final answer must be grounded in retrieved context.

---

## Phase 5 — Conversations

Implement:

* Conversation creation
* Conversation history
* Message persistence
* Conversation sidebar
* New conversation
* Delete conversation
* Follow-up question context

Do not unnecessarily rewrite the existing RAG pipeline.

---

## Phase 6 — Advanced Features

Implement only the selected advanced features approved by the user.

Possible features include:

* Hybrid search
* Re-ranking
* Relevance/confidence scores
* Suggested questions
* Streaming responses
* Feedback
* Document summaries
* Multilingual responses
* FAQ generation
* OCR

Do not add large features without checking the existing architecture.

---

## Phase 7 — Production

Implement:

* Security hardening
* Input validation
* File validation
* Rate limiting
* Error handling
* Loading states
* Empty states
* Responsive design
* Performance improvements
* Testing
* Production build
* Deployment configuration
* README finalization

---

# 5. Existing Code First

Before modifying the project:

1. Inspect the repository.
2. Inspect `README.md`.
3. Inspect the relevant source files.
4. Understand the current architecture.
5. Reuse existing components and services.
6. Modify only what is required for the current task.

Never assume that a file does not exist until the repository has been inspected.

---

# 6. Minimal Changes

Prefer incremental implementation.

Do not:

* Rewrite the whole application
* Replace working libraries without a strong reason
* Rebuild existing components unnecessarily
* Duplicate existing utilities
* Create duplicate services
* Create duplicate API clients
* Change unrelated files
* Remove working functionality without explicit instruction

When a small fix is sufficient, make a small fix.

---

# 7. Architecture Rules

Keep the application separated into clear layers.

## Frontend

The frontend is responsible for:

* Rendering UI
* Managing client state
* Calling backend APIs
* Showing loading/error/success states
* Displaying chat history
* Displaying retrieved sources

The frontend must not contain private server-side secrets.

The frontend must not call protected AI providers directly unless explicitly designed and secured for client use.

---

## Backend

The backend is responsible for:

* Authentication
* Authorization
* Business logic
* Database access
* Document processing
* RAG retrieval
* AI provider communication
* File validation
* Error handling
* Source construction

---

## Controllers

Controllers must remain thin.

Controllers should:

1. Receive requests.
2. Validate or pass validated input.
3. Call services.
4. Return responses.

Do not put complex business logic directly into controllers.

---

## Services

Business logic belongs in services.

Examples:

* `authService`
* `documentService`
* `chatService`
* `ragService`
* `embeddingService`
* `aiService`
* `conversationService`

Services may coordinate multiple lower-level modules.

---

# 8. RAG Architecture Rules

Keep the RAG pipeline modular.

Recommended responsibilities:

```text
Document Loader
        ↓
Text Extractor
        ↓
Text Cleaner
        ↓
Chunker
        ↓
Embedding Service
        ↓
Vector Store
        ↓
Retriever
        ↓
Optional Re-ranker
        ↓
Context Builder
        ↓
AI Service
        ↓
Answer + Sources
```

Do not combine all RAG logic into one huge file.

Each component should have one clear responsibility.

---

# 9. Document Processing Rules

Uploaded documents must be treated as untrusted input.

Validate:

* File type
* MIME type
* File extension
* File size
* File content where practical

Never execute uploaded content.

Protect against:

* Path traversal
* Unsafe filenames
* Unsupported formats
* Corrupted documents
* Excessive file sizes

Processing failures must be recorded and surfaced clearly to administrators.

---

# 10. Chunk Metadata

Whenever possible, preserve metadata for every chunk.

Recommended metadata:

```text
documentId
documentName
pageNumber
chunkIndex
text
```

Do not discard page/document information because source attribution depends on it.

---

# 11. Retrieval Rules

The retriever should:

1. Embed the user question.
2. Query the vector database.
3. Retrieve the most relevant chunks.
4. Apply an appropriate relevance threshold.
5. Return only useful context.
6. Preserve source metadata.

Do not send the entire document collection to the LLM.

Do not treat every retrieved chunk as equally relevant.

---

# 12. Grounded Answer Rules

The LLM must receive explicit instructions to answer from retrieved context.

The system should prioritize factual grounding over conversational speculation.

The assistant must not invent:

* College fees
* Admission dates
* Eligibility rules
* Examination dates
* Policies
* Department details
* Hostel rules
* Placement statistics
* Faculty details
* Event schedules

When context is insufficient, state that the knowledge base does not contain enough reliable information.

---

# 13. Source Attribution Rules

Answers generated through RAG should expose relevant source information.

A source should contain, where available:

```text
document name
page number
relevant snippet
relevance information
```

Do not display fake sources.

Do not claim that a source was used when it was not actually retrieved.

---

# 14. AI Provider Rules

Keep AI-provider logic centralized.

Possible providers:

* Google Gemini
* OpenRouter

Provider credentials must come from environment variables.

Never hardcode API keys.

The frontend must never receive private provider credentials.

If multiple providers are supported, keep provider selection configurable.

---

# 15. Database Rules

Use the database abstraction already selected by the project.

Do not introduce a second database without explicit instruction.

Keep database logic out of frontend components.

Use appropriate validation and relationships.

Recommended logical entities include:

```text
Users
Documents
Document Chunks
Conversations
Messages
Feedback
```

Use the schema defined in `README.md` unless the user explicitly changes it.

---

# 16. Authentication and Authorization

Authentication must protect private user functionality.

Required behavior:

* Registration
* Login
* Logout
* Protected routes
* Authenticated session handling

Admin-only functionality must require an admin role.

Students must not be able to perform administrator document-management actions.

Never trust role information supplied directly by the client.

Authorization must be enforced on the backend.

---

# 17. API Rules

Keep frontend and backend API contracts synchronized.

Before changing an endpoint:

1. Find all frontend consumers.
2. Find backend implementation.
3. Update both sides consistently.
4. Test the affected flow.

Use meaningful HTTP status codes.

Return consistent error structures.

Do not silently change response shapes.

---

# 18. Error Handling

Never hide important errors.

Backend errors should use a consistent structure such as:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

Handle expected failures explicitly.

Examples:

```text
AUTH_REQUIRED
FORBIDDEN
VALIDATION_ERROR
DOCUMENT_NOT_FOUND
DOCUMENT_PROCESSING_ERROR
UNSUPPORTED_FILE_TYPE
FILE_TOO_LARGE
VECTOR_SEARCH_ERROR
AI_SERVICE_ERROR
NO_RELEVANT_CONTEXT
```

Frontend error messages should be understandable to normal users.

Do not expose stack traces, tokens, credentials, or internal secrets to users.

---

# 19. Security Rules

Never place secrets in source code.

Never commit:

```text
.env
real API keys
database passwords
JWT secrets
service-role credentials
private credentials
access tokens
```

Use:

```text
.env
.env.local
```

locally and hosting-platform environment variables in production.

Keep an `.env.example` containing variable names without real secrets.

Never log decrypted credentials.

Never return private tokens in API responses.

---

# 20. Environment Configuration

Centralize environment configuration.

Validate required environment variables when the application starts.

Clearly distinguish:

```text
development
test
production
```

Do not silently use production credentials in development.

Do not expose server-only environment variables through client-side configuration.

---

# 21. UI Rules

The interface should be:

* Modern
* Clean
* Responsive
* Accessible
* Consistent

Every major asynchronous operation should have appropriate states:

```text
Loading
Success
Error
Empty
Processing
No Results
No Relevant Information
```

Do not leave users with blank screens during API calls.

Disable buttons where necessary while an operation is running to prevent accidental duplicate requests.

---

# 22. Chat UX Rules

The chat interface should clearly distinguish:

```text
User message
Assistant message
Sources
Loading/streaming state
Errors
```

Conversation history should be easy to navigate.

The user should be able to create a new conversation.

The user should be able to continue an existing conversation.

Do not lose messages because of unnecessary client-side state resets.

---

# 23. Performance Rules

Prefer efficient operations.

Avoid:

* Unnecessary API calls
* Duplicate database queries
* Repeated embedding generation
* Reprocessing unchanged documents
* Sending excessive context to the LLM
* Large unnecessary frontend state updates

Use pagination where collections can become large.

Do not optimize prematurely at the cost of correctness.

Correctness comes first.

---

# 24. Dependency Rules

Use the dependency stack defined by `README.md`.

Before adding a new package:

1. Check whether an existing dependency already solves the problem.
2. Avoid unnecessary dependencies.
3. Prefer stable and well-supported libraries.
4. Add only what is needed.
5. Ensure the package works with the current framework versions.

Do not change the project's main framework merely because another technology is more familiar.

---

# 25. Testing Rules

At the end of each phase, test the functionality introduced by that phase.

At minimum verify:

* Happy path
* Invalid input
* Authentication failure
* Authorization failure
* Missing resources
* External API failure where relevant
* Empty states
* Loading behavior
* Error handling

For RAG specifically, test:

```text
Relevant question
Irrelevant question
No relevant context
Multiple relevant documents
Source attribution
Follow-up questions
Malformed/empty input
AI provider failure
Vector search failure
```

---

# 26. Build Verification

After significant implementation work:

Frontend:

```text
npm run build
```

Backend:

Run the project's available validation/test/start checks.

Do not claim the project is complete if the production build fails.

Fix errors introduced by the current work before proceeding.

---

# 27. Debugging Rules

When an error occurs:

1. Identify the exact failure.
2. Inspect the relevant files.
3. Trace the data flow.
4. Fix the root cause.
5. Run the smallest relevant test.
6. Verify that existing functionality still works.

Do not respond to one bug by rewriting the entire application.

Do not modify unrelated systems during debugging.

---

# 28. Token-Efficiency Rules

This project is being built with an AI coding agent, so minimize unnecessary context and repeated work.

Follow these rules:

* Read only the specifications relevant to the current task.
* Inspect only relevant source files when debugging.
* Reuse existing code.
* Do not regenerate entire files without need.
* Do not repeatedly restate the entire architecture.
* Do not reimplement completed phases.
* Do not scan unrelated directories unless necessary.
* Do not make speculative changes.
* Prefer focused patches.
* Keep implementation aligned with the current phase.

The user should be able to continue from one phase without forcing the agent to reconstruct the entire project mentally.

---

# 29. Change Safety

Before making a major change:

* Identify what depends on the affected code.
* Preserve existing public interfaces where practical.
* Avoid breaking completed functionality.

When a breaking change is genuinely necessary:

1. Update dependent code.
2. Update documentation.
3. Test the affected flows.
4. Clearly report the change.

---

# 30. Git Checkpoints

The project should be committed after every successfully verified phase.

Suggested commits:

```text
Phase 1 complete
Phase 2 complete
Phase 3 complete
Phase 4 complete
Phase 5 complete
Phase 6 complete
Phase 7 complete
```

Do not create commits containing secrets.

---

# 31. Completion Report

At the end of every phase, provide:

```text
PHASE STATUS

Status:
COMPLETE / PARTIAL / BLOCKED

Implemented:
- ...

Files Created:
- ...

Files Modified:
- ...

Tests Run:
- ...

Build:
PASS / FAIL

Known Issues:
- ...

Next Phase:
- ...
```

Do not claim a feature works unless it has been implemented and verified.

---

# 32. No Fake Functionality

Do not create fake implementations merely to satisfy the UI.

Examples of unacceptable shortcuts:

* Fake AI responses
* Mock RAG results presented as real retrieval
* Hardcoded source references
* Fake document processing status
* Hardcoded chatbot answers
* Pretend vector search
* Static inbox/document data where real functionality is required

During development, mocks may be used only when explicitly requested and must be clearly separated from production functionality.

---

# 33. No Silent Scope Changes

Do not:

* Remove required features
* Replace required technologies
* Change the RAG architecture
* Remove authentication
* Remove source attribution
* Remove document management
* Remove unknown-question handling

without explicit user instruction.

When the specification is ambiguous, choose the smallest implementation consistent with the stated requirements.

---

# 34. Final Quality Standard

Before considering the project complete, verify that the application demonstrates all major layers:

```text
Frontend
+
Authentication
+
Backend API
+
Database
+
Document Processing
+
Embeddings
+
Vector Database
+
Retrieval
+
LLM
+
Grounded Answers
+
Source References
+
Chat History
+
Admin Document Management
+
Security
+
Testing
+
Deployment
```

The project must be a real working RAG application, not a static demonstration.

---

# 35. First Instruction

When this project is first opened, do not immediately write large amounts of application code.

First:

1. Inspect the repository.
2. Read `README.md`.
3. Read this `AGENTS.md`.
4. Determine whether the project is empty or partially implemented.
5. Identify the current development phase.
6. Report the current state briefly.
7. Implement only the phase/task explicitly requested by the user.

Do not start future phases automatically.
