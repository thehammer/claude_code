# Photos-to-Plex Matching Strategy

**Date:** 2025-10-26
**Purpose:** Match existing Plex videos to Photos library metadata

## The Challenge

You have **555 videos** already in Plex at `/Volumes/PlexLibrary/Home Movies/`
These videos may have originated from your Photos library, but:
- Filenames don't match (Photos uses UUIDs, Plex has various naming patterns)
- File sizes may differ slightly (re-encoding, metadata stripping)
- Creation dates may be lost or modified

## Plex File Naming Patterns Observed

```
IMG_0004.MOV                                           # Standard iPhone naming
64157249327__652DECA0-124B-4FE1-A1D8-ECF8E89532F3.MOV  # WhatsApp/messaging app
720B242A-FC7F-4643-A9F5-A9B3BBAC0A94IMG_0009.mov       # UUID + standard name
2023-06-20T180601-0400.mp4                             # Date-based naming
IMG_0064_fixed.mov                                     # User renamed/edited
```

## Photos Database File Naming

All files in Photos use UUID-based naming:
```
66762C0D-66FC-4CFB-BCD9-47FF352ADE0A.mp4
4DB9E80E-2A94-479A-A5AD-E9AABEAD74EF.mov
6FA08AC8-A66B-414B-AE46-AA04AB769321.MP4
```

**Key Insight:** Filenames alone won't match unless the UUID is embedded in the Plex filename.

## Matching Strategies

### Strategy 1: UUID Extraction from Filename ⭐ **Best for subset**

**Approach:** Extract UUIDs from Plex filenames and match against `ZASSET.ZUUID`

**Example:**
```
Plex: 64157249327__652DECA0-124B-4FE1-A1D8-ECF8E89532F3.MOV
UUID: 652DECA0-124B-4FE1-A1D8-ECF8E89532F3
Query: SELECT * FROM ZASSET WHERE ZUUID = '652DECA0-124B-4FE1-A1D8-ECF8E89532F3'
```

**Coverage:** Only works for files with embedded UUIDs (~10-20% of files)

**Implementation:**
```swift
func extractUUID(from filename: String) -> String? {
    let uuidPattern = "[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}"
    let regex = try? NSRegularExpression(pattern: uuidPattern, options: .caseInsensitive)

    if let match = regex?.firstMatch(in: filename, range: NSRange(filename.startIndex..., in: filename)) {
        return String(filename[Range(match.range, in: filename)!])
    }
    return nil
}
```

### Strategy 2: File Size Matching (with tolerance) ⚠️ **Fuzzy**

**Approach:** Match files by size with small tolerance (±1%)

**Challenges:**
- Photos stores file size in `ZINTERNALRESOURCE.ZDATALENGTH`
- Plex files may have been re-encoded or stripped of metadata
- Size differences observed: 13829852 (Plex) vs 13830511 (Photos)

**Query:**
```sql
SELECT
    a.ZFILENAME,
    a.ZUUID,
    datetime(a.ZDATECREATED + 978307200, 'unixepoch') as created,
    ir.ZDATALENGTH
FROM ZASSET a
JOIN ZINTERNALRESOURCE ir ON a.Z_PK = ir.ZASSET
WHERE a.ZKIND = 1  -- Videos only
  AND ir.ZDATALENGTH BETWEEN ? - (?  * 0.01) AND ? + (? * 0.01)
```

**Problems:**
- Multiple matches possible (not unique)
- Requires secondary validation
- Won't work if files were re-encoded

**Accuracy:** ~60-80% (requires validation)

### Strategy 3: Creation Date + Duration Matching ⭐⭐ **Most Reliable**

**Approach:** Match by creation timestamp AND video duration

**Rationale:**
- Combination of date + duration is nearly unique
- Video duration preserved even if re-encoded
- Can extract from both Photos DB and Plex files

**From Photos:**
```sql
SELECT
    a.ZUUID,
    a.ZFILENAME,
    datetime(a.ZDATECREATED + 978307200, 'unixepoch') as created,
    a.ZDURATION
FROM ZASSET a
WHERE a.ZKIND = 1
```

