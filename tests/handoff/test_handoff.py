"""Behavioural contract for bin/handoff.

Run: python3 -m unittest discover -s tests/handoff
Only `is_read_only` is touched in-process; everything else goes through the CLI.
"""
import importlib.util
import json
import os
import re
import subprocess
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from importlib.machinery import SourceFileLoader
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parents[2]
BIN = REPO / "bin" / "handoff"

HINT = "add a read-only check: and checked_at: to each claim, or run: handoff stamp <path>"
FENCE_RE = re.compile(r"(```handoff\n)(.*?)(\n```)", re.S)
HOLD_TEXT = "HOLD: re-confirm with the operator before starting"


def now_iso():
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


def load_module():
    loader = SourceFileLoader("handoff", str(BIN))
    spec = importlib.util.spec_from_loader("handoff", loader)
    mod = importlib.util.module_from_spec(spec)
    loader.exec_module(mod)
    return mod


def run(args, cwd=None, stdin=None, home=None):
    env = dict(os.environ)
    env.update({
        "GIT_AUTHOR_NAME": "T", "GIT_AUTHOR_EMAIL": "t@example.com",
        "GIT_COMMITTER_NAME": "T", "GIT_COMMITTER_EMAIL": "t@example.com",
        "GIT_CONFIG_GLOBAL": os.devnull, "GIT_CONFIG_SYSTEM": os.devnull,
    })
    if home:
        env["HOME"] = str(home)
    return subprocess.run(
        [sys.executable, str(BIN)] + [str(a) for a in args],
        cwd=str(cwd) if cwd else None, input=stdin,
        capture_output=True, text=True, env=env, timeout=60,
    )


def out(p):
    return p.stdout + p.stderr


def git(repo, *args):
    env = dict(os.environ)
    env.update({
        "GIT_AUTHOR_NAME": "T", "GIT_AUTHOR_EMAIL": "t@example.com",
        "GIT_COMMITTER_NAME": "T", "GIT_COMMITTER_EMAIL": "t@example.com",
        "GIT_CONFIG_GLOBAL": os.devnull, "GIT_CONFIG_SYSTEM": os.devnull,
    })
    return subprocess.run(["git", "-c", "commit.gpgsign=false", *args], cwd=str(repo),
                          capture_output=True, text=True, env=env, check=True)


def make_repo(root, readme="hello world\n"):
    root = Path(root)
    root.mkdir(parents=True, exist_ok=True)
    git(root, "init", "-q")
    (root / "README.md").write_text(readme)
    git(root, "add", "-A")
    git(root, "commit", "-q", "-m", "first")
    return root


def claim(cid="readme", check="cat README.md", observed="hello world", **kw):
    c = {"id": cid, "claim": f"claim {cid}", "check": check, "checked_at": now_iso()}
    if observed is not None:
        c["observed"] = observed
    c.update(kw)
    return {k: v for k, v in c.items() if v is not None}


def doc(claims=None, **kw):
    d = {"handoff": 1, "topic": "demo-topic", "written_at": now_iso(), "from": "ada"}
    d["state_as_of"] = [claim()] if claims is None else claims
    d.update(kw)
    return {k: v for k, v in d.items() if v is not Ellipsis}


def fence(d):
    return "```handoff\n" + yaml.safe_dump(d, sort_keys=False).rstrip("\n") + "\n```"


def write_handoff(repo, d=None, topic="demo-topic", prefix="# Title\n\nprose\n\n",
                  suffix="\n\n## Notes\nafter\n", raw_fence=None):
    p = Path(repo) / ".claude" / "wip" / topic / "index.md"
    p.parent.mkdir(parents=True, exist_ok=True)
    body = raw_fence if raw_fence is not None else fence(d if d is not None else doc())
    p.write_text(prefix + body + suffix)
    return p


def parse_fence(text):
    m = FENCE_RE.search(text)
    assert m, "no handoff fence found"
    return yaml.safe_load(m.group(2))


class IsReadOnlyTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.h = load_module()

    def test_rejects_mutating_or_compound_commands(self):
        for cmd in [
            "rm -rf x", "git push", "git checkout main", "gh pr merge 1",
            "gh api repos/x -X DELETE", "cat a; rm b", "cat a > b", "echo $(id)",
            "mother cancel 1", "mother peek 1 --watch", "a && b", "a || b",
            "cat `id`", "cat a &", "cat a\nrm b",
        ]:
            with self.subTest(cmd=cmd):
                self.assertFalse(self.h.is_read_only(cmd))

    def test_accepts_known_read_only_commands(self):
        for cmd in [
            "gh pr view 1 --json state -q .state", "git -C ~/x rev-parse HEAD",
            "mother list --format json | jq length", "nostromd --version",
            "git log -1 --format=%s", "cat README.md",
        ]:
            with self.subTest(cmd=cmd):
                self.assertTrue(self.h.is_read_only(cmd))


class Base(unittest.TestCase):
    def setUp(self):
        self._td = tempfile.TemporaryDirectory()
        self.addCleanup(self._td.cleanup)
        self.tmp = Path(self._td.name).resolve()
        self.repo = make_repo(self.tmp / "repo", readme="hello  world\n")

    def assertRefused(self, p, code, who=None):
        self.assertEqual(p.returncode, 1, out(p))
        pat = rf"REFUSED {code} " + (re.escape(who) if who is not None else r"\S+") + ":"
        self.assertRegex(p.stdout + p.stderr, pat)


class SourceHygieneTests(unittest.TestCase):
    def test_script_never_uses_shell_true(self):
        self.assertNotIn("shell=True", BIN.read_text())


class CliSurfaceTests(Base):
    def test_help_lists_every_subcommand(self):
        p = run(["--help"])
        self.assertEqual(p.returncode, 0)
        for sub in "template check stamp receive hook install-hook demo".split():
            self.assertIn(sub, p.stdout)

    def test_template_prints_parseable_handoff_block(self):
        p = run(["template", "my-topic"])
        self.assertEqual(p.returncode, 0, out(p))
        data = parse_fence(p.stdout)
        self.assertEqual(data["handoff"], 1)
        self.assertEqual(data.get("topic"), "my-topic")

    def test_check_accepts_valid_handoff(self):
        path = write_handoff(self.repo)
        p = run(["check", path], cwd=self.repo)
        self.assertEqual(p.returncode, 0, out(p))
        self.assertNotIn("REFUSED", out(p))

    def test_check_refuses_and_prints_refused_line(self):
        path = write_handoff(self.repo, doc(claims=[]))
        p = run(["check", path], cwd=self.repo)
        self.assertRefused(p, "no_claims")


