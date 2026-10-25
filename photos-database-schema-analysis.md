# macOS Photos Database Schema Analysis

**Date:** 2025-10-26
**macOS Version:** Sequoia (based on database structure)
**Database:** Photos.sqlite
**Location:** `~/Pictures/Photos Library.photoslibrary/database/Photos.sqlite`

## Executive Summary

Successfully accessed and analyzed the Photos.sqlite database. The database contains comprehensive metadata including:
- ✅ **10,006 total assets** (photos and videos)
- ✅ **23 named people** (face recognition)
- ✅ **7 user albums**
- ✅ Rich metadata: GPS coordinates, dates, favorites, file paths

## Key Tables for Photos-to-Plex Integration

### 1. ZASSET (Main Asset Table)

**Purpose:** Primary table containing all photos and videos

**Key Columns:**
- `Z_PK` - Primary key (INTEGER)
- `ZKIND` - Media type:
  - `0` = Photo
  - `1` = Video
- `ZDIRECTORY` - Directory path within Photos library (e.g., `164468618/FS-...`)
- `ZFILENAME` - Actual filename (e.g., `064A9981-5B0B-4C80-9D37-8317F4A79BB9.MP4`)
- `ZDATECREATED` - Creation timestamp
- `ZLATITUDE` / `ZLONGITUDE` - GPS coordinates (FLOAT)
- `ZFAVORITE` - Boolean (0/1) for favorite status
- `ZHIDDEN` - Boolean (0/1) for hidden status
- `ZTRASHEDSTATE` - Trash status
- `ZWIDTH` / `ZHEIGHT` - Dimensions in pixels
- `ZDURATION` - Video duration (seconds, FLOAT)
- `ZUUID` - Unique identifier (VARCHAR)
- `ZMODIFICATIONDATE` - Last modified timestamp
- `ZUNIFORMTYPEIDENTIFIER` - UTI (e.g., `public.mpeg-4`)
- `ZCURATIONSCORE` - Apple's curation/quality score (FLOAT)
- `ZOVERALLAESTHETICSCORE` - Aesthetic quality score (FLOAT)

**Relationships:**
- `ZEXTENDEDATTRIBUTES` → Links to ZEXTENDEDATTRIBUTES table
- `ZMASTER` → Links to ZCLOUDMASTER table
- `ZMOMENT` → Links to ZMOMENT table (automatic grouping)

**Sample Data:**
```
ZDIRECTORY: 164468618/FS-4cc31990-124b-495d-8f5f-0b4aeb072f1f
ZFILENAME: 064A9981-5B0B-4C80-9D37-8317F4A79BB9.MP4
ZKIND: 1 (video)
ZDATECREATED: 501973985 (timestamp)
ZLATITUDE: 39.8256
ZLONGITUDE: -85.7056
ZFAVORITE: 0
```

### 2. ZPERSON (Named People)

**Purpose:** Stores people identified by face recognition

**Key Columns:**
- `Z_PK` - Primary key (INTEGER)
- `ZDISPLAYNAME` - Person's display name (VARCHAR) - **KEY FIELD**
- `ZFULLNAME` - Full name if linked to contact (VARCHAR)
- `ZFACECOUNT` - Number of faces detected for this person (INTEGER)
- `ZVERIFIEDTYPE` - Verification status:
  - `-2` = Not verified
  - `1` = Verified
  - `2` = Verified with high confidence
- `ZAGETYPE` - Estimated age category (INTEGER)
- `ZGENDERTYPE` - Estimated gender (INTEGER)
- `ZPERSONUUID` - Unique identifier (VARCHAR)
- `ZTYPE` - Person type
- `ZKEYFACE` - Foreign key to representative face (ZDETECTEDFACE)
- `ZCONTACTMATCHINGDICTIONARY` - Contact info (BLOB)

**Sample Data:**
```
ZDISPLAYNAME: Jason
ZFACECOUNT: 633
ZVERIFIEDTYPE: 1 (verified)
```

