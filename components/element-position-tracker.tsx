"use client"

import { useThree } from "@react-three/fiber"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import { useElementStore } from "@/lib/element-store"

interface ElementPositionTrackerProps {
  onPositionUpdate: (position: { x: number; y: number } | null) => void
}

export function ElementPositionTracker({ onPositionUpdate }: ElementPositionTrackerProps) {
  const { camera, size } = useThree()
  const { selectedElement } = useElementStore()
  const selectedElementRef = useRef(selectedElement)
  const positionRef = useRef<{ x: number; y: number } | null>(null)
  const frameIdRef = useRef<number | null>(null)
  const onPositionUpdateRef = useRef(onPositionUpdate)

  // 更新引用以避免闭包问题
  useEffect(() => {
    selectedElementRef.current = selectedElement
  }, [selectedElement])

  // 更新回调函数引用
  useEffect(() => {
    onPositionUpdateRef.current = onPositionUpdate
  }, [onPositionUpdate])

  // 计算选中元素的屏幕位置
  useEffect(() => {
    // 创建一个动画帧循环来持续更新位置
    const updatePosition = () => {
      if (selectedElementRef.current) {
        // 获取元素的尺寸信息来调整位置
        const elementScale = selectedElementRef.current.scale || 1

        // 计算元素的位置点 - 这里我们选择元素的顶部中心点
        // 对于不同类型的元素，可能需要不同的偏移量
        let offsetY = 0

        switch (selectedElementRef.current.type) {
          case "cube":
            offsetY = elementScale * 0.5 // 立方体高度的一半
            break
          case "cylinder":
            offsetY = elementScale * 0.5 // 圆柱体高度的一半
            break
          case "prism":
            offsetY = elementScale * 0.5 // 棱柱高度的一半
            break
          case "transformer":
            offsetY = elementScale * 0.75 // 变压器较高，使用0.75
            break
          case "generator":
            offsetY = elementScale * 0.6 // 发电机
            break
          case "solar_panel":
            offsetY = elementScale * 0.1 // 太阳能板较扁平
            break
          default:
            offsetY = elementScale * 0.5 // 默认高度的一半
        }

        // 将3D位置转换为屏幕位置 - 使用元素顶部的位置
        const vector = new THREE.Vector3(
            selectedElementRef.current.position.x,
            selectedElementRef.current.position.y + offsetY, // 使用计算出的偏移量
            selectedElementRef.current.position.z,
        )
        vector.project(camera)

        // 转换为屏幕坐标
        const x = (vector.x * 0.5 + 0.5) * size.width
        const y = (vector.y * -0.5 + 0.5) * size.height

        // 添加很小的垂直偏移，确保工具栏不会直接覆盖元素但又非常接近
        const toolbarOffsetY = 10 // 只偏移10像素

        // 使用ref存储计算出的位置
        const newPosition = {
          x: x,
          y: Math.max(30, y - toolbarOffsetY), // 确保工具栏不会超出屏幕顶部
        }

        // 只有当位置发生显著变化时才更新
        if (
            !positionRef.current ||
            Math.abs(positionRef.current.x - newPosition.x) > 1 ||
            Math.abs(positionRef.current.y - newPosition.y) > 1
        ) {
          positionRef.current = newPosition
          onPositionUpdateRef.current(newPosition)
        }
      } else if (positionRef.current !== null) {
        positionRef.current = null
        onPositionUpdateRef.current(null)
      }

      frameIdRef.current = requestAnimationFrame(updatePosition)
    }

    frameIdRef.current = requestAnimationFrame(updatePosition)

    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current)
        frameIdRef.current = null
      }
    }
  }, [camera, size.width, size.height]) // 移除onPositionUpdate依赖

  // 这个组件不渲染任何内容，只是用于计算位置
  return null
}