class RefusalTests(Base):
    def receive(self, d=None, **kw):
        path = write_handoff(self.repo, d, **kw)
        return run(["receive", path], cwd=self.repo)

    def test_no_claims_when_state_as_of_absent(self):
        d = doc()
        del d["state_as_of"]
        self.assertRefused(self.receive(d), "no_claims")

    def test_no_claims_when_state_as_of_empty(self):
        self.assertRefused(self.receive(doc(claims=[])), "no_claims")

    def test_missing_check(self):
        c = claim(check=None)
        p = self.receive(doc([c]))
        self.assertRefused(p, "missing_check", "readme")
        self.assertIn(HINT, out(p))

    def test_missing_checked_at(self):
        c = claim(checked_at=None)
        self.assertRefused(self.receive(doc([c])), "missing_checked_at", "readme")

    def test_missing_baseline(self):
        c = claim(observed=None)
        self.assertRefused(self.receive(doc([c])), "missing_baseline", "readme")

    def test_expect_counts_as_baseline(self):
        c = claim(observed=None, expect="hello world")
        p = self.receive(doc([c]))
        self.assertEqual(p.returncode, 0, out(p))

    def test_not_read_only(self):
        c = claim(check="rm -rf /tmp/never")
        self.assertRefused(self.receive(doc([c])), "not_read_only", "readme")

    def test_shell_metacharacter_check_refused_and_never_executed(self):
        marker = self.tmp / "marker"
        c = claim(check=f"echo hi; touch {marker}", observed="hi")
        p = self.receive(doc([c]))
        self.assertRefused(p, "not_read_only", "readme")
        self.assertFalse(marker.exists())

    def test_duplicate_id(self):
        p = self.receive(doc([claim("a"), claim("a")]))
        self.assertRefused(p, "duplicate_id", "a")

    def test_missing_id_names_claim_index(self):
        c = claim()
        del c["id"]
        p = self.receive(doc([claim("a"), c]))
        self.assertRefused(p, "missing_id", "1")

    def test_unknown_claim_in_depends_on(self):
        d = doc(next_actions=[{"id": "n1", "action": "do it", "owner": "x", "depends_on": ["ghost"]}])
        self.assertRefused(self.receive(d), "unknown_claim")

    def test_bad_handoff_version(self):
        d = doc()
        d["handoff"] = 2
        self.assertEqual(self.receive(d).returncode, 1)

    def test_missing_handoff_version(self):
        d = doc()
        del d["handoff"]
        self.assertEqual(self.receive(d).returncode, 1)

    def test_bad_topic(self):
        for topic in ["Bad Topic", "-lead", "x" * 49, "UP"]:
            with self.subTest(topic=topic):
                d = doc()
                d["topic"] = topic
                p = self.receive(d)
                self.assertEqual(p.returncode, 1, out(p))
                self.assertIn("REFUSED", out(p))

    def test_bad_written_at(self):
        for val in ["yesterday", "2026-01-01T10:00:00"]:  # second has no offset
            with self.subTest(val=val):
                d = doc()
                d["written_at"] = val
                p = self.receive(d)
                self.assertEqual(p.returncode, 1, out(p))
                self.assertIn("REFUSED", out(p))

    def test_yaml_parse_error(self):
        raw = "```handoff\nhandoff: 1\n  : [unclosed\n  bad: {\n```"
        p = self.receive(raw_fence=raw)
        self.assertEqual(p.returncode, 1, out(p))
        self.assertIn("REFUSED", out(p))

    def test_all_refusals_reported_not_just_first(self):
        p = self.receive(doc([claim("a", check=None), claim("b", checked_at=None),
                              claim("c", check="rm x")]))
        self.assertEqual(p.returncode, 1)
        t = out(p)
        self.assertIn("REFUSED missing_check a:", t)
        self.assertIn("REFUSED missing_checked_at b:", t)
        self.assertIn("REFUSED not_read_only c:", t)
        self.assertIn(HINT, t)


