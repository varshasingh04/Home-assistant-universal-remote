# Task 01: VM Setup & Home Assistant OS Installation

**Status:** TODO

---

## What (Layman Explanation)

Home Assistant is smart-home software that runs as its own operating system — like Windows or Linux, but purpose-built for home automation. We install it inside a "virtual machine" (a fake computer that runs inside your real computer), so we don't need extra hardware. Once it's running, we open it in a browser just like a website.

---

## Why This Approach

- **Why a VM?** The assessment requires Home Assistant OS specifically (not Docker or pip install). HAOS gives us the Supervisor panel, add-on store, and snapshot features that the grader will check.
- **Why VirtualBox?** It's free, cross-platform, and Home Assistant officially distributes a `.vdi` image pre-configured for it — zero manual partitioning.
- **Why bridged networking?** So the VM gets its own IP on your local network, making it reachable at `http://homeassistant.local:8123` from your host browser. NAT networking would require port-forwarding and breaks mDNS discovery.

---

## Implementation Steps

### 1. Download
- Go to: https://www.home-assistant.io/installation/windows
- Download: **VirtualBox** image (`.vdi` file) — latest stable release
- Also download and install **VirtualBox** if not installed: https://www.virtualbox.org/

### 2. Create the VM in VirtualBox
```
New VM settings:
  Name:        HomeAssistant
  Type:        Linux
  Version:     Linux 2.6 / 3.x / 4.x (64-bit)
  RAM:         2048 MB (2 GB minimum)
  CPU:         2 cores
  Hard disk:   Use existing → select the downloaded .vdi file
```

### 3. Network Settings
```
VM Settings → Network → Adapter 1:
  Attached to: Bridged Adapter
  Name: [your active WiFi or Ethernet adapter]
```

### 4. Boot & First Run
- Start the VM
- Wait ~10 minutes for first boot (HA downloads updates automatically)
- Open browser on host: `http://homeassistant.local:8123`
- If mDNS doesn't work, check VM console for IP and use `http://<IP>:8123`

### 5. Onboarding
- Create admin account
- Skip location/analytics (not needed for assessment)
- Reach the main dashboard — setup is complete

### 6. Verify Health
- Settings → System → Repairs — should show no issues
- Settings → System → General — Supervisor version visible = HAOS confirmed

---

## Screenshot to Take
- Browser showing `http://homeassistant.local:8123` with the HA dashboard loaded
- Settings → System page showing Supervisor running

---

## Interview Talking Points
- "I used Home Assistant OS in VirtualBox because HAOS is the recommended production installation method — it includes the Supervisor which manages updates, snapshots, and add-ons."
- "Bridged networking ensures the VM is a first-class citizen on the local network, discoverable via mDNS."