**Notes:**
- Some persons have null ZDISPLAYNAME (unnamed faces)
- ZFACECOUNT indicates number of photos this person appears in

### 3. ZDETECTEDFACE (Face Detection Data)

**Purpose:** Individual face detections within photos/videos

**Key Columns:**
- `Z_PK` - Primary key (INTEGER)
- `ZASSETFORFACE` - Foreign key to ZASSET (which photo/video)
- `ZPERSONFORFACE` - Foreign key to ZPERSON (which person)
- `ZCENTERX` / `ZCENTERY` - Face center coordinates (FLOAT, 0-1 normalized)
- `ZSIZE` - Face size (FLOAT)
- `ZQUALITY` - Quality score (FLOAT)
- `ZHIDDEN` - Boolean (0/1) if face is hidden
- `ZASSETVISIBLE` - Boolean if parent asset is visible
- `ZAGETYPE` - Estimated age
- `ZGENDERTYPE` - Estimated gender
- `ZFACIALHAIRTYPE` - Facial hair detection
- `ZGLASSESTYPE` - Glasses detection
- `ZHAIRCOLORTYPE` - Hair color estimation
- `ZHASSMILE` - Smile detection (0/1)
- `ZGAZETYPE` - Gaze direction
- `ZUUID` - Unique identifier (VARCHAR)

**Relationships:**
- Multiple faces can link to same asset (group photos)
- Multiple faces can link to same person (same person in different photos)

**Face Attributes Available:**
- Age estimation
- Gender estimation
- Ethnicity type
- Eye makeup detection
- Eyes open/closed state
- Facial hair type
- Gaze direction
- Glasses detection
- Hair color
- Hair style
- Has face mask
- Smile detection
- Head gear
- Lip makeup
- Pose type
- Skin tone

### 4. ZGENERICALBUM (Albums)

**Purpose:** User-created and system albums

**Key Columns:**
- `Z_PK` - Primary key (INTEGER)
- `ZTITLE` - Album title (VARCHAR) - **KEY FIELD**
- `ZKIND` - Album type:
  - `2` = User album
  - `3572` = System albums (imports, progress, etc.)
- `ZCACHEDCOUNT` - Number of items in album (INTEGER)
- `ZCACHEDPHOTOSCOUNT` - Number of photos
- `ZCACHEDVIDEOSCOUNT` - Number of videos
- `ZTRASHEDSTATE` - Trash status
- `ZISPINNED` - Pinned status (0/1)
- `ZCREATIONDATE` - Creation timestamp
- `ZSTARTDATE` / `ZENDDATE` - Date range for smart albums
- `ZUUID` - Unique identifier (VARCHAR)
- `ZCUSTOMSORTKEY` - Custom sort order
- `ZPARENTFOLDER` - Parent folder (for nested albums)

**Sample Data:**
```
ZTITLE: Our Wedding
ZKIND: 2 (user album)
ZCACHEDCOUNT: 695
```

**Notes:**
- System albums (ZKIND != 2) should be filtered out
- Albums can be nested (ZPARENTFOLDER)

### 5. Z_32ASSETS (Album-Asset Junction)

**Purpose:** Many-to-many relationship between albums and assets

**Structure:**
- Links ZGENERICALBUM to ZASSET
- Allows assets to be in multiple albums

### 6. ZMOMENT (Automatic Grouping)

**Purpose:** Apple's automatic photo grouping by time/place

**Use Case:** Could be useful for creating automatic playlists

### 7. ZKEYWORD (Keywords/Tags)

**Purpose:** User-assigned keywords/tags

**Note:** Need to explore Z_1KEYWORDS junction table for asset-keyword relationships

### 8. ZEXTENDEDATTRIBUTES (Extended Metadata)

**Purpose:** Additional EXIF and metadata

