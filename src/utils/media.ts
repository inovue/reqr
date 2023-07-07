const ms = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
const track = ms.getTracks()[0]
track.applyConstraints({
  advanced: [{ width: 1280, height: 720, frameRate: 60 }]
})

const isTrackConstraintSupported = (track:MediaStreamTrack, key:string) => key in track.getCapabilities();


const setConstraints = (track:MediaStreamTrack, value:MediaTrackConstraintSet) => {
  value.torch = true
}

interface ImageTrackConstraintSet extends MediaTrackConstraintSet {
  aspectRatio
  facingMode
  frameRate
  height
  width
  resizeMode
  torch?: boolean
}