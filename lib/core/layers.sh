#!/bin/bash
# Layer System for Claude Code Configuration
# Enables multiple configuration sources (personal, company, etc.) with clear precedence
#
# Layers are stored in ~/.claude/layers/<name>/ and listed in ~/.claude/layers/.manifest
# Personal config (~/.claude/) always takes precedence over layers
# Layers are loaded in manifest order (first = highest priority among layers)

CLAUDE_HOME="${CLAUDE_HOME:-$HOME/.claude}"
LAYERS_DIR="$CLAUDE_HOME/layers"
MANIFEST_FILE="$LAYERS_DIR/.manifest"

# Ensure layers directory exists
mkdir -p "$LAYERS_DIR" 2>/dev/null

# Get list of active layers (in priority order)
# Returns: layer names, one per line
layer_list() {
    [[ -f "$MANIFEST_FILE" ]] && cat "$MANIFEST_FILE" | grep -v '^#' | grep -v '^$'
}

# Check if a layer is installed
# Args: $1 = layer name
# Returns: 0 if installed, 1 if not
layer_exists() {
    local name="$1"
    [[ -d "$LAYERS_DIR/$name" ]]
}

# Check if a layer is active (in manifest)
# Args: $1 = layer name
# Returns: 0 if active, 1 if not
layer_is_active() {
    local name="$1"
    [[ -f "$MANIFEST_FILE" ]] && grep -q "^${name}$" "$MANIFEST_FILE"
}

# Get the path to a layer
# Args: $1 = layer name
# Returns: full path to layer directory
layer_path() {
    local name="$1"
    echo "$LAYERS_DIR/$name"
}

# Find a file across personal config and layers
# Personal always wins, then layers in manifest order
# Args: $1 = relative path (e.g., "lib/helpers.sh")
# Returns: full path to first matching file, or empty if not found
layer_find() {
    local relative_path="$1"

    # Personal config wins
    if [[ -f "$CLAUDE_HOME/$relative_path" ]]; then
        echo "$CLAUDE_HOME/$relative_path"
        return 0
    fi

    # Check layers in order
    local layer
    while IFS= read -r layer; do
        [[ -z "$layer" ]] && continue
        if [[ -f "$LAYERS_DIR/$layer/$relative_path" ]]; then
            echo "$LAYERS_DIR/$layer/$relative_path"
            return 0
        fi
    done < <(layer_list)

    return 1
}

