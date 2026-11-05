'use client'
import { Environment, Lightformer } from '@react-three/drei'
import { useStageTheme } from '../theme'

export function StageLights() {
  const c = useStageTheme()
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} color="#ffffff" />
      <pointLight position={[-5, -2, 3]} intensity={30} color={c.accent} distance={14} />
      <pointLight position={[5, -1, 2]} intensity={18} color={c.accent2} distance={12} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 4]} scale={[10, 2, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={2.4} position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color={c.accent} />
        <Lightformer form="rect" intensity={2} position={[6, 0, 2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} color={c.accent2} />
        <Lightformer form="ring" intensity={1.5} position={[0, -3, 5]} scale={3} color={c.warm} />
      </Environment>
    </>
  )
}
