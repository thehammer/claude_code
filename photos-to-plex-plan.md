# Photos to Plex - Project Plan

**Created:** 2025-10-26
**Updated:** 2025-10-26
**Status:** Phase 1 Complete - Building Phase 2
**Type:** macOS Menu Bar Application + Swift Libraries

## Project Overview

A macOS menu bar application to facilitate copying videos and photos from the macOS Photos app to a Plex Media Server on the local network. The app will leverage Photos metadata (people, dates, locations, albums) to organize content and automatically create Plex playlists for home movies.

### Architecture

The project will be split into three components:
1. **Photos Integration Library** - Open source Swift library for Photos access ✅ **COMPLETE**
2. **Plex Integration Library** - Open source Swift library for Plex API ⏳ **NEXT**
3. **Photos-to-Plex App** - macOS menu bar app leveraging both libraries 📅 **PLANNED**

## Progress Update (2025-10-26)

### ✅ Phase 1: Photos Integration Library - COMPLETE

**Repository:** `~/Software Development/Open Source/Photos`
**Package Name:** PhotosKit
**Status:** Functional and tested

**Completed:**
- ✅ Swift package created with library + CLI targets
- ✅ Core PhotosKit library with database access
- ✅ Type-safe models (Asset, Person, Album, DetectedFace)
- ✅ DatabaseConnection with query methods
- ✅ `photos-query` CLI tool (working)
- ✅ `photos-matcher` CLI tool (stub)
- ✅ Comprehensive README and documentation
- ✅ Git repository initialized with initial commit
- ✅ Tested with real Photos library (888 videos, 2 people)

**Features Working:**
```bash
photos-query stats          # Shows 888 videos, 2 named people
photos-query videos         # Lists all videos with metadata
photos-query people         # Lists Zelda (1375 photos), Jason (633 photos)
photos-query albums         # Lists user albums
photos-query person Zelda   # Finds videos with specific person
```

**API Highlights:**
- Safe database access (working copy strategy)
- Full video metadata (duration, resolution, GPS, dates)
- People/face recognition data
- Album queries
- File path resolution

**Next Steps for Phase 1:**
- Implement `photos-matcher` CLI tool
- Add video fingerprinting for matching
- Extended metadata (EXIF, keywords)

### 📋 Phase 2: Plex Integration Library - NEXT

**Status:** Not started
**Location:** TBD (will create at `~/Software Development/Open Source/Plex`)

**Planned:**
- Evaluate/fork plexswift library
- Implement file-based import workflow
- Metadata management (tags, collections)
- Playlist creation and management
- CLI tools for Plex interaction

### 📋 Phase 3: Photos-to-Plex App - PLANNED

**Status:** Not started
**Depends on:** Phase 1 ✅ + Phase 2

**Planned:**
- macOS menu bar application
- Use PhotosKit + PlexKit libraries
- Manual and automated sync workflows
- Matching existing Plex videos to Photos metadata

## Technical Research Summary

### Plex API Capabilities ✅

**Status:** Well-supported with official APIs

