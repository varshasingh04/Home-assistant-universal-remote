# Task 06: README & Submission

**Status:** COMPLETE

---

## What (Layman Explanation)

The README is a text file that explains the project to anyone who hasn't seen it — how to set it up, how the pieces connect, and how to modify it. It's a required deliverable and also what the assessor reads first. A clear README signals professional software practices.

---

## Why This Approach

- Write it last — after building, so it accurately reflects what was built, not what was planned.
- Keep it practical: setup steps → architecture explanation → how to extend.
- Include the entity IDs so the assessor can verify in Developer Tools.

---

## README.md Outline

```markdown
# Universal Remote — Home Assistant Dashboard

## Architecture

Three-layer design:
1. **State layer** (`input_select`, `input_boolean`, `input_number`) — holds device state
2. **Logic layer** (scripts + automations) — responds to state changes, simulates device behavior
3. **UI layer** (Lovelace dashboard) — reads state live, calls scripts on button press

All layers are decoupled: the UI never directly mutates state except through scripts.

## Setup

1. Install VirtualBox + import HA OS `.vdi`
2. Boot VM, open `http://homeassistant.local:8123`
3. SSH into HA: `ssh root@homeassistant.local -p 22222`
4. Copy `config/` files to `/config/` on the VM
5. Settings → System → Restart Home Assistant
6. Settings → Dashboards → Import `lovelace/remote_dashboard.yaml`

## Entity Reference

| Entity ID | Type | Purpose |
|-----------|------|---------|
| `input_select.active_source` | input_select | Which source is active |
| `input_boolean.tv_power` | input_boolean | TV on/off |
| `input_boolean.avr_power` | input_boolean | AVR on/off |
| `input_number.avr_volume` | input_number | AVR volume 0-100 |
| `binary_sensor.apple_tv_active` | template | True when Apple TV is active + TV on |
| `binary_sensor.chromecast_active` | template | True when Chromecast is active + TV on |
| `binary_sensor.play_station_5_active` | template | True when PS5 is active + TV on |
| `binary_sensor.fire_tv_stick_active` | template | True when Fire TV is active + TV on |

## How Source Switching Works

1. User presses source button on dashboard
2. Dashboard calls `script.select_source` with `source: "<name>"`
3. Script sets `input_select.active_source` to the chosen source
4. Script powers on TV + AVR if they were off
5. Template binary sensors recompute — active source sensor flips to `on`
6. Dashboard source buttons update highlight automatically (bound to binary sensors)
7. Header markdown card refreshes with new source name

## How to Extend

- **Add a source:** Add option to `input_select.active_source` options list + add a new `binary_sensor` template + add a button card to the dashboard.
- **Add a real device:** Replace `input_boolean.tv_power` with a real `switch.*` or `media_player.*` entity from an integration.
- **Add scenes:** Create HA scenes that set multiple entities at once (e.g., "Movie Mode" = dim lights + Apple TV + volume 40).
```

---

## Submission Checklist

- [ ] README.md written and accurate
- [ ] Screenshots:
  - [ ] VM running, HA accessible at port 8123
  - [ ] Main remote dashboard
  - [ ] Source buttons showing active state highlight
  - [ ] Debug view with entity states visible
  - [ ] Developer Tools → States showing entity values
- [ ] Screen recording:
  - [ ] Press each source button → show state update in debug view
  - [ ] Toggle TV power → show AVR follows
  - [ ] Volume up/down working
  - [ ] All 4 sources + TV + AVR visible
- [ ] Config files organized in `config/` folder
- [ ] Reply to recruiter email with README + screenshots + recording link
