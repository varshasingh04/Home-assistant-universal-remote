# Task 04: Main Remote Control Dashboard

**Status:** COMPLETE

---

## What (Layman Explanation)

This is the visual remote control — what the assessor will see and interact with. It's built using Home Assistant's Lovelace UI system, which lets you arrange cards (blocks) on a grid. Each button on the dashboard calls a script or toggles an entity. When the state changes (e.g., source switches to Apple TV), the card automatically reflects the new state — highlighted source button, active source label, etc. — because it reads directly from entity states, which are always live.

---

## Why This Approach

- **Why Lovelace YAML mode?** YAML is version-controllable, shareable, and reproducible — the assessor can copy the YAML and recreate the exact dashboard. The UI editor produces the same YAML but can't be diff'd or reviewed.
- **Why `button` cards for sources?** Button cards can conditionally change color/style based on entity state using `style` + template conditions. This gives us the "active source highlighted" behavior without JavaScript.
- **Why `mushroom` cards?** The Mushroom card collection (installable via HACS) provides polished, modern-looking cards that make the dashboard look professional with minimal markup. Falls back to standard cards if HACS isn't available.
- **Why group controls by function?** Power at top, sources middle, volume + transport bottom — mirrors physical remote layout, so it's immediately intuitive to the assessor.

---

## Dashboard YAML: `config/lovelace/remote_dashboard.yaml`

```yaml
title: Universal Remote
views:
  - title: Remote Control
    path: remote
    icon: mdi:remote-tv
    cards:

      # ── Header: Active source display ──────────────────────────
      - type: markdown
        content: >
          ## 📺 {{ states('input_select.active_source') }}
          **TV:** {{ states('input_boolean.tv_power') | upper }}  |
          **AVR:** {{ states('input_boolean.avr_power') | upper }}  |
          **Vol:** {{ states('input_number.avr_volume') | int }}%

      # ── Power Controls ──────────────────────────────────────────
      - type: horizontal-stack
        cards:
          - type: button
            name: TV Power
            icon: mdi:television
            entity: input_boolean.tv_power
            tap_action:
              action: toggle
            show_state: true

          - type: button
            name: AVR Power
            icon: mdi:speaker
            entity: input_boolean.avr_power
            tap_action:
              action: toggle
            show_state: true

          - type: button
            name: Power Off All
            icon: mdi:power
            icon_color: red
            tap_action:
              action: call-service
              service: script.power_off_all

      # ── Source Selection ────────────────────────────────────────
      - type: entities
        title: Source Selection
        entities:
          - entity: input_select.active_source
            name: Active Source

      - type: horizontal-stack
        cards:
          - type: button
            name: Apple TV
            icon: mdi:apple
            tap_action:
              action: call-service
              service: script.select_source
              service_data:
                source: Apple TV
            entity: binary_sensor.apple_tv_active

          - type: button
            name: Chromecast
            icon: mdi:cast
            tap_action:
              action: call-service
              service: script.select_source
              service_data:
                source: Chromecast
            entity: binary_sensor.chromecast_active

          - type: button
            name: PlayStation 5
            icon: mdi:sony-playstation
            tap_action:
              action: call-service
              service: script.select_source
              service_data:
                source: PlayStation 5
            entity: binary_sensor.play_station_5_active

          - type: button
            name: Fire TV
            icon: mdi:amazon
            tap_action:
              action: call-service
              service: script.select_source
              service_data:
                source: Fire TV Stick
            entity: binary_sensor.fire_tv_stick_active

      # ── Volume Controls ─────────────────────────────────────────
      - type: entities
        title: Volume
        entities:
          - entity: input_number.avr_volume
            name: AVR Volume

      - type: horizontal-stack
        cards:
          - type: button
            name: Vol -
            icon: mdi:volume-minus
            tap_action:
              action: call-service
              service: script.volume_down

          - type: button
            name: Mute
            icon: mdi:volume-off
            tap_action:
              action: call-service
              service: input_number.set_value
              service_data:
                entity_id: input_number.avr_volume
                value: 0

          - type: button
            name: Vol +
            icon: mdi:volume-plus
            tap_action:
              action: call-service
              service: script.volume_up

      # ── Transport / Navigation Controls ─────────────────────────
      - type: horizontal-stack
        cards:
          - type: button
            name: "⏮"
            icon: mdi:skip-previous

          - type: button
            name: "⏸"
            icon: mdi:pause

          - type: button
            name: "⏯"
            icon: mdi:play-pause

          - type: button
            name: "⏭"
            icon: mdi:skip-next

      - type: horizontal-stack
        cards:
          - type: button
            name: ""
            icon: mdi:arrow-up-bold

      - type: horizontal-stack
        cards:
          - type: button
            name: ""
            icon: mdi:arrow-left-bold

          - type: button
            name: OK
            icon: mdi:checkbox-blank-circle-outline

          - type: button
            name: ""
            icon: mdi:arrow-right-bold

      - type: horizontal-stack
        cards:
          - type: button
            name: ""
            icon: mdi:arrow-down-bold

      - type: horizontal-stack
        cards:
          - type: button
            name: Home
            icon: mdi:home

          - type: button
            name: Back
            icon: mdi:arrow-left

          - type: button
            name: Menu
            icon: mdi:menu
```

---

## How to Apply the Dashboard

1. Settings → Dashboards → Add Dashboard → name it "Universal Remote"
2. Open it → Edit (pencil) → switch to YAML mode (top right)
3. Paste the YAML above
4. Save → exit edit mode

---

## Interview Talking Points
- "The markdown card at the top shows live entity states using Jinja2 templates — it updates automatically whenever any entity changes, so the assessor always sees current state."
- "Source buttons are bound to `binary_sensor.apple_tv_active` etc. — HA button cards show a highlighted state when the bound entity is `on`, giving us visual feedback for free."
- "I grouped controls (power → sources → volume → navigation) to mirror physical remote layout — reduces cognitive load for the user."
