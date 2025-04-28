"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid, Environment } from "@react-three/drei"
import { LeftSidebar } from "./left-sidebar"
import { RightSidebar } from "./right-sidebar"
import { TopToolbar } from "./top-toolbar"
import { FloatingToolbar } from "./floating-toolbar"
import { SceneObject } from "./scene-object"
import { useElementStore, type Element, ElementType } from "@/lib/element-store"
import { ElementPositionTracker } from "./element-position-tracker"
import * as THREE from "three"

// 定义历史记录接口
interface HistoryState {
  elements: Element[]
  selectedElementId: string | null
}

export default function EditorInterface() {
  const { elements, selectedElement, setSelectedElement, loadElements, addElement } = useElementStore()
  const [viewMode, setViewMode] = useState<"3D" | "2D">("3D")
  const [activeMode, setActiveMode] = useState<string>("select")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)
  const [elementPosition, setElementPosition] = useState<{ x: number; y: number } | null>(null)
  const [key, setKey] = useState(0) // 用于强制重新渲染Canvas

  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false)
  const [draggedElementType, setDraggedElementType] = useState<ElementType | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  // 历史记录状态
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isUndoRedo, setIsUndoRedo] = useState(false)

  // 使用ref来跟踪上一次的状态，避免无限循环
  const prevElementsRef = useRef<Element[]>([])
  const prevSelectedIdRef = useRef<string | null>(null)

  // 初始化历史记录 - 只在组件挂载时执行一次
  useEffect(() => {
    if (elements.length > 0 && historyIndex === -1) {
      const initialState: HistoryState = {
        elements: JSON.parse(JSON.stringify(elements)),
        selectedElementId: selectedElement?.id || null,
      }
      setHistory([initialState])
      setHistoryIndex(0)

      // 初始化引用值
      prevElementsRef.current = JSON.parse(JSON.stringify(elements))
      prevSelectedIdRef.current = selectedElement?.id || null
    }
  }, []) // 空依赖数组，只在挂载时执行

  // 监听元素变化，更新历史记录 - 使用深度比较避免无限循环
  useEffect(() => {
    // 如果是撤销/重做操作，不记录历史
    if (isUndoRedo) {
      setIsUndoRedo(false)
      return
    }

    // 创建当前状态的快照
    const currentElements = JSON.stringify(elements)
    const currentSelectedId = selectedElement?.id || null

    // 检查是否与上一次状态相同
    const prevElements = JSON.stringify(prevElementsRef.current)
    const prevSelectedId = prevSelectedIdRef.current

    // 只有当状态真正变化时才更新历史记录
    if (currentElements !== prevElements || currentSelectedId !== prevSelectedId) {
      // 更新引用值
      prevElementsRef.current = JSON.parse(JSON.stringify(elements))
      prevSelectedIdRef.current = currentSelectedId

      // 如果历史记录已初始化
      if (historyIndex >= 0) {
        const currentState: HistoryState = {
          elements: JSON.parse(JSON.stringify(elements)),
          selectedElementId: currentSelectedId,
        }

        // 如果在历史记录中间进行了操作，则删除后面的历史记录
        const newHistory = history.slice(0, historyIndex + 1)
        setHistory([...newHistory, currentState])
        setHistoryIndex(historyIndex + 1)
      }
    }
  }, [elements, selectedElement, historyIndex]) // 移除history依赖

  // 撤销操作
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setIsUndoRedo(true)
      const prevState = history[historyIndex - 1]

      // 应用历史状态
      loadElements(prevState.elements)

      // 恢复选中状态
      if (prevState.selectedElementId) {
        const selectedElement = prevState.elements.find((el) => el.id === prevState.selectedElementId)
        if (selectedElement) {
          setSelectedElement(selectedElement)
        }
      } else {
        setSelectedElement(null)
      }

      setHistoryIndex(historyIndex - 1)
    }
  }, [history, historyIndex, loadElements, setSelectedElement])

  // 重做操作
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setIsUndoRedo(true)
      const nextState = history[historyIndex + 1]

      // 应用历史状态
      loadElements(nextState.elements)

      // 恢复选中状态
      if (nextState.selectedElementId) {
        const selectedElement = nextState.elements.find((el) => el.id === nextState.selectedElementId)
        if (selectedElement) {
          setSelectedElement(selectedElement)
        }
      } else {
        setSelectedElement(null)
      }

      setHistoryIndex(historyIndex + 1)
    }
  }, [history, historyIndex, loadElements, setSelectedElement])

  // 处理键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果正在编辑文本，不处理快捷键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // 撤销: Ctrl+Z
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault()
        handleUndo()
      }

      // 重做: Ctrl+Y
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault()
        handleRedo()
      }

      // 删除: Delete
      if (e.key === "Delete" && selectedElement) {
        e.preventDefault()
        useElementStore.getState().removeElement(selectedElement.id)
      }

      // 复制: Ctrl+C
      if (e.ctrlKey && e.key === "c" && selectedElement) {
        e.preventDefault()
        localStorage.setItem("copiedElement", JSON.stringify(selectedElement))
      }

      // 粘贴: Ctrl+V
      if (e.ctrlKey && e.key === "v") {
        e.preventDefault()
        const copiedElement = localStorage.getItem("copiedElement")
        if (copiedElement) {
          const element = JSON.parse(copiedElement)
          useElementStore.getState().addElement({
            ...element,
            position: {
              x: element.position.x + 1,
              y: element.position.y,
              z: element.position.z + 1,
            },
          })
        }
      }

      // 保存: Ctrl+S
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault()
        // 触发保存操作
        const saveButton = document.querySelector("button.bg-blue-500.text-white") as HTMLButtonElement
        if (saveButton) {
          saveButton.click()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedElement, handleUndo, handleRedo])

  // 处理视图模式变更
  const handleViewModeChange = useCallback((mode: "3D" | "2D") => {
    setViewMode(mode)
    // 强制重新渲染Canvas以确保视图模式切换生效
    setKey((prev) => prev + 1)
  }, [])

  // 监听元素变化，确保新添加的元素被渲染
  useEffect(() => {
    // 当elements数组长度变化时，强制重新渲染Canvas
    setKey((prev) => prev + 1)
  }, [elements.length])

  // 开始拖拽
  const handleStartDrag = useCallback((elementType: ElementType) => {
    console.log("开始拖拽元素:", elementType)
    setIsDragging(true)
    setDraggedElementType(elementType)
  }, [])

  // 处理拖拽结束
  const handleDrop = useCallback(
      (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()

        if (!isDragging || !draggedElementType || !canvasContainerRef.current) {
          return
        }

        console.log("处理拖拽放置:", draggedElementType)

        // 获取Canvas容器的位置和尺寸
        const rect = canvasContainerRef.current.getBoundingClientRect()

        // 计算鼠标在Canvas中的相对位置
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        // 创建一个射线
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(
            new THREE.Vector2(x, y),
            new THREE.PerspectiveCamera(50, rect.width / rect.height, 0.1, 1000),
        )

        // 创建一个平面，用于计算射线与平面的交点
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
        const target = new THREE.Vector3()
        raycaster.ray.intersectPlane(plane, target)

        // 添加元素到场景
        addElement({
          type: draggedElementType,
          position: { x: target.x, y: 0, z: target.z },
          rotation: { x: 0, y: 0, z: 0 },
          scale: 1,
          material: "standard",
          color: getDefaultColor(draggedElementType),
          name: getElementName(draggedElementType),
          displayTip: false,
        })

        // 重置拖拽状态
        setIsDragging(false)
        setDraggedElementType(null)
      },
      [isDragging, draggedElementType, addElement],
  )

  // 处理拖拽移动
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    // 允许放置
    event.dataTransfer.dropEffect = "copy"
  }, [])

  // 获取元素默认颜色
  const getDefaultColor = useCallback((type: ElementType): string => {
    switch (type) {
      case ElementType.TRANSFORMER:
        return "#4080ff"
      case ElementType.GENERATOR:
        return "#ff8040"
      case ElementType.SOLAR_PANEL:
        return "#40c0ff"
      case ElementType.BATTERY:
        return "#40ff80"
      case ElementType.POWER_LINE:
        return "#c0c0c0"
      case ElementType.SWITCH:
        return "#ff4040"
      case ElementType.CIRCUIT_BREAKER:
        return "#ff8080"
      case ElementType.SUBSTATION:
        return "#8080ff"
      default:
        return "#4080ff"
    }
  }, [])

  // 获取元素名称
  const getElementName = useCallback((type: ElementType): string => {
    switch (type) {
      case ElementType.CUBE:
        return "立方体"
      case ElementType.PRISM:
        return "棱柱"
      case ElementType.CYLINDER:
        return "圆柱"
      case ElementType.TEXT:
        return "文本"
      case ElementType.PLANE:
        return "平面"
      case ElementType.LINE:
        return "线条"
      case ElementType.API:
        return "API"
      case ElementType.BROWSER:
        return "浏览器"
      case ElementType.CACHE:
        return "缓存"
      case ElementType.CALCULATOR:
        return "计算器"
      case ElementType.CODE:
        return "代码"
      case ElementType.CRON_JOB:
        return "定时任务"
      case ElementType.DATA_ANALYSIS:
        return "数据分析"
      case ElementType.DOWNLOAD:
        return "下载"
      case ElementType.EMAIL:
        return "邮件"
      case ElementType.TRANSFORMER:
        return "变压器"
      case ElementType.GENERATOR:
        return "发电机"
      case ElementType.SOLAR_PANEL:
        return "太阳能板"
      case ElementType.BATTERY:
        return "电池"
      case ElementType.POWER_LINE:
        return "电力线"
      case ElementType.SWITCH:
        return "开关"
      case ElementType.CIRCUIT_BREAKER:
        return "断路器"
      case ElementType.SUBSTATION:
        return "变电站"
      default:
        return "元素"
    }
  }, [])

  // 处理点击添加元素
  const handleAddElement = useCallback(
      (elementType: ElementType) => {
        console.log("点击添加元素:", elementType)

        // 添加元素到场景中心
        addElement({
          type: elementType,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: 1,
          material: "standard",
          color: getDefaultColor(elementType),
          name: getElementName(elementType),
          displayTip: false,
        })
      },
      [addElement, getDefaultColor, getElementName],
  )

  // 使用useCallback包装位置更新处理函数，确保引用稳定
  const handlePositionUpdate = useCallback((pos: { x: number; y: number } | null) => {
    setElementPosition(pos)
  }, [])

  return (
      <div className="flex flex-col h-full bg-[#f0f4ff] relative">
        <TopToolbar viewMode={viewMode} setViewMode={handleViewModeChange} onUndo={handleUndo} onRedo={handleRedo} />

        {/* 主内容区域 */}
        <div className="flex-1 relative">
          {/* 左侧边栏 - 固定位置 */}
          <div className="fixed left-0 top-14 bottom-0 z-10">
            <LeftSidebar onStartDrag={handleStartDrag} onAddElement={handleAddElement} />
          </div>

          {/* 画布区域，带有侧边栏的边距 */}
          <div
              ref={canvasContainerRef}
              className="ml-64 mr-64 h-[calc(100vh-56px)]"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
          >
            <Canvas
                key={key} // 使用key强制重新渲染Canvas
                ref={canvasRef}
                camera={{ position: viewMode === "3D" ? [5, 5, 5] : [0, 5, 0], fov: 50 }}
                shadows
                className="w-full h-full"
            >
              <ambientLight intensity={0.5} />
              <directionalLight
                  position={[10, 10, 10]}
                  intensity={1}
                  castShadow
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
              />

              {/* 根据视图模式变化的网格 */}
              {viewMode === "3D" ? (
                  <Grid
                      args={[100, 100]}
                      cellSize={1}
                      cellThickness={0.5}
                      cellColor="#a0a0ff"
                      sectionSize={5}
                      sectionThickness={1}
                      sectionColor="#2080ff"
                      fadeDistance={50}
                      fadeStrength={1.5}
                      followCamera={false}
                      infiniteGrid
                  />
              ) : (
                  <Grid
                      args={[100, 100]}
                      cellSize={1}
                      cellThickness={0.5}
                      cellColor="#a0a0ff"
                      sectionSize={5}
                      sectionThickness={1}
                      sectionColor="#2080ff"
                      rotation={[-Math.PI / 2, 0, 0]}
                      position={[0, -0.01, 0]}
                      infiniteGrid
                  />
              )}

              {/* 渲染所有场景对象 */}
              {elements.map((element) => (
                  <SceneObject
                      key={element.id}
                      element={element}
                      isSelected={selectedElement?.id === element.id}
                      onClick={() => setSelectedElement(element)}
                      viewMode={viewMode}
                      activeMode={activeMode}
                  />
              ))}

              {/* 渲染连接线 */}
              {elements.map((element) => {
                if (element.connections && element.connections.length > 0) {
                  return element.connections.map((targetId) => {
                    const targetElement = elements.find((el) => el.id === targetId)
                    if (targetElement) {
                      return (
                          <line key={`${element.id}-${targetId}`}>
                            <bufferGeometry
                                attach="geometry"
                                onUpdate={(self) => {
                                  const positions = new Float32Array([
                                    element.position.x,
                                    element.position.y + 0.5,
                                    element.position.z,
                                    targetElement.position.x,
                                    targetElement.position.y + 0.5,
                                    targetElement.position.z,
                                  ])
                                  self.setAttribute("position", new THREE.BufferAttribute(positions, 3))
                                }}
                            />
                            <lineBasicMaterial attach="material" color="#ff0000" linewidth={2} />
                          </line>
                      )
                    }
                    return null
                  })
                }
                return null
              })}

              {/* 根据视图模式变化的控制器 */}
              {viewMode === "3D" ? (
                  <OrbitControls makeDefault enabled={!selectedElement || activeMode !== "select"} />
              ) : (
                  <OrbitControls
                      makeDefault
                      enabled={!selectedElement || activeMode !== "select"}
                      enableRotate={false}
                      minPolarAngle={Math.PI / 2}
                      maxPolarAngle={Math.PI / 2}
                  />
              )}

              <Environment preset="studio" />

              {/* 元素位置跟踪器 - 优化位置计算 */}
              <ElementPositionTracker onPositionUpdate={handlePositionUpdate} />
            </Canvas>

            {/* 拖拽提示 - 当正在拖拽时显示 */}
            {isDragging && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center pointer-events-none">
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <p className="text-lg font-medium">放置元素到此处</p>
                  </div>
                </div>
            )}

            {/* 浮动工具栏 - 只在选中元素时显示 */}
            <FloatingToolbar activeMode={activeMode} setActiveMode={setActiveMode} position={elementPosition} />

            {/* 底部视图模式切换 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-md">
              <div className="flex items-center p-1">
                <button
                    className={`px-4 py-1 rounded-full ${viewMode === "3D" ? "bg-blue-500 text-white" : "text-gray-700"}`}
                    onClick={() => handleViewModeChange("3D")}
                >
                  3D
                </button>
                <button
                    className={`px-4 py-1 rounded-full ${viewMode === "2D" ? "bg-blue-500 text-white" : "text-gray-700"}`}
                    onClick={() => handleViewModeChange("2D")}
                >
                  2D
                </button>
              </div>
            </div>
          </div>

          {/* 右侧边栏 - 固定位置 */}
          <div className="fixed right-0 top-14 bottom-0 z-10">
            <RightSidebar collapsed={rightSidebarCollapsed} setCollapsed={setRightSidebarCollapsed} />
          </div>
        </div>
      </div>
  )
}