# Find all versions of a file across layers (for merging)
# Returns paths in load order: layers (reverse priority) then personal
# Args: $1 = relative path
# Returns: paths, one per line, in order they should be loaded/merged
layer_find_all() {
    local relative_path="$1"
    local layers=()
    local layer

    # Collect layers in reverse order (lowest priority first)
    while IFS= read -r layer; do
        [[ -z "$layer" ]] && continue
        layers+=("$layer")
    done < <(layer_list)

    # Output in reverse order (lowest priority = loaded first = can be overridden)
    for ((i=${#layers[@]}-1; i>=0; i--)); do
        layer="${layers[i]}"
        [[ -f "$LAYERS_DIR/$layer/$relative_path" ]] && echo "$LAYERS_DIR/$layer/$relative_path"
    done

    # Personal config last (highest priority, overrides everything)
    [[ -f "$CLAUDE_HOME/$relative_path" ]] && echo "$CLAUDE_HOME/$relative_path"
}

# Source a file from the best available location
# Args: $1 = relative path
# Returns: 0 if sourced, 1 if not found
layer_source() {
    local relative_path="$1"
    local file=$(layer_find "$relative_path")

    if [[ -n "$file" ]]; then
        source "$file"
        return 0
    fi
    return 1
}

# Source all versions of a file (for cumulative configs like preferences)
# Loads in order: layers (lowest priority first), then personal
# Args: $1 = relative path
# Returns: 0 if at least one file sourced
layer_source_all() {
    local relative_path="$1"
    local found=1
    local file

    while IFS= read -r file; do
        [[ -z "$file" ]] && continue
        source "$file"
        found=0
    done < <(layer_find_all "$relative_path")

    return $found
}

# List all files matching a glob pattern across personal and layers
# Args: $1 = glob pattern relative to config root (e.g., "commands/*.md")
# Returns: unique filenames (basename), personal shadows layers
layer_glob() {
    local pattern="$1"
    local -A seen=()
    local file basename

    # Personal first (wins)
    for file in $CLAUDE_HOME/$pattern; do
        [[ -f "$file" ]] || continue
        basename=$(basename "$file")
        if [[ -z "${seen[$basename]}" ]]; then
            echo "$file"
            seen[$basename]=1
        fi
    done

    # Then layers in order
    local layer
    while IFS= read -r layer; do
        [[ -z "$layer" ]] && continue
        for file in $LAYERS_DIR/$layer/$pattern; do
            [[ -f "$file" ]] || continue
            basename=$(basename "$file")
            if [[ -z "${seen[$basename]}" ]]; then
                echo "$file"
                seen[$basename]=1
            fi
        done
    done < <(layer_list)
}

# Add a layer to the manifest
# Args: $1 = layer name
#       $2 = position (optional: "first", "last", or number; default "last")
layer_activate() {
    local name="$1"
    local position="${2:-last}"

    if ! layer_exists "$name"; then
        echo "Error: Layer '$name' not found in $LAYERS_DIR" >&2
        return 1
    fi

    # Remove if already in manifest
    if [[ -f "$MANIFEST_FILE" ]]; then
        grep -v "^${name}$" "$MANIFEST_FILE" > "${MANIFEST_FILE}.tmp"
        mv "${MANIFEST_FILE}.tmp" "$MANIFEST_FILE"
    fi

    # Add at position
    case "$position" in
        first)
            echo "$name" | cat - "$MANIFEST_FILE" 2>/dev/null > "${MANIFEST_FILE}.tmp"
            mv "${MANIFEST_FILE}.tmp" "$MANIFEST_FILE"
            ;;
        last|*)
            echo "$name" >> "$MANIFEST_FILE"
            ;;
    esac

    return 0
}

# Remove a layer from the manifest (doesn't delete files)
# Args: $1 = layer name
layer_deactivate() {
    local name="$1"

    if [[ -f "$MANIFEST_FILE" ]]; then
        grep -v "^${name}$" "$MANIFEST_FILE" > "${MANIFEST_FILE}.tmp"
        mv "${MANIFEST_FILE}.tmp" "$MANIFEST_FILE"
    fi
}

# Get layer metadata
# Args: $1 = layer name
#       $2 = field (optional: "name", "description", "version", "url")
# Returns: metadata value or full LAYER.md content
layer_meta() {
    local name="$1"
    local field="$2"
    local layer_file="$LAYERS_DIR/$name/LAYER.md"

    if [[ ! -f "$layer_file" ]]; then
        return 1
    fi

    if [[ -z "$field" ]]; then
        cat "$layer_file"
        return 0
    fi

    # Extract field from frontmatter-style metadata
    # Looks for: field: value
    grep -i "^${field}:" "$layer_file" 2>/dev/null | head -1 | sed 's/^[^:]*: *//'
}

# Sync layer agents into main agents directory via symlinks
# Creates unprefixed symlinks only (agents are invoked programmatically)
# Personal agents always take precedence (no symlink created if a real file exists)
layer_sync_agents() {
    local agents_dir="$CLAUDE_HOME/agents"
    mkdir -p "$agents_dir"

    local layer file basename target
    local synced=0
    local synced_files=()

    while IFS= read -r layer; do
        [[ -z "$layer" ]] && continue
        [[ -d "$LAYERS_DIR/$layer/agents" ]] || continue

        for file in "$LAYERS_DIR/$layer/agents"/*.md; do
            [[ -f "$file" ]] || continue
            basename=$(basename "$file")

            # Skip if personal agent exists (real file, not symlink)
            if [[ -f "$agents_dir/$basename" && ! -L "$agents_dir/$basename" ]]; then
                continue
            fi

            target="$agents_dir/$basename"
            if [[ -L "$target" ]]; then
                rm "$target"
            fi
            ln -s "$file" "$target"
            synced_files+=("$basename")
            ((synced++))
        done
    done < <(layer_list)

    # Write .gitignore for synced agent symlinks
    if [[ ${#synced_files[@]} -gt 0 ]]; then
        {
            echo "# Auto-generated by layer_sync_agents — do not edit"
            echo "# These are symlinks to layer agents"
            printf '%s\n' "${synced_files[@]}"
        } > "$agents_dir/.gitignore"
    elif [[ -f "$agents_dir/.gitignore" ]]; then
        rm "$agents_dir/.gitignore"
    fi

    echo "$synced"
}

# Sync layer skills into main skills directory via directory symlinks
# Personal skills always take precedence (no symlink created if a real dir exists)
layer_sync_skills() {
    local skills_dir="$CLAUDE_HOME/skills"
    mkdir -p "$skills_dir"

    local layer skill_dir dirname target
    local synced=0
    local synced_dirs=()

    while IFS= read -r layer; do
        [[ -z "$layer" ]] && continue
        [[ -d "$LAYERS_DIR/$layer/skills" ]] || continue

        for skill_dir in "$LAYERS_DIR/$layer/skills"/*/; do
            [[ -d "$skill_dir" ]] || continue
            [[ -f "$skill_dir/SKILL.md" ]] || continue
            dirname=$(basename "$skill_dir")

            # Skip if personal skill exists (real dir, not symlink)
            if [[ -d "$skills_dir/$dirname" && ! -L "$skills_dir/$dirname" ]]; then
                continue
            fi

            target="$skills_dir/$dirname"
            if [[ -L "$target" ]]; then
                rm "$target"
            fi
            ln -s "$skill_dir" "$target"
            synced_dirs+=("$dirname")
            ((synced++))
        done
    done < <(layer_list)

    # Write .gitignore for synced skill symlinks
    if [[ ${#synced_dirs[@]} -gt 0 ]]; then
        {
            echo "# Auto-generated by layer_sync_skills — do not edit"
            echo "# These are symlinks to layer skills"
            printf '%s\n' "${synced_dirs[@]}"
        } > "$skills_dir/.gitignore"
    elif [[ -f "$skills_dir/.gitignore" ]]; then
        rm "$skills_dir/.gitignore"
    fi

    echo "$synced"
}

# Sync layer bin/services into main bin/services directory via directory symlinks
# Personal services always take precedence (no symlink created if a real dir exists)
layer_sync_bin_services() {
    local services_dir="$CLAUDE_HOME/bin/services"
    mkdir -p "$services_dir"

    local layer svc_dir dirname target
    local synced=0
    local synced_dirs=()

    while IFS= read -r layer; do
        [[ -z "$layer" ]] && continue
        [[ -d "$LAYERS_DIR/$layer/bin/services" ]] || continue

        for svc_dir in "$LAYERS_DIR/$layer/bin/services"/*/; do
            [[ -d "$svc_dir" ]] || continue
            dirname=$(basename "$svc_dir")

            # Skip if personal service dir exists (real dir, not symlink)
            if [[ -d "$services_dir/$dirname" && ! -L "$services_dir/$dirname" ]]; then
                continue
            fi

            target="$services_dir/$dirname"
            if [[ -L "$target" ]]; then
                rm "$target"
            fi
            ln -s "$svc_dir" "$target"
            synced_dirs+=("$dirname")
            ((synced++))
        done
    done < <(layer_list)

    # Write .gitignore for synced service symlinks
    if [[ ${#synced_dirs[@]} -gt 0 ]]; then
        {
            echo "# Auto-generated by layer_sync_bin_services — do not edit"
            echo "# These are symlinks to layer service scripts"
            printf '%s\n' "${synced_dirs[@]}"
        } > "$services_dir/.gitignore"
    elif [[ -f "$services_dir/.gitignore" ]]; then
        rm "$services_dir/.gitignore"
    fi

    echo "$synced"
}

# Sync layer commands into main commands directory via symlinks
# Creates both unprefixed symlinks (for usability) and prefixed ones (for disambiguation)
# Personal commands always take precedence (no symlink created if a real file exists)
layer_sync_commands() {
    local commands_dir="$CLAUDE_HOME/commands"
    mkdir -p "$commands_dir"

    local layer file basename linkname target
    local synced=0
    local unprefixed_files=()

    # Process each layer
    while IFS= read -r layer; do
        [[ -z "$layer" ]] && continue
        [[ -d "$LAYERS_DIR/$layer/commands" ]] || continue

        for file in "$LAYERS_DIR/$layer/commands"/*.md; do
            [[ -f "$file" ]] || continue
            basename=$(basename "$file")

            # Skip if personal command exists with same name (real file, not symlink)
            local personal_exists=false
            if [[ -f "$commands_dir/$basename" && ! -L "$commands_dir/$basename" ]]; then
                personal_exists=true
            fi

            # Create prefixed symlink (always, for explicit layer access)
            linkname="_${layer}_${basename}"
            target="$commands_dir/$linkname"
            if [[ -L "$target" ]]; then
                rm "$target"
            fi
            ln -s "$file" "$target"
            ((synced++))

            # Create unprefixed symlink (only if no personal command collision)
            if [[ "$personal_exists" == "false" ]]; then
                local unprefixed="$commands_dir/$basename"
                if [[ -L "$unprefixed" ]]; then
                    rm "$unprefixed"
                fi
                ln -s "$file" "$unprefixed"
                unprefixed_files+=("$basename")
            fi
        done
    done < <(layer_list)

    # Write .gitignore for auto-generated unprefixed symlinks
    if [[ ${#unprefixed_files[@]} -gt 0 ]]; then
        {
            echo "# Auto-generated by layer_sync_commands — do not edit"
            echo "# These are symlinks to layer commands"
            printf '%s\n' "${unprefixed_files[@]}"
        } > "$commands_dir/.gitignore"
    elif [[ -f "$commands_dir/.gitignore" ]]; then
        rm "$commands_dir/.gitignore"
    fi

    echo "$synced"
}

# Sync layer hooks into hooks directory
layer_sync_hooks() {
    local hooks_dir="$CLAUDE_HOME/hooks"
    mkdir -p "$hooks_dir"

    local layer file basename linkname target
    local synced=0

    while IFS= read -r layer; do
        [[ -z "$layer" ]] && continue
        [[ -d "$LAYERS_DIR/$layer/hooks" ]] || continue

        for file in "$LAYERS_DIR/$layer/hooks"/*.sh; do
            [[ -f "$file" ]] || continue
            basename=$(basename "$file")

            # Skip if personal hook exists
            if [[ -f "$hooks_dir/$basename" && ! -L "$hooks_dir/$basename" ]]; then
                continue
            fi

            linkname="_${layer}_${basename}"
            target="$hooks_dir/$linkname"

            if [[ -L "$target" ]]; then
                rm "$target"
            fi
            ln -s "$file" "$target"
            ((synced++))
        done
    done < <(layer_list)

    echo "$synced"
}

# Clean up stale symlinks from removed layers
# Removes both prefixed (_layer_cmd) and unprefixed symlinks pointing into layers/
# Handles both file symlinks and directory symlinks
layer_cleanup_symlinks() {
    local dir="$1"
    local cleaned=0

    for link in "$dir"/*; do
        [[ -L "$link" ]] || continue
        if [[ ! -e "$link" ]]; then
            rm "$link"
            ((cleaned++))
        fi
    done

    echo "$cleaned"
}

# Full sync: commands, hooks, agents, skills, bin/services, cleanup
layer_sync() {
    local cmd_count=$(layer_sync_commands)
    local hook_count=$(layer_sync_hooks)
    local agent_count=$(layer_sync_agents)
    local skill_count=$(layer_sync_skills)
    local svc_count=$(layer_sync_bin_services)
    local cmd_cleaned=$(layer_cleanup_symlinks "$CLAUDE_HOME/commands")
    local hook_cleaned=$(layer_cleanup_symlinks "$CLAUDE_HOME/hooks")
    local agent_cleaned=$(layer_cleanup_symlinks "$CLAUDE_HOME/agents")
    local skill_cleaned=$(layer_cleanup_symlinks "$CLAUDE_HOME/skills")
    local svc_cleaned=$(layer_cleanup_symlinks "$CLAUDE_HOME/bin/services")

    echo "Synced: $cmd_count commands, $hook_count hooks, $agent_count agents, $skill_count skills, $svc_count services"
    local total_cleaned=$((cmd_cleaned + hook_cleaned + agent_cleaned + skill_cleaned + svc_cleaned))
    if [[ $total_cleaned -gt 0 ]]; then
        echo "Cleaned: $cmd_cleaned commands, $hook_cleaned hooks, $agent_cleaned agents, $skill_cleaned skills, $svc_cleaned services"
    fi
    return 0
}

# Export functions
export -f layer_list
export -f layer_exists
export -f layer_is_active
export -f layer_path
export -f layer_find
export -f layer_find_all
export -f layer_source
export -f layer_source_all
export -f layer_glob
export -f layer_activate
export -f layer_deactivate
export -f layer_meta
export -f layer_sync_commands
export -f layer_sync_hooks
export -f layer_sync_agents
export -f layer_sync_skills
export -f layer_sync_bin_services
export -f layer_cleanup_symlinks
export -f layer_sync