**From Plex files:**
```bash
# Using ffprobe to get duration
ffprobe -v quiet -show_entries format=duration -of csv=p=0 "file.mov"

# Or using mdls (faster but less accurate)
mdls -name kMDItemDurationSeconds "file.mov"
```

**Matching Logic:**
1. Extract creation date and duration from Plex file
2. Find Photos assets with matching date (±1 day tolerance) and duration (±1 second)
3. If single match → high confidence
4. If multiple matches → require additional validation (file size, dimensions)

**Accuracy:** ~90-95%

### Strategy 4: Content Hash Matching 🔒 **Most Accurate, Slowest**

**Approach:** Generate hash of video content and compare

**From Photos:**
- Photos doesn't store content hashes
- Would need to read original file from Photos library
- Hash the video data (skip metadata)

**From Plex:**
- Read file from Plex directory
- Hash the video stream (skip metadata/container differences)

**Tools:**
```bash
# Using ffmpeg to hash video stream only
ffmpeg -i input.mov -map 0:v -f md5 -

# Or using shasum on raw video data
ffmpeg -i input.mov -c copy -f h264 - | shasum -a 256
```

**Problems:**
- Very slow (must read entire file)
- Requires both files accessible
- Hash changes if video was re-encoded
- Photos database doesn't store hashes (need to read originals)

**Accuracy:** 99%+ (but only for bit-identical files)

**Use Case:** Validation step for uncertain matches

### Strategy 5: Metadata Fingerprinting ⭐⭐⭐ **Recommended**

**Approach:** Create multi-factor fingerprint and match on combined score

**Fingerprint Components:**
1. **Creation Date** (from EXIF or file metadata)
2. **Video Duration** (from media stream)
3. **Resolution** (width × height)
4. **File Size** (with tolerance)
5. **GPS Coordinates** (if available)

**Scoring System:**
```
Creation Date Match (±1 sec):     40 points
Duration Match (±1 sec):          30 points
Resolution Match (exact):         15 points
File Size Match (±2%):            10 points
GPS Match (±0.001 degrees):        5 points

Total possible: 100 points
Threshold for match: 70+ points
High confidence: 85+ points
```

**Implementation:**
```swift
struct VideoFingerprint {
    let creationDate: Date
    let duration: TimeInterval
    let width: Int
    let height: Int
    let fileSize: Int64
    let latitude: Double?
    let longitude: Double?

    func matchScore(against other: VideoFingerprint) -> Int {
        var score = 0

        // Date match (±1 second)
        if abs(creationDate.timeIntervalSince(other.creationDate)) <= 1.0 {
            score += 40
        } else if abs(creationDate.timeIntervalSince(other.creationDate)) <= 86400 {
            score += 20  // Same day
        }

        // Duration match (±1 second)
        if abs(duration - other.duration) <= 1.0 {
            score += 30
        }

        // Resolution match
        if width == other.width && height == other.height {
            score += 15
        }

        // File size match (±2%)
        let sizeDiff = abs(Double(fileSize - other.fileSize)) / Double(fileSize)
        if sizeDiff <= 0.02 {
            score += 10
        }

        // GPS match
        if let lat1 = latitude, let lon1 = longitude,
           let lat2 = other.latitude, let lon2 = other.longitude {
            if abs(lat1 - lat2) <= 0.001 && abs(lon1 - lon2) <= 0.001 {
                score += 5
            }
        }

        return score
    }
}
```

**Accuracy:** ~95%+ (with manual review of 70-84 point matches)

## Recommended Workflow

### Phase 1: High-Confidence Matches

1. **UUID Extraction** (Strategy 1)
   - Extract UUIDs from filenames
   - Direct lookup in Photos DB
   - ~100% accuracy for matched subset

2. **Metadata Fingerprinting** (Strategy 5)
   - Score all remaining files
   - Auto-match scores ≥85
   - Flag scores 70-84 for review

### Phase 2: Manual Review

3. **Review Uncertain Matches**
   - Show side-by-side comparison for scores 70-84
   - Display thumbnails, dates, durations
   - User confirms or rejects