- **Official Documentation:** [developer.plex.tv](https://developer.plex.tv/) (published Sept 2025)
- **Authentication:** X-Plex-Token based (user obtains once via web UI)
- **File Import Methods:**
  - Drop files in monitored directories (auto-detection)
  - API-based import with metadata
- **Playlist Support:**
  - Endpoint: `POST /playlists`
  - Types: video, photo, audio
  - Regular playlists (manual) and smart playlists (rule-based)
  - Per-user (privacy maintained)
- **Metadata Support:**
  - Can add/update tags, collections, labels
  - ⚠️ Photos: Plex doesn't read embedded photo tags well (uses own DB)
- **Swift Libraries:**
  - **plexswift** - Modern, async/await, OpenAPI-generated (recommended)
  - **PlexKit** - Audio-focused but supports all media types

### macOS Photos Access ✅ **VERIFIED**

**Status:** ✅ Successfully accessed and analyzed Photos database

**Database Analysis Completed (2025-10-26):**
- **Location:** `~/Pictures/Photos Library.photoslibrary/database/Photos.sqlite`
- **Size:** 659 MB
- **Total Assets:** 10,006 (photos and videos)
- **Named People:** 23 (face recognition)
- **User Albums:** 7
- **Full schema documentation:** See `~/.claude/photos-database-schema-analysis.md`

**Official APIs (Limited):**
- **Media Library Framework** (macOS): Read-only, basic metadata only
  - ✅ Location, creation date, favorites, dimensions
  - ❌ No people/faces, keywords/tags, rich metadata
- **PhotoKit**: iOS-focused, only works in Photos extensions on macOS

**Direct Database Access (Preferred Approach):**
- **Access Method:** Copy locked database to temp location for reading
- **Schema:** Documented and stable (macOS Sequoia)
- **Key Tables Verified:**
  - `ZASSET` - All photos/videos with metadata
    - File paths (ZDIRECTORY, ZFILENAME)
    - GPS coordinates (ZLATITUDE, ZLONGITUDE)
    - Dates (ZDATECREATED, ZMODIFICATIONDATE)
    - Video duration, dimensions, favorites, etc.
  - `ZPERSON` - Named people (ZDISPLAYNAME, ZFACECOUNT)
  - `ZDETECTEDFACE` - Face detections with rich attributes
    - Age, gender, facial hair, glasses, smile, gaze
    - Face position and quality scores
  - `ZGENERICALBUM` - User albums and system albums
    - Album titles, item counts, dates
  - `Z_32ASSETS` - Album-to-Asset junction table
  - `ZKEYWORD` - Keywords/tags
  - `ZMOMENT` - Automatic grouping by time/place

**File Path Resolution:**
```
~/Pictures/Photos Library.photoslibrary/originals/[ZDIRECTORY]/[ZFILENAME]
Example: .../originals/164468618/FS-4cc.../064A9981-5B0B-4C80-9D37-8317F4A79BB9.MP4
```

**Metadata Available:**
- ✅ People/faces with names
- ✅ Albums and nested folders
- ✅ GPS coordinates (lat/long)
- ✅ Creation and modification dates
- ✅ Favorites status
- ✅ Video duration
- ✅ File dimensions
- ✅ Keywords/tags
- ✅ Face attributes (age, gender, smile, etc.)
- ✅ Automatic moments/memories

### Open Questions

**Need to decide before implementation:**

1. **Photos Access Strategy:** ✅ **DECIDED**
   - ✅ **Decision:** Direct SQLite access (Option A)
   - **Rationale:** Database structure is well-documented and stable. Essential for people/faces metadata.
   - **Risk Mitigation:** Implement schema version detection, provide fallbacks for schema changes
   - **Requirement:** App needs Full Disk Access permission (documented in README)

2. **User Experience:**
   - Continuous monitoring + auto-sync vs. manual export?
   - How to handle duplicates/conflicts?

3. **Metadata Mapping (Photos → Plex):**
   - People → Plex collections/tags?
   - Albums → Plex playlists?
   - Dates/locations → Plex tags or smart playlist rules?

4. **File Organization in Plex:**
   - Directory structure: by year/month? by album? by event?
   - File naming convention?

5. **MVP Scope:**
   - Manual export workflow first?
   - Or full automated sync system?

---

## Phase 1: Photos Integration Library

**Repository Name:** `swift-photos-library` (TBD)
**License:** MIT or Apache 2.0
**Platform:** macOS 10.15+ (Catalina+)

### Goals

Create a robust, well-tested Swift library for accessing macOS Photos library metadata, including people/faces, albums, keywords, and EXIF data.

### Features

#### Core Features
- [ ] Photos library discovery and validation
- [ ] SQLite database access with locking/copy strategy
- [ ] Schema version detection (handle different macOS versions)
- [ ] Asset enumeration and filtering
- [ ] Metadata extraction:
  - [ ] People/faces with names
  - [ ] Albums and smart albums
  - [ ] Keywords/tags
  - [ ] Location data (GPS coordinates, place names)
  - [ ] Creation/modification dates
  - [ ] Media type (photo/video/live photo)
  - [ ] Favorites status
  - [ ] EXIF data (from files via ImageIO)
- [ ] File path resolution (locate actual media files in Masters/)
- [ ] Face detection metadata:
  - [ ] Face crops
  - [ ] Age/gender/hair estimates
  - [ ] Named vs. unnamed faces

#### Advanced Features
- [ ] Smart album query translation
- [ ] Moment/memory grouping
- [ ] Burst photo handling
- [ ] Live photo detection
- [ ] iCloud photo status (downloaded vs. cloud-only)
- [ ] Video metadata (duration, codec, frame rate)

#### API Design Considerations
- Swift Concurrency (async/await)
- Type-safe query builders
- Efficient pagination for large libraries
- Change detection (for incremental syncs)
- Thread-safe database access
- Comprehensive error handling
- Observable changes (Combine/AsyncSequence)

#### Testing Strategy
- Unit tests with sample database fixtures
- Integration tests with real Photos library (opt-in)
- Performance tests for large libraries (10k+ assets)
- Schema compatibility tests across macOS versions

#### Documentation
- API reference with DocC
- Migration guides for macOS version differences
- Example code for common use cases
- SQLite schema documentation

### Technical Challenges

1. **Database Schema Variations:**
   - Document schema differences between macOS versions
   - Build abstraction layer to handle variations
   - Reference osxphotos for schema mappings

2. **Database Locking:**
   - Copy-on-read strategy
   - Detect when copy is stale (need refresh)
   - Handle concurrent access safely

3. **iCloud Photos:**
   - Detect cloud-only assets
   - Optionally trigger downloads
   - Handle download progress/errors

4. **Performance:**
   - Lazy loading for large libraries
   - Efficient queries (proper indexes)
   - Caching strategy for frequently accessed data

### Dependencies

- Foundation
- SQLite (via system libsqlite3)
- ImageIO (for EXIF)
- Photos (for limited PhotoKit functionality)

### Milestones

1. **M1 - Basic Access:** Read-only asset enumeration with basic metadata
2. **M2 - People/Faces:** Extract people, faces, and face metadata
3. **M3 - Albums:** Album hierarchy and smart album support
4. **M4 - File Access:** Resolve file paths, copy files, EXIF extraction
5. **M5 - Polish:** Documentation, examples, comprehensive tests

---

## Phase 2: Plex Integration Library

**Repository Name:** `swift-plex-client` (TBD)
**License:** MIT or Apache 2.0
**Platform:** macOS 10.15+, iOS 13+ (for broader utility)

### Goals

Create a clean, modern Swift library for interacting with Plex Media Server, focused on photo/video management, metadata, and playlist creation.

### Features

#### Core Features
- [ ] Server discovery (local network)
- [ ] Authentication (X-Plex-Token management)
- [ ] Library management:
  - [ ] List libraries
  - [ ] Create photo/video libraries
  - [ ] Scan/refresh libraries
- [ ] Media upload/import:
  - [ ] File-based import (copy to monitored directories)
  - [ ] API-based upload (if available)
  - [ ] Batch operations
- [ ] Metadata management:
  - [ ] Add/update tags
  - [ ] Add/update collections
  - [ ] Add/update labels
  - [ ] Set titles, descriptions, dates
- [ ] Playlist operations:
  - [ ] Create playlists (video/photo/audio)
  - [ ] Add/remove items from playlists
  - [ ] Smart playlist creation (if API supports)
  - [ ] List user's playlists

#### Advanced Features
- [ ] Search within libraries
- [ ] Thumbnail/poster management
- [ ] Watch status tracking
- [ ] User management (multi-user scenarios)
- [ ] Transcode settings
- [ ] Library statistics

#### API Design Considerations
- Swift Concurrency (async/await)
- Strongly-typed models (Codable)
- Builder pattern for complex requests
- Progress reporting for uploads
- Comprehensive error handling with Plex error codes
- Retry logic with exponential backoff
- Observable upload progress (Combine/AsyncSequence)

#### Comparison with Existing Libraries

**Evaluate existing options:**
- **plexswift:** OpenAPI-generated, modern async/await
  - Assess coverage and code quality
  - Consider forking vs. building new
  - May be comprehensive enough to use directly
- **PlexKit:** Audio-focused but extensible
  - Evaluate photo/video support
  - Check maintenance status

**Decision criteria:**
- If plexswift covers our needs: contribute improvements upstream
- If gaps exist: extend plexswift or build focused library
- Document decision in library README

#### Testing Strategy
- Unit tests with mocked API responses
- Integration tests against real Plex server (Docker-based)
- Performance tests for batch operations
- Error handling tests (network failures, auth errors)

#### Documentation
- API reference with DocC
- Quick start guide
- Authentication setup guide
- Example code for common workflows
- Plex API endpoint mapping reference

### Technical Challenges

1. **API Discovery:**
   - Verify which APIs are officially documented
   - Test undocumented endpoints for needed features
   - Handle API version differences

2. **File Import Strategy:**
   - Determine best approach: file copy vs. API upload
   - Handle file naming conventions for Plex
   - Ensure proper directory structure for auto-detection

3. **Metadata Mapping:**
   - Map generic metadata to Plex schema
   - Handle Plex limitations (e.g., photo tags)
   - Test metadata persistence across library refreshes

4. **Smart Playlists:**
   - Understand smart playlist rule syntax
   - Build type-safe query builder
   - Test rule combinations

### Dependencies

- Foundation
- Possibly existing library (plexswift) as dependency or fork base

### Milestones

1. **M1 - Connection:** Server discovery, authentication, basic library queries
2. **M2 - Import:** File-based import, basic metadata
3. **M3 - Metadata:** Full metadata management (tags, collections, labels)
4. **M4 - Playlists:** Playlist creation and management
5. **M5 - Polish:** Documentation, examples, comprehensive tests

---

## Phase 3: Photos-to-Plex App

**App Name:** Photos to Plex (TBD - needs catchier name?)
**Platform:** macOS 10.15+
**UI:** Menu bar app (NSStatusItem)
**License:** MIT or Apache 2.0

### Goals

Create a polished macOS menu bar application that makes it easy to sync photos and videos from Photos app to Plex, with intelligent playlist creation based on metadata.

### Features

#### MVP (v1.0)
- [ ] Menu bar presence with icon
- [ ] Preferences/settings window:
  - [ ] Photos library selection (if multiple)
  - [ ] Plex server connection (IP/hostname)
  - [ ] Plex authentication (token input)
  - [ ] Target Plex library selection
  - [ ] Default naming convention
- [ ] Manual export workflow:
  - [ ] "Export Selected Photos" command (reads current Photos selection)
  - [ ] Preview what will be exported
  - [ ] Confirm and execute
- [ ] Basic metadata transfer:
  - [ ] Date/time
  - [ ] Location (if available)
  - [ ] Title/description
- [ ] File organization:
  - [ ] Year/Month directory structure
  - [ ] Configurable naming pattern
- [ ] Progress reporting:
  - [ ] Menu bar progress indicator
  - [ ] Notification on completion

#### v2.0 - Playlist Automation
- [ ] Automatic playlist creation:
  - [ ] By album name
  - [ ] By people (face recognition)
  - [ ] By date range (vacations, seasons)
  - [ ] By location (geo-tagged photos)
- [ ] Smart playlist rules:
  - [ ] "All videos with [Person Name]"
  - [ ] "Photos from [Vacation]"
  - [ ] "Summer 2024 memories"
- [ ] Playlist management:
  - [ ] Update existing playlists
  - [ ] Deduplicate items
  - [ ] Delete/archive old playlists

#### v3.0 - Continuous Sync
- [ ] Background monitoring:
  - [ ] Watch Photos library for changes
  - [ ] Auto-sync new content
  - [ ] Configurable sync schedule
- [ ] Advanced metadata:
  - [ ] Tags/keywords → Plex tags
  - [ ] People → Plex collections
  - [ ] Albums → Playlists (auto-update)
- [ ] Conflict resolution:
  - [ ] Detect duplicates
  - [ ] User preferences for handling conflicts
- [ ] Filter options:
  - [ ] Only sync favorites
  - [ ] Exclude certain albums
  - [ ] Date range filters
  - [ ] Media type filters (photos only, videos only)

#### Future Enhancements
- [ ] Two-way sync (Plex edits → Photos)
- [ ] Facial recognition improvements (train Plex on Photos faces)
- [ ] Moment/memory export
- [ ] Shared album support
- [ ] Multi-library support (different Plex libraries for different content)
- [ ] Export presets (family videos, vacation photos, etc.)

### UI/UX Design

#### Menu Bar Icon
- Simple, recognizable icon
- Shows status: idle, syncing, error
- Click reveals dropdown menu

#### Dropdown Menu
```
Photos to Plex
─────────────────
✓ Connected to Plex
📸 12,453 photos in library
─────────────────
Export Selected Photos...
Sync All New Photos
Manage Playlists...
─────────────────
Preferences...
About
Quit
```

#### Settings Window
- **Connection Tab:**
  - Photos library path (auto-detect + manual)
  - Plex server URL
  - Plex token (with "How to get token" help)
  - Test connection button

- **Organization Tab:**
  - Directory structure template
  - File naming template (with variables)
  - Duplicate handling strategy

- **Sync Tab:**
  - Auto-sync enabled/disabled
  - Sync schedule
  - Filters (favorites only, date range, albums)

- **Playlists Tab:**
  - Auto-create playlists (on/off)
  - Playlist naming templates
  - Smart playlist rules

#### Export Preview Window
- List of items to export
- Metadata preview
- Estimated Plex disk space
- Playlists that will be created/updated
- Confirm/Cancel buttons

### Technical Architecture

#### App Structure
```
Photos-to-Plex-App/
├── Sources/
│   ├── App/
│   │   ├── PhotosToPlexApp.swift (main app)
│   │   ├── AppDelegate.swift
│   │   └── MenuBarController.swift
│   ├── UI/
│   │   ├── Views/
│   │   │   ├── SettingsView.swift
│   │   │   ├── ExportPreviewView.swift
│   │   │   └── PlaylistManagerView.swift
│   │   └── ViewModels/
│   ├── Services/
│   │   ├── SyncService.swift
│   │   ├── PlaylistService.swift
│   │   └── ConfigurationService.swift
│   └── Models/
│       ├── ExportConfiguration.swift
│       ├── SyncState.swift
│       └── PlaylistRule.swift
├── Resources/
│   ├── Assets.xcassets
│   └── Info.plist
└── Tests/
```

#### Key Components

**MenuBarController:**
- Manages NSStatusItem
- Updates icon based on state
- Builds dropdown menu dynamically

**SyncService:**
- Coordinates between Photos and Plex libraries
- Handles file copying
- Manages metadata transfer
- Implements retry logic
- Publishes progress updates

**PlaylistService:**
- Analyzes Photos metadata
- Creates/updates Plex playlists
- Applies smart playlist rules
- Deduplicates playlist items

**ConfigurationService:**
- Manages user preferences
- Validates Plex connection
- Stores credentials securely (Keychain)

### Technology Stack

- **Language:** Swift 5.9+
- **UI:** SwiftUI for settings/preview windows
- **Concurrency:** Swift Concurrency (async/await, actors)
- **Storage:** UserDefaults for preferences, Keychain for credentials
- **Dependencies:**
  - swift-photos-library (Phase 1)
  - swift-plex-client (Phase 2)
- **Build:** Xcode 15+, Swift Package Manager

### Testing Strategy

- Unit tests for services and models
- UI tests for critical workflows
- Manual testing checklist for each release
- Beta testing with real Photos libraries (various sizes)
- Performance testing with large libraries (10k+ assets)

### Distribution

- **v1.0 MVP:** GitHub releases (dmg)
- **Future:** Consider Mac App Store (requires sandboxing review)
- **Updates:** Manual download or integrate Sparkle framework

### Technical Challenges

1. **Sandboxing:**
   - Need full disk access for Photos library
   - Network access for Plex
   - May complicate App Store distribution

2. **Performance:**
   - Large photo libraries (100k+ items)
   - Efficient change detection
   - Background sync without impacting system

3. **Reliability:**
   - Handle Photos app being closed/open
   - Handle Plex server being offline
   - Robust error recovery

4. **User Experience:**
   - Progress reporting for long operations
   - Clear error messages
   - Helpful onboarding

### Milestones

1. **M1 - Basic UI:** Menu bar app with settings, Plex connection test
2. **M2 - Manual Export:** Export selected photos with basic metadata
3. **M3 - File Organization:** Configurable naming and directory structure
4. **M4 - Playlists:** Automatic playlist creation (albums, people)
5. **M5 - MVP Release:** Polish, documentation, distribute v1.0
6. **M6 - Auto-sync:** Background monitoring and continuous sync (v2.0)

---

## Project Timeline (Rough Estimates)

### Phase 1: Photos Library (4-6 weeks)
- Week 1-2: Core database access, schema abstraction
- Week 3-4: Metadata extraction (people, albums, EXIF)
- Week 5-6: Testing, documentation, examples

### Phase 2: Plex Library (3-4 weeks)
- Week 1: Evaluate existing libraries, architecture decision
- Week 2: Core API (connection, libraries, import)
- Week 3: Metadata and playlists
- Week 4: Testing, documentation, examples

### Phase 3: App MVP (4-6 weeks)
- Week 1-2: UI framework, settings, connection testing
- Week 3-4: Manual export workflow, file organization
- Week 5: Playlist automation
- Week 6: Testing, polish, v1.0 release

**Total: 11-16 weeks (3-4 months) to v1.0**

---

## Next Steps

1. **Decision Phase:**
   - [ ] Decide on Photos access strategy (SQLite vs. ML Framework)
   - [ ] Decide on metadata mapping (Photos → Plex)
   - [ ] Decide on file organization scheme
   - [ ] Choose app name

2. **Phase 1 Kickoff:**
   - [ ] Create swift-photos-library repository
   - [ ] Set up project structure
   - [ ] Document SQLite schema (Catalina, Big Sur, Monterey, Ventura, Sonoma)
   - [ ] Build proof of concept: read people from Photos DB

3. **Research Tasks:**
   - [ ] Test plexswift library thoroughly
   - [ ] Verify Plex metadata persistence
   - [ ] Prototype file naming that Plex auto-detects correctly

---

## Open Questions & Decisions Needed

### High Priority
- [ ] **Photos access approach:** Direct SQLite, ML Framework, or hybrid?
- [ ] **Metadata mapping:** How should Photos metadata map to Plex?
  - People → ?
  - Albums → ?
  - Keywords → ?
  - Locations → ?
- [ ] **File organization:** Directory structure and naming convention?
- [ ] **App name:** Something catchier than "Photos to Plex"?

### Medium Priority
- [ ] **Library choice:** Use plexswift or build custom Plex library?
- [ ] **Distribution:** GitHub only or pursue App Store?
- [ ] **Sandboxing:** Can we meet App Store requirements?

### Low Priority
- [ ] **Monetization:** Free/open source, or paid app?
- [ ] **Windows/Linux:** Future cross-platform support?
- [ ] **Cloud support:** Google Photos, iCloud Photos web?

---

## Resources & References

### Documentation
- [Plex API Documentation](https://developer.plex.tv/)
- [Plex API Reference (Community)](https://plexapi.dev/)
- [PhotoKit Documentation](https://developer.apple.com/documentation/photokit)
- [Media Library Framework](https://developer.apple.com/documentation/medialibrary)

### Tools & Libraries
- [plexswift](https://github.com/LukeHagar/plexswift) - Swift Plex SDK
- [PlexKit](https://github.com/lcharlick/PlexKit) - Alternative Swift Plex SDK
- [osxphotos](https://github.com/RhetTbull/osxphotos) - Python Photos library (reference)
- [python-plexapi](https://github.com/pkkid/python-plexapi) - Python Plex API (reference)

### Community Resources
- [Plex Forums - Dev/API Corner](https://forums.plex.tv/c/dev-api/)
- [Photos SQLite Queries](https://theforensicscooter.com/2021/11/23/photos-sqlite-queries/)
- [Mac Photos Library Analysis](https://neilpa.me/2018-12-07-mac-photos-library/)

---

## Project Documentation

### Main Documents
- **This file:** `~/.claude/photos-to-plex-plan.md` - Overall project plan and progress
- **Photos DB Schema:** `~/.claude/photos-database-schema-analysis.md` - Detailed schema analysis
- **Matching Strategy:** `~/.claude/photos-plex-matching-strategy.md` - Video matching approaches

### Repositories
- **PhotosKit:** `~/Software Development/Open Source/Photos/` - Photos integration library (Phase 1) ✅
- **PlexKit:** TBD - Plex integration library (Phase 2)
- **Photos-to-Plex:** TBD - Main application (Phase 3)

### Key Files
- **PhotosKit README:** `~/Software Development/Open Source/Photos/README.md`
- **PhotosKit Package:** `~/Software Development/Open Source/Photos/Package.swift`
- **photos-query CLI:** `~/Software Development/Open Source/Photos/Sources/PhotosQuery/main.swift`

---

**Last Updated:** 2025-10-26 14:45 CT
