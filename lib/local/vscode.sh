#!/bin/bash
# VSCode UI Automation Helpers

vscode_get_main_area_path() {
    echo "UI element 2 of UI element 1 of UI element 2 of UI element 2 of UI element 1 of UI element 2 of UI element 2 of UI element 1 of group 1 of group 1 of group 1 of UI element 1 of group 1 of group 1 of group 1 of group 1 of window 1"
}

# Get all Claude session names
# Returns one name per line
vscode_get_claude_sessions() {
    osascript <<'EOF'
tell application "System Events"
  tell process "Code"
    try
      set mainArea to UI element 2 of UI element 1 of UI element 2 of UI element 2 of UI element 1 of UI element 2 of UI element 2 of UI element 1 of group 1 of group 1 of group 1 of UI element 1 of group 1 of group 1 of group 1 of group 1 of window 1
      set topSection to UI element 1 of mainArea
      set partEditor to UI element 1 of topSection
      set gridView to UI element 1 of partEditor
      set splitView to UI element 1 of gridView
      set splitContainer to UI element 2 of splitView
      set panes to every UI element of splitContainer
      
      set claudeSessions to {}
      
      repeat with pane in panes
        try
          set tabGroup to UI element 1 of UI element 1 of UI element 1 of pane
          set tabs to every radio button of tabGroup
          
          repeat with tab in tabs
            try
              -- Check all children for webview indicator
              -- Inactive tabs have 2 children, active tabs have 4
              -- The label area with webview is either child 1 (inactive) or child 2 (active)
              set tabChildren to every UI element of tab
              set isClaude to false
              
              repeat with tabChild in tabChildren
                try
                  set domClass to value of attribute "AXDOMClassList" of tabChild
                  repeat with className in domClass
                    if className contains "webview" then
                      set isClaude to true
                      exit repeat
                    end if
                  end repeat
                  if isClaude then exit repeat
                end try
              end repeat
              
              if isClaude then
                -- Get the tab name
                repeat with tabChild in tabChildren
                  repeat with gc in (every UI element of tabChild)
                    repeat with ggc in (every UI element of gc)
                      if (role of ggc) is "AXStaticText" then
                        set tabName to name of ggc
                        if tabName is not "" and tabName is not missing value then
                          set end of claudeSessions to tabName
                          exit repeat
                        end if
                      end if
                    end repeat
                  end repeat
                end repeat
              end if
            end try
          end repeat
        end try
      end repeat
      
      set AppleScript's text item delimiters to linefeed
      return claudeSessions as text
    on error errMsg
      return "ERROR: " & errMsg
    end try
  end tell
end tell
EOF
}

export -f vscode_get_main_area_path
export -f vscode_get_claude_sessions

# Get all active tab names (across all panes)
# Returns one name per line
vscode_get_active_tabs() {
    osascript <<'EOF'
tell application "System Events"
  tell process "Code"
    try
      set mainArea to UI element 2 of UI element 1 of UI element 2 of UI element 2 of UI element 1 of UI element 2 of UI element 2 of UI element 1 of group 1 of group 1 of group 1 of UI element 1 of group 1 of group 1 of group 1 of group 1 of window 1
      set topSection to UI element 1 of mainArea
      set partEditor to UI element 1 of topSection
      set gridView to UI element 1 of partEditor
      set splitView to UI element 1 of gridView
      set splitContainer to UI element 2 of splitView
      set panes to every UI element of splitContainer
      
      set activeTabs to {}
      
      repeat with pane in panes
        try
          set tabGroup to UI element 1 of UI element 1 of UI element 1 of pane
          set tabs to every radio button of tabGroup
          
          repeat with tab in tabs
            try
              -- Check if tab is active (value = 1)
              set tabValue to value of tab
              
              if tabValue = 1 then
                -- Get the tab name
                set tabChildren to every UI element of tab
                repeat with tabChild in tabChildren
                  repeat with gc in (every UI element of tabChild)
                    repeat with ggc in (every UI element of gc)
                      if (role of ggc) is "AXStaticText" then
                        set tabName to name of ggc
                        if tabName is not "" and tabName is not missing value then
                          set end of activeTabs to tabName
                          exit repeat
                        end if
                      end if
                    end repeat
                  end repeat
                end repeat
              end if
            end try
          end repeat
        end try
      end repeat
      
      set AppleScript's text item delimiters to linefeed
      return activeTabs as text
    on error errMsg
      return "ERROR: " & errMsg
    end try
  end tell
end tell
EOF
}

export -f vscode_get_active_tabs

# Close a tab by name
# Usage: vscode_close_tab_by_name "TAB_NAME"
# Returns success or error message
vscode_close_tab_by_name() {
    local TAB_NAME="$1"
    
    if [ -z "$TAB_NAME" ]; then
        echo "ERROR: TAB_NAME required" >&2
        return 1
    fi
    
    osascript <<EOF
tell application "System Events"
  tell process "Code"
    try
      set mainArea to UI element 2 of UI element 1 of UI element 2 of UI element 2 of UI element 1 of UI element 2 of UI element 2 of UI element 1 of group 1 of group 1 of group 1 of UI element 1 of group 1 of group 1 of group 1 of group 1 of window 1
      set topSection to UI element 1 of mainArea
      set partEditor to UI element 1 of topSection
      set gridView to UI element 1 of partEditor
      set splitView to UI element 1 of gridView
      set splitContainer to UI element 2 of splitView
      set panes to every UI element of splitContainer
      
      -- Search through all panes for the tab
      repeat with pane in panes
        try
          set tabGroup to UI element 1 of UI element 1 of UI element 1 of pane
          set tabs to every radio button of tabGroup
          
          repeat with tab in tabs
            try
              -- Get the tab name
              set foundTab to false
              set tabChildren to every UI element of tab
              repeat with tabChild in tabChildren
                repeat with gc in (every UI element of tabChild)
                  repeat with ggc in (every UI element of gc)
                    if (role of ggc) is "AXStaticText" then
                      set tabName to name of ggc
                      if tabName is "${TAB_NAME}" then
                        set foundTab to true
                        exit repeat
                      end if
                    end if
                  end repeat
                  if foundTab then exit repeat
                end repeat
                if foundTab then exit repeat
              end repeat
              
              if foundTab then
                -- Found the tab! Now find and click the close button
                -- Close button is in a toolbar (AXToolbar) child of the tab
                repeat with tabChild in tabChildren
                  if (role of tabChild) is "AXToolbar" then
                    -- Found the toolbar, get the close button
                    set closeBtn to button 1 of tabChild
                    perform action "AXPress" of closeBtn
                    return "SUCCESS: Closed tab '${TAB_NAME}'"
                  end if
                end repeat
                
                return "ERROR: Found tab but no close button"
              end if
            end try
          end repeat
        end try
      end repeat
      
      return "ERROR: Tab '${TAB_NAME}' not found"
    on error errMsg
      return "ERROR: " & errMsg
    end try
  end tell
end tell
EOF
}

export -f vscode_close_tab_by_name
