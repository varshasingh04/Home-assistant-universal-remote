# Universal Remote — Home Assistant Dashboard

A mock universal remote dashboard built on Home Assistant OS running in VirtualBox.
Demonstrates entity modeling, state-driven UI, and automation logic without real hardware.

---

## Architecture

Three decoupled layers:

```
┌─────────────────────────────────────────────────────────┐
│  UI Layer (Lovelace)                                    │
│  lovelace/remote_dashboard.yaml                         │
│  • Reads entity state live (no polling needed)          │
│  • Calls scripts on button press                        │
│  • Highlights active source via binary_sensor binding   │
└────────────────────┬────────────────────────────────────┘
                     │ service calls
┌────────────────────▼────────────────────────────────────┐
│  Logic Layer (Scripts + Automations)                    │
│  scripts.yaml + automations.yaml                        │
│  • select_source: sets source, auto-powers on TV + AVR  │
│  • volume_up / volume_down: clamp to 0–100              │
│  • power_off_all: turns off TV and AVR                  │
│  • AVR follows TV on/off (automation)                   │
└────────────────────┬────────────────────────────────────┘
                     │ state reads/writes
┌────────────────────▼────────────────────────────────────┐
│  State Layer (Input Helpers + Templates)                │
│  input_select.yaml / input_boolean.yaml                 │
│  input_number.yaml / template.yaml                      │
│  • input_select.active_source  (Apple TV | Chromecast   │
│                                  | PlayStation 5        │
│                                  | Fire TV Stick)       │
│  • input_boolean.tv_power / avr_power                   │
│  • input_number.avr_volume  (0–100, step 5)             │
│  • binary_sensor.*_active  (derived: source == X AND    │
│                              tv_power == on)            │
└─────────────────────────────────────────────────────────┘
```

The UI never writes state directly — every button press goes through a script, which
guarantees the state machine is the single source of truth.

---

## Entity Reference

| Entity ID | Type | Purpose |
|-----------|------|---------|
| `input_select.active_source` | input_select | Which source is currently selected |
| `input_boolean.tv_power` | input_boolean | TV on/off |
| `input_boolean.avr_power` | input_boolean | AVR on/off |
| `input_number.avr_volume` | input_number | AVR volume 0–100 (step 5) |
| `sensor.active_source_label` | template sensor | Mirror of active_source (for history) |
| `binary_sensor.apple_tv_active` | template binary | ON when Apple TV selected + TV on |
| `binary_sensor.chromecast_active` | template binary | ON when Chromecast selected + TV on |
| `binary_sensor.playstation_5_active` | template binary | ON when PS5 selected + TV on |
| `binary_sensor.fire_tv_stick_active` | template binary | ON when Fire TV selected + TV on |

---

## How Source Switching Works (end-to-end)

1. User taps a source button on the dashboard (e.g. "Apple TV")
2. Dashboard calls `script.select_source` with `data: {source: "Apple TV"}`
3. Script sets `input_select.active_source` → "Apple TV"
4. Script turns on `input_boolean.tv_power` + `input_boolean.avr_power` if they were off
5. `binary_sensor.apple_tv_active` template evaluates → `on` (source matches + TV on)
6. Apple TV button card highlights automatically (bound to that binary_sensor)
7. Header markdown card re-renders with new source name + power states
8. Debug view logbook records the state-change with a timestamp

---

## VM Setup

### Requirements
- VirtualBox 7.x
- Home Assistant OS `.vdi` image from [home-assistant.io/installation/windows](https://www.home-assistant.io/installation/windows)

### VM Settings
```
Name:         HomeAssistant
Type:         Linux
Version:      Linux 2.6 / 3.x / 4.x (64-bit)
RAM:          2048 MB
CPU:          2 cores
Hard disk:    Use existing VDI — select downloaded .vdi
Network:      Bridged Adapter → your active WiFi/Ethernet
```

### First Boot
1. Start VM — first boot takes ~10 minutes (HA downloads updates)
2. Open `http://homeassistant.local:8123` in host browser
3. Complete onboarding wizard (create admin account)

---

## Deploying Config Files

```bash
# SSH into HA OS (port 22222, not 22)
ssh root@homeassistant.local -p 22222

# Copy config files from this repo to the HA config directory
# (run from project root on host, or use HA Samba share)
scp -P 22222 -r config/* root@homeassistant.local:/config/

# Reload HA config (no full restart needed)
ha core reload
```

Alternatively via the UI: **Developer Tools → YAML → Reload All YAML**.

The `lovelace/universal-remote` dashboard appears automatically in the sidebar
because `configuration.yaml` registers it via the `lovelace.dashboards` key.

---

## How to Extend

- **Add a source:** Add option to `input_select.yaml`, add a `binary_sensor` template in `template.yaml`, add a button card in `remote_dashboard.yaml`.
- **Replace mock with real device:** Swap `input_boolean.tv_power` with a real `switch.*` or `media_player.*` entity from an integration — scripts and dashboard need no changes because entity IDs stay the same.
- **Add scenes:** Create HA scenes (Settings → Scenes) that set multiple entities at once — e.g., "Movie Mode" = Apple TV + volume 45 + dim lights.

---

## File Structure

```
config/
├── configuration.yaml      # Main entry point — includes all sub-files
├── input_select.yaml       # Source selector (4 options)
├── input_boolean.yaml      # TV + AVR power switches
├── input_number.yaml       # AVR volume (0–100)
├── template.yaml           # Derived binary sensors per source
├── scripts.yaml            # select_source, volume_up/down, power_off_all
├── automations.yaml        # AVR follows TV on/off; source-change logbook entry
└── lovelace/
    └── remote_dashboard.yaml   # Both dashboard views: Remote Control + Debug
```
