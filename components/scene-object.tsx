"use client"

import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import { type Element, ElementType, useElementStore } from "@/lib/element-store"
import * as THREE from "three"

interface SceneObjectProps {
  element: Element
  isSelected: boolean
  onClick: () => void
  viewMode: "3D" | "2D"
  activeMode: string
}

export function SceneObject({ element, isSelected, onClick, viewMode, activeMode }: SceneObjectProps) {
  const ref = useRef<THREE.Mesh>(null)
  const { updateElement } = useElementStore()
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const { camera } = useThree()

  // 自定义拖拽实现
  const handlePointerDown = (e: any) => {
    if ((isSelected && activeMode === "select") || activeMode === "move") {
      e.stopPropagation()
      dragStart.current = { x: e.clientX, y: e.clientY }

      // 添加事件监听器到document以处理移动和抬起事件
      document.addEventListener("pointermove", handlePointerMove)
      document.addEventListener("pointerup", handlePointerUp)
    }
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (isSelected && dragStart.current && ref.current && (activeMode === "select" || activeMode === "move")) {
      // 计算移动增量
      const deltaX = e.clientX - dragStart.current.x
      const deltaY = e.clientY - dragStart.current.y

      // 更新拖拽起始位置
      dragStart.current = { x: e.clientX, y: e.clientY }

      // 根据视图模式应用移动
      if (viewMode === "3D") {
        ref.current.position.x += deltaX / 200
        ref.current.position.z -= deltaY / 200
      } else {
        ref.current.position.x += deltaX / 200
        ref.current.position.z -= deltaY / 200
      }

      // 更新元素在store中的位置
      updateElement(element.id, {
        position: {
          x: ref.current.position.x,
          y: ref.current.position.y,
          z: ref.current.position.z,
        },
      })
    }
  }

  const handlePointerUp = () => {
    dragStart.current = null

    // 移除事件监听器
    document.removeEventListener("pointermove", handlePointerMove)
    document.removeEventListener("pointerup", handlePointerUp)
  }

  // 同步位置和旋转
  useEffect(() => {
    if (ref.current) {
      ref.current.position.set(element.position.x, element.position.y, element.position.z)
      ref.current.rotation.set(
        element.rotation.x * (Math.PI / 180),
        element.rotation.y * (Math.PI / 180),
        element.rotation.z * (Math.PI / 180),
      )
    }
  }, [element.position, element.rotation])

  // 如果未选中，则轻微旋转对象以产生视觉效果
  useFrame((state, delta) => {
    if (ref.current && !isSelected) {
      ref.current.rotation.y += delta * 0.1
    }
  })

  // 根据元素的material属性获取材质
  const getMaterial = () => {
    switch (element.material) {
      case "basic":
        return <meshBasicMaterial color={element.color || "#4080ff"} />
      case "phong":
        return <meshPhongMaterial color={element.color || "#4080ff"} shininess={100} />
      case "physical":
        return <meshPhysicalMaterial color={element.color || "#4080ff"} metalness={0.5} roughness={0.5} />
      case "toon":
        return <meshToonMaterial color={element.color || "#4080ff"} />
      case "normal":
        return <meshNormalMaterial />
      default:
        return <meshStandardMaterial color={element.color || "#4080ff"} />
    }
  }

  // 根据元素类型渲染不同的3D对象
  const renderObject = () => {
    switch (element.type) {
      case ElementType.CUBE:
        return (
          <mesh
            ref={ref}
            position={[element.position.x, element.position.y, element.position.z]}
            rotation={[
              element.rotation.x * (Math.PI / 180),
              element.rotation.y * (Math.PI / 180),
              element.rotation.z * (Math.PI / 180),
            ]}
            scale={[element.scale, element.scale, element.scale]}
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            onPointerDown={handlePointerDown}
          >
            <boxGeometry args={[1, 1, 1]} />
            {getMaterial()}
            {isSelected && (
              <lineSegments>
                <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(1.02, 1.02, 1.02)]} />
                <lineBasicMaterial attach="material" color="#ffffff" linewidth={2} />
              </lineSegments>
            )}
          </mesh>
        )

      case ElementType.PRISM:
        return (
          <mesh
            ref={ref}
            position={[element.position.x, element.position.y, element.position.z]}
            rotation={[
              element.rotation.x * (Math.PI / 180),
              element.rotation.y * (Math.PI / 180),
              element.rotation.z * (Math.PI / 180),
            ]}
            scale={[element.scale, element.scale, element.scale]}
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            onPointerDown={handlePointerDown}
          >
            <cylinderGeometry args={[1, 1, 1, 6, 1]} />
            {getMaterial()}
            {isSelected && (
              <lineSegments>
                <edgesGeometry attach="geometry" args={[new THREE.CylinderGeometry(1.02, 1.02, 1.02, 6, 1)]} />
                <lineBasicMaterial attach="material" color="#ffffff" linewidth={2} />
              </lineSegments>
            )}
          </mesh>
        )

      case ElementType.CYLINDER:
        return (
          <mesh
            ref={ref}
            position={[element.position.x, element.position.y, element.position.z]}
            rotation={[
              element.rotation.x * (Math.PI / 180),
              element.rotation.y * (Math.PI / 180),
              element.rotation.z * (Math.PI / 180),
            ]}
            scale={[element.scale, element.scale, element.scale]}
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            onPointerDown={handlePointerDown}
          >
            <cylinderGeometry args={[1, 1, 1, 32]} />
            {getMaterial()}
            {isSelected && (
              <lineSegments>
                <edgesGeometry attach="geometry" args={[new THREE.CylinderGeometry(1.02, 1.02, 1.02, 32)]} />
                <lineBasicMaterial attach="material" color="#ffffff" linewidth={2} />
              </lineSegments>
            )}
          </mesh>
        )

      case ElementType.TRANSFORMER:
        return (
          <group
            ref={ref}
            position={[element.position.x, element.position.y, element.position.z]}
            rotation={[
              element.rotation.x * (Math.PI / 180),
              element.rotation.y * (Math.PI / 180),
              element.rotation.z * (Math.PI / 180),
            ]}
            scale={[element.scale, element.scale, element.scale]}
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            onPointerDown={handlePointerDown}
          >
            <mesh>
              <boxGeometry args={[1, 1.5, 1]} />
              {getMaterial()}
            </mesh>
            <mesh position={[0, 0.9, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
              <meshStandardMaterial color="#ff0000" />
            </mesh>
            {isSelected && (
              <lineSegments>
                <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(1.02, 1.52, 1.02)]} />
                <lineBasicMaterial attach="material" color="#ffffff" linewidth={2} />
              </lineSegments>
            )}
          </group>
        )

      case ElementType.GENERATOR:
        return (
          <group
            ref={ref}
            position={[element.position.x, element.position.y, element.position.z]}
            rotation={[
              element.rotation.x * (Math.PI / 180),
              element.rotation.y * (Math.PI / 180),
              element.rotation.z * (Math.PI / 180),
            ]}
            scale={[element.scale, element.scale, element.scale]}
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            onPointerDown={handlePointerDown}
          >
            <mesh>
              <cylinderGeometry args={[0.8, 0.8, 1.2, 32]} />
              {getMaterial()}
            </mesh>
            <mesh position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 1.5, 16]} />
              <meshStandardMaterial color="#888888" />
            </mesh>
            {isSelected && (
              <lineSegments>
                <edgesGeometry attach="geometry" args={[new THREE.CylinderGeometry(0.82, 0.82, 1.22, 32)]} />
                <lineBasicMaterial attach="material" color="#ffffff" linewidth={2} />
              </lineSegments>
            )}
          </group>
        )

      case ElementType.SOLAR_PANEL:
        return (
          <group
            ref={ref}
            position={[element.position.x, element.position.y, element.position.z]}
            rotation={[
              element.rotation.x * (Math.PI / 180),
              element.rotation.y * (Math.PI / 180),
              element.rotation.z * (Math.PI / 180),
            ]}
            scale={[element.scale, element.scale, element.scale]}
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            onPointerDown={handlePointerDown}
          >
            <mesh rotation={[Math.PI / 6, 0, 0]}>
              <boxGeometry args={[1.5, 0.1, 1.5]} />
              <meshStandardMaterial color="#1a4c7a" />
            </mesh>
            <mesh position={[0, -0.5, 0]}>
              <boxGeometry args={[0.2, 1, 0.2]} />
              <meshStandardMaterial color="#888888" />
            </mesh>
            {isSelected && (
              <lineSegments rotation={[Math.PI / 6, 0, 0]}>
                <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(1.52, 0.12, 1.52)]} />
                <lineBasicMaterial attach="material" color="#ffffff" linewidth={2} />
              </lineSegments>
            )}
          </group>
        )

      case ElementType.BATTERY:
        return (
          <group
            ref={ref}
            position={[element.position.x, element.position.y, element.position.z]}
            rotation={[
              element.rotation.x * (Math.PI / 180),
              element.rotation.y * (Math.PI / 180),
              element.rotation.z * (Math.PI / 180),
            ]}
            scale={[element.scale, element.scale, element.scale]}
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            onPointerDown={handlePointerDown}
          >
            <mesh>
              <boxGeometry args={[1.2, 0.8, 0.8]} />
              {getMaterial()}
            </mesh>
            <mesh position={[0.7, 0.2, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.3, 16]} rotation={[0, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#ff0000" />
            </mesh>
            {isSelected && (
              <lineSegments>
                <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(1.22, 0.82, 0.82)]} />
                <lineBasicMaterial attach="material" color="#ffffff" linewidth={2} />
              </lineSegments>
            )}
          </group>
        )

      case ElementType.TEXT:
        return (
          <group
            position={[element.position.x, element.position.y, element.position.z]}
            rotation={[
              element.rotation.x * (Math.PI / 180),
              element.rotation.y * (Math.PI / 180),
              element.rotation.z * (Math.PI / 180),
            ]}
            scale={[element.scale, element.scale, element.scale]}
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            <Html
              transform
              distanceFactor={10}
              position={[0, 0, 0]}
              style={{
                backgroundColor: "rgba(0,0,0,0.8)",
                padding: "10px 20px",
                borderRadius: "5px",
                color: "white",
                width: "max-content",
                textAlign: "center",
                userSelect: "none",
              }}
            >
              {element.name}
            </Html>
          </group>
        )

      // 添加更多元素类型
      default:
        return (
          <mesh
            ref={ref}
            position={[element.position.x, element.position.y, element.position.z]}
            rotation={[
              element.rotation.x * (Math.PI / 180),
              element.rotation.y * (Math.PI / 180),
              element.rotation.z * (Math.PI / 180),
            ]}
            scale={[element.scale, element.scale, element.scale]}
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            onPointerDown={handlePointerDown}
          >
            <sphereGeometry args={[0.5, 32, 32]} />
            {getMaterial()}
          </mesh>
        )
    }
  }

  return (
    <>
      {renderObject()}
      {element.displayTip && (
        <Html
          position={[element.position.x, element.position.y + (element.tipHeight || 1.6), element.position.z]}
          distanceFactor={10}
          style={{
            backgroundColor: element.tipColor || "rgba(0,0,0,0.8)",
            padding: "5px 10px",
            borderRadius: "3px",
            color: "white",
            width: "max-content",
            textAlign: "center",
            userSelect: "none",
            transform: "translate(-50%, -50%)",
          }}
        >
          {element.name}
        </Html>
      )}
    </>
  )
}