class ReceiveTests(Base):
    def test_unchanged_exits_zero_with_receipt(self):
        d = doc(constraints=["no force pushes"], not_verified=["is the deploy done"],
                artifacts=[{"path": "README.md", "role": "readme"},
                           {"path": "nope/missing.txt", "role": "gone"},
                           {"url": "https://example.com/x", "role": "ref"}])
        path = write_handoff(self.repo, d)
        p = run(["receive", path], cwd=self.repo)
        self.assertEqual(p.returncode, 0, out(p))
        t = p.stdout
        self.assertRegex(t, r"Handoff demo-topic written \S+ by ada")
        self.assertIn("unchanged", t)
        self.assertIn("State as of", t)
        self.assertIn("no force pushes", t)
        self.assertIn("is the deploy done", t)
        self.assertIn("reachable", t)
        self.assertIn("MISSING", t)
        self.assertIn("https://example.com/x (ref): not checked (url)", t)
        self.assertNotIn(HOLD_TEXT, t)

    def test_minimal_handoff_without_optional_fields_still_accepted(self):
        path = write_handoff(self.repo, doc())
        self.assertEqual(run(["receive", path], cwd=self.repo).returncode, 0)

    def test_comparison_is_whitespace_normalised(self):
        # README is "hello  world\n"; observed has single space
        path = write_handoff(self.repo, doc([claim(observed="hello world")]))
        p = run(["receive", path], cwd=self.repo)
        self.assertEqual(p.returncode, 0, out(p))

    def test_expect_is_compared_like_observed(self):
        c = claim(observed=None, expect="something else")
        path = write_handoff(self.repo, doc([c]))
        p = run(["receive", path], cwd=self.repo)
        self.assertEqual(p.returncode, 3, out(p))
        self.assertIn("changed", p.stdout)

    def test_changed_claim_exits_3_and_holds_dependent_actions(self):
        claims = [claim("stale", observed="goodbye"), claim("fine", observed="hello world")]
        actions = [
            {"id": "n1", "action": "ship-the-stale-thing", "owner": "cody", "depends_on": ["stale"]},
            {"id": "n2", "action": "do-the-fine-thing", "owner": "cody", "depends_on": ["fine"]},
        ]
        path = write_handoff(self.repo, doc(claims, next_actions=actions))
        p = run(["receive", path], cwd=self.repo)
        self.assertEqual(p.returncode, 3, out(p))
        t = p.stdout
        self.assertIn("changed", t)
        self.assertIn("goodbye", t)
        self.assertIn("hello", t)
        self.assertIn("Held actions", t)
        self.assertIn("ship-the-stale-thing", t)
        self.assertEqual(t.count(HOLD_TEXT), 1)

    def test_could_not_verify_on_nonzero_exit(self):
        c = claim(check="cat does-not-exist.txt", observed="x")
        actions = [{"id": "n1", "action": "act-on-unknown", "owner": "c", "depends_on": ["readme"]}]
        path = write_handoff(self.repo, doc([c], next_actions=actions))
        p = run(["receive", path], cwd=self.repo)
        self.assertEqual(p.returncode, 3, out(p))
        self.assertIn("could not verify", p.stdout)
        self.assertIn(HOLD_TEXT, p.stdout)

    def test_could_not_verify_on_bad_cwd(self):
        c = claim(cwd="no/such/dir")
        path = write_handoff(self.repo, doc([c]))
        p = run(["receive", path], cwd=self.repo)
        self.assertEqual(p.returncode, 3, out(p))
        self.assertIn("could not verify", p.stdout)

    def test_claim_cwd_overrides_default_repo_root(self):
        other = make_repo(self.tmp / "other", readme="other content\n")
        c = claim(cwd=str(other), observed="other content")
        path = write_handoff(self.repo, doc([c]))
        p = run(["receive", path], cwd=self.tmp)
        self.assertEqual(p.returncode, 0, out(p))

    def test_default_cwd_is_repo_root_not_process_cwd(self):
        path = write_handoff(self.repo, doc())
        p = run(["receive", path], cwd=self.tmp)
        self.assertEqual(p.returncode, 0, out(p))

    def test_path_resolution_file_dir_and_slug(self):
        path = write_handoff(self.repo, doc())
        for arg, cwd in [(path, self.tmp), (path.parent, self.tmp), ("demo-topic", self.repo)]:
            with self.subTest(arg=str(arg)):
                p = run(["receive", arg], cwd=cwd)
                self.assertEqual(p.returncode, 0, out(p))

    def test_missing_file_is_usage_error(self):
        p = run(["receive", "no-such-topic"], cwd=self.repo)
        self.assertEqual(p.returncode, 2, out(p))

    def test_receive_without_record_does_not_modify_file(self):
        path = write_handoff(self.repo, doc())
        before = path.read_bytes()
        run(["receive", path], cwd=self.repo)
        self.assertEqual(path.read_bytes(), before)