**Likely Contains:**
- Camera make/model
- Lens information
- Exposure settings
- ISO, aperture, shutter speed
- Flash settings

### 9. ZFACECROP (Face Thumbnails)

**Purpose:** Cropped thumbnail images of detected faces

**Use Case:** Could be used for Plex poster art

## File Path Resolution

**Photos Library Structure:**
```
~/Pictures/Photos Library.photoslibrary/
├── database/
│   └── Photos.sqlite
├── originals/
│   └── [ZDIRECTORY]/
│       └── [ZFILENAME]
└── Masters/  (older versions)
```

**Full Path Construction:**
```swift
let basePath = "~/Pictures/Photos Library.photoslibrary/originals/"
let fullPath = "\(basePath)\(ZDIRECTORY)/\(ZFILENAME)"
```

**Example:**
```
~/Pictures/Photos Library.photoslibrary/originals/164468618/FS-4cc31990-124b-495d-8f5f-0b4aeb072f1f/064A9981-5B0B-4C80-9D37-8317F4A79BB9.MP4
```

## Key Queries for Photos-to-Plex Integration

### Query 1: Get All Videos with Metadata

```sql
SELECT
    a.Z_PK,
    a.ZDIRECTORY,
    a.ZFILENAME,
    a.ZDATECREATED,
    a.ZLATITUDE,
    a.ZLONGITUDE,
    a.ZFAVORITE,
    a.ZDURATION,
    a.ZUUID
FROM ZASSET a
WHERE a.ZKIND = 1  -- Videos only
  AND a.ZTRASHEDSTATE = 0  -- Not trashed
  AND a.ZHIDDEN = 0  -- Not hidden
ORDER BY a.ZDATECREATED DESC;
```

### Query 2: Get Videos with People

```sql
SELECT
    a.ZFILENAME,
    a.ZDATECREATED,
    p.ZDISPLAYNAME as person_name,
    p.ZFACECOUNT
FROM ZASSET a
JOIN ZDETECTEDFACE df ON a.Z_PK = df.ZASSETFORFACE
JOIN ZPERSON p ON df.ZPERSONFORFACE = p.Z_PK
WHERE a.ZKIND = 1  -- Videos
  AND a.ZTRASHEDSTATE = 0
  AND p.ZDISPLAYNAME IS NOT NULL  -- Only named people
ORDER BY a.ZDATECREATED DESC;
```

### Query 3: Get Album Contents

```sql
SELECT
    ga.ZTITLE as album_name,
    a.ZFILENAME,
    a.ZDATECREATED
FROM ZGENERICALBUM ga
JOIN Z_32ASSETS z32 ON ga.Z_PK = z32.Z_32ALBUMS
JOIN ZASSET a ON z32.Z_3ASSETS = a.Z_PK
WHERE ga.ZKIND = 2  -- User albums only
  AND ga.ZTITLE = 'Our Wedding'
  AND a.ZKIND = 1  -- Videos
  AND a.ZTRASHEDSTATE = 0
ORDER BY a.ZDATECREATED;
```

### Query 4: Get All People in a Video

```sql
SELECT DISTINCT
    p.ZDISPLAYNAME,
    COUNT(df.Z_PK) as face_count
FROM ZDETECTEDFACE df
JOIN ZPERSON p ON df.ZPERSONFORFACE = p.Z_PK
WHERE df.ZASSETFORFACE = ?  -- Asset PK
  AND p.ZDISPLAYNAME IS NOT NULL
GROUP BY p.ZDISPLAYNAME
ORDER BY p.ZDISPLAYNAME;
```

### Query 5: Get Videos by Date Range

```sql
SELECT
    a.ZFILENAME,
    datetime(a.ZDATECREATED + 978307200, 'unixepoch') as created_at
FROM ZASSET a
WHERE a.ZKIND = 1
  AND a.ZTRASHEDSTATE = 0
  AND a.ZDATECREATED >= ?  -- Start timestamp
  AND a.ZDATECREATED <= ?  -- End timestamp
ORDER BY a.ZDATECREATED;
```

