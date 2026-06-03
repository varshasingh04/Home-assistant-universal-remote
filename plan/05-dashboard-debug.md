# Task 05: Secondary Debug / Status View

**Status:** COMPLETE

---

## What (Layman Explanation)

The assessor wants to see that entity states are actually changing — not just button colors. The debug view is a second page on the dashboard that shows the raw state of every entity in real time. It's like a "developer console" for the remote — you can see exactly what value each entity holds at any moment. This proves the backend is real, not faked.

---

## Why This Approach

- **Why a second dashboard view instead of a separate dashboard?** A second view (tab) on the same dashboard is one click away — the assessor doesn't need to navigate elsewhere. Keeps the demo smooth.
- **Why `entities` cards?** They show entity ID, state, and last-changed timestamp out of the box — exactly what a debug view needs, zero custom code.
- **Why show `last_changed`?** It proves state actually updated — the timestamp advances every time a button is pressed. This is the strongest evidence that the mock backend is real.

---

## Dashboard YAML (add as second view in `remote_dashboard.yaml`)

```yaml
  - title: Debug / Status
    path: debug
    icon: mdi:bug
    cards:

      - type: entities
        title: Source & Power State
        show_header_toggle: false
        entities:
          - entity: input_select.active_source
            name: Active Source
          - entity: input_boolean.tv_power
            name: TV Power
          - entity: input_boolean.avr_power
            name: AVR Power
          - entity: input_number.avr_volume
            name: AVR Volume

      - type: entities
        title: Source Active States (Template Sensors)
        show_header_toggle: false
        entities:
          - entity: binary_sensor.apple_tv_active
            name: Apple TV Active
          - entity: binary_sensor.chromecast_active
            name: Chromecast Active
          - entity: binary_sensor.play_station_5_active
            name: PlayStation 5 Active
          - entity: binary_sensor.fire_tv_stick_active
            name: Fire TV Stick Active

      - type: history-graph
        title: Source History (Last 1 Hour)
        hours_to_show: 1
        entities:
          - entity: input_select.active_source
          - entity: input_boolean.tv_power
          - entity: input_boolean.avr_power

      - type: logbook
        title: Recent State Changes
        hours_to_show: 1
        entities:
          - input_select.active_source
          - input_boolean.tv_power
          - input_boolean.avr_power
          - input_number.avr_volume
```

---

## Interview Talking Points
- "The debug view is proof that the state machine is real — the logbook shows every entity change with a timestamp, which you can correlate directly to button presses on the remote view."
- "The history-graph card visualizes source switching over time — useful for demonstrating multiple interactions during a screen recording."
- "Having a dedicated debug view is a production habit — in real systems you always want observability separate from the user-facing interface."
