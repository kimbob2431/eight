(function () {
  'use strict';

  const STORAGE_KEY = 'eight_months_vscode_v1';
  const HTML_SIG_KEY = 'eight_months_vscode_sig_v1';
  const MEDIA_DB_NAME = 'eight_months_vscode_media_v1';
  const MEDIA_STORE = 'blobs';

  const FIREBASE_APP_CONFIG = {
    projectId: 'gen-lang-client-0364863257',
    appId: '1:1096257813834:web:c1c9cf2fe3b5b3be4495b3',
    apiKey: 'AIzaSyBvYpzfnszwRkXNYfZd-nzV2lZBTX66FoA',
    authDomain: 'gen-lang-client-0364863257.firebaseapp.com',
    firestoreDatabaseId:
      'ai-studio-abstractofcanvas-fabaf691-a2c8-4fb0-abaa-0d95fed06e45',
    storageBucket: 'gen-lang-client-0364863257.firebasestorage.app',
    messagingSenderId: '1096257813834',
  };

  const CREATOR_EMAIL = 'bobbybestparaiso@gmail.com';
  const REACT_TO_VSCODE_PHOTO_MAP = {
    '/assets/aistudio/1fb3cec8-29ed-4935-ad8f-f31bef1d58c0_baed835c.jpg':
      './assets/photos/01-scenic-overlook.jpg',
    '/assets/aistudio/a9f6d38f-c3c5-45b3-b4e8-2d92ece101ab_1032d53a.jpg':
      './assets/photos/02-hillside-ride.jpg',
    '/assets/aistudio/cb9b6fd1-e903-4a57-a12a-3292a20038dd_4cc3a3ec.jpg':
      './assets/photos/03-candid-smile.jpg',
    '/assets/aistudio/82453a4a-16ec-423f-baed-fc0a07210341_116e253d.jpg':
      './assets/photos/04-living-room.jpg',
    '/assets/aistudio/80d5c2d1-fa7d-421d-9eb4-dacbea5a7085_c5a192bf.jpg':
      './assets/photos/05-playful-selfie.jpg',
    '/assets/aistudio/445725e5-fb54-44d3-b242-b9e429b071b4_76182c63.jpg':
      './assets/photos/06-bear-headband.jpg',
    '/assets/aistudio/85421eb9-0167-4041-adda-f45e6414cc2f_d23edacf.jpg':
      './assets/photos/07-fox-photobooth.jpg',
  };

  let cachedGmailAccessToken = null;
  let signedInGoogleEmail = null;
  let fbApp = null;
  let fbAuth = null;
  let fbDb = null;
  let fbAuthMod = null;
  let fbStoreMod = null;
  let fbUser = null;
  let isCloudSyncing = false;
  let cloudSyncErrorMsg = '';
  let hasUnsyncedCreatorEdits = false;
  let remoteKeepsakeExists = null;
  let publishNoticeTimer = null;
  let cloudPushTimer = null;
  let reasonIndex = 0;
  let isEditingReason = false;
  let editingBucketId = null;
  const syncedMediaUploaded = new Set();
  const inFlightMediaUploads = new Map();
  const remoteMediaUrlCache = new Map();

  const COUPLE_PHOTOS = {
    scenicOverlook: './assets/photos/01-scenic-overlook.jpg',
    hillsideRide: './assets/photos/02-hillside-ride.jpg',
    candidSmile: './assets/photos/03-candid-smile.jpg',
    livingRoom: './assets/photos/04-living-room.jpg',
    playfulSelfie: './assets/photos/05-playful-selfie.jpg',
    bearHeadband: './assets/photos/06-bear-headband.jpg',
    foxPhotobooth: './assets/photos/07-fox-photobooth.jpg',
  };

  const DEFAULT_VOUCHERS = [
    {
      id: 'v-naic',
      code: 'TICKET 01',
      title: 'Naic Night Bazaar',
      description:
        'Street food trip, cozy lights, and strolling together around Naic Night Bazaar.',
      validity: 'Valid Anytime',
      redeemedAt: null,
      notifiedEmail: false,
      chosenNote: '',
    },
    {
      id: 'v-tagaytay',
      code: 'TICKET 02',
      title: 'Tagaytay Date',
      description:
        'Cool breeze, warm coffee, and enjoying the scenic Tagaytay view side by side.',
      validity: 'Valid Anytime',
      redeemedAt: null,
      notifiedEmail: false,
      chosenNote: '',
    },
    {
      id: 'v-taal',
      code: 'TICKET 03',
      title: 'Visiting Taal Basilica',
      description:
        'A peaceful visit and prayer together at Taal Basilica plus a heritage walk.',
      validity: 'Valid Anytime',
      redeemedAt: null,
      notifiedEmail: false,
      chosenNote: '',
    },
    {
      id: 'v-maple',
      code: 'TICKET 04',
      title: 'Maple Grove',
      description:
        'Relaxed hangout, good food, and taking cute photos together at Maple Grove.',
      validity: 'Valid Anytime',
      redeemedAt: null,
      notifiedEmail: false,
      chosenNote: '',
    },
  ];

  const DEFAULT_GALLERY = [
    {
      id: 'gal-1',
      mediaType: 'image',
      mediaUrl: COUPLE_PHOTOS.scenicOverlook,
      figureNumber: 'Fig. 01',
      title: 'Sea Breeze & Half Hearts',
      dateLabel: 'Scenic Overlook',
      caption: 'Our favorite spot overlooking the water and green hills.',
      featured: true,
    },
    {
      id: 'gal-2',
      mediaType: 'image',
      mediaUrl: COUPLE_PHOTOS.hillsideRide,
      figureNumber: 'Fig. 02',
      title: 'Two Chairs, One Ride',
      dateLabel: 'Road Trip',
      caption: 'Quick stop on our ride with our favorite view.',
    },
    {
      id: 'gal-3',
      mediaType: 'image',
      mediaUrl: COUPLE_PHOTOS.bearHeadband,
      figureNumber: 'Fig. 03',
      title: 'Photo Studio Mirror Shot',
      dateLabel: 'Studio Day',
      caption: 'Matching smiles before stepping into the booth.',
    },
    {
      id: 'gal-4',
      mediaType: 'image',
      mediaUrl: COUPLE_PHOTOS.foxPhotobooth,
      figureNumber: 'Fig. 04',
      title: 'Photobooth Silly Moment',
      dateLabel: 'Photo Booth',
      caption: 'Silly hats, bright smiles, and keepsake prints.',
    },
    {
      id: 'gal-5',
      mediaType: 'image',
      mediaUrl: COUPLE_PHOTOS.candidSmile,
      figureNumber: 'Fig. 05',
      title: 'Caught Laughing Together',
      dateLabel: 'Candid Frame',
      caption: 'Unfiltered laughter and quiet comfort.',
    },
    {
      id: 'gal-6',
      mediaType: 'image',
      mediaUrl: COUPLE_PHOTOS.playfulSelfie,
      figureNumber: 'Fig. 06',
      title: 'Close-Up Selfie',
      dateLabel: 'Everyday Us',
      caption: 'Making ordinary afternoons feel lighter.',
    },
    {
      id: 'gal-7',
      mediaType: 'image',
      mediaUrl: COUPLE_PHOTOS.livingRoom,
      figureNumber: 'Fig. 07',
      title: 'Cozy Hangout at Home',
      dateLabel: 'Warm Afternoon',
      caption: 'Simple moments just being around each other.',
    },
  ];

  const DEFAULT_MILESTONES = [
    {
      id: 'm-1',
      monthNumber: 1,
      monthLabel: 'Month 01',
      dateLabel: 'April 07, 2026',
      location: '',
      title: 'Month 01 — Our Beginning',
      story: '',
      secretNote: '',
      imageUrl: COUPLE_PHOTOS.candidSmile,
      imageCaption: 'Month 01 Keepsake',
      isFavorite: true,
    },
    {
      id: 'm-2',
      monthNumber: 2,
      monthLabel: 'Month 02',
      dateLabel: 'May 07, 2026',
      location: '',
      title: 'Month 02',
      story: '',
      secretNote: '',
      imageUrl: COUPLE_PHOTOS.livingRoom,
      imageCaption: 'Month 02 Keepsake',
      isFavorite: false,
    },
    {
      id: 'm-3',
      monthNumber: 3,
      monthLabel: 'Month 03',
      dateLabel: 'June 07, 2026',
      location: '',
      title: 'Month 03',
      story: '',
      secretNote: '',
      imageUrl: COUPLE_PHOTOS.playfulSelfie,
      imageCaption: 'Month 03 Keepsake',
      isFavorite: false,
    },
    {
      id: 'm-4',
      monthNumber: 4,
      monthLabel: 'Month 04',
      dateLabel: 'July 07, 2026',
      location: '',
      title: 'Month 04',
      story: '',
      secretNote: '',
      imageUrl: COUPLE_PHOTOS.hillsideRide,
      imageCaption: 'Month 04 Ride & View',
      isFavorite: true,
    },
    {
      id: 'm-5',
      monthNumber: 5,
      monthLabel: 'Month 05',
      dateLabel: 'August 07, 2026',
      location: '',
      title: 'Month 05',
      story: '',
      secretNote: '',
      imageUrl: COUPLE_PHOTOS.bearHeadband,
      imageCaption: 'Month 05 Studio Snap',
      isFavorite: false,
    },
    {
      id: 'm-6',
      monthNumber: 6,
      monthLabel: 'Month 06',
      dateLabel: 'September 07, 2026',
      location: '',
      title: 'Month 06',
      story: '',
      secretNote: '',
      isFavorite: false,
    },
    {
      id: 'm-7',
      monthNumber: 7,
      monthLabel: 'Month 07',
      dateLabel: 'October 07, 2026',
      location: '',
      title: 'Month 07',
      story: '',
      secretNote: '',
      imageUrl: COUPLE_PHOTOS.foxPhotobooth,
      imageCaption: 'Month 07 Photobooth',
      isFavorite: false,
    },
    {
      id: 'm-8',
      monthNumber: 8,
      monthLabel: 'Month 08',
      dateLabel: '8th Monthsary · 2026',
      location: '',
      title: 'Month 08 — Eight Months of Us',
      story: '',
      secretNote: '',
      imageUrl: COUPLE_PHOTOS.scenicOverlook,
      imageCaption: 'Month 08 — Eight Months Together',
      isFavorite: true,
    },
  ];

  // IndexedDB helpers for uploaded photos, videos, and custom MP3
  function openMediaDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(MEDIA_DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(MEDIA_STORE)) {
          req.result.createObjectStore(MEDIA_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function saveBlob(id, blob) {
    const db = await openMediaDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE, 'readwrite');
      tx.objectStore(MEDIA_STORE).put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getBlob(id) {
    const db = await openMediaDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE, 'readonly');
      const req = tx.objectStore(MEDIA_STORE).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function getBlobUrl(id) {
    const blob = await getBlob(id);
    return blob ? URL.createObjectURL(blob) : null;
  }

  async function clearBlobs() {
    const db = await openMediaDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE, 'readwrite');
      tx.objectStore(MEDIA_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function buildBaseData() {
    const cfg = window.MONTHSARY_CONFIG || {};
    return {
      creatorPin: cfg.creatorPin || '0407',
      notificationEmail: cfg.notificationEmail || 'bobbybestparaiso@gmail.com',
      brandTitle: cfg.brandTitle || 'Eight Months of Us',
      partnerName: cfg.partnerName || 'Mahal',
      senderName: cfg.senderName || 'Bobby',
      startDateIso: cfg.startDateIso || '2026-04-07T00:00:00',
      heroKicker: cfg.heroKicker || 'Month 08 · Started April 07, 2026',
      heroHeadline: cfg.heroHeadline || 'Eight Months of Us',
      heroLead:
        cfg.heroLead ||
        'Eight months since April 7, 2026. Every photo, video, and quiet moment here belongs only to us.',
      heroCaption: cfg.heroCaption || 'Fig. 01 · Eight Months Together',
      heroImageUrl: COUPLE_PHOTOS.scenicOverlook,
      songTitle: cfg.songTitle || 'Kay Tagal Kitang Hinintay (Lyrics Video)',
      songArtist: cfg.songArtist || 'Sponge Cola',
      youtubeVideoId: cfg.youtubeVideoId || 'ULprdcsFGy8',
      customAudioUrl:
        cfg.customAudioUrl || './assets/music/kay-tagal-kitang-hinintay.mp3',
      letterSalutation: cfg.letterSalutation || 'To my favorite person,',
      letterParagraphs:
        Array.isArray(cfg.letterParagraphs) && cfg.letterParagraphs.length > 0
          ? cfg.letterParagraphs
          : [
              'Happy 8th monthsary, mahal. Since April 7, 2026, you have turned ordinary days into memories I never want to let go of.',
            ],
      letterSignOff: cfg.letterSignOff || 'Always yours,',
      footerNote:
        cfg.footerNote ||
        'Happy 8th Monthsary, ' +
          (cfg.partnerName || 'Mahal') +
          '. Since April 07, 2026.',
      milestones: JSON.parse(JSON.stringify(DEFAULT_MILESTONES)),
      gallery: JSON.parse(JSON.stringify(DEFAULT_GALLERY)),
      reasons: [],
      vouchers: JSON.parse(JSON.stringify(DEFAULT_VOUCHERS)),
      bucketList: [],
      hugCount: 0,
    };
  }

  function computeSig(b) {
    return JSON.stringify({
      creatorPin: b.creatorPin,
      notificationEmail: b.notificationEmail,
      partnerName: b.partnerName,
      senderName: b.senderName,
      startDateIso: b.startDateIso,
      songTitle: b.songTitle,
      youtubeVideoId: b.youtubeVideoId,
      letterSalutation: b.letterSalutation,
      letterParagraphs: b.letterParagraphs,
      letterSignOff: b.letterSignOff,
    });
  }

  function loadState() {
    const base = buildBaseData();
    const curSig = computeSig(base);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const oldSig = localStorage.getItem(HTML_SIG_KEY);
      if (!raw) {
        localStorage.setItem(HTML_SIG_KEY, curSig);
        return base;
      }
      const parsed = JSON.parse(raw);
      const htmlChanged = oldSig !== curSig;
      if (htmlChanged) localStorage.setItem(HTML_SIG_KEY, curSig);

      const merged = Object.assign({}, base, parsed, {
        creatorPin: base.creatorPin,
      });
      if (htmlChanged) {
        merged.notificationEmail = base.notificationEmail;
        merged.partnerName = base.partnerName;
        merged.senderName = base.senderName;
        merged.startDateIso = base.startDateIso;
        merged.letterSalutation = base.letterSalutation;
        merged.letterParagraphs = base.letterParagraphs;
        merged.letterSignOff = base.letterSignOff;
      }
      return merged;
    } catch {
      return base;
    }
  }

  let state = loadState();
  let isCreatorMode = false;
  let timelineFilter = 'all';
  let revealedNotes = {};
  let activeLightboxIndex = -1;
  let lightboxItems = [];
  let activeTicketForModal = null;

  function sanitizeMediaId(raw) {
    return String(raw || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  }

  function normalizeRemoteUrlForVscode(url) {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('blob:') || url.startsWith('data:')) return '';
    return REACT_TO_VSCODE_PHOTO_MAP[url] || url;
  }

  function normalizeRemoteAudioForVscode(url) {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('blob:') || url.startsWith('data:')) return '';
    if (url === '/kay-tagal-kitang-hinintay.mp3') {
      return './assets/music/kay-tagal-kitang-hinintay.mp3';
    }
    return url;
  }

  function isCloudCreatorSignedIn() {
    return Boolean(
      fbUser &&
        fbUser.emailVerified &&
        fbUser.email &&
        fbUser.email.toLowerCase() === CREATOR_EMAIL
    );
  }

  function persistState(skipCloudMark) {
    try {
      const clone = JSON.parse(JSON.stringify(state));
      if (clone.heroMediaId) clone.heroImageUrl = '';
      if (clone.customAudioMediaId) clone.customAudioUrl = '';
      clone.milestones = clone.milestones.map((m) => {
        if (m.imageMediaId) m.imageUrl = '';
        if (m.videoMediaId) m.videoUrl = '';
        return m;
      });
      clone.gallery = clone.gallery.map((g) => {
        if (g.mediaId) g.mediaUrl = '';
        return g;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clone));
    } catch {
      // Ignore quota issues
    }

    if (!skipCloudMark && isCreatorMode) {
      hasUnsyncedCreatorEdits = true;
      scheduleCloudSyncPush();
    }
  }

  function normalizeAudioMime(rawMime, fileName) {
    const lower = String(rawMime || '').toLowerCase();
    if (!lower || lower === 'audio/mp3' || lower === 'application/octet-stream') {
      if (fileName && /\.m4a$/i.test(fileName)) return 'audio/mp4';
      if (fileName && /\.ogg$/i.test(fileName)) return 'audio/ogg';
      if (fileName && /\.wav$/i.test(fileName)) return 'audio/wav';
      return 'audio/mpeg';
    }
    return rawMime || 'audio/mpeg';
  }

  function base64ToAudioBlob(base64, mimeType) {
    const clean = String(base64 || '').replace(/\s+/g, '');
    const byteChars = atob(clean);
    const len = byteChars.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = byteChars.charCodeAt(i);
    }
    return new Blob([bytes], { type: normalizeAudioMime(mimeType) });
  }

  async function fetchRemoteMediaUrl(mediaId) {
    const safeId = sanitizeMediaId(mediaId);
    if (!safeId) return null;
    if (remoteMediaUrlCache.has(safeId)) {
      return remoteMediaUrlCache.get(safeId);
    }
    if (!fbDb || !fbStoreMod) return null;
    try {
      const snap = await fbStoreMod.getDoc(fbStoreMod.doc(fbDb, 'media', safeId));
      if (!snap.exists()) return null;
      const d = snap.data();
      if (!d || typeof d.dataUrl !== 'string' || d.dataUrl.length === 0) {
        return null;
      }

      if (d.dataUrl.startsWith('{')) {
        try {
          const meta = JSON.parse(d.dataUrl);
          if (meta && meta.kind === 'chunked-audio' && meta.chunks > 0) {
            const snaps = await Promise.all(
              Array.from({ length: meta.chunks }, (_, idx) =>
                fbStoreMod.getDoc(
                  fbStoreMod.doc(fbDb, 'media', safeId + '_c' + idx)
                )
              )
            );
            const parts = [];
            for (const cs of snaps) {
              if (!cs.exists()) return null;
              const cd = cs.data();
              if (!cd || typeof cd.dataUrl !== 'string') return null;
              parts.push(cd.dataUrl);
            }
            const audioBlob = base64ToAudioBlob(
              parts.join(''),
              meta.mime || 'audio/mpeg'
            );
            await saveBlob(mediaId, audioBlob).catch(() => {});
            const blobUrl = URL.createObjectURL(audioBlob);
            remoteMediaUrlCache.set(safeId, blobUrl);
            return blobUrl;
          }
        } catch {
          return null;
        }
      }

      if (d.mediaType === 'audio' && d.dataUrl.startsWith('data:')) {
        const commaIdx = d.dataUrl.indexOf(',');
        const header = d.dataUrl.slice(0, commaIdx);
        const mimeMatch = header.match(/data:([^;]+)/);
        const mime = mimeMatch ? mimeMatch[1] : 'audio/mpeg';
        const b64 = d.dataUrl.slice(commaIdx + 1);
        const audioBlob = base64ToAudioBlob(b64, mime);
        await saveBlob(mediaId, audioBlob).catch(() => {});
        const blobUrl = URL.createObjectURL(audioBlob);
        remoteMediaUrlCache.set(safeId, blobUrl);
        return blobUrl;
      }

      remoteMediaUrlCache.set(safeId, d.dataUrl);
      return d.dataUrl;
    } catch {
      return null;
    }
  }

  async function resolveAnyMediaUrl(mediaId) {
    if (!mediaId) return null;
    const localUrl = await getBlobUrl(mediaId).catch(() => null);
    if (localUrl) return localUrl;
    return fetchRemoteMediaUrl(mediaId);
  }

  async function hydrateMediaBlobs(allowRetry) {
    const shouldRetry = typeof allowRetry === 'boolean' ? allowRetry : true;
    try {
      let hasMissingMedia = false;
      if (state.heroMediaId) {
        const u = await resolveAnyMediaUrl(state.heroMediaId);
        if (u) state.heroImageUrl = u;
        else hasMissingMedia = true;
      }
      if (state.customAudioMediaId) {
        const u = await resolveAnyMediaUrl(state.customAudioMediaId);
        if (u) state.customAudioUrl = u;
        else hasMissingMedia = true;
      }
      for (const m of state.milestones) {
        if (m.imageMediaId) {
          const u = await resolveAnyMediaUrl(m.imageMediaId);
          if (u) m.imageUrl = u;
          else hasMissingMedia = true;
        }
        if (m.videoMediaId) {
          const u = await resolveAnyMediaUrl(m.videoMediaId);
          if (u) m.videoUrl = u;
        }
      }
      for (const g of state.gallery) {
        if (g.mediaId) {
          const u = await resolveAnyMediaUrl(g.mediaId);
          if (u) g.mediaUrl = u;
          else if (g.mediaType === 'image') hasMissingMedia = true;
        }
      }
      renderAll();
      if (shouldRetry && hasMissingMedia) {
        setTimeout(() => {
          hydrateMediaBlobs(false);
        }, 1500);
      }
    } catch {
      // IndexedDB unavailable
    }
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function updateCounter() {
    const startMs = Date.parse(state.startDateIso);
    const diffSec = Number.isNaN(startMs)
      ? 0
      : Math.max(0, Math.floor((Date.now() - startMs) / 1000));
    const days = Math.floor(diffSec / 86400);
    const hours = Math.floor((diffSec % 86400) / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    document.getElementById('countDays').textContent = String(days).padStart(2, '0');
    document.getElementById('countHours').textContent = String(hours).padStart(2, '0');
    document.getElementById('countMinutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('countSeconds').textContent = String(seconds).padStart(2, '0');
  }

  function renderHeroAndLetter() {
    document.getElementById('brandWordmark').textContent = state.brandTitle;
    document.getElementById('heroKickerEl').textContent =
      state.heroKicker + ' · For ' + state.partnerName;
    document.getElementById('heroHeadlineEl').textContent = state.heroHeadline;
    document.getElementById('heroLeadEl').textContent = state.heroLead;
    document.getElementById('heroCaptionEl').textContent = state.heroCaption;
    document.getElementById('heroPhotoImg').src = state.heroImageUrl;

    const d = new Date(state.startDateIso);
    const formatted = Number.isNaN(d.getTime())
      ? 'April 7, 2026'
      : d.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
    document.getElementById('counterStartLabel').textContent =
      'Time Spent Together Since ' + formatted;
    document.getElementById('counterSongLabel').textContent =
      state.songTitle + ' — ' + state.songArtist;
    document.getElementById('footerSongLabel').textContent =
      state.songTitle + ' — ' + state.songArtist;
    document.getElementById('footerDedication').textContent = state.footerNote;

    document.getElementById('letterHeadingEl').textContent =
      'A Sealed Letter for ' + state.partnerName;
    document.getElementById('letterCoverLine').textContent =
      'For ' + state.partnerName + ', on our 8th Monthsary';
    document.getElementById('letterSalutationEl').textContent =
      state.letterSalutation;
    document.getElementById('letterSignOffEl').textContent =
      state.letterSignOff;
    document.getElementById('letterSenderEl').textContent = state.senderName;
    document.getElementById('hugCountEl').textContent = String(state.hugCount);

    const pMount = document.getElementById('letterParagraphsEl');
    pMount.innerHTML = state.letterParagraphs
      .map(
        (p, idx) =>
          `<p class="${idx === 0 ? 'letter-dropcap' : ''}" style="margin:0;">${escapeHtml(
            p
          )}</p>`
      )
      .join('');

    document.getElementById('ticketNotifyEmailLabel').textContent =
      state.notificationEmail;
    document.getElementById('songBarTitle').textContent = state.songTitle;
    document.getElementById('songBarArtist').textContent =
      state.songArtist + ' · MP3 & Lyrics Video';
    document.getElementById('youtubeExtLink').href =
      'https://www.youtube.com/watch?v=' +
      encodeURIComponent(state.youtubeVideoId);

    const nameLbl = document.getElementById('mp3FileNameLabel');
    if (nameLbl) {
      nameLbl.textContent = state.songTitle || 'kay-tagal-kitang-hinintay.mp3';
    }

    const audioEl = document.getElementById('mp3AudioEl');
    const loadingNote = document.getElementById('mp3LoadingNote');
    const fallbackNote = document.getElementById('mp3FallbackNote');
    if (state.customAudioUrl) {
      audioEl.classList.remove('hidden');
      if (loadingNote) loadingNote.classList.add('hidden');
      if (audioEl.getAttribute('data-src') !== state.customAudioUrl) {
        audioEl.setAttribute('data-src', state.customAudioUrl);
        audioEl.src = state.customAudioUrl;
        if (fallbackNote) fallbackNote.classList.add('hidden');
      }
    } else if (state.customAudioMediaId) {
      audioEl.classList.add('hidden');
      if (loadingNote) loadingNote.classList.remove('hidden');
      if (fallbackNote) fallbackNote.classList.add('hidden');
    } else {
      audioEl.classList.add('hidden');
      if (loadingNote) loadingNote.classList.add('hidden');
      if (fallbackNote) fallbackNote.classList.remove('hidden');
    }
  }

  function renderTimeline() {
    const sorted = [...state.milestones].sort(
      (a, b) => a.monthNumber - b.monthNumber
    );
    const filtered = sorted.filter((m) => {
      if (timelineFilter === 'early') return m.monthNumber <= 4;
      if (timelineFilter === 'recent') return m.monthNumber >= 5;
      if (timelineFilter === 'favorites') return m.isFavorite;
      return true;
    });

    const mount = document.getElementById('timelineItemsMount');
    if (filtered.length === 0) {
      mount.innerHTML =
        '<div class="card" style="text-align:center;"><p class="font-display" style="font-size:1.4rem;margin:0;">No months in Favorites yet.</p></div>';
      return;
    }

    mount.innerHTML = filtered
      .map((item) => {
        const hasMedia = Boolean(item.imageUrl || item.videoUrl);
        const isNoteOpen = Boolean(revealedNotes[item.id]);

        const mediaHtml = hasMedia
          ? `<div>
              ${
                item.imageUrl
                  ? `<div style="position:relative;">
                      <button type="button" class="media-photo-btn" data-inspect-month="${escapeHtml(
                        item.id
                      )}" data-inspect-type="image">
                        <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(
                      item.title
                    )}" />
                      </button>
                      ${
                        isCreatorMode
                          ? `<button type="button" class="delete-badge" data-del-month-media="${escapeHtml(
                              item.id
                            )}" data-del-type="image">Remove</button>`
                          : ''
                      }
                      ${
                        item.imageCaption
                          ? `<div class="hero-caption">${escapeHtml(
                              item.imageCaption
                            )}</div>`
                          : ''
                      }
                    </div>`
                  : ''
              }
              ${
                item.videoUrl
                  ? `<div class="video-box">
                      <video src="${escapeHtml(
                        item.videoUrl
                      )}" controls playsinline preload="metadata"></video>
                      <div class="video-bar">
                        <span>${escapeHtml(
                          item.videoTitle || item.monthLabel + ' Video'
                        )}</span>
                        <div style="display:flex;gap:10px;">
                          <button type="button" style="border:none;background:none;color:var(--accent);font-weight:600;cursor:pointer;" data-inspect-month="${escapeHtml(
                            item.id
                          )}" data-inspect-type="video">Fullscreen</button>
                          ${
                            isCreatorMode
                              ? `<button type="button" style="border:none;background:none;color:var(--ink-muted);cursor:pointer;" data-del-month-media="${escapeHtml(
                                  item.id
                                )}" data-del-type="video">Remove</button>`
                              : ''
                          }
                        </div>
                      </div>
                    </div>`
                  : ''
              }
            </div>`
          : '';

        const creatorInline = isCreatorMode
          ? `<div class="creator-inline-row">
              <button type="button" class="btn-secondary" data-upload-month="${escapeHtml(
                item.id
              )}" data-upload-type="image">${
              item.imageUrl ? 'Change Photo' : 'Upload Photo'
            }</button>
              <button type="button" class="btn-secondary" data-upload-month="${escapeHtml(
                item.id
              )}" data-upload-type="video">${
              item.videoUrl ? 'Change Video' : 'Upload Video'
            }</button>
              <button type="button" class="btn-soft" data-edit-month="${escapeHtml(
                item.id
              )}">Edit Month</button>
            </div>`
          : '';

        return `<article class="timeline-item">
          <div class="timeline-marker font-mono-num ${
            item.isFavorite ? 'favorite' : ''
          }">${String(item.monthNumber).padStart(2, '0')}</div>
          <div class="card">
            <div class="milestone-grid ${hasMedia ? 'has-media' : ''}">
              <div>
                <div class="meta-row">
                  <div class="meta-line">
                    <span class="meta-month font-mono-num">${escapeHtml(
                      item.monthLabel
                    )}</span>
                    <span>·</span>
                    <span>${escapeHtml(item.dateLabel)}</span>
                    ${
                      item.location
                        ? `<span>·</span><span>${escapeHtml(
                            item.location
                          )}</span>`
                        : ''
                    }
                  </div>
                  <button type="button" class="fav-btn ${
                    item.isFavorite ? 'active' : ''
                  }" data-fav-month="${escapeHtml(item.id)}">
                    ${item.isFavorite ? '♥ Saved' : '♡ Save'}
                  </button>
                </div>
                <h3 class="milestone-title">${escapeHtml(item.title)}</h3>
                ${
                  item.story
                    ? `<p class="milestone-story">${escapeHtml(item.story)}</p>`
                    : !hasMedia
                    ? `<p class="milestone-empty">Awaiting this month’s photo, video, or note.</p>`
                    : ''
                }
                ${
                  item.secretNote
                    ? `<div style="margin-top:14px;">
                        <button type="button" style="border:none;background:none;padding:0;color:var(--accent);font-size:0.78rem;font-weight:600;cursor:pointer;" data-toggle-secret="${escapeHtml(
                          item.id
                        )}">${
                        isNoteOpen ? 'Hide Secret Note ▲' : 'Read Secret Note ▼'
                      }</button>
                        ${
                          isNoteOpen
                            ? `<div class="secret-note-box">“${escapeHtml(
                                item.secretNote
                              )}”</div>`
                            : ''
                        }
                      </div>`
                    : ''
                }
                ${creatorInline}
              </div>
              ${mediaHtml}
            </div>
          </div>
        </article>`;
      })
      .join('');
  }

  function renderGallery() {
    const mount = document.getElementById('galleryGridMount');
    mount.innerHTML = state.gallery
      .map((item, idx) => {
        const isFeat = item.featured || idx === 0;
        return `<figure class="bento-item ${
          isFeat ? 'featured' : ''
        }" style="margin:0;position:relative;">
          <button type="button" class="bento-btn" data-open-gallery="${idx}">
            ${
              item.mediaType === 'video'
                ? `<video src="${escapeHtml(
                    item.mediaUrl
                  )}" muted playsinline preload="metadata"></video>`
                : `<img src="${escapeHtml(item.mediaUrl)}" alt="${escapeHtml(
                    item.title
                  )}" />`
            }
            <div class="bento-overlay">
              <div class="font-mono-num" style="font-size:0.7rem;opacity:0.85;">
                ${escapeHtml(item.figureNumber)} · ${
          item.mediaType === 'video' ? 'Video' : 'Photo'
        } · ${escapeHtml(item.dateLabel)}
              </div>
              <div class="font-display" style="font-size:1.25rem;font-weight:500;margin-top:2px;">
                ${escapeHtml(item.title)}
              </div>
            </div>
          </button>
          ${
            isCreatorMode
              ? `<div style="position:absolute;top:10px;right:10px;z-index:5;display:flex;gap:6px;">
                  <button type="button" class="delete-badge" style="position:static;" data-edit-gallery="${escapeHtml(
                    item.id
                  )}">Edit</button>
                  <button type="button" class="delete-badge" style="position:static;" data-del-gallery="${escapeHtml(
                    item.id
                  )}">Delete</button>
                </div>`
              : ''
          }
        </figure>`;
      })
      .join('');
  }

  function renderTickets() {
    const mount = document.getElementById('ticketsGridMount');
    mount.innerHTML = state.vouchers
      .map((v) => {
        const isRedeemed = Boolean(v.redeemedAt);
        return `<div class="ticket-card ${isRedeemed ? 'redeemed' : ''}">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:0.72rem;color:var(--ink-subtle);">
              <span class="font-mono-num" style="color:var(--accent);font-weight:600;">${escapeHtml(
                v.code
              )}</span>
              <div style="display:flex;align-items:center;gap:8px;">
                <span>${escapeHtml(v.validity)}</span>
                ${
                  isCreatorMode
                    ? `<button type="button" style="border:none;background:none;color:var(--accent);font-size:0.72rem;font-weight:600;cursor:pointer;padding:0;" data-edit-ticket="${escapeHtml(
                        v.id
                      )}">Edit</button>
                      <button type="button" style="border:none;background:none;color:var(--ink-muted);font-size:0.72rem;cursor:pointer;padding:0;" data-del-ticket="${escapeHtml(
                        v.id
                      )}">Delete</button>`
                    : ''
                }
              </div>
            </div>
            <h3 class="font-display" style="font-size:1.5rem;font-weight:600;margin:8px 0 0;">
              ${escapeHtml(v.title)}
            </h3>
            <p style="font-size:0.86rem;color:var(--ink-muted);line-height:1.6;margin:8px 0 0;">
              ${escapeHtml(v.description)}
            </p>
            ${
              v.chosenNote
                ? `<p style="font-size:0.76rem;font-style:italic;color:var(--ink-subtle);margin:10px 0 0;">“${escapeHtml(
                    v.chosenNote
                  )}”</p>`
                : ''
            }
          </div>
          <div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--border-soft);display:flex;justify-content:space-between;align-items:center;gap:8px;">
            ${
              isRedeemed
                ? `<div>
                    <div style="font-size:0.78rem;font-weight:600;color:var(--accent);">✓ Chosen · ${escapeHtml(
                      v.redeemedAt
                    )}</div>
                    <div style="font-size:0.7rem;color:var(--ink-muted);">${
                      v.notifiedEmail ? 'Gmail alert prepared/sent' : ''
                    }</div>
                  </div>
                  ${
                    isCreatorMode
                      ? `<button type="button" class="btn-secondary" style="padding:5px 10px;font-size:0.72rem;" data-reset-ticket="${escapeHtml(
                          v.id
                        )}">Reset</button>`
                      : ''
                  }`
                : `<button type="button" class="btn-soft" style="width:100%;" data-redeem-ticket="${escapeHtml(
                    v.id
                  )}">Redeem Ticket</button>`
            }
          </div>
        </div>`;
      })
      .join('');
  }

  function renderReasonsAndBucket() {
    const reasonsSec = document.getElementById('reasons');
    const bucketSec = document.getElementById('bucketListSection');
    const navReasons = document.getElementById('navReasonsLink');
    const mobReasons = document.getElementById('mobileReasonsLink');

    const reasons = Array.isArray(state.reasons) ? state.reasons : [];
    const bucketList = Array.isArray(state.bucketList) ? state.bucketList : [];
    const showReasons = isCreatorMode || reasons.length > 0;
    const showBucket = isCreatorMode || bucketList.length > 0;

    if (navReasons) navReasons.classList.toggle('hidden', !showReasons);
    if (mobReasons) mobReasons.classList.toggle('hidden', !showReasons);

    if (reasonsSec) {
      reasonsSec.classList.toggle('hidden', !showReasons);
      if (showReasons) {
        const safeIdx = reasons.length > 0 ? reasonIndex % reasons.length : 0;
        const current = reasons[safeIdx] || '';
        reasonsSec.innerHTML = `
          <div style="max-width:720px;">
            <p class="kicker" style="margin-bottom:8px;">Little Things I Adore</p>
            <h2 class="section-title">Why It’s Always You, ${escapeHtml(state.partnerName)}</h2>
            <p class="section-desc">
              Tap through the cards whenever you need a quick reminder of why you mean so much to me.
            </p>
            ${
              reasons.length > 0
                ? `<div class="card" style="margin-top:24px;display:flex;flex-direction:column;justify-content:space-between;min-height:220px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;color:var(--ink-subtle);">
                      <span class="font-mono-num">Reason ${String(safeIdx + 1).padStart(2, '0')} / ${String(reasons.length).padStart(2, '0')}</span>
                      ${
                        isCreatorMode
                          ? `<div style="display:flex;gap:12px;">
                              <button type="button" id="btnToggleEditReason" style="border:none;background:none;color:var(--accent);cursor:pointer;font-weight:600;">${
                                isEditingReason ? 'Cancel' : 'Edit'
                              }</button>
                              <button type="button" id="btnDeleteReason" style="border:none;background:none;color:var(--ink-muted);cursor:pointer;">Delete</button>
                            </div>`
                          : ''
                      }
                    </div>
                    ${
                      isCreatorMode && isEditingReason
                        ? `<form id="formEditReason" style="margin:18px 0;display:flex;flex-direction:column;gap:10px;">
                            <textarea id="inputEditReason" rows="3" class="field-input">${escapeHtml(current)}</textarea>
                            <div style="display:flex;gap:8px;">
                              <button type="submit" class="btn-primary">Save Reason</button>
                            </div>
                          </form>`
                        : `<blockquote class="font-display" style="margin:22px 0;font-style:italic;font-size:1.7rem;line-height:1.35;">“${escapeHtml(current)}”</blockquote>`
                    }
                    <div style="display:flex;flex-wrap:wrap;gap:10px;padding-top:16px;border-top:1px solid var(--border-soft);">
                      <button type="button" id="btnNextReason" class="btn-primary" ${reasons.length <= 1 ? 'disabled' : ''}>Reveal Next Reason</button>
                      <button type="button" id="btnRandReason" class="btn-secondary" ${reasons.length <= 1 ? 'disabled' : ''}>Random</button>
                    </div>
                  </div>`
                : `<div class="card" style="margin-top:24px;border-style:dashed;color:var(--ink-subtle);font-size:0.86rem;">
                    No reasons added yet. Add your own reasons below (hidden from visitors until added).
                  </div>`
            }
            ${
              isCreatorMode
                ? `<form id="formAddReason" style="margin-top:14px;display:flex;gap:8px;">
                    <input id="inputNewReason" type="text" class="field-input" placeholder="Add a personal reason for her..." />
                    <button type="submit" class="btn-secondary">+ Add</button>
                  </form>`
                : ''
            }
          </div>`;
      } else {
        reasonsSec.innerHTML = '';
      }
    }

    if (bucketSec) {
      bucketSec.classList.toggle('hidden', !showBucket);
      if (showBucket) {
        const doneCount = bucketList.filter((b) => b.completed).length;
        bucketSec.innerHTML = `
          <div class="card">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px;padding-bottom:20px;border-bottom:1px solid var(--border-soft);">
              <div>
                <p class="kicker" style="margin-bottom:6px;">Looking Ahead Together</p>
                <h2 class="section-title" style="font-size:clamp(1.6rem,3vw,2.15rem);">Our Next Chapters Checklist</h2>
              </div>
              <div class="font-mono-num" style="font-size:0.78rem;color:var(--ink-muted);">
                ${doneCount} of ${bucketList.length} completed
              </div>
            </div>
            ${
              bucketList.length > 0
                ? `<ul style="list-style:none;margin:0;padding:0;">
                    ${bucketList
                      .map((b) => {
                        const isEditB = isCreatorMode && editingBucketId === b.id;
                        return `<li style="padding:14px 0;border-bottom:1px solid var(--border-soft);display:flex;justify-content:space-between;align-items:center;gap:12px;">
                          ${
                            isEditB
                              ? `<form data-save-bucket="${escapeHtml(b.id)}" style="flex:1;display:flex;flex-wrap:wrap;gap:8px;">
                                  <input type="text" class="field-input" style="flex:1;min-width:180px;" value="${escapeHtml(b.text)}" />
                                  <button type="submit" class="btn-primary">Save</button>
                                  <button type="button" id="btnCancelBucketEdit" class="btn-secondary">Cancel</button>
                                </form>`
                              : `<label style="display:flex;align-items:center;gap:12px;cursor:pointer;flex:1;">
                                  <input type="checkbox" data-toggle-bucket="${escapeHtml(b.id)}" ${b.completed ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--accent);" />
                                  <span style="font-size:0.94rem;${b.completed ? 'text-decoration:line-through;color:#8e7c84;' : ''}">${escapeHtml(b.text)}</span>
                                </label>
                                ${
                                  isCreatorMode
                                    ? `<div style="display:flex;gap:10px;font-size:0.76rem;">
                                        <button type="button" data-edit-bucket="${escapeHtml(b.id)}" style="border:none;background:none;color:var(--accent);cursor:pointer;font-weight:600;">Edit</button>
                                        <button type="button" data-del-bucket="${escapeHtml(b.id)}" style="border:none;background:none;color:var(--ink-muted);cursor:pointer;">Delete</button>
                                      </div>`
                                    : ''
                                }`
                          }
                        </li>`;
                      })
                      .join('')}
                  </ul>`
                : `<p style="padding:18px 0 0;font-size:0.86rem;color:var(--ink-subtle);">No bucket-list promises added yet. Add your plans below.</p>`
            }
            ${
              isCreatorMode
                ? `<form id="formAddBucket" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border-soft);display:flex;gap:8px;">
                    <input id="inputNewBucket" type="text" class="field-input" placeholder="Add a future date or dream to do together..." />
                    <button type="submit" class="btn-primary">+ Add Plan</button>
                  </form>`
                : ''
            }
          </div>`;
      } else {
        bucketSec.innerHTML = '';
      }
    }
  }

  function renderCreatorVisibility() {
    document
      .getElementById('creatorBar')
      .classList.toggle('hidden', !isCreatorMode);
    document
      .getElementById('heroEditBtn')
      .classList.toggle('hidden', !isCreatorMode);
    document
      .getElementById('heroPhotoChangeBtn')
      .classList.toggle('hidden', !isCreatorMode);
    document
      .getElementById('btnAddExtraMonth')
      .classList.toggle('hidden', !isCreatorMode);
    document
      .getElementById('letterInlineEditBtn')
      .classList.toggle('hidden', !isCreatorMode);
    document
      .getElementById('galleryCreatorActions')
      .classList.toggle('hidden', !isCreatorMode);
    document
      .getElementById('btnAddVoucherTrigger')
      .classList.toggle('hidden', !isCreatorMode);
    document
      .getElementById('footerEditBtn')
      .classList.toggle('hidden', !isCreatorMode);
    document
      .getElementById('mp3CreatorUploadWrap')
      .classList.toggle('hidden', !isCreatorMode);

    const signedInCreator = isCloudCreatorSignedIn();
    const signInBtn = document.getElementById('btnCloudSyncSignIn');
    const syncBadge = document.getElementById('cloudSyncBadge');
    const lockBtn = document.getElementById('btnLockCreator');
    const noticeBox = document.getElementById('creatorSyncNotice');
    const noticeText = document.getElementById('creatorSyncNoticeText');

    if (signInBtn) signInBtn.classList.toggle('hidden', signedInCreator);
    if (syncBadge) {
      syncBadge.classList.toggle('hidden', !signedInCreator);
      syncBadge.textContent = isCloudSyncing
        ? 'Publishing live…'
        : 'Published Live · Visible on all phones & laptops (no viewer login needed)';
    }
    if (lockBtn) {
      lockBtn.disabled = isCloudSyncing;
      lockBtn.textContent = isCloudSyncing
        ? 'Publishing…'
        : 'Publish & Lock View';
    }
    if (noticeBox && noticeText && cloudSyncErrorMsg) {
      noticeText.textContent = cloudSyncErrorMsg;
      noticeBox.classList.remove('hidden');
    }
  }

  function showPublishSuccessNotice() {
    const el = document.getElementById('publishSuccessNotice');
    if (!el) return;
    el.classList.remove('hidden');
    if (publishNoticeTimer) clearTimeout(publishNoticeTimer);
    publishNoticeTimer = setTimeout(() => {
      el.classList.add('hidden');
    }, 6000);
  }

  function renderAll() {
    renderCreatorVisibility();
    renderHeroAndLetter();
    renderTimeline();
    renderGallery();
    renderReasonsAndBucket();
    renderTickets();
  }

  // Lightbox helpers
  function openLightbox(items, index) {
    lightboxItems = items;
    activeLightboxIndex = index;
    updateLightboxView();
    document.getElementById('lightboxModal').classList.remove('hidden');
  }

  function updateLightboxView() {
    const item = lightboxItems[activeLightboxIndex];
    if (!item) return;
    document.getElementById('lightboxMeta').textContent =
      item.figureNumber + ' · ' + item.dateLabel;
    document.getElementById('lightboxTitle').textContent = item.title;
    document.getElementById('lightboxCaption').textContent = item.caption || '';
    const mount = document.getElementById('lightboxMediaMount');
    if (item.mediaType === 'video') {
      mount.innerHTML = `<video src="${escapeHtml(
        item.mediaUrl
      )}" controls autoplay playsinline></video>`;
    } else {
      mount.innerHTML = `<img src="${escapeHtml(
        item.mediaUrl
      )}" alt="${escapeHtml(item.title)}" />`;
    }
  }

  // Song Player helpers
  function toggleSongBar(forceOpen) {
    const bar = document.getElementById('songBar');
    const shouldOpen =
      typeof forceOpen === 'boolean'
        ? forceOpen
        : bar.classList.contains('hidden');
    bar.classList.toggle('hidden', !shouldOpen);
  }

  function setSongMode(mode) {
    document
      .querySelectorAll('#songModeTabs .seg-btn')
      .forEach((b) =>
        b.classList.toggle('active', b.getAttribute('data-songmode') === mode)
      );
    document
      .getElementById('songPaneMp3')
      .classList.toggle('hidden', mode !== 'mp3');
    document
      .getElementById('songPaneVideo')
      .classList.toggle('hidden', mode !== 'video');
    document
      .getElementById('songPaneLyrics')
      .classList.toggle('hidden', mode !== 'lyrics');

    const iframe = document.getElementById('youtubeIframe');
    if (mode === 'video' && !iframe.getAttribute('src')) {
      iframe.setAttribute(
        'src',
        'https://www.youtube.com/embed/' +
          encodeURIComponent(state.youtubeVideoId) +
          '?autoplay=1&rel=0'
      );
    }
  }

  async function ensureFirebaseModules() {
    if (fbApp && fbAuth && fbDb && fbAuthMod && fbStoreMod) {
      return true;
    }
    const [appMod, authMod, storeMod] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js'),
    ]);
    fbAuthMod = authMod;
    fbStoreMod = storeMod;
    fbApp =
      appMod.getApps().length > 0
        ? appMod.getApps()[0]
        : appMod.initializeApp(FIREBASE_APP_CONFIG);
    fbAuth = authMod.getAuth(fbApp);
    fbDb = storeMod.getFirestore(
      fbApp,
      FIREBASE_APP_CONFIG.firestoreDatabaseId
    );
    return true;
  }

  function compressImageBlobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Invalid image format.'));
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas unavailable.'));
            return;
          }
          const attempts = [
            { maxSide: 1280, quality: 0.8 },
            { maxSide: 1024, quality: 0.72 },
            { maxSide: 840, quality: 0.62 },
            { maxSide: 680, quality: 0.52 },
          ];
          for (const a of attempts) {
            const scale = Math.min(1, a.maxSide / Math.max(img.width, img.height));
            canvas.width = Math.max(1, Math.round(img.width * scale));
            canvas.height = Math.max(1, Math.round(img.height * scale));
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', a.quality);
            if (dataUrl.length <= 780000) {
              resolve(dataUrl);
              return;
            }
          }
          reject(new Error('Image is still too large after compression.'));
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }

  function stripTransientUrl(url) {
    if (!url || typeof url !== 'string') return '';
    if (url.startsWith('blob:') || url.startsWith('data:')) return '';
    return url.slice(0, 600);
  }

  function clampStr(v, maxLen, fallback) {
    const s = typeof v === 'string' ? v : fallback || '';
    return s.slice(0, maxLen);
  }

  function buildFirestorePayload(uid) {
    const milestones = (state.milestones || []).slice(0, 60).map((m) => {
      const item = {
        id: clampStr(m.id, 80, 'm-' + Date.now()),
        monthNumber: Math.max(
          1,
          Math.min(99, Math.floor(Number(m.monthNumber) || 1))
        ),
        monthLabel: clampStr(m.monthLabel, 40, 'Month 01'),
        dateLabel: clampStr(m.dateLabel, 80, ''),
        location: clampStr(m.location, 120, ''),
        title: clampStr(m.title, 160, ''),
        story: clampStr(m.story, 4000, ''),
        secretNote: clampStr(m.secretNote, 1000, ''),
        isFavorite: Boolean(m.isFavorite),
      };
      if (m.imageMediaId) item.imageMediaId = sanitizeMediaId(m.imageMediaId);
      const cleanImg = m.imageMediaId ? '' : stripTransientUrl(m.imageUrl);
      if (cleanImg) item.imageUrl = cleanImg;
      if (m.imageCaption) item.imageCaption = clampStr(m.imageCaption, 200);
      if (m.videoMediaId) item.videoMediaId = sanitizeMediaId(m.videoMediaId);
      const cleanVid = m.videoMediaId ? '' : stripTransientUrl(m.videoUrl);
      if (cleanVid) item.videoUrl = cleanVid;
      if (m.videoTitle) item.videoTitle = clampStr(m.videoTitle, 160);
      return item;
    });

    const gallery = (state.gallery || []).slice(0, 60).map((g) => {
      const item = {
        id: clampStr(g.id, 80, 'gal-' + Date.now()),
        mediaType: g.mediaType === 'video' ? 'video' : 'image',
        mediaUrl: g.mediaId ? '' : stripTransientUrl(g.mediaUrl),
        figureNumber: clampStr(g.figureNumber, 40, 'Fig. 01'),
        title: clampStr(g.title, 160, 'Memory'),
        dateLabel: clampStr(g.dateLabel, 80, ''),
        caption: clampStr(g.caption, 400, ''),
        featured: Boolean(g.featured),
      };
      if (g.mediaId) item.mediaId = sanitizeMediaId(g.mediaId);
      return item;
    });

    const vouchers = (state.vouchers || []).slice(0, 30).map((v) => {
      const item = {
        id: clampStr(v.id, 80, 'v-' + Date.now()),
        code: clampStr(v.code, 40, 'TICKET'),
        title: clampStr(v.title, 120, 'Date Ticket'),
        description: clampStr(v.description, 400, ''),
        validity: clampStr(v.validity, 80, 'Valid Anytime'),
        redeemedAt: v.redeemedAt ? clampStr(v.redeemedAt, 40) : null,
        notifiedEmail: Boolean(v.notifiedEmail),
      };
      if (v.chosenNote && v.chosenNote.trim()) {
        item.chosenNote = clampStr(v.chosenNote.trim(), 500);
      }
      return item;
    });

    const payload = {
      brandTitle: clampStr(state.brandTitle, 120, 'Eight Months of Us') || 'Eight Months of Us',
      partnerName: clampStr(state.partnerName, 80, 'Mahal') || 'Mahal',
      senderName: clampStr(state.senderName, 80, 'Bobby') || 'Bobby',
      notificationEmail:
        clampStr(state.notificationEmail, 160, 'bobbybestparaiso@gmail.com') ||
        'bobbybestparaiso@gmail.com',
      startDateIso:
        clampStr(state.startDateIso, 40, '2026-04-07T00:00:00') ||
        '2026-04-07T00:00:00',
      heroKicker: clampStr(state.heroKicker, 160, ''),
      heroHeadline:
        clampStr(state.heroHeadline, 160, 'Eight Months of Us') ||
        'Eight Months of Us',
      heroLead: clampStr(state.heroLead, 1000, ''),
      heroCaption: clampStr(state.heroCaption, 200, ''),
      heroImageUrl: state.heroMediaId ? '' : stripTransientUrl(state.heroImageUrl),
      songTitle:
        clampStr(state.songTitle, 160, 'Kay Tagal Kitang Hinintay') ||
        'Kay Tagal Kitang Hinintay',
      songArtist: clampStr(state.songArtist, 120, 'Sponge Cola') || 'Sponge Cola',
      youtubeVideoId: clampStr(state.youtubeVideoId, 40, ''),
      spotifyTrackId: clampStr(state.spotifyTrackId, 64, ''),
      customAudioUrl: state.customAudioMediaId
        ? ''
        : stripTransientUrl(state.customAudioUrl),
      letterSalutation: clampStr(state.letterSalutation, 160, ''),
      letterParagraphs: (state.letterParagraphs || [])
        .slice(0, 30)
        .map((p) => clampStr(p, 4000, '').trim())
        .filter(Boolean),
      letterSignOff: clampStr(state.letterSignOff, 160, ''),
      footerNote: clampStr(state.footerNote, 200, ''),
      milestones,
      gallery,
      reasons: Array.isArray(state.reasons)
        ? state.reasons.slice(0, 60).map((r) => clampStr(r, 500, '').trim()).filter(Boolean)
        : [],
      vouchers,
      bucketList: Array.isArray(state.bucketList)
        ? state.bucketList.slice(0, 60).map((b) => ({
            id: clampStr(b.id, 80, 'b-' + Date.now()),
            text: clampStr(b.text, 300, ''),
            completed: Boolean(b.completed),
          }))
        : [],
      hugCount: Math.max(0, Math.min(1000000, Math.floor(Number(state.hugCount) || 0))),
      updatedAt: fbStoreMod.serverTimestamp(),
      updatedByUid: uid,
    };

    if (state.heroMediaId) payload.heroMediaId = sanitizeMediaId(state.heroMediaId);
    if (state.customAudioMediaId) {
      payload.customAudioMediaId = sanitizeMediaId(state.customAudioMediaId);
    }
    return payload;
  }

  async function uploadMediaIfNeeded(mediaId, mediaType, uid) {
    const safeId = sanitizeMediaId(mediaId).slice(0, 105);
    if (!safeId || syncedMediaUploaded.has(safeId) || !fbDb || !fbStoreMod) return;
    const existing = await fetchRemoteMediaUrl(safeId);
    if (existing) {
      syncedMediaUploaded.add(safeId);
      return;
    }
    const blob = await getBlob(mediaId).catch(() => null);
    if (!blob) return;

    if (mediaType === 'image') {
      const dataUrl = await compressImageBlobToDataUrl(blob);
      if (!dataUrl || dataUrl.length > 850000) return;
      await fbStoreMod.setDoc(fbStoreMod.doc(fbDb, 'media', safeId), {
        mediaType,
        dataUrl,
        createdAt: fbStoreMod.serverTimestamp(),
        uploadedByUid: uid,
      });
      remoteMediaUrlCache.set(safeId, dataUrl);
      syncedMediaUploaded.add(safeId);
      return;
    }

    // Audio upload (supports up to 15 MB via chunked Firestore documents for Android & iOS)
    if (blob.size > 15 * 1024 * 1024) {
      throw new Error(
        'MP3 file is larger than 15 MB. Please pick an audio file under 15 MB.'
      );
    }
    const mime = normalizeAudioMime(
      blob.type,
      blob instanceof File ? blob.name : undefined
    );
    const rawDataUrl = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(typeof r.result === 'string' ? r.result : '');
      r.onerror = () => reject(new Error('Failed to read MP3 file.'));
      r.readAsDataURL(blob);
    });
    const commaIdx = rawDataUrl.indexOf(',');
    const base64 = commaIdx >= 0 ? rawDataUrl.slice(commaIdx + 1) : rawDataUrl;
    if (base64.length < 16) return;

    const singleDataUrl = 'data:' + mime + ';base64,' + base64;
    if (singleDataUrl.length <= 780000) {
      await fbStoreMod.setDoc(fbStoreMod.doc(fbDb, 'media', safeId), {
        mediaType: 'audio',
        dataUrl: singleDataUrl,
        createdAt: fbStoreMod.serverTimestamp(),
        uploadedByUid: uid,
      });
      remoteMediaUrlCache.set(safeId, URL.createObjectURL(base64ToAudioBlob(base64, mime)));
      syncedMediaUploaded.add(safeId);
      return;
    }

    const CHUNK_SIZE = 600000;
    const chunks = [];
    for (let off = 0; off < base64.length; off += CHUNK_SIZE) {
      chunks.push(base64.slice(off, off + CHUNK_SIZE));
    }
    if (chunks.length > 1 && chunks[chunks.length - 1].length < 20) {
      const tail = chunks.pop();
      chunks[chunks.length - 1] += tail;
    }

    for (let i = 0; i < chunks.length; i += 4) {
      await Promise.all(
        chunks.slice(i, i + 4).map((chunkStr, idxOffset) =>
          fbStoreMod.setDoc(
            fbStoreMod.doc(fbDb, 'media', safeId + '_c' + (i + idxOffset)),
            {
              mediaType: 'audio',
              dataUrl: chunkStr,
              createdAt: fbStoreMod.serverTimestamp(),
              uploadedByUid: uid,
            }
          )
        )
      );
    }

    const manifest = JSON.stringify({
      v: 1,
      kind: 'chunked-audio',
      mime,
      chunks: chunks.length,
      size: blob.size,
    });
    await fbStoreMod.setDoc(fbStoreMod.doc(fbDb, 'media', safeId), {
      mediaType: 'audio',
      dataUrl: manifest,
      createdAt: fbStoreMod.serverTimestamp(),
      uploadedByUid: uid,
    });
    remoteMediaUrlCache.set(
      safeId,
      URL.createObjectURL(base64ToAudioBlob(base64, mime))
    );
    syncedMediaUploaded.add(safeId);
  }

  function trackMediaUploadTask(mediaId, mediaType, uid) {
    const safeId = sanitizeMediaId(mediaId);
    if (!safeId || !isCloudCreatorSignedIn() || !fbDb || !fbStoreMod) return;
    const task = uploadMediaIfNeeded(mediaId, mediaType, uid).finally(() => {
      inFlightMediaUploads.delete(safeId);
    });
    inFlightMediaUploads.set(safeId, task);
    return task;
  }

  async function syncPendingMediaAndKeepsake() {
    if (!isCloudCreatorSignedIn()) return false;
    await ensureFirebaseModules();
    isCloudSyncing = true;
    cloudSyncErrorMsg = '';
    renderCreatorVisibility();

    try {
      if (inFlightMediaUploads.size > 0) {
        await Promise.allSettled(Array.from(inFlightMediaUploads.values()));
      }

      const uid = fbUser.uid;
      if (state.heroMediaId) {
        await uploadMediaIfNeeded(state.heroMediaId, 'image', uid);
      }
      if (state.customAudioMediaId) {
        await uploadMediaIfNeeded(state.customAudioMediaId, 'audio', uid);
      }
      for (const m of state.milestones) {
        if (m.imageMediaId) {
          await uploadMediaIfNeeded(m.imageMediaId, 'image', uid);
        }
      }
      for (const g of state.gallery) {
        if (g.mediaId && g.mediaType === 'image') {
          await uploadMediaIfNeeded(g.mediaId, 'image', uid);
        }
      }

      const payload = buildFirestorePayload(uid);
      await fbStoreMod.setDoc(
        fbStoreMod.doc(fbDb, 'keepsake', 'main'),
        payload
      );
      remoteKeepsakeExists = true;
      hasUnsyncedCreatorEdits = false;
      isCloudSyncing = false;
      renderCreatorVisibility();
      return true;
    } catch (err) {
      isCloudSyncing = false;
      cloudSyncErrorMsg =
        err instanceof Error ? err.message : 'Cloud sync failed.';
      renderCreatorVisibility();
      throw err;
    }
  }

  function scheduleCloudSyncPush() {
    if (!isCreatorMode || !isCloudCreatorSignedIn()) return;
    if (cloudPushTimer) clearTimeout(cloudPushTimer);
    cloudPushTimer = setTimeout(() => {
      syncPendingMediaAndKeepsake().catch(() => {});
    }, 550);
  }

  async function signInCreatorForCloudSync(lockAfterPublish) {
    try {
      cloudSyncErrorMsg = '';
      await ensureFirebaseModules();
      const provider = new fbAuthMod.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await fbAuthMod.signInWithPopup(fbAuth, provider);
      fbUser = result.user;
      if (isCloudCreatorSignedIn()) {
        document.getElementById('creatorSyncNotice').classList.add('hidden');
        await syncPendingMediaAndKeepsake();
        if (lockAfterPublish) {
          isCreatorMode = false;
          renderAll();
          showPublishSuccessNotice();
        }
      } else {
        cloudSyncErrorMsg =
          'Please sign in with ' +
          CREATOR_EMAIL +
          ' on this device to publish updates live.';
        renderCreatorVisibility();
      }
    } catch (err) {
      cloudSyncErrorMsg =
        'Sign-in cancelled or domain not authorized in Firebase Auth (' +
        window.location.hostname +
        ').';
      renderCreatorVisibility();
    }
  }

  async function initCloudSync() {
    try {
      await ensureFirebaseModules();
      fbAuthMod.onAuthStateChanged(fbAuth, async (user) => {
        fbUser = user;
        renderCreatorVisibility();
        if (isCloudCreatorSignedIn()) {
          if (remoteKeepsakeExists === false) {
            syncPendingMediaAndKeepsake().catch(() => {});
          } else if (state.customAudioMediaId) {
            const localAudio = await getBlob(state.customAudioMediaId).catch(
              () => null
            );
            if (localAudio) {
              const remoteAudio = await fetchRemoteMediaUrl(
                state.customAudioMediaId
              );
              if (!remoteAudio) {
                syncPendingMediaAndKeepsake().catch(() => {});
              }
            }
          }
        }
      });

      fbStoreMod.onSnapshot(
        fbStoreMod.doc(fbDb, 'keepsake', 'main'),
        async (snap) => {
          remoteKeepsakeExists = snap.exists();
          if (!snap.exists()) {
            if (isCloudCreatorSignedIn()) {
              syncPendingMediaAndKeepsake().catch(() => {});
            }
            return;
          }
          if (hasUnsyncedCreatorEdits) return;
          const raw = snap.data();
          const base = buildBaseData();

          const nextState = Object.assign({}, base, state, {
            brandTitle: raw.brandTitle || base.brandTitle,
            partnerName: raw.partnerName || base.partnerName,
            senderName: raw.senderName || base.senderName,
            notificationEmail: raw.notificationEmail || base.notificationEmail,
            startDateIso: raw.startDateIso || base.startDateIso,
            heroKicker:
              typeof raw.heroKicker === 'string'
                ? raw.heroKicker
                : base.heroKicker,
            heroHeadline: raw.heroHeadline || base.heroHeadline,
            heroLead:
              typeof raw.heroLead === 'string' ? raw.heroLead : base.heroLead,
            heroCaption:
              typeof raw.heroCaption === 'string'
                ? raw.heroCaption
                : base.heroCaption,
            heroMediaId: raw.heroMediaId || undefined,
            heroImageUrl: raw.heroMediaId
              ? state.heroMediaId === raw.heroMediaId
                ? state.heroImageUrl
                : ''
              : normalizeRemoteUrlForVscode(raw.heroImageUrl) ||
                base.heroImageUrl,
            songTitle: raw.songTitle || base.songTitle,
            songArtist: raw.songArtist || base.songArtist,
            youtubeVideoId:
              typeof raw.youtubeVideoId === 'string'
                ? raw.youtubeVideoId
                : base.youtubeVideoId,
            spotifyTrackId: raw.spotifyTrackId || base.spotifyTrackId,
            customAudioMediaId: raw.customAudioMediaId || undefined,
            customAudioUrl: raw.customAudioMediaId
              ? state.customAudioMediaId === raw.customAudioMediaId
                ? state.customAudioUrl
                : ''
              : normalizeRemoteAudioForVscode(raw.customAudioUrl) ||
                base.customAudioUrl,
            letterSalutation: raw.letterSalutation || base.letterSalutation,
            letterParagraphs:
              Array.isArray(raw.letterParagraphs) &&
              raw.letterParagraphs.length > 0
                ? raw.letterParagraphs
                : base.letterParagraphs,
            letterSignOff: raw.letterSignOff || base.letterSignOff,
            footerNote: raw.footerNote || base.footerNote,
            milestones:
              Array.isArray(raw.milestones) && raw.milestones.length > 0
                ? raw.milestones.map((m) =>
                    Object.assign({}, m, {
                      imageUrl: m.imageMediaId
                        ? ''
                        : normalizeRemoteUrlForVscode(m.imageUrl),
                      videoUrl: m.videoMediaId
                        ? ''
                        : normalizeRemoteUrlForVscode(m.videoUrl),
                    })
                  )
                : base.milestones,
            gallery:
              Array.isArray(raw.gallery) && raw.gallery.length > 0
                ? raw.gallery.map((g) =>
                    Object.assign({}, g, {
                      mediaUrl: g.mediaId
                        ? ''
                        : normalizeRemoteUrlForVscode(g.mediaUrl),
                    })
                  )
                : base.gallery,
            reasons: Array.isArray(raw.reasons) ? raw.reasons : [],
            vouchers:
              Array.isArray(raw.vouchers) && raw.vouchers.length > 0
                ? raw.vouchers
                : base.vouchers,
            bucketList: Array.isArray(raw.bucketList) ? raw.bucketList : [],
            hugCount:
              typeof raw.hugCount === 'number' ? raw.hugCount : base.hugCount,
          });

          // Merge redemptions if partner picked a ticket from any device
          for (const v of nextState.vouchers) {
            if (!v.redeemedAt) {
              try {
                const rSnap = await fbStoreMod.getDoc(
                  fbStoreMod.doc(fbDb, 'redemptions', sanitizeMediaId(v.id))
                );
                if (rSnap.exists()) {
                  const rd = rSnap.data();
                  v.redeemedAt = rd.redeemedAtLabel || 'Redeemed';
                  v.notifiedEmail = Boolean(rd.notifiedEmail);
                  v.chosenNote = rd.personalNote || v.chosenNote || '';
                }
              } catch {
                // ignore
              }
            }
          }

          state = nextState;
          persistState(true);
          await hydrateMediaBlobs(true);
          renderAll();
        }
      );
    } catch {
      // Offline / file:// fallback still works seamlessly with localStorage
    }
  }

  // Gmail Integration (Firebase Auth CDN when on authorized domain + clean Gmail Web fallback in VS Code Live Server)
  async function tryGoogleSignIn() {
    const statusEl = document.getElementById('ticketModalStatus');
    statusEl.classList.remove('hidden');
    statusEl.textContent = 'Connecting Google account...';
    try {
      await ensureFirebaseModules();
      const provider = new fbAuthMod.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/gmail.send');
      const result = await fbAuthMod.signInWithPopup(fbAuth, provider);
      fbUser = result.user;
      const cred = fbAuthMod.GoogleAuthProvider.credentialFromResult(result);
      if (cred && cred.accessToken) {
        cachedGmailAccessToken = cred.accessToken;
        signedInGoogleEmail = result.user.email || 'Google Account';
        document.getElementById('ticketAuthHint').textContent =
          'Connected as ' +
          signedInGoogleEmail +
          '. Ready to send Gmail notification directly!';
        statusEl.textContent =
          'Google connected! Click "Confirm & Send via Gmail" below.';
      }
      renderCreatorVisibility();
    } catch {
      statusEl.textContent =
        'Running locally in VS Code? Click "Confirm & Send via Gmail" to send directly using Gmail Web!';
    }
  }

  function encodeMimeBase64Url(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function sendGmailNotificationOrCompose(ticket, prefDate, note) {
    const subject =
      '8th Monthsary Date Ticket Chosen: ' +
      ticket.title +
      ' (' +
      ticket.code +
      ')';
    const body = [
      'Hi Bobby! ' +
        state.partnerName +
        ' picked a date ticket on your 8th Monthsary website:',
      '',
      'Ticket Chosen: ' + ticket.title + ' (' + ticket.code + ')',
      'Details: ' + ticket.description,
      'Preferred Schedule: ' + (prefDate || 'Anytime soon'),
      'Note: ' + (note || '(No extra note)'),
    ].join('\n');

    if (cachedGmailAccessToken) {
      const raw = [
        'To: ' + state.notificationEmail,
        'Subject: ' + subject,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset="UTF-8"',
        '',
        body,
      ].join('\r\n');

      const res = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + cachedGmailAccessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: encodeMimeBase64Url(raw) }),
        }
      );
      if (res.ok) return true;
    }

    // Fallback for local VS Code Live Server / file://
    const gmailUrl =
      'https://mail.google.com/mail/?view=cm&fs=1&to=' +
      encodeURIComponent(state.notificationEmail) +
      '&su=' +
      encodeURIComponent(subject) +
      '&body=' +
      encodeURIComponent(body);
    window.open(gmailUrl, '_blank', 'noopener');
    return true;
  }

  // Creator Unlock Triggers
  function requestCreatorUnlock() {
    if (isCreatorMode) {
      openStudioModal('month');
      return;
    }
    document.getElementById('pinInput').value = '';
    document.getElementById('pinError').classList.add('hidden');
    document.getElementById('pinModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('pinInput').focus(), 40);
  }

  let studioMonthId = null;
  let editingGalleryId = null;
  let editingVoucherId = null;

  function openStudioModal(tab, targetMonthId) {
    studioMonthId = targetMonthId || state.milestones[0]?.id || null;
    switchStudioTab(tab || 'month');
    populateStudioForms();
    document.getElementById('studioModal').classList.remove('hidden');
  }

  function switchStudioTab(tab) {
    document
      .querySelectorAll('#studioTabs .seg-btn')
      .forEach((b) =>
        b.classList.toggle('active', b.getAttribute('data-studiotab') === tab)
      );
    document
      .getElementById('studioMonthForm')
      .classList.toggle('hidden', tab !== 'month');
    document
      .getElementById('studioProfileForm')
      .classList.toggle('hidden', tab !== 'profile');
    document
      .getElementById('studioLetterForm')
      .classList.toggle('hidden', tab !== 'letter');
    document
      .getElementById('studioVouchersPane')
      .classList.toggle('hidden', tab !== 'vouchers');
  }

  function renderStudioVouchersList() {
    const mount = document.getElementById('studioVouchersList');
    mount.innerHTML = state.vouchers
      .map(
        (v) => `<div style="padding:12px;border-radius:10px;border:1px solid var(--border);background:var(--surface);display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <strong class="font-mono-num" style="font-size:0.75rem;color:var(--accent);">${escapeHtml(
              v.code
            )} — ${escapeHtml(v.title)}</strong>
            <div style="display:flex;gap:8px;">
              ${
                v.redeemedAt
                  ? `<button type="button" class="btn-secondary" style="padding:4px 8px;font-size:0.7rem;" data-studio-reset-v="${escapeHtml(
                      v.id
                    )}">Reset</button>`
                  : ''
              }
              <button type="button" class="btn-soft" style="padding:4px 8px;font-size:0.7rem;" data-edit-ticket="${escapeHtml(
                v.id
              )}">Edit</button>
              <button type="button" class="btn-secondary" style="padding:4px 8px;font-size:0.7rem;color:var(--accent);" data-studio-del-v="${escapeHtml(
                v.id
              )}">Delete</button>
            </div>
          </div>
          <p style="margin:0;font-size:0.76rem;color:var(--ink-muted);">${escapeHtml(
            v.description
          )} (${escapeHtml(v.validity)})</p>
        </div>`
      )
      .join('');
  }

  function populateStudioForms() {
    const sel = document.getElementById('studioMonthSelect');
    const sorted = [...state.milestones].sort(
      (a, b) => a.monthNumber - b.monthNumber
    );
    sel.innerHTML = sorted
      .map(
        (m) =>
          `<option value="${escapeHtml(m.id)}">${escapeHtml(
            m.monthLabel
          )} — ${escapeHtml(m.title)}</option>`
      )
      .join('');
    if (studioMonthId) sel.value = studioMonthId;
    loadSelectedMonthFields(sel.value);

    document.getElementById('profBrandTitle').value = state.brandTitle;
    document.getElementById('profPartner').value = state.partnerName;
    document.getElementById('profSender').value = state.senderName;
    document.getElementById('profEmail').value = state.notificationEmail;
    document.getElementById('profStartDate').value = state.startDateIso.slice(
      0,
      10
    );
    document.getElementById('profKicker').value = state.heroKicker;
    document.getElementById('profHeadline').value = state.heroHeadline;
    document.getElementById('profCaption').value = state.heroCaption;
    document.getElementById('profLead').value = state.heroLead;
    document.getElementById('profSongTitle').value = state.songTitle;
    document.getElementById('profSongArtist').value = state.songArtist;
    document.getElementById('profYoutubeId').value = state.youtubeVideoId;
    document.getElementById('profFooterNote').value = state.footerNote;

    document.getElementById('letSalutation').value = state.letterSalutation;
    document.getElementById('letBody').value =
      state.letterParagraphs.join('\n\n');
    document.getElementById('letSignOff').value = state.letterSignOff;

    renderStudioVouchersList();
  }

  function loadSelectedMonthFields(id) {
    const m = state.milestones.find((x) => x.id === id);
    if (!m) return;
    studioMonthId = id;
    document.getElementById('studioMonthNum').value = String(m.monthNumber || 1);
    document.getElementById('studioMonthDate').value = m.dateLabel || '';
    document.getElementById('studioMonthLocation').value = m.location || '';
    document.getElementById('studioMonthTitle').value = m.title || '';
    document.getElementById('studioMonthStory').value = m.story || '';
    document.getElementById('studioMonthSecret').value = m.secretNote || '';
    document.getElementById('studioMonthImgCap').value = m.imageCaption || '';
    document.getElementById('studioMonthVidTitle').value = m.videoTitle || '';
  }

  function spawnPetals() {
    const layer = document.getElementById('petalsLayer');
    for (let i = 0; i < 6; i++) {
      const span = document.createElement('span');
      span.className = 'petal-heart';
      span.textContent = '♥';
      span.style.left = 18 + Math.random() * 64 + '%';
      span.style.setProperty(
        '--drift-x',
        Math.round((Math.random() - 0.5) * 44) + 'px'
      );
      span.style.setProperty(
        '--spin-deg',
        Math.round((Math.random() - 0.5) * 48) + 'deg'
      );
      layer.appendChild(span);
      setTimeout(() => span.remove(), 1850);
    }
  }

  // Event Wiring
  document.addEventListener('DOMContentLoaded', function () {
    renderAll();
    updateCounter();
    setInterval(updateCounter, 1000);
    hydrateMediaBlobs();
    initCloudSync();

    // Triple-click detection for Creator Mode
    let clicks = [];
    const trackTriple = () => {
      const now = Date.now();
      clicks = clicks.filter((t) => now - t < 900);
      clicks.push(now);
      if (clicks.length >= 3) {
        clicks = [];
        requestCreatorUnlock();
      }
    };
    document
      .getElementById('brandWordmark')
      .addEventListener('click', trackTriple);
    document
      .getElementById('footerDedication')
      .addEventListener('click', trackTriple);

    document.addEventListener('keydown', (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === 'e'
      ) {
        e.preventDefault();
        requestCreatorUnlock();
      } else if (e.key === 'Escape') {
        document.getElementById('lightboxModal').classList.add('hidden');
        document.getElementById('ticketModal').classList.add('hidden');
        document.getElementById('pinModal').classList.add('hidden');
        document.getElementById('studioModal').classList.add('hidden');
        document.getElementById('galleryEditModal').classList.add('hidden');
        document.getElementById('voucherEditModal').classList.add('hidden');
      }
    });

    // Mobile drawer
    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
      document.getElementById('mobileDrawer').classList.toggle('hidden');
    });
    document.querySelectorAll('.mobile-nav-link').forEach((a) =>
      a.addEventListener('click', () => {
        document.getElementById('mobileDrawer').classList.add('hidden');
      })
    );

    // Song triggers
    ['navSongBtn', 'mobileSongBtn', 'heroSongBtn', 'letterSongBtn'].forEach(
      (id) => {
        document.getElementById(id).addEventListener('click', () => {
          toggleSongBar();
        });
      }
    );
    document
      .getElementById('songCloseBtn')
      .addEventListener('click', () => toggleSongBar(false));
    document
      .getElementById('songMinimizeBtn')
      .addEventListener('click', () => {
        document.getElementById('songBarBody').classList.toggle('hidden');
      });
    document
      .querySelectorAll('#songModeTabs .seg-btn')
      .forEach((btn) =>
        btn.addEventListener('click', () =>
          setSongMode(btn.getAttribute('data-songmode'))
        )
      );

    const mp3AudioEl = document.getElementById('mp3AudioEl');
    mp3AudioEl.addEventListener('error', () => {
      document.getElementById('mp3FallbackNote').classList.remove('hidden');
    });
    document
      .getElementById('mp3LoopToggle')
      .addEventListener('change', (e) => {
        mp3AudioEl.loop = e.target.checked;
      });

    // MP3 Upload in Creator Mode
    document
      .getElementById('btnSongUploadMp3')
      .addEventListener('click', () => {
        document.getElementById('songMp3UploadInput').click();
      });
    document
      .getElementById('songMp3UploadInput')
      .addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!file) return;
        const id = 'audio-' + Date.now();
        await saveBlob(id, file);
        if (isCloudCreatorSignedIn() && fbUser) {
          trackMediaUploadTask(id, 'audio', fbUser.uid);
        }
        state.customAudioMediaId = id;
        state.customAudioUrl = URL.createObjectURL(file);
        persistState();
        renderHeroAndLetter();
        document.getElementById('mp3FallbackNote').classList.add('hidden');
        mp3AudioEl.play().catch(() => {});
      });

    // Timeline filter tabs
    document.querySelectorAll('#timelineTabs .seg-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        timelineFilter = btn.getAttribute('data-filter');
        document
          .querySelectorAll('#timelineTabs .seg-btn')
          .forEach((b) => b.classList.toggle('active', b === btn));
        renderTimeline();
      });
    });

    // Letter seal open/fold & Hug
    const openLetter = () => {
      document.getElementById('letterSealedView').classList.add('hidden');
      document.getElementById('letterOpenView').classList.remove('hidden');
    };
    document.getElementById('waxSealBtn').addEventListener('click', openLetter);
    document
      .getElementById('openLetterBtn')
      .addEventListener('click', openLetter);
    document
      .getElementById('heroOpenLetterBtn')
      .addEventListener('click', openLetter);
    document.getElementById('foldLetterBtn').addEventListener('click', () => {
      document.getElementById('letterOpenView').classList.add('hidden');
      document.getElementById('letterSealedView').classList.remove('hidden');
    });
    document.getElementById('hugBtn').addEventListener('click', () => {
      state.hugCount += 1;
      persistState();
      document.getElementById('hugCountEl').textContent = String(
        state.hugCount
      );
      spawnPetals();
    });

    // Hero cover photo change (Creator)
    document
      .getElementById('heroPhotoChangeBtn')
      .addEventListener('click', () => {
        document.getElementById('heroPhotoInput').click();
      });
    document
      .getElementById('heroPhotoInput')
      .addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!file) return;
        const id = 'hero-' + Date.now();
        await saveBlob(id, file);
        if (isCloudCreatorSignedIn() && fbUser) {
          trackMediaUploadTask(id, 'image', fbUser.uid);
        }
        state.heroMediaId = id;
        state.heroImageUrl = URL.createObjectURL(file);
        persistState();
        renderHeroAndLetter();
      });

    // Gallery uploads (Creator)
    document
      .getElementById('btnUploadGalPhoto')
      .addEventListener('click', () => {
        document.getElementById('galleryPhotoInput').click();
      });
    document
      .getElementById('btnUploadGalVideo')
      .addEventListener('click', () => {
        document.getElementById('galleryVideoInput').click();
      });

    async function handleGalleryUpload(type, e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      const id = 'gal-' + type + '-' + Date.now();
      await saveBlob(id, file);
      if (type === 'image' && isCloudCreatorSignedIn() && fbUser) {
        trackMediaUploadTask(id, 'image', fbUser.uid);
      }
      const url = URL.createObjectURL(file);
      state.gallery.push({
        id,
        mediaType: type,
        mediaId: id,
        mediaUrl: url,
        figureNumber:
          'Fig. ' + String(state.gallery.length + 1).padStart(2, '0'),
        title: file.name.replace(/\.[^.]+$/, '') || 'Our Moment',
        dateLabel: 'Added Memory',
        caption: '',
      });
      persistState();
      renderGallery();
    }
    document
      .getElementById('galleryPhotoInput')
      .addEventListener('change', (e) => handleGalleryUpload('image', e));
    document
      .getElementById('galleryVideoInput')
      .addEventListener('change', (e) => handleGalleryUpload('video', e));

    // Delegated clicks for Timeline, Gallery, Tickets
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-fav-month]');
      if (target) {
        const id = target.getAttribute('data-fav-month');
        const m = state.milestones.find((x) => x.id === id);
        if (m) m.isFavorite = !m.isFavorite;
        persistState();
        renderTimeline();
        return;
      }

      const sec = e.target.closest('[data-toggle-secret]');
      if (sec) {
        const id = sec.getAttribute('data-toggle-secret');
        revealedNotes[id] = !revealedNotes[id];
        renderTimeline();
        return;
      }

      const inspM = e.target.closest('[data-inspect-month]');
      if (inspM) {
        const id = inspM.getAttribute('data-inspect-month');
        const typ = inspM.getAttribute('data-inspect-type');
        const m = state.milestones.find((x) => x.id === id);
        if (m) {
          openLightbox(
            [
              {
                mediaType: typ,
                mediaUrl: typ === 'video' ? m.videoUrl : m.imageUrl,
                title: m.title,
                dateLabel: m.monthLabel + ' · ' + m.dateLabel,
                caption: m.imageCaption || m.story,
                figureNumber: 'Chapter ' + String(m.monthNumber).padStart(2, '0'),
              },
            ],
            0
          );
        }
        return;
      }

      const upM = e.target.closest('[data-upload-month]');
      if (upM) {
        const id = upM.getAttribute('data-upload-month');
        const typ = upM.getAttribute('data-upload-type');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = typ === 'video' ? 'video/*' : 'image/*';
        input.onchange = async () => {
          const file = input.files && input.files[0];
          if (!file) return;
          const m = state.milestones.find((x) => x.id === id);
          if (!m) return;
          const mediaId = 'month-' + id + '-' + typ + '-' + Date.now();
          await saveBlob(mediaId, file);
          if (typ === 'image' && isCloudCreatorSignedIn() && fbUser) {
            trackMediaUploadTask(mediaId, 'image', fbUser.uid);
          }
          const url = URL.createObjectURL(file);
          if (typ === 'image') {
            m.imageMediaId = mediaId;
            m.imageUrl = url;
            m.imageCaption = m.imageCaption || m.title;
          } else {
            m.videoMediaId = mediaId;
            m.videoUrl = url;
            m.videoTitle = file.name.replace(/\.[^.]+$/, '');
          }
          persistState();
          renderTimeline();
        };
        input.click();
        return;
      }

      const delMM = e.target.closest('[data-del-month-media]');
      if (delMM) {
        const id = delMM.getAttribute('data-del-month-media');
        const typ = delMM.getAttribute('data-del-type');
        const m = state.milestones.find((x) => x.id === id);
        if (m) {
          if (typ === 'image') {
            m.imageMediaId = undefined;
            m.imageUrl = undefined;
          } else {
            m.videoMediaId = undefined;
            m.videoUrl = undefined;
          }
          persistState();
          renderTimeline();
        }
        return;
      }

      const editM = e.target.closest('[data-edit-month]');
      if (editM) {
        openStudioModal('month', editM.getAttribute('data-edit-month'));
        return;
      }

      const editGal = e.target.closest('[data-edit-gallery]');
      if (editGal) {
        const id = editGal.getAttribute('data-edit-gallery');
        const g = state.gallery.find((x) => x.id === id);
        if (g) {
          editingGalleryId = id;
          document.getElementById('galEditFig').value = g.figureNumber || '';
          document.getElementById('galEditDate').value = g.dateLabel || '';
          document.getElementById('galEditTitle').value = g.title || '';
          document.getElementById('galEditCaption').value = g.caption || '';
          document.getElementById('galEditFeatured').checked = Boolean(
            g.featured
          );
          document.getElementById('galleryEditModal').classList.remove('hidden');
        }
        return;
      }

      const openGal = e.target.closest('[data-open-gallery]');
      if (openGal) {
        const idx = Number(openGal.getAttribute('data-open-gallery'));
        openLightbox(state.gallery, idx);
        return;
      }

      const delGal = e.target.closest('[data-del-gallery]');
      if (delGal) {
        const id = delGal.getAttribute('data-del-gallery');
        state.gallery = state.gallery.filter((g) => g.id !== id);
        persistState();
        renderGallery();
        return;
      }

      const editTicketBtn = e.target.closest('[data-edit-ticket]');
      if (editTicketBtn) {
        const id = editTicketBtn.getAttribute('data-edit-ticket');
        const t = state.vouchers.find((v) => v.id === id);
        if (t) {
          editingVoucherId = id;
          document.getElementById('vEditCode').value = t.code || '';
          document.getElementById('vEditValidity').value = t.validity || '';
          document.getElementById('vEditTitle').value = t.title || '';
          document.getElementById('vEditDesc').value = t.description || '';
          document.getElementById('voucherEditModal').classList.remove('hidden');
        }
        return;
      }

      const delTicketBtn = e.target.closest('[data-del-ticket]');
      if (delTicketBtn) {
        const id = delTicketBtn.getAttribute('data-del-ticket');
        state.vouchers = state.vouchers.filter((v) => v.id !== id);
        persistState();
        renderTickets();
        renderStudioVouchersList();
        return;
      }

      const studioDelV = e.target.closest('[data-studio-del-v]');
      if (studioDelV) {
        const id = studioDelV.getAttribute('data-studio-del-v');
        state.vouchers = state.vouchers.filter((v) => v.id !== id);
        persistState();
        renderTickets();
        renderStudioVouchersList();
        return;
      }

      const studioResetV = e.target.closest('[data-studio-reset-v]');
      if (studioResetV) {
        const id = studioResetV.getAttribute('data-studio-reset-v');
        const t = state.vouchers.find((v) => v.id === id);
        if (t) {
          t.redeemedAt = null;
          t.notifiedEmail = false;
          t.chosenNote = '';
          if (isCloudCreatorSignedIn() && fbDb && fbStoreMod) {
            fbStoreMod
              .deleteDoc(fbStoreMod.doc(fbDb, 'redemptions', sanitizeMediaId(id)))
              .catch(() => {});
          }
          persistState();
          renderTickets();
          renderStudioVouchersList();
        }
        return;
      }

      const redeemBtn = e.target.closest('[data-redeem-ticket]');
      if (redeemBtn) {
        const id = redeemBtn.getAttribute('data-redeem-ticket');
        const t = state.vouchers.find((v) => v.id === id);
        if (t) {
          activeTicketForModal = t;
          document.getElementById('ticketModalCode').textContent = t.code;
          document.getElementById('ticketModalTitle').textContent =
            'Redeem “' + t.title + '”';
          document.getElementById('ticketModalRecipient').textContent =
            state.notificationEmail;
          document.getElementById('ticketPrefDateInput').value = '';
          document.getElementById('ticketNoteInput').value = '';
          document.getElementById('ticketModalStatus').classList.add('hidden');
          document.getElementById('ticketModal').classList.remove('hidden');
        }
        return;
      }

      const resetT = e.target.closest('[data-reset-ticket]');
      if (resetT) {
        const id = resetT.getAttribute('data-reset-ticket');
        const t = state.vouchers.find((v) => v.id === id);
        if (t) {
          t.redeemedAt = null;
          t.notifiedEmail = false;
          t.chosenNote = '';
          if (isCloudCreatorSignedIn() && fbDb && fbStoreMod) {
            fbStoreMod
              .deleteDoc(fbStoreMod.doc(fbDb, 'redemptions', sanitizeMediaId(id)))
              .catch(() => {});
          }
          persistState();
          renderTickets();
        }
        return;
      }

      // Reasons & Bucket List delegated actions
      if (e.target.closest('#btnNextReason')) {
        if (state.reasons.length > 1) {
          isEditingReason = false;
          reasonIndex = (reasonIndex + 1) % state.reasons.length;
          renderReasonsAndBucket();
        }
        return;
      }
      if (e.target.closest('#btnRandReason')) {
        if (state.reasons.length > 1) {
          isEditingReason = false;
          reasonIndex = (reasonIndex + 1 + Math.floor(Math.random() * (state.reasons.length - 1))) % state.reasons.length;
          renderReasonsAndBucket();
        }
        return;
      }
      if (e.target.closest('#btnToggleEditReason')) {
        isEditingReason = !isEditingReason;
        renderReasonsAndBucket();
        return;
      }
      if (e.target.closest('#btnDeleteReason')) {
        const safeIdx = state.reasons.length > 0 ? reasonIndex % state.reasons.length : 0;
        state.reasons.splice(safeIdx, 1);
        isEditingReason = false;
        reasonIndex = 0;
        persistState();
        renderReasonsAndBucket();
        return;
      }
      const editBucketBtn = e.target.closest('[data-edit-bucket]');
      if (editBucketBtn) {
        editingBucketId = editBucketBtn.getAttribute('data-edit-bucket');
        renderReasonsAndBucket();
        return;
      }
      if (e.target.closest('#btnCancelBucketEdit')) {
        editingBucketId = null;
        renderReasonsAndBucket();
        return;
      }
      const delBucketBtn = e.target.closest('[data-del-bucket]');
      if (delBucketBtn) {
        const id = delBucketBtn.getAttribute('data-del-bucket');
        state.bucketList = state.bucketList.filter((b) => b.id !== id);
        persistState();
        renderReasonsAndBucket();
        return;
      }
    });

    document.addEventListener('change', (e) => {
      const cb = e.target.closest('[data-toggle-bucket]');
      if (cb) {
        const id = cb.getAttribute('data-toggle-bucket');
        const item = state.bucketList.find((b) => b.id === id);
        if (item) {
          item.completed = Boolean(cb.checked);
          persistState();
          renderReasonsAndBucket();
        }
      }
    });

    document.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'formAddReason') {
        e.preventDefault();
        const inp = document.getElementById('inputNewReason');
        const txt = inp ? inp.value.trim() : '';
        if (!txt) return;
        state.reasons.push(txt);
        reasonIndex = state.reasons.length - 1;
        persistState();
        renderReasonsAndBucket();
      } else if (e.target && e.target.id === 'formEditReason') {
        e.preventDefault();
        const inp = document.getElementById('inputEditReason');
        const txt = inp ? inp.value.trim() : '';
        const safeIdx = state.reasons.length > 0 ? reasonIndex % state.reasons.length : 0;
        if (txt && state.reasons[safeIdx] !== undefined) {
          state.reasons[safeIdx] = txt;
          isEditingReason = false;
          persistState();
          renderReasonsAndBucket();
        }
      } else if (e.target && e.target.id === 'formAddBucket') {
        e.preventDefault();
        const inp = document.getElementById('inputNewBucket');
        const txt = inp ? inp.value.trim() : '';
        if (!txt) return;
        state.bucketList.push({ id: 'b-' + Date.now(), text: txt, completed: false });
        persistState();
        renderReasonsAndBucket();
      } else if (e.target && e.target.hasAttribute('data-save-bucket')) {
        e.preventDefault();
        const id = e.target.getAttribute('data-save-bucket');
        const inp = e.target.querySelector('input');
        const txt = inp ? inp.value.trim() : '';
        const item = state.bucketList.find((b) => b.id === id);
        if (item && txt) {
          item.text = txt;
          editingBucketId = null;
          persistState();
          renderReasonsAndBucket();
        }
      }
    });

    // Lightbox controls
    document
      .getElementById('lightboxCloseBtn')
      .addEventListener('click', () => {
        document.getElementById('lightboxModal').classList.add('hidden');
      });
    document
      .getElementById('lightboxPrevBtn')
      .addEventListener('click', () => {
        if (lightboxItems.length <= 1) return;
        activeLightboxIndex =
          (activeLightboxIndex - 1 + lightboxItems.length) %
          lightboxItems.length;
        updateLightboxView();
      });
    document
      .getElementById('lightboxNextBtn')
      .addEventListener('click', () => {
        if (lightboxItems.length <= 1) return;
        activeLightboxIndex = (activeLightboxIndex + 1) % lightboxItems.length;
        updateLightboxView();
      });

    // Ticket modal
    document
      .getElementById('ticketModalCloseBtn')
      .addEventListener('click', () => {
        document.getElementById('ticketModal').classList.add('hidden');
      });
    document
      .getElementById('ticketCancelBtn')
      .addEventListener('click', () => {
        document.getElementById('ticketModal').classList.add('hidden');
      });
    document
      .getElementById('btnGoogleSignIn')
      .addEventListener('click', tryGoogleSignIn);
    document
      .getElementById('ticketConfirmForm')
      .addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!activeTicketForModal) return;
        const prefDate = document
          .getElementById('ticketPrefDateInput')
          .value.trim();
        const note = document.getElementById('ticketNoteInput').value.trim();
        await sendGmailNotificationOrCompose(
          activeTicketForModal,
          prefDate,
          note
        );
        const stamped = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        activeTicketForModal.redeemedAt = stamped;
        activeTicketForModal.notifiedEmail = true;
        activeTicketForModal.chosenNote = note;
        if (fbUser && fbUser.emailVerified && fbDb && fbStoreMod) {
          const safeId = sanitizeMediaId(activeTicketForModal.id);
          const rec = {
            voucherId: safeId,
            ticketCode: clampStr(activeTicketForModal.code, 40, 'TICKET'),
            ticketTitle: clampStr(activeTicketForModal.title, 120, 'Date Ticket'),
            redeemedAtLabel: clampStr(stamped, 40, 'Today'),
            notifiedEmail: true,
            redeemedByUid: fbUser.uid,
            createdAt: fbStoreMod.serverTimestamp(),
          };
          if (prefDate) rec.preferredDate = clampStr(prefDate, 120);
          if (note) rec.personalNote = clampStr(note, 500);
          fbStoreMod
            .setDoc(fbStoreMod.doc(fbDb, 'redemptions', safeId), rec)
            .catch(() => {});
        }
        persistState();
        renderTickets();
        document.getElementById('ticketModal').classList.add('hidden');
      });

    // PIN Modal
    document.getElementById('pinCloseBtn').addEventListener('click', () => {
      document.getElementById('pinModal').classList.add('hidden');
    });
    document.getElementById('pinCancelBtn').addEventListener('click', () => {
      document.getElementById('pinModal').classList.add('hidden');
    });
    document.getElementById('pinForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('pinInput').value.trim();
      if (val === String(state.creatorPin).trim()) {
        isCreatorMode = true;
        document.getElementById('pinModal').classList.add('hidden');
        renderAll();
      } else {
        document.getElementById('pinError').classList.remove('hidden');
      }
    });

    // Creator Toolbar, Inline Shortcuts & Studio Modal
    document
      .getElementById('btnCloudSyncSignIn')
      .addEventListener('click', () => signInCreatorForCloudSync(false));
    document
      .getElementById('btnNoticeSignIn')
      .addEventListener('click', () => signInCreatorForCloudSync(true));
    document
      .getElementById('btnDismissPublishNotice')
      .addEventListener('click', () => {
        document.getElementById('publishSuccessNotice').classList.add('hidden');
      });
    document
      .getElementById('btnNoticeLockLocal')
      .addEventListener('click', () => {
        document.getElementById('creatorSyncNotice').classList.add('hidden');
        cloudSyncErrorMsg = '';
        isCreatorMode = false;
        renderAll();
      });
    document
      .getElementById('btnLockCreator')
      .addEventListener('click', async () => {
        if (isCloudCreatorSignedIn()) {
          try {
            await syncPendingMediaAndKeepsake();
            document.getElementById('creatorSyncNotice').classList.add('hidden');
            isCreatorMode = false;
            renderAll();
            showPublishSuccessNotice();
          } catch {
            // error message displayed cleanly
          }
          return;
        }
        if (hasUnsyncedCreatorEdits || remoteKeepsakeExists === false) {
          await signInCreatorForCloudSync(true);
          if (!isCloudCreatorSignedIn()) {
            document.getElementById('creatorSyncNoticeText').textContent =
              cloudSyncErrorMsg ||
              'Sign in once on this editing device (' +
                CREATOR_EMAIL +
                ') so your edits appear on every phone and laptop without anyone else needing an account.';
            document
              .getElementById('creatorSyncNotice')
              .classList.remove('hidden');
          }
          return;
        }
        isCreatorMode = false;
        renderAll();
      });
    document
      .getElementById('btnEditMonths')
      .addEventListener('click', () => openStudioModal('month'));
    document
      .getElementById('btnEditProfile')
      .addEventListener('click', () => openStudioModal('profile'));
    document
      .getElementById('btnEditLetter')
      .addEventListener('click', () => openStudioModal('letter'));
    document
      .getElementById('btnEditVouchers')
      .addEventListener('click', () => openStudioModal('vouchers'));
    document
      .getElementById('heroEditBtn')
      .addEventListener('click', () => openStudioModal('profile'));
    document
      .getElementById('letterInlineEditBtn')
      .addEventListener('click', () => openStudioModal('letter'));
    document
      .getElementById('btnAddVoucherTrigger')
      .addEventListener('click', () => openStudioModal('vouchers'));
    document
      .getElementById('footerEditBtn')
      .addEventListener('click', () => openStudioModal('profile'));

    const addNewMonthHelper = () => {
      const nextNum = state.milestones.length + 1;
      const newM = {
        id: 'm-' + Date.now(),
        monthNumber: nextNum,
        monthLabel: 'Month ' + String(nextNum).padStart(2, '0'),
        dateLabel: 'Special Day',
        location: '',
        title: 'Month ' + String(nextNum).padStart(2, '0'),
        story: '',
        secretNote: '',
        isFavorite: false,
      };
      state.milestones.push(newM);
      persistState();
      renderTimeline();
      openStudioModal('month', newM.id);
    };

    document
      .getElementById('btnAddExtraMonth')
      .addEventListener('click', addNewMonthHelper);
    document
      .getElementById('studioNewMonthBtn')
      .addEventListener('click', addNewMonthHelper);

    document
      .getElementById('studioCloseBtn')
      .addEventListener('click', () => {
        document.getElementById('studioModal').classList.add('hidden');
      });
    document.querySelectorAll('#studioTabs .seg-btn').forEach((btn) => {
      btn.addEventListener('click', () =>
        switchStudioTab(btn.getAttribute('data-studiotab'))
      );
    });
    document
      .getElementById('studioMonthSelect')
      .addEventListener('change', (e) => {
        loadSelectedMonthFields(e.target.value);
      });

    document
      .getElementById('studioDeleteMonthBtn')
      .addEventListener('click', () => {
        if (state.milestones.length <= 1) return;
        state.milestones = state.milestones.filter((m) => m.id !== studioMonthId);
        persistState();
        renderTimeline();
        document.getElementById('studioModal').classList.add('hidden');
      });

    document
      .getElementById('studioMonthForm')
      .addEventListener('submit', (e) => {
        e.preventDefault();
        const m = state.milestones.find((x) => x.id === studioMonthId);
        if (m) {
          const num = Math.max(
            1,
            Number(document.getElementById('studioMonthNum').value) ||
              m.monthNumber
          );
          m.monthNumber = num;
          m.monthLabel = 'Month ' + String(num).padStart(2, '0');
          m.dateLabel = document.getElementById('studioMonthDate').value.trim();
          m.location = document
            .getElementById('studioMonthLocation')
            .value.trim();
          m.title = document.getElementById('studioMonthTitle').value.trim();
          m.story = document.getElementById('studioMonthStory').value.trim();
          m.secretNote = document
            .getElementById('studioMonthSecret')
            .value.trim();
          m.imageCaption = document
            .getElementById('studioMonthImgCap')
            .value.trim();
          m.videoTitle = document
            .getElementById('studioMonthVidTitle')
            .value.trim();
          persistState();
          renderTimeline();
        }
        document.getElementById('studioModal').classList.add('hidden');
      });

    document
      .getElementById('studioProfileForm')
      .addEventListener('submit', (e) => {
        e.preventDefault();
        state.brandTitle =
          document.getElementById('profBrandTitle').value.trim() ||
          state.brandTitle;
        state.partnerName =
          document.getElementById('profPartner').value.trim() || 'Mahal';
        state.senderName =
          document.getElementById('profSender').value.trim() || 'Bobby';
        state.notificationEmail =
          document.getElementById('profEmail').value.trim() ||
          'bobbybestparaiso@gmail.com';
        const dt = document.getElementById('profStartDate').value;
        if (dt) state.startDateIso = dt + 'T00:00:00';
        state.heroKicker =
          document.getElementById('profKicker').value.trim() ||
          state.heroKicker;
        state.heroHeadline =
          document.getElementById('profHeadline').value.trim() ||
          state.heroHeadline;
        state.heroCaption =
          document.getElementById('profCaption').value.trim() ||
          state.heroCaption;
        state.heroLead =
          document.getElementById('profLead').value.trim() || state.heroLead;
        state.songTitle =
          document.getElementById('profSongTitle').value.trim() ||
          state.songTitle;
        state.songArtist =
          document.getElementById('profSongArtist').value.trim() ||
          state.songArtist;
        state.youtubeVideoId =
          document.getElementById('profYoutubeId').value.trim() ||
          state.youtubeVideoId;
        state.footerNote =
          document.getElementById('profFooterNote').value.trim() ||
          state.footerNote;
        persistState();
        renderAll();
        document.getElementById('studioModal').classList.add('hidden');
      });

    document
      .getElementById('studioLetterForm')
      .addEventListener('submit', (e) => {
        e.preventDefault();
        state.letterSalutation =
          document.getElementById('letSalutation').value.trim() ||
          state.letterSalutation;
        const paras = document
          .getElementById('letBody')
          .value.split(/\n\s*\n/)
          .map((x) => x.trim())
          .filter(Boolean);
        if (paras.length > 0) state.letterParagraphs = paras;
        state.letterSignOff =
          document.getElementById('letSignOff').value.trim() ||
          state.letterSignOff;
        persistState();
        renderHeroAndLetter();
        document.getElementById('studioModal').classList.add('hidden');
      });

    document
      .getElementById('studioAddVoucherForm')
      .addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('newVoucherTitle').value.trim();
        if (!title) return;
        const nextNum = String(state.vouchers.length + 1).padStart(2, '0');
        state.vouchers.push({
          id: 'v-' + Date.now(),
          code:
            document.getElementById('newVoucherCode').value.trim() ||
            'TICKET ' + nextNum,
          title,
          description:
            document.getElementById('newVoucherDesc').value.trim() ||
            'Redeemable anytime for our special date.',
          validity:
            document.getElementById('newVoucherValidity').value.trim() ||
            'Valid Anytime',
          redeemedAt: null,
          notifiedEmail: false,
          chosenNote: '',
        });
        document.getElementById('newVoucherCode').value = '';
        document.getElementById('newVoucherTitle').value = '';
        document.getElementById('newVoucherDesc').value = '';
        document.getElementById('newVoucherValidity').value = 'Valid Anytime';
        persistState();
        renderTickets();
        renderStudioVouchersList();
      });

    // Gallery Frame Edit Modal wiring
    document
      .getElementById('galEditCloseBtn')
      .addEventListener('click', () => {
        document.getElementById('galleryEditModal').classList.add('hidden');
      });
    document
      .getElementById('galEditCancelBtn')
      .addEventListener('click', () => {
        document.getElementById('galleryEditModal').classList.add('hidden');
      });
    document
      .getElementById('btnGalReplacePhoto')
      .addEventListener('click', () => {
        document.getElementById('galReplacePhotoInput').click();
      });
    document
      .getElementById('btnGalReplaceVideo')
      .addEventListener('click', () => {
        document.getElementById('galReplaceVideoInput').click();
      });
    async function replaceGalleryMedia(type, e) {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file || !editingGalleryId) return;
      const g = state.gallery.find((x) => x.id === editingGalleryId);
      if (!g) return;
      const id = 'gal-' + type + '-' + Date.now();
      await saveBlob(id, file);
      if (type === 'image' && isCloudCreatorSignedIn() && fbUser) {
        trackMediaUploadTask(id, 'image', fbUser.uid);
      }
      g.mediaType = type;
      g.mediaId = id;
      g.mediaUrl = URL.createObjectURL(file);
      persistState();
      renderGallery();
    }
    document
      .getElementById('galReplacePhotoInput')
      .addEventListener('change', (e) => replaceGalleryMedia('image', e));
    document
      .getElementById('galReplaceVideoInput')
      .addEventListener('change', (e) => replaceGalleryMedia('video', e));
    document
      .getElementById('galleryEditForm')
      .addEventListener('submit', (e) => {
        e.preventDefault();
        const g = state.gallery.find((x) => x.id === editingGalleryId);
        if (g) {
          const isFeat = document.getElementById('galEditFeatured').checked;
          if (isFeat) {
            state.gallery.forEach((item) => {
              item.featured = item.id === g.id;
            });
          } else {
            g.featured = false;
          }
          g.figureNumber =
            document.getElementById('galEditFig').value.trim() ||
            g.figureNumber;
          g.dateLabel =
            document.getElementById('galEditDate').value.trim() || g.dateLabel;
          g.title = document.getElementById('galEditTitle').value.trim() || g.title;
          g.caption = document.getElementById('galEditCaption').value.trim();
          persistState();
          renderGallery();
        }
        document.getElementById('galleryEditModal').classList.add('hidden');
      });

    // Voucher Edit Modal wiring
    document.getElementById('vEditCloseBtn').addEventListener('click', () => {
      document.getElementById('voucherEditModal').classList.add('hidden');
    });
    document.getElementById('vEditCancelBtn').addEventListener('click', () => {
      document.getElementById('voucherEditModal').classList.add('hidden');
    });
    document
      .getElementById('voucherEditForm')
      .addEventListener('submit', (e) => {
        e.preventDefault();
        const v = state.vouchers.find((x) => x.id === editingVoucherId);
        if (v) {
          v.code = document.getElementById('vEditCode').value.trim() || v.code;
          v.validity =
            document.getElementById('vEditValidity').value.trim() ||
            'Valid Anytime';
          v.title = document.getElementById('vEditTitle').value.trim() || v.title;
          v.description =
            document.getElementById('vEditDesc').value.trim() || v.description;
          persistState();
          renderTickets();
          renderStudioVouchersList();
        }
        document.getElementById('voucherEditModal').classList.add('hidden');
      });

    document
      .getElementById('studioResetBtn')
      .addEventListener('click', async () => {
        await clearBlobs().catch(() => {});
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(HTML_SIG_KEY);
        state = buildBaseData();
        persistState();
        renderAll();
        document.getElementById('studioModal').classList.add('hidden');
      });
  });
})();
