# Studentize AI Chatbot - Tools and Prompts Documentation

## Overview

This document provides a comprehensive overview of the AI tools, prompts, and system architecture used in the Studentize chatbot platform. The system is designed as **Studentize's Advisor Assistant** - a professional tool that generates clear, actionable next-step agendas for students based primarily on their latest session transcripts while maintaining selective "core memory" of essential long-term information.

## Core Objectives

The **Guru AI** system aims to:

- **Latest Transcript Priority**: All "next steps" and agendas are grounded in the most recent transcript
- **Core Memory**: Selectively retain long-term essentials (target universities, academic interests, major deadlines, confirmed priorities)
- **Structured Output**: Always follow the mandatory 3-part format for advisor-ready agendas
- **Transcript Reference**: Clearly state which transcript/session is being referenced
- **Professional Guidance**: Behave like an experienced Studentize advisor with proactive insights

## System Architecture

### Core AI Components

#### 1. Main Chat Engine

- **File**: `packages/api/src/routes/chat/student.ts`
- **Model**: OpenAI GPT-5 with reasoning effort "low"
- **Framework**: Vercel AI SDK with tool calling capabilities
- **Streaming**: Real-time response streaming via ORPC

#### 2. AI Services Package

- **Location**: `packages/ai/src/`
- **Models Used**:
  - Primary chat: GPT-5
  - Summarization: GPT-4.1-mini
- **Configuration**: OpenAI API key via environment variables

## AI Tools Available to the Chatbot

### 1. Search Session Transcriptions Tool

**Function**: `createSearchSessionTranscriptions`
**Purpose**: Primary tool for finding the latest transcript and semantic search across sessions

```typescript
{
  description: "Search through all of the student's session transcriptions to find relevant information based on a query. This tool performs semantic search across all recorded sessions and returns comprehensive information from actual conversations with the student.",
  inputSchema: {
    query: "A specific question or topic to search for in the student's session transcriptions. Be specific about what information you're looking for (e.g., 'college application progress', 'discussion about career goals', 'feedback on essays')."
  }
}
```

**Backend**: Uses Cloudflare AutoRAG for vector search with folder-based filtering by student ID
**Key Role**: Primary source for identifying the LATEST transcript for agenda planning

### 2. Session Progress Tool

**Function**: `createSessionProgressTool` (renamed from `createSessionOverviewTool`)
**Purpose**: Selective access to core memory elements only

```typescript
{
  description: "Get a comprehensive overview of the student's entire session history and academic progress. This provides a high-level summary of all sessions, key themes, progress made, and overall development over time.",
  inputSchema: {} // No parameters required
}
```

**Usage**: Should be used selectively for core memory elements, not comprehensive briefing

### 3. Session Summary Tool

**Function**: `createSessionSummaryTool`
**Purpose**: Get detailed context about the latest session when needed

```typescript
{
  description: "Get a detailed summary of a specific session by its ID. Use this when you need more context about a particular session that was identified in search results or when an advisor asks about a specific session.",
  inputSchema: {
    sessionId: "The specific session ID to get a summary for. This is typically obtained from searchSessionTranscriptions results or when an advisor references a particular session."
  }
}
```

### 4. Student Information Tool

**Function**: `createStudentInfoTool`
**Purpose**: Access core memory profile data for context

```typescript
{
  description: "Get comprehensive information about the student including their academic background, areas of interest, extracurricular activities, study curriculum, target countries, and other profile details. Use this to provide detailed context about the student's academic profile, interests, and background when advisors ask profile-related questions.",
  inputSchema: {} // No parameters required
}
```

**Returns**: Core memory elements like declared interests, target countries, curriculum, graduation year

### 5. Web Search Preview Tool

**Function**: `web_search_preview`
**Purpose**: Real-time search for current information to enhance agendas

**Usage**:

- Up-to-date deadlines and admission requirements
- Current scholarship opportunities and policy changes
- Competition deadlines and opportunities
- University program updates

## System Prompts

### Main Guru AI Assistant Prompt

The current system prompt transforms the assistant into a professional advisor tool focused on generating structured next-step agendas:

```text
You are Studentize's Advisor Assistant. Your job is to generate clear, professional next-step agendas for students, primarily based on the latest available transcript.

**Student Name:** ${user?.name || "Unknown"}

**Core Rules:**

**1. Transcript Priority**
- Always identify and use the latest transcript/session when planning next steps
- Begin your response by stating: "Based on [Student Name]'s latest session: [Session Title + Date]..."
- If multiple transcripts exist, only pull forward prior session details that belong in core memory

**2. Core Memory (Selective Recall)**
Retain only essential long-term facts for continuity, such as:
- Declared subject/field of interest
- Target universities or countries
- Confirmed application pathways (e.g., ED vs UCAS priority)
- Key deadlines (Oxford Oct 15, Common App Jan 1, etc.)
- Do NOT carry forward every detail from prior sessions

**3. Structured Output (Mandatory)**
Always output in three sections:
1. **Next Session Focus** → one-liner agenda items
2. **Student Follow-Ups** → progress checks/questions for student
3. **Advisor Preparation & Observations** → advisor deliverables + overlooked/missing areas

**4. Professional Tone**
- Write as if you are an experienced Studentize advisor: precise, professional, and actionable
- Avoid filler, emojis, or robotic phrasing

**5. Proactive Guidance**
- Highlight if the advisor appears to have overlooked something important (e.g., academic references, deadlines, competitions)
- Pull in reliable external data (deadlines, competitions, scholarships) where relevant
```