**Note:** Photos uses Apple's timestamp format (seconds since 2001-01-01, not Unix epoch).
Add 978307200 to convert to Unix timestamp.

### Query 6: Get Videos by Location (Geo-tagged)

```sql
SELECT
    a.ZFILENAME,
    a.ZLATITUDE,
    a.ZLONGITUDE,
    a.ZDATECREATED
FROM ZASSET a
WHERE a.ZKIND = 1
  AND a.ZTRASHEDSTATE = 0
  AND a.ZLATITUDE IS NOT NULL
  AND a.ZLONGITUDE IS NOT NULL
ORDER BY a.ZDATECREATED DESC;
```

## Data Mapping: Photos → Plex

### Asset Metadata Mapping

| Photos Field | Plex Field | Notes |
|--------------|------------|-------|
| ZDATECREATED | originallyAvailableAt | Convert Apple timestamp |
| ZTITLE (from desc) | title | May need to generate from filename |
| ZASSETDESCRIPTION | summary | User-added description |
| ZLATITUDE/ZLONGITUDE | GPS coordinates | Could use for tags/collections |
| ZFAVORITE | userRating | Map to rating or tag |
| ZDURATION | duration | For videos |

### People → Plex Collections/Tags

**Approach 1: Collections**
- Create Plex collection per person
- Example: "Videos with Jason" collection

**Approach 2: Tags**
- Add person names as tags
- Allows multi-person search

**Approach 3: Both**
- Tags for granular search
- Collections for curated sets

### Albums → Plex Playlists

| Photos Album | Plex Playlist | Auto-Update? |
|--------------|---------------|--------------|
| Our Wedding | Our Wedding Videos | No (one-time) |
| Summer 2024 | Summer 2024 | Yes (if new additions) |
| Vacation: Hawaii | Hawaii Vacation | No |

### Smart Playlist Ideas

1. **By Person:**
   - "All videos with Jason"
   - "Videos with Jason and Sarah"

2. **By Date/Season:**
   - "Summer 2024" (June-August)
   - "2024 Holiday Season" (Nov-Dec)

3. **By Location:**
   - "Videos from Chicago" (lat/long range)
   - "Vacation videos" (far from home location)

4. **By Album:**
   - Map each Photos album to Plex playlist

5. **Favorites:**
   - "Favorite Videos" (ZFAVORITE = 1)

6. **Recent:**
   - "Recently Added" (last 30 days)

## Technical Challenges & Solutions

### Challenge 1: Database Locking

**Issue:** Photos.sqlite is locked when Photos app is running

**Solution:**
```bash
# Copy database to temp location
cp ~/Pictures/Photos\ Library.photoslibrary/database/Photos.sqlite /tmp/Photos-temp.sqlite

# Query the copy
sqlite3 /tmp/Photos-temp.sqlite "SELECT ..."
```

**Swift Implementation:**
```swift
func copyPhotosDatabase() throws -> URL {
    let source = FileManager.default.homeDirectoryForCurrentUser
        .appendingPathComponent("Pictures/Photos Library.photoslibrary/database/Photos.sqlite")

    let temp = FileManager.default.temporaryDirectory
        .appendingPathComponent("Photos-\(UUID().uuidString).sqlite")

    try FileManager.default.copyItem(at: source, to: temp)
    return temp
}
```

### Challenge 2: Timestamp Conversion

**Issue:** Apple uses different epoch (2001-01-01 vs 1970-01-01)

**Solution:**
```swift
// Apple timestamp to Unix timestamp
let unixTimestamp = appleTimestamp + 978307200

// Unix timestamp to Date
let date = Date(timeIntervalSince1970: unixTimestamp)

// Date to formatted string
let formatter = ISO8601DateFormatter()
let dateString = formatter.string(from: date)
```

