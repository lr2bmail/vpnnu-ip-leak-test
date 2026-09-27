(() => {
  const root = document.querySelector('[data-tool="ip-leak-test"]');
  if (!root) return;
  const en = root.dataset.lang === 'en';
  const result = root.querySelector('[data-webrtc-result]');
  let visibleIp = null;
  async function refresh() {
    try {
      const response = await fetch(root.dataset.api || '/tools/ip.json', {cache: 'no-store'});
      if (!response.ok) throw new Error();
      const data = await response.json();
      visibleIp = data.ip;
      root.querySelector('[data-current-ip]').textContent = data.ip || '—';
      root.querySelector('[data-current-country]').textContent = data.country || '';
      root.querySelector('[data-ip-family]').textContent = data.family || '—';
    } catch (_) { result.textContent = en ? 'The IP check failed. Try again.' : 'De IP-controle is niet gelukt. Probeer opnieuw.'; }
  }
  async function checkWebRtc() {
    if (!window.RTCPeerConnection) {
      result.textContent = en ? 'WebRTC is unavailable in this browser.' : 'WebRTC is niet beschikbaar in deze browser.';
      return;
    }
    const addresses = new Set();
    result.textContent = en ? 'Checking WebRTC…' : 'WebRTC controleren…';
    let peer;
    try {
      peer = new RTCPeerConnection({iceServers: [{urls: 'stun:stun.l.google.com:19302'}]});
      peer.createDataChannel('check');
      peer.onicecandidate = event => {
        const parts = event.candidate?.candidate?.split(/\s+/) || [];
        if (parts[4]) addresses.add(parts[4]);
      };
      await peer.setLocalDescription(await peer.createOffer());
      await new Promise(resolve => {
        const timer = setTimeout(resolve, 6000);
        peer.onicegatheringstatechange = () => {
          if (peer.iceGatheringState === 'complete') { clearTimeout(timer); resolve(); }
        };
      });
      const values = [...addresses];
      const publicValues = values.filter(address => !address.endsWith('.local') &&
        !/^(10\.|127\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|::1$|fe80:|fc|fd)/i.test(address));
      if (!values.length) result.textContent = en ? 'No addresses were exposed to this test. This is inconclusive.' : 'Deze test zag geen adressen. Dat is geen bewijs dat er geen lek is.';
      else if (publicValues.some(address => address !== visibleIp)) result.textContent = (en ? 'Possible exposure: WebRTC showed a public address different from the website IP: ' : 'Mogelijke blootstelling: WebRTC toonde een ander publiek adres dan de website: ') + publicValues.join(', ');
      else result.textContent = (en ? 'WebRTC showed: ' : 'WebRTC toonde: ') + values.join(', ') + (en ? '. Local and mDNS addresses do not by themselves prove a leak.' : '. Lokale en mDNS-adressen bewijzen op zichzelf geen lek.');
    } catch (_) { result.textContent = en ? 'WebRTC could not complete the check.' : 'WebRTC kon de controle niet afronden.'; }
    finally { peer?.close(); }
  }
  root.querySelector('[data-refresh-ip]').addEventListener('click', refresh);
  root.querySelector('[data-webrtc-run]').addEventListener('click', checkWebRtc);
  refresh();
})();
