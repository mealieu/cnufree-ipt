# AGENTS.md - CNU Free Collaboration Guidelines

## Project Context
- **Project Name**: CNU Free (Schedule-sharing app)
- **Repository URL**: `https://github.com/mealieu/cnufree-ipt.git`
- **Tech Stack**: React Native (0.88+) / Expo (SDK 58) with TypeScript
- **Design System & Typography**: DM Sans typography, sage-green / cream design system (`src/constants/colors.ts`)

---

## Strict Git Commit & Push Workflow

1. **No Automatic Commits or Pushes**:
   - Whenever files are added, modified, or deleted at the user's request, do NOT commit or push automatically.

2. **Review & Propose**:
   - After completing each requested change, inspect `git status` and `git diff`.
   - Provide a brief, beginner-friendly summary of the changes and the current Git state.
   - Propose a clean Conventional Commit message or team ticket format (e.g., `[TICKET-ID] ...`, `feat: ...`, `fix: ...`).

3. **Explicit Approval Required Before Committing or Pushing**:
   - Stage ONLY the relevant files (never use blanket staging like `git add .` unless explicitly requested).
   - Commit with the approved message.
   - Run `git fetch` first to check for remote/teammate changes.
   - If the remote has advanced, safely rebase or resolve updates before pushing.
   - Push the approved commit to the appropriate remote branch.

4. **Plain Language Explanations**:
   - Clearly explain meaningful Git states in plain language (e.g., uncommitted changes, commits ahead of remote, incoming changes from teammates, or merge conflicts).

5. **No Blanket Staging**:
   - Never use `git add .` unless the user explicitly requests it.

---

## Engineering & Architecture Standards (React Native / Expo)

1. **Architecture & Component Preservation**:
   - Preserve existing navigation, mocks, and fallback systems unless explicitly asked to refactor or remove them.

2. **Centralized Mock Data**:
   - Strictly use centralized mock data in `src/mock/` for frontend tickets.
   - Do NOT connect to live backends unless explicitly requested by ticket scope.

3. **User Feedback & State Handling**:
   - Clearly handle and surface error states, loading states, and success messages.

4. **Resource Management**:
   - Clean up transient resources—such as event listeners, timers, and subscriptions—when flows end or screens unmount/change.

5. **Type Safety & Verification**:
   - Before declaring any task complete, run `npx tsc --noEmit` and verify there are no TypeScript compiler errors.

---

## Expo & Development Guidelines

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

### Commands

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

### Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