### Expected Output Format

The AI must always follow this structured format:

```text
Based on [Student Name]'s latest session: [Session Title + Date]...

**Next Session Focus**
• [Action item 1]
• [Action item 2]
• [Action item 3]

**Student Follow-Ups**
• [Progress check 1]
• [Question for student 1]
• [Task verification 1]

**Advisor Preparation & Observations**
• [Advisor deliverable 1]
• [Overlooked area 1]
• [External deadline/opportunity 1]
```

### Transcript Summarization Prompt

```text
You are a helpful assistant that summarizes transcripts of meetings between students and their academic advisors. Your task is to extract key information and present it in a concise, well-structured format using bullet points or short paragraphs. Focus on main discussion topics, decisions made, action items, and important insights. Keep the summary brief while capturing essential details.
```

### Session Overview Update Prompt

```text
You are a helpful assistant that updates a student's session overview based on a new transcript summary. Your task is to integrate the new information from the transcript summary into the existing session overview. Keep the output concise and well-structured using bullet points or short paragraphs. Focus on key topics discussed, action items, and important insights. Maintain clarity while being brief.
```

## Data Flow and Processing

### 1. Session Processing Workflow

1. **Session Creation**: New sessions are created when advisors and students meet
2. **Transcription Upload**: Audio transcriptions are uploaded to S3 storage
3. **Automatic Summarization**:
   - Triggered via Cloudflare Worker workflow
   - Uses GPT-4.1-mini to create session summaries
4. **Overview Update**: Student's overall session overview is updated with new information
5. **RAG Sync**: Vector database is synced with new transcription data

### 2. Guru AI Processing Flow

1. **Latest Session Identification**: AI searches for most recent transcript using `searchSessionTranscriptions`
2. **Core Memory Extraction**: Selectively pulls long-term essentials from `sessionProgress` and `studentInfo`
3. **Current Information Gathering**: Uses `web_search_preview` for up-to-date deadlines and opportunities
4. **Structured Agenda Generation**: Creates 3-part output format based on latest session content
5. **Proactive Guidance**: Identifies overlooked areas and suggests next steps

### 3. RAG (Retrieval Augmented Generation) System

- **Provider**: Cloudflare AutoRAG
- **Storage**: Student transcriptions organized by folder (student ID)
- **Search**: Semantic search with score thresholds and filtering
- **Sync**: Automatic synchronization after new session processing

## Configuration and Environment

### Required Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key
R2_ACCOUNT_ID=cloudflare_r2_account_id
AUTORAG_NAME=your_autorag_instance_name
AUTORAG_API_TOKEN=cloudflare_autorag_api_token
```

### Model Configuration

- **Primary Chat Model**: `gpt-5`
- **Reasoning Effort**: `low` (for faster responses)
- **Summarization Model**: `gpt-4.1-mini`
- **Max Tool Steps**: 5 (configurable via `stepCountIs(5)`)
- **Streaming**: Enabled for real-time responses

## Key Changes from Previous Version

### Major Updates

1. **Role Transformation**: Changed from general "virtual assistant" to "Advisor Assistant"
2. **Output Structure**: Mandatory 3-part format (Next Session Focus, Student Follow-Ups, Advisor Preparation)
3. **Latest Transcript Priority**: Always start with most recent session
4. **Core Memory Approach**: Selective retention instead of comprehensive briefing
5. **Professional Tone**: Removed conversational style, added structured advisor language
6. **Model Upgrade**: Upgraded from GPT-4.1 to GPT-5 with reasoning capabilities
7. **Tool Renaming**: `createSessionOverviewTool` → `createSessionProgressTool`

### Response Style Changes

**Before (Conversational):**

- Natural, flowing language
- Bullet points with speakable content
- Advisor briefing style

**After (Structured Agenda):**

- Professional, actionable language
- Mandatory 3-part structure
- Clear session reference with date
- Proactive guidance and overlooked areas

## Recommendations for Further Improvements

### 1. Enhanced Tool Descriptions

- Add more specific examples of "latest session" identification
- Clarify core memory vs. current session boundaries
- Include more guidance on proactive opportunity identification

### 2. Structured Output Validation

- Implement format checking to ensure 3-part structure compliance
- Add session date/title validation requirements
- Consider template enforcement for consistency

### 3. Core Memory Optimization

- Define clearer criteria for what belongs in "core memory"
- Add timestamp-based prioritization for core facts
- Implement automatic core memory decay for outdated information

### 4. Proactive Guidance Enhancement

- Expand database of common overlooked areas by student profile
- Add deadline tracking integration
- Include competition and scholarship opportunity matching

### 5. Quality Assurance

- Monitor adherence to structured output format
- Track session identification accuracy
- Measure advisor satisfaction with agenda relevance and actionability

## Technical Architecture Notes

- **Framework**: Built on Vercel AI SDK with ORPC for type-safe APIs
- **Deployment**: Cloudflare Workers for serverless execution
- **Storage**: S3-compatible storage for transcriptions
- **Vector Database**: Cloudflare AutoRAG for semantic search
- **Real-time**: Event streaming for live chat updates
- **Monitoring**: Tool usage tracking for analytics and improvements

This documentation reflects the current Guru AI implementation focused on professional, structured agenda generation for academic advisors.
