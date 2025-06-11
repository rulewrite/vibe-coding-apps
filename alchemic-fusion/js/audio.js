/**
 * 알케믹 퓨전 - 오디오 시스템
 * 배경음악과 효과음을 관리합니다.
 */

class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.masterVolume = 0.7;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.8;
    this.sounds = new Map();
    this.currentMusic = null;
    this.isMuted = false;

    this.init();
  }

  async init() {
    try {
      // Web Audio API 초기화
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // 마스터 볼륨 노드 생성
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.audioContext.destination);

      // 음악 볼륨 노드 생성
      this.musicGain = this.audioContext.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);

      // 효과음 볼륨 노드 생성
      this.sfxGain = this.audioContext.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      // 사운드 생성
      this.generateSounds();

      console.log('🎵 오디오 시스템이 초기화되었습니다.');
    } catch (error) {
      console.warn('오디오 시스템 초기화 실패:', error);
    }
  }

  // 프로시저럴 사운드 생성
  generateSounds() {
    // 배경음악
    this.createBackgroundMusic();

    // 효과음들
    this.createReactionSounds();
    this.createUISounds();
    this.createAmbientSounds();
  }

  createBackgroundMusic() {
    // 신비로운 분위기의 배경음악
    const musicBuffer = this.createMysticalAmbience();
    this.sounds.set('background', musicBuffer);
  }

  createMysticalAmbience() {
    const duration = 60; // 60초 루프
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);

      for (let i = 0; i < length; i++) {
        const time = i / sampleRate;

        // 기본 드론 사운드 (낮은 주파수)
        const drone = Math.sin(2 * Math.PI * 55 * time) * 0.1;

        // 하모닉스 추가
        const harmonic1 = Math.sin(2 * Math.PI * 110 * time) * 0.05;
        const harmonic2 = Math.sin(2 * Math.PI * 165 * time) * 0.03;

        // 신비로운 벨 소리
        const bell =
          Math.sin(2 * Math.PI * 880 * time) * Math.exp(-time % 10) * 0.02;

        // 바람 소리 (노이즈)
        const wind =
          (Math.random() - 0.5) * 0.01 * Math.sin(2 * Math.PI * 0.1 * time);

        // 채널별로 약간의 차이 추가 (스테레오 효과)
        const channelOffset = channel === 0 ? 1 : 1.1;

        channelData[i] =
          (drone + harmonic1 + harmonic2 + bell + wind) * channelOffset;
      }
    }

    return buffer;
  }

  createReactionSounds() {
    const reactionSounds = {
      grow: () => this.createGrowthSound(),
      ignite: () => this.createIgniteSound(),
      solidify: () => this.createSolidifySound(),
      forge: () => this.createForgeSound(),
      flow: () => this.createFlowSound(),
      scatter: () => this.createScatterSound(),
      steam: () => this.createSteamSound(),
      sizzle: () => this.createSizzleSound(),
      melt: () => this.createMeltSound(),
      chop: () => this.createChopSound(),
      slash: () => this.createSlashSound(),
      crack: () => this.createCrackSound(),
      weather: () => this.createWeatherSound(),
    };

    Object.entries(reactionSounds).forEach(([name, generator]) => {
      this.sounds.set(name, generator());
    });
  }

  createGrowthSound() {
    return this.createToneSweep(200, 800, 0.8, 'sine', 0.3);
  }

  createIgniteSound() {
    return this.createNoiseWithTone(1000, 0.5, 0.4);
  }

  createSolidifySound() {
    return this.createToneSweep(800, 400, 0.6, 'square', 0.5);
  }

  createForgeSound() {
    return this.createMetallicHit(600, 0.8, 0.6);
  }

  createFlowSound() {
    return this.createWaterSound(0.7, 0.4);
  }

  createScatterSound() {
    return this.createWindSound(0.5, 0.3);
  }

  createSteamSound() {
    return this.createHissSound(1.2, 0.5);
  }

  createSizzleSound() {
    return this.createSizzleEffect(0.8, 0.4);
  }

  createMeltSound() {
    return this.createBubbleSound(1.0, 0.5);
  }

  createChopSound() {
    return this.createCutSound(0.3, 0.7);
  }

  createSlashSound() {
    return this.createWhipSound(0.2, 0.6);
  }

  createCrackSound() {
    return this.createCrackEffect(0.4, 0.6);
  }

  createWeatherSound() {
    return this.createWindstormSound(1.5, 0.4);
  }

  createUISounds() {
    this.sounds.set('click', this.createClickSound());
    this.sounds.set('hover', this.createHoverSound());
    this.sounds.set('join', this.createJoinSound());
    this.sounds.set('start', this.createStartSound());
    this.sounds.set('victory', this.createVictorySound());
  }

  createClickSound() {
    return this.createTone(800, 0.1, 'sine', 0.3);
  }

  createHoverSound() {
    return this.createTone(600, 0.05, 'sine', 0.2);
  }

  createJoinSound() {
    return this.createChord([400, 500, 600], 0.3, 0.4);
  }

  createStartSound() {
    return this.createFanfare(1.5, 0.6);
  }

  createVictorySound() {
    return this.createVictoryFanfare(3.0, 0.7);
  }

  createAmbientSounds() {
    this.sounds.set('lab_ambience', this.createLabAmbience());
    this.sounds.set('magic_loop', this.createMagicLoop());
  }

  // 사운드 생성 유틸리티 메서드들
  createTone(frequency, duration, waveType = 'sine', volume = 0.5) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      let wave = 0;

      switch (waveType) {
        case 'sine':
          wave = Math.sin(2 * Math.PI * frequency * time);
          break;
        case 'square':
          wave = Math.sign(Math.sin(2 * Math.PI * frequency * time));
          break;
        case 'sawtooth':
          wave = 2 * (time * frequency - Math.floor(time * frequency + 0.5));
          break;
        case 'triangle':
          wave =
            2 *
              Math.abs(
                2 * (time * frequency - Math.floor(time * frequency + 0.5))
              ) -
            1;
          break;
      }

      // 엔벨로프 적용 (ADSR)
      const envelope = this.calculateEnvelope(time, duration);
      data[i] = wave * volume * envelope;
    }

    return buffer;
  }

  createToneSweep(
    startFreq,
    endFreq,
    duration,
    waveType = 'sine',
    volume = 0.5
  ) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      const progress = time / duration;
      const frequency = startFreq + (endFreq - startFreq) * progress;

      let wave = 0;
      switch (waveType) {
        case 'sine':
          wave = Math.sin(2 * Math.PI * frequency * time);
          break;
        case 'square':
          wave = Math.sign(Math.sin(2 * Math.PI * frequency * time));
          break;
      }

      const envelope = this.calculateEnvelope(time, duration);
      data[i] = wave * volume * envelope;
    }

    return buffer;
  }

  createNoiseWithTone(centerFreq, duration, volume = 0.5) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;

      // 노이즈
      const noise = (Math.random() - 0.5) * 2;

      // 톤 컴포넌트
      const tone = Math.sin(2 * Math.PI * centerFreq * time) * 0.3;

      const envelope = this.calculateEnvelope(time, duration);
      data[i] = (noise * 0.7 + tone * 0.3) * volume * envelope;
    }

    return buffer;
  }

  createChord(frequencies, duration, volume = 0.5) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      let sum = 0;

      frequencies.forEach((freq) => {
        sum += Math.sin(2 * Math.PI * freq * time);
      });

      const envelope = this.calculateEnvelope(time, duration);
      data[i] = (sum / frequencies.length) * volume * envelope;
    }

    return buffer;
  }

  createMetallicHit(frequency, duration, volume = 0.5) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;

      // 메탈릭 사운드 (여러 하모닉스)
      let metallic = 0;
      for (let harmonic = 1; harmonic <= 5; harmonic++) {
        metallic +=
          Math.sin(2 * Math.PI * frequency * harmonic * time) / harmonic;
      }

      // 노이즈 추가
      const noise = (Math.random() - 0.5) * 0.2;

      const envelope = Math.exp(-time * 5); // 빠른 감쇠
      data[i] = (metallic + noise) * volume * envelope;
    }

    return buffer;
  }

  createWaterSound(duration, volume = 0.5) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;

      // 물소리 (고주파 노이즈 + 버블링)
      const noise = (Math.random() - 0.5) * 2;
      const bubble =
        Math.sin(2 * Math.PI * 200 * time * (1 + Math.sin(time * 10))) * 0.3;

      const envelope = this.calculateEnvelope(time, duration);
      data[i] = (noise * 0.7 + bubble * 0.3) * volume * envelope;
    }

    return buffer;
  }

  createWindSound(duration, volume = 0.5) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;

      // 바람소리 (저주파 노이즈)
      const wind = (Math.random() - 0.5) * 2;
      const whoosh =
        Math.sin(2 * Math.PI * 80 * time) * Math.sin(time * 5) * 0.5;

      const envelope = this.calculateEnvelope(time, duration);
      data[i] = (wind * 0.6 + whoosh * 0.4) * volume * envelope;
    }

    return buffer;
  }

  createHissSound(duration, volume = 0.5) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;

      // 히스 사운드 (고주파 노이즈)
      const hiss = (Math.random() - 0.5) * 2;

      // 고주파 필터링
      const filtered = hiss * (1 - Math.exp(-time * 3));

      const envelope = Math.exp(-time * 0.8);
      data[i] = filtered * volume * envelope;
    }

    return buffer;
  }

  calculateEnvelope(
    time,
    duration,
    attack = 0.1,
    decay = 0.1,
    sustain = 0.7,
    release = 0.2
  ) {
    const attackTime = duration * attack;
    const decayTime = attackTime + duration * decay;
    const sustainTime = duration - duration * release;

    if (time < attackTime) {
      return time / attackTime;
    } else if (time < decayTime) {
      return (
        1 - ((1 - sustain) * (time - attackTime)) / (decayTime - attackTime)
      );
    } else if (time < sustainTime) {
      return sustain;
    } else {
      return sustain * (1 - (time - sustainTime) / (duration - sustainTime));
    }
  }

  // 사운드 재생 메서드들
  playSound(soundName, volume = 1.0, pitch = 1.0) {
    if (this.isMuted || !this.audioContext || !this.sounds.has(soundName)) {
      return;
    }

    try {
      const buffer = this.sounds.get(soundName);
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      source.playbackRate.value = pitch;

      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(this.sfxGain);

      source.start();

      // 자동 정리
      source.onended = () => {
        source.disconnect();
        gainNode.disconnect();
      };

      return source;
    } catch (error) {
      console.warn(`사운드 재생 실패: ${soundName}`, error);
    }
  }

  playBackgroundMusic(loop = true) {
    if (this.isMuted || !this.audioContext || !this.sounds.has('background')) {
      return;
    }

    try {
      if (this.currentMusic) {
        this.currentMusic.stop();
      }

      const buffer = this.sounds.get('background');
      const source = this.audioContext.createBufferSource();

      source.buffer = buffer;
      source.loop = loop;
      source.connect(this.musicGain);

      source.start();
      this.currentMusic = source;

      source.onended = () => {
        if (this.currentMusic === source) {
          this.currentMusic = null;
        }
      };
    } catch (error) {
      console.warn('배경음악 재생 실패:', error);
    }
  }

  stopBackgroundMusic() {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  // 반응 사운드 재생
  playReactionSound(reactionType) {
    const soundMap = {
      growth: 'grow',
      amplify: 'ignite',
      harden: 'solidify',
      refine: 'forge',
      spring: 'flow',
      seed: 'scatter',
      steam: 'steam',
      extinguish: 'sizzle',
      melt: 'melt',
      cut: 'chop',
      slice: 'slash',
      crack: 'crack',
      weather: 'weather',
    };

    const soundName = soundMap[reactionType];
    if (soundName) {
      this.playSound(soundName, 0.7, 1.0 + (Math.random() - 0.5) * 0.2);
    }
  }

  // UI 사운드 재생
  playUISound(action) {
    const soundMap = {
      click: 'click',
      hover: 'hover',
      join: 'join',
      start: 'start',
      victory: 'victory',
    };

    const soundName = soundMap[action];
    if (soundName) {
      this.playSound(soundName);
    }
  }

  // 볼륨 제어
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume;
    }
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain) {
      this.musicGain.gain.value = this.musicVolume;
    }
  }

  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.sfxVolume;
    }
  }

  // 음소거
  toggleMute() {
    this.isMuted = !this.isMuted;

    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume;
    }

    return this.isMuted;
  }

  // 오디오 컨텍스트 재개 (사용자 상호작용 후 필요)
  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

// 사용자 상호작용 후 오디오 컨텍스트 활성화
document.addEventListener(
  'click',
  () => {
    if (window.AudioSystem) {
      window.AudioSystem.resumeAudioContext();
    }
  },
  { once: true }
);

// 전역 오디오 시스템 인스턴스 생성
window.AudioSystem = new AudioSystem();