class RecordTests(Base):
    LINE = r"- \d\d:\d\d handoff received: (\d+) unchanged, (\d+) changed, (\d+) unverified"

    def test_record_appends_exactly_one_line_under_existing_log(self):
        path = write_handoff(self.repo, doc(), suffix="\n\n## Log\n- 09:00 earlier entry\n")
        before = path.read_text()
        p = run(["receive", path, "--record"], cwd=self.repo)
        self.assertEqual(p.returncode, 0, out(p))
        after = path.read_text()
        self.assertTrue(after.startswith(before))
        tail = after[len(before):]
        self.assertRegex(tail, rf"^{self.LINE}\n?$")
        self.assertEqual(re.match(self.LINE, tail).groups(), ("1", "0", "0"))

    def test_record_creates_log_heading_when_absent(self):
        path = write_handoff(self.repo, doc())
        before = path.read_text()
        run(["receive", path, "--record"], cwd=self.repo)
        after = path.read_text()
        self.assertTrue(after.startswith(before.rstrip("\n")))
        tail = after[len(before.rstrip("\n")):]
        self.assertRegex(tail, r"\n## Log\n")
        self.assertEqual(len(re.findall(self.LINE, after)), 1)
        # fence untouched
        self.assertEqual(parse_fence(after), parse_fence(before))

    def test_record_counts_drift(self):
        claims = [claim("a", observed="nope"), claim("b", check="cat missing.txt", observed="x"),
                  claim("c")]
        path = write_handoff(self.repo, doc(claims))
        p = run(["receive", path, "--record"], cwd=self.repo)
        self.assertEqual(p.returncode, 3, out(p))
        m = re.search(self.LINE, path.read_text())
        self.assertEqual(m.groups(), ("1", "1", "1"))

    def test_refused_handoff_is_not_recorded(self):
        path = write_handoff(self.repo, doc(claims=[]))
        before = path.read_bytes()
        p = run(["receive", path, "--record"], cwd=self.repo)
        self.assertEqual(p.returncode, 1)
        self.assertEqual(path.read_bytes(), before)


class StampTests(Base):
    def test_stamp_writes_observed_and_checked_at_and_preserves_surroundings(self):
        prefix = "# Title  \n\nsome prose with trailing spaces   \n\n"
        suffix = "\n\n## Notes\nno trailing newline"
        c = {"id": "readme", "claim": "readme says hi", "check": "cat README.md"}
        d = doc([c])
        path = write_handoff(self.repo, d, prefix=prefix, suffix=suffix)
        p = run(["stamp", path], cwd=self.repo)
        self.assertEqual(p.returncode, 0, out(p))
        after = path.read_text()
        self.assertTrue(after.startswith(prefix))
        self.assertTrue(after.endswith(suffix))
        stamped = parse_fence(after)["state_as_of"][0]
        self.assertEqual(" ".join(str(stamped["observed"]).split()), "hello world")
        self.assertTrue(stamped.get("checked_at"))
        self.assertEqual(run(["receive", path], cwd=self.repo).returncode, 0)

    def test_stamp_replaces_expect_with_observed(self):
        c = {"id": "readme", "claim": "x", "check": "cat README.md", "expect": "old guess"}
        path = write_handoff(self.repo, doc([c]))
        p = run(["stamp", path], cwd=self.repo)
        self.assertEqual(p.returncode, 0, out(p))
        stamped = parse_fence(path.read_text())["state_as_of"][0]
        self.assertNotIn("expect", stamped)
        self.assertIn("observed", stamped)

    def test_stamp_errored_check_leaves_claim_and_exits_1(self):
        c = {"id": "broken", "claim": "x", "check": "cat does-not-exist.txt"}
        path = write_handoff(self.repo, doc([c]))
        before = path.read_bytes()
        p = run(["stamp", path], cwd=self.repo)
        self.assertEqual(p.returncode, 1, out(p))
        self.assertIn("broken", out(p))
        self.assertEqual(path.read_bytes(), before)

    def test_stamp_still_refuses_non_read_only_checks(self):
        c = {"id": "bad", "claim": "x", "check": "rm -rf /tmp/never"}
        path = write_handoff(self.repo, doc([c]))
        before = path.read_bytes()
        p = run(["stamp", path], cwd=self.repo)
        self.assertRefused(p, "not_read_only", "bad")
        self.assertEqual(path.read_bytes(), before)

    def test_stamp_still_refuses_missing_check(self):
        c = {"id": "nocheck", "claim": "x"}
        path = write_handoff(self.repo, doc([c]))
        self.assertRefused(run(["stamp", path], cwd=self.repo), "missing_check", "nocheck")


