import * as faceapi from 'face-api.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRequest } from '../../../context/RequestContext.jsx'

const SUB_STEPS = [
  { id: 'cedula-front', label: 'Cédula frontal', guideColor: '#0ea5e9', guideText: 'CÉDULA — LADO FRONTAL', shape: 'rect', facingMode: 'environment' },
  { id: 'cedula-back', label: 'Cédula trasera', guideColor: '#22c55e', guideText: 'CÉDULA — LADO TRASERO', shape: 'rect', facingMode: 'environment' },
  { id: 'selfie', label: 'Selfie', guideColor: '#a855f7', guideText: 'ROSTRO', shape: 'oval', facingMode: 'user' },
  { id: 'result', label: 'Resultado' },
]

const MIN_FACE_SIZE = 200

export default function StepBiometria() {
  const ctx = useRequest()
  const { updateField, updateFields, setStep, submitRequest, submitting } = ctx
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [subStep, setSubStep] = useState(0)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [loadingModels, setLoadingModels] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [cedulaDescriptor, setCedulaDescriptor] = useState(null)
  const [faceError, setFaceError] = useState(null)

  // Preview state: after capture, show image before confirming
  const [preview, setPreview] = useState(null) // { image, descriptor? }
  const [selfieAttempts, setSelfieAttempts] = useState(0)
  const MAX_SELFIE_RETRIES = 5

  useEffect(() => {
    let cancelled = false
    async function loadModels() {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ])
        if (!cancelled) { setModelsLoaded(true); setLoadingModels(false) }
      } catch {
        if (!cancelled) setLoadingModels(false)
      }
    }
    loadModels()
    return () => { cancelled = true }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const startCamera = useCallback(async (facingMode) => {
    stopCamera()
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = s
      if (videoRef.current) videoRef.current.srcObject = s
    } catch {
      setFaceError('No se pudo acceder a la cámara.')
    }
  }, [stopCamera])

  // Start camera when entering a capture sub-step (and not in preview)
  useEffect(() => {
    if (!(subStep < 3 && modelsLoaded && !preview)) return
    let cancelled = false
    const facingMode = SUB_STEPS[subStep].facingMode
    stopCamera()
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      .then((s) => {
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = s
        if (videoRef.current) videoRef.current.srcObject = s
      })
      .catch(() => {
        if (!cancelled) setFaceError('No se pudo acceder a la cámara.')
      })
    return () => { cancelled = true; stopCamera() }
  }, [subStep, modelsLoaded, preview, stopCamera])

  const captureFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return null
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.85)
  }, [])

  const cropFaceFromImage = useCallback(async (imageDataUrl, detection) => {
    const box = detection.detection.box
    const img = new Image()
    await new Promise((resolve) => { img.onload = resolve; img.src = imageDataUrl })
    const pad = 0.5
    const x = Math.max(0, Math.round(box.x - box.width * pad))
    const y = Math.max(0, Math.round(box.y - box.height * pad))
    const w = Math.min(img.width - x, Math.round(box.width * (1 + pad * 2)))
    const h = Math.min(img.height - y, Math.round(box.height * (1 + pad * 2)))
    const scale = Math.max(1, MIN_FACE_SIZE / Math.min(w, h))
    const outW = Math.round(w * scale)
    const outH = Math.round(h * scale)
    const cropCanvas = document.createElement('canvas')
    cropCanvas.width = outW
    cropCanvas.height = outH
    const c = cropCanvas.getContext('2d')
    c.imageSmoothingEnabled = true
    c.imageSmoothingQuality = 'high'
    c.drawImage(img, x, y, w, h, 0, 0, outW, outH)
    return cropCanvas.toDataURL('image/jpeg', 0.92)
  }, [])

  // Capture photo → process → show preview (don't advance yet)
  const handleCapture = useCallback(async () => {
    setProcessing(true)
    setFaceError(null)
    const imageData = captureFrame()
    if (!imageData) { setProcessing(false); return }

    stopCamera()

    if (subStep === 0) {
      // Cedula front — need face detection
      const img = await faceapi.fetchImage(imageData)
      const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
      if (!detection) {
        setFaceError('No se detectó un rostro en la cédula. Asegúrese de que la foto sea visible y clara.')
        setProcessing(false)
        startCamera(SUB_STEPS[0].facingMode)
        return
      }
      // Crop face and get better descriptor
      const croppedUrl = await cropFaceFromImage(imageData, detection)
      const croppedImg = await faceapi.fetchImage(croppedUrl)
      const croppedDet = await faceapi.detectSingleFace(croppedImg).withFaceLandmarks().withFaceDescriptor()
      setPreview({ image: imageData, descriptor: croppedDet ? croppedDet.descriptor : detection.descriptor })
    } else if (subStep === 1) {
      // Cedula back — no face detection needed
      setPreview({ image: imageData })
    } else if (subStep === 2) {
      // Selfie — need face detection
      const img = await faceapi.fetchImage(imageData)
      const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
      if (!detection) {
        setFaceError('No se detectó un rostro. Mire directamente a la cámara con buena iluminación.')
        setProcessing(false)
        startCamera(SUB_STEPS[2].facingMode)
        return
      }
      // Crop selfie face for fair comparison
      const croppedUrl = await cropFaceFromImage(imageData, detection)
      const croppedImg = await faceapi.fetchImage(croppedUrl)
      const croppedDet = await faceapi.detectSingleFace(croppedImg).withFaceLandmarks().withFaceDescriptor()
      setPreview({ image: imageData, descriptor: croppedDet ? croppedDet.descriptor : detection.descriptor })
    }
    setProcessing(false)
  }, [subStep, captureFrame, cropFaceFromImage, stopCamera, startCamera])

  // User confirms the preview → save to context and advance
  const handleConfirmPreview = useCallback(() => {
    if (!preview) return

    if (subStep === 0) {
      setCedulaDescriptor(preview.descriptor)
      updateField('docCedulaFrontal', preview.image)
      setPreview(null)
      setSubStep(1)
    } else if (subStep === 1) {
      updateField('docCedulaTrasera', preview.image)
      setPreview(null)
      setSubStep(2)
    } else if (subStep === 2) {
      updateField('selfieBase64', preview.image)
      if (cedulaDescriptor && preview.descriptor) {
        const distance = faceapi.euclideanDistance(cedulaDescriptor, preview.descriptor)
        const score = parseFloat((1 - distance).toFixed(4))
        const aprobada = distance < 0.6
        updateFields({ biometriaScore: score, biometriaAprobada: aprobada })

        if (!aprobada) {
          const attempt = selfieAttempts + 1
          setSelfieAttempts(attempt)
          if (attempt < MAX_SELFIE_RETRIES) {
            // Still has retries — go back to selfie camera
            setPreview(null)
            setFaceError(`Identidad no verificada (intento ${attempt}/${MAX_SELFIE_RETRIES}). Intente con mejor iluminación o ángulo.`)
            return
          }
          // Exhausted retries — must restart from cedula
        }
      }
      setPreview(null)
      setSubStep(3)
    }
  }, [preview, subStep, cedulaDescriptor, selfieAttempts, updateField, updateFields])

  // User wants to retake the photo
  const handleRetakePreview = useCallback(() => {
    setPreview(null)
    setFaceError(null)
    // Camera will restart via the useEffect when preview becomes null
  }, [])

  const handleSubmit = async () => {
    try { await submitRequest() } catch { /* error in context */ }
  }

  const handleRetryAll = () => {
    setCedulaDescriptor(null)
    setPreview(null)
    setFaceError(null)
    setSelfieAttempts(0)
    updateFields({
      docCedulaFrontal: null, docCedulaTrasera: null,
      selfieBase64: null, biometriaScore: null, biometriaAprobada: false,
    })
    setSubStep(0)
  }

  const similitud = ctx.biometriaScore != null ? Math.round(ctx.biometriaScore * 100) : 0
  const nivelSimilitud = similitud >= 45 ? 'Muy alto' : similitud >= 40 ? 'Alto' : similitud >= 33 ? 'Medio' : similitud >= 20 ? 'Bajo' : 'Muy bajo'

  // --- Loading states ---
  if (loadingModels) {
    return (
      <div className="space-y-4 py-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
        <p className="text-sm text-slate-600">Cargando modelos de reconocimiento facial...</p>
        <p className="text-xs text-slate-400">Esto puede tomar unos segundos la primera vez.</p>
      </div>
    )
  }

  if (!modelsLoaded) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-red-600">No se pudieron cargar los modelos de reconocimiento facial.</p>
        <button type="button" className="mt-4 rounded-lg border px-4 py-2 text-sm" onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    )
  }

  // --- Capture labels ---
  const captureLabels = [
    'Centre su cédula dentro del recuadro guía. Asegúrese de buena iluminación.',
    'Voltee su cédula y centre la parte trasera.',
    'Mire directamente a la cámara para capturar su selfie.',
  ]
  const previewLabels = [
    'Vista previa — Cédula frontal capturada.',
    'Vista previa — Cédula trasera capturada.',
    'Vista previa — Selfie capturada.',
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Validación biométrica</h2>
        <p className="mt-1 text-sm text-slate-600">Capture su cédula y selfie para verificar su identidad.</p>
      </div>

      {/* Sub-step indicators */}
      <div className="flex flex-wrap gap-2">
        {SUB_STEPS.map((s, i) => (
          <span key={s.id} className={['rounded-lg px-3 py-1.5 text-xs font-medium', subStep === i ? 'bg-slate-900 text-white' : i < subStep ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'].join(' ')}>
            {i < subStep ? '✓ ' : ''}{s.label}
          </span>
        ))}
      </div>

      {/* ===== PREVIEW MODE ===== */}
      {subStep < 3 && preview && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-700">{previewLabels[subStep]}</p>

          <div className="mx-auto overflow-hidden rounded-xl border-2 border-slate-200" style={{ maxWidth: 560 }}>
            <img src={preview.image} alt="Captura" className="w-full object-contain" />
          </div>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50"
              onClick={handleRetakePreview}
            >
              Tomar otra imagen
            </button>
            <button
              type="button"
              className="rounded-lg px-5 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: SUB_STEPS[subStep].guideColor }}
              onClick={handleConfirmPreview}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* ===== CAMERA MODE ===== */}
      {subStep < 3 && !preview && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">{captureLabels[subStep]}</p>

          <div className="relative mx-auto overflow-hidden rounded-xl bg-black" style={{ maxWidth: 560, aspectRatio: subStep === 2 ? '3/4' : '85.6/54' }}>
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />

            {/* Rectangular guide for cedula */}
            {SUB_STEPS[subStep].shape === 'rect' && (
              <div className="absolute rounded-lg border-2 border-dashed" style={{ borderColor: SUB_STEPS[subStep].guideColor, top: '6%', bottom: '6%', left: '8%', right: '8%' }}>
                <div className="absolute -left-px -top-px h-6 w-6 rounded-tl-lg border-l-[3px] border-t-[3px]" style={{ borderColor: SUB_STEPS[subStep].guideColor }} />
                <div className="absolute -right-px -top-px h-6 w-6 rounded-tr-lg border-r-[3px] border-t-[3px]" style={{ borderColor: SUB_STEPS[subStep].guideColor }} />
                <div className="absolute -bottom-px -left-px h-6 w-6 rounded-bl-lg border-b-[3px] border-l-[3px]" style={{ borderColor: SUB_STEPS[subStep].guideColor }} />
                <div className="absolute -bottom-px -right-px h-6 w-6 rounded-br-lg border-b-[3px] border-r-[3px]" style={{ borderColor: SUB_STEPS[subStep].guideColor }} />
                <div className="flex h-full items-center justify-center">
                  <span className="text-xs opacity-60" style={{ color: SUB_STEPS[subStep].guideColor }}>{SUB_STEPS[subStep].guideText}</span>
                </div>
              </div>
            )}

            {/* Oval guide for selfie */}
            {SUB_STEPS[subStep].shape === 'oval' && (
              <div
                className="absolute border-2 border-dashed flex items-center justify-center"
                style={{
                  borderColor: SUB_STEPS[subStep].guideColor,
                  top: '8%',
                  bottom: '12%',
                  left: '18%',
                  right: '18%',
                  borderRadius: '50%',
                }}
              >
                <span className="text-xs opacity-60" style={{ color: SUB_STEPS[subStep].guideColor }}>{SUB_STEPS[subStep].guideText}</span>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {faceError && <p className="text-sm text-red-600">{faceError}</p>}

          <div className="flex justify-center">
            <button
              type="button"
              disabled={processing}
              className="rounded-full px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: SUB_STEPS[subStep].guideColor }}
              onClick={handleCapture}
            >
              {processing ? 'Procesando...' : subStep === 2 ? 'Capturar selfie' : 'Capturar foto'}
            </button>
          </div>
        </div>
      )}

      {/* ===== RESULT VIEW (sub-step 3) ===== */}
      {subStep === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-6">
            {ctx.docCedulaFrontal && <img src={ctx.docCedulaFrontal} alt="Cédula" className="h-20 w-20 rounded-lg object-cover" />}
            <span className="text-2xl" style={{ color: ctx.biometriaAprobada ? '#22c55e' : '#ef4444' }}>↔</span>
            {ctx.selfieBase64 && <img src={ctx.selfieBase64} alt="Selfie" className="h-20 w-20 rounded-full object-cover" />}
          </div>

          <div className={['rounded-xl border p-4 text-sm', ctx.biometriaAprobada ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'].join(' ')}>
            <p className="font-semibold" style={{ color: ctx.biometriaAprobada ? '#166534' : '#991b1b' }}>
              {ctx.biometriaAprobada ? '✓ Identidad verificada' : '✗ Identidad no verificada'}
            </p>
            <p className="mt-1" style={{ color: ctx.biometriaAprobada ? '#15803d' : '#dc2626' }}>
              Nivel de coincidencia: {nivelSimilitud}
            </p>
            {!ctx.biometriaAprobada && selfieAttempts >= MAX_SELFIE_RETRIES && (
              <p className="mt-2 text-xs text-slate-500">Se agotaron los {MAX_SELFIE_RETRIES} intentos de selfie. Puede volver a capturar la cédula o enviar con observación para revisión manual.</p>
            )}
            {!ctx.biometriaAprobada && selfieAttempts < MAX_SELFIE_RETRIES && (
              <p className="mt-2 text-xs text-slate-500">Puede reintentar la captura o enviar con observación para revisión manual.</p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" className="rounded-lg border border-slate-200 px-4 py-2 text-sm" onClick={handleRetryAll}>
              {!ctx.biometriaAprobada ? 'Volver a capturar cédula y selfie' : 'Reintentar captura'}
            </button>
            <button
              type="button"
              disabled={submitting}
              className="rounded-lg px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: 'var(--sfici-primary)' }}
              onClick={handleSubmit}
            >
              {submitting ? 'Enviando solicitud...' : ctx.biometriaAprobada ? 'Enviar solicitud' : 'Enviar con observación'}
            </button>
          </div>

          {ctx.error && <p className="text-sm text-red-600">Error al enviar: {ctx.error.message || 'Intente nuevamente.'}</p>}
        </div>
      )}

      <div className="flex justify-between">
        <button type="button" className="rounded-lg border border-slate-200 px-5 py-2 text-sm" onClick={() => { stopCamera(); setPreview(null); setStep(6) }}>Anterior</button>
        {subStep < 3 && <div />}
      </div>
    </div>
  )
}
