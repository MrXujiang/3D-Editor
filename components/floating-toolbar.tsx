"use client"

import { MousePointer, LineChart, Pencil, Layers, Trash, Copy, Move, RotateCw } from "lucide-react"
import { useElementStore } from "@/lib/element-store"
import { useState, useEffect, useRef, useCallback } from "react"

interface FloatingToolbarProps {
  activeMode: string
  setActiveMode: (mode: string) => void
  position?: { x: number; y: number } | null // 接收位置作为prop
}

export function FloatingToolbar({ activeMode, setActiveMode, position }: FloatingToolbarProps) {
  const { selectedElement, removeElement, updateElement, duplicateElement } = useElementStore()
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false)
  const selectedElementRef = useRef(selectedElement)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef<{ x: number; y: number } | null>(null)
  const prevPositionRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    selectedElementRef.current = selectedElement
  }, [selectedElement])

  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 })

  // 当选中元素或位置变化时更新工具栏
  useEffect(() => {
    // 只有当位置真正变化时才更新状态
    if (
        position &&
        (!prevPositionRef.current ||
            Math.abs(prevPositionRef.current.x - position.x) > 1 ||
            Math.abs(prevPositionRef.current.y - position.y) > 1)
    ) {
      prevPositionRef.current = position
      positionRef.current = position
      setShowToolbar(!!selectedElement)

      if (selectedElement) {
        // 计算工具栏位置，确保在视口内
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        // 获取工具栏尺寸
        const toolbarWidth = toolbarRef.current ? toolbarRef.current.offsetWidth : 40
        const toolbarHeight = toolbarRef.current ? toolbarRef.current.offsetHeight : 200

        // 计算位置，确保工具栏完全在视口内
        let x = position.x
        let y = position.y

        // 水平方向调整
        if (x + toolbarWidth / 2 > viewportWidth - 64) {
          // 右侧边栏宽度为64
          x = viewportWidth - 64 - toolbarWidth / 2
        } else if (x - toolbarWidth / 2 < 64) {
          // 左侧边栏宽度为64
          x = 64 + toolbarWidth / 2
        }

        // 垂直方向调整
        if (y + toolbarHeight > viewportHeight) {
          y = viewportHeight - toolbarHeight - 10
        } else if (y < 56) {
          // 顶部工具栏高度为56
          y = 56 + 10
        }

        // 使用函数形式的setState，避免依赖于先前的状态
        setToolbarPosition({ x, y })
      }
    } else if (!position && positionRef.current !== null) {
      positionRef.current = null
      prevPositionRef.current = null
      setShowToolbar(false)
    }
  }, [selectedElement, position]) // 只依赖这些必要的属性

  // 处理工具按钮点击
  const handleToolClick = useCallback(
      (mode: string) => {
        setActiveMode(mode)
      },
      [setActiveMode],
  )

  // 处理删除元素
  const handleDeleteElement = useCallback(() => {
    if (selectedElementRef.current) {
      removeElement(selectedElementRef.current.id)
    }
  }, [removeElement])

  // 处理复制元素
  const handleDuplicateElement = useCallback(() => {
    if (selectedElementRef.current) {
      duplicateElement(selectedElementRef.current.id)
    }
  }, [duplicateElement])

  // 处理图层操作
  const handleLayerOperation = useCallback(
      (operation: string) => {
        if (selectedElementRef.current) {
          switch (operation) {
            case "moveUp":
              updateElement(selectedElementRef.current.id, {
                position: {
                  ...selectedElementRef.current.position,
                  y: selectedElementRef.current.position.y + 0.5,
                },
              })
              break
            case "moveDown":
              updateElement(selectedElementRef.current.id, {
                position: {
                  ...selectedElementRef.current.position,
                  y: Math.max(0, selectedElementRef.current.position.y - 0.5),
                },
              })
              break
            default:
              break
          }
        }
        setIsLayerMenuOpen(false)
      },
      [updateElement],
  )

  // 处理旋转操作
  const handleRotate = useCallback(
      (axis: string) => {
        if (selectedElementRef.current) {
          const rotation = { ...selectedElementRef.current.rotation }
          switch (axis) {
            case "x":
              rotation.x = (rotation.x + 45) % 360
              break
            case "y":
              rotation.y = (rotation.y + 45) % 360
              break
            case "z":
              rotation.z = (rotation.z + 45) % 360
              break
          }
          updateElement(selectedElementRef.current.id, { rotation })
        }
      },
      [updateElement],
  )

  if (!showToolbar) {
    return null
  }

  // 确定工具栏的布局方向 - 垂直还是水平
  // 这里我们使用水平布局，让工具栏更紧凑
  const isHorizontalLayout = true

  return (
      <div
          ref={toolbarRef}
          className={`absolute bg-white rounded-lg shadow-lg z-20 flex ${isHorizontalLayout ? "flex-row" : "flex-col"} items-center p-2`}
          style={{
            left: `${toolbarPosition.x}px`,
            top: `${toolbarPosition.y}px`,
            transform: "translate(-50%, -120%)", // 调整为-120%，让工具栏更靠近元素
            transition: "left 0.2s ease, top 0.2s ease", // 添加平滑过渡效果
          }}
      >
        <div className={`flex ${isHorizontalLayout ? "flex-row" : "flex-col"} items-center gap-1`}>
          <button
              className={`p-1.5 rounded-full hover:bg-blue-100 ${activeMode === "select" ? "text-blue-500" : ""}`}
              onClick={() => handleToolClick("select")}
              title="选择工具"
          >
            <MousePointer className="h-4 w-4" />
          </button>

          <button
              className={`p-1.5 rounded-full hover:bg-blue-100 ${activeMode === "connect" ? "text-blue-500" : ""}`}
              onClick={() => handleToolClick("connect")}
              title="连接工具"
          >
            <LineChart className="h-4 w-4" />
          </button>

          <button
              className={`p-1.5 rounded-full hover:bg-blue-100 ${activeMode === "edit" ? "text-blue-500" : ""}`}
              onClick={() => handleToolClick("edit")}
              title="编辑工具"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
              className={`p-1.5 rounded-full hover:bg-blue-100 ${activeMode === "move" ? "text-blue-500" : ""}`}
              onClick={() => handleToolClick("move")}
              title="移动工具"
          >
            <Move className="h-4 w-4" />
          </button>

          <button className={`p-1.5 rounded-full hover:bg-blue-100`} onClick={() => handleRotate("y")} title="旋转">
            <RotateCw className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
                className={`p-1.5 rounded-full hover:bg-orange-100 text-orange-500`}
                onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
                title="图层工具"
            >
              <Layers className="h-4 w-4" />
            </button>

            {isLayerMenuOpen && (
                <div
                    className={`absolute ${isHorizontalLayout ? "top-full mt-2" : "left-full ml-2 top-0"} bg-white rounded-md shadow-lg p-2 w-32`}
                >
                  <button
                      className="w-full text-left p-2 hover:bg-gray-100 rounded-md"
                      onClick={() => handleLayerOperation("moveUp")}
                  >
                    上移图层
                  </button>
                  <button
                      className="w-full text-left p-2 hover:bg-gray-100 rounded-md"
                      onClick={() => handleLayerOperation("moveDown")}
                  >
                    下移图层
                  </button>
                </div>
            )}
          </div>

          <button
              className="p-1.5 rounded-full hover:bg-green-100 text-green-500"
              onClick={handleDuplicateElement}
              title="复制元素"
          >
            <Copy className="h-4 w-4" />
          </button>

          <button
              className="p-1.5 rounded-full hover:bg-red-100 text-red-500"
              onClick={handleDeleteElement}
              title="删除元素"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>

        {/* 添加一个小三角形指向元素 */}
        <div
            className="absolute bottom-0 left-1/2 w-3 h-3 bg-white transform rotate-45 translate-y-1/2 -translate-x-1/2"
            style={{ boxShadow: "2px 2px 4px rgba(0,0,0,0.1)" }}
        />
      </div>
  )
}
