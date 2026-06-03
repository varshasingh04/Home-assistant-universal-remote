# Task 02: Entity Modeling (TV, AVR, 4 Sources)

**Status:** COMPLETE

---

## What (Layman Explanation)

In Home Assistant, everything is an "entity" — a named thing with a state. Think of it like variables: `tv_power = ON`, `active_source = Apple TV`, `avr_volume = 45`. We define these entities in YAML config files. The dashboard and automations then read and write these entities. The key rule: **every button press must change a real entity state**, not just change button color.

---

## Why This Approach

- **Why `input_select` for source?** It's a built-in HA helper that holds one value from a list. Perfect for "which of the 4 sources is active." No custom code needed.
- **Why `input_boolean` for power?** Simplest on/off entity. Maps cleanly to a toggle card in the UI.
- **Why `input_number` for volume?** Gives us a 0–100 range with step control. Works with slider cards natively.
- **Why NOT `media_player` entities?** Real `media_player` entities require an actual device integration. Since we're mocking, `input_*` helpers are honest about being simulated — and the assessor can see we understand the distinction.
- **Why template sensors?** To derive computed state (e.g., "is Apple TV the active source?") without duplicating logic in every automation.

---

## Entity Definitions

### File: `config/input_select.yaml`
```yaml
active_source:
  name: Active Source
  options:
    - Apple TV
    - Chromecast
    - PlayStation 5
    - Fire TV Stick
  initial: Apple TV
  icon: mdi:remote-tv
```

### File: `config/input_boolean.yaml`
```yaml
tv_power:
  name: TV Power
  icon: mdi:television

avr_power:
  name: AVR Power
  icon: mdi:speaker
```

### File: `config/input_number.yaml`
```yaml
avr_volume:
  name: AVR Volume
  min: 0
  max: 100
  step: 5
  unit_of_measurement: "%"
  icon: mdi:volume-high
  mode: slider
```

### File: `config/template.yaml`
```yaml
- sensor:
    - name: "Active Source Label"
      state: "{{ states('input_select.active_source') }}"
      icon: mdi:television-play

- binary_sensor:
    - name: "Apple TV Active"
      state: "{{ is_state('input_select.active_source', 'Apple TV') and is_state('input_boolean.tv_power', 'on') }}"
    - name: "Chromecast Active"
      state: "{{ is_state('input_select.active_source', 'Chromecast') and is_state('input_boolean.tv_power', 'on') }}"
    - name: "PlayStation 5 Active"
      state: "{{ is_state('input_select.active_source', 'PlayStation 5') and is_state('input_boolean.tv_power', 'on') }}"
    - name: "Fire TV Stick Active"
      state: "{{ is_state('input_select.active_source', 'Fire TV Stick') and is_state('input_boolean.tv_power', 'on') }}"
```

### `configuration.yaml` includes:
```yaml
input_select: !include input_select.yaml
input_boolean: !include input_boolean.yaml
input_number: !include input_number.yaml
template: !include template.yaml
```

---

## Validation
- Developer Tools → States → search `input_select.active_source` — should show current source
- Change source from Developer Tools → States should update immediately
- Template sensors should reflect the new state within 1 second

---

## Interview Talking Points
- "I separated entities into `input_select`, `input_boolean`, and `input_number` because each models a different data shape — enumerable choice, binary flag, and numeric range respectively."
- "Template binary sensors let the dashboard know 'is Apple TV currently the active AND powered-on source' without repeating that logic in 4 different places."
- "Using `input_*` helpers instead of fake `media_player` entities is more honest — it's explicit that this is a mock, while still exercising HA's real state machine."