### Phase 3: Unmatched Files

4. **Report Unmatched**
   - List Plex files with no Photos match
   - List Photos videos not in Plex
   - Suggest next actions

## Data Extraction Requirements

### From Plex Files (using ffprobe)

```bash
ffprobe -v quiet \
    -print_format json \
    -show_entries format=duration:stream=width,height \
    -show_entries format_tags=creation_time \
    "file.mov"
```

**Output:**
```json
{
    "streams": [{"width": 1920, "height": 1080}],
    "format": {
        "duration": "45.123456",
        "tags": {"creation_time": "2021-06-08T14:29:47.000000Z"}
    }
}
```

### From Photos Database

```sql
SELECT
    a.ZUUID,
    a.ZFILENAME,
    a.ZDIRECTORY,
    datetime(a.ZDATECREATED + 978307200, 'unixepoch') as creation_date,
    a.ZDURATION,
    a.ZWIDTH,
    a.ZHEIGHT,
    a.ZLATITUDE,
    a.ZLONGITUDE,
    ir.ZDATALENGTH as file_size
FROM ZASSET a
JOIN ZINTERNALRESOURCE ir ON a.Z_PK = ir.ZASSET
WHERE a.ZKIND = 1  -- Videos only
  AND a.ZTRASHEDSTATE = 0
  AND ir.ZRESOURCETYPE = 2  -- Video resource
```

## Implementation Plan

### Step 1: Build Fingerprint Database

```swift
// For Plex files
let plexFingerprints = await analyzePlexLibrary("/Volumes/PlexLibrary/Home Movies/")

// For Photos library
let photosFingerprints = await analyzePhotosLibrary()
```

### Step 2: Match and Score

```swift
var matches: [(plexFile: String, photosUUID: String, score: Int)] = []

for plexFP in plexFingerprints {
    var bestMatch: (uuid: String, score: Int)? = nil

    for photoFP in photosFingerprints {
        let score = plexFP.matchScore(against: photoFP)
        if score > (bestMatch?.score ?? 0) {
            bestMatch = (photoFP.uuid, score)
        }
    }

    if let match = bestMatch, match.score >= 70 {
        matches.append((plexFP.filename, match.uuid, match.score))
    }
}
```

### Step 3: Apply Metadata

```swift
// For high-confidence matches (score ≥ 85)
for match in matches where match.score >= 85 {
    let metadata = fetchPhotosMetadata(uuid: match.photosUUID)

    // Update Plex via API
    await updatePlexMetadata(
        file: match.plexFile,
        title: metadata.title,
        date: metadata.creationDate,
        tags: metadata.people.map { $0.name },
        gps: (metadata.latitude, metadata.longitude)
    )

    // Create/update playlists
    for person in metadata.people {
        await addToPlaylist(name: "Videos with \(person.name)", file: match.plexFile)
    }
}
```

## Expected Results

For your library:
- **555 Plex files** to analyze
- **~1,200 Photos videos** (estimate based on 10,006 assets, ~12% video)

**Estimated Match Rates:**
- UUID matches: ~50-100 files (10-20%)
- High-confidence fingerprint: ~300-400 files (60-70% of remaining)
- Manual review needed: ~100-150 files (20-30%)
- Unmatched: ~50-100 files (10-20%)

**After Matching:**
- Enriched Plex metadata (people, dates, locations)
- Automated playlists ("Videos with Zelda", "Videos with Jason")
- Identified gaps (Photos videos not in Plex)

## Tools Needed

1. **ffprobe** - Extract video metadata
   ```bash
   brew install ffmpeg  # Includes ffprobe
   ```

2. **SQLite3** - Query Photos database (already available)

3. **Swift/Python script** - Orchestrate matching process

## Next Steps

1. ✅ Document matching strategies (this file)
2. [ ] Build proof-of-concept matcher
3. [ ] Test on sample of 10-20 files
4. [ ] Refine scoring weights based on results
5. [ ] Build full matcher with progress reporting
6. [ ] Create UI for manual review of uncertain matches
7. [ ] Integrate with Plex metadata updates

---

**Last Updated:** 2025-10-26
