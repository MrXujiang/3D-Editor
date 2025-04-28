"use client"

import { useThree } from "@react-three/fiber"
import { useRef, useState } from "react"
import * as THREE from "three"
import { useElementStore } from "@/lib/element-store"

export function CustomDragControls() {
  const { camera, raycaster, mouse, scene } = useThree()
  const { selectedElement, updateElement } = useElementStore()
  const [isDragging, setIsDragging] = useState(false)
  const draggedObject = useRef<THREE.Object3D | null>(null)
  const dragStartPosition = useRef<THREE.Vector3 | null>(null)
  const dragPlane = useRef<THREE.Plane | null>(null)

  // Set up event handlers for the canvas
  useThree(({ gl }) => {
    const canvas = gl.domElement

    const onMouseDown = (event: MouseEvent) => {
      if (!selectedElement) return

      // Find the selected object in the scene
      const objects = scene.children.filter((obj) => obj.userData.elementId === selectedElement.id)

      if (objects.length > 0) {
        const object = objects[0]

        // Create a drag plane perpendicular to the camera
        const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion)
        dragPlane.current = new THREE.Plane(normal, -object.position.dot(normal))

        // Store the object and its starting position
        draggedObject.current = object
        dragStartPosition.current = object.position.clone()
        setIsDragging(true)
      }
    }

    const onMouseMove = (event: MouseEvent) => {
      if (isDragging && draggedObject.current && dragPlane.current) {
        // Calculate intersection with the drag plane
        raycaster.setFromCamera(mouse, camera)
        const intersection = new THREE.Vector3()
        raycaster.ray.intersectPlane(dragPlane.current, intersection)

        // Move the object
        draggedObject.current.position.copy(intersection)

        // Update the element position in the store
        if (selectedElement) {
          updateElement(selectedElement.id, {
            position: {
              x: intersection.x,
              y: intersection.y,
              z: intersection.z,
            },
          })
        }
      }
    }

    const onMouseUp = () => {
      setIsDragging(false)
      draggedObject.current = null
      dragStartPosition.current = null
      dragPlane.current = null
    }

    canvas.addEventListener("mousedown", onMouseDown)
    canvas.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("mouseup", onMouseUp)

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown)
      canvas.removeEventListener("mousemove", onMouseMove)
      canvas.removeEventListener("mouseup", onMouseUp)
    }
  })

  return null
}
