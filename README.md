# VPNNu IP and WebRTC leak test

A small, open-source browser check for the IP a website receives and WebRTC ICE addresses. [Use the live tool on VPNNu.nl](https://vpnnu.nl/tools/ip-leak-test/).

Open `index.html` in a browser or host these files as a static site. The public-IP display calls `https://vpnnu.nl/tools/ip.json`; WebRTC checks run only after a click and contact Google's public STUN server. The page does not identify DNS resolvers, cannot prove IPv6 is blocked, and cannot certify that a VPN is leak-free. Modern browsers may mask local ICE addresses.

No account is needed. The page does not store test results or upload configuration files. `tool.js` is the same source used by the VPNNu page.

MIT license.
