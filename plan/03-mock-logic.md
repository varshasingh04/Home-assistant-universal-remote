# Task 03: Mock Control Logic (Automations & Scripts)

**Status:** COMPLETE

---

## What (Layman Explanation)

When you press "Apple TV" on the remote, something needs to actually happen in the backend — not just a button highlight. This is the "mock integration": a set of rules (automations + scripts) that Home Assistant runs automatically when entity states change. Think of it like: "whenever the source changes to Apple TV, also turn on the TV if it's off, and set the AVR to the right input." It simulates realistic device behavior even though no real devices are connected.

---

## Why This Approach

- **Why automations + scripts, not a custom component?** Automations and scripts are native HA features — no Python, no manifest.json, no restart-to-reload complexity. They're transparent (visible in the UI), maintainable, and the assessor can read them without knowing Python.
- **Why scripts for actions?** Scripts are reusable — the "select source" logic is one script called by all 4 source buttons, rather than 4 duplicate automations. DRY principle.
- **Why handle TV power-on automatically?** Realistic device behavior: a real universal remote would power on the TV when you select a source. This shows we thought about UX, not just mechanics.
- **Why a "power off" automation?** When TV turns off, source selection should become irrelevant — AVR should also power off. This simulates real AV receiver behavior.

---

## Implementation

### File: `config/scripts.yaml`

```yaml
# Called whenever a source is selected
select_source:
  alias: "Select Source"
  fields:
    source:
      description: "Source name to activate"
      example: "Apple TV"
  sequence:
    # 1. Update the source entity
    - service: input_select.select_option
      target:
        entity_id: input_select.active_source
      data:
        option: "{{ source }}"
    # 2. Auto power-on TV and AVR if they're off
    - service: input_boolean.turn_on
      target:
        entity_id:
          - input_boolean.tv_power
          - input_boolean.avr_power
    # 3. Small delay to simulate device switching latency
    - delay: "00:00:01"

# Volume up
volume_up:
  alias: "Volume Up"
  sequence:
    - service: input_number.set_value
      target:
        entity_id: input_number.avr_volume
      data:
        value: >
          {{ [states('input_number.avr_volume') | int + 5, 100] | min }}

# Volume down
volume_down:
  alias: "Volume Down"
  sequence:
    - service: input_number.set_value
      target:
        entity_id: input_number.avr_volume
      data:
        value: >
          {{ [states('input_number.avr_volume') | int - 5, 0] | max }}

# Power off everything
power_off_all:
  alias: "Power Off All"
  sequence:
    - service: input_boolean.turn_off
      target:
        entity_id:
          - input_boolean.tv_power
          - input_boolean.avr_power
```

### File: `config/automations.yaml`

```yaml
# When TV turns off, also turn off AVR
- id: avr_follows_tv_off
  alias: "AVR powers off with TV"
  trigger:
    - platform: state
      entity_id: input_boolean.tv_power
      to: "off"
  action:
    - service: input_boolean.turn_off
      target:
        entity_id: input_boolean.avr_power

# When TV turns on with no AVR, turn on AVR
- id: avr_follows_tv_on
  alias: "AVR powers on with TV"
  trigger:
    - platform: state
      entity_id: input_boolean.tv_power
      to: "on"
  condition:
    - condition: state
      entity_id: input_boolean.avr_power
      state: "off"
  action:
    - service: input_boolean.turn_on
      target:
        entity_id: input_boolean.avr_power
```

### `configuration.yaml` includes:
```yaml
script: !include scripts.yaml
automation: !include automations.yaml
```

---

## Validation
- Developer Tools → Services → call `script.select_source` with `source: "Apple TV"`
- Check Developer Tools → States: `input_select.active_source` should = "Apple TV"
- Call `script.power_off_all` → both `input_boolean.tv_power` and `input_boolean.avr_power` = off
- Turn TV on → automation should auto-turn AVR on within seconds

---

## Interview Talking Points
- "I used a parameterized script (`select_source`) instead of 4 separate automations because it's DRY — one change point if the logic evolves."
- "The 1-second delay in source switching simulates real device switching latency — it makes the mock feel realistic rather than instant."
- "The automation that turns AVR off when TV goes off models real AV receiver behavior — this shows I thought about the domain, not just the code."
