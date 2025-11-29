<!-- Copilot instructions for AI coding agents working on Baileys -->

**Purpose**: quick, actionable guidance so an AI code assistant can be immediately productive in this repository.

- **Big picture**: Baileys is a TypeScript WebSocket client library that implements the WhatsApp Web protocol. The public API surface is exported from `src/index.ts` (the `makeWASocket` factory is the main entry point). The runtime artifacts are built to `lib/` via `tsc` and an ESM post-process (`tsc-esm-fix`).

- **Major components**:
  - **Socket**: `src/Socket/*` — core WebSocket handling and message send/recv logic.
  - **Signal**: `src/Signal/*` — signal protocol helpers and key management.
  - **Utils & Types**: `src/Utils/*`, `src/Types/*` — helpers and shared types used across the project.
  - **Proto / WAProto**: `WAProto/` — generated protobuf definitions and generator scripts (`WAProto/GenerateStatics.sh`, `gen:protobuf` script).

- **Common runtime flows & why they matter**:
  - Connection lifecycle and events use a typed EventEmitter exposed on the socket (`sock.ev`). Event batches are processed using `sock.ev.process(...)` — handlers should accept the full events map and iterate specific keys instead of subscribing many small listeners (see `Example/example.ts`).
  - Authentication uses `useMultiFileAuthState` utilities and a signal key store. Maintain correct serialization when storing creds — `BufferJSON` utilities are referenced in the README; updating `authState.keys` must be persisted or messages will fail.
  - For group-related flows, project recommends `cachedGroupMetadata` in socket config to avoid repeated metadata fetches (see README examples).

- **Project-specific conventions & patterns**:
  - Prefer batched event processing via `sock.ev.process(events => { ... })` and check keys like `'messages.upsert'`, `'messages.update'`, `'connection.update'`.
  - When handling `messages.upsert`, iterate with `for (const m of upsert.messages)` and treat `upsert.type` (e.g., `'notify'`) explicitly (see `Example/example.ts`).
  - `getMessage` is a pluggable store hook: tests and examples implement it externally and the socket expects `getMessage(key)` to return previously-upserted messages when needed (poll decryption, retries).
  - Use `makeCacheableSignalKeyStore(state.keys, logger)` when wiring `auth.keys` for improved performance (example demonstrates this).

- **Build / test / run commands** (use Yarn as package manager per `package.json`):
  - Install: `yarn`
  - Build: `yarn build` (compiles to `lib/`), full docs build: `yarn build:all`
  - Run example: `yarn example` (invokes `Example/example.ts` via `tsx`)
  - Generate protobufs: `yarn gen:protobuf` (runs `WAProto/GenerateStatics.sh`)
  - Lint/format: `yarn lint`, `yarn format`
  - Tests: `yarn test` (uses Jest with `--experimental-vm-modules`), e2e: `yarn test:e2e`
  - Note: `package.json` enforces `node >= 20.0.0` and runs `node ./engine-requirements.js` before install.

- **Tests & CI gotchas**:
  - Jest runs with `--experimental-vm-modules`; test files use `.test.ts` and `.test-e2e.ts` globs. If adding tests, follow existing structure under `src/__tests__` and `src/__tests__/e2e`.
  - E2E tests may require network or environment preconditions (real socket connections). Prefer unit tests or mock sockets where possible.

- **Integration / external deps**:
  - Native-like behavior relies on `libsignal` (git dependency) and `ws` for WebSocket. Peer deps such as `sharp`/`jimp` are optional for media handling.
  - The code fetches the latest WA Web version via `fetchLatestBaileysVersion()` — changing that flow affects backward compatibility and must be tested.

- **Files to inspect first when triaging issues**:
  - `src/Socket/index.ts` and `src/Socket/socket.ts` — connection and messaging logic
  - `src/index.ts` — public exports and factory entry
  - `Example/example.ts` — canonical runtime patterns and best-practice usage
  - `WAProto/` and `WAProto/GenerateStatics.sh` — proto generation flow
  - `package.json` — scripts, engine, and build steps

- **When making code changes**:
  - Keep API compatibility in mind — many consumers rely on exported types and `makeWASocket` behavior.
  - Update `lib/` by running `yarn build`; tests and prepack expect built artifacts.
  - If modifying protobufs, run `yarn gen:protobuf` and commit updated `WAProto` outputs.

- **Example quick tasks** (copyable):
  - Run example locally: `yarn && yarn example`
  - Run unit tests: `yarn test`
  - Re-generate protos: `yarn gen:protobuf`

If anything here is unclear or you want me to expand a section (for example, add quick code snippets for common refactors or point to more files), tell me which area and I'll iterate.
