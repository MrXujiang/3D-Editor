"use client"

import { useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import { type Element, ElementType, useElementStore } from "@/lib/element-store"
import * as THREE from "three"

interface SceneObjectProps {
  element: Element
  isSelected: boolean
  onClick: () => void
  viewMode: "3D" | "2D"
}

export function SceneObjectAlternative({ element, isSelected, onClick, viewMode }: SceneObjectProps) {
  const ref = useRef<THREE.Mesh>(null)
  const { updateElement } = useElementStore()
  const { camera, raycaster, mouse, gl } = useThree()
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPosition = useRef<THREE.Vector3 | null>(null)
  const dragPlane = useRef<THREE.Plane | null>(null)

  // Custom drag implementation
  const handlePointerDown = (e: any) => {
    if (isSelected) {
      e.stopPropagation()
      setIsDragging(true)

      // Store the starting position
      if (ref.current) {
        dragStartPosition.current = ref.current.position.clone()

        // Create a drag plane perpendicular to the camera
        const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion)
        dragPlane.current = new THREE.Plane(normal, -ref.current.position.dot(normal))
      }

      // Capture pointer to receive events outside the canvas
      gl.domElement.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerMove = (e: any) => {
    if (isDragging && ref.current && dragPlane.current) {
      e.stopPropagation()

      // Calculate intersection with the drag plane
      raycaster.setFromCamera(mouse, camera)
      const intersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(dragPlane.current, intersection)

      // Move the object
      ref.current.position.copy(intersection)

      // Update the element position in the store
      updateElement(element.id, {
        position: {
          x: intersection.x,
          y: intersection.y,
          z: intersection.z,
        },
      })
    }
  }

  const handlePointerUp = (e: any) => {
    if (isDragging) {
      e.stopPropagation()
      setIsDragging(false)
      dragStartPosition.current = null
      dragPlane.current = null

      // Release pointer capture
      gl.domElement.releasePointerCapture(e.pointerId)
    }
  }

  // Rotate the object slightly over time for visual effect (only if not selected)
  useFrame((state, delta) => {
    if (ref.current && !isSelected) {
      ref.current.rotation.y += delta * 0.1
    }
  })

  // Get the material based on the element's material property
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

  // Render different 3D objects based on element type
  const renderObject = () => {
    const commonProps = {
      ref,
      position: [element.position.x, element.position.y, element.position.z],
      rotation: [
        element.rotation.x * (Math.PI / 180),
        element.rotation.y * (Math.PI / 180),
        element.rotation.z * (Math.PI / 180),
      ],
      scale: [element.scale, element.scale, element.scale],
      onClick: (e: any) => {
        e.stopPropagation()
        onClick()
      },
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      userData: { elementId: element.id },
    }

    switch (element.type) {
      case ElementType.CUBE:
        return (
          <mesh {...commonProps}>
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
          <mesh {...commonProps}>
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
          <mesh {...commonProps}>
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

      case ElementType.TEXT:
        return (
          <group {...commonProps}>
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

      // Add more element types as needed
      default:
        return (
          <mesh {...commonProps}>
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
