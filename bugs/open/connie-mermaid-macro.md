# Bug: Connie writes Mermaid as code fences instead of Confluence macro

**Filed:** 2026-05-19
**Severity:** Medium
**Component:** Connie agent (Confluence)
**Reporter:** Hammer
**Status:** inbox

## Description

When creating Confluence pages that include Mermaid diagrams, Connie writes
them as Markdown code fences (` ```mermaid ... ``` `) rather than using the
Confluence Mermaid macro (`<ac:structured-macro ac:name="mermaid">`).

The Mermaid plugin IS installed in our Confluence instance. The diagrams
render as raw code blocks instead of actual diagrams.

## Steps to reproduce

Ask Connie to create a Confluence page with a Mermaid diagram in the content.

## Expected

Diagrams render as actual Mermaid flowcharts using the installed plugin's macro.

## Actual

Diagrams appear as monospaced code blocks with the raw Mermaid syntax visible.

## Fix direction

Connie's prompt / instructions should note:
- Confluence uses `<ac:structured-macro>` format for diagrams, not Markdown code fences
- Mermaid plugin macro name to use (TBD — investigate per instance)
- When writing pages with diagrams, use the storage-format macro, not ` ```mermaid ``` `

## Root cause (confirmed 2026-05-19)

Connie used `<ac:parameter ac:name="diagram">` to store the diagram source.
This truncates multiline content — only the first line survives.

## Correct format

Mermaid content must go in `ac:plain-text-body` with CDATA:

```xml
<ac:structured-macro ac:name="mermaid" ac:schema-version="1">
  <ac:plain-text-body><![CDATA[flowchart LR
  ...full diagram here...
  ]]></ac:plain-text-body>
</ac:structured-macro>
```

## Fix applied

Page 1215528964 updated to version 3 with correct format. Both diagrams
restored and rendering. Jira ticket placeholders also replaced with live
Jira macros in the same update.