### Challenge 3: File Path Construction

**Issue:** Need to map database paths to actual files

**Solution:**
```swift
func resolveAssetPath(directory: String, filename: String) -> URL {
    let library = FileManager.default.homeDirectoryForCurrentUser
        .appendingPathComponent("Pictures/Photos Library.photoslibrary")

    return library
        .appendingPathComponent("originals")
        .appendingPathComponent(directory)
        .appendingPathComponent(filename)
}
```

### Challenge 4: macOS Version Differences

**Issue:** Schema changes between macOS versions

**Solution:**
- Query Z_METADATA table for version info
- Implement version detection
- Provide fallbacks for missing columns

```sql
SELECT Z_VERSION FROM Z_METADATA WHERE Z_PLIST IS NOT NULL;
```

## Database Size & Performance

**Current Library Stats:**
- Total Assets: 10,006
- Database Size: ~659 MB
- Named People: 23
- User Albums: 7

**Performance Considerations:**
- Indexes exist on key fields (ZDATECREATED, ZUUID, etc.)
- JOIN queries should perform well for typical queries
- Consider caching person/album lists
- Incremental queries (page results for large libraries)

## Next Steps for Swift Library

1. **Core Database Access:**
   - [x] Locate and copy Photos.sqlite
   - [ ] Open SQLite connection safely
   - [ ] Detect macOS version/schema
   - [ ] Implement transaction handling

2. **Asset Queries:**
   - [ ] Fetch all assets with filters (kind, trashed, hidden)
   - [ ] Fetch asset metadata (dates, location, favorites)
   - [ ] Resolve file paths
   - [ ] Handle iCloud status (downloaded vs. cloud-only)

3. **People Queries:**
   - [ ] Fetch all named people
   - [ ] Get assets for specific person
   - [ ] Get all people in specific asset
   - [ ] Handle unnamed faces (option to include/exclude)

4. **Album Queries:**
   - [ ] Fetch all user albums
   - [ ] Get assets in album
   - [ ] Handle nested albums (folders)
   - [ ] Detect smart albums vs. regular albums

5. **Advanced Metadata:**
   - [ ] Keywords/tags extraction
   - [ ] Extended attributes (EXIF)
   - [ ] Moments/memories
   - [ ] Face crop images

6. **Type-Safe API Design:**
   ```swift
   // Proposed API
   let library = try PhotosLibrary()

   // Fetch videos
   let videos = try await library.assets(
       type: .video,
       includeTrashed: false,
       includeHidden: false
   )

   // Fetch people
   let people = try await library.people(namedOnly: true)

   // Fetch assets with person
   let assetsWithJason = try await library.assets(
       withPerson: jason,
       type: .video
   )

   // Fetch album contents
   let weddingPhotos = try await library.assets(in: weddingAlbum)
   ```

## Security & Privacy Considerations

1. **Full Disk Access Required:**
   - App needs Full Disk Access permission
   - User must grant in System Settings
   - Document clearly in README

2. **Read-Only Access:**
   - Only read from database, never write
   - Work with copy to prevent corruption

3. **User Data Sensitivity:**
   - Photos contain personal/private data
   - Face recognition data is sensitive
   - GPS coordinates reveal home/work locations
   - Handle with appropriate security

4. **Plex Token Security:**
   - Store Plex tokens in Keychain
   - Never log or expose tokens
   - Clear documentation on token access

## References

- [osxphotos](https://github.com/RhetTbull/osxphotos) - Python library for reference
- [Photos SQLite Queries](https://theforensicscooter.com/2021/11/23/photos-sqlite-queries/)
- [Mac Photos Library Analysis](https://neilpa.me/2018-12-07-mac-photos-library/)

---

**Last Updated:** 2025-10-26
**Database Analyzed:** Photos.sqlite from macOS Sequoia
**Total Tables:** 88
**Key Tables Documented:** 9
