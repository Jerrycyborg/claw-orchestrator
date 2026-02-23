# Research Summary

## Goal
Validate best path for making claw-orchestrator easy to install and auto-trigger in OpenClaw sessions.

## Findings
- OpenClaw supports skill auto-trigger through skill metadata + descriptions.
- For real-world reliability, least-privilege and guardrails should stay on by default.
- Users need one-step setup; no repeated CLI complexity.

## Applied changes
- Added chat-friendly `auto --summary` output mode.
- Added install script to register local skill.
- Added dedicated skill package in this repo for auto-trigger behavior.
