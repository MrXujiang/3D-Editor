"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Search, ChevronDown } from "lucide-react"
import { ElementCategory, ElementType } from "@/lib/element-store"
import { ElementIcon } from "./element-icon"

interface LeftSidebarProps {
  onStartDrag?: (type: ElementType) => void
  onAddElement?: (type: ElementType) => void
}

export function LeftSidebar({ onStartDrag, onAddElement }: LeftSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<ElementCategory, boolean>>({
    [ElementCategory.BASIC]: true,
    [ElementCategory.GENERAL]: true,
    [ElementCategory.INDUSTRIAL]: true,
  })

  const [searchQuery, setSearchQuery] = useState("")

  const toggleCategory = useCallback((category: ElementCategory) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }, [])

  const basicElements = [
    { type: ElementType.CUBE, name: "立方体", icon: "cube" },
    { type: ElementType.PRISM, name: "棱柱", icon: "prism" },
    { type: ElementType.CYLINDER, name: "圆柱", icon: "cylinder" },
    { type: ElementType.TEXT, name: "文本", icon: "text" },
    { type: ElementType.PLANE, name: "平面", icon: "plane" },
    { type: ElementType.LINE, name: "线条", icon: "line" },
  ]

  const generalElements = [
    { type: ElementType.API, name: "API", icon: "api" },
    { type: ElementType.BROWSER, name: "浏览器", icon: "browser" },
    { type: ElementType.CACHE, name: "缓存", icon: "cache" },
    { type: ElementType.CALCULATOR, name: "计算器", icon: "calculator" },
    { type: ElementType.CODE, name: "代码", icon: "code" },
    { type: ElementType.CRON_JOB, name: "定时任务", icon: "cron-job" },
    { type: ElementType.DATA_ANALYSIS, name: "数据分析", icon: "data-analysis" },
    { type: ElementType.DOWNLOAD, name: "下载", icon: "download" },
    { type: ElementType.EMAIL, name: "邮件", icon: "email" },
  ]

  const industrialElements = [
    { type: ElementType.TRANSFORMER, name: "变压器", icon: "transformer" },
    { type: ElementType.GENERATOR, name: "发电机", icon: "generator" },
    { type: ElementType.SOLAR_PANEL, name: "太阳能板", icon: "solar-panel" },
    { type: ElementType.BATTERY, name: "电池", icon: "battery" },
    { type: ElementType.POWER_LINE, name: "电力线", icon: "power-line" },
    { type: ElementType.SWITCH, name: "开关", icon: "switch" },
    { type: ElementType.CIRCUIT_BREAKER, name: "断路器", icon: "circuit-breaker" },
    { type: ElementType.SUBSTATION, name: "变电站", icon: "substation" },
  ]

  const filteredBasicElements = searchQuery
      ? basicElements.filter((el) => el.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : basicElements

  const filteredGeneralElements = searchQuery
      ? generalElements.filter((el) => el.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : generalElements

  const filteredIndustrialElements = searchQuery
      ? industrialElements.filter((el) => el.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : industrialElements

  // 处理元素拖拽开始
  const handleDragStart = useCallback(
      (event: React.DragEvent<HTMLDivElement>, elementType: ElementType) => {
        console.log("拖拽开始:", elementType)

        // 设置拖拽数据
        event.dataTransfer.setData("application/element-type", elementType)
        event.dataTransfer.effectAllowed = "copy"

        // 通知父组件拖拽开始
        if (onStartDrag) {
          onStartDrag(elementType)
        }
      },
      [onStartDrag],
  )

  // 处理元素点击
  const handleElementClick = useCallback(
      (elementType: ElementType) => {
        console.log("元素点击:", elementType)
        if (onAddElement) {
          onAddElement(elementType)
        }
      },
      [onAddElement],
  )

  // 渲染元素项
  const renderElementItem = useCallback(
      (element: { type: ElementType; name: string; icon: string }) => (
          <div
              key={element.type}
              className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
              draggable
              onDragStart={(e) => handleDragStart(e, element.type)}
              onClick={() => handleElementClick(element.type)}
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <ElementIcon type={element.type} />
            </div>
            <span className="text-xs mt-1 text-center">{element.name}</span>
          </div>
      ),
      [handleDragStart, handleElementClick],
  )

  return (
      <div className="w-64 bg-white shadow-md flex flex-col h-full">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.033z" />
            </svg>
          </span>
            i3D Editor
          </h1>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <input
                type="text"
                placeholder="搜索"
                className="w-full pl-8 pr-4 py-2 border rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* 基础类别 */}
          <div className="border-b">
            <button
                className="w-full p-4 text-left font-medium flex justify-between items-center"
                onClick={() => toggleCategory(ElementCategory.BASIC)}
            >
              基础
              <ChevronDown
                  className={`h-5 w-5 transition-transform ${expandedCategories[ElementCategory.BASIC] ? "rotate-180" : ""}`}
              />
            </button>

            {expandedCategories[ElementCategory.BASIC] && (
                <div className="grid grid-cols-3 gap-4 p-4">
                  {filteredBasicElements.map((element) => renderElementItem(element))}
                </div>
            )}
          </div>

          {/* 通用类别 */}
          <div className="border-b">
            <button
                className="w-full p-4 text-left font-medium flex justify-between items-center"
                onClick={() => toggleCategory(ElementCategory.GENERAL)}
            >
              通用
              <ChevronDown
                  className={`h-5 w-5 transition-transform ${expandedCategories[ElementCategory.GENERAL] ? "rotate-180" : ""}`}
              />
            </button>

            {expandedCategories[ElementCategory.GENERAL] && (
                <div className="grid grid-cols-3 gap-4 p-4">
                  {filteredGeneralElements.map((element) => renderElementItem(element))}
                </div>
            )}
          </div>

          {/* 工业类别 */}
          <div className="border-b">
            <button
                className="w-full p-4 text-left font-medium flex justify-between items-center"
                onClick={() => toggleCategory(ElementCategory.INDUSTRIAL)}
            >
              工业
              <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                      expandedCategories[ElementCategory.INDUSTRIAL] ? "rotate-180" : ""
                  }`}
              />
            </button>

            {expandedCategories[ElementCategory.INDUSTRIAL] && (
                <div className="grid grid-cols-3 gap-4 p-4">
                  {filteredIndustrialElements.map((element) => renderElementItem(element))}
                </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t">
          <div className="text-xs text-gray-500 text-center">
            <p>拖拽组件到画布或点击添加</p>
            <p>按住Shift键可以多选</p>
          </div>
        </div>
      </div>
  )
}
