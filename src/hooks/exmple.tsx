import React, { useRef, useEffect, useState } from 'react';

const useVideoCapture = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capture, setCapture] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    const captureFrame = () => {
      if (video && !video.paused && !video.ended && canvas && context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataURL = canvas.toDataURL();
        setCapture(imageDataURL);
      }
      requestAnimationFrame(captureFrame);
    };

    const cleanup = () => {
      if (canvas) {
        canvas.remove();
      }
    };

    if (video && canvas) {
      const videoParent = video.parentNode;
      videoParent?.insertBefore(canvas, video.nextSibling);
    }

    if (video) {
      video.addEventListener('play', captureFrame);
      video.addEventListener('pause', cleanup);
      video.addEventListener('ended', cleanup);
    }

    return () => {
      if (video) {
        video.removeEventListener('play', captureFrame);
        video.removeEventListener('pause', cleanup);
        video.removeEventListener('ended', cleanup);
      }
      cleanup();
    };
  }, [videoRef]);

  return capture;
};

// 使用例
const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const capture = useVideoCapture(videoRef);

  return (
    <div>
      <video ref={videoRef} controls src="path/to/video.mp4" />
      {capture && <img src={capture} alt="Video Capture" />}
    </div>
  );
};


/*
`requestAnimationFrame`を使用する理由は、
アニメーションや連続的な更新が必要な処理をブラウザのリフレッシュレートに同期させるためです。
これにより、最適なパフォーマンスとスムーズなアニメーションが実現されます。

`requestAnimationFrame`は、ブラウザが次のフレームを描画する直前にコールバック関数を呼び出します。
このメソッドはブラウザの再描画イベントと同期して動作し、
画面のリフレッシュレートに合わせたタイミングでコールバックが実行されます。そのため、
可能な限り効率的なアニメーションや更新処理を実行することができます。

上記の例では、`captureFrame`というコールバック関数を`requestAnimationFrame`内で呼び出しています。
これにより、ビデオの再生中にフレームごとのキャプチャを行うことができます。
`captureFrame`はビデオが再生中であり、ビデオが停止または終了しない限り、連続的に呼び出されます。

この方法により、ビデオのフレームごとのキャプチャを正確に取得し、再生中の映像をキャプチャとして使用することができます。
`requestAnimationFrame`を使用することで、ブラウザのリフレッシュレートと同期し、パフォーマンスの向上とスムーズなアニメーションの実現が可能になります。
*/