class HookTests(Base):
    def hook(self, prompt, cwd=None):
        return run(["hook"], cwd=self.tmp, stdin=json.dumps({"prompt": prompt, "cwd": str(cwd or self.repo)}))

    def test_non_handoff_prompts_produce_no_output(self):
        for prompt in ["hello there", "please handoff: demo-topic", "handoff: two words",
                       "intro\nhandoff: demo-topic", ""]:
            with self.subTest(prompt=prompt):
                write_handoff(self.repo, doc())
                p = self.hook(prompt)
                self.assertEqual(p.returncode, 0, out(p))
                self.assertEqual(p.stdout.strip(), "")

    def test_accepted_handoff_injects_receipt_and_six_obligations(self):
        actions = [{"id": "n1", "action": "held-action", "owner": "c", "depends_on": ["readme"]}]
        path = write_handoff(self.repo, doc([claim(observed="drifted")], next_actions=actions))
        p = self.hook("\n\nhandoff: demo-topic\nplus more text")
        self.assertEqual(p.returncode, 0, out(p))
        data = json.loads(p.stdout)
        spec = data["hookSpecificOutput"]
        self.assertEqual(spec["hookEventName"], "UserPromptSubmit")
        ctx = spec["additionalContext"]
        self.assertIn("Handoff demo-topic written", ctx)
        self.assertIn("HOLD", ctx)
        self.assertIn("held-action", ctx)
        for n in range(1, 7):
            self.assertIn(f"({n})", ctx)
        self.assertNotIn("decision", data)
        self.assertRegex(path.read_text(), r"- \d\d:\d\d handoff received: 0 unchanged, 1 changed, 0 unverified")

    def test_clean_handoff_is_also_accepted_and_recorded(self):
        path = write_handoff(self.repo, doc())
        p = self.hook("handoff: demo-topic")
        self.assertEqual(p.returncode, 0, out(p))
        ctx = json.loads(p.stdout)["hookSpecificOutput"]["additionalContext"]
        self.assertIn("Handoff demo-topic written", ctx)
        self.assertEqual(len(re.findall(r"handoff received: 1 unchanged", path.read_text())), 1)

    def test_refused_handoff_blocks_with_reason(self):
        write_handoff(self.repo, doc([claim(check=None)]))
        p = self.hook("handoff: demo-topic")
        self.assertEqual(p.returncode, 0, out(p))
        data = json.loads(p.stdout)
        self.assertEqual(data["decision"], "block")
        self.assertIn("REFUSED missing_check readme", data["reason"])

    def test_missing_file_blocks_naming_resolved_path(self):
        p = self.hook("handoff: nosuch")
        self.assertEqual(p.returncode, 0, out(p))
        data = json.loads(p.stdout)
        self.assertEqual(data["decision"], "block")
        self.assertIn(os.path.join(".claude", "wip", "nosuch", "index.md"), data["reason"])
        self.assertIn(str(self.repo.name), data["reason"])


class InstallHookTests(Base):
    CMD = {"type": "command", "command": "~/.claude/bin/handoff hook", "timeout": 60}

    def settings(self):
        return self.tmp / "settings.json"

    def entry_hooks(self, data):
        entries = [e for e in data["hooks"]["UserPromptSubmit"] if e.get("matcher") == ""]
        self.assertEqual(len(entries), 1)
        return entries[0]["hooks"]

    def test_creates_settings_with_hook(self):
        s = self.settings()
        p = run(["install-hook", "--settings", s])
        self.assertEqual(p.returncode, 0, out(p))
        data = json.loads(s.read_text())
        self.assertEqual(self.entry_hooks(data), [self.CMD])

    def test_idempotent_and_preserves_other_content(self):
        s = self.settings()
        other = {"type": "command", "command": "echo other"}
        s.write_text(json.dumps({
            "theme": "dark",
            "hooks": {"UserPromptSubmit": [{"matcher": "", "hooks": [other]}],
                      "Stop": [{"hooks": [other]}]},
        }, indent=2))
        run(["install-hook", "--settings", s])
        run(["install-hook", "--settings", s])
        data = json.loads(s.read_text())
        self.assertEqual(data["theme"], "dark")
        self.assertEqual(data["hooks"]["Stop"], [{"hooks": [other]}])
        hooks = self.entry_hooks(data)
        self.assertEqual(hooks.count(self.CMD), 1)
        self.assertIn(other, hooks)

    def test_two_runs_yield_one_copy_from_scratch(self):
        s = self.settings()
        run(["install-hook", "--settings", s])
        run(["install-hook", "--settings", s])
        self.assertEqual(self.entry_hooks(json.loads(s.read_text())), [self.CMD])

    def test_output_is_two_space_indented_json(self):
        s = self.settings()
        run(["install-hook", "--settings", s])
        text = s.read_text()
        self.assertEqual(text.rstrip("\n"), json.dumps(json.loads(text), indent=2))

    def test_dry_run_prints_and_does_not_write(self):
        s = self.settings()
        p = run(["install-hook", "--settings", s, "--dry-run"])
        self.assertEqual(p.returncode, 0, out(p))
        self.assertFalse(s.exists())
        self.assertIn("handoff hook", p.stdout)

        s.write_text('{"a": 1}')
        run(["install-hook", "--settings", s, "--dry-run"])
        self.assertEqual(s.read_text(), '{"a": 1}')


class DemoTests(Base):
    def test_demo_refuses_non_empty_dir(self):
        d = self.tmp / "occupied"
        d.mkdir()
        (d / "f").write_text("x")
        p = run(["demo", d])
        self.assertNotEqual(p.returncode, 0)
        self.assertEqual((d / "f").read_text(), "x")

    def test_demo_end_to_end_refusal_then_drift(self):
        d = self.tmp / "demo"
        p = run(["demo", d])
        self.assertEqual(p.returncode, 0, out(p))
        self.assertTrue((d / ".git").exists())
        path = d / ".claude" / "wip" / "handoff-demo" / "index.md"
        self.assertTrue(path.exists())
        ids = [c["id"] for c in parse_fence(path.read_text())["state_as_of"]]
        for want in ("head", "readme", "pr-389"):
            self.assertIn(want, ids)

        p = run(["receive", "handoff-demo"], cwd=d)
        self.assertEqual(p.returncode, 1, out(p))
        self.assertIn("REFUSED missing_check pr-389", out(p))

        subject = git(d, "log", "-1", "--format=%s").stdout.strip()
        text = path.read_text()
        data = parse_fence(text)
        for c in data["state_as_of"]:
            if c["id"] == "pr-389":
                c["check"] = "git log -1 --format=%s"
                c["expect"] = subject
                c["checked_at"] = now_iso()
        new_fence = yaml.safe_dump(data, sort_keys=False).rstrip("\n")
        path.write_text(FENCE_RE.sub(lambda m: m.group(1) + new_fence + m.group(3), text, count=1))

        p = run(["receive", "handoff-demo"], cwd=d)
        self.assertEqual(p.returncode, 3, out(p))
        t = p.stdout
        head_line = next((l for l in t.splitlines() if "head" in l and "changed" in l), None)
        self.assertIsNotNone(head_line, t)


if __name__ == "__main__":
    unittest.main()